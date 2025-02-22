import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product } from '../../pages/user/types/product';

interface ComparisonContextType {
  comparisonProducts: Product[];
  isMinimized: boolean;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  setMinimized: (minimized: boolean) => void;
  getComparisonProducts: () => Product[];
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);
  const [isMinimized, setIsMinimized] = useState(true); // Set default to true
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);
  const getComparisonProducts = () => comparisonProducts;

  // Effect để theo dõi thay đổi route
  useEffect(() => {
    if (location.pathname !== prevPath) {
      // Chỉ minimize khi chuyển sang route khác
      if (comparisonProducts.length > 0 && !isMinimized) {
        setIsMinimized(true);
      }
      setPrevPath(location.pathname);
    }
  }, [location.pathname, comparisonProducts.length, isMinimized, prevPath]);

  const addProduct = (product: Product) => {
    if (comparisonProducts.length < 3) {
      setComparisonProducts(prev => [...prev, product]);
      setIsMinimized(false); // Expand when adding product
    }
  };

  const removeProduct = (productId: string) => {
    setComparisonProducts(products => {
      const updated = products.filter(p => p.id !== productId);
      if (updated.length === 0) {
        setIsMinimized(true);
      }
      return updated;
    });
  };

  const clearProducts = () => {
    setComparisonProducts([]);
    setIsMinimized(true);
  };

  // Memoize value to prevent unnecessary rerenders
  const value = {
    comparisonProducts,
    isMinimized,
    addProduct,
    removeProduct,
    clearProducts,
    setMinimized: setIsMinimized,
    getComparisonProducts
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export default ComparisonProvider;