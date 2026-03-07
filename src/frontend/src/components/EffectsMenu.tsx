import React, { useEffect, useRef } from "react";

export type EffectName =
  | "fire-glow"
  | "chain-overlay"
  | "stone-crack"
  | "dragon-breath"
  | "ember-pulse"
  | "shadow-veil"
  | "blood-drip"
  | null;

interface Effect {
  id: EffectName;
  label: string;
  emoji: string;
  description: string;
}

const EFFECTS: Effect[] = [
  {
    id: "fire-glow",
    label: "FIRE GLOW",
    emoji: "emoji-ember",
    description: "Blazing red-orange aura",
  },
  {
    id: "chain-overlay",
    label: "CHAIN OVERLAY",
    emoji: "emoji-chain-link",
    description: "Iron chain grid overlay",
  },
  {
    id: "stone-crack",
    label: "STONE CRACK",
    emoji: "emoji-stone",
    description: "Cracked stone filter",
  },
  {
    id: "dragon-breath",
    label: "DRAGON BREATH",
    emoji: "emoji-raw-rage",
    description: "Shifting hue breath",
  },
  {
    id: "ember-pulse",
    label: "EMBER PULSE",
    emoji: "emoji-burning-heart",
    description: "Pulsing ember glow",
  },
  {
    id: "shadow-veil",
    label: "SHADOW VEIL",
    emoji: "emoji-void",
    description: "Dark shadow pulse",
  },
  {
    id: "blood-drip",
    label: "BLOOD DRIP",
    emoji: "emoji-blade",
    description: "Blood red sepia drip",
  },
];

interface EffectsMenuProps {
  isOpen: boolean;
  activeEffect: EffectName;
  onSelectEffect: (effect: EffectName) => void;
  onClose: () => void;
}

export default function EffectsMenu({
  isOpen,
  activeEffect,
  onSelectEffect,
  onClose,
}: EffectsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-1/2 -translate-x-1/2 z-40 stone-panel"
      style={{
        top: "100%",
        marginTop: "8px",
        width: "360px",
        borderColor: "oklch(0.45 0.22 25)",
        boxShadow:
          "0 8px 40px oklch(0 0 0 / 0.7), 0 0 20px oklch(0.45 0.22 25 / 0.2)",
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{ borderColor: "oklch(0.3 0.08 25)" }}
      >
        <img
          src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
          alt=""
          className="w-6 h-6"
          style={{ filter: "drop-shadow(0 0 6px oklch(0.65 0.28 25))" }}
        />
        <span className="gothic-label text-sm">DRAGON EFFECTS</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto forge-btn px-2 py-0.5 text-xs"
          style={{ color: "oklch(0.5 0.05 25)" }}
        >
          ✕
        </button>
      </div>

      {/* Effects list */}
      <div className="p-3 grid grid-cols-1 gap-2">
        {/* None option */}
        <button
          type="button"
          onClick={() => {
            onSelectEffect(null);
            onClose();
          }}
          className={`forge-btn flex items-center gap-3 px-3 py-2 text-left text-xs ${activeEffect === null ? "border-glow-red" : ""}`}
          style={
            activeEffect === null
              ? {
                  borderColor: "oklch(0.55 0.22 25)",
                  color: "oklch(0.75 0.25 25)",
                }
              : {}
          }
        >
          <span className="w-8 h-8 flex items-center justify-center text-lg">
            ✦
          </span>
          <div>
            <div className="font-cinzel font-bold tracking-widest">
              NO EFFECT
            </div>
            <div style={{ color: "oklch(0.45 0.05 25)", fontSize: "10px" }}>
              Clear all effects
            </div>
          </div>
          {activeEffect === null && (
            <span className="ml-auto" style={{ color: "oklch(0.65 0.28 25)" }}>
              ●
            </span>
          )}
        </button>

        {EFFECTS.map((effect) => (
          <button
            key={effect.id}
            type="button"
            onClick={() => {
              onSelectEffect(effect.id);
              onClose();
            }}
            className="forge-btn flex items-center gap-3 px-3 py-2 text-left text-xs"
            style={
              activeEffect === effect.id
                ? {
                    borderColor: "oklch(0.55 0.22 25)",
                    color: "oklch(0.75 0.25 25)",
                  }
                : {}
            }
          >
            <img
              src={`/assets/generated/${effect.emoji}.dim_128x128.png`}
              alt=""
              className="w-8 h-8 flex-shrink-0"
              style={{
                filter:
                  activeEffect === effect.id
                    ? "drop-shadow(0 0 6px oklch(0.65 0.28 25))"
                    : undefined,
              }}
            />
            <div>
              <div className="font-cinzel font-bold tracking-widest">
                {effect.label}
              </div>
              <div style={{ color: "oklch(0.45 0.05 25)", fontSize: "10px" }}>
                {effect.description}
              </div>
            </div>
            {activeEffect === effect.id && (
              <span
                className="ml-auto"
                style={{ color: "oklch(0.65 0.28 25)" }}
              >
                ●
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
