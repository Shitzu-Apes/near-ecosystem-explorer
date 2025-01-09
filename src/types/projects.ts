export interface Project {
  id: string;
  name: string;
  image: string;
  description?: string;
  links?: string[];
  details?: ProjectDetails;
  phase?: "mainnet" | "inactive" | "still building";
}

export interface Category {
  title: string;
  color: string;
  projects: Project[];
  isPriority: boolean;
}

export type CategorizedProjects = Record<string, Category>;

export interface ProjectsResponse {
  [key: string]: {
    slug: string;
    profile: {
      name: string;
      image: {
        url: string;
      };
      tagline: string;
      tags: {
        [key: string]: string;
      };
      published_date: number;
      phase?: "mainnet" | "inactive" | "still building" | "";
    };
  };
}

interface Token {
  symbol: string;
  name: string;
  icon?: {
    small: string;
  };
}

export interface ProjectDetails {
  slug: string;
  profile: {
    name: string;
    tagline: string;
    description: string;
    image: {
      url: string;
    };
    dapp?: string;
    linktree?: {
      website?: string;
      twitter?: string;
      medium?: string;
      telegram?: string;
      discord?: string;
      github?: string;
      nearsocial?: string;
    };
    tokens?: Record<string, Token>;
  };
}
