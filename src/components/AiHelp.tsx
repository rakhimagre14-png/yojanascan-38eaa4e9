import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export function AiHelp() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: t("chatGreeting") }]);
    }
  }, [open, t, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        const err = lang === "en" && data.error ? data.error : t("chatError");
        setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err}` }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: t("chatError") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 h-14 rounded-full bg-primary px-5 text-primary-foreground shadow-xl hover:brightness-110"
          aria-label={t("aiHelp")}
        >
          <MessageCircle className="mr-2 size-5" />
          <span className="text-sm font-semibold">{t("aiHelp")}</span>
        </Button>
      )}

      {open && (
        <div
          className="fixed inset-x-2 bottom-2 z-50 flex max-h-[90vh] w-auto flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[560px] sm:w-96"
          role="dialog"
          aria-label={t("chatTitle")}
        >
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <div className="text-sm font-semibold">{t("chatTitle")}</div>
              <div className="text-[11px] opacity-80">{t("chatSubtitle")}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/10"
              aria-label={t("close")}
            >
              <X className="size-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background px-3 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? <SimpleMarkdown text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> {t("chatThinking")}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t bg-card px-3 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder")}
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="rounded-full bg-primary text-primary-foreground"
              aria-label={t("chatSend")}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

function renderInline(line: string, key: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s)]+)/g);
  return parts.map((p, i) => {
    const k = `${key}-${i}`;
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={k}>{p.slice(2, -2)}</strong>;
    const md = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    const url = md ? md[2] : /^https?:\/\//.test(p) ? p : null;
    if (url)
      return (
        <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-primary underline">
          {md ? md[1] : p}
        </a>
      );
    return <span key={k}>{p}</span>;
  });
}

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 whitespace-normal">
      {lines.map((raw, i) => {
        const line = raw.replace(/^#{1,6}\s+/, "");
        const bullet = line.match(/^\s*[*\-•]\s+(.*)$/);
        if (bullet)
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span aria-hidden>•</span>
              <span>{renderInline(bullet[1], String(i))}</span>
            </div>
          );
        if (!line.trim()) return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line, String(i))}</p>;
      })}
    </div>
  );
}
