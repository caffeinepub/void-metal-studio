import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EffectName } from "./EffectsMenu";

export interface CanvasFile {
  id: string;
  file: File;
  type: "image" | "video" | "audio" | "text" | "other";
  previewUrl?: string;
  textContent?: string;
}

export interface GeneratedResult {
  id: string;
  type: "music" | "video" | "image" | "ignite";
  url?: string;
  blob?: Blob;
  message?: string;
  isDemo?: boolean;
}

interface CanvasProps {
  activeEffect: EffectName;
  onViolation: () => void;
  files: CanvasFile[];
  generatedResults: GeneratedResult[];
  onFilesAdded: (files: CanvasFile[]) => void;
  isAuthenticated: boolean;
}

function getFileType(file: File): CanvasFile["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (
    file.type === "text/plain" ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".lrc")
  )
    return "text";
  return "other";
}

function WaveformVisualizer({ audioUrl }: { audioUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#b91c1c";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ef4444";
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const initAudio = useCallback(() => {
    if (!audioRef.current || ctxRef.current) return;
    const audioCtx = new AudioContext();
    ctxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    const source = audioCtx.createMediaElementSource(audioRef.current);
    sourceRef.current = source;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return (
    <div className="waveform-container w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className="w-full h-20 protected-content"
        style={{ display: "block" }}
      />
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        onPlay={initAudio}
        className="w-full mt-1"
        style={{
          height: "32px",
          filter: "invert(1) hue-rotate(180deg) saturate(0.5)",
        }}
        controlsList="nodownload"
      >
        <track kind="captions" />
      </audio>
    </div>
  );
}

function getEffectClass(effect: EffectName): string {
  if (!effect) return "";
  const map: Record<string, string> = {
    "fire-glow": "effect-fire-glow",
    "chain-overlay": "effect-chain-overlay",
    "stone-crack": "effect-stone-crack",
    "dragon-breath": "effect-dragon-breath",
    "ember-pulse": "effect-ember-pulse",
    "shadow-veil": "effect-shadow-veil",
    "blood-drip": "effect-blood-drip",
  };
  return map[effect] || "";
}

export default function Canvas({
  activeEffect,
  onViolation,
  files,
  generatedResults,
  onFilesAdded,
  isAuthenticated,
}: CanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (rawFiles: FileList | File[]) => {
      const arr = Array.from(rawFiles);
      const processed: CanvasFile[] = await Promise.all(
        arr.map(async (file) => {
          const type = getFileType(file);
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
            type,
            previewUrl,
            textContent,
          };
        }),
      );
      onFilesAdded(processed);
    },
    [onFilesAdded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!isAuthenticated) return;
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [isAuthenticated, processFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (files.length > 0 || generatedResults.length > 0) {
      onViolation();
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["s", "c", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        if (files.length > 0 || generatedResults.length > 0) {
          onViolation();
        }
      }
    },
    [files.length, generatedResults.length, onViolation],
  );

  const effectClass = getEffectClass(activeEffect);
  const hasContent = files.length > 0 || generatedResults.length > 0;

  return (
    <section
      className={`relative flex-1 stone-panel fire-vein-overlay crack-decoration protected-wrapper ${isDragOver ? "canvas-drag-over" : "glow-border"}`}
      style={{
        minHeight: "400px",
        borderColor: isDragOver ? "oklch(0.65 0.28 25)" : "oklch(0.3 0.08 25)",
        cursor: isAuthenticated ? "default" : "not-allowed",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      aria-label="Canvas drop zone"
    >
      {/* Background dragon face watermark */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ borderRadius: "inherit" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(/assets/generated/gargoyle-dragon-face.dim_1920x1080.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: hasContent ? 0.04 : 0.12,
            filter: "brightness(0.5) contrast(1.5) saturate(0.3)",
            transition: "opacity 0.5s ease",
          }}
        />
      </div>

      {/* Empty state */}
      {!hasContent && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="mb-4 animate-crack-glow">
            <img
              src="/assets/generated/emoji-void.dim_128x128.png"
              alt=""
              className="w-16 h-16 mx-auto mb-4 opacity-60"
              style={{
                filter: "drop-shadow(0 0 12px oklch(0.55 0.25 25 / 0.5))",
              }}
            />
          </div>
          <h3
            className="gothic-title text-2xl md:text-3xl text-center px-4"
            style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
          >
            DROP YOUR CREATION HERE
          </h3>
          <p
            className="mt-3 font-cinzel text-xs text-center"
            style={{ color: "oklch(0.4 0.04 25)", letterSpacing: "0.12em" }}
          >
            {isAuthenticated
              ? "DRAG & DROP · PHOTOS · VIDEOS · AUDIO · TEXT"
              : "LOGIN REQUIRED TO UPLOAD"}
          </p>
        </div>
      )}

      {/* Content area */}
      {hasContent && (
        <div
          className={`relative z-10 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${effectClass}`}
        >
          {/* Uploaded files */}
          {files.map((cf) => (
            <div
              key={cf.id}
              className="stone-panel p-3"
              style={{ borderColor: "oklch(0.3 0.08 25)" }}
            >
              <div
                className="text-xs font-cinzel mb-2 truncate"
                style={{
                  color: "oklch(0.55 0.15 30)",
                  letterSpacing: "0.06em",
                }}
              >
                {cf.file.name}
              </div>

              {cf.type === "image" && cf.previewUrl && (
                <img
                  src={cf.previewUrl}
                  alt={cf.file.name}
                  className="w-full max-h-48 object-contain protected-content"
                  draggable={false}
                  style={{ borderRadius: "2px" }}
                />
              )}

              {cf.type === "video" && cf.previewUrl && (
                <video
                  src={cf.previewUrl}
                  controls
                  className="w-full max-h-48 protected-content"
                  controlsList="nodownload"
                  style={{ borderRadius: "2px" }}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <track kind="captions" />
                </video>
              )}

              {cf.type === "audio" && cf.previewUrl && (
                <WaveformVisualizer audioUrl={cf.previewUrl} />
              )}

              {cf.type === "text" && cf.textContent !== undefined && (
                <div
                  className="max-h-40 overflow-y-auto p-2 font-cinzel text-xs leading-relaxed protected-content"
                  style={{
                    background: "oklch(0.08 0.005 20)",
                    border: "1px solid oklch(0.25 0.05 25)",
                    color: "oklch(0.65 0.1 30)",
                    whiteSpace: "pre-wrap",
                    borderRadius: "2px",
                  }}
                >
                  {cf.textContent}
                </div>
              )}

              {cf.type === "other" && (
                <div
                  className="flex items-center gap-2 p-3"
                  style={{ color: "oklch(0.5 0.05 25)" }}
                >
                  <img
                    src="/assets/generated/emoji-stone.dim_128x128.png"
                    alt=""
                    className="w-8 h-8"
                  />
                  <span className="font-cinzel text-xs">
                    {cf.file.type || "Unknown type"}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Generated results */}
          {generatedResults.map((result) => (
            <div
              key={result.id}
              className="stone-panel p-3"
              style={{ borderColor: "oklch(0.45 0.15 25)" }}
            >
              <div
                className="text-xs font-cinzel mb-2 flex items-center gap-2"
                style={{
                  color: "oklch(0.65 0.22 25)",
                  letterSpacing: "0.06em",
                }}
              >
                <img
                  src="/assets/generated/emoji-ember.dim_128x128.png"
                  alt=""
                  className="w-4 h-4"
                />
                {result.type.toUpperCase()} GENERATION
                {result.isDemo && (
                  <span
                    className="ml-auto text-xs"
                    style={{ color: "oklch(0.55 0.15 42)" }}
                  >
                    [DEMO]
                  </span>
                )}
              </div>

              {result.url &&
                (result.type === "music" || result.type === "ignite") && (
                  <WaveformVisualizer audioUrl={result.url} />
                )}

              {result.url && result.type === "video" && (
                <video
                  src={result.url}
                  controls
                  className="w-full max-h-48 protected-content"
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <track kind="captions" />
                </video>
              )}

              {result.message && (
                <div
                  className="p-3 font-cinzel text-xs leading-relaxed"
                  style={{
                    background: "oklch(0.08 0.005 20)",
                    border: "1px solid oklch(0.3 0.08 25)",
                    color: "oklch(0.6 0.1 30)",
                    whiteSpace: "pre-wrap",
                    borderRadius: "2px",
                  }}
                >
                  {result.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{
            background: "oklch(0.45 0.22 25 / 0.1)",
            border: "2px dashed oklch(0.65 0.28 25)",
            borderRadius: "inherit",
          }}
        >
          <div className="text-center">
            <img
              src="/assets/generated/emoji-ember.dim_128x128.png"
              alt=""
              className="w-12 h-12 mx-auto mb-2 animate-ember-flicker"
              style={{ filter: "drop-shadow(0 0 12px oklch(0.65 0.28 25))" }}
            />
            <p className="gothic-label text-lg">RELEASE TO FORGE</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.txt,.lrc"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
}
