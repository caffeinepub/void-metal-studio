import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { Project } from "../backend";
import { useUpdateProject } from "../hooks/useQueries";

type ElementType = "text" | "rect" | "circle" | "image";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontSize?: number;
  color?: string;
  fill?: string;
  opacity?: number;
  imageUrl?: string;
}

const CANVAS_W = 1280;
const CANVAS_H = 720;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function DesignCanvas({
  activeProject,
}: { activeProject: Project | null }) {
  const updateProject = useUpdateProject();
  const [designNotesText, setDesignNotesText] = useState(
    activeProject?.designNotes ?? "",
  );
  const [notesOpen, setNotesOpen] = useState(false);

  const handleDesignNotesBlur = async () => {
    if (!activeProject) return;
    await updateProject
      .mutateAsync({
        id: activeProject.id,
        title: activeProject.title,
        scriptContent: activeProject.scriptContent,
        designNotes: designNotesText,
        videoNotes: activeProject.videoNotes,
      })
      .catch(() => {});
  };

  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: uid(),
      type: "text",
      x: 80,
      y: 80,
      width: 400,
      height: 60,
      text: "VOID-METAL FORGE",
      fontSize: 48,
      color: "#cc0000",
      opacity: 1,
    },
    {
      id: uid(),
      type: "rect",
      x: 80,
      y: 180,
      width: 200,
      height: 80,
      fill: "#1a0000",
      opacity: 1,
    },
    {
      id: uid(),
      type: "circle",
      x: 340,
      y: 220,
      width: 80,
      height: 80,
      fill: "#8b0000",
      opacity: 0.85,
    },
  ]);
  const [selected, setSelected] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dragging, setDragging] = useState<{
    id: string;
    ox: number;
    oy: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedEl = elements.find((e) => e.id === selected) ?? null;

  // ── Add helpers ──────────────────────────────────────────────

  const addText = () => {
    const el: CanvasElement = {
      id: uid(),
      type: "text",
      x: 100,
      y: 100 + elements.length * 20,
      width: 200,
      height: 40,
      text: "New Text",
      fontSize: 24,
      color: "#111111",
      opacity: 1,
    };
    setElements((prev) => [...prev, el]);
    setSelected(el.id);
  };

  const addRect = () => {
    const el: CanvasElement = {
      id: uid(),
      type: "rect",
      x: 120,
      y: 120 + elements.length * 10,
      width: 160,
      height: 80,
      fill: "#cc0000",
      opacity: 1,
    };
    setElements((prev) => [...prev, el]);
    setSelected(el.id);
  };

  const addCircle = () => {
    const el: CanvasElement = {
      id: uid(),
      type: "circle",
      x: 140,
      y: 140 + elements.length * 10,
      width: 80,
      height: 80,
      fill: "#8b0000",
      opacity: 1,
    };
    setElements((prev) => [...prev, el]);
    setSelected(el.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el: CanvasElement = {
      id: uid(),
      type: "image",
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      imageUrl: url,
      opacity: 1,
    };
    setElements((prev) => [...prev, el]);
    setSelected(el.id);
    e.target.value = "";
  };

  const deleteSelected = () => {
    if (!selected) return;
    setElements((prev) => prev.filter((e) => e.id !== selected));
    setSelected(null);
  };

  const updateEl = (id: string, patch: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  };

  // ── Drag handlers ────────────────────────────────────────────

  const getSVGPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected(id);
    const pt = getSVGPoint(e);
    const el = elements.find((el) => el.id === id);
    if (!el) return;
    setDragging({ id, ox: pt.x - el.x, oy: pt.y - el.y });
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      const pt = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      setElements((prev) =>
        prev.map((el) =>
          el.id === dragging.id
            ? { ...el, x: pt.x - dragging.ox, y: pt.y - dragging.oy }
            : el,
        ),
      );
    },
    [dragging],
  );

  const onMouseUp = () => setDragging(null);

  // ── Export ───────────────────────────────────────────────────

  const exportPNG = () => {
    const svg = svgRef.current;
    const canvas = hiddenCanvasRef.current;
    if (!svg || !canvas) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "void-metal-canvas.png";
      a.click();
    };
    img.src = url;
  };

  // ── Render ───────────────────────────────────────────────────

  return (
    <div
      data-ocid="design_canvas.section"
      className="flex flex-col h-full"
      style={{
        background: "#0a0a0a",
        fontFamily: "'JetBrains Mono', monospace",
        minHeight: "100vh",
      }}
    >
      {/* Project notes panel */}
      {activeProject && (
        <div
          style={{
            borderBottom: "1px solid #2a0a0a",
            background: "#0d0002",
          }}
        >
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            data-ocid="design_canvas.toggle"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 16px",
              fontFamily: "Cinzel, serif",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              color: "#cc0000",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>🎨 {activeProject.title.toUpperCase()} — DESIGN NOTES</span>
            <span>{notesOpen ? "▲" : "▼"}</span>
          </button>
          {notesOpen && (
            <div style={{ padding: "0 16px 10px" }}>
              <textarea
                value={designNotesText}
                onChange={(e) => setDesignNotesText(e.target.value)}
                onBlur={handleDesignNotesBlur}
                placeholder="Add design notes for this project..."
                data-ocid="design_canvas.textarea"
                rows={3}
                style={{
                  width: "100%",
                  background: "#080000",
                  border: "1px solid #3a0000",
                  borderRadius: "2px",
                  padding: "8px 10px",
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.7rem",
                  color: "#cc8888",
                  letterSpacing: "0.03em",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>
      )}
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: "1px solid #2a0000",
          background: "#0d0000",
        }}
      >
        <span
          style={{
            color: "#cc0000",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          ◈ DESIGN FORGE — CANVAS EDITOR
        </span>
        <button
          type="button"
          data-ocid="design_canvas.export_button"
          onClick={exportPNG}
          style={{
            background: "transparent",
            border: "1px solid #cc0000",
            color: "#cc0000",
            padding: "4px 14px",
            fontSize: "10px",
            letterSpacing: "0.15em",
            cursor: "pointer",
            textTransform: "uppercase",
            fontFamily: "inherit",
          }}
        >
          ⬇ EXPORT PNG
        </button>
      </div>

      {/* Body: toolbar | canvas | properties */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <aside
          style={{
            width: "56px",
            background: "#0d0000",
            borderRight: "1px solid #2a0000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "12px 0",
            gap: "8px",
          }}
        >
          {(
            [
              {
                ocid: "design_canvas.add_text_button",
                label: "T",
                title: "Add Text",
                onClick: addText,
              },
              {
                ocid: "design_canvas.add_rect_button",
                label: "▭",
                title: "Add Rectangle",
                onClick: addRect,
              },
              {
                ocid: "design_canvas.add_circle_button",
                label: "●",
                title: "Add Circle",
                onClick: addCircle,
              },
            ] as const
          ).map((btn) => (
            <button
              key={btn.ocid}
              type="button"
              data-ocid={btn.ocid}
              title={btn.title}
              onClick={btn.onClick}
              style={{
                width: "36px",
                height: "36px",
                background: "transparent",
                border: "1px solid #3a0000",
                color: "#cc0000",
                fontSize: btn.label === "T" ? "16px" : "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
                lineHeight: 1,
              }}
            >
              {btn.label}
            </button>
          ))}

          {/* Upload image */}
          <button
            type="button"
            data-ocid="design_canvas.upload_button"
            title="Upload Image"
            onClick={() => imageInputRef.current?.click()}
            style={{
              width: "36px",
              height: "36px",
              background: "transparent",
              border: "1px solid #3a0000",
              color: "#cc0000",
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            ↑
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          {/* Divider */}
          <div
            style={{
              width: "32px",
              height: "1px",
              background: "#2a0000",
              margin: "4px 0",
            }}
          />

          {/* BG color */}
          <div
            title="Background Color"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <span
              style={{
                color: "#550000",
                fontSize: "8px",
                letterSpacing: "0.05em",
              }}
            >
              BG
            </span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{
                width: "28px",
                height: "24px",
                border: "1px solid #3a0000",
                background: "transparent",
                cursor: "pointer",
                padding: "1px",
              }}
            />
          </div>
        </aside>

        {/* Canvas area */}
        <div
          className="flex-1 flex items-center justify-center overflow-auto"
          style={{ background: "#111", padding: "24px" }}
          onClick={() => setSelected(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelected(null);
          }}
          role="presentation"
        >
          <div
            style={{
              boxShadow: "0 0 40px rgba(0,0,0,0.8), 0 0 2px #cc0000",
              lineHeight: 0,
              userSelect: "none",
              maxWidth: "100%",
            }}
          >
            <svg
              ref={svgRef}
              data-ocid="design_canvas.canvas_target"
              width={CANVAS_W}
              height={CANVAS_H}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              style={{
                background: bgColor,
                display: "block",
                maxWidth: "100%",
                height: "auto",
                cursor: dragging ? "grabbing" : "default",
              }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <title>Design Canvas</title>
              {elements.map((el) => {
                const isSelected = el.id === selected;
                const selectionStyle = isSelected
                  ? {
                      stroke: "#cc0000",
                      strokeDasharray: "6 3",
                      strokeWidth: 2,
                      fill: "none",
                      pointerEvents: "none" as const,
                    }
                  : {};

                return (
                  <g
                    key={el.id}
                    style={{ cursor: "grab", opacity: el.opacity ?? 1 }}
                    onMouseDown={(e) => onMouseDown(e, el.id)}
                  >
                    {el.type === "text" && (
                      <>
                        <text
                          x={el.x}
                          y={el.y + (el.fontSize ?? 24)}
                          fontSize={el.fontSize ?? 24}
                          fill={el.color ?? "#000"}
                          fontFamily="JetBrains Mono, monospace"
                          style={{ userSelect: "none" }}
                        >
                          {el.text}
                        </text>
                        {isSelected && (
                          <rect
                            x={el.x - 4}
                            y={el.y}
                            width={el.width + 8}
                            height={el.height}
                            {...selectionStyle}
                          />
                        )}
                      </>
                    )}

                    {el.type === "rect" && (
                      <>
                        <rect
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          fill={el.fill ?? "#cc0000"}
                        />
                        {isSelected && (
                          <rect
                            x={el.x - 4}
                            y={el.y - 4}
                            width={el.width + 8}
                            height={el.height + 8}
                            {...selectionStyle}
                          />
                        )}
                      </>
                    )}

                    {el.type === "circle" && (
                      <>
                        <ellipse
                          cx={el.x + el.width / 2}
                          cy={el.y + el.height / 2}
                          rx={el.width / 2}
                          ry={el.height / 2}
                          fill={el.fill ?? "#8b0000"}
                        />
                        {isSelected && (
                          <rect
                            x={el.x - 4}
                            y={el.y - 4}
                            width={el.width + 8}
                            height={el.height + 8}
                            {...selectionStyle}
                          />
                        )}
                      </>
                    )}

                    {el.type === "image" && el.imageUrl && (
                      <>
                        <image
                          href={el.imageUrl}
                          x={el.x}
                          y={el.y}
                          width={el.width}
                          height={el.height}
                          preserveAspectRatio="xMidYMid meet"
                        />
                        {isSelected && (
                          <rect
                            x={el.x - 4}
                            y={el.y - 4}
                            width={el.width + 8}
                            height={el.height + 8}
                            {...selectionStyle}
                          />
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Properties panel */}
        <aside
          style={{
            width: selectedEl ? "220px" : "0",
            overflow: "hidden",
            transition: "width 0.2s ease",
            background: "#0d0000",
            borderLeft: "1px solid #2a0000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedEl && (
            <div
              style={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  color: "#cc0000",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #2a0000",
                  paddingBottom: "8px",
                }}
              >
                ◈ PROPERTIES
              </div>

              {/* Text properties */}
              {selectedEl.type === "text" && (
                <>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#770000",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      TEXT CONTENT
                    </span>
                    <input
                      data-ocid="design_canvas.input"
                      type="text"
                      value={selectedEl.text ?? ""}
                      onChange={(e) =>
                        updateEl(selectedEl.id, { text: e.target.value })
                      }
                      style={{
                        background: "#110000",
                        border: "1px solid #3a0000",
                        color: "#eee",
                        padding: "5px 8px",
                        fontSize: "11px",
                        fontFamily: "inherit",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#770000",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      FONT SIZE
                    </span>
                    <input
                      type="number"
                      min={8}
                      max={200}
                      value={selectedEl.fontSize ?? 24}
                      onChange={(e) =>
                        updateEl(selectedEl.id, {
                          fontSize: Number(e.target.value),
                        })
                      }
                      style={{
                        background: "#110000",
                        border: "1px solid #3a0000",
                        color: "#eee",
                        padding: "5px 8px",
                        fontSize: "11px",
                        fontFamily: "inherit",
                        outline: "none",
                        width: "100%",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#770000",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      TEXT COLOR
                    </span>
                    <input
                      data-ocid="design_canvas.select"
                      type="color"
                      value={selectedEl.color ?? "#000000"}
                      onChange={(e) =>
                        updateEl(selectedEl.id, { color: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: "32px",
                        border: "1px solid #3a0000",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </label>
                </>
              )}

              {/* Shape properties */}
              {(selectedEl.type === "rect" || selectedEl.type === "circle") && (
                <>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#770000",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      FILL COLOR
                    </span>
                    <input
                      data-ocid="design_canvas.select"
                      type="color"
                      value={selectedEl.fill ?? "#cc0000"}
                      onChange={(e) =>
                        updateEl(selectedEl.id, { fill: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: "32px",
                        border: "1px solid #3a0000",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        color: "#770000",
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      OPACITY — {Math.round((selectedEl.opacity ?? 1) * 100)}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={selectedEl.opacity ?? 1}
                      onChange={(e) =>
                        updateEl(selectedEl.id, {
                          opacity: Number(e.target.value),
                        })
                      }
                      style={{ width: "100%", accentColor: "#cc0000" }}
                    />
                  </label>
                </>
              )}

              {/* Image opacity */}
              {selectedEl.type === "image" && (
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: "#770000",
                      fontSize: "9px",
                      letterSpacing: "0.1em",
                    }}
                  >
                    OPACITY — {Math.round((selectedEl.opacity ?? 1) * 100)}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selectedEl.opacity ?? 1}
                    onChange={(e) =>
                      updateEl(selectedEl.id, {
                        opacity: Number(e.target.value),
                      })
                    }
                    style={{ width: "100%", accentColor: "#cc0000" }}
                  />
                </label>
              )}

              {/* Delete */}
              <button
                type="button"
                data-ocid="design_canvas.delete_button"
                onClick={deleteSelected}
                style={{
                  marginTop: "8px",
                  background: "transparent",
                  border: "1px solid #cc0000",
                  color: "#cc0000",
                  padding: "6px",
                  fontSize: "9px",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                ✕ DELETE ELEMENT
              </button>
            </div>
          )}

          {!selectedEl && (
            <div
              style={{
                padding: "16px",
                color: "#330000",
                fontSize: "9px",
                letterSpacing: "0.1em",
                lineHeight: 1.8,
              }}
            >
              SELECT AN ELEMENT TO EDIT PROPERTIES
            </div>
          )}
        </aside>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
