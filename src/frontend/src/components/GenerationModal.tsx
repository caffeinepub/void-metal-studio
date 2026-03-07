import type React from "react";
import { useRef, useState } from "react";

interface GenerationModalProps {
  type: "music" | "video" | "ignite";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (seed: string) => void;
  isGenerating?: boolean;
}

const MODAL_CONFIG = {
  music: {
    title: "MUSIC GENERATION",
    placeholder: "Describe your sound... dark metal riff, dragon roar bass...",
    icon: "emoji-raw-rage",
    submitLabel: "GENERATE MUSIC",
  },
  video: {
    title: "VIDEO GENERATION",
    placeholder:
      "Describe your vision... gargoyle rising from stone, fire erupting...",
    icon: "emoji-watching",
    submitLabel: "GENERATE VIDEO",
  },
  ignite: {
    title: "IGNITE SEED",
    placeholder:
      "Enter your creation seed... the raw energy that drives the void...",
    icon: "emoji-ember",
    submitLabel: "IGNITE",
  },
};

const QUICK_EMOJIS = [
  { file: "emoji-dragon-eye", label: "👁" },
  { file: "emoji-ember", label: "🔥" },
  { file: "emoji-skull", label: "💀" },
  { file: "emoji-raw-heart", label: "🖤" },
  { file: "emoji-blade", label: "🗡" },
];

export default function GenerationModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  isGenerating = false,
}: GenerationModalProps) {
  const [seed, setSeed] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const config = MODAL_CONFIG[type];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim() || isGenerating) return;
    onSubmit(seed.trim());
  };

  const insertEmoji = (label: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart ?? seed.length;
    const end = inputRef.current.selectionEnd ?? seed.length;
    const newVal = seed.slice(0, start) + label + seed.slice(end);
    setSeed(newVal);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = start + label.length;
        inputRef.current.selectionEnd = start + label.length;
        inputRef.current.focus();
      }
    }, 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        className="stone-panel fire-vein-overlay max-w-lg w-full mx-4 p-8"
        style={{
          borderColor: "oklch(0.45 0.22 25)",
          boxShadow: "0 0 40px oklch(0.45 0.22 25 / 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src={`/assets/generated/${config.icon}.dim_128x128.png`}
              alt=""
              className="w-10 h-10 animate-crack-glow"
              style={{ filter: "drop-shadow(0 0 8px oklch(0.65 0.28 25))" }}
            />
            <h2 className="gothic-title text-xl">{config.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="forge-btn px-3 py-1 text-xs"
            style={{ color: "oklch(0.55 0.05 30)" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seed input */}
          <div className="relative mb-4">
            <textarea
              ref={inputRef}
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder={config.placeholder}
              rows={4}
              className="w-full px-4 py-3 font-cinzel text-sm tracking-wide resize-none"
              style={{
                background: "oklch(0.1 0.008 20)",
                border: "1px solid oklch(0.35 0.1 25)",
                color: "oklch(0.75 0.15 30)",
                outline: "none",
                borderRadius: "2px",
                lineHeight: "1.6",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "oklch(0.55 0.22 25)";
                e.target.style.boxShadow = "0 0 10px oklch(0.55 0.25 25 / 0.3)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "oklch(0.35 0.1 25)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Quick emoji insert */}
          <div className="flex gap-2 mb-6">
            <span
              className="font-cinzel text-xs self-center"
              style={{ color: "oklch(0.45 0.05 25)", letterSpacing: "0.08em" }}
            >
              INSERT:
            </span>
            {QUICK_EMOJIS.map((em) => (
              <button
                key={em.file}
                type="button"
                onClick={() => insertEmoji(em.label)}
                className="emoji-btn w-8 h-8"
                title={em.file.replace("emoji-", "").replace("-", " ")}
              >
                <img
                  src={`/assets/generated/${em.file}.dim_128x128.png`}
                  alt={em.label}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="forge-btn flex-1 py-3 text-sm tracking-widest"
              style={{ color: "oklch(0.5 0.05 25)" }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!seed.trim() || isGenerating}
              className="forge-btn flex-2 py-3 text-sm tracking-widest ignite-btn"
              style={{ flex: 2 }}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙</span>
                  GENERATING...
                </span>
              ) : (
                config.submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
