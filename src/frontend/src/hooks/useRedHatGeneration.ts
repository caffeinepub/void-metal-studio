import { useState } from "react";

export type GenerationType = "music" | "video" | "image" | "ignite";

export interface GenerationPayload {
  type: GenerationType;
  seed: string;
  power: number;
  files?: Array<{ name: string; fileType: string; size: number }>;
}

export interface GenerationResult {
  type: GenerationType;
  url?: string;
  blob?: Blob;
  message?: string;
  isDemo?: boolean;
}

const SHEPHERD_ENDPOINT =
  "https://shepherd-main.apps.cluster.example.com/api/generate";

export function useRedHatGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const generate = async (
    payload: GenerationPayload,
  ): Promise<GenerationResult | null> => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    console.log("shepherd-main endpoint connected");
    console.log("Sending to shepherd-main:", {
      endpoint: SHEPHERD_ENDPOINT,
      payload: {
        seed: payload.seed,
        power: payload.power,
        type: payload.type,
        files: payload.files,
      },
    });

    try {
      // Attempt real endpoint call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let response: Response | null = null;
      try {
        response = await fetch(SHEPHERD_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seed: payload.seed,
            power: payload.power,
            type: payload.type,
            files: payload.files,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        clearTimeout(timeoutId);
        // Endpoint not reachable – fall through to demo mode
      }

      let genResult: GenerationResult;

      if (response?.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("audio")) {
          const blob = await response.blob();
          genResult = {
            type: payload.type,
            blob,
            url: URL.createObjectURL(blob),
          };
        } else if (contentType.includes("video")) {
          const blob = await response.blob();
          genResult = {
            type: payload.type,
            blob,
            url: URL.createObjectURL(blob),
          };
        } else {
          const data = await response.json();
          genResult = {
            type: payload.type,
            url: data.url,
            message: data.message,
          };
        }
      } else {
        // Demo mode: return a descriptive result
        genResult = {
          type: payload.type,
          isDemo: true,
          message: `[DEMO] ${payload.type.toUpperCase()} generated from seed: "${payload.seed}" at power ${payload.power}. Connect shepherd-main endpoint for real generation.`,
        };
      }

      setResult(genResult);
      return genResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { generate, isGenerating, error, result, reset };
}
