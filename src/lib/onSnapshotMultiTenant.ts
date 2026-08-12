import { 
  collection, 
  doc, 
  onSnapshot, 
  Firestore, 
  QueryConstraint,
  query,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  FirestoreError
} from 'firebase/firestore';
import { getCurrentTenantId, DEFAULT_TENANT_ID } from './tenantIsolation';

/**
 * Subscribes to a tenant-isolated collection snapshot (/websites/{websiteId}/{collectionName}).
 * Strict multi-tenant isolation: No fallback to root collections.
 */
export function onTenantCollectionSnapshot(
  db: Firestore,
  collectionName: string,
  constraints: QueryConstraint[],
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const websiteId = getCurrentTenantId() || DEFAULT_TENANT_ID;
  const tenantRef = collection(db, 'websites', websiteId, collectionName);
  const q = constraints.length > 0 ? query(tenantRef, ...constraints) : tenantRef;
  return onSnapshot(q, onNext, onError);
}

/**
 * Subscribes to a tenant-isolated document snapshot (/websites/{websiteId}/{collectionName}/{docId}).
 * Strict multi-tenant isolation: No fallback to root documents.
 */
export function onTenantDocSnapshot(
  db: Firestore,
  collectionName: string,
  docId: string,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  const websiteId = getCurrentTenantId() || DEFAULT_TENANT_ID;
  const tenantDocRef = doc(db, 'websites', websiteId, collectionName, docId);
  return onSnapshot(tenantDocRef, onNext, onError);
}
