import { useState, useEffect, useRef } from 'react';
import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, Link, useNavigation } from "@remix-run/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCategories } from "@/utils/projectUtils";
import { Project, ProjectDetails } from "@/types/projects";
import { 
  Github, 
  Globe,
  PlayCircle,
  ArrowLeft
} from "lucide-react";

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
    remainingProjects: Project[];
  };
}

async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  try {
    const response = await fetch(`https://api.nearcatalog.xyz/project?pid=${encodeURIComponent(projectId)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching project details:', error);
    return null;
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const categories = await getCategories();
  const category = categories[params.slug!];

  if (!category) {
    throw new Response("Category not found", { status: 404 });
  }

  // Only fetch details for first 10 projects
  const initialProjects = category.projects.slice(0, 10);
  const projectsWithDetails = await Promise.all(
    initialProjects.map(async (project) => {
      const details = await getProjectDetails(project.id);
      return { ...project, details };
    })
  );

  return json<LoaderData>({
    category: {
      ...category,
      projects: projectsWithDetails,
      // Send remaining projects without details
      remainingProjects: category.projects.slice(10),
    },
  });
};

export default function CategoryPage() {
  const { category } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [displayedProjects, setDisplayedProjects] = useState(category.projects);
  const [remainingProjects, setRemainingProjects] = useState(category.remainingProjects || []);
  const [hasMore, setHasMore] = useState(category.remainingProjects?.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when category changes
  useEffect(() => {
    setDisplayedProjects(category.projects);
    setRemainingProjects(category.remainingProjects || []);
    setHasMore(category.remainingProjects?.length > 0);
  }, [category.title]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const nextBatch = remainingProjects.slice(0, 10);
    
    try {
      // Fetch details for next batch
      const projectsWithDetails = await Promise.all(
        nextBatch.map(async (project) => {
          const details = await getProjectDetails(project.id);
          return { ...project, details };
        })
      );

      setDisplayedProjects(prev => [...prev, ...projectsWithDetails]);
      setRemainingProjects(prev => prev.slice(10));
      setHasMore(remainingProjects.length > 10);
    } catch (error) {
      console.error('Error loading more projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [hasMore, isLoading]);

  // Show loading skeleton only when navigating TO this category
  if (navigation.state === "loading" && !navigation.location?.pathname.startsWith("/category/")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-[1200px] mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Map</span>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold">{category.title}</h1>
          {category.isPriority && (
            <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-white/10">
              Featured Category
            </span>
          )}
        </div>

        <div className="grid gap-6">
          {displayedProjects.map((project) => (
            <div 
              key={project.name}
              className="bg-gray-800/80 backdrop-blur-sm border border-white/10 shadow-xl rounded-lg p-6 flex gap-6 items-start hover:bg-gray-800/90 transition-colors"
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

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="text-2xl font-semibold">
                    {project.name}
                  </h2>
                  {project.details?.profile?.tokens && 
                    Object.entries(project.details.profile.tokens).some(([_, token]) => 
                      token.symbol.trim() && token.name.trim() && token.icon?.small
                    ) && (
                    <div className="flex gap-2">
                      {Object.entries(project.details.profile.tokens)
                        .filter(([_, token]) => token.symbol.trim() && token.name.trim() && token.icon?.small)
                        .map(([symbol, token]) => {
                          const coingeckoUrl = `https://www.coingecko.com/en/coins/${token.name.toLowerCase().replace(/\s+/g, '-')}`;
                          const TokenContent = () => (
                            <>
                              <img 
                                src={token.icon.small} 
                                alt={token.name} 
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm font-medium">{symbol}</span>
                            </>
                          );

                          return (
                            <div key={symbol}>
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
                
                {project.details?.profile?.tagline && (
                  <p className="text-white/80 mb-4 text-lg">
                    {project.details.profile.tagline}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-4">
                  {project.details?.profile?.dapp && project.details.profile.dapp.trim() && (
                    <a
                      href={project.details.profile.dapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Launch App
                    </a>
                  )}
                  {project.details?.profile?.linktree?.website && project.details.profile.linktree.website.trim() && (
                    <a
                      href={project.details.profile.linktree.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {project.details?.profile?.linktree?.github && project.details.profile.linktree.github.trim() && (
                    <a
                      href={project.details.profile.linktree.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#171515] hover:bg-[#171515]/80 transition-colors text-white"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {project.details?.profile?.linktree?.twitter && project.details.profile.linktree.twitter.trim() && (
                    <a
                      href={project.details.profile.linktree.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-black hover:bg-black/80 transition-colors text-white"
                    >
                      <XIcon />
                      X
                    </a>
                  )}
                  {project.details?.profile?.linktree?.telegram && project.details.profile.linktree.telegram.trim() && (
                    <a
                      href={project.details.profile.linktree.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#229ED9] hover:bg-[#229ED9]/80 transition-colors text-white"
                    >
                      <TelegramIcon />
                      Telegram
                    </a>
                  )}
                  {project.details?.profile?.linktree?.discord && project.details.profile.linktree.discord.trim() && (
                    <a
                      href={project.details.profile.linktree.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#5865F2] hover:bg-[#5865F2]/80 transition-colors text-white"
                    >
                      <DiscordIcon />
                      Discord
                    </a>
                  )}
                  {project.details?.profile?.linktree?.medium && project.details.profile.linktree.medium.trim() && (
                    <a
                      href={project.details.profile.linktree.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#00AB6C] hover:bg-[#00AB6C]/80 transition-colors text-white"
                    >
                      <MediumIcon />
                      Medium
                    </a>
                  )}
                </div>

                {project.details?.profile?.description && (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      className="text-white/80"
                      components={{
                        p: ({node, ...props}) => <p className="mb-4 whitespace-pre-line" {...props} />,
                        a: ({node, ...props}) => (
                          <a 
                            className="text-primary hover:text-primary/80 transition-colors" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props}
                          />
                        ),
                        img: ({node, ...props}) => (
                          <img 
                            className="max-w-[500px] max-h-[400px] object-contain rounded-lg my-4" 
                            {...props}
                          />
                        ),
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-white/10 rounded p-4 mb-4 overflow-auto" {...props} />,
                        code: ({node, ...props}) => (
                          <code className="block bg-white/10 rounded p-4 mb-4" {...props} />
                        ),
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-l-4 border-primary/50 pl-4 italic mb-4" {...props} />
                        ),
                      }}
                    >
                      {project.details.profile.description
                        .replace(/\\r\\n/g, '\n')
                        .replace(/\\n/g, '\n')
                        .replace(/\r\n/g, '\n')
                      }
                    </ReactMarkdown>
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