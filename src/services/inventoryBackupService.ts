import { Product } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch, query, orderBy, limit } from 'firebase/firestore';

export interface InventoryBackupMetadata {
  schemaVersion: string;
  backupId: string;
  createdAt: string;
  createdBy: string;
  productCount: number;
  inventoryRecordCount: number;
  checksum: string;
  status: 'CREATING' | 'SUCCESS' | 'FAILED';
  chunkCount: number;
  source: string;
  backupType: 'AUTOMATIC' | 'MANUAL' | 'PRE_RESTORE_SAFETY';
}

export interface InventoryBackupSchema extends InventoryBackupMetadata {
  products: Product[];
}

export interface BackupRestorePreview {
  productsAffected: number;
  inventoryRecordsAffected: number;
  stockIncreases: number;
  stockDecreases: number;
  productsAdded: number;
  productsRemoved: number;
  productsUnchanged: number;
  absentCount: number;
  details: {
    id: string;
    name: string;
    action: 'added' | 'removed' | 'updated' | 'unchanged';
    stockDiff: number;
  }[];
}

const MAX_CHUNK_BYTES = 500 * 1024; // 500 KB conservative limit (Firestore limit is 1 MiB)

// Real SHA-256 checksum generator using runtime crypto.subtle
export async function calculateSHA256Checksum(products: Product[]): Promise<string> {
  // Normalize ordering deterministically by product id
  const sorted = [...products].sort((a, b) => a.id.localeCompare(b.id));
  const serialized = JSON.stringify(sorted);
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256_${hashHex}`;
}

export const calculateInventoryChecksum = calculateSHA256Checksum;

// Byte-size-aware chunking
export function createByteSizeChunks(products: Product[]): Product[][] {
  const sorted = [...products].sort((a, b) => a.id.localeCompare(b.id));
  const chunks: Product[][] = [];
  let currentChunk: Product[] = [];
  let currentChunkBytes = 0;

  for (const product of sorted) {
    const productJson = JSON.stringify(product);
    const productBytes = new TextEncoder().encode(productJson).length;

    if (productBytes > MAX_CHUNK_BYTES) {
      throw new Error(`Product "${product.name}" (ID: ${product.id}) is too large (${(productBytes / 1024).toFixed(1)} KB) to fit safely within backup chunk size limits.`);
    }

    if (currentChunk.length > 0 && currentChunkBytes + productBytes > MAX_CHUNK_BYTES) {
      chunks.push(currentChunk);
      currentChunk = [product];
      currentChunkBytes = productBytes;
    } else {
      currentChunk.push(product);
      currentChunkBytes += productBytes;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function createDurableInventoryBackup(
  products: Product[],
  userEmail = 'Admin',
  backupType: 'AUTOMATIC' | 'MANUAL' | 'PRE_RESTORE_SAFETY' = 'AUTOMATIC'
): Promise<InventoryBackupSchema> {
  const backupId = `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const checksum = await calculateSHA256Checksum(products);

  let totalInventoryRecords = 0;
  products.forEach((p) => {
    if (p.sizeStocks && p.sizeStocks.length > 0) {
      totalInventoryRecords += p.sizeStocks.length;
    } else {
      totalInventoryRecords += 1;
    }
  });

  const productChunks = createByteSizeChunks(products);

  const metadata: InventoryBackupMetadata = {
    schemaVersion: '2.2.0',
    backupId,
    createdAt: new Date().toISOString(),
    createdBy: userEmail,
    productCount: products.length,
    inventoryRecordCount: totalInventoryRecords,
    checksum,
    status: 'CREATING',
    chunkCount: productChunks.length,
    source: 'Firestore Byte-Size Aware Chunking Engine',
    backupType,
  };

  try {
    // 1. Write metadata with status = 'CREATING'
    await setDoc(doc(db, 'inventoryBackups', backupId), metadata);

    // 2. Write all chunk documents
    for (let idx = 0; idx < productChunks.length; idx++) {
      const chunkId = `chunk_${idx + 1}`;
      await setDoc(doc(db, 'inventoryBackups', backupId, 'chunks', chunkId), {
        chunkIndex: idx + 1,
        products: productChunks[idx],
      });
    }

    // 3. Verify chunks & SHA-256 checksum
    const reconstructed = await fetchFullBackupWithProducts(backupId, productChunks.length);
    if (reconstructed.length !== products.length) {
      throw new Error('Chunk verification failed: Reconstructed product count mismatch.');
    }

    const reconstructedChecksum = await calculateSHA256Checksum(reconstructed);
    if (reconstructedChecksum !== checksum) {
      throw new Error('Checksum integrity verification failed after backup write.');
    }

    // 4. Mark SUCCESS only after rigorous verification passes
    const successMeta: InventoryBackupMetadata = {
      ...metadata,
      status: 'SUCCESS',
    };
    await setDoc(doc(db, 'inventoryBackups', backupId), successMeta, { merge: true });

    return {
      ...successMeta,
      products: JSON.parse(JSON.stringify(products)),
    };
  } catch (err: any) {
    console.error('Failed to create durable inventory backup:', err);
    try {
      await setDoc(doc(db, 'inventoryBackups', backupId), {
        ...metadata,
        status: 'FAILED',
      }, { merge: true });
    } catch {}
    throw err;
  }
}

export async function fetchDurableBackups(): Promise<InventoryBackupMetadata[]> {
  try {
    const q = query(collection(db, 'inventoryBackups'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    const list: InventoryBackupMetadata[] = [];
    
    for (const docSnap of snapshot.docs) {
      const meta = docSnap.data() as InventoryBackupMetadata;
      // Stale CREATING reconciliation check (> 10 mins old)
      if (meta.status === 'CREATING') {
        const ageMs = Date.now() - new Date(meta.createdAt).getTime();
        if (ageMs > 10 * 60 * 1000) {
          meta.status = 'FAILED';
          await setDoc(doc(db, 'inventoryBackups', meta.backupId), { status: 'FAILED' }, { merge: true });
        }
      }
      list.push(meta);
    }
    return list;
  } catch (err) {
    console.warn('Failed to fetch durable backups:', err);
    return [];
  }
}

export async function fetchFullBackupWithProducts(backupId: string, chunkCount: number): Promise<Product[]> {
  const products: Product[] = [];
  for (let idx = 1; idx <= chunkCount; idx++) {
    const chunkId = `chunk_${idx}`;
    const chunkDoc = await getDoc(doc(db, 'inventoryBackups', backupId, 'chunks', chunkId));
    if (!chunkDoc.exists()) {
      throw new Error(`Missing expected backup chunk: ${chunkId}`);
    }
    const data = chunkDoc.data();
    if (!data || !Array.isArray(data.products)) {
      throw new Error(`Invalid chunk data format for ${chunkId}`);
    }
    if (data.chunkIndex !== idx) {
      throw new Error(`Chunk index mismatch for ${chunkId}`);
    }
    products.push(...data.products);
  }
  return products;
}

export async function verifyBackupIntegrity(meta: InventoryBackupMetadata, products: Product[]): Promise<boolean> {
  if (meta.status !== 'SUCCESS') return false;
  if (products.length !== meta.productCount) return false;
  const currentChecksum = await calculateSHA256Checksum(products);
  return currentChecksum === meta.checksum;
}

export async function createPreRestoreSafetyBackup(currentProducts: Product[]): Promise<InventoryBackupSchema> {
  return await createDurableInventoryBackup(currentProducts, 'System (Pre-Restore Safety)', 'PRE_RESTORE_SAFETY');
}

export function previewBackupRestore(currentProducts: Product[], backupProducts: Product[]): BackupRestorePreview {
  const currentMap = new Map<string, Product>();
  currentProducts.forEach((p) => currentMap.set(p.id, p));

  const backupMap = new Map<string, Product>();
  backupProducts.forEach((p) => backupMap.set(p.id, p));

  let productsAffected = 0;
  let inventoryRecordsAffected = 0;
  let stockIncreases = 0;
  let stockDecreases = 0;
  let productsAdded = 0;
  let productsRemoved = 0;
  let productsUnchanged = 0;
  let absentCount = 0;

  const details: BackupRestorePreview['details'] = [];

  const getTotalStock = (p: Product) => {
    if (p.sizeStocks && p.sizeStocks.length > 0) {
      return p.sizeStocks.reduce((sum, s) => sum + (s.stockQuantity || 0), 0);
    }
    return p.inStock ? 10 : 0;
  };

  backupMap.forEach((backupProd, id) => {
    const currentProd = currentMap.get(id);
    if (!currentProd) {
      productsAdded++;
      details.push({ id, name: backupProd.name, action: 'added', stockDiff: getTotalStock(backupProd) });
    } else {
      const curStock = getTotalStock(currentProd);
      const bakStock = getTotalStock(backupProd);
      const diff = bakStock - curStock;

      if (diff !== 0) {
        productsAffected++;
        inventoryRecordsAffected += (backupProd.sizeStocks?.length || 1);
        if (diff > 0) stockIncreases += diff;
        else stockDecreases += Math.abs(diff);
        details.push({ id, name: backupProd.name, action: 'updated', stockDiff: diff });
      } else {
        productsUnchanged++;
        details.push({ id, name: backupProd.name, action: 'unchanged', stockDiff: 0 });
      }
    }
  });

  currentMap.forEach((currentProd, id) => {
    if (!backupMap.has(id)) {
      absentCount++;
      productsRemoved++;
      details.push({ id, name: currentProd.name, action: 'removed', stockDiff: -getTotalStock(currentProd) });
    }
  });

  return {
    productsAffected,
    inventoryRecordsAffected,
    stockIncreases,
    stockDecreases,
    productsAdded,
    productsRemoved,
    productsUnchanged,
    absentCount,
    details,
  };
}

export async function executeRestoreFromBackup(backupProducts: Product[]): Promise<{ success: boolean; restoredCount: number; error?: string }> {
  try {
    if (!Array.isArray(backupProducts)) {
      throw new Error('Invalid backup product list.');
    }

    const batchSize = 400; // safely below Firestore 500 write limit
    for (let i = 0; i < backupProducts.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = backupProducts.slice(i, i + batchSize);

      chunk.forEach((p) => {
        const docRef = doc(db, 'products', p.id);
        // Use merge: true so products absent from backup are NOT deleted
        batch.set(docRef, p, { merge: true });
      });

      await batch.commit();
    }

    localStorage.setItem('mfp_products_catalog_live', JSON.stringify(backupProducts));

    return { success: true, restoredCount: backupProducts.length };
  } catch (err: any) {
    console.error('Execute restore failed:', err);
    return { success: false, restoredCount: 0, error: err?.message || 'Firestore batch write failed during restore.' };
  }
}
