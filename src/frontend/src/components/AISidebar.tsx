import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToHub: (content: string) => void;
}

const TEMPLATES = [
  { id: "tiktok", label: "🔥 TikTok Script", key: "tiktok" },
  { id: "caption", label: "⚔️ Rewrite Caption", key: "caption" },
  { id: "ideas", label: "💀 10 Ideas", key: "ideas" },
  { id: "rap", label: "🐉 Rap Verse", key: "rap" },
  { id: "hook", label: "🎵 Hook Generator", key: "hook" },
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
    "HOOK: The void calls you at 3am...\n\nSCENE 1: Dark room, single red light\nVO: 'They said I couldn't survive the darkness...'\n\nCUT TO: Dragon scales flashing\nVO: 'The dragon inside proved them wrong.'\n\nCTA: Drop a 🔥 if you felt that.",
  caption:
    "Raw. Unfiltered. No apologies. The void don't lie — and neither does this creation. Built from darkness, forged in fire. #ForeverRaw #VoidMetal",
  ideas:
    "1. Dragons at dawn (golden hour + scales)\n2. Cracked stone throne room\n3. Ember rain over a dark city\n4. Warrior standing at void's edge\n5. Gothic cathedral in flames\n6. Chain and cross redemption arc\n7. Dragon eye close-up (extreme macro)\n8. Midnight forge scene\n9. Gargoyle on modern rooftop\n10. Raw hands building something ancient",
  rap: "I rise from the ashes of what they said I couldn't be / The dragon in my chest burns hotter than their jealousy / ForeverRaw etched in stone, in the void I found my throne / Built this empire brick by brick, now I stand here all alone / But the alone ain't lonely, it's sovereign, it's free / This is Void Metal power — this is you, this is me",
  hook: "Hook option 1: 'The void never forgets'\nHook option 2: 'Born in the dark, built for the light'\nHook option 3: 'They tried to cage the dragon'\nHook option 4: 'ForeverRaw — no filters, no chains'\nHook option 5: 'Stone cracks before I do'",
};

function getAIResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes("tiktok") || lowerMsg.includes("script")) {
    return TEMPLATE_RESPONSES.tiktok;
  }
  if (lowerMsg.includes("caption") || lowerMsg.includes("rewrite")) {
    return TEMPLATE_RESPONSES.caption;
  }
  if (
    lowerMsg.includes("idea") ||
    lowerMsg.includes("10") ||
    lowerMsg.includes("brainstorm")
  ) {
    return TEMPLATE_RESPONSES.ideas;
  }
  if (
    lowerMsg.includes("rap") ||
    lowerMsg.includes("verse") ||
    lowerMsg.includes("lyric")
  ) {
    return TEMPLATE_RESPONSES.rap;
  }
  if (
    lowerMsg.includes("hook") ||
    lowerMsg.includes("generator") ||
    lowerMsg.includes("catch")
  ) {
    return TEMPLATE_RESPONSES.hook;
  }

  const genericResponses = [
    `The void hears you, warrior. Your words carry the weight of dragon stone.\n\nHere is what the forge whispers back:\n\n"${userMessage}" — this is your raw material. Shape it with fire. Cut what doesn't serve the vision. What remains will be unbreakable.\n\n#ForeverRaw`,
    `From the depths of the void, the answer rises:\n\nYour creation is a weapon. Every word, every frame — a blade forged in darkness. Don't soften the edges. Don't apologize for the fire.\n\nThe dragon inside you already knows what this needs to become.`,
    `VOID METAL FORGE RESPONDS:\n\nDarkness is not the absence of light — it's the presence of power. Your vision holds that power.\n\nChannel it raw. Channel it real. The void rewards those who refuse to shrink.\n\nForeverRaw. No chains. No compromise.`,
  ];

  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AISidebar({
  isOpen,
  onClose,
  onSendToHub,
}: AISidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "The Forge Scribe awakens. 🐉\n\nSpeak your vision and I will shape it into void metal form. Use the templates below or type your own command.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight;
      }
    }
  };

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addMessage = (role: "user" | "ai", content: string) => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setTimeout(scrollToBottom, 50);
    return msg;
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    addMessage("user", text);
    setInputValue("");
    setIsTyping(true);

    setTimeout(
      () => {
        const response = getAIResponse(text);
        addMessage("ai", response);
        setIsTyping(false);
        setTimeout(scrollToBottom, 50);
      },
      800 + Math.random() * 700,
    );
  };

  const handleTemplateClick = (templateKey: TemplateKey) => {
    if (isTyping) return;
    const prompt = TEMPLATE_PROMPTS[templateKey];
    addMessage("user", prompt);
    setIsTyping(true);

    setTimeout(
      () => {
        addMessage("ai", TEMPLATE_RESPONSES[templateKey]);
        setIsTyping(false);
        setTimeout(scrollToBottom, 50);
      },
      600 + Math.random() * 600,
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          data-ocid="ai_sidebar.panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.07 0.006 20) 0%, oklch(0.1 0.009 22) 50%, oklch(0.06 0.004 18) 100%)",
            borderLeft: "1px solid oklch(0.3 0.08 25)",
            height: "100%",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
            style={{
              borderBottom: "1px solid oklch(0.28 0.07 25)",
              background:
                "linear-gradient(135deg, oklch(0.1 0.01 20) 0%, oklch(0.13 0.012 22) 100%)",
              boxShadow: "0 2px 12px oklch(0 0 0 / 0.5)",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-lg"
                style={{
                  filter: "drop-shadow(0 0 6px oklch(0.65 0.28 25 / 0.8))",
                }}
              >
                🐉
              </span>
              <span
                className="font-cinzel font-bold text-xs tracking-widest"
                style={{
                  color: "oklch(0.65 0.22 25)",
                  textShadow:
                    "0 0 10px oklch(0.55 0.25 25 / 0.6), 0 1px 2px oklch(0 0 0 / 0.9)",
                }}
              >
                AI FORGE SCRIBE
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              data-ocid="ai_sidebar.close_button"
              className="forge-btn w-7 h-7 flex items-center justify-center text-sm"
              style={{ padding: 0 }}
              aria-label="Close AI sidebar"
            >
              ✕
            </button>
          </div>

          {/* ── Template Buttons ── */}
          <div
            className="px-2.5 py-2.5 flex-shrink-0"
            style={{ borderBottom: "1px solid oklch(0.22 0.05 22)" }}
          >
            <p
              className="font-cinzel text-xs mb-2"
              style={{ color: "oklch(0.4 0.05 25)", letterSpacing: "0.12em" }}
            >
              TEMPLATES
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((tpl, idx) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateClick(tpl.key)}
                  disabled={isTyping}
                  data-ocid={`ai_sidebar.template.button.${idx + 1}`}
                  className="forge-btn py-1.5 px-2 text-xs text-left leading-tight"
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.03em",
                    color: isTyping
                      ? "oklch(0.4 0.05 25)"
                      : "oklch(0.62 0.18 25)",
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Message List ── */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
            <div className="px-2.5 py-2.5 space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  data-ocid={`ai_sidebar.message.item.${idx + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col gap-1 ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Bubble */}
                  <div
                    className="rounded px-3 py-2 max-w-[92%]"
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, oklch(0.22 0.08 25) 0%, oklch(0.18 0.06 22) 100%)",
                            border: "1px solid oklch(0.45 0.18 25)",
                            boxShadow:
                              "0 0 8px oklch(0.45 0.22 25 / 0.2), inset 0 1px 0 oklch(0.5 0.15 35 / 0.2)",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, oklch(0.12 0.01 20) 0%, oklch(0.15 0.012 22) 100%)",
                            border: "1px solid oklch(0.28 0.06 25)",
                            boxShadow: "0 2px 8px oklch(0 0 0 / 0.3)",
                          }
                    }
                  >
                    <p
                      className="font-cinzel text-xs whitespace-pre-wrap break-words leading-relaxed"
                      style={{
                        color:
                          msg.role === "user"
                            ? "oklch(0.75 0.22 25)"
                            : "oklch(0.72 0.05 35)",
                        fontSize: "0.7rem",
                      }}
                    >
                      {msg.content}
                    </p>

                    {/* Send to Hub button (AI messages only) */}
                    {msg.role === "ai" && msg.id !== "welcome" && (
                      <button
                        type="button"
                        onClick={() => onSendToHub(msg.content)}
                        className="mt-2 forge-btn flex items-center gap-1 px-2 py-1 text-xs"
                        style={{
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          color: "oklch(0.55 0.15 42)",
                          borderColor: "oklch(0.3 0.08 35)",
                        }}
                      >
                        ⚡ SEND TO HUB
                      </button>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span
                    className="font-cinzel"
                    style={{
                      fontSize: "0.55rem",
                      color: "oklch(0.35 0.04 25)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    data-ocid="ai_sidebar.loading_state"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-start gap-1.5"
                  >
                    <div
                      className="px-3 py-2 rounded"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.12 0.01 20) 0%, oklch(0.15 0.012 22) 100%)",
                        border: "1px solid oklch(0.28 0.06 25)",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="block w-1 h-1 rounded-full"
                            style={{ background: "oklch(0.55 0.22 25)" }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* ── Input Area ── */}
          <div
            className="px-2.5 py-2.5 flex-shrink-0"
            style={{
              borderTop: "1px solid oklch(0.25 0.06 25)",
              background:
                "linear-gradient(0deg, oklch(0.08 0.006 20) 0%, oklch(0.1 0.008 20) 100%)",
            }}
          >
            <div className="flex gap-1.5">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                data-ocid="ai_sidebar.input"
                placeholder="Speak to the forge..."
                rows={2}
                disabled={isTyping}
                className="flex-1 rounded px-2.5 py-2 font-cinzel resize-none outline-none"
                style={{
                  background: "oklch(0.08 0.005 20)",
                  border: "1px solid oklch(0.28 0.07 25)",
                  color: "oklch(0.72 0.05 35)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.04em",
                  lineHeight: 1.4,
                  boxShadow: "inset 0 1px 3px oklch(0 0 0 / 0.4)",
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                data-ocid="ai_sidebar.send_button"
                className="forge-btn flex-shrink-0 flex flex-col items-center justify-center gap-0.5 px-2"
                style={{
                  minWidth: "40px",
                  color:
                    !inputValue.trim() || isTyping
                      ? "oklch(0.35 0.04 25)"
                      : "oklch(0.65 0.22 25)",
                  borderColor:
                    !inputValue.trim() || isTyping
                      ? "oklch(0.22 0.04 22)"
                      : "oklch(0.45 0.18 25)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                }}
                aria-label="Send message"
              >
                <span style={{ fontSize: "1rem" }}>🔥</span>
                <span>SEND</span>
              </button>
            </div>
            <p
              className="font-cinzel mt-1.5"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.32 0.04 25)",
                letterSpacing: "0.06em",
              }}
            >
              ENTER to send · SHIFT+ENTER for new line
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
