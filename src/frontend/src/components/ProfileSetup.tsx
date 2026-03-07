import type React from "react";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile({ name: name.trim() }, { onSuccess: onComplete });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div
        className="stone-panel fire-vein-overlay max-w-md w-full mx-4 p-8"
        style={{ borderColor: "oklch(0.45 0.22 25)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/assets/generated/emoji-dragon-eye.dim_128x128.png"
            alt=""
            className="w-10 h-10"
            style={{ filter: "drop-shadow(0 0 8px oklch(0.65 0.28 25))" }}
          />
          <h2 className="gothic-title text-xl">FORGE YOUR NAME</h2>
        </div>

        <p
          className="font-cinzel text-sm mb-6"
          style={{ color: "oklch(0.55 0.05 30)", letterSpacing: "0.06em" }}
        >
          Enter your warrior name to enter the Void Metal Studio.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="YOUR NAME..."
            maxLength={40}
            className="w-full px-4 py-3 mb-6 font-cinzel text-sm tracking-widest"
            style={{
              background: "oklch(0.1 0.008 20)",
              border: "1px solid oklch(0.35 0.1 25)",
              color: "oklch(0.75 0.15 30)",
              outline: "none",
              borderRadius: "2px",
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

          <button
            type="submit"
            disabled={!name.trim() || isPending}
            className="forge-btn w-full py-3 text-sm tracking-widest uppercase"
          >
            {isPending ? "FORGING..." : "ENTER THE VOID"}
          </button>
        </form>
      </div>
    </div>
  );
}
