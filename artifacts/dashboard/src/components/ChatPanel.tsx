import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, X, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
}

const SUGGESTED = [
  "Что такое ADR HIGH сигнал?",
  "Как работает Volume Bubble детекция?",
  "Что значит BIG BUY?",
  "Как читать прогресс-бар монеты?",
];

function MarkdownText({ text }: { text: string }) {
  // Very simple inline markdown: **bold**, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="bg-muted/60 px-1 py-0.5 rounded text-[10px] font-mono text-sky-300">{part.slice(1, -1)}</code>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${isUser ? "bg-violet-500/20" : "bg-emerald-500/10"}`}>
        {isUser
          ? <User size={12} className="text-violet-400" />
          : <Bot size={12} className="text-emerald-400" />}
      </div>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed font-mono ${
        isUser
          ? "bg-violet-500/15 border border-violet-500/20 text-foreground"
          : "bg-card border border-border text-foreground/90"
      }`}>
        {msg.loading
          ? <span className="flex items-center gap-1.5 text-muted-foreground"><Loader2 size={11} className="animate-spin" />думаю...</span>
          : msg.content.split("\n").map((line, i, arr) => (
              <span key={i}>
                <MarkdownText text={line} />
                {i < arr.length - 1 && <br />}
              </span>
            ))
        }
      </div>
    </div>
  );
}

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");

    const userMsg: Message = { role: "user", content };
    const assistantMsg: Message = { role: "assistant", content: "", loading: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });

      if (!res.body) throw new Error("No body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.content) {
              fullText += json.content;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: fullText, loading: false };
                return next;
              });
            }
          } catch {}
        }
      }

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: fullText || "...", loading: false };
        return next;
      });
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: "Ошибка соединения с AI.", loading: false };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 shadow-lg flex items-center justify-center transition-colors"
        title="AI Ассистент"
      >
        <MessageSquare size={18} className="text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-[480px] flex flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Bot size={11} className="text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-foreground/80">AI АССИСТЕНТ</span>
          <span className="text-[9px] font-mono text-muted-foreground">Groq · Llama 3.3</span>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-[9px] text-muted-foreground hover:text-foreground font-mono transition-colors"
              title="Очистить"
            >
              очистить
            </button>
          )}
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground font-mono text-center pt-2">
                Спроси что-нибудь о сигналах или стратегиях
              </p>
              <div className="space-y-1.5">
                {SUGGESTED.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="w-full text-left text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-card hover:border-violet-500/40 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-card flex-shrink-0">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Напиши вопрос..."
          disabled={streaming}
          className="flex-1 bg-transparent text-[11px] font-mono text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || streaming}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {streaming
            ? <Loader2 size={12} className="text-white animate-spin" />
            : <Send size={12} className="text-white" />}
        </button>
      </div>
    </div>
  );
}
