import type { MetaFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
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
import { useCategories } from "@/contexts/CategoriesContext";

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
    { name: "description", content: "Explore the comprehensive ecosystem map of NEAR Protocol. Discover DeFi, NFTs, AI, Gaming projects and more. Track development status and share custom ecosystem views." },
    { name: "keywords", content: "NEAR Protocol, Blockchain, DeFi, NFT, Web3, Cryptocurrency, Ecosystem Map, Blockchain Projects" },
    
    // Open Graph tags
    { property: "og:title", content: "NEAR Protocol Ecosystem Map" },
    { property: "og:description", content: "Explore the comprehensive ecosystem map of NEAR Protocol. Discover DeFi, NFTs, AI, Gaming projects and more." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://nearprotocol.eco" },
    { property: "og:image", content: "https://nearprotocol.eco/icon.webp" },
    
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "NEAR Protocol Ecosystem Map" },
    { name: "twitter:description", content: "Explore the comprehensive ecosystem map of NEAR Protocol. Discover DeFi, NFTs, AI, Gaming projects and more." },
    { name: "twitter:image", content: "https://nearprotocol.eco/icon.webp" },
    
    // Additional SEO tags
    { name: "robots", content: "index, follow" },
    { name: "author", content: "NEAR Protocol Ecosystem Map" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
  ];
};

interface LoaderData {
  categories: CategorizedProjects;
}

export const loader: LoaderFunction = async ({ context, request }: LoaderFunctionArgs) => {
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
  const { visibleCategories, setVisibleCategories, initializeVisibleCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 150);
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize visible categories on first load
  useEffect(() => {
    if (data.categories) {
      initializeVisibleCategories(data.categories);
    }
  }, [data.categories]);

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const toggleCategory = (category: string) => {
    setVisibleCategories({
      ...visibleCategories,
      [category]: !visibleCategories[category]
    });
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
        
        // Only filter out if phase is explicitly 'inactive'
        const matchesPhase = showInactive || project.phase !== 'inactive';
        
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {isNavigatingToCategory && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-lg text-white/80">Loading category...</div>
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <motion.h1 
          className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center flex items-center justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src="/icon.webp" alt="NEAR Protocol" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
          NEAR Protocol Ecosystem Map
        </motion.h1>
        
        <motion.div
          className="max-w-3xl mx-auto mb-8 text-center text-white/80"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-lg mb-4">
            Explore the vibrant NEAR Protocol ecosystem - from DeFi and NFTs to AI and Gaming. 
            Discover projects, track their development status, and create custom ecosystem views to share with others.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              Active Projects
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              In Development
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
              Featured Categories
            </span>
          </div>
        </motion.div>
        
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
                  showInactive={showInactive}
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