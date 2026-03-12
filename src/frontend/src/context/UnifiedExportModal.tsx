import { Button } from "@/components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "../backend";
import { ProjectStage } from "../backend";
import { useActor } from "../hooks/useActor";
import { useProject } from "./ProjectContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function UnifiedExportModal({ isOpen, onClose, project }: Props) {
  const { actor } = useActor();
  const { refetchProjects, setActiveProject } = useProject();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!actor) return;
    setPublishing(true);
    try {
      await actor.updateProjectStage(project.id, ProjectStage.published);
      refetchProjects();
      setActiveProject({ ...project, stage: ProjectStage.published });
      toast.success("PROJECT PUBLISHED — FORGE COMPLETE");
      onClose();
    } catch {
      toast.error("Failed to publish project");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "oklch(0 0 0 / 0.85)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            data-ocid="publish.dialog"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.1 0.01 20) 0%, oklch(0.14 0.012 22) 100%)",
              border: "1px solid oklch(0.55 0.25 25 / 0.5)",
              borderRadius: "4px",
              boxShadow:
                "0 0 40px oklch(0.45 0.22 25 / 0.4), 0 20px 60px oklch(0 0 0 / 0.7)",
              width: "100%",
              maxWidth: "520px",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid oklch(0.25 0.05 25)" }}
            >
              <h2
                style={{
                  fontFamily: "Cinzel Decorative, Cinzel, serif",
                  fontWeight: 900,
                  fontSize: "1rem",
                  letterSpacing: "0.08em",
                  color: "oklch(0.65 0.28 25)",
                  textShadow: "0 0 16px oklch(0.55 0.25 25 / 0.6)",
                }}
              >
                ⚡ PUBLISH PROJECT
              </h2>
              <button
                type="button"
                onClick={onClose}
                data-ocid="publish.close_button"
                className="forge-btn p-1.5"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Project title */}
              <div>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "oklch(0.5 0.06 30)",
                    marginBottom: "4px",
                  }}
                >
                  PROJECT
                </p>
                <p
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "oklch(0.88 0.02 60)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {project.title}
                </p>
              </div>

              {/* Script snippet */}
              {project.scriptContent && (
                <div>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      color: "oklch(0.5 0.06 30)",
                      marginBottom: "4px",
                    }}
                  >
                    SCRIPT
                  </p>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.72rem",
                      color: "oklch(0.7 0.03 30)",
                      lineHeight: 1.6,
                      background: "oklch(0.08 0.005 20)",
                      border: "1px solid oklch(0.22 0.04 25)",
                      borderRadius: "3px",
                      padding: "8px 10px",
                      maxHeight: "80px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {project.scriptContent}
                  </p>
                </div>
              )}

              {/* Design notes */}
              {project.designNotes && (
                <div>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      color: "oklch(0.5 0.06 30)",
                      marginBottom: "4px",
                    }}
                  >
                    DESIGN NOTES
                  </p>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.72rem",
                      color: "oklch(0.7 0.03 30)",
                      lineHeight: 1.6,
                      background: "oklch(0.08 0.005 20)",
                      border: "1px solid oklch(0.22 0.04 25)",
                      borderRadius: "3px",
                      padding: "8px 10px",
                      maxHeight: "60px",
                      overflow: "hidden",
                    }}
                  >
                    {project.designNotes}
                  </p>
                </div>
              )}

              {/* Video notes */}
              {project.videoNotes && (
                <div>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      color: "oklch(0.5 0.06 30)",
                      marginBottom: "4px",
                    }}
                  >
                    VIDEO NOTES
                  </p>
                  <p
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.72rem",
                      color: "oklch(0.7 0.03 30)",
                      lineHeight: 1.6,
                      background: "oklch(0.08 0.005 20)",
                      border: "1px solid oklch(0.22 0.04 25)",
                      borderRadius: "3px",
                      padding: "8px 10px",
                      maxHeight: "60px",
                      overflow: "hidden",
                    }}
                  >
                    {project.videoNotes}
                  </p>
                </div>
              )}

              {/* Stage status */}
              <div
                style={{
                  background: "oklch(0.08 0.005 20)",
                  border: "1px solid oklch(0.35 0.1 25 / 0.5)",
                  borderRadius: "3px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle
                  size={14}
                  style={{ color: "oklch(0.6 0.22 25)" }}
                />
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.7rem",
                    color: "oklch(0.6 0.06 30)",
                    letterSpacing: "0.06em",
                  }}
                >
                  Stage:{" "}
                  <strong style={{ color: "oklch(0.75 0.15 40)" }}>
                    {project.stage.toUpperCase()}
                  </strong>
                  {" → "}
                  <strong style={{ color: "oklch(0.65 0.28 25)" }}>
                    PUBLISHED
                  </strong>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-5 py-4"
              style={{ borderTop: "1px solid oklch(0.2 0.04 25)" }}
            >
              <button
                type="button"
                onClick={onClose}
                data-ocid="publish.cancel_button"
                className="forge-btn px-4 py-2 text-xs tracking-widest"
                style={{ color: "oklch(0.5 0.04 30)" }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                data-ocid="publish.confirm_button"
                className="forge-btn px-5 py-2 text-xs tracking-widest"
                style={{
                  color: "oklch(0.85 0.02 60)",
                  borderColor: "oklch(0.55 0.25 25)",
                  background:
                    "linear-gradient(180deg, oklch(0.3 0.12 25) 0%, oklch(0.2 0.08 22) 100%)",
                  boxShadow: "0 0 16px oklch(0.45 0.22 25 / 0.4)",
                  animation: !publishing
                    ? "ignite-pulse 2s ease-in-out infinite"
                    : undefined,
                }}
              >
                {publishing ? "PUBLISHING..." : "⚡ CONFIRM PUBLISH"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
