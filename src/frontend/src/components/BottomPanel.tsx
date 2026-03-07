import type React from "react";

interface BottomPanelProps {
  dragonPower: number;
  onDragonPowerChange: (value: number) => void;
  onIgnite: () => void;
  statusText: string;
  isGenerating: boolean;
  isAuthenticated: boolean;
}

export default function BottomPanel({
  dragonPower,
  onDragonPowerChange,
  onIgnite,
  statusText,
  isGenerating,
  isAuthenticated,
}: BottomPanelProps) {
  const sliderPct = `${dragonPower}%`;

  const getStatusColor = () => {
    if (statusText.includes("ERROR")) return "oklch(0.55 0.25 25)";
    if (statusText.includes("COMPLETE") || statusText.includes("EXPORT"))
      return "oklch(0.65 0.2 140)";
    if (statusText.includes("GENERATING") || statusText.includes("IGNITING"))
      return "oklch(0.65 0.22 42)";
    return "oklch(0.55 0.08 30)";
  };

  return (
    <div
      className="stone-panel px-6 py-5"
      style={{ borderColor: "oklch(0.3 0.08 25)" }}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* IGNITE button */}
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={onIgnite}
            disabled={!isAuthenticated || isGenerating}
            className="forge-btn ignite-btn px-10 py-4 text-base tracking-[0.2em] uppercase relative overflow-hidden"
            style={{
              background: isGenerating
                ? "linear-gradient(180deg, oklch(0.2 0.04 25) 0%, oklch(0.14 0.02 22) 100%)"
                : "linear-gradient(180deg, oklch(0.3 0.08 25) 0%, oklch(0.18 0.04 22) 100%)",
              borderColor: "oklch(0.5 0.2 25)",
              minWidth: "180px",
            }}
          >
            {/* Fire glow overlay */}
            <span
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 100%, oklch(0.55 0.22 40 / 0.15) 0%, transparent 70%)",
              }}
            />
            <span className="relative flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <span className="animate-spin text-lg">⚙</span>
                  IGNITING...
                </>
              ) : (
                <>
                  <img
                    src="/assets/generated/emoji-ember.dim_128x128.png"
                    alt=""
                    className="w-6 h-6 animate-ember-flicker"
                    style={{
                      filter: "drop-shadow(0 0 6px oklch(0.65 0.28 42))",
                    }}
                  />
                  IGNITE
                </>
              )}
            </span>
          </button>
        </div>

        {/* Dragon Power slider */}
        <div className="flex-1 w-full max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="dragon-power-slider"
              className="gothic-label text-xs tracking-widest"
              style={{ color: "oklch(0.6 0.18 30)" }}
            >
              <img
                src="/assets/generated/emoji-lightning-strike.dim_128x128.png"
                alt=""
                className="inline w-4 h-4 mr-1"
                style={{ filter: "drop-shadow(0 0 4px oklch(0.65 0.28 42))" }}
              />
              DRAGON POWER
            </label>
            <span
              className="font-cinzel font-bold text-sm"
              style={{
                color: "oklch(0.65 0.22 25)",
                textShadow: "0 0 8px oklch(0.55 0.25 25 / 0.6)",
              }}
            >
              {dragonPower}
            </span>
          </div>
          <input
            id="dragon-power-slider"
            type="range"
            min={0}
            max={100}
            value={dragonPower}
            onChange={(e) => onDragonPowerChange(Number(e.target.value))}
            className="dragon-slider w-full"
            style={{ "--slider-pct": sliderPct } as React.CSSProperties}
          />
          <div
            className="flex justify-between mt-1 font-cinzel text-xs"
            style={{ color: "oklch(0.35 0.04 25)" }}
          >
            <span>DORMANT</span>
            <span>UNLEASHED</span>
          </div>
        </div>

        {/* Status display */}
        <div
          className="flex-shrink-0 stone-panel px-5 py-3 min-w-[200px] text-center"
          style={{ borderColor: "oklch(0.25 0.06 25)" }}
        >
          <div
            className="text-xs font-cinzel mb-1"
            style={{ color: "oklch(0.4 0.04 25)", letterSpacing: "0.1em" }}
          >
            STATUS
          </div>
          <div
            className="status-text text-sm"
            style={{
              color: getStatusColor(),
              textShadow: `0 0 8px ${getStatusColor()}80`,
            }}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙</span>
                {statusText}
              </span>
            ) : (
              statusText
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
