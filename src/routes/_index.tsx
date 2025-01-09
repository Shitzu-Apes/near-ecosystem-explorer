import type { MetaFunction, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories } from "@/utils/projectUtils";
import CategoryCard from "@/components/CategoryCard";
import ShareDialog from "@/components/ShareDialog";
import CategoryControls from '@/components/CategoryControls';
import MasonryLayout from '@/components/MasonryLayout';
import ProjectsGrid from '@/components/ProjectsGrid';
import type { CategorizedProjects, Category } from "@/types/projects";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const breakpointColumns = {
  default: 5,
  1400: 4,
  1100: 3,
  700: 2,
  500: 1
};

export const meta: MetaFunction = () => {
  return [
    { title: "NEAR Protocol Ecosystem Map" },
    { name: "description", content: "Interactive map of the NEAR Protocol ecosystem" },
  ];
};

interface LoaderData {
  categories: CategorizedProjects;
}

export const loader: LoaderFunction = async () => {
  const categories = await getCategories();
  return Response.json({ categories });
};

export default function Index() {
  const { categories } = useLoaderData<LoaderData>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.entries(categories).forEach(([key, category]) => {
      initial[key] = category.isPriority || key === 'aurora-virtual-chain';
    });
    return initial;
  });
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 150);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const toggleCategory = (category: string) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleFeatured = () => {
    const nextShowOnlyFeatured = !showOnlyFeatured;
    setShowOnlyFeatured(nextShowOnlyFeatured);
    
    const updatedVisibility = { ...visibleCategories };
    
    if (nextShowOnlyFeatured) {
      // Switching to featured only
      Object.entries(categories).forEach(([key, category]) => {
        updatedVisibility[key] = category.isPriority;
      });
    } else {
      // Switching to all
      Object.keys(categories).forEach(key => {
        updatedVisibility[key] = true;
      });
    }
    
    setVisibleCategories(updatedVisibility);
  };

  const sortedCategories = Object.entries(categories).sort((a, b) => 
    a[1].title.localeCompare(b[1].title)
  );

  const filteredCategories = sortedCategories
    .filter(([key]) => visibleCategories[key])
    .map(([key, category]) => {
      if (!debouncedSearchQuery) return [key, category];

      const query = debouncedSearchQuery.toLowerCase();
      const filteredProjects = category.projects.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );

      if (filteredProjects.length === 0) return null;

      return [key, { ...category, projects: filteredProjects }];
    })
    .filter((item): item is [string, Category] => item !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-[1800px] mx-auto">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src="/icon.webp" alt="NEAR Protocol" className="w-12 h-12 rounded-lg" />
          NEAR Protocol Ecosystem Map
        </motion.h1>
        
        <CategoryControls 
          categories={sortedCategories}
          visibleCategories={visibleCategories}
          showOnlyFeatured={showOnlyFeatured}
          onToggleCategory={toggleCategory}
          onToggleFeatured={toggleFeatured}
          onShareClick={() => setShareDialogOpen(true)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div ref={contentRef}>
          <ShareDialog 
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            categories={categories} 
            visibleCategories={visibleCategories}
          />
          
          <AnimatePresence>
            <MasonryLayout breakpointColumns={breakpointColumns}>
              {filteredCategories.map(([key, category]) => (
                <CategoryCard
                  key={key}
                  title={category.title}
                  color={category.color}
                  projects={category.projects}
                  onClick={() => handleCategoryClick(key)}
                  isPriority={category.isPriority}
                  slug={key}
                />
              ))}
            </MasonryLayout>
          </AnimatePresence>

          {selectedCategory && categories[selectedCategory] && (
            <ProjectsGrid
              title={categories[selectedCategory].title}
              projects={categories[selectedCategory].projects}
            />
          )}
        </div>
      </div>
    </div>
  );
} 