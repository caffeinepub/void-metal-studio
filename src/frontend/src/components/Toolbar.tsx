import React from "react";

interface ToolbarProps {
  onUploadPhoto: () => void;
  onUploadVideo: () => void;
  onMusicGen: () => void;
  onVideoGen: () => void;
  onExport: () => void;
  canExport: boolean;
  isAuthenticated: boolean;
}

const TOOLBAR_BUTTONS = [
  {
    id: "upload-photo",
    label: "UPLOAD PHOTO",
    emoji: "emoji-dragon-eye",
    action: "onUploadPhoto" as const,
  },
  {
    id: "upload-video",
    label: "UPLOAD VIDEO",
    emoji: "emoji-watching",
    action: "onUploadVideo" as const,
  },
  {
    id: "music-gen",
    label: "MUSIC GEN",
    emoji: "emoji-raw-rage",
    action: "onMusicGen" as const,
  },
  {
    id: "video-gen",
    label: "VIDEO GEN",
    emoji: "emoji-ember",
    action: "onVideoGen" as const,
  },
  {
    id: "export",
    label: "EXPORT",
    emoji: "emoji-dragon-shield",
    action: "onExport" as const,
  },
];

export default function Toolbar({
  onUploadPhoto,
  onUploadVideo,
  onMusicGen,
  onVideoGen,
  onExport,
  canExport,
  isAuthenticated,
}: ToolbarProps) {
  const handlers = {
    onUploadPhoto,
    onUploadVideo,
    onMusicGen,
    onVideoGen,
    onExport,
  };

  return (
    <div
      className="stone-panel px-4 py-3"
      style={{ borderColor: "oklch(0.3 0.08 25)" }}
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {TOOLBAR_BUTTONS.map((btn) => {
          const isExport = btn.id === "export";
          const disabled = !isAuthenticated || (isExport && !canExport);

          return (
            <button
              key={btn.id}
              type="button"
              onClick={handlers[btn.action]}
              disabled={disabled}
              className="forge-btn flex items-center gap-2 px-4 py-2.5 text-xs"
              style={{ minWidth: "130px" }}
              title={
                disabled && !isAuthenticated ? "Login required" : undefined
              }
            >
              <img
                src={`/assets/generated/${btn.emoji}.dim_128x128.png`}
                alt=""
                className="w-5 h-5 flex-shrink-0"
                style={{
                  filter: disabled
                    ? "grayscale(1) opacity(0.4)"
                    : "drop-shadow(0 0 4px oklch(0.65 0.28 25 / 0.6))",
                }}
              />
              <span className="tracking-widest">{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
