import {
  ProjectsResponse,
  ProjectDetailsResponse,
  Projects,
  Project,
} from "@/types/projects";

// Helper to check if we're on the server side
const isServer = () => {
  return typeof document === "undefined";
};

// Function to get KV from loader context (used on server side)
export const getKVFromContext = (context: { PROJECTS_KV?: KVNamespace }) => {
  return context.PROJECTS_KV;
};

async function updateProjects(context?: { PROJECTS_KV?: KVNamespace }) {
  const kv = isServer() ? context?.PROJECTS_KV : undefined;

  const response = await fetch("https://api.nearcatalog.xyz/projects");
  if (!response.ok) {
    console.error(
      "Failed to fetch projects",
      response.status,
      await response.text()
    );
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json<ProjectsResponse>();

  const projects = Object.fromEntries(
    (await chunkedFetchProjectDetails(Object.keys(data), 10, context)).map(
      ({ slug, profile }) => [
        slug,
        {
          id: slug,
          name: profile.name,
          image: profile.image.url,
          tagline: profile.tagline,
          description: profile.description,
          tags: profile.tags,
          dapp: profile.dapp,
          linktree: profile.linktree,
          phase: profile.phase ? profile.phase : undefined,
          lnc_score: profile.lnc ? profile.lnc.score : undefined,
          tokens: profile.tokens,
        } satisfies Project,
      ]
    )
  );

  if (kv) {
    await kv.put("projects", JSON.stringify(projects), {
      expirationTtl: 60 * 60 * 24,
    });
    await kv.put("projectsTimestamp", JSON.stringify(Date.now()), {
      expirationTtl: 60 * 60 * 24,
    });
  }

  return projects;
}

export async function fetchProjects(context?: {
  PROJECTS_KV?: KVNamespace;
}): Promise<Projects> {
  try {
    const kv = isServer() ? context?.PROJECTS_KV : undefined;
    if (kv) {
      const cached = await kv.get<Projects>("projects", { type: "json" });
      if (cached) {
        const projectsTimestamp = await kv.get<number>(
          "projectsTimestamp",
          "json"
        );
        if (projectsTimestamp < Date.now() + 1_000 * 60 * 60 * 2) {
          updateProjects(context);
        }
        return cached;
      }
    }

    return updateProjects(context);
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

async function fetchProjectDetails(
  projectId: string,
  context?: { PROJECTS_KV?: KVNamespace }
): Promise<ProjectDetailsResponse | null> {
  try {
    const kv = isServer() ? context?.PROJECTS_KV : undefined;
    if (kv) {
      const cacheKey = `project:${projectId}`;
      const cached = await kv.get(cacheKey, { type: "json" });
      if (cached) {
        return cached as ProjectDetailsResponse;
      }
    }

    // If not in cache or on client side, fetch from API
    const response = await fetch(
      `https://api.nearcatalog.xyz/project?pid=${encodeURIComponent(projectId)}`
    );
    if (!response.ok) return null;
    const data = await response.json<ProjectDetailsResponse>();

    // Cache the result if on server side
    if (kv) {
      const cacheKey = `project:${projectId}`;
      await kv.put(cacheKey, JSON.stringify(data), {
        expirationTtl: 60 * 60 * 2,
      });
    }

    return data;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}

async function chunkedFetchProjectDetails(
  projectIds: string[],
  chunkSize: number,
  context?: {
    PROJECTS_KV?: KVNamespace;
  }
): Promise<ProjectDetailsResponse[]> {
  const results: ProjectDetailsResponse[] = [];

  // Helper function to fetch a single chunk
  const fetchChunk = async (chunk: string[]) => {
    const promises = chunk.map((projectId) =>
      fetchProjectDetails(projectId, context)
    );
    return Promise.all(promises);
  };

  for (let i = 0; i < projectIds.length; i += chunkSize) {
    const chunk = projectIds.slice(i, i + chunkSize);
    const chunkResults = await fetchChunk(chunk);
    results.push(
      ...chunkResults.filter(
        (project) => project != null && project.profile != null
      )
    );
  }

  return results;
}
