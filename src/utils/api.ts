import { ProjectsResponse, ProjectDetails } from "@/types/projects";

// Helper to check if we're on the server side
const isServer = () => {
  return typeof document === "undefined";
};

// Helper to get KV from context if available
const getKV = async () => {
  if (!isServer()) return null;

  try {
    // On server side, we should get the KV from the loader context
    // This will be handled by the loader function
    return null;
  } catch (error) {
    console.error("Error getting KV:", error);
    return null;
  }
};

// Function to get KV from loader context (used on server side)
export const getKVFromContext = (context: { PROJECTS_KV?: KVNamespace }) => {
  return context.PROJECTS_KV;
};

export async function fetchProjects(context?: {
  PROJECTS_KV?: KVNamespace;
}): Promise<ProjectsResponse> {
  try {
    // Try to get from KV if on server side
    const kv = isServer() ? getKVFromContext(context || {}) : await getKV();
    if (kv) {
      const cached = await kv.get("projects", { type: "json" });
      if (cached) {
        return cached as ProjectsResponse;
      }
    }

    // If not in cache or on client side, fetch from API
    const response = await fetch("https://api.nearcatalog.xyz/projects");
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    const data = await response.json();

    // Cache the result if on server side
    if (kv) {
      await kv.put("projects", JSON.stringify(data), {
        expirationTtl: 86400, // 24 hours in seconds
      });
    }

    return data as ProjectsResponse;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function fetchProjectDetails(
  projectId: string,
  context?: { PROJECTS_KV?: KVNamespace }
): Promise<ProjectDetails | null> {
  try {
    // Try to get from KV if on server side
    const kv = isServer() ? getKVFromContext(context || {}) : await getKV();
    if (kv) {
      const cacheKey = `project:${projectId}`;
      const cached = await kv.get(cacheKey, { type: "json" });
      if (cached) {
        return cached as ProjectDetails;
      }
    }

    // If not in cache or on client side, fetch from API
    const response = await fetch(
      `https://api.nearcatalog.xyz/project?pid=${encodeURIComponent(projectId)}`
    );
    if (!response.ok) return null;
    const data = await response.json();

    // Cache the result if on server side
    if (kv) {
      const cacheKey = `project:${projectId}`;
      await kv.put(cacheKey, JSON.stringify(data), {
        expirationTtl: 86400, // 24 hours in seconds
      });
    }

    return data as ProjectDetails;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
}
