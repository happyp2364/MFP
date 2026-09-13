import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { Database, RefreshCw, Download, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const InventoryRecoveryScanner: React.FC = () => {
  const { products: currentProducts, isAdmin } = useStore();
  const [cachedProducts, setCachedProducts] = useState<Product[]>([]);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<string>('');

  const runScan = () => {
    try {
      const raw = localStorage.getItem('mfp_products_catalog_live');
      if (!raw) {
        setCachedProducts([]);
        setCacheError('No cached product data found in localStorage key "mfp_products_catalog_live".');
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCachedProducts(parsed);
          setCacheError(null);
        } else {
          setCachedProducts([]);
          setCacheError('Invalid format found in "mfp_products_catalog_live" (not an array).');
        }
      }
      setScannedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setCachedProducts([]);
      setCacheError(`Failed to parse localStorage cache: ${e?.message || 'Unknown error'}`);
      setScannedAt(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    if (isAdmin) {
      runScan();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-neutral-200">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-neutral-900">Access Denied</h3>
        <p className="text-xs text-neutral-500 mt-1">Authorized Administrator privileges required to access the Inventory Recovery Scanner.</p>
      </div>
    );
  }

  const getTotalStock = (p?: Product): number => {
    if (!p) return 0;
    if (p.sizeStocks && p.sizeStocks.length > 0) {
      return p.sizeStocks.reduce((acc, s) => acc + (typeof s.stockQuantity === 'number' ? s.stockQuantity : 0), 0);
    }
    return p.inStock ? 10 : 0;
  };

  // Compare cached vs current
  const cachedMap = new Map<string, Product>();
  cachedProducts.forEach((p) => {
    if (p && p.id) cachedMap.set(String(p.id), p);
  });

  const allProductIds = Array.from(new Set([...currentProducts.map(p => String(p.id)), ...cachedMap.keys()]));

  const comparisonRows = allProductIds.map((id) => {
    const current = currentProducts.find(p => String(p.id) === id);
    const cached = cachedMap.get(id);

    const currentStock = current ? getTotalStock(current) : 'N/A';
    const cachedStock = cached ? getTotalStock(cached) : 'Not in Cache';

    const currentSizes = current?.sizeStocks ? current.sizeStocks.map(s => `${s.size}:${s.stockQuantity}`).join(', ') : (current?.sizes?.join(', ') || 'Standard');
    const cachedSizes = cached?.sizeStocks ? cached.sizeStocks.map(s => `${s.size}:${s.stockQuantity}`).join(', ') : (cached?.sizes?.join(', ') || 'Not in Cache');

    const isZeroInFirestoreButCachedPositive = (typeof currentStock === 'number' && currentStock === 0) && (typeof cachedStock === 'number' && cachedStock > 0);
    const hasStockDifference = currentStock !== cachedStock;

    let evidence = 'Matching';
    if (!current) evidence = 'Only in Browser Cache';
    else if (!cached) evidence = 'Only in Firestore (New)';
    else if (isZeroInFirestoreButCachedPositive) evidence = 'RECOVERABLE: Firestore stock is 0, Cache has stock!';
    else if (hasStockDifference) evidence = 'Stock Quantity Mismatch';

    return {
      id,
      name: current?.name || cached?.name || 'Unknown Product',
      currentStock,
      cachedStock,
      currentSizes,
      cachedSizes,
      isZeroInFirestoreButCachedPositive,
      hasStockDifference,
      evidence,
      current,
      cached
    };
  });

  const matchingCount = comparisonRows.filter(r => r.currentStock === r.cachedStock && r.current).length;
  const differentCount = comparisonRows.filter(r => r.hasStockDifference && r.current && r.cached).length;
  const recoverableCount = comparisonRows.filter(r => r.isZeroInFirestoreButCachedPositive).length;
  const noEvidenceCount = comparisonRows.filter(r => !r.cached).length;

  const exportReport = () => {
    const reportData = {
      scannedAt: new Date().toISOString(),
      summary: {
        totalScanned: allProductIds.length,
        matchingCount,
        differentCount,
        recoverableCount,
        noEvidenceCount
      },
      rows: comparisonRows.map(r => ({
        id: r.id,
        name: r.name,
        currentStock: r.currentStock,
        cachedStock: r.cachedStock,
        evidence: r.evidence
      }))
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-recovery-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[#0B8F63]" />
            <h2 className="font-serif-heading font-extrabold text-lg text-neutral-900">Inventory Recovery Scanner</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Read-only diagnostic tool inspecting localStorage <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">mfp_products_catalog_live</code> vs current Firestore state. Zero writes performed.
          </p>
          {scannedAt && <p className="text-[10px] text-emerald-600 font-bold mt-1">Last scanned at: {scannedAt}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runScan}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Scan</span>
          </button>
          <button
            onClick={exportReport}
            className="bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export Recovery Report</span>
          </button>
        </div>
      </div>

      {cacheError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{cacheError}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Total Scanned</p>
          <p className="text-xl font-black text-neutral-900 mt-1">{allProductIds.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Matching Stock</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{matchingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Stock Differences</p>
          <p className="text-xl font-black text-amber-600 mt-1">{differentCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-neutral-400">Recoverable Cache</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{recoverableCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
          <p className="text-[10px] uppercase font-bold text-neutral-400">No Cache Evidence</p>
          <p className="text-xl font-black text-neutral-500 mt-1">{noEvidenceCount}</p>
        </div>
      </div>

      {recoverableCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span><strong>Older browser snapshot detected!</strong> {recoverableCount} product(s) have stock in localStorage cache while showing 0 in current Firestore.</span>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-100 font-bold text-xs text-neutral-800">
          Product Inventory State Comparison (Firestore vs Browser Cache)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121816] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Product Name / ID</th>
                <th className="p-3.5">Firestore Stock</th>
                <th className="p-3.5">Browser Cache Stock</th>
                <th className="p-3.5">Firestore Sizes</th>
                <th className="p-3.5">Cache Sizes</th>
                <th className="p-3.5">Recovery Evidence / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {comparisonRows.map((r) => (
                <tr key={r.id} className={`hover:bg-neutral-50 transition-colors ${r.isZeroInFirestoreButCachedPositive ? 'bg-amber-50/60' : ''}`}>
                  <td className="p-3.5">
                    <p className="font-bold text-neutral-900">{r.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400">{r.id}</p>
                  </td>
                  <td className="p-3.5 font-bold">
                    <span className={`px-2 py-1 rounded-lg text-xs ${typeof r.currentStock === 'number' && r.currentStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {r.currentStock}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold">
                    <span className={`px-2 py-1 rounded-lg text-xs ${typeof r.cachedStock === 'number' && r.cachedStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>
                      {r.cachedStock}
                    </span>
                  </td>
                  <td className="p-3.5 text-neutral-600 font-mono text-[11px] max-w-xs truncate" title={r.currentSizes}>
                    {r.currentSizes}
                  </td>
                  <td className="p-3.5 text-neutral-600 font-mono text-[11px] max-w-xs truncate" title={r.cachedSizes}>
                    {r.cachedSizes}
                  </td>
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.isZeroInFirestoreButCachedPositive
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : r.hasStockDifference
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {r.evidence}
                    </span>
                  </td>
                </tr>
              ))}
              {comparisonRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400 text-xs">
                    No products found in current inventory or cache.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
