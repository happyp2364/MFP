import { collection, doc, getDocs, getDoc, query, limit, Firestore, CollectionReference, DocumentReference, onSnapshot, QuerySnapshot, DocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import { getCurrentTenantId } from './tenantIsolation';

export async function resolveTenantCollection(db: Firestore, collectionName: string, websiteId?: string): Promise<CollectionReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId();
  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return collection(db, collectionName);
  }

  const tenantRef = collection(db, 'websites', targetWebsiteId, collectionName);
  const snap = await getDocs(query(tenantRef, limit(1)));
  
  if (snap.empty) {
    return collection(db, collectionName); // fallback
  }
  
  return tenantRef;
}

export async function resolveTenantDoc(db: Firestore, collectionName: string, docId: string, websiteId?: string): Promise<DocumentReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId();
  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return doc(db, collectionName, docId);
  }

  const tenantDocRef = doc(db, 'websites', targetWebsiteId, collectionName, docId);
  const snap = await getDoc(tenantDocRef);

  if (!snap.exists()) {
    return doc(db, collectionName, docId); // fallback
  }

  return tenantDocRef;
}

export function getTenantCollectionWriteRef(db: Firestore, collectionName: string, websiteId?: string): CollectionReference {
  const targetWebsiteId = websiteId || getCurrentTenantId();
  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return collection(db, collectionName);
  }
  return collection(db, 'websites', targetWebsiteId, collectionName);
}

export function getTenantDocWriteRef(db: Firestore, collectionName: string, docId: string, websiteId?: string): DocumentReference {
  const targetWebsiteId = websiteId || getCurrentTenantId();
  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return doc(db, collectionName, docId);
  }
  return doc(db, 'websites', targetWebsiteId, collectionName, docId);
}
