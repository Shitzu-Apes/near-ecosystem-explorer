import { Project } from "@/types/projects";

const phaseOrder = {
  mainnet: 0,
  development: 1,
  inactive: 3,
};

export const sortProjectsByPhase = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    const phaseA = phaseOrder[a.phase as keyof typeof phaseOrder] ?? 2; // null/empty phase gets 2
    const phaseB = phaseOrder[b.phase as keyof typeof phaseOrder] ?? 2;
    return phaseA - phaseB;
  });
};
