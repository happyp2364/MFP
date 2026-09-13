import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Database, RefreshCw, Download, Upload, CheckCircle2, AlertTriangle, 
  ShieldCheck, History, RotateCcw, Lock, ArrowRight, Server, FileText, Trash2, Clock, XCircle 
} from 'lucide-react';
import { 
  InventoryBackupMetadata,
  BackupRestorePreview,
  createDurableInventoryBackup, 
  fetchDurableBackups,
  fetchFullBackupWithProducts,
  createPreRestoreSafetyBackup,
  previewBackupRestore, 
  executeRestoreFromBackup, 
  calculateSHA256Checksum 
} from '../../services/inventoryBackupService';
import { Product } from '../../types';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const GoogleDriveBackupView: React.FC = () => {
  const { products, isAdmin } = useStore();
  const [backups, setBackups] = useState<InventoryBackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentChecksum, setCurrentChecksum] = useState<string>('');
  const [lastAutomaticBackup, setLastAutomaticBackup] = useState<string>('Never');
  const [lastManualBackup, setLastManualBackup] = useState<string>('Never');
  const [lastFailedBackup, setLastFailedBackup] = useState<string>('None');
  const [backupStatus, setBackupStatus] = useState<'Healthy' | 'Warning' | 'Error'>('Healthy');
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedBackupMetadata, setSelectedBackupMetadata] = useState<InventoryBackupMetadata | null>(null);
  const [selectedBackupProducts, setSelectedBackupProducts] = useState<Product[] | null>(null);
  const [restorePreview, setRestorePreview] = useState<BackupRestorePreview | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreResultReport, setRestoreResultReport] = useState<string | null>(null);
  const [safetySnapshots, setSafetySnapshots] = useState<InventoryBackupMetadata[]>([]);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const list = await fetchDurableBackups();
      setBackups(list);

      const successList = list.filter(b => b.status === 'SUCCESS');
      const autoList = successList.filter(b => b.backupType === 'AUTOMATIC');
      const manualList = successList.filter(b => b.backupType === 'MANUAL');
      const failedList = list.filter(b => b.status === 'FAILED');

      if (autoList.length > 0) setLastAutomaticBackup(new Date(autoList[0].createdAt).toLocaleString());
      if (manualList.length > 0) setLastManualBackup(new Date(manualList[0].createdAt).toLocaleString());
      if (failedList.length > 0) setLastFailedBackup(new Date(failedList[0].createdAt).toLocaleString());

      if (successList.length > 0) {
        setBackupStatus('Healthy');
      } else if (failedList.length > 0) {
        setBackupStatus('Warning');
      }

      const safetyList = successList.filter(b => b.backupType === 'PRE_RESTORE_SAFETY');
      setSafetySnapshots(safetyList);
    } catch (e) {
      console.error('Failed to load durable backups:', e);
      setBackupStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadBackups();
      calculateSHA256Checksum(products).then(setCurrentChecksum);
    }
  }, [isAdmin, products]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl shadow-sm border border-neutral-200">
        <Lock className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-neutral-900">Access Restricted</h3>
        <p className="text-xs text-neutral-500 mt-1">Authorized Administrator privileges required to access Inventory Disaster Recovery.</p>
      </div>
    );
  }

  const successCount = backups.filter(b => b.status === 'SUCCESS').length;
  const failedCount = backups.filter(b => b.status === 'FAILED').length;
  const creatingCount = backups.filter(b => b.status === 'CREATING').length;

  const latestSuccessChecksum = backups.find(b => b.status === 'SUCCESS')?.checksum || '';
  const isBackupOutOfDate = successCount === 0 || currentChecksum !== latestSuccessChecksum;

  const handleBackupNow = async () => {
    try {
      setNotification('Creating durable SHA-256 chunked Firestore backup...');
      const newBackup = await createDurableInventoryBackup(products, 'Admin', 'MANUAL');
      await loadBackups();
      setNotification(`Backup successfully created & verified! ID: ${newBackup.backupId} (${newBackup.chunkCount} chunks)`);
    } catch (e: any) {
      setBackupStatus('Error');
      setNotification(`Backup failed: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleSelectBackupForRestore = async (meta: InventoryBackupMetadata) => {
    if (meta.status !== 'SUCCESS') {
      setNotification(`Cannot restore backup ${meta.backupId} because its status is "${meta.status}".`);
      return;
    }
    try {
      setNotification(`Loading & verifying full backup chunks for ${meta.backupId}...`);
      const fullProducts = await fetchFullBackupWithProducts(meta.backupId, meta.chunkCount);
      
      // Verify SHA-256 checksum before allowing restore
      const calculated = await calculateSHA256Checksum(fullProducts);
      if (calculated !== meta.checksum) {
        throw new Error('SHA-256 checksum mismatch! Backup data integrity compromised.');
      }

      setSelectedBackupMetadata(meta);
      setSelectedBackupProducts(fullProducts);
      const preview = previewBackupRestore(products, fullProducts);
      setRestorePreview(preview);
      setNotification(null);
    } catch (e: any) {
      setNotification(`Failed to verify backup integrity: ${e?.message}`);
    }
  };

  const handleImportLocalBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const importedProducts = json.products || json;
        if (!Array.isArray(importedProducts)) {
          throw new Error('Invalid JSON structure. Missing products array.');
        }
        setNotification('Saving imported backup as durable verified Firestore snapshot...');
        await createDurableInventoryBackup(importedProducts, 'Admin (Import)', 'MANUAL');
        await loadBackups();
        setNotification('Local backup successfully imported and verified in durable Firestore storage!');
      } catch (err: any) {
        setNotification(`Failed to import local backup: ${err?.message}`);
      }
    };
    reader.readAsText(file);
  };

  const confirmAndExecuteRestore = async () => {
    if (!selectedBackupMetadata || !selectedBackupProducts) return;
    setIsRestoring(true);
    setNotification(null);

    try {
      // 1. Create durable PRE_RESTORE safety backup first & verify SUCCESS
      const safetyBackup = await createPreRestoreSafetyBackup(products);
      if (safetyBackup.status !== 'SUCCESS') {
        throw new Error('Pre-restore safety backup creation failed verification.');
      }
      await loadBackups();

      // 2. Execute restore
      const result = await executeRestoreFromBackup(selectedBackupProducts);
      setIsRestoring(false);

      if (result.success) {
        setRestoreResultReport(`Successfully restored ${result.restoredCount} products from backup ${selectedBackupMetadata.backupId}. Orders, customers, and payments remain untouched.`);
        setNotification('Database inventory restored successfully!');
        setSelectedBackupMetadata(null);
        setSelectedBackupProducts(null);
        setRestorePreview(null);
        await loadBackups();
      } else {
        setNotification(`Restore failed: ${result.error}`);
      }
    } catch (err: any) {
      setIsRestoring(false);
      setNotification(`Restore error: ${err?.message}`);
    }
  };

  const rollbackToSafety = async (safetyMeta: InventoryBackupMetadata) => {
    setIsRestoring(true);
    try {
      const safetyProducts = await fetchFullBackupWithProducts(safetyMeta.backupId, safetyMeta.chunkCount);
      const result = await executeRestoreFromBackup(safetyProducts);
      setIsRestoring(false);
      if (result.success) {
        setNotification('Successfully rolled back to pre-restore safety snapshot!');
        await loadBackups();
      } else {
        setNotification(`Rollback failed: ${result.error}`);
      }
    } catch (err: any) {
      setIsRestoring(false);
      setNotification(`Rollback error: ${err?.message}`);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!window.confirm(`Are you sure you want to delete backup ${backupId}?`)) return;
    try {
      await deleteDoc(doc(db, 'inventoryBackups', backupId));
      setNotification(`Backup ${backupId} deleted.`);
      await loadBackups();
    } catch (e: any) {
      setNotification(`Failed to delete backup: ${e?.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B8F63] flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-heading font-extrabold text-lg text-neutral-900">
                Inventory Backup & Disaster Recovery
              </h2>
              <p className="text-xs text-neutral-500">
                Firestore durable SHA-256 verified backups, byte-size-aware chunking, and secure rollback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-extrabold text-xs px-4 py-3 rounded-2xl cursor-pointer flex items-center gap-2 transition-all shrink-0">
            <Upload className="w-4 h-4" />
            <span>IMPORT LOCAL BACKUP</span>
            <input type="file" accept=".json" onChange={handleImportLocalBackup} className="hidden" />
          </label>
          <button
            onClick={handleBackupNow}
            className="bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>BACKUP NOW</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {/* Health & Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Backup Health & Counts</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${backupStatus === 'Healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-sm font-extrabold text-neutral-900">{successCount} Success • {failedCount} Failed • {creatingCount} Creating</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Last Auto: {lastAutomaticBackup}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Activity Logs</p>
          <div className="space-y-0.5 mt-1">
            <p className="text-xs font-bold text-neutral-800">Manual: {lastManualBackup}</p>
            <p className="text-[11px] text-rose-600 font-medium">Failed: {lastFailedBackup}</p>
          </div>
          <p className="text-[11px] text-neutral-500">Firestore Durable Collection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
          <p className="text-[10px] uppercase font-bold text-neutral-400">SHA-256 Checksum</p>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-extrabold text-neutral-900 font-mono">
              {currentChecksum ? currentChecksum.substring(0, 16) + '...' : 'Computing...'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Cryptographic integrity verified</p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm space-y-1 ${isBackupOutOfDate ? 'bg-amber-50 border-amber-200' : 'bg-white border-neutral-200'}`}>
          <p className="text-[10px] uppercase font-bold text-neutral-400">Sync Status</p>
          <div className="flex items-center gap-2 mt-1">
            {isBackupOutOfDate ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-sm font-extrabold text-amber-950">BACKUP OUT OF DATE</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-extrabold text-emerald-900">Up to Date</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {isBackupOutOfDate ? 'Inventory changed since last snapshot.' : 'All products verified.'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Versioned Backups List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-neutral-700" />
              <h3 className="font-serif-heading font-bold text-sm text-neutral-900">
                Firestore Versioned Backups ({backups.length})
              </h3>
            </div>
            {isLoading && <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin" />}
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[420px]">
            {backups.map((b) => (
              <div key={b.backupId} className="p-4 hover:bg-neutral-50 transition-colors flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900 font-mono">{b.backupId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded-full">
                      {b.backupType}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {new Date(b.createdAt).toLocaleString()} • {b.productCount} Products • {b.chunkCount} Chunks • SHA-256 Verified
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'SUCCESS' && (
                    <button
                      onClick={async () => {
                        const fullProducts = await fetchFullBackupWithProducts(b.backupId, b.chunkCount);
                        const blob = new Blob([JSON.stringify({ backupId: b.backupId, createdAt: b.createdAt, products: fullProducts }, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${b.backupId}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                      title="Download Backup JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteBackup(b.backupId)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Delete Backup"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {b.status === 'SUCCESS' && (
                    <button
                      onClick={() => handleSelectBackupForRestore(b)}
                      className="bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-all flex items-center gap-1"
                    >
                      <span>Restore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!isLoading && backups.length === 0 && (
              <div className="p-12 text-center text-neutral-400 text-xs">
                No durable backups found in Firestore yet. Click "BACKUP NOW" to create your first verified SHA-256 snapshot.
              </div>
            )}
          </div>
        </div>

        {/* Right: Pre-Restore Safety Snapshots & Rollback */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-serif-heading font-bold text-sm text-neutral-900">
                Pre-Restore Safety Rollback
              </h3>
              <p className="text-[11px] text-neutral-500">
                Automatic safety backups created prior to every restore operation.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[350px]">
            {safetySnapshots.map((sb) => (
              <div key={sb.backupId} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-xs text-amber-950 font-mono">{sb.backupId}</p>
                  <p className="text-[10px] text-neutral-500">{new Date(sb.createdAt).toLocaleString()} • {sb.productCount} items</p>
                </div>
                <button
                  disabled={isRestoring}
                  onClick={() => rollbackToSafety(sb)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow transition-all shrink-0"
                >
                  Rollback
                </button>
              </div>
            ))}

            {safetySnapshots.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-8">
                No pre-restore safety backups recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Automatic Stock Change Version History */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif-heading font-bold text-base text-neutral-900">
              Automatic Per-Stock-Change Version History
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Every successful stock/inventory update creates an immutable, verifiable recovery version.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-xl border border-emerald-200">
              {backups.filter(b => b.backupType === 'AUTOMATIC_STOCK_CHANGE').length} Version Records
            </span>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[400px]">
          {backups.filter(b => b.backupType === 'AUTOMATIC_STOCK_CHANGE').map((b) => {
            const diff = b.stockDifference ?? 0;
            const isPositive = diff > 0;
            return (
              <div key={b.backupId} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">{b.productName || 'Product'}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {b.operationType || 'STOCK_CHANGE'}
                    </span>
                    {b.sku && <span className="text-[10px] font-mono text-neutral-400">SKU: {b.sku}</span>}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    {new Date(b.createdAt).toLocaleString()} • Actor: <span className="font-medium text-neutral-700">{b.createdBy}</span> • SHA-256: <span className="font-mono text-[10px] text-neutral-400">{b.checksum.substring(0, 10)}...</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-xs font-black ${isPositive ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-neutral-600'}`}>
                      {isPositive ? `+${diff}` : diff} stock
                    </span>
                    <p className="text-[10px] text-neutral-400 font-mono">{b.backupId}</p>
                  </div>
                  <button
                    disabled={isRestoring}
                    onClick={() => handleSelectBackupForRestore(b)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Version</span>
                  </button>
                </div>
              </div>
            );
          })}

          {backups.filter(b => b.backupType === 'AUTOMATIC_STOCK_CHANGE').length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No automatic stock change versions recorded yet.</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Stock mutations in product management or checkout will automatically populate this audit trail.</p>
            </div>
          )}
        </div>
      </div>

      {/* Restore Preview Modal */}
      {selectedBackupMetadata && selectedBackupProducts && restorePreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-neutral-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-heading font-bold text-base text-neutral-900">
                  Restore Validation & SHA-256 Impact Preview
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Backup ID: {selectedBackupMetadata.backupId} ({new Date(selectedBackupMetadata.createdAt).toLocaleString()})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBackupMetadata(null);
                  setSelectedBackupProducts(null);
                  setRestorePreview(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 text-lg font-bold px-2.5 py-1 rounded-xl bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Products Affected</p>
                  <p className="text-lg font-black text-neutral-900 mt-1">{restorePreview.productsAffected}</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Stock Increases</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">+{restorePreview.stockIncreases}</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Stock Decreases</p>
                  <p className="text-lg font-black text-rose-600 mt-1">-{restorePreview.stockDecreases}</p>
                </div>
                <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                  <p className="text-[10px] uppercase font-bold text-neutral-400">Absent Products</p>
                  <p className="text-lg font-black text-blue-600 mt-1">{restorePreview.absentCount}</p>
                </div>
              </div>

              {restorePreview.absentCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Absent Products Warning</p>
                    <p className="text-[11px] mt-0.5">
                      {restorePreview.absentCount} products present in your current catalog are absent from this backup. Restoring will NOT automatically delete them.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedBackupMetadata(null);
                  setSelectedBackupProducts(null);
                  setRestorePreview(null);
                }}
                className="px-4 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-200 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isRestoring}
                onClick={confirmAndExecuteRestore}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isRestoring ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <span>CONFIRM & RESTORE DATABASE</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {restoreResultReport && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{restoreResultReport}</span>
        </div>
      )}
    </div>
  );
};
