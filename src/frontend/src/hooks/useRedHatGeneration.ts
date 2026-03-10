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

    // Simulate a brief processing delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const genResult: GenerationResult = {
      type: payload.type,
      isDemo: true,
      message: `${payload.type.toUpperCase()} generation ready. Connect a backend to activate real output.`,
    };

    setResult(genResult);
    setIsGenerating(false);
    return genResult;
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { generate, isGenerating, error, result, reset };
}
