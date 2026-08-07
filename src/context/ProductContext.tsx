import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Review } from '../types';
import { PRODUCTS_DATA, REVIEWS_DATA } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, limit, onSnapshot, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { scopeDoc, getCurrentTenantId, filterDocsByTenant } from '../lib/tenantIsolation';

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

const STORAGE_KEYS = {
  PRODUCTS: 'nwd_products_catalog_live',
  REVIEWS: 'nwd_reviews_live',
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : PRODUCTS_DATA;
    } catch {
      return PRODUCTS_DATA;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : REVIEWS_DATA;
    } catch {
      return REVIEWS_DATA;
    }
  });

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'products'), limit(500)), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Product[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });
        setProducts(filterDocsByTenant(loaded, getCurrentTenantId()));
      }
    }, () => {});

    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (!snapshot.empty) {
        const loaded: Review[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as Review);
        });
        setReviews(filterDocsByTenant(loaded, getCurrentTenantId()));
      }
    }, () => {});

    return () => {
      unsubProducts();
      unsubReviews();
    };
  }, []);

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const scopedPayload = scopeDoc({ ...p, id: `prod_${Date.now()}` });
    const newProduct: Product = scopedPayload;
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'products', newProduct.id), scopedPayload);
    } catch (e) {
      console.warn('Firestore add product failed', e);
    }
  };

  const updateProduct = async (id: string, p: Partial<Product>) => {
    const updated = products.map((item) => (item.id === id ? { ...item, ...p } : item));
    setProducts(updated);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'products', id), p, { merge: true });
    } catch (e) {
      console.warn('Firestore update product failed', e);
    }
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((item) => item.id !== id);
    setProducts(updated);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'products', id));
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
    const scopedPayload = scopeDoc({
      ...r,
      id: `rev_${Date.now()}`,
      date: new Date().toISOString(),
      helpfulCount: 0,
    });
    const newReview: Review = scopedPayload;
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'reviews', newReview.id), scopedPayload);
    } catch (e) {
      console.warn('Firestore add review failed', e);
    }
  };

  const updateReview = async (id: string, r: Partial<Review>) => {
    const updated = reviews.map((item) => (item.id === id ? { ...item, ...r } : item));
    setReviews(updated);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  };

  const deleteReview = async (id: string) => {
    const updated = reviews.filter((item) => item.id !== id);
    setReviews(updated);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (e) {
      console.warn('Firestore delete review failed', e);
    }
  };

  const voteHelpfulReview = async (id: string) => {
    const updated = reviews.map((rev) =>
      rev.id === id ? { ...rev, helpfulCount: (rev.helpfulCount || 0) + 1 } : rev
    );
    setReviews(updated);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
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
