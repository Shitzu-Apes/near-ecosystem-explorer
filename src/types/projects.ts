export interface Project {
  id: string;
  name: string;
  image: string;
  tagline: string;
  description?: string;
  tags: {
    [key: string]: string;
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
  phase?: "mainnet" | "inactive" | "still building";
  lnc_score?: number;
  tokens?: Record<string, Token>;
}

export interface Category {
  title: string;
  color: string;
  projects: Project[];
  isPriority: boolean;
}

export type CategorizedProjects = Record<string, Category>;

export interface Projects {
  [key: string]: Project;
}

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
      lnc?:
        | {
            score: number;
            slug: string;
          }
        | "";
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
  address?: {
    near?: string;
    aurora?: string;
  };
  platform?: {
    coingecko?: string;
  };
}

export interface ProjectDetailsResponse {
  slug: string;
  profile: {
    name: string;
    tagline: string;
    description: string;
    image: {
      url: string;
    };
    tags: {
      [key: string]: string;
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
    lnc?:
      | {
          score: number;
          slug: string;
        }
      | "";
    phase?: "mainnet" | "inactive" | "still building" | "";
    tokens?: Record<string, Token>;
  };
}
