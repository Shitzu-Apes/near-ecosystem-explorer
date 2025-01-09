import { Project } from "@/types/projects";

const phaseOrder = {
  mainnet: 0,
  development: 1,
  inactive: 3,
};

export const sortProjectsByScoreAndPhase = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    // First sort by lnc_score (higher scores first)
    if (a.lnc_score !== undefined && b.lnc_score !== undefined) {
      if (a.lnc_score !== b.lnc_score) {
        return b.lnc_score - a.lnc_score;
      }
    } else if (a.lnc_score !== undefined) {
      return -1; // a has score, b doesn't -> a comes first
    } else if (b.lnc_score !== undefined) {
      return 1; // b has score, a doesn't -> b comes first
    }

    // Then sort by phase
    const phaseA = phaseOrder[a.phase as keyof typeof phaseOrder] ?? 2; // null/empty phase gets 2
    const phaseB = phaseOrder[b.phase as keyof typeof phaseOrder] ?? 2;
    return phaseA - phaseB;
  });
};
