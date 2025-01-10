import { useState, useEffect, useRef, useCallback } from 'react';
import { json, LoaderFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, Link, useNavigation } from "@remix-run/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCategories } from "@/utils/projectUtils";
import { CategorizedProjects, Project, ProjectDetailsResponse } from "@/types/projects";
import { 
  Github, 
  Globe,
  PlayCircle,
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { sortProjectsByScoreAndPhase } from '@/utils/sorting';
import { motion } from 'framer-motion';

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const MediumIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface LoaderData {
  category: {
    title: string;
    color: string;
    projects: Project[];
    isPriority: boolean;
    remainingProjects?: Project[];
  };
}

export const loader: LoaderFunction = async ({ params, context }: LoaderFunctionArgs) => {
  const categories = await getCategories(context);

  const category = categories[params.slug!];

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  // Sort all projects by phase before slicing
  const sortedProjects = sortProjectsByScoreAndPhase(category.projects);

  // Only fetch details for first 10 projects
  const initialProjects = sortedProjects.slice(0, 10);

  return json<LoaderData>({
    category: {
      ...category,
      projects: initialProjects,
      remainingProjects: sortedProjects.slice(10),
    },
  });
};

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  // Handle case where data is null or undefined
  if (!data) {
    return [
      { title: "Category Not Found - NEAR Protocol Ecosystem Map" },
      { name: "description", content: "This category could not be found in the NEAR Protocol ecosystem." }
    ];
  }

  const { category } = data as LoaderData;
  if (!category) {
    return [
      { title: "Category Not Found - NEAR Protocol Ecosystem Map" },
      { name: "description", content: "This category could not be found in the NEAR Protocol ecosystem." }
    ];
  }

  const title = `${category.title} - NEAR Protocol Ecosystem Map`;
  const description = `Explore ${category.title} projects in the NEAR Protocol ecosystem. Discover active projects, development status, and detailed information.`;

  return [
    { title },
    { name: "description", content: description },
    
    // Open Graph tags
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `https://nearprotocol.eco/category/${params.slug}` },
    { property: "og:image", content: "https://nearprotocol.eco/icon.webp" },
    
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://nearprotocol.eco/icon.webp" },
  ];
};

const getPhaseConfig = (phase: string | undefined) => {
  switch (phase) {
    case 'mainnet':
      return {
        label: 'Mainnet',
        className: 'bg-emerald-500/20 text-emerald-400'
      };
    case 'still building':
      return {
        label: 'Building',
        className: 'bg-amber-500/20 text-amber-400'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        className: 'bg-red-500/20 text-red-400'
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-gray-500/20 text-gray-400'
      };
  }
};

export default function Category() {
  const { category } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [displayedProjects, setDisplayedProjects] = useState(category.projects);
  const [remainingProjects, setRemainingProjects] = useState(category.remainingProjects || []);
  const [hasMore, setHasMore] = useState(category.remainingProjects?.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Character threshold for showing the "Learn More" button
  const CONTENT_THRESHOLD = 500;

  const toggleDescription = (projectId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Reset state when category changes
  useEffect(() => {
    setDisplayedProjects(category.projects);
    setRemainingProjects(category.remainingProjects || []);
    setHasMore(category.remainingProjects?.length > 0);
    setExpandedDescriptions({});
  }, [category.title]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextProjects = remainingProjects.slice(0, 10);
    
    try {
      setDisplayedProjects(prev => [...prev, ...nextProjects]);
      setRemainingProjects(prev =>  prev.slice(10));
      setHasMore(remainingProjects.length > 10);
    } catch (error) {
      console.error('Error loading more projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [remainingProjects, hasMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px',
      }
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Show loading skeleton only when navigating TO this category
  if (navigation.state === "loading" && !navigation.location?.pathname.startsWith("/category/")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 sm:mb-6 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Map</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold break-words">{category.title}</h1>
          {category.isPriority && (
            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-white/10 shrink-0">
              Featured Category
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6">
          {displayedProjects.map((project) => (
            <div 
              key={project.name}
              className="bg-gray-800/80 backdrop-blur-sm border border-white/10 shadow-xl rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start hover:bg-gray-800/90 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 p-1">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <h2 className="text-2xl font-semibold break-words">{project.name}</h2>
                    {project.phase && (
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getPhaseConfig(project.phase).className} shrink-0`}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                        </span>
                        <span className="text-sm font-medium">{getPhaseConfig(project.phase).label}</span>
                      </div>
                    )}
                  </div>
                  {project.tokens && 
                    Object.entries(project.tokens).some(([_, token]) => 
                      token.symbol.trim() && token.name.trim() && token.icon?.small
                    ) && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {Object.entries(project.tokens)
                        .filter(([_, token]) => token.platform.coingecko && token.platform.coingecko.match(/^[a-zA-Z0-9]+$/) && token.symbol.trim() && token.name.trim())
                        .map(([symbol, token]) => {
                          const coingeckoUrl = `https://www.coingecko.com/en/coins/${token.platform.coingecko}`;
                          const TokenContent = () => (
                            <>
                              {token.icon.small &&
                                <img 
                                  src={token.icon.small} 
                                  alt={token.name} 
                                  className="w-5 h-5 rounded-full"
                                />
                              }
                              <span className="text-sm font-medium">{symbol}</span>
                            </>
                          );

                          return (
                            <div key={symbol} className="shrink-0">
                              {token.name && (
                                <a
                                  href={coingeckoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
                                >
                                  <TokenContent />
                                </a>
                              )}
                              {!token.name && (
                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                                  <TokenContent />
                                </div>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
                
                {project.tagline && (
                  <p className="text-white/80 mb-4 text-lg break-words">{project.tagline}</p>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  {project.dapp && project.dapp.trim() && (
                    <a
                      href={project.dapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors shrink-0"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Launch App
                    </a>
                  )}
                  {project.linktree?.website && project.linktree.website.trim() && (
                    <a
                      href={project.linktree.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white shrink-0"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {project.linktree?.github && project.linktree.github.trim() && (
                    <a
                      href={project.linktree.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#171515] hover:bg-[#171515]/80 transition-colors text-white shrink-0"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {project.linktree?.twitter && project.linktree.twitter.trim() && (
                    <a
                      href={project.linktree.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-black hover:bg-black/80 transition-colors text-white shrink-0"
                    >
                      <XIcon />
                      X
                    </a>
                  )}
                  {project.linktree?.telegram && project.linktree.telegram.trim() && (
                    <a
                      href={project.linktree.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#229ED9] hover:bg-[#229ED9]/80 transition-colors text-white shrink-0"
                    >
                      <TelegramIcon />
                      Telegram
                    </a>
                  )}
                  {project.linktree?.medium && project.linktree.medium.trim() && (
                    <a
                      href={project.linktree.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#00AB6C] hover:bg-[#00AB6C]/80 transition-colors text-white shrink-0"
                    >
                      <MediumIcon />
                      Medium
                    </a>
                  )}
                </div>

                {project.description && (
                  <div className="prose prose-invert max-w-none overflow-hidden break-words">
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: !expandedDescriptions[project.id] && project.description.length > CONTENT_THRESHOLD
                          ? "8em" 
                          : "auto"
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="relative overflow-hidden"
                    >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                        className="text-white/80 break-words [word-break:break-word] [overflow-wrap:anywhere]"
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 whitespace-pre-line break-words [word-break:break-word] " {...props} />,
                        a: ({node, ...props}) => (
                          <a 
                            className="text-primary hover:text-primary/80 transition-colors break-words [word-break:break-word] " 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props}
                          />
                        ),
                        img: ({node, ...props}) => (
                          <img 
                            className="max-w-full h-auto object-contain rounded-lg my-4" 
                            {...props}
                          />
                        ),
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 break-words [word-break:break-word] " {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 break-words [word-break:break-word] " {...props} />,
                        li: ({node, ...props}) => <li className="mb-1 break-words [word-break:break-word] " {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 break-words [word-break:break-word] " {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 break-words [word-break:break-word] " {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 break-words [word-break:break-word] " {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-white/10 rounded p-4 mb-4 overflow-x-auto whitespace-pre-wrap break-words [word-break:break-word] " {...props} />,
                        code: ({node, ...props}) => (
                          <code className="block bg-white/10 rounded p-4 mb-4 overflow-x-auto whitespace-pre-wrap break-words [word-break:break-word] " {...props} />
                        ),
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-primary/50 pl-4 italic mb-4 break-words [word-break:break-word] " {...props} />
                        ),
                      }}
                    >
                      {project.description
                        .replace(/\\r\\n/g, '\n')
                        .replace(/\\n/g, '\n')
                        .replace(/\r\n/g, '\n')
                      }
                    </ReactMarkdown>
                      {!expandedDescriptions[project.id] && project.description.length > CONTENT_THRESHOLD && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800/90 to-transparent" />
                      )}
                    </motion.div>
                    {project.description.length > CONTENT_THRESHOLD && (
                      <motion.button
                        onClick={() => toggleDescription(project.id)}
                        className="mt-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium flex items-center gap-2"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {expandedDescriptions[project.id] ? 'Show Less' : 'Learn More'}
                        <motion.div
                          initial={false}
                          animate={{ rotate: expandedDescriptions[project.id] ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {hasMore && (
            <div 
              ref={containerRef} 
              className="h-20 flex items-center justify-center text-white/60"
            >
              Loading more projects...
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 