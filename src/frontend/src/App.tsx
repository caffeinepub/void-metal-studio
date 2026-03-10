import { useQueryClient } from "@tanstack/react-query";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useExport } from "./hooks/useExport";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerBanStatus,
  useGetCallerUserProfile,
} from "./hooks/useQueries";
import { useRedHatGeneration } from "./hooks/useRedHatGeneration";

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

export default function App() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  // Backend hooks
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const { data: isBanned, isLoading: banLoading } = useGetCallerBanStatus();
  const { generate, isGenerating } = useRedHatGeneration();
  const { exportContent } = useExport();

  // View state
  const [view, setView] = useState<AppView>("studio");

  // Canvas state
  const [canvasFiles, setCanvasFiles] = useState<CanvasFile[]>([]);
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>(
    [],
  );

  // UI state
  const [dragonPower, setDragonPower] = useState(75);
  const [statusText, setStatusText] = useState("AWAITING COMMAND");
  const [activeEffect, setActiveEffect] = useState<EffectName>(null);
  const [effectsMenuOpen, setEffectsMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [genModalOpen, setGenModalOpen] = useState<
    "music" | "video" | "ignite" | null
  >(null);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  // Hub content from AI Scribe
  const [hubAIContent, setHubAIContent] = useState<string[]>([]);

  // File input refs for toolbar buttons
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Show profile setup modal
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  // ─── Content Protection ─────────────────────────────────────────────────────

  const handleViolation = useCallback(() => {
    if (!isAuthenticated) return;
    queryClient.invalidateQueries({ queryKey: ["isBanned"] });
  }, [isAuthenticated, queryClient]);

  // Global keyboard protection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        if (canvasFiles.length > 0 || generatedResults.length > 0) {
          handleViolation();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canvasFiles.length, generatedResults.length, handleViolation]);

  // ─── File Upload Handlers ──────────────────────────────────────────────────────

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

        if (type === "image" || type === "video" || type === "audio") {
          previewUrl = URL.createObjectURL(file);
        } else if (type === "text") {
          textContent = await file.text();
        }

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

  // ─── Generation Handlers ──────────────────────────────────────────────────────

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
      const genResult: GeneratedResult = {
        id: `gen-${Date.now()}`,
        type: type === "ignite" ? "ignite" : type,
        url: result.url,
        blob: result.blob,
        message: result.message,
        isDemo: result.isDemo,
      };
      setGeneratedResults((prev) => [...prev, genResult]);
      setStatusText("COMPLETE");
    } else {
      setStatusText("ERROR");
    }
  };

  // ─── IGNITE ───────────────────────────────────────────────────────────────────

  const handleIgnite = () => {
    if (!isAuthenticated) return;
    const textFile = canvasFiles.find((f) => f.type === "text");
    if (textFile?.textContent) {
      handleIgniteWithSeed(textFile.textContent.slice(0, 500));
    } else {
      setGenModalOpen("ignite");
    }
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
      const genResult: GeneratedResult = {
        id: `ignite-${Date.now()}`,
        type: "ignite",
        url: result.url,
        blob: result.blob,
        message: result.message,
        isDemo: result.isDemo,
      };
      setGeneratedResults((prev) => [...prev, genResult]);
      setStatusText("COMPLETE");
    } else {
      setStatusText("ERROR");
    }
  };

  // ─── Export ───────────────────────────────────────────────────────────────────

  const handleExport = () => {
    const hasContent = canvasFiles.length > 0 || generatedResults.length > 0;
    if (!hasContent) return;

    const latestGen = generatedResults[generatedResults.length - 1];
    const firstFile = canvasFiles[0];

    if (latestGen) {
      exportContent({
        blob: latestGen.blob,
        url: latestGen.url,
        fileName: `void-${latestGen.type}-creation`,
        mimeType:
          latestGen.type === "music" || latestGen.type === "ignite"
            ? "audio/mpeg"
            : "video/mp4",
      });
    } else if (firstFile) {
      exportContent({
        blob: firstFile.file,
        fileName: firstFile.file.name,
        mimeType: firstFile.file.type,
      });
    }

    setStatusText("EXPORT COMPLETE");
  };

  // ─── AI Scribe ────────────────────────────────────────────────────────────────

  const handleSendToHub = useCallback((content: string) => {
    setHubAIContent((prev) => [...prev, content]);
    setStatusText("CONTENT SENT TO HUB");
    setTimeout(() => setStatusText("AWAITING COMMAND"), 2500);
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setCanvasFiles([]);
    setGeneratedResults([]);
    setStatusText("AWAITING COMMAND");
    setView("studio");
    setAiSidebarOpen(false);
  };

  // ─── Render Guards ───────────────────────────────────────────────────────────

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

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  if (isAuthenticated && isBanned) {
    return <BanOverlay />;
  }

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

      {/* Vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, transparent 30%, oklch(0.04 0.002 20 / 0.7) 100%)",
        }}
      />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 stone-panel px-4 py-3 flex items-center justify-between gap-3"
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
          <div>
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

        {/* ── View Nav + AI Scribe Toggle ── */}
        <nav
          className="flex items-center gap-1 flex-wrap"
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => setView("studio")}
            data-ocid="nav.studio.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{
              color:
                view === "studio"
                  ? "oklch(0.75 0.25 25)"
                  : "oklch(0.5 0.06 30)",
              borderColor:
                view === "studio" ? "oklch(0.5 0.2 25)" : "oklch(0.25 0.04 25)",
              boxShadow:
                view === "studio"
                  ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
                  : undefined,
            }}
            aria-current={view === "studio" ? "page" : undefined}
          >
            🔥 STUDIO
          </button>
          <button
            type="button"
            onClick={() => setView("hub")}
            data-ocid="nav.hub.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{
              color:
                view === "hub" ? "oklch(0.75 0.25 25)" : "oklch(0.5 0.06 30)",
              borderColor:
                view === "hub" ? "oklch(0.5 0.2 25)" : "oklch(0.25 0.04 25)",
              boxShadow:
                view === "hub"
                  ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
                  : undefined,
            }}
            aria-current={view === "hub" ? "page" : undefined}
          >
            ⚔ FORGE HUB
          </button>

          <button
            type="button"
            onClick={() => setView("canvas")}
            data-ocid="design_canvas.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{
              color:
                view === "canvas"
                  ? "oklch(0.75 0.25 25)"
                  : "oklch(0.5 0.06 30)",
              borderColor:
                view === "canvas" ? "oklch(0.5 0.2 25)" : "oklch(0.25 0.04 25)",
              boxShadow:
                view === "canvas"
                  ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
                  : undefined,
            }}
            aria-current={view === "canvas" ? "page" : undefined}
          >
            🎨 DESIGN
          </button>

          <button
            type="button"
            onClick={() => setView("video")}
            data-ocid="nav.video.tab"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{
              color:
                view === "video" ? "oklch(0.75 0.25 25)" : "oklch(0.5 0.06 30)",
              borderColor:
                view === "video" ? "oklch(0.5 0.2 25)" : "oklch(0.25 0.04 25)",
              boxShadow:
                view === "video"
                  ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
                  : undefined,
            }}
            aria-current={view === "video" ? "page" : undefined}
          >
            🎬 VIDEO
          </button>

          {/* AI Scribe Toggle */}
          <button
            type="button"
            onClick={() => setAiSidebarOpen((v) => !v)}
            data-ocid="nav.ai_sidebar.toggle"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={{
              color: aiSidebarOpen
                ? "oklch(0.75 0.25 25)"
                : "oklch(0.5 0.06 30)",
              borderColor: aiSidebarOpen
                ? "oklch(0.5 0.2 25)"
                : "oklch(0.25 0.04 25)",
              boxShadow: aiSidebarOpen
                ? "0 0 12px oklch(0.45 0.22 25 / 0.3), inset 0 1px 0 oklch(0.55 0.2 35 / 0.3)"
                : undefined,
            }}
            aria-pressed={aiSidebarOpen}
          >
            🐉 AI SCRIBE
          </button>
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

      {/* ── MAIN ── */}
      <main className="relative z-10 flex-1 flex flex-col">
        {view === "canvas" ? (
          <DesignCanvas />
        ) : view === "video" ? (
          <VideoTimeline />
        ) : view === "hub" ? (
          <div className="flex flex-1">
            <div className="flex-1">
              <ProjectHub hubAIContent={hubAIContent} />
            </div>
            <AISidebar
              isOpen={aiSidebarOpen}
              onClose={() => setAiSidebarOpen(false)}
              onSendToHub={handleSendToHub}
            />
          </div>
        ) : (
          <div className="flex flex-1 gap-0">
            {/* Studio content */}
            <div className="flex-1 flex flex-col gap-3 p-3 md:p-4 min-w-0">
              {/* Toolbar */}
              <Toolbar
                onUploadPhoto={handleUploadPhoto}
                onUploadVideo={handleUploadVideo}
                onMusicGen={handleMusicGen}
                onVideoGen={handleVideoGen}
                onExport={handleExport}
                canExport={hasContent}
                isAuthenticated={isAuthenticated}
              />

              {/* Effects button row */}
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

                {/* Effects menu */}
                <EffectsMenu
                  isOpen={effectsMenuOpen}
                  activeEffect={activeEffect}
                  onSelectEffect={setActiveEffect}
                  onClose={() => setEffectsMenuOpen(false)}
                />
              </div>

              {/* Canvas */}
              <Canvas
                activeEffect={activeEffect}
                onViolation={handleViolation}
                files={canvasFiles}
                generatedResults={generatedResults}
                onFilesAdded={handleFilesAdded}
                isAuthenticated={isAuthenticated}
              />

              {/* Bottom panel */}
              <BottomPanel
                dragonPower={dragonPower}
                onDragonPowerChange={setDragonPower}
                onIgnite={handleIgnite}
                statusText={statusText}
                isGenerating={isGenerating}
                isAuthenticated={isAuthenticated}
              />
            </div>

            {/* AI Sidebar */}
            <AISidebar
              isOpen={aiSidebarOpen}
              onClose={() => setAiSidebarOpen(false)}
              onSendToHub={handleSendToHub}
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
          {/* Emoji picker button */}
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
            alt="♥"
            className="w-4 h-4"
            style={{ filter: "drop-shadow(0 0 3px oklch(0.55 0.25 25 / 0.5))" }}
          />
          Built with love using caffeine.ai
        </a>
      </footer>

      {/* ── MODALS ── */}
      {genModalOpen && (
        <GenerationModal
          type={genModalOpen}
          isOpen={true}
          onClose={() => setGenModalOpen(null)}
          onSubmit={handleGenSubmit}
          isGenerating={isGenerating}
        />
      )}

      {/* Hidden file inputs */}
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
