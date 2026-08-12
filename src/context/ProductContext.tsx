import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Review } from '../types';
import { PRODUCTS_DATA, REVIEWS_DATA } from '../data/mockData';
import { db } from '../lib/firebase';
import { onTenantCollectionSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { limit, setDoc, deleteDoc } from 'firebase/firestore';
import { scopeDoc, getCurrentTenantId } from '../lib/tenantIsolation';

interface ProductContextType {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, p: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleInStock: (id: string) => Promise<void>;
  reviews: Review[];
  addReview: (r: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  updateReview: (id: string, r: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  voteHelpfulReview: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTenant, setActiveTenant] = useState(getCurrentTenantId());
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const handleTenantChange = () => {
      setActiveTenant(getCurrentTenantId());
    };
    window.addEventListener('tenantChanged', handleTenantChange);
    window.addEventListener('storage', handleTenantChange);
    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange);
      window.removeEventListener('storage', handleTenantChange);
    };
  }, []);

  useEffect(() => {
    const currentId = getCurrentTenantId();

    // Clear state before subscribing to the target tenant's collection
    setProducts([]);
    setReviews([]);

    const unsubProducts = onTenantCollectionSnapshot(
      db,
      'products',
      [limit(500)],
      (snapshot) => {
        const loaded: Product[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as Product);
        });

        if (loaded.length === 0 && (currentId === 'nwd_store_001' || currentId === 'tenant-default')) {
          setProducts(PRODUCTS_DATA);
        } else {
          setProducts(loaded);
        }
      },
      (err) => {
        console.warn('Products listener notice:', err);
      }
    );

    const unsubReviews = onTenantCollectionSnapshot(
      db,
      'reviews',
      [],
      (snapshot) => {
        const loaded: Review[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as Review);
        });

        if (loaded.length === 0 && (currentId === 'nwd_store_001' || currentId === 'tenant-default')) {
          setReviews(REVIEWS_DATA);
        } else {
          setReviews(loaded);
        }
      },
      (err) => {
        console.warn('Reviews listener notice:', err);
      }
    );

    return () => {
      unsubProducts();
      unsubReviews();
    };
  }, [activeTenant]);

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const activeId = getCurrentTenantId();
    const scopedPayload = scopeDoc({ ...p, id: `prod_${Date.now()}` }, activeId);
    const newProduct: Product = scopedPayload;
    
    // Optimistic UI update
    setProducts((prev) => [newProduct, ...prev]);

    try {
      await setDoc(getTenantDocWriteRef(db, 'products', newProduct.id, activeId), scopedPayload);
    } catch (e) {
      console.warn('Firestore add product failed', e);
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const activeId = getCurrentTenantId();
    setProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...p } : item)));

    try {
      await setDoc(getTenantDocWriteRef(db, 'products', id, activeId), p, { merge: true });
    } catch (e) {
      console.warn('Firestore update product failed', e);
    }
  };

  const deleteProduct = async (id: string) => {
    const activeId = getCurrentTenantId();
    setProducts((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteDoc(getTenantDocWriteRef(db, 'products', id, activeId));
    } catch (e) {
      console.warn('Firestore delete product failed', e);
    }
  };

  const toggleInStock = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      await updateProduct(id, { inStock: !target.inStock });
    }
  };

  const addReview = async (r: Omit<Review, 'id' | 'date'>) => {
    const activeId = getCurrentTenantId();
    const scopedPayload = scopeDoc(
      {
        ...r,
        id: `rev_${Date.now()}`,
        date: new Date().toISOString(),
        helpfulCount: 0,
      },
      activeId
    );
    const newReview: Review = scopedPayload;
    setReviews((prev) => [newReview, ...prev]);

    try {
      await setDoc(getTenantDocWriteRef(db, 'reviews', newReview.id, activeId), scopedPayload);
    } catch (e) {
      console.warn('Firestore add review failed', e);
    }
  };

  const updateReview = async (id: string, r: Partial<Review>) => {
    const activeId = getCurrentTenantId();
    setReviews((prev) => prev.map((item) => (item.id === id ? { ...item, ...r } : item)));

    try {
      await setDoc(getTenantDocWriteRef(db, 'reviews', id, activeId), r, { merge: true });
    } catch (e) {
      console.warn('Firestore update review failed', e);
    }
  };

  const deleteReview = async (id: string) => {
    const activeId = getCurrentTenantId();
    setReviews((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteDoc(getTenantDocWriteRef(db, 'reviews', id, activeId));
    } catch (e) {
      console.warn('Firestore delete review failed', e);
    }
  };

  const voteHelpfulReview = async (id: string) => {
    const activeId = getCurrentTenantId();
    const target = reviews.find((r) => r.id === id);
    if (target) {
      const newCount = (target.helpfulCount || 0) + 1;
      setReviews((prev) => prev.map((rev) => (rev.id === id ? { ...rev, helpfulCount: newCount } : rev)));

      try {
        await setDoc(
          getTenantDocWriteRef(db, 'reviews', id, activeId),
          { helpfulCount: newCount },
          { merge: true }
        );
      } catch (e) {
        console.warn('Firestore vote review failed', e);
      }
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleInStock,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        voteHelpfulReview,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
