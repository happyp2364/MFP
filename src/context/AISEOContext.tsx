import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getPlatformConfig } from '../lib/platformConfig';

interface AISEOContextType {
  isGeneratingSEO: boolean;
  generateProductSEO: (productTitle: string, description: string) => Promise<{ title: string; description: string; keywords: string[] }>;
}

const AISEOContext = createContext<AISEOContextType | undefined>(undefined);

export const AISEOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isGeneratingSEO, setIsGeneratingSEO] = useState<boolean>(false);

  const generateProductSEO = async (productTitle: string, description: string) => {
    setIsGeneratingSEO(true);
    try {
      const config = getPlatformConfig();
      const generatedTitle = `${productTitle} | ${config.platformDisplayName}`;
      const generatedDesc = description
        ? `${description.slice(0, 140)}... Shop online at ${config.platformName}.`
        : `Buy high quality ${productTitle} with fast delivery and easy returns.`;
      const keywords = [(productTitle || '').toLowerCase(), 'products', 'online store', 'shopping'];

      return {
        title: generatedTitle,
        description: generatedDesc,
        keywords,
      };
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  return (
    <AISEOContext.Provider value={{ isGeneratingSEO, generateProductSEO }}>
      {children}
    </AISEOContext.Provider>
  );
};

export const useAISEO = () => {
  const context = useContext(AISEOContext);
  if (!context) throw new Error('useAISEO must be used within AISEOProvider');
  return context;
};
