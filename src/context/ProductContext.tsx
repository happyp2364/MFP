import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Product, Review } from '../types';
import { PRODUCTS_DATA, REVIEWS_DATA } from '../data/mockData';
import { db } from '../lib/firebase';
import { collection, limit, onSnapshot, query, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { sanitizeForFirestore } from '../lib/tenantUtils';

interface ProductContextType {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => Promise<Product>;
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
  PRODUCTS: 'mfp_products_catalog_live',
  REVIEWS: 'mfp_reviews_live',
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

  const safeSetLocalStorage = (key: string, val: string) => {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.warn(`Could not save ${key} to localStorage:`, e);
    }
  };

  useEffect(() => {
    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), limit(500)),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Product[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() } as Product);
          });
          // Stable sort: Products with newer createdAt timestamps appear first
          loaded.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (timeA && timeB && timeA !== timeB) return timeB - timeA;
            if (timeA && !timeB) return -1;
            if (!timeA && timeB) return 1;
            return 0;
          });
          setProducts(loaded);
          safeSetLocalStorage(STORAGE_KEYS.PRODUCTS, JSON.stringify(loaded));
        }
      },
      (error) => {
        console.warn('Firestore products listener error:', error);
      }
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), limit(100)),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Review[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() } as Review);
          });
          setReviews(loaded);
          safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(loaded));
        }
      },
      (error) => {
        console.warn('Firestore reviews listener error:', error);
      }
    );

    return () => {
      unsubProducts();
      unsubReviews();
    };
  }, []);

  const addProduct = async (p: Omit<Product, 'id'>): Promise<Product> => {
    if (!p.name || !p.name.trim()) {
      throw new Error('Product name is required.');
    }
    if (typeof p.price !== 'number' || isNaN(p.price) || p.price <= 0) {
      throw new Error('Valid product price is required.');
    }

    const newId = (p as any).id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const cleanProduct: Product = {
      ...p,
      id: newId,
      name: p.name.trim(),
      brand: p.brand ? p.brand.trim() : 'Marudhar Fashion',
      category: p.category || 'men',
      subcategory: p.subcategory || 'Sports Shoes',
      price: Number(p.price),
      inStock: p.inStock !== false,
      status: p.status || 'active',
      description: p.description ? p.description.trim() : '',
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'],
      sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['6', '7', '8', '9', '10'],
      colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Black', hex: '#000000' }],
      createdAt: (p as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sanitize to eliminate all undefined fields
    const sanitized = sanitizeForFirestore(cleanProduct);

    // CRITICAL: Await Firestore write first. Do NOT add permanently if Firestore rejects.
    try {
      await setDoc(doc(db, 'products', cleanProduct.id), sanitized);
    } catch (err: any) {
      console.error('[ProductContext] Firestore setDoc failed:', err);
      const message = err?.code === 'permission-denied'
        ? 'Permission Denied: Please check administrator authentication in Firestore.'
        : (err?.message || 'Failed to save product to cloud Firestore database.');
      throw new Error(message);
    }

    // Update local state and localStorage once write succeeded
    setProducts((prev) => {
      if (prev.some((item) => item.id === cleanProduct.id)) {
        return prev.map((item) => (item.id === cleanProduct.id ? cleanProduct : item));
      }
      const next = [cleanProduct, ...prev];
      safeSetLocalStorage(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      return next;
    });

    return cleanProduct;
  };

  const updateProduct = async (id: string, p: Partial<Product>): Promise<void> => {
    const target = products.find((item) => item.id === id);
    const updatedProduct: Product = {
      ...(target || {}),
      ...p,
      id,
      updatedAt: new Date().toISOString(),
    } as Product;

    const sanitized = sanitizeForFirestore(updatedProduct);

    try {
      await setDoc(doc(db, 'products', id), sanitized, { merge: true });
    } catch (err: any) {
      console.error('[ProductContext] Firestore update failed:', err);
      const message = err?.code === 'permission-denied'
        ? 'Permission Denied: Please check administrator authentication in Firestore.'
        : (err?.message || 'Failed to update product in cloud database.');
      throw new Error(message);
    }

    setProducts((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...sanitized } : item));
      safeSetLocalStorage(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err: any) {
      console.error('[ProductContext] Firestore delete failed:', err);
      const message = err?.code === 'permission-denied'
        ? 'Permission Denied: Please check administrator authentication in Firestore.'
        : (err?.message || 'Failed to delete product from cloud database.');
      throw new Error(message);
    }

    setProducts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeSetLocalStorage(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const toggleInStock = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      await updateProduct(id, { inStock: !target.inStock });
    }
  };

  const addReview = async (r: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...r,
      id: `rev_${Date.now()}`,
      date: new Date().toISOString(),
      helpfulCount: 0,
    };
    const sanitized = sanitizeForFirestore(newReview);
    try {
      await setDoc(doc(db, 'reviews', newReview.id), sanitized);
      setReviews((prev) => {
        const updated = [newReview, ...prev];
        safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Firestore add review failed', e);
      throw e;
    }
  };

  const updateReview = async (id: string, r: Partial<Review>) => {
    const sanitized = sanitizeForFirestore(r);
    try {
      await setDoc(doc(db, 'reviews', id), sanitized, { merge: true });
      setReviews((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...sanitized } : item));
        safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Firestore update review failed', e);
      throw e;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn('Firestore delete review failed', e);
      throw e;
    }
  };

  const voteHelpfulReview = async (id: string) => {
    const updated = reviews.map((rev) =>
      rev.id === id ? { ...rev, helpfulCount: (rev.helpfulCount || 0) + 1 } : rev
    );
    setReviews(updated);
    safeSetLocalStorage(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  };

  const contextValue = useMemo(() => ({
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
  }), [products, reviews]);

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};

