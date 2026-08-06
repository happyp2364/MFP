import React, { createContext, useContext, useState, ReactNode } from 'react';

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
      const generatedTitle = `${productTitle} | Premium Footwear Collection`;
      const generatedDesc = description
        ? `${description.slice(0, 140)}... Shop online at Marudhar Fashion Point.`
        : `Buy high quality ${productTitle} with fast delivery and easy returns.`;
      const keywords = [productTitle.toLowerCase(), 'footwear', 'shoes', 'online shopping', 'marudhar fashion point'];

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
