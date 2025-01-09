import type { MetaFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { categorizeProjects } from "@/utils/projectUtils";
import { fetchProjects } from "@/utils/api";
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

export const loader: LoaderFunction = async ({ context }: LoaderFunctionArgs) => {
  const { PROJECTS_KV } = context as { PROJECTS_KV: KVNamespace };
  try {
    const projects = await fetchProjects({ PROJECTS_KV });
    const categories = categorizeProjects(projects);
    return json({ categories });
  } catch (error) {
    console.error('Loader - Error fetching projects:', error);
    return json({ categories: {} });
  }
};

export default function Index() {
  const data = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (data.categories) {
      Object.entries(data.categories).forEach(([key, category]) => {
        initial[key] = category.isPriority;
      });
    }
    return initial;
  });
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
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
      Object.entries(data.categories).forEach(([key, category]) => {
        updatedVisibility[key] = category.isPriority;
      });
    } else {
      // Switching to all
      Object.keys(data.categories).forEach(key => {
        updatedVisibility[key] = true;
      });
    }
    
    setVisibleCategories(updatedVisibility);
  };

  const sortedCategories = data.categories 
    ? Object.entries(data.categories).sort((a, b) => 
        a[1].title.localeCompare(b[1].title)
      )
    : [];

  const filteredCategories = sortedCategories
    .filter(([key]) => visibleCategories[key])
    .map(([key, category]) => {
      const filteredProjects = category.projects.filter(project => {
        const matchesSearch = !debouncedSearchQuery || 
          project.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          project.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        
        // When showInactive is false (default): show only active and building projects
        // When showInactive is true: show all projects including inactive ones
        const matchesPhase = showInactive || 
          (project.phase === "mainnet" || project.phase === "still building");
        
        return matchesSearch && matchesPhase;
      });

      if (filteredProjects.length === 0) return null;

      return [key, { ...category, projects: filteredProjects }];
    })
    .filter((item): item is [string, Category] => item !== null);

  // Show loading overlay when navigating to a category
  const isNavigatingToCategory = navigation.state === "loading" && 
    navigation.location?.pathname.startsWith("/category/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      {isNavigatingToCategory && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-lg text-white/80">Loading category...</div>
          </div>
        </div>
      )}

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
          showInactive={showInactive}
          onToggleCategory={toggleCategory}
          onToggleFeatured={toggleFeatured}
          onToggleInactive={() => setShowInactive(!showInactive)}
          onShareClick={() => setShareDialogOpen(true)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div ref={contentRef}>
          <ShareDialog 
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            categories={data.categories} 
            visibleCategories={visibleCategories}
            showInactive={showInactive}
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

          {selectedCategory && data.categories[selectedCategory] && (
            <ProjectsGrid
              title={data.categories[selectedCategory].title}
              projects={data.categories[selectedCategory].projects}
            />
          )}
        </div>
      </div>
    </div>
  );
} 