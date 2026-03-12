import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import { useUpdateProject } from "../hooks/useQueries";

interface Clip {
  id: string;
  name: string;
  type: "video" | "audio";
  duration: number;
  color: string;
  startTime: number;
  url?: string;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
}

interface Caption {
  id: string;
  timecode: string;
  text: string;
}

const EXPORT_PRESETS = [
  { id: "tiktok", label: "TikTok", ratio: "9:16", icon: "📱" },
  { id: "youtube", label: "YouTube", ratio: "16:9", icon: "▶" },
  { id: "instagram", label: "Instagram", ratio: "1:1", icon: "📷" },
  { id: "reels", label: "Reels", ratio: "9:16", icon: "🎞" },
];

const CLIP_COLORS = [
  "oklch(0.45 0.22 25)",
  "oklch(0.4 0.18 40)",
  "oklch(0.35 0.15 280)",
  "oklch(0.38 0.16 160)",
];

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoTimeline({
  activeProject,
}: { activeProject: Project | null }) {
  const updateProject = useUpdateProject();
  const [videoNotesText, setVideoNotesText] = useState(
    activeProject?.videoNotes ?? "",
  );

  const handleVideoNotesBlur = async () => {
    if (!activeProject) return;
    await updateProject
      .mutateAsync({
        id: activeProject.id,
        title: activeProject.title,
        scriptContent: activeProject.scriptContent,
        designNotes: activeProject.designNotes,
        videoNotes: videoNotesText,
      })
      .catch(() => {});
  };

  const [clips, setClips] = useState<Clip[]>([
    {
      id: "clip-1",
      name: "intro_sequence.mp4",
      type: "video",
      duration: 8,
      color: CLIP_COLORS[0],
      startTime: 0,
    },
    {
      id: "clip-2",
      name: "main_footage.mp4",
      type: "video",
      duration: 12,
      color: CLIP_COLORS[1],
      startTime: 8,
    },
    {
      id: "clip-3",
      name: "background_music.mp3",
      type: "audio",
      duration: 20,
      color: CLIP_COLORS[2],
      startTime: 0,
    },
  ]);

  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    { id: "text-1", text: "VOID METAL FORGE", startTime: 2, duration: 4 },
  ]);

  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = Math.max(
    ...clips.map((c) => c.startTime + c.duration),
    20,
  );

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    playIntervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= totalDuration) {
          clearInterval(playIntervalRef.current!);
          setIsPlaying(false);
          return 0;
        }
        return t + 0.1;
      });
    }, 100);
  }, [totalDuration]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setCurrentTime(0);
  }, []);

  const handleFileImport = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file, i) => {
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        if (!isVideo && !isAudio) return;
        const url = URL.createObjectURL(file);
        const clip: Clip = {
          id: `clip-${Date.now()}-${i}`,
          name: file.name,
          type: isVideo ? "video" : "audio",
          duration: 10,
          color: CLIP_COLORS[clips.length % CLIP_COLORS.length],
          startTime: totalDuration,
          url,
        };
        setClips((prev) => [...prev, clip]);
      });
      toast.success("Clips imported to timeline");
    },
    [clips.length, totalDuration],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileImport(e.dataTransfer.files);
    },
    [handleFileImport],
  );

  const handleGenerateCaptions = useCallback(() => {
    setIsGeneratingCaptions(true);
    setTimeout(() => {
      const videoClips = clips.filter((c) => c.type === "video");
      const generated: Caption[] = videoClips.flatMap((clip, ci) => [
        {
          id: `cap-${clip.id}-1`,
          timecode: formatTime(clip.startTime),
          text: `[${formatTime(clip.startTime)}] Caption generated from ${clip.name}`,
        },
        {
          id: `cap-${clip.id}-2`,
          timecode: formatTime(clip.startTime + clip.duration / 2),
          text: `[${formatTime(clip.startTime + clip.duration / 2)}] Scene ${ci + 1} mid-point — auto-transcribed`,
        },
      ]);
      setCaptions(generated);
      setIsGeneratingCaptions(false);
      toast.success("Captions generated successfully");
    }, 1500);
  }, [clips]);

  const handleAddTextOverlay = () => {
    const overlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: "NEW TEXT OVERLAY",
      startTime: currentTime,
      duration: 3,
    };
    setTextOverlays((prev) => [...prev, overlay]);
    toast.success("Text overlay added to timeline");
  };

  const handleExport = (preset: (typeof EXPORT_PRESETS)[number]) => {
    toast.loading(`Exporting for ${preset.label} (${preset.ratio})...`, {
      id: "export",
    });
    setTimeout(() => {
      toast.success(`Export ready (demo) — ${preset.label} ${preset.ratio}`, {
        id: "export",
      });
    }, 2000);
  };

  const handleDeleteClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    toast.success("Clip removed");
  };

  const playheadPct = (currentTime / totalDuration) * 100;

  const videoClips = clips.filter((c) => c.type === "video");
  const audioClips = clips.filter((c) => c.type === "audio");

  return (
    <div
      className="flex flex-col h-full min-h-screen p-4 gap-4"
      style={{ background: "oklch(0.06 0.005 20)" }}
    >
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

      {/* Project notes */}
      {activeProject && (
        <div
          className="stone-panel px-4 py-3 flex flex-col gap-2"
          style={{ borderRadius: "4px" }}
        >
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "oklch(0.65 0.28 25)",
            }}
          >
            \uD83C\uDFA6 {activeProject.title.toUpperCase()} — VIDEO NOTES
          </p>
          <textarea
            value={videoNotesText}
            onChange={(e) => setVideoNotesText(e.target.value)}
            onBlur={handleVideoNotesBlur}
            placeholder="Add video notes, captions or production details..."
            data-ocid="video_timeline.textarea"
            rows={2}
            style={{
              width: "100%",
              background: "oklch(0.07 0.005 20)",
              border: "1px solid oklch(0.28 0.07 25)",
              borderRadius: "3px",
              padding: "7px 10px",
              fontFamily: "Cinzel, serif",
              fontSize: "0.72rem",
              color: "oklch(0.78 0.03 40)",
              letterSpacing: "0.03em",
              resize: "none",
              outline: "none",
            }}
          />
        </div>
      )}
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="gothic-title text-xl">🎬 VIDEO FORGE</h2>
          <p
            className="text-xs mt-0.5"
            style={{
              fontFamily: "Cinzel, serif",
              color: "oklch(0.45 0.06 30)",
              letterSpacing: "0.12em",
            }}
          >
            TIMELINE EDITOR · IMPORT · CAPTION · EXPORT
          </p>
        </div>

        {/* Export presets */}
        <div className="flex flex-wrap gap-2">
          {EXPORT_PRESETS.map((preset, i) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleExport(preset)}
              data-ocid={
                `video_timeline.export.button.${i + 1}` as `video_timeline.${string}`
              }
              className="forge-btn px-3 py-1.5 text-xs tracking-widest flex items-center gap-1.5"
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
              <span
                style={{ color: "oklch(0.5 0.06 30)", fontSize: "0.65rem" }}
              >
                {preset.ratio}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Import zone */}
      <section
        aria-label="Import clips"
        className={`stone-panel rounded p-4 border-2 border-dashed transition-all ${
          isDragOver ? "canvas-drag-over" : ""
        }`}
        style={{
          borderColor: isDragOver
            ? "oklch(0.65 0.28 25)"
            : "oklch(0.28 0.07 25)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        data-ocid="video_timeline.dropzone"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="text-3xl"
              style={{
                filter: "drop-shadow(0 0 8px oklch(0.55 0.25 25 / 0.6))",
              }}
            >
              🎬
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "oklch(0.65 0.22 25)",
                  letterSpacing: "0.08em",
                }}
              >
                DROP VIDEO / AUDIO FILES HERE
              </p>
              <p
                className="text-xs mt-0.5"
                style={{
                  fontFamily: "Cinzel, serif",
                  color: "oklch(0.4 0.05 30)",
                  letterSpacing: "0.06em",
                }}
              >
                MP4, MOV, AVI, MP3, WAV supported
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="video_timeline.upload_button"
            className="forge-btn px-4 py-2 text-xs tracking-widest"
          >
            📂 IMPORT FILES
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,audio/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFileImport(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Imported clip thumbnails */}
        {clips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {clips.map((clip, i) => (
              <div
                key={clip.id}
                data-ocid={
                  `video_timeline.item.${i + 1}` as `video_timeline.${string}`
                }
                className="flex items-center gap-2 rounded px-3 py-1.5 text-xs"
                style={{
                  background: "oklch(0.12 0.01 20)",
                  border: `1px solid ${clip.color}`,
                  boxShadow: `0 0 8px ${clip.color}40`,
                }}
              >
                <span>{clip.type === "video" ? "🎬" : "🎵"}</span>
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "oklch(0.7 0.06 30)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {clip.name}
                </span>
                <span style={{ color: "oklch(0.45 0.05 30)" }}>
                  {clip.duration}s
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteClip(clip.id)}
                  data-ocid={
                    `video_timeline.delete_button.${i + 1}` as `video_timeline.${string}`
                  }
                  className="ml-1 hover:opacity-80 transition-opacity"
                  style={{ color: "oklch(0.55 0.22 25)" }}
                  title="Remove clip"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Playback controls */}
      <div className="stone-panel rounded p-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            data-ocid="video_timeline.primary_button"
            className="forge-btn px-4 py-2 text-sm tracking-widest"
            style={{ minWidth: "80px" }}
          >
            {isPlaying ? "⏸ PAUSE" : "▶ PLAY"}
          </button>
          <button
            type="button"
            onClick={handleStop}
            data-ocid="video_timeline.secondary_button"
            className="forge-btn px-3 py-2 text-sm tracking-widest"
          >
            ⏹ STOP
          </button>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded"
          style={{
            background: "oklch(0.1 0.008 20)",
            border: "1px solid oklch(0.28 0.07 25)",
          }}
        >
          <span
            className="text-sm tabular-nums"
            style={{
              fontFamily: "Cinzel, serif",
              color: "oklch(0.65 0.22 25)",
              letterSpacing: "0.08em",
            }}
          >
            {formatTime(currentTime)}
          </span>
          <span style={{ color: "oklch(0.35 0.05 30)" }}>/</span>
          <span
            className="text-sm tabular-nums"
            style={{
              fontFamily: "Cinzel, serif",
              color: "oklch(0.45 0.06 30)",
              letterSpacing: "0.08em",
            }}
          >
            {formatTime(totalDuration)}
          </span>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={handleAddTextOverlay}
            data-ocid="video_timeline.toggle"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
          >
            ✏ ADD TEXT
          </button>
          <button
            type="button"
            onClick={handleGenerateCaptions}
            disabled={
              isGeneratingCaptions ||
              clips.filter((c) => c.type === "video").length === 0
            }
            data-ocid="video_timeline.button"
            className="forge-btn px-3 py-1.5 text-xs tracking-widest"
            style={isGeneratingCaptions ? { opacity: 0.7 } : {}}
          >
            {isGeneratingCaptions ? (
              <span
                style={{ color: "oklch(0.65 0.22 25)" }}
                data-ocid="video_timeline.loading_state"
              >
                ⟳ GENERATING...
              </span>
            ) : (
              "⬡ GENERATE CAPTIONS"
            )}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="stone-panel rounded p-4 flex flex-col gap-3 overflow-x-auto">
        <p
          className="text-xs tracking-widest"
          style={{ fontFamily: "Cinzel, serif", color: "oklch(0.45 0.06 30)" }}
        >
          TIMELINE TRACKS
        </p>

        <div className="relative" style={{ minWidth: "600px" }}>
          {/* Timecode ruler */}
          <div
            className="flex mb-2"
            style={{ borderBottom: "1px solid oklch(0.25 0.05 25)" }}
          >
            {Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => (
              <div
                key={formatTime(i)}
                className="flex-shrink-0 text-xs"
                style={{
                  width: `${(1 / totalDuration) * 100}%`,
                  fontFamily: "Cinzel, serif",
                  color: "oklch(0.4 0.05 30)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.04em",
                }}
              >
                {formatTime(i)}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-20"
            style={{
              left: `${playheadPct}%`,
              width: "2px",
              background: "oklch(0.65 0.28 25)",
              boxShadow: "0 0 6px oklch(0.65 0.28 25 / 0.8)",
            }}
          />

          {/* Video track */}
          <div className="mb-2">
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "Cinzel, serif",
                color: "oklch(0.5 0.06 30)",
                letterSpacing: "0.08em",
              }}
            >
              VIDEO
            </div>
            <div
              className="relative rounded h-10"
              style={{ background: "oklch(0.1 0.008 20)" }}
            >
              {videoClips.map((clip) => (
                <div
                  key={clip.id}
                  className="absolute top-0 bottom-0 rounded flex items-center px-2 overflow-hidden"
                  style={{
                    left: `${(clip.startTime / totalDuration) * 100}%`,
                    width: `${(clip.duration / totalDuration) * 100}%`,
                    background: `linear-gradient(135deg, ${clip.color}99, ${clip.color}55)`,
                    border: `1px solid ${clip.color}`,
                  }}
                >
                  <span
                    className="text-xs truncate"
                    style={{
                      fontFamily: "Cinzel, serif",
                      color: "oklch(0.85 0.03 60)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {clip.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audio track */}
          <div className="mb-2">
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "Cinzel, serif",
                color: "oklch(0.5 0.06 30)",
                letterSpacing: "0.08em",
              }}
            >
              AUDIO
            </div>
            <div
              className="relative rounded h-10"
              style={{ background: "oklch(0.1 0.008 20)" }}
            >
              {audioClips.map((clip) => (
                <div
                  key={clip.id}
                  className="absolute top-0 bottom-0 rounded flex items-center px-2 overflow-hidden"
                  style={{
                    left: `${(clip.startTime / totalDuration) * 100}%`,
                    width: `${(clip.duration / totalDuration) * 100}%`,
                    background: `linear-gradient(135deg, ${clip.color}99, ${clip.color}55)`,
                    border: `1px solid ${clip.color}`,
                  }}
                >
                  <span
                    className="text-xs truncate"
                    style={{
                      fontFamily: "Cinzel, serif",
                      color: "oklch(0.85 0.03 60)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {clip.name}
                  </span>
                </div>
              ))}
              {audioClips.length === 0 && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-xs"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "oklch(0.3 0.04 30)",
                    letterSpacing: "0.06em",
                  }}
                  data-ocid="video_timeline.empty_state"
                >
                  NO AUDIO CLIPS
                </div>
              )}
            </div>
          </div>

          {/* Text/Caption overlay track */}
          <div>
            <div
              className="text-xs mb-1"
              style={{
                fontFamily: "Cinzel, serif",
                color: "oklch(0.5 0.06 30)",
                letterSpacing: "0.08em",
              }}
            >
              TEXT OVERLAYS
            </div>
            <div
              className="relative rounded h-10"
              style={{ background: "oklch(0.1 0.008 20)" }}
            >
              {textOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className="absolute top-0 bottom-0 rounded flex items-center px-2 overflow-hidden"
                  style={{
                    left: `${(overlay.startTime / totalDuration) * 100}%`,
                    width: `${(overlay.duration / totalDuration) * 100}%`,
                    background:
                      "linear-gradient(135deg, oklch(0.35 0.1 260 / 0.7), oklch(0.25 0.08 260 / 0.5))",
                    border: "1px solid oklch(0.45 0.12 260)",
                  }}
                >
                  <span
                    className="text-xs truncate"
                    style={{
                      fontFamily: "Cinzel, serif",
                      color: "oklch(0.85 0.03 60)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {overlay.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress scrubber */}
        <div className="mt-2">
          <input
            type="range"
            className="dragon-slider w-full"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            data-ocid="video_timeline.input"
            style={
              {
                "--slider-pct": `${playheadPct}%`,
              } as React.CSSProperties
            }
            aria-label="Timeline scrubber"
          />
        </div>
      </div>

      {/* Captions panel */}
      <div className="stone-panel rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-xs tracking-widest"
            style={{
              fontFamily: "Cinzel, serif",
              color: "oklch(0.45 0.06 30)",
            }}
          >
            CAPTIONS ({captions.length})
          </p>
          {captions.length > 0 && (
            <button
              type="button"
              onClick={() => setCaptions([])}
              className="forge-btn px-2 py-1 text-xs tracking-widest"
              style={{ color: "oklch(0.55 0.22 25)" }}
              data-ocid="video_timeline.delete_button"
            >
              CLEAR
            </button>
          )}
        </div>

        {captions.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-8 gap-2"
            data-ocid="video_timeline.empty_state"
          >
            <span
              className="text-3xl"
              style={{
                filter: "drop-shadow(0 0 8px oklch(0.35 0.12 25 / 0.4))",
              }}
            >
              ⬡
            </span>
            <p
              className="text-xs"
              style={{
                fontFamily: "Cinzel, serif",
                color: "oklch(0.35 0.04 30)",
                letterSpacing: "0.08em",
              }}
            >
              NO CAPTIONS YET — HIT GENERATE CAPTIONS
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {captions.map((cap, i) => (
              <div
                key={cap.id}
                className="flex items-start gap-3 rounded p-2"
                style={{
                  background: "oklch(0.1 0.008 20)",
                  border: "1px solid oklch(0.25 0.06 25)",
                }}
                data-ocid={
                  `video_timeline.row.${i + 1}` as `video_timeline.${string}`
                }
              >
                <span
                  className="text-xs flex-shrink-0 tabular-nums"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "oklch(0.55 0.2 25)",
                    letterSpacing: "0.06em",
                    minWidth: "44px",
                  }}
                >
                  {cap.timecode}
                </span>
                <input
                  type="text"
                  value={cap.text}
                  onChange={(e) =>
                    setCaptions((prev) =>
                      prev.map((c) =>
                        c.id === cap.id ? { ...c, text: e.target.value } : c,
                      ),
                    )
                  }
                  className="flex-1 bg-transparent text-xs outline-none"
                  style={{
                    fontFamily: "Cinzel, serif",
                    color: "oklch(0.7 0.04 30)",
                    letterSpacing: "0.04em",
                    border: "none",
                  }}
                  data-ocid={
                    `video_timeline.input.${i + 1}` as `video_timeline.${string}`
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
