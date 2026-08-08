import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  limit, 
  onSnapshot, 
  Firestore, 
  QueryConstraint,
  Query,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  FirestoreError
} from 'firebase/firestore';
import { getCurrentTenantId } from './tenantIsolation';

export function onTenantCollectionSnapshot(
  db: Firestore,
  collectionName: string,
  constraints: QueryConstraint[],
  onNext: (snapshot: QuerySnapshot) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  let activeUnsub: Unsubscribe | null = null;
  let isUnsubscribed = false;

  const websiteId = getCurrentTenantId();
  
  if (!websiteId || websiteId === 'tenant-default') {
    const colRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
    return onSnapshot(q, onNext, onError);
  }

  // Multi-tenant check
  const tenantRef = collection(db, 'websites', websiteId, collectionName);
  
  // Asynchronously check if tenant collection is empty
  getDocs(query(tenantRef, limit(1))).then(snap => {
    if (isUnsubscribed) return;
    
    if (snap.empty) {
      // Fallback to root collection
      const rootColRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(rootColRef, ...constraints) : rootColRef;
      activeUnsub = onSnapshot(q, onNext, onError);
    } else {
      // Use tenant collection
      const q = constraints.length > 0 ? query(tenantRef, ...constraints) : tenantRef;
      activeUnsub = onSnapshot(q, onNext, onError);
    }
  }).catch(err => {
    if (onError) onError(err);
  });

  return () => {
    isUnsubscribed = true;
    if (activeUnsub) activeUnsub();
  };
}

export function onTenantDocSnapshot(
  db: Firestore,
  collectionName: string,
  docId: string,
  onNext: (snapshot: DocumentSnapshot) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  let activeUnsub: Unsubscribe | null = null;
  let isUnsubscribed = false;

  const websiteId = getCurrentTenantId();
  
  if (!websiteId || websiteId === 'tenant-default') {
    return onSnapshot(doc(db, collectionName, docId), onNext, onError);
  }

  const tenantDocRef = doc(db, 'websites', websiteId, collectionName, docId);
  
  getDoc(tenantDocRef).then(snap => {
    if (isUnsubscribed) return;

    if (!snap.exists()) {
      activeUnsub = onSnapshot(doc(db, collectionName, docId), onNext, onError);
    } else {
      activeUnsub = onSnapshot(tenantDocRef, onNext, onError);
    }
  }).catch(err => {
    if (onError) onError(err);
  });

  return () => {
    isUnsubscribed = true;
    if (activeUnsub) activeUnsub();
  };
}
