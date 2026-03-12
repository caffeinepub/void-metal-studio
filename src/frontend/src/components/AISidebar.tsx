import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "../backend";
import { useActor } from "../hooks/useActor";
import { useUpdateProject } from "../hooks/useQueries";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToHub?: (content: string) => void;
  activeProject: Project | null;
}

const TEMPLATES = [
  { id: "tiktok", label: "\uD83D\uDD25 TikTok Script", key: "tiktok" },
  { id: "caption", label: "\u2694\uFE0F Rewrite Caption", key: "caption" },
  { id: "ideas", label: "\uD83D\uDC80 10 Ideas", key: "ideas" },
  { id: "rap", label: "\uD83D\uDC09 Rap Verse", key: "rap" },
  { id: "hook", label: "\uD83C\uDFB5 Hook Generator", key: "hook" },
] as const;

type TemplateKey = (typeof TEMPLATES)[number]["key"];

const TEMPLATE_PROMPTS: Record<TemplateKey, string> = {
  tiktok: "Generate a TikTok script for me",
  caption: "Rewrite my caption in Void Metal style",
  ideas: "Give me 10 content ideas",
  rap: "Write a Void Metal rap verse",
  hook: "Generate 5 powerful hooks for my content",
};

const TEMPLATE_RESPONSES: Record<TemplateKey, string> = {
  tiktok:
    "HOOK: The void calls you at 3am...\n\nSCENE 1: Dark room, single red light\nVO: 'They said I couldn't survive the darkness...'\n\nCUT TO: Dragon scales flashing\nVO: 'The dragon inside proved them wrong.'\n\nCTA: Drop a \uD83D\uDD25 if you felt that.",
  caption:
    "Raw. Unfiltered. No apologies. The void don't lie \u2014 and neither does this creation. Built from darkness, forged in fire. #ForeverRaw #VoidMetal",
  ideas:
    "1. Dragons at dawn (golden hour + scales)\n2. Cracked stone throne room\n3. Ember rain over a dark city\n4. Warrior standing at void's edge\n5. Gothic cathedral in flames\n6. Chain and cross redemption arc\n7. Dragon eye close-up (extreme macro)\n8. Midnight forge scene\n9. Gargoyle on modern rooftop\n10. Raw hands building something ancient",
  rap: "I rise from the ashes of what they said I couldn't be / The dragon in my chest burns hotter than their jealousy / ForeverRaw etched in stone, in the void I found my throne / Built this empire brick by brick, now I stand here all alone / But the alone ain't lonely, it's sovereign, it's free / This is Void Metal power \u2014 this is you, this is me",
  hook: "Hook option 1: 'The void never forgets'\nHook option 2: 'Born in the dark, built for the light'\nHook option 3: 'They tried to cage the dragon'\nHook option 4: 'ForeverRaw \u2014 no filters, no chains'\nHook option 5: 'Stone cracks before I do'",
};

function getAIResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  if (lowerMsg.includes("tiktok") || lowerMsg.includes("script"))
    return TEMPLATE_RESPONSES.tiktok;
  if (lowerMsg.includes("caption") || lowerMsg.includes("rewrite"))
    return TEMPLATE_RESPONSES.caption;
  if (lowerMsg.includes("idea") || lowerMsg.includes("brainstorm"))
    return TEMPLATE_RESPONSES.ideas;
  if (
    lowerMsg.includes("rap") ||
    lowerMsg.includes("verse") ||
    lowerMsg.includes("lyric")
  )
    return TEMPLATE_RESPONSES.rap;
  if (lowerMsg.includes("hook") || lowerMsg.includes("generator"))
    return TEMPLATE_RESPONSES.hook;
  return `VOID METAL FORGE RESPONDS:\n\n"${userMessage}" \u2014 your raw material. Shape it with fire. Cut what doesn't serve the vision. What remains will be unbreakable.\n\n#ForeverRaw`;
}

export default function AISidebar({
  isOpen,
  onClose,
  onSendToHub,
  activeProject,
}: AISidebarProps) {
  const { actor } = useActor();
  const updateProject = useUpdateProject();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load AI history when active project changes
  useEffect(() => {
    if (!activeProject || !actor) {
      setMessages([]);
      setHistoryLoaded(false);
      return;
    }
    setHistoryLoaded(false);
    actor
      .getAIHistory(activeProject.id)
      .then((history) => {
        const msgs: ChatMessage[] = history.map((h, i) => ({
          id: `hist-${i}`,
          role: h.role === "user" ? "user" : "ai",
          content: h.content,
          timestamp: new Date(Number(h.timestamp) / 1_000_000),
        }));
        setMessages(msgs);
        setHistoryLoaded(true);
      })
      .catch(() => {
        setMessages([]);
        setHistoryLoaded(true);
      });
  }, [activeProject, actor]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps intentional for scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (content?: string) => {
    const text = (content ?? inputValue).trim();
    if (!text) return;
    if (!activeProject) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Save user message to backend
    if (actor) {
      await actor.addAIMessage(activeProject.id, "user", text).catch(() => {});
    }

    // Generate AI response
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    const aiText = getAIResponse(text);
    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "ai",
      content: aiText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    // Save AI response to backend
    if (actor) {
      await actor
        .addAIMessage(activeProject.id, "assistant", aiText)
        .catch(() => {});
    }
  };

  const handleSendToHub = async (content: string) => {
    if (!activeProject || !actor) {
      onSendToHub?.(content);
      return;
    }
    await updateProject
      .mutateAsync({
        id: activeProject.id,
        title: activeProject.title,
        scriptContent: content,
        designNotes: activeProject.designNotes,
        videoNotes: activeProject.videoNotes,
      })
      .catch(() => {});
    onSendToHub?.(content);
  };

  const labelStyle = {
    fontFamily: "Cinzel, serif",
    fontSize: "0.62rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "oklch(0.5 0.06 30)",
  } as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            width: "300px",
            minWidth: "280px",
            background:
              "linear-gradient(180deg, oklch(0.1 0.01 20) 0%, oklch(0.09 0.008 18) 100%)",
            borderLeft: "1px solid oklch(0.3 0.08 25)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            maxHeight: "calc(100vh - 56px)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid oklch(0.22 0.04 25)" }}
          >
            <div>
              <h3
                style={{
                  fontFamily: "Cinzel Decorative, Cinzel, serif",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  color: "oklch(0.65 0.28 25)",
                  textShadow: "0 0 12px oklch(0.55 0.25 25 / 0.5)",
                }}
              >
                \uD83D\uDC09 AI FORGE SCRIBE
              </h3>
              {activeProject ? (
                <p
                  style={{
                    ...labelStyle,
                    marginTop: "2px",
                    color: "oklch(0.5 0.1 40)",
                  }}
                >
                  {activeProject.title.slice(0, 20)}
                  {activeProject.title.length > 20 ? "..." : ""}
                </p>
              ) : (
                <p
                  style={{
                    ...labelStyle,
                    marginTop: "2px",
                    color: "oklch(0.38 0.04 30)",
                  }}
                >
                  NO PROJECT ACTIVE
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              data-ocid="ai_sidebar.close_button"
              className="forge-btn p-1.5"
            >
              <X size={14} />
            </button>
          </div>

          {/* No project notice */}
          {!activeProject && (
            <div
              className="flex items-center justify-center flex-1"
              style={{ padding: "24px" }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.7rem",
                  color: "oklch(0.4 0.04 30)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.8,
                  border: "1px dashed oklch(0.25 0.05 25)",
                  borderRadius: "4px",
                  padding: "20px",
                }}
              >
                SELECT A PROJECT IN THE FORGE HUB TO START CRAFTING
              </div>
            </div>
          )}

          {/* Templates */}
          {activeProject && (
            <>
              <div
                className="px-3 py-2 flex flex-wrap gap-1.5"
                style={{ borderBottom: "1px solid oklch(0.18 0.03 25)" }}
              >
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSend(TEMPLATE_PROMPTS[t.key])}
                    data-ocid={`ai_sidebar.${t.id}.button`}
                    className="forge-btn text-xs px-2.5 py-1.5"
                    style={{
                      fontSize: "0.6rem",
                      letterSpacing: "0.04em",
                      color: "oklch(0.6 0.12 35)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="flex flex-col gap-3 p-3">
                  {!historyLoaded && (
                    <div
                      data-ocid="ai_sidebar.loading_state"
                      style={{
                        textAlign: "center",
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.62rem",
                        color: "oklch(0.45 0.05 30)",
                        padding: "12px",
                      }}
                    >
                      LOADING HISTORY...
                    </div>
                  )}
                  {historyLoaded && messages.length === 0 && (
                    <div
                      data-ocid="ai_sidebar.empty_state"
                      style={{
                        textAlign: "center",
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.62rem",
                        color: "oklch(0.4 0.04 30)",
                        letterSpacing: "0.06em",
                        padding: "20px 8px",
                        lineHeight: 1.7,
                        border: "1px dashed oklch(0.22 0.04 25)",
                        borderRadius: "3px",
                        marginTop: "8px",
                      }}
                    >
                      THE VOID AWAITS YOUR COMMAND.\nUSE A TEMPLATE OR TYPE
                      BELOW.
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf:
                          msg.role === "user" ? "flex-end" : "flex-start",
                        maxWidth: "88%",
                      }}
                    >
                      <div
                        style={{
                          background:
                            msg.role === "user"
                              ? "linear-gradient(135deg, oklch(0.22 0.08 25) 0%, oklch(0.18 0.06 22) 100%)"
                              : "linear-gradient(135deg, oklch(0.13 0.01 20) 0%, oklch(0.16 0.015 22) 100%)",
                          border: `1px solid ${
                            msg.role === "user"
                              ? "oklch(0.45 0.18 25 / 0.5)"
                              : "oklch(0.28 0.06 25)"
                          }`,
                          borderRadius: "3px",
                          padding: "8px 10px",
                          fontFamily: "Cinzel, serif",
                          fontSize: "0.72rem",
                          color:
                            msg.role === "user"
                              ? "oklch(0.88 0.02 60)"
                              : "oklch(0.82 0.02 50)",
                          lineHeight: 1.65,
                          whiteSpace: "pre-wrap",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {msg.content}
                        {msg.role === "ai" && (
                          <button
                            type="button"
                            onClick={() => handleSendToHub(msg.content)}
                            data-ocid="ai_sidebar.save_button"
                            className="forge-btn mt-2 w-full text-xs py-1 tracking-widest"
                            style={{
                              fontSize: "0.58rem",
                              color: "oklch(0.6 0.18 40)",
                              borderColor: "oklch(0.35 0.1 38 / 0.5)",
                            }}
                          >
                            \u26A1 SEND TO HUB
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div
                      data-ocid="ai_sidebar.loading_state"
                      style={{
                        alignSelf: "flex-start",
                        background: "oklch(0.13 0.01 20)",
                        border: "1px solid oklch(0.28 0.06 25)",
                        borderRadius: "3px",
                        padding: "8px 12px",
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.62rem",
                        color: "oklch(0.55 0.12 35)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      FORGE IS THINKING...
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div
                className="p-3"
                style={{ borderTop: "1px solid oklch(0.2 0.04 25)" }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSend()
                    }
                    placeholder="Command the forge..."
                    data-ocid="ai_sidebar.input"
                    disabled={isTyping}
                    style={{
                      flex: 1,
                      background: "oklch(0.08 0.005 20)",
                      border: "1px solid oklch(0.28 0.06 25)",
                      borderRadius: "3px",
                      padding: "7px 10px",
                      fontFamily: "Cinzel, serif",
                      fontSize: "0.72rem",
                      color: "oklch(0.88 0.02 60)",
                      letterSpacing: "0.02em",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isTyping}
                    data-ocid="ai_sidebar.submit_button"
                    className="forge-btn px-3"
                    style={{
                      color: "oklch(0.65 0.22 25)",
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
