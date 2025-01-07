import { Project, ProjectsResponse, CategorizedProjects } from '@/types/projects';

export const categoryColors: { [key: string]: string } = {
  community: "bg-violet-600",
  dapp: "bg-blue-600",
  defi: "bg-indigo-600",
  dex: "bg-purple-600",
  "ecosystem-support": "bg-green-600",
  infrastructure: "bg-emerald-600",
  launchpad: "bg-pink-600",
  nft: "bg-fuchsia-600",
  other: "bg-gray-600",
  utilities: "bg-slate-600",
  "aurora-virtual-chain": "bg-amber-600",
  bitcoin: "bg-orange-600",
  accelerator: "bg-red-600",
  ai: "bg-cyan-600",
  analytics: "bg-teal-600",
  "asset-management": "bg-sky-600",
  audit: "bg-rose-600",
  aurora: "bg-yellow-600",
  "borrowing-lending": "bg-lime-600",
  bos: "bg-green-500",
  bot: "bg-blue-500",
  bounty: "bg-purple-500",
  bridge: "bg-indigo-500",
  cex: "bg-violet-500",
  "chain-abstraction": "bg-fuchsia-500",
  compliance: "bg-pink-500",
  "cross-chain-router": "bg-rose-500",
  custodian: "bg-orange-500",
  dao: "bg-amber-500",
  "data-availability": "bg-emerald-500",
  desci: "bg-cyan-500",
  "developer-support": "bg-teal-500",
  "developer-tooling": "bg-sky-500",
  education: "bg-blue-700",
  enterprise: "bg-indigo-700",
  event: "bg-violet-700",
  explorer: "bg-purple-700",
  "funding-node": "bg-fuchsia-700",
  game: "bg-pink-700",
  identity: "bg-rose-700",
  indexer: "bg-orange-700",
  "liquid-staking": "bg-amber-700",
  loyalty: "bg-yellow-700",
  marketplace: "bg-lime-700",
  memecoin: "bg-green-700",
  messaging: "bg-emerald-700",
  mobile: "bg-teal-700",
  music: "bg-cyan-700",
  "on-off-ramp": "bg-sky-700",
  oracles: "bg-blue-800",
  payment: "bg-indigo-800",
  privacy: "bg-violet-800",
  "productivity-tool": "bg-purple-800",
  "regional-hub": "bg-fuchsia-800",
  restaking: "bg-pink-800",
  rpc: "bg-rose-800",
  rwa: "bg-orange-800",
  security: "bg-amber-800",
  "service-provider": "bg-yellow-800",
  social: "bg-lime-800",
  sport: "bg-green-800",
  stablecoin: "bg-emerald-800",
  storage: "bg-teal-800",
  validator: "bg-cyan-800",
  wallet: "bg-sky-800",
  "zero-knowledge": "bg-blue-900"
};

export const categorizeProjects = (projectsData: ProjectsResponse): CategorizedProjects => {
  const categories: CategorizedProjects = {};

  // First, calculate total projects per tag for better distribution
  const tagCounts = new Map<string, number>();
  Object.values(projectsData).forEach((project) => {
    Object.keys(project.profile.tags).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Sort projects by number of tags to help with distribution
  const sortedProjects = Object.values(projectsData).sort((a, b) => 
    Object.keys(b.profile.tags).length - Object.keys(a.profile.tags).length
  );

  // Distribute projects evenly across categories
  sortedProjects.forEach((project) => {
    // Sort tags by count to prioritize smaller categories
    const projectTags = Object.keys(project.profile.tags)
      .sort((a, b) => (tagCounts.get(a) || 0) - (tagCounts.get(b) || 0));

    projectTags.forEach((tag) => {
      if (!categories[tag]) {
        categories[tag] = {
          title: project.profile.tags[tag],
          color: categoryColors[tag] || "bg-gray-500",
          projects: []
        };
      }
      if (!categories[tag].projects.find(p => p.name === project.profile.name)) {
        categories[tag].projects.push({
          name: project.profile.name,
          image: project.profile.image.url,
          tagline: project.profile.tagline
        });
      }
    });
  });

  // Sort categories by size for better visual distribution
  return Object.fromEntries(
    Object.entries(categories)
      .sort((a, b) => Math.abs(5 - a[1].projects.length) - Math.abs(5 - b[1].projects.length))
  );
};