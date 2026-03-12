import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Project } from "../backend";
import type { ProjectStage } from "../backend";
import { useProject } from "../context/ProjectContext";
import { useActor } from "../hooks/useActor";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProjectStage,
} from "../hooks/useQueries";

type Stage = "idea" | "script" | "visuals" | "video" | "published";

const STAGES: Stage[] = ["idea", "script", "visuals", "video", "published"];

const STAGE_LABELS: Record<Stage, string> = {
  idea: "IDEA",
  script: "SCRIPT",
  visuals: "VISUALS",
  video: "VIDEO",
  published: "PUBLISHED",
};

const STAGE_ICONS: Record<Stage, string> = {
  idea: "\u{1F4A1}",
  script: "\u{1F4DC}",
  visuals: "\u{1F3A8}",
  video: "\u{1F3A6}",
  published: "\u26A1",
};

const STAGE_COLORS: Record<Stage, string> = {
  idea: "oklch(0.55 0.18 260)",
  script: "oklch(0.58 0.22 40)",
  visuals: "oklch(0.55 0.2 155)",
  video: "oklch(0.55 0.22 295)",
  published: "oklch(0.65 0.28 25)",
};

const STAGE_GLOW: Record<Stage, string> = {
  idea: "oklch(0.55 0.18 260 / 0.35)",
  script: "oklch(0.58 0.22 40 / 0.35)",
  visuals: "oklch(0.55 0.2 155 / 0.35)",
  video: "oklch(0.55 0.22 295 / 0.35)",
  published: "oklch(0.65 0.28 25 / 0.45)",
};

type NavCallback = (view: "hub" | "studio" | "canvas" | "video") => void;

interface ProjectHubProps {
  onNavigate?: NavCallback;
}

// ── KanbanCard ─────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  project: Project;
  stageIndex: number;
  dataIndex: number;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (project: Project) => void;
}

function KanbanCard({
  project,
  stageIndex,
  dataIndex,
  onMoveLeft,
  onMoveRight,
  onDelete,
  onActivate,
}: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const stage = project.stage as Stage;
  const color = STAGE_COLORS[stage] ?? STAGE_COLORS.idea;
  const glow = STAGE_GLOW[stage] ?? STAGE_GLOW.idea;

  const colorFaint = color.replace(")", " / 0.2)");
  const colorMid = color.replace(")", " / 0.35)");
  const colorTitleGlow = color.replace(")", " / 0.4)");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      data-ocid={`hub.item.${dataIndex}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onActivate(project)}
      style={{
        background:
          "linear-gradient(135deg, oklch(0.11 0.012 20) 0%, oklch(0.14 0.014 22) 50%, oklch(0.1 0.008 18) 100%)",
        border: `1px solid ${hovered ? color : "oklch(0.28 0.06 25)"}`,
        boxShadow: hovered
          ? `0 0 18px ${glow}, inset 0 1px 0 oklch(0.3 0.06 30 / 0.2), 0 4px 16px oklch(0 0 0 / 0.5)`
          : "inset 0 1px 0 oklch(0.22 0.04 28 / 0.15), 0 2px 8px oklch(0 0 0 / 0.4)",
        borderRadius: "4px",
        transition: "all 0.18s ease",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
      className="p-3 group"
    >
      {/* Crack accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "12%",
          width: "1px",
          height: "100%",
          background: `linear-gradient(180deg, transparent 0%, ${colorFaint} 40%, ${colorMid} 60%, transparent 100%)`,
          clipPath:
            "polygon(0 0, 100% 8%, 60% 38%, 100% 55%, 70% 75%, 100% 100%, 0 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Stage dot */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${glow}`,
        }}
      />

      {/* Title */}
      <h4
        style={{
          fontFamily: "Cinzel, serif",
          fontWeight: 700,
          fontSize: "0.8rem",
          color: "oklch(0.88 0.02 60)",
          letterSpacing: "0.04em",
          lineHeight: 1.35,
          marginBottom: "6px",
          paddingRight: "16px",
          textShadow: hovered ? `0 0 8px ${colorTitleGlow}` : "none",
          transition: "text-shadow 0.18s ease",
        }}
      >
        {project.title}
      </h4>

      {/* Script preview */}
      {project.scriptContent && (
        <p
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "0.68rem",
            color: "oklch(0.5 0.03 30)",
            lineHeight: 1.5,
            marginBottom: "8px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.scriptContent}
        </p>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft(project.id);
            }}
            disabled={stageIndex === 0}
            data-ocid={`hub.secondary_button.${dataIndex}`}
            className="forge-btn p-1 disabled:opacity-20"
            title="Move back"
            style={{ minWidth: "24px", minHeight: "24px", padding: "3px 5px" }}
          >
            <ChevronLeft size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight(project.id);
            }}
            disabled={stageIndex === STAGES.length - 1}
            data-ocid={`hub.primary_button.${dataIndex}`}
            className="forge-btn p-1 disabled:opacity-20"
            title="Move forward"
            style={{ minWidth: "24px", minHeight: "24px", padding: "3px 5px" }}
          >
            <ChevronRight size={12} />
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          data-ocid={`hub.delete_button.${dataIndex}`}
          className="forge-btn p-1 opacity-40 hover:opacity-100"
          title="Delete project"
          style={{
            minWidth: "24px",
            minHeight: "24px",
            padding: "3px 5px",
            color: "oklch(0.65 0.28 25)",
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ── AddCardDialog ──────────────────────────────────────────────────────────────

interface AddCardDialogProps {
  stage: Stage;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
  isAdding: boolean;
}

function AddCardDialog({
  stage,
  isOpen,
  onClose,
  onAdd,
  isAdding,
}: AddCardDialogProps) {
  const [title, setTitle] = useState("");
  const color = STAGE_COLORS[stage];

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.01 20) 0%, oklch(0.14 0.012 22) 100%)",
          border: `1px solid ${color.replace(")", " / 0.4)")}`,
          borderRadius: "4px",
          boxShadow: `0 0 30px ${color.replace(")", " / 0.25)")}, 0 20px 60px oklch(0 0 0 / 0.7)`,
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "Cinzel Decorative, Cinzel, serif",
              fontWeight: 900,
              fontSize: "0.9rem",
              letterSpacing: "0.08em",
              color: color,
              textShadow: `0 0 12px ${color.replace(")", " / 0.5)")}`,
            }}
          >
            {STAGE_ICONS[stage]} NEW {STAGE_LABELS[stage]} PROJECT
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label
              htmlFor="new-project-title"
              style={{
                display: "block",
                fontFamily: "Cinzel, serif",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "oklch(0.55 0.06 30)",
                marginBottom: "6px",
              }}
            >
              PROJECT TITLE *
            </label>
            <input
              id="new-project-title"
              data-ocid="hub.input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter project title..."
              style={{
                width: "100%",
                background: "oklch(0.08 0.005 20)",
                border: `1px solid ${color.replace(")", " / 0.3)")}`,
                borderRadius: "3px",
                padding: "8px 12px",
                fontFamily: "Cinzel, serif",
                fontSize: "0.8rem",
                color: "oklch(0.88 0.02 60)",
                letterSpacing: "0.03em",
                outline: "none",
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              data-ocid="hub.cancel_button"
              className="forge-btn px-4 py-2 text-xs tracking-widest"
              style={{ color: "oklch(0.5 0.04 30)" }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || isAdding}
              data-ocid="hub.submit_button"
              className="forge-btn px-4 py-2 text-xs tracking-widest"
              style={{
                color: "oklch(0.85 0.02 60)",
                borderColor: color.replace(")", " / 0.6)"),
                background: `linear-gradient(180deg, ${color.replace(")", " / 0.3)")} 0%, ${color.replace(")", " / 0.1)")} 100%)`,
              }}
            >
              {isAdding ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                "FORGE IT"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── ProjectHub ──────────────────────────────────────────────────────────────────

export default function ProjectHub({ onNavigate }: ProjectHubProps) {
  const { setActiveProject } = useProject();
  const { actor } = useActor();
  const { data: projects = [], isLoading, refetch } = useGetProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const updateStage = useUpdateProjectStage();

  const [addingStage, setAddingStage] = useState<Stage | null>(null);

  const handleMoveLeft = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const idx = STAGES.indexOf(project.stage as Stage);
    if (idx <= 0) return;
    await updateStage.mutateAsync({
      id,
      stage: STAGES[idx - 1] as ProjectStage,
    });
    refetch();
  };

  const handleMoveRight = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const idx = STAGES.indexOf(project.stage as Stage);
    if (idx >= STAGES.length - 1) return;
    await updateStage.mutateAsync({
      id,
      stage: STAGES[idx + 1] as ProjectStage,
    });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteProject.mutateAsync(id);
    refetch();
  };

  const handleAddCard = async (title: string) => {
    if (!actor || !addingStage) return;
    const id = await createProject.mutateAsync(title);
    if (addingStage !== "idea") {
      await updateStage.mutateAsync({ id, stage: addingStage as ProjectStage });
    }
    refetch();
    setAddingStage(null);
  };

  const handleActivate = (project: Project) => {
    setActiveProject(project);
    const stage = project.stage as Stage;
    if (stage === "idea" || stage === "script") {
      onNavigate?.("studio");
    } else if (stage === "visuals") {
      onNavigate?.("canvas");
    } else if (stage === "video") {
      onNavigate?.("video");
    }
  };

  let cardIndex = 0;

  return (
    <div
      className="flex-1 overflow-auto p-4"
      style={{ background: "transparent" }}
    >
      {/* Hub header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2
            style={{
              fontFamily: "Cinzel Decorative, Cinzel, serif",
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              color: "oklch(0.65 0.28 25)",
              textShadow: "0 0 20px oklch(0.55 0.25 25 / 0.6)",
            }}
          >
            ⚔ FORGE HUB
          </h2>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "0.65rem",
              color: "oklch(0.45 0.04 30)",
              letterSpacing: "0.08em",
              marginTop: "2px",
            }}
          >
            CLICK A PROJECT TO ACTIVATE IT
          </p>
        </div>
        {isLoading && (
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: "oklch(0.55 0.22 25)" }}
          />
        )}
      </div>

      {/* Kanban board */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        style={{ minHeight: "400px" }}
      >
        {STAGES.map((stage) => {
          const stageProjects = projects.filter((p) => p.stage === stage);
          const color = STAGE_COLORS[stage];
          const glow = STAGE_GLOW[stage];
          const stageIdx = STAGES.indexOf(stage);

          return (
            <div
              key={stage}
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.1 0.008 20) 0%, oklch(0.09 0.006 18) 100%)",
                border: `1px solid ${color.replace(")", " / 0.2)")}`,
                borderRadius: "4px",
                padding: "12px",
                boxShadow: "inset 0 0 0 1px oklch(0 0 0 / 0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minHeight: "300px",
              }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 6px ${glow}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      color: color,
                      textShadow: `0 0 8px ${glow}`,
                    }}
                  >
                    {STAGE_ICONS[stage]} {STAGE_LABELS[stage]}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "Cinzel, serif",
                    fontSize: "0.6rem",
                    color: "oklch(0.4 0.03 30)",
                    background: "oklch(0.12 0.008 20)",
                    border: "1px solid oklch(0.22 0.04 25)",
                    borderRadius: "2px",
                    padding: "1px 5px",
                  }}
                >
                  {stageProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 flex-1">
                <AnimatePresence mode="popLayout">
                  {stageProjects.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      data-ocid={`hub.${stage}.empty_state`}
                      style={{
                        textAlign: "center",
                        padding: "20px 8px",
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.62rem",
                        color: "oklch(0.35 0.03 30)",
                        letterSpacing: "0.06em",
                        border: "1px dashed oklch(0.22 0.04 25)",
                        borderRadius: "3px",
                      }}
                    >
                      NO PROJECTS
                    </motion.div>
                  )}
                  {stageProjects.map((project) => {
                    const idx = ++cardIndex;
                    return (
                      <KanbanCard
                        key={project.id}
                        project={project}
                        stageIndex={stageIdx}
                        dataIndex={idx}
                        onMoveLeft={handleMoveLeft}
                        onMoveRight={handleMoveRight}
                        onDelete={handleDelete}
                        onActivate={handleActivate}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Add card button */}
              <button
                type="button"
                onClick={() => setAddingStage(stage)}
                data-ocid={`hub.${stage}.open_modal_button`}
                className="forge-btn w-full flex items-center justify-center gap-2 py-2 text-xs tracking-widest mt-auto"
                style={{
                  color: "oklch(0.5 0.06 30)",
                  borderStyle: "dashed",
                }}
              >
                <Plus size={12} />
                ADD
              </button>
            </div>
          );
        })}
      </div>

      {/* Add card dialog */}
      {addingStage && (
        <AddCardDialog
          stage={addingStage}
          isOpen={true}
          onClose={() => setAddingStage(null)}
          onAdd={handleAddCard}
          isAdding={createProject.isPending || updateStage.isPending}
        />
      )}
    </div>
  );
}
