import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPrompt() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, oklch(0.12 0.02 25) 0%, oklch(0.06 0.005 20) 70%)",
      }}
    >
      {/* Dragon face background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(/assets/generated/gargoyle-dragon-face.dim_1920x1080.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          opacity: 0.25,
          filter: "brightness(0.6) contrast(1.3) saturate(0.8)",
        }}
      />

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.06 0.005 20 / 0.7) 60%, oklch(0.06 0.005 20) 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto px-6 text-center">
        {/* Logo / Title */}
        <div className="mb-2">
          <img
            src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
            alt="Dragon Eye"
            className="w-24 h-24 mx-auto mb-4 animate-crack-glow"
            style={{ filter: "drop-shadow(0 0 20px oklch(0.65 0.28 25))" }}
          />
        </div>

        <h1
          className="gothic-title text-4xl md:text-5xl mb-2 tracking-widest"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
        >
          VOID METAL
        </h1>
        <h2
          className="gothic-title text-2xl md:text-3xl mb-8 tracking-widest"
          style={{
            color: "oklch(0.62 0.2 42)",
            textShadow: "0 0 20px oklch(0.62 0.2 42 / 0.7)",
          }}
        >
          STUDIO
        </h2>

        <p
          className="font-cinzel text-sm mb-10 leading-relaxed"
          style={{ color: "oklch(0.55 0.05 30)", letterSpacing: "0.1em" }}
        >
          ENTER THE VOID. FORGE YOUR CREATION.
          <br />
          IDENTITY REQUIRED TO PROCEED.
        </p>

        {/* Login button */}
        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="forge-btn px-12 py-4 text-lg tracking-widest uppercase relative"
          style={{ minWidth: "280px" }}
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-3 justify-center">
              <span className="animate-spin text-xl">⚙</span>
              ENTERING THE VOID...
            </span>
          ) : (
            <span className="flex items-center gap-3 justify-center">
              <img
                src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
                alt=""
                className="w-6 h-6"
              />
              ENTER WITH IDENTITY
            </span>
          )}
        </button>

        <p
          className="mt-6 text-xs font-cinzel"
          style={{ color: "oklch(0.4 0.04 25)", letterSpacing: "0.08em" }}
        >
          FOREVERRAW · DARK FANTASY · SOUTHERN GOTHIC ROCK
        </p>

        {/* Decorative emojis */}
        <div className="flex gap-4 mt-8 opacity-40">
          {[
            "emoji-skull",
            "emoji-raw-heart",
            "emoji-blade",
            "emoji-void",
            "emoji-steel",
          ].map((e) => (
            <img
              key={e}
              src={`/assets/generated/${e}.dim_128x128.png`}
              alt=""
              className="w-8 h-8"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
