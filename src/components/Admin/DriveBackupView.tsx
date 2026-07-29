import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  RefreshCw,
  Download,
  Upload,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Link,
  Unlink,
  Trash2,
  Play,
  Settings,
  Calendar,
  ShieldCheck,
  ChevronRight,
  FileJson,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { 
  ensureMarudharBackupFolder, 
  uploadBackupToDrive, 
  downloadBackupFromDrive, 
  deleteDriveFile 
} from '../../lib/googleWorkspace';
import { DriveBackupConfig, BackupHistoryItem } from '../../types';
import { db, auth, googleWorkspaceProvider } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const DriveBackupView: React.FC = () => {
  const store = useStore();
  const [config, setConfig] = useState<DriveBackupConfig>({
    isConnected: false,
    autoBackupEnabled: false,
    dailyEnabled: false,
    weeklyEnabled: false,
    monthlyEnabled: false,
    history: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);

  useEffect(() => {
    loadBackupConfig();
  }, []);

  const loadBackupConfig = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'settings', 'backup');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as DriveBackupConfig);
      }
    } catch (error) {
      console.error('Error loading backup config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: DriveBackupConfig) => {
    try {
      await setDoc(doc(db, 'settings', 'backup'), newConfig);
      setConfig(newConfig);
    } catch (error) {
      store.showToast('Failed to save backup settings', 'error');
    }
  };

  const handleConnect = async () => {
    try {
      // Trigger OAuth setup flow to get the access token with Drive scopes
      const result = await import('firebase/auth').then(({ signInWithPopup }) => 
        signInWithPopup(auth, googleWorkspaceProvider)
      );
      
      const credential = (await import('firebase/auth')).GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        const { setCachedAccessToken } = await import('../../lib/firebase');
        setCachedAccessToken(credential.accessToken);
      } else {
        throw new Error('No access token returned');
      }

      const folderId = await ensureMarudharBackupFolder();
      const newConfig: DriveBackupConfig = {
        ...config,
        isConnected: true,
        driveFolderId: folderId,
        connectedEmail: result.user.email || 'Super Admin Connected'
      };
      await saveConfig(newConfig);
      store.showToast('Google Drive connected successfully', 'success');
    } catch (error: any) {
      console.error('Drive Connection Error:', error);
      store.showToast('Failed to connect Google Drive: ' + error.message, 'error');
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Drive? Auto-backups will stop.')) return;
    const newConfig: DriveBackupConfig = {
      ...config,
      isConnected: false,
      driveFolderId: undefined,
      connectedEmail: undefined
    };
    await saveConfig(newConfig);
    store.showToast('Google Drive disconnected', 'info');
  };

  const generateBackupData = () => {
    // Collect everything from store
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'Marudhar Fashion Point - Admin Panel',
      data: {
        products: store.products,
        reviews: store.reviews,
        orders: store.orders,
        storeInfo: store.storeInfo,
        heroContent: store.heroContent,
        announcements: store.announcements,
        categoryHighlights: store.categoryHighlights,
        trendingCollections: store.trendingCollections,
        paymentSettings: store.paymentSettings,
        topAnnouncementBarConfig: store.topAnnouncementBarConfig,
        socialMediaConfig: store.socialMediaConfig,
        hangingSneakerConfig: store.hangingSneakerConfig,
        petShoeConfig: store.petShoeConfig,
        instagramConfig: store.instagramConfig,
        soundConfig: store.soundConfig,
        luckyBoxConfig: store.luckyBoxConfig,
        spinWheelConfig: store.spinWheelConfig,
        scratchWinConfig: store.scratchWinConfig,
        orderCelebrationConfig: store.orderCelebrationConfig,
        flashDeals: store.flashDeals,
        coupons: store.coupons,
        subscribers: store.subscribers,
        campaigns: store.campaigns
      }
    };
  };

  const handleBackupNow = async () => {
    if (!config.isConnected || !config.driveFolderId) {
      store.showToast('Please connect Google Drive first', 'error');
      return;
    }

    setIsBackingUp(true);
    try {
      const backupData = generateBackupData();
      const fileName = `MFP_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const result = await uploadBackupToDrive(backupData, fileName, config.driveFolderId);
      
      const historyItem: BackupHistoryItem = {
        id: result.id,
        timestamp: new Date().toISOString(),
        fileName: fileName,
        fileId: result.id,
        size: Number(result.size || 0),
        status: 'SUCCESS',
        type: 'MANUAL',
        entitiesIncluded: Object.keys(backupData.data)
      };

      const newConfig = {
        ...config,
        lastBackupAt: historyItem.timestamp,
        history: [historyItem, ...config.history].slice(0, 50) // Keep last 50
      };
      await saveConfig(newConfig);
      store.showToast('Store backup completed successfully', 'success');
    } catch (error) {
      console.error('Backup Error:', error);
      store.showToast('Backup failed: ' + (error as any).message, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreClick = async (fileId: string) => {
    setIsRestoring(true);
    try {
      const data = await downloadBackupFromDrive(fileId);
      setRestorePreview(data);
      setSelectedBackupId(fileId);
      setShowRestoreModal(true);
    } catch (error) {
      store.showToast('Failed to load backup data', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const confirmRestore = async () => {
    if (!restorePreview) return;
    setIsRestoring(true);
    try {
      // Logic to restore data into store/firebase
      // This is a powerful action, we'll use store.restoreStoreBackup if it handles full state
      await store.restoreStoreBackup(restorePreview);
      store.showToast('System restored successfully from backup', 'success');
      setShowRestoreModal(false);
      setRestorePreview(null);
    } catch (error) {
      store.showToast('Restore failed: ' + (error as any).message, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this backup from Google Drive?')) return;
    try {
      await deleteDriveFile(fileId);
      const newConfig = {
        ...config,
        history: config.history.filter(h => h.id !== fileId)
      };
      await saveConfig(newConfig);
      store.showToast('Backup deleted', 'info');
    } catch (error) {
      store.showToast('Failed to delete backup', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif-heading font-extrabold text-neutral-900">
                Google Drive Backup System
              </h2>
              <p className="text-sm text-neutral-500">
                Securely backup your entire store database to your personal Google Drive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {config.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                Disconnect Drive
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="px-6 py-2.5 bg-[#0B8F63] text-white rounded-xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Cloud className="w-5 h-5" />
                Connect Google Drive
              </button>
            )}
          </div>
        </div>

        {config.isConnected && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Connected to Google Drive</p>
                <p className="text-[10px] text-emerald-700 font-mono">{config.connectedEmail}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-emerald-700 font-medium">Backup Folder ID</p>
              <p className="text-[10px] text-emerald-900 font-mono font-bold">{config.driveFolderId}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backup Controls */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" />
              Manual Actions
            </h3>
            <div className="space-y-3">
              <button
                disabled={!config.isConnected || isBackingUp}
                onClick={handleBackupNow}
                className="w-full py-3 bg-[#121816] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-md"
              >
                {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {isBackingUp ? 'Processing Backup...' : 'Backup Now (Full Snapshot)'}
              </button>
              
              <div className="flex gap-2">
                <button
                  className="flex-1 py-3 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all"
                  onClick={() => store.showToast('Coming soon: Direct file upload', 'info')}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  className="flex-1 py-3 bg-white text-neutral-700 border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-all"
                  onClick={() => store.showToast('Select a history item to download', 'info')}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-neutral-900 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" />
              Automated Schedule
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-800">Automatic Backup</p>
                  <p className="text-[10px] text-neutral-500">Enable system-wide auto backups</p>
                </div>
                <button
                  onClick={() => saveConfig({ ...config, autoBackupEnabled: !config.autoBackupEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.autoBackupEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoBackupEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {config.autoBackupEnabled && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-700">Daily Backup (3 AM IST)</p>
                    <input
                      type="checkbox"
                      checked={config.dailyEnabled}
                      onChange={(e) => saveConfig({ ...config, dailyEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-700">Weekly Backup (Sundays)</p>
                    <input
                      type="checkbox"
                      checked={config.weeklyEnabled}
                      onChange={(e) => saveConfig({ ...config, weeklyEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-700">Monthly Backup (1st Day)</p>
                    <input
                      type="checkbox"
                      checked={config.monthlyEnabled}
                      onChange={(e) => saveConfig({ ...config, monthlyEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Critical Note</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  Restoring data will overwrite all current Firestore collections. This action cannot be undone. Please create a fresh backup before attempting a restore.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-neutral-900">Backup History</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Status</p>
                  <p className="text-xs font-bold text-emerald-600">Active</p>
                </div>
                <div className="w-px h-8 bg-neutral-200" />
                <div className="text-right">
                  <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">Last Backup</p>
                  <p className="text-xs font-bold text-neutral-900">
                    {config.lastBackupAt ? new Date(config.lastBackupAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Snapshot Name</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {config.history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300">
                            <Clock className="w-6 h-6" />
                          </div>
                          <p className="text-sm text-neutral-400 font-medium">No backup history found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    config.history.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileJson className="w-8 h-8 text-neutral-400 p-1.5 bg-neutral-100 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors" />
                            <div>
                              <p className="text-xs font-bold text-neutral-900">{item.fileName}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">ID: {item.fileId.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-neutral-700">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                            {(item.size / 1024).toFixed(1)} KB
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.type === 'MANUAL' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleRestoreClick(item.fileId)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(item.fileId)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showRestoreModal && restorePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={() => !isRestoring && setShowRestoreModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-serif-heading font-extrabold text-neutral-900">Restore Preview</h4>
                  <p className="text-xs text-neutral-500">Validation complete. Ready for restoration.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Backup Version</span>
                  <span className="font-bold text-neutral-900">{restorePreview.version}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-neutral-500">Snapshot Time</span>
                  <span className="font-bold text-neutral-900">{new Date(restorePreview.timestamp).toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-neutral-200 grid grid-cols-2 gap-2">
                  <div className="text-[10px]">
                    <p className="text-neutral-500 uppercase tracking-wider font-bold">Products</p>
                    <p className="text-neutral-900 font-extrabold text-base">{restorePreview.data.products?.length || 0}</p>
                  </div>
                  <div className="text-[10px]">
                    <p className="text-neutral-500 uppercase tracking-wider font-bold">Orders</p>
                    <p className="text-neutral-900 font-extrabold text-base">{restorePreview.data.orders?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-900">Final Confirmation</p>
                  <p className="text-[10px] text-rose-800 leading-relaxed">
                    Continuing will replace all existing store data with this backup snapshot. This process is destructive and cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-neutral-50 flex items-center gap-3">
              <button
                disabled={isRestoring}
                onClick={() => setShowRestoreModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-bold hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isRestoring}
                onClick={confirmRestore}
                className="flex-[2] py-2.5 rounded-xl bg-[#0B8F63] text-white text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-[#086F4C] transition-all shadow-md shadow-emerald-600/20"
              >
                {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {isRestoring ? 'Restoring System...' : 'Yes, Restore Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
