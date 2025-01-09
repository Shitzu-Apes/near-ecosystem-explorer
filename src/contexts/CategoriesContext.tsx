import { createContext, useContext, useState, ReactNode } from 'react';
import type { CategorizedProjects } from '@/types/projects';

interface CategoriesContextType {
  visibleCategories: Record<string, boolean>;
  setVisibleCategories: (categories: Record<string, boolean>) => void;
  initializeVisibleCategories: (categories: CategorizedProjects) => void;
}

const CategoriesContext = createContext<CategoriesContextType | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({});

  const initializeVisibleCategories = (categories: CategorizedProjects) => {
    if (Object.keys(visibleCategories).length === 0) {
      const initial: Record<string, boolean> = {};
      Object.entries(categories).forEach(([key, category]) => {
        initial[key] = category.isPriority;
      });
      setVisibleCategories(initial);
    }
  };

  return (
    <CategoriesContext.Provider 
      value={{ 
        visibleCategories, 
        setVisibleCategories,
        initializeVisibleCategories
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
} 