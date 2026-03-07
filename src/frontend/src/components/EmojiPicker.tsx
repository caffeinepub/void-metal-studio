import React, { useEffect, useRef } from "react";

const EMOJIS = [
  { file: "emoji-dragon-eye", label: "Dragon Eye", symbol: "🐉" },
  { file: "emoji-ember", label: "Ember", symbol: "🔥" },
  { file: "emoji-chain-link", label: "Chain Link", symbol: "⛓" },
  { file: "emoji-skull", label: "Skull", symbol: "💀" },
  { file: "emoji-raw-heart", label: "Raw Heart", symbol: "🖤" },
  { file: "emoji-lightning-strike", label: "Lightning Strike", symbol: "⚡" },
  { file: "emoji-stone", label: "Stone", symbol: "🪨" },
  { file: "emoji-blade", label: "Blade", symbol: "🗡" },
  { file: "emoji-void", label: "Void", symbol: "⚫" },
  { file: "emoji-dragon-shield", label: "Dragon Shield", symbol: "🛡" },
  { file: "emoji-raw-rage", label: "Raw Rage", symbol: "😤" },
  { file: "emoji-burning-heart", label: "Burning Heart", symbol: "❤️‍🔥" },
  { file: "emoji-prayer", label: "Prayer", symbol: "🙏" },
  { file: "emoji-watching", label: "Watching", symbol: "👀" },
  { file: "emoji-steel", label: "Steel", symbol: "✊" },
];

interface EmojiPickerProps {
  isOpen: boolean;
  onSelect: (symbol: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({
  isOpen,
  onSelect,
  onClose,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 stone-panel"
      style={{
        bottom: "100%",
        right: 0,
        marginBottom: "8px",
        width: "300px",
        borderColor: "oklch(0.45 0.22 25)",
        boxShadow:
          "0 -8px 40px oklch(0 0 0 / 0.7), 0 0 20px oklch(0.45 0.22 25 / 0.2)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 border-b flex items-center gap-2"
        style={{ borderColor: "oklch(0.3 0.08 25)" }}
      >
        <img
          src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
          alt=""
          className="w-5 h-5"
          style={{ filter: "drop-shadow(0 0 4px oklch(0.65 0.28 25))" }}
        />
        <span className="gothic-label text-xs">FOREVERRAW EMOJIS</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto forge-btn px-2 py-0.5 text-xs"
          style={{ color: "oklch(0.5 0.05 25)" }}
        >
          ✕
        </button>
      </div>

      {/* Emoji grid */}
      <div className="p-3 emoji-grid">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji.file}
            type="button"
            onClick={() => {
              onSelect(emoji.symbol);
              onClose();
            }}
            className="emoji-btn"
            title={emoji.label}
          >
            <img
              src={`/assets/generated/${emoji.file}.dim_128x128.png`}
              alt={emoji.label}
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 0 3px oklch(0.65 0.28 25 / 0.5))",
              }}
            />
          </button>
        ))}
      </div>

      {/* Labels row */}
      <div
        className="px-3 pb-2 text-center font-cinzel text-xs"
        style={{ color: "oklch(0.4 0.04 25)", letterSpacing: "0.06em" }}
      >
        FOREVERRAW · 15 DRAGON EMOJIS
      </div>
    </div>
  );
}
