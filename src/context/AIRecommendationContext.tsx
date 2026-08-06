import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';

interface AIRecommendationContextType {
  getSmartRecommendations: (currentProduct?: Product, allProducts?: Product[], count?: number) => Product[];
}

const AIRecommendationContext = createContext<AIRecommendationContextType | undefined>(undefined);

export const AIRecommendationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSmartRecommendations = (currentProduct?: Product, allProducts: Product[] = [], count = 4): Product[] => {
    if (!allProducts || allProducts.length === 0) return [];
    if (!currentProduct) return allProducts.slice(0, count);

    // Filter out current product
    const filtered = allProducts.filter((p) => p.id !== currentProduct.id);

    // Priority 1: Same category
    const sameCategory = filtered.filter((p) => p.category === currentProduct.category);
    if (sameCategory.length >= count) return sameCategory.slice(0, count);

    // Priority 2: Fill rest with popular products
    const rest = filtered.filter((p) => p.category !== currentProduct.category);
    return [...sameCategory, ...rest].slice(0, count);
  };

  return (
    <AIRecommendationContext.Provider value={{ getSmartRecommendations }}>
      {children}
    </AIRecommendationContext.Provider>
  );
};

export const useAIRecommendation = () => {
  const context = useContext(AIRecommendationContext);
  if (!context) throw new Error('useAIRecommendation must be used within AIRecommendationProvider');
  return context;
};
