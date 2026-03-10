import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

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
  idea: "💡",
  script: "📜",
  visuals: "🎨",
  video: "🎦",
  published: "⚡",
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

const PRESET_TAGS = [
  "TikTok",
  "YouTube",
  "Reels",
  "Track",
  "Drop",
  "ForeverRaw",
  "Collab",
  "Short",
];

interface ProjectCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: string;
  stage: Stage;
  createdAt: number;
}

// ── Seed Data ──────────────────────────────────────────────────────────────────

const SEED_CARDS: ProjectCard[] = [
  {
    id: "seed-1",
    title: "Void Serpent Anthem",
    description:
      "Hard-hitting track fusing Southern gothic riffs with dragon mythology. Opening scene: gargoyle silhouette against ember sky.",
    tags: ["Track", "ForeverRaw", "Drop"],
    dueDate: "2026-03-20",
    stage: "script",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "seed-2",
    title: "ForeverRaw Vol. 4 Thumbnail",
    description:
      "Cracked stone aesthetic, blood-red lettering, dragon scale border. Must scream raw power.",
    tags: ["YouTube", "Visuals"],
    dueDate: "2026-03-18",
    stage: "visuals",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: "seed-3",
    title: "Ember Rising – TikTok Series",
    description:
      "5-part short-form series. Each clip 30 seconds, vertical format, auto-captions. Fire transitions between cuts.",
    tags: ["TikTok", "Short", "Series"],
    dueDate: "2026-04-01",
    stage: "idea",
    createdAt: Date.now() - 86400000 * 0.5,
  },
  {
    id: "seed-4",
    title: "Dragon Claw Studio Mix",
    description:
      "Full studio session — layered distortion, bone-rattling bass, whispered gothic vocals.",
    tags: ["Track", "Collab"],
    dueDate: "",
    stage: "video",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "seed-5",
    title: "Skulls of the South EP Drop",
    description:
      "Official release. All platforms. Void Metal watermark on every asset. No stealing allowed.",
    tags: ["Drop", "ForeverRaw"],
    dueDate: "2026-02-28",
    stage: "published",
    createdAt: Date.now() - 86400000 * 10,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function genId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(iso: string): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

// ── KanbanCard ──────────────────────────────────────────────────────────────────

interface KanbanCardProps {
  card: ProjectCard;
  stageIndex: number;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onDelete: (id: string) => void;
  dataIndex: number;
}

function KanbanCard({
  card,
  stageIndex,
  onMoveLeft,
  onMoveRight,
  onDelete,
  dataIndex,
}: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const color = STAGE_COLORS[card.stage];
  const glow = STAGE_GLOW[card.stage];
  const over = isOverdue(card.dueDate);

  const colorFaint = color.replace(")", " / 0.2)");
  const colorMid = color.replace(")", " / 0.35)");
  const colorPill = color.replace(")", " / 0.1)");
  const colorPillBorder = color.replace(")", " / 0.3)");
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
        {card.title}
      </h4>

      {/* Description */}
      {card.description && (
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
          {card.description}
        </p>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: "0.58rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: color,
                background: colorPill,
                border: `1px solid ${colorPillBorder}`,
                borderRadius: "2px",
                padding: "1px 5px",
                textShadow: "none",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Due date */}
      {card.dueDate && (
        <div
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "0.62rem",
            letterSpacing: "0.06em",
            color: over ? "oklch(0.65 0.28 25)" : "oklch(0.48 0.04 35)",
            marginBottom: "8px",
          }}
        >
          {over ? "⚠ OVERDUE: " : "DUE: "}
          {formatDate(card.dueDate)}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveLeft(card.id)}
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
            onClick={() => onMoveRight(card.id)}
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
          onClick={() => onDelete(card.id)}
          data-ocid={`hub.delete_button.${dataIndex}`}
          className="forge-btn p-1 opacity-40 hover:opacity-100"
          title="Delete card"
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

// ── AddCardForm ─────────────────────────────────────────────────────────────────

interface AddCardFormProps {
  stage: Stage;
  initialDescription?: string;
  onAdd: (card: Omit<ProjectCard, "id" | "createdAt" | "stage">) => void;
  onCancel: () => void;
}

function AddCardForm({
  stage,
  initialDescription,
  onAdd,
  onCancel,
}: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [dueDate, setDueDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const color = STAGE_COLORS[stage];
  const colorBorder = color.replace(")", " / 0.4)");
  const colorShadow = color.replace(")", " / 0.2)");
  const colorInputBorder = color.replace(")", " / 0.3)");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
      dueDate,
    });
  };

  const labelStyle = {
    display: "block",
    fontFamily: "Cinzel, serif",
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "oklch(0.6 0.08 30)",
    marginBottom: "4px",
  } as const;

  return (
    <div
      data-ocid="hub.dialog"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.1 0.01 20) 0%, oklch(0.13 0.012 22) 100%)",
        border: `1px solid ${colorBorder}`,
        borderRadius: "4px",
        padding: "14px",
        boxShadow: `0 0 20px ${colorShadow}, 0 8px 24px oklch(0 0 0 / 0.6)`,
      }}
    >
      {/* Title */}
      <div className="mb-3">
        <label htmlFor="form-title" style={labelStyle}>
          TITLE *
        </label>
        <input
          id="form-title"
          data-ocid="hub.input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Project title..."
          style={{
            width: "100%",
            background: "oklch(0.08 0.005 20)",
            border: `1px solid ${colorInputBorder}`,
            borderRadius: "3px",
            padding: "6px 10px",
            fontFamily: "Cinzel, serif",
            fontSize: "0.75rem",
            color: "oklch(0.88 0.02 60)",
            letterSpacing: "0.03em",
            outline: "none",
          }}
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label htmlFor="form-desc" style={labelStyle}>
          DESCRIPTION
        </label>
        <textarea
          id="form-desc"
          data-ocid="hub.textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this creation about?"
          rows={2}
          style={{
            width: "100%",
            background: "oklch(0.08 0.005 20)",
            border: "1px solid oklch(0.25 0.05 25)",
            borderRadius: "3px",
            padding: "6px 10px",
            fontFamily: "Cinzel, serif",
            fontSize: "0.72rem",
            color: "oklch(0.88 0.02 60)",
            letterSpacing: "0.02em",
            outline: "none",
            resize: "none",
          }}
        />
      </div>

      {/* Tags */}
      <div className="mb-3">
        <span style={{ ...labelStyle, display: "block" }}>TAGS</span>
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESET_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            const tagBg = active
              ? color.replace(")", " / 0.15)")
              : "oklch(0.1 0.008 20)";
            const tagBorder = active
              ? color.replace(")", " / 0.5)")
              : "oklch(0.25 0.04 25)";
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: active ? color : "oklch(0.5 0.04 30)",
                  background: tagBg,
                  border: `1px solid ${tagBorder}`,
                  borderRadius: "2px",
                  padding: "2px 7px",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Custom tag..."
            style={{
              flex: 1,
              background: "oklch(0.08 0.005 20)",
              border: "1px solid oklch(0.22 0.04 25)",
              borderRadius: "3px",
              padding: "4px 8px",
              fontFamily: "Cinzel, serif",
              fontSize: "0.68rem",
              color: "oklch(0.85 0.02 60)",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="forge-btn px-2 text-xs"
            style={{ fontSize: "0.65rem" }}
          >
            +
          </button>
        </div>
      </div>

      {/* Due date */}
      <div className="mb-4">
        <label htmlFor="form-due" style={labelStyle}>
          DUE DATE
        </label>
        <input
          id="form-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            background: "oklch(0.08 0.005 20)",
            border: "1px solid oklch(0.25 0.05 25)",
            borderRadius: "3px",
            padding: "5px 10px",
            fontFamily: "Cinzel, serif",
            fontSize: "0.72rem",
            color: "oklch(0.75 0.03 40)",
            colorScheme: "dark",
            outline: "none",
          }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          data-ocid="hub.submit_button"
          disabled={!title.trim()}
          className="forge-btn flex-1 py-2 text-xs tracking-widest disabled:opacity-40"
          style={{
            color: title.trim() ? color : "oklch(0.45 0.04 25)",
            borderColor: title.trim()
              ? color.replace(")", " / 0.5)")
              : undefined,
          }}
        >
          <Flame size={12} className="inline mr-1" /> FORGE IT
        </button>
        <button
          type="button"
          onClick={onCancel}
          data-ocid="hub.cancel_button"
          className="forge-btn px-4 py-2 text-xs tracking-widest"
          style={{ color: "oklch(0.5 0.04 25)" }}
        >
          <X size={12} className="inline mr-1" /> CANCEL
        </button>
      </div>
    </div>
  );
}

// ── Main ProjectHub ───────────────────────────────────────────────────────────────────

interface ProjectHubProps {
  hubAIContent?: string[];
}

export default function ProjectHub({ hubAIContent = [] }: ProjectHubProps) {
  const [cards, setCards] = useState<ProjectCard[]>(SEED_CARDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToStage, setAddingToStage] = useState<Stage | null>(null);
  const [addingWithContent, setAddingWithContent] = useState<
    string | undefined
  >(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // When new AI content arrives, open the idea column form with that content pre-filled
  useEffect(() => {
    if (hubAIContent.length > 0) {
      const latest = hubAIContent[hubAIContent.length - 1];
      setAddingWithContent(latest);
      setAddingToStage("idea");
    }
  }, [hubAIContent]);

  const filteredCards = useCallback(
    (stage: Stage) => {
      return cards
        .filter((c) => c.stage === stage)
        .filter((c) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [cards, searchQuery],
  );

  const handleAddCard = (
    stage: Stage,
    data: Omit<ProjectCard, "id" | "createdAt" | "stage">,
  ) => {
    const card: ProjectCard = {
      id: genId(),
      ...data,
      stage,
      createdAt: Date.now(),
    };
    setCards((prev) => [card, ...prev]);
    setAddingToStage(null);
    setAddingWithContent(undefined);
  };

  const handleMoveLeft = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.indexOf(c.stage);
        if (idx <= 0) return c;
        return { ...c, stage: STAGES[idx - 1] };
      }),
    );
  };

  const handleMoveRight = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = STAGES.indexOf(c.stage);
        if (idx >= STAGES.length - 1) return c;
        return { ...c, stage: STAGES[idx + 1] };
      }),
    );
  };

  const handleDelete = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const totalCards = cards.length;
  const publishedCount = cards.filter((c) => c.stage === "published").length;

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      {/* ── Hub Header ── */}
      <div
        data-ocid="hub.section"
        className="stone-panel px-4 py-3 mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{
          borderLeft: "none",
          borderRight: "none",
          borderTop: "none",
          borderBottom: "1px solid oklch(0.28 0.07 25)",
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div>
            <h2
              className="gothic-title"
              style={{ fontSize: "1.1rem", letterSpacing: "0.1em" }}
            >
              ⚔ FORGE HUB
            </h2>
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: "0.62rem",
                color: "oklch(0.42 0.05 30)",
                letterSpacing: "0.12em",
                marginTop: "1px",
              }}
            >
              {totalCards} PROJECTS · {publishedCount} PUBLISHED
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "oklch(0.45 0.06 30)",
              pointerEvents: "none",
            }}
          />
          <input
            data-ocid="hub.search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH PROJECTS..."
            aria-label="Search projects"
            style={{
              width: "100%",
              background: "oklch(0.09 0.007 20)",
              border: "1px solid oklch(0.3 0.07 25)",
              borderRadius: "3px",
              padding: "7px 10px 7px 30px",
              fontFamily: "Cinzel, serif",
              fontSize: "0.68rem",
              letterSpacing: "0.06em",
              color: "oklch(0.82 0.02 55)",
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "oklch(0.45 0.06 30)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto pb-4" style={{ minWidth: 0 }}>
        <div className="flex gap-3 px-3 md:px-4" style={{ minWidth: "800px" }}>
          {STAGES.map((stage) => {
            const stageIndex = STAGES.indexOf(stage);
            const columnCards = filteredCards(stage);
            const color = STAGE_COLORS[stage];
            const glow = STAGE_GLOW[stage];
            const emptyDash = color.replace(")", " / 0.2)");

            return (
              <div
                key={stage}
                data-ocid="hub.panel"
                style={{
                  flex: "1 1 0",
                  minWidth: "180px",
                  maxWidth: "260px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Column header */}
                <div
                  className="stone-panel px-3 py-2.5 flex items-center justify-between"
                  style={{
                    borderBottom: `2px solid ${color}`,
                    boxShadow: `0 0 12px ${glow}, inset 0 -2px 0 ${glow}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "14px" }}>
                      {STAGE_ICONS[stage]}
                    </span>
                    <span
                      style={{
                        fontFamily: "Cinzel Decorative, Cinzel, serif",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        letterSpacing: "0.1em",
                        color: color,
                        textShadow: `0 0 10px ${glow}`,
                      }}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "oklch(0.4 0.04 30)",
                      background: "oklch(0.1 0.007 20)",
                      border: "1px solid oklch(0.25 0.04 25)",
                      borderRadius: "10px",
                      padding: "1px 7px",
                      minWidth: "22px",
                      textAlign: "center",
                    }}
                  >
                    {columnCards.length}
                  </span>
                </div>

                {/* Cards list */}
                <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                  <AnimatePresence mode="popLayout">
                    {columnCards.length === 0 && addingToStage !== stage ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        data-ocid="hub.empty_state"
                        style={{
                          border: `1px dashed ${emptyDash}`,
                          borderRadius: "4px",
                          padding: "20px 12px",
                          textAlign: "center",
                          color: "oklch(0.35 0.03 30)",
                          fontFamily: "Cinzel, serif",
                          fontSize: "0.62rem",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {searchQuery ? "NO MATCHES" : "EMPTY FORGE"}
                      </motion.div>
                    ) : (
                      columnCards.map((card, i) => (
                        <KanbanCard
                          key={card.id}
                          card={card}
                          stageIndex={stageIndex}
                          onMoveLeft={handleMoveLeft}
                          onMoveRight={handleMoveRight}
                          onDelete={(id) => setDeleteConfirm(id)}
                          dataIndex={i + 1}
                        />
                      ))
                    )}
                  </AnimatePresence>

                  {/* Inline add form */}
                  <AnimatePresence>
                    {addingToStage === stage && (
                      <motion.div
                        key="add-form"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      >
                        <AddCardForm
                          stage={stage}
                          initialDescription={
                            stage === "idea" ? addingWithContent : undefined
                          }
                          onAdd={(data) => handleAddCard(stage, data)}
                          onCancel={() => {
                            setAddingToStage(null);
                            setAddingWithContent(undefined);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add button */}
                {addingToStage !== stage && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToStage(stage);
                      setAddingWithContent(undefined);
                    }}
                    data-ocid="hub.open_modal_button"
                    className="forge-btn w-full py-2 text-xs tracking-widest flex items-center justify-center gap-1.5"
                    style={{
                      color: "oklch(0.48 0.06 30)",
                      borderColor: "oklch(0.22 0.04 25)",
                    }}
                  >
                    <Plus size={12} />
                    ADD PROJECT
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Delete Confirm ── */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent
          data-ocid="hub.dialog"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.09 0.008 20) 0%, oklch(0.12 0.01 22) 100%)",
            border: "1px solid oklch(0.45 0.2 25 / 0.5)",
            boxShadow:
              "0 0 30px oklch(0.45 0.2 25 / 0.2), 0 20px 60px oklch(0 0 0 / 0.8)",
            borderRadius: "4px",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="gothic-title"
              style={{ fontSize: "1rem", letterSpacing: "0.1em" }}
            >
              ⚠ DESTROY THIS PROJECT?
            </DialogTitle>
          </DialogHeader>
          <p
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "0.75rem",
              color: "oklch(0.5 0.04 30)",
              letterSpacing: "0.05em",
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            This forge entry will be permanently destroyed. The void does not
            offer refunds.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              data-ocid="hub.confirm_button"
              className="forge-btn flex-1 py-2 text-xs tracking-widest"
              style={{ color: "oklch(0.65 0.28 25)" }}
            >
              DESTROY IT
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="hub.cancel_button"
              className="forge-btn px-5 py-2 text-xs tracking-widest"
              style={{ color: "oklch(0.5 0.04 30)" }}
            >
              RETREAT
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
