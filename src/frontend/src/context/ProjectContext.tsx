import { useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { Project } from "../backend";
import { useActor } from "../hooks/useActor";

interface ProjectContextValue {
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  projects: Project[];
  isLoadingProjects: boolean;
  refetchProjects: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProjects();
    },
    enabled: !!actor && !isFetching,
  });

  const setActiveProject = useCallback((p: Project | null) => {
    setActiveProjectState(p);
  }, []);

  const refetchProjects = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  }, [queryClient]);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        projects,
        isLoadingProjects: isLoading,
        refetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
