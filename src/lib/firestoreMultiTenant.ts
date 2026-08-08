import {
  collection,
  doc,
  Firestore,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { getCurrentTenantId } from './tenantIsolation';

/**
 * Resolve tenant collection.
 * No existence check.
 * No fallback after checking Firestore.
 */
export async function resolveTenantCollection(
  db: Firestore,
  collectionName: string,
  websiteId?: string
): Promise<CollectionReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId();

  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return collection(db, collectionName);
  }

  return collection(
    db,
    'websites',
    targetWebsiteId,
    collectionName
  );
}

/**
 * Resolve tenant document.
 * No existence check.
 * Always returns the correct document path.
 */
export async function resolveTenantDoc(
  db: Firestore,
  collectionName: string,
  docId: string,
  websiteId?: string
): Promise<DocumentReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId();

  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return doc(db, collectionName, docId);
  }

  return doc(
    db,
    'websites',
    targetWebsiteId,
    collectionName,
    docId
  );
}

/**
 * Write reference for a tenant collection.
 */
export function getTenantCollectionWriteRef(
  db: Firestore,
  collectionName: string,
  websiteId?: string
): CollectionReference {
  const targetWebsiteId = websiteId || getCurrentTenantId();

  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return collection(db, collectionName);
  }

  return collection(
    db,
    'websites',
    targetWebsiteId,
    collectionName
  );
}

/**
 * Write reference for a tenant document.
 */
export function getTenantDocWriteRef(
  db: Firestore,
  collectionName: string,
  docId: string,
  websiteId?: string
): DocumentReference {
  const targetWebsiteId = websiteId || getCurrentTenantId();

  if (!targetWebsiteId || targetWebsiteId === 'tenant-default') {
    return doc(db, collectionName, docId);
  }

  return doc(
    db,
    'websites',
    targetWebsiteId,
    collectionName,
    docId
  );
}