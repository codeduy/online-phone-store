import React, { createContext, useContext, useState } from 'react';

interface FilterContextType {
  filters: {
    brands: string[];
    priceRange: [number, number];
    screens: string[];
    years: string[];
    memories: string[];
    rams: string[];
    needs: string[];
    features: string[];
  };
  setFilters: (filters: any) => void;
  clearFilters: () => void;
}

const defaultFilters = {
  brands: [],
  priceRange: [0, 50000000],
  screens: [],
  years: [],
  memories: [],
  rams: [],
  needs: [],
  features: []
};

const FilterContext = createContext<FilterContextType>({
  filters: defaultFilters,
  setFilters: () => {},
  clearFilters: () => {}
});

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState(defaultFilters);

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);