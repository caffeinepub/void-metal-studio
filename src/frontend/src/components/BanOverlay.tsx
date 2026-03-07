import React from "react";

export default function BanOverlay() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center ban-overlay"
      style={{
        background:
          "radial-gradient(ellipse at center, oklch(0.15 0.05 25) 0%, oklch(0.05 0.01 20) 60%, oklch(0 0 0) 100%)",
      }}
    >
      {/* Dragon eye glow */}
      <div className="relative mb-8">
        <img
          src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
          alt="Dragon Eye"
          className="w-32 h-32 animate-crack-glow"
          style={{ filter: "drop-shadow(0 0 30px oklch(0.65 0.28 25))" }}
        />
      </div>

      {/* Skull icon */}
      <div className="mb-6">
        <img
          src="/assets/generated/emoji-skull.dim_128x128.png"
          alt="Skull"
          className="w-20 h-20 animate-ember-flicker"
          style={{ filter: "drop-shadow(0 0 15px oklch(0.55 0.25 25 / 0.8))" }}
        />
      </div>

      {/* Ban message */}
      <div className="max-w-2xl mx-auto px-8 text-center">
        <h1
          className="gothic-title text-3xl md:text-4xl mb-6 leading-tight"
          style={{
            color: "oklch(0.65 0.28 25)",
            textShadow:
              "0 0 30px oklch(0.55 0.25 25 / 0.9), 0 0 60px oklch(0.45 0.2 25 / 0.5)",
          }}
        >
          THE DRAGON CAUGHT YOU STEALING
        </h1>

        <div
          className="stone-panel p-6 mb-6"
          style={{ borderColor: "oklch(0.45 0.22 25)" }}
        >
          <p
            className="font-cinzel text-lg leading-relaxed"
            style={{
              color: "oklch(0.75 0.15 30)",
              textShadow: "0 0 8px oklch(0.55 0.25 25 / 0.4)",
            }}
          >
            The Dragon caught you stealing. Account permanently removed. Created
            by Skulls for the people who wanna stay real.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <img
            src="/assets/generated/emoji-chain-link.dim_128x128.png"
            alt=""
            className="w-10 h-10 opacity-60"
          />
          <img
            src="/assets/generated/emoji-void.dim_128x128.png"
            alt=""
            className="w-10 h-10 opacity-60"
          />
          <img
            src="/assets/generated/emoji-chain-link.dim_128x128.png"
            alt=""
            className="w-10 h-10 opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
