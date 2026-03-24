import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { ProjectStage } from "./backend";
import { ProjectProvider, useProject } from "./context/ProjectContext";
import { UnifiedExportModal } from "./context/UnifiedExportModal";
import { useActor } from "./hooks/useActor";
import { useExport } from "./hooks/useExport";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerBanStatus,
  useGetCallerUserProfile,
} from "./hooks/useQueries";
import { useRedHatGeneration } from "./hooks/useRedHatGeneration";

import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AISidebar from "./components/AISidebar";
import BanOverlay from "./components/BanOverlay";
import BottomPanel from "./components/BottomPanel";
import Canvas, {
  type CanvasFile,
  type GeneratedResult,
} from "./components/Canvas";
import DesignCanvas from "./components/DesignCanvas";
import EffectsMenu, { type EffectName } from "./components/EffectsMenu";
import EmojiPicker from "./components/EmojiPicker";
import GenerationModal from "./components/GenerationModal";
import LoginPrompt from "./components/LoginPrompt";
import ProfileSetup from "./components/ProfileSetup";
import ProjectHub from "./components/ProjectHub";
import Toolbar from "./components/Toolbar";
import VideoTimeline from "./components/VideoTimeline";

type AppView = "studio" | "hub" | "canvas" | "video";

const PIPELINE_STAGES = [
  { key: "idea", label: "IDEA", icon: "\uD83D\uDCA1" },
  { key: "script", label: "SCRIPT", icon: "\uD83D\uDCDC" },
  { key: "visuals", label: "VISUALS", icon: "\uD83C\uDFA8" },
  { key: "video", label: "VIDEO", icon: "\uD83C\uDFA6" },
  { key: "published", label: "PUBLISHED", icon: "\u26A1" },
];

// ── Project Selector ──────────────────────────────────────────────────────────

function ProjectSelector() {
  const {
    activeProject,
    setActiveProject,
    projects,
    isLoadingProjects,
    refetchProjects,
  } = useProject();
  const { actor } = useActor();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim() || !actor) return;
    setCreating(true);
    try {
      const id = await actor.createProject(newName.trim());
      refetchProjects();
      setNewName("");
      // Select new project
      const newProj = {
        id,
        title: newName.trim(),
        stage: ProjectStage.idea,
        scriptContent: "",
        designNotes: "",
        videoNotes: "",
        aiHistory: [],
        createdAt: BigInt(0),
        updatedAt: BigInt(0),
      };
      setActiveProject(newProj);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", zIndex: 20, flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-ocid="project_selector.open_modal_button"
        className="forge-btn flex items-center gap-2 px-3 py-1.5"
        style={{
          minWidth: "140px",
          maxWidth: "200px",
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          color: activeProject ? "oklch(0.75 0.18 40)" : "oklch(0.45 0.04 30)",
          borderColor: activeProject ? "oklch(0.4 0.12 38 / 0.7)" : undefined,
        }}
      >
        <span className="truncate flex-1 text-left">
          {activeProject ? activeProject.title : "SELECT PROJECT"}
        </span>
        <ChevronDown size={10} style={{ flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            data-ocid="project_selector.popover"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: "220px",
              background:
                "linear-gradient(135deg, oklch(0.12 0.01 20) 0%, oklch(0.15 0.012 22) 100%)",
              border: "1px solid oklch(0.35 0.1 25)",
              borderRadius: "4px",
              boxShadow:
                "0 8px 32px oklch(0 0 0 / 0.7), 0 0 20px oklch(0.4 0.15 25 / 0.2)",
              overflow: "hidden",
            }}
          >
            {/* Projects list */}
            <div style={{ maxHeight: "220px", overflowY: "auto" }}>
              {isLoadingProjects && (
                <div
                  data-ocid="project_selector.loading_state"
                  className="flex items-center justify-center py-4"
                >
                  <Loader2
                    size={14}
                    className="animate-spin"
                    style={{ color: "oklch(0.55 0.22 25)" }}
                  />
                </div>
              )}
              {!isLoadingProjects && projects.length === 0 && (
                <div
                  data-ocid="project_selector.empty_state"
                  style={{
                    padding: "12px 14px",
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.62rem",
                    color: "oklch(0.4 0.04 30)",
                    letterSpacing: "0.06em",
                  }}
                >
                  NO PROJECTS YET
                </div>
              )}
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveProject(p);
                    setOpen(false);
                  }}
                  data-ocid={`project_selector.item.${i + 1}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 14px",
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.04em",
                    color:
                      activeProject?.id === p.id
                        ? "oklch(0.75 0.25 25)"
                        : "oklch(0.75 0.03 30)",
                    background:
                      activeProject?.id === p.id
                        ? "oklch(0.18 0.04 22)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.1s",
                    borderBottom: "1px solid oklch(0.18 0.03 22)",
                  }}
                  onMouseEnter={(e) => {
                    if (activeProject?.id !== p.id)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.14 0.01 20)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeProject?.id !== p.id)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                  }}
                >
                  <span className="truncate">{p.title}</span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      color: "oklch(0.5 0.1 38)",
                      background: "oklch(0.12 0.008 20)",
                      border: "1px solid oklch(0.25 0.06 35 / 0.4)",
                      borderRadius: "2px",
                      padding: "1px 4px",
                      letterSpacing: "0.06em",
                      flexShrink: 0,
                      marginLeft: "6px",
                    }}
                  >
                    {p.stage.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            {/* New project input */}
            <div
              style={{
                borderTop: "1px solid oklch(0.22 0.04 25)",
                padding: "8px",
                display: "flex",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="New project name..."
                data-ocid="project_selector.input"
                style={{
                  flex: 1,
                  background: "oklch(0.08 0.005 20)",
                  border: "1px solid oklch(0.28 0.06 25)",
                  borderRadius: "3px",
                  padding: "5px 8px",
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.65rem",
                  color: "oklch(0.85 0.02 60)",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                data-ocid="project_selector.submit_button"
                className="forge-btn p-1.5"
                style={{ color: "oklch(0.65 0.22 25)", flexShrink: 0 }}
              >
                {creating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Plus size={12} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Pipeline Progress Bar ─────────────────────────────────────────────────────

function PipelineBar({
  onStageClick,
}: { onStageClick?: (stage: string) => void }) {
  const { activeProject } = useProject();
  const { actor } = useActor();
  const { refetchProjects, setActiveProject } = useProject();

  if (!activeProject) return null;

  const currentIdx = PIPELINE_STAGES.findIndex(
    (s) => s.key === activeProject.stage,
  );

  const handleStageClick = async (stageKey: string, _idx: number) => {
    if (!actor) return;
    await actor
      .updateProjectStage(activeProject.id, stageKey as ProjectStage)
      .catch(() => {});
    setActiveProject({ ...activeProject, stage: stageKey as ProjectStage });
    refetchProjects();
    onStageClick?.(stageKey);
  };

  return (
    <div
      className="relative z-10 flex items-center px-4 py-2 gap-0"
      style={{
        background: "oklch(0.08 0.006 20)",
        borderBottom: "1px solid oklch(0.2 0.05 25)",
      }}
    >
      {/* Project label */}
      <span
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          color: "oklch(0.45 0.06 30)",
          marginRight: "12px",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        PIPELINE:
      </span>

      {/* Steps */}
      <div className="flex items-center flex-1 gap-0">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;
          const color = isActive
            ? "oklch(0.65 0.28 25)"
            : isDone
              ? "oklch(0.5 0.14 38)"
              : "oklch(0.35 0.04 30)";

          return (
            <React.Fragment key={stage.key}>
              <button
                type="button"
                onClick={() => handleStageClick(stage.key, idx)}
                data-ocid={`pipeline.${stage.key}.button`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 8px",
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color,
                  background: isActive ? "oklch(0.14 0.03 22)" : "transparent",
                  border: `1px solid ${isActive ? "oklch(0.45 0.2 25 / 0.6)" : "transparent"}`,
                  borderRadius: "3px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  boxShadow: isActive
                    ? "0 0 10px oklch(0.45 0.22 25 / 0.3)"
                    : undefined,
                  textShadow: isActive
                    ? "0 0 8px oklch(0.55 0.25 25 / 0.6)"
                    : undefined,
                }}
              >
                <span>{stage.icon}</span>
                <span className="hidden sm:inline">{stage.label}</span>
              </button>
              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      idx < currentIdx
                        ? "oklch(0.5 0.14 38 / 0.6)"
                        : "oklch(0.22 0.04 25)",
                    minWidth: "8px",
                    maxWidth: "40px",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── AppContent (inside ProjectProvider) ───────────────────────────────────────

function AppContent() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { activeProject } = useProject();

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isBanned, isLoading: banLoading } = useGetCallerBanStatus();
  const { generate, isGenerating } = useRedHatGeneration();
  const { exportContent } = useExport();

  const [view, setView] = useState<AppView>("studio");
  const [canvasFiles, setCanvasFiles] = useState<CanvasFile[]>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>(
    [],
  );
  const [dragonPower, setDragonPower] = useState(75);
  const [statusText, setStatusText] = useState("AWAITING COMMAND");
  const [activeEffect, setActiveEffect] = useState<EffectName>(null);
  const [effectsMenuOpen, setEffectsMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState<
    "music" | "video" | "ignite" | null
  >(null);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleViolation = useCallback(() => {
    if (!isAuthenticated) return;
    queryClient.invalidateQueries({ queryKey: ["isBanned"] });
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        if (canvasFiles.length > 0 || generatedResults.length > 0)
          handleViolation();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvasFiles.length, generatedResults.length, handleViolation]);

  const handleFilesAdded = useCallback((newFiles: CanvasFile[]) => {
    setCanvasFiles((prev) => [...prev, ...newFiles]);
    setStatusText(`${newFiles.length} FILE(S) LOADED`);
  }, []);

  const handleUploadPhoto = () => {
    if (!isAuthenticated) return;
    photoInputRef.current?.click();
  };
  const handleUploadVideo = () => {
    if (!isAuthenticated) return;
    videoInputRef.current?.click();
  };

  const processFileInput = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const processed: CanvasFile[] = await Promise.all(
      arr.map(async (file) => {
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : file.type.startsWith("audio/")
              ? "audio"
              : file.type === "text/plain" || file.name.endsWith(".txt")
                ? "text"
                : "other";
        let previewUrl: string | undefined;
        let textContent: string | undefined;
        if (type === "image" || type === "video" || type === "audio")
          previewUrl = URL.createObjectURL(file);
        else if (type === "text") textContent = await file.text();
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          type: type as CanvasFile["type"],
          previewUrl,
          textContent,
        };
      }),
    );
    handleFilesAdded(processed);
  };

  const handleMusicGen = () => {
    if (!isAuthenticated) return;
    setGenModalOpen("music");
  };
  const handleVideoGen = () => {
    if (!isAuthenticated) return;
    setGenModalOpen("video");
  };

  const handleGenSubmit = async (seed: string) => {
    const type = genModalOpen;
    if (!type) return;
    setGenModalOpen(null);
    setStatusText("GENERATING...");
    const result = await generate({
      type: type === "ignite" ? "ignite" : type,
      seed,
      power: dragonPower,
      files: canvasFiles.map((f) => ({
        name: f.file.name,
        fileType: f.file.type,
        size: f.file.size,
      })),
    });
    if (result) {
      setGeneratedResults((prev) => [
        ...prev,
        {
          id: `gen-${Date.now()}`,
          type: type === "ignite" ? "ignite" : type,
          url: result.url,
          blob: result.blob,
          message: result.message,
          isDemo: result.isDemo,
        },
      ]);
      setStatusText("COMPLETE");
    } else {
      setStatusText("ERROR");
    }
  };

  const handleIgnite = () => {
    if (!isAuthenticated) return;
    const textFile = canvasFiles.find((f) => f.type === "text");
    if (textFile?.textContent)
      handleIgniteWithSeed(textFile.textContent.slice(0, 500));
    else setGenModalOpen("ignite");
  };

  const handleIgniteWithSeed = async (seed: string) => {
    setStatusText("IGNITING...");
    const result = await generate({
      type: "ignite",
      seed,
      power: dragonPower,
      files: canvasFiles.map((f) => ({
        name: f.file.name,
        fileType: f.file.type,
        size: f.file.size,
      })),
    });
    if (result) {
      setGeneratedResults((prev) => [
        ...prev,
        {
          id: `ignite-${Date.now()}`,
          type: "ignite",
          url: result.url,
          blob: result.blob,
          message: result.message,
          isDemo: result.isDemo,
        },
      ]);
      setStatusText("COMPLETE");
    } else {
      setStatusText("ERROR");
    }
  };

  const handleExport = () => {
    const hasContent = canvasFiles.length > 0 || generatedResults.length > 0;
    if (!hasContent) return;
    const latestGen = generatedResults[generatedResults.length - 1];
    const firstFile = canvasFiles[0];
    if (latestGen)
      exportContent({
        blob: latestGen.blob,
        url: latestGen.url,
        fileName: `void-${latestGen.type}-creation`,
        mimeType:
          latestGen.type === "music" || latestGen.type === "ignite"
            ? "audio/mpeg"
            : "video/mp4",
      });
    else if (firstFile)
      exportContent({
        blob: firstFile.file,
        fileName: firstFile.file.name,
        mimeType: firstFile.file.type,
      });
    setStatusText("EXPORT COMPLETE");
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCanvasFiles([]);
    setGeneratedResults([]);
    setStatusText("AWAITING COMMAND");
    setView("studio");
    setAiSidebarOpen(false);
  };

  if (isInitializing || (isAuthenticated && banLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.06 0.005 20)" }}
      >
        <div className="text-center">
          <img
            src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
            alt=""
            className="w-16 h-16 mx-auto mb-4 animate-crack-glow"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.65 0.28 25))" }}
          />
          <p className="gothic-label text-sm animate-ember-flicker">
            AWAKENING THE VOID...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPrompt />;
  if (isAuthenticated && isBanned) return <BanOverlay />;
  if (showProfileSetup) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "oklch(0.06 0.005 20)" }}
      >
        <ProfileSetup
          onComplete={() =>
            queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] })
          }
        />
      </div>
    );
  }

  const hasContent = canvasFiles.length > 0 || generatedResults.length > 0;
  const principalShort = `${identity?.getPrincipal().toString().slice(0, 12)}...`;
  const isReadyToPublish = activeProject && activeProject.stage === "video";

  const navBtnStyle = (active: boolean) => ({
    color: active ? "oklch(0.75 0.25 25)" : "oklch(0.5 0.06 30)",
    borderColor: active ? "oklch(0.5 0.2 25)" : "oklch(0.25 0.04 25)",
    boxShadow: active
      ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
      : undefined,
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.06 0.005 20)" }}
    >
      {/* Dragon face background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "url(/assets/generated/gargoyle-dragon-face.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          opacity: 0.08,
          filter: "brightness(0.4) contrast(1.5) saturate(0.5)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, transparent 30%, oklch(0.04 0.002 20 / 0.7) 100%)",
        }}
      />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 stone-panel px-4 py-3 flex items-center gap-3"
        style={{
          borderBottom: "1px solid oklch(0.3 0.08 25)",
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
            alt="Void Metal Studio"
            className="w-8 h-8 animate-crack-glow"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.65 0.28 25))" }}
          />
          <div className="hidden md:block">
            <h1 className="gothic-title text-lg leading-none">
              VOID METAL STUDIO
            </h1>
            <p
              className="font-cinzel text-xs"
              style={{ color: "oklch(0.5 0.08 35)", letterSpacing: "0.15em" }}
            >
              FOREVERRAW
            </p>
          </div>
        </div>

        {/* Project selector */}
        <ProjectSelector />

        {/* Nav */}
        <nav
          className="flex items-center gap-1 flex-wrap flex-1"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => setView("studio")}
            data-ocid="nav.studio.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={navBtnStyle(view === "studio")}
            aria-current={view === "studio" ? "page" : undefined}
          >
            \uD83D\uDD25 STUDIO
          </button>
          <button
            type="button"
            onClick={() => setView("hub")}
            data-ocid="nav.hub.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={navBtnStyle(view === "hub")}
            aria-current={view === "hub" ? "page" : undefined}
          >
            \u2694 FORGE HUB
          </button>
          <button
            type="button"
            onClick={() => setView("canvas")}
            data-ocid="design_canvas.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={navBtnStyle(view === "canvas")}
            aria-current={view === "canvas" ? "page" : undefined}
          >
            \uD83C\uDFA8 DESIGN
          </button>
          <button
            type="button"
            onClick={() => setView("video")}
            data-ocid="nav.video.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={navBtnStyle(view === "video")}
            aria-current={view === "video" ? "page" : undefined}
          >
            \uD83C\uDFA6 VIDEO
          </button>
          <button
            type="button"
            onClick={() => setAiSidebarOpen((v) => !v)}
            data-ocid="nav.ai_sidebar.toggle"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={navBtnStyle(aiSidebarOpen)}
            aria-pressed={aiSidebarOpen}
          >
            \uD83D\uDC09 AI SCRIBE
          </button>

          {/* Publish button */}
          {activeProject && (
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              data-ocid="publish.open_modal_button"
              className="forge-btn px-3 py-1.5 text-xs tracking-widest"
              style={{
                color: "oklch(0.8 0.02 60)",
                borderColor: "oklch(0.5 0.22 25 / 0.7)",
                background:
                  "linear-gradient(180deg, oklch(0.25 0.1 25) 0%, oklch(0.16 0.07 22) 100%)",
                animation: isReadyToPublish
                  ? "ignite-pulse 2s ease-in-out infinite"
                  : undefined,
              }}
            >
              \u26A1 PUBLISH
            </button>
          )}
        </nav>

        {/* User info + logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <img
              src="/assets/generated/emoji-dragon-shield.dim_128x128.png"
              alt=""
              className="w-5 h-5"
              style={{
                filter: "drop-shadow(0 0 4px oklch(0.55 0.25 25 / 0.5))",
              }}
            />
            <span
              className="font-cinzel text-xs"
              style={{ color: "oklch(0.55 0.08 30)", letterSpacing: "0.06em" }}
            >
              {userProfile?.name ?? principalShort}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="nav.logout.button"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{ color: "oklch(0.5 0.05 25)" }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* ── PIPELINE BAR ── */}
      <PipelineBar
        onStageClick={(stage) => {
          if (stage === "idea" || stage === "script") setView("studio");
          else if (stage === "visuals") setView("canvas");
          else if (stage === "video") setView("video");
        }}
      />

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-1 flex flex-col">
        {view === "canvas" ? (
          <DesignCanvas activeProject={activeProject} />
        ) : view === "video" ? (
          <VideoTimeline activeProject={activeProject} />
        ) : view === "hub" ? (
          <div className="flex flex-1">
            <div className="flex-1">
              <ProjectHub onNavigate={(v) => setView(v)} />
            </div>
            <AISidebar
              isOpen={aiSidebarOpen}
              onClose={() => setAiSidebarOpen(false)}
              activeProject={activeProject}
            />
          </div>
        ) : (
          <div className="flex flex-1 gap-0">
            <div className="flex-1 flex flex-col gap-3 p-3 md:p-4 min-w-0">
              <Toolbar
                onUploadPhoto={handleUploadPhoto}
                onUploadVideo={handleUploadVideo}
                onMusicGen={handleMusicGen}
                onVideoGen={handleVideoGen}
                onExport={handleExport}
                canExport={hasContent}
                isAuthenticated={isAuthenticated}
              />
              <div className="relative flex justify-center">
                <button
                  type="button"
                  onClick={() => setEffectsMenuOpen((v) => !v)}
                  className="forge-btn flex items-center gap-2 px-6 py-2 text-xs tracking-widest"
                  style={
                    activeEffect
                      ? {
                          borderColor: "oklch(0.55 0.22 25)",
                          color: "oklch(0.75 0.25 25)",
                        }
                      : {}
                  }
                >
                  <img
                    src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
                    alt=""
                    className="w-5 h-5"
                    style={{
                      filter: "drop-shadow(0 0 6px oklch(0.65 0.28 25 / 0.7))",
                    }}
                  />
                  EFFECTS
                  {activeEffect && (
                    <span
                      className="ml-1 text-xs"
                      style={{ color: "oklch(0.65 0.22 42)" }}
                    >
                      [{activeEffect.toUpperCase().replace("-", " ")}]
                    </span>
                  )}
                </button>
                <EffectsMenu
                  isOpen={effectsMenuOpen}
                  activeEffect={activeEffect}
                  onSelectEffect={setActiveEffect}
                  onClose={() => setEffectsMenuOpen(false)}
                />
              </div>
              <Canvas
                activeEffect={activeEffect}
                onViolation={handleViolation}
                files={canvasFiles}
                generatedResults={generatedResults}
                onFilesAdded={handleFilesAdded}
                isAuthenticated={isAuthenticated}
              />
              <BottomPanel
                dragonPower={dragonPower}
                onDragonPowerChange={setDragonPower}
                onIgnite={handleIgnite}
                statusText={statusText}
                isGenerating={isGenerating}
                isAuthenticated={isAuthenticated}
              />
            </div>
            <AISidebar
              isOpen={aiSidebarOpen}
              onClose={() => setAiSidebarOpen(false)}
              activeProject={activeProject}
            />
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 stone-panel px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{
          borderTop: "1px solid oklch(0.25 0.06 25)",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiPickerOpen((v) => !v)}
              className="forge-btn flex items-center gap-1.5 px-3 py-1.5 text-xs"
              title="ForeverRaw Emoji Picker"
            >
              <img
                src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
                alt=""
                className="w-4 h-4"
              />
              <span className="tracking-widest">EMOJIS</span>
            </button>
            <EmojiPicker
              isOpen={emojiPickerOpen}
              onSelect={(symbol) => {
                navigator.clipboard.writeText(symbol).catch(() => {});
                setStatusText(`EMOJI COPIED: ${symbol}`);
                setTimeout(() => setStatusText("AWAITING COMMAND"), 2000);
              }}
              onClose={() => setEmojiPickerOpen(false)}
            />
          </div>
          <span
            className="font-cinzel text-xs"
            style={{ color: "oklch(0.35 0.04 25)", letterSpacing: "0.08em" }}
          >
            © {new Date().getFullYear()} VOID METAL STUDIO · FOREVERRAW
          </span>
        </div>
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "void-metal-studio")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-cinzel text-xs flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{ color: "oklch(0.45 0.08 30)", letterSpacing: "0.06em" }}
        >
          <img
            src="/assets/generated/emoji-raw-heart.dim_128x128.png"
            alt="\u2665"
            className="w-4 h-4"
            style={{ filter: "drop-shadow(0 0 3px oklch(0.55 0.25 25 / 0.5))" }}
          />
          Built with love using caffeine.ai
        </a>
      </footer>

      {/* Modals */}
      {genModalOpen && (
        <GenerationModal
          type={genModalOpen}
          isOpen={true}
          onClose={() => setGenModalOpen(null)}
          onSubmit={handleGenSubmit}
          isGenerating={isGenerating}
        />
      )}
      {activeProject && publishModalOpen && (
        <UnifiedExportModal
          isOpen={publishModalOpen}
          onClose={() => setPublishModalOpen(false)}
          project={activeProject}
        />
      )}

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.01 20)",
            border: "1px solid oklch(0.35 0.12 25)",
            color: "oklch(0.85 0.02 60)",
            fontFamily: "Cinzel, serif",
          },
        }}
      />

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          processFileInput(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          processFileInput(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── App (with ProjectProvider) ─────────────────────────────────────────────────

export default function App() {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
}
