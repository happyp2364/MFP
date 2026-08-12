import {
  collection,
  doc,
  Firestore,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { getCurrentTenantId, DEFAULT_TENANT_ID } from './tenantIsolation';

/**
 * Resolve tenant collection reference (/websites/{websiteId}/{collectionName}).
 * Strict multi-tenant path-based isolation. No existence check, no root fallbacks.
 */
export async function resolveTenantCollection(
  db: Firestore,
  collectionName: string,
  websiteId?: string
): Promise<CollectionReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId() || DEFAULT_TENANT_ID;
  return collection(db, 'websites', targetWebsiteId, collectionName);
}

/**
 * Resolve tenant document reference (/websites/{websiteId}/{collectionName}/{docId}).
 * Strict multi-tenant path-based isolation. No existence check, no root fallbacks.
 */
export async function resolveTenantDoc(
  db: Firestore,
  collectionName: string,
  docId: string,
  websiteId?: string
): Promise<DocumentReference> {
  const targetWebsiteId = websiteId || getCurrentTenantId() || DEFAULT_TENANT_ID;
  return doc(db, 'websites', targetWebsiteId, collectionName, docId);
}

/**
 * Write reference for a tenant collection (/websites/{websiteId}/{collectionName}).
 */
export function getTenantCollectionWriteRef(
  db: Firestore,
  collectionName: string,
  websiteId?: string
): CollectionReference {
  const targetWebsiteId = websiteId || getCurrentTenantId() || DEFAULT_TENANT_ID;
  return collection(db, 'websites', targetWebsiteId, collectionName);
}

/**
 * Write reference for a tenant document (/websites/{websiteId}/{collectionName}/{docId}).
 */
export function getTenantDocWriteRef(
  db: Firestore,
  collectionName: string,
  docId: string,
  websiteId?: string
): DocumentReference {
  const targetWebsiteId = websiteId || getCurrentTenantId() || DEFAULT_TENANT_ID;
  return doc(db, 'websites', targetWebsiteId, collectionName, docId);
}
