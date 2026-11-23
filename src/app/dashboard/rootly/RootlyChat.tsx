"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bot, Info, Send, Sparkles } from "lucide-react";
import { CanopyLogo } from "@/components/CanopyLogo";

interface Message {
  id: number;
  role: "user" | "rootly";
  text: string;
  source?: "guardrail" | "ai" | "plant-file";
  notice?: string;
}

interface ApiReply {
  reply?: string;
  source?: "guardrail" | "ai" | "plant-file";
  plant?: string | null;
  notice?: string;
  error?: string;
}

export function RootlyChat({
  supported,
  myPlants,
  aiConfigured,
}: {
  supported: string[];
  myPlants: string[];
  aiConfigured: boolean;
}) {
  const focus = myPlants[0] ?? supported[0] ?? "Tulsi";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "rootly",
      text: `Hi, I'm Rootly! Ask me about watering, sunlight movement, manure/fertilizer, soil or plant health. I currently know about: ${supported.join(", ") || "no plants yet"}.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [plant, setPlant] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const chips = [
    `How often should I water my ${focus}?`,
    `Does ${focus} need full sun or shade?`,
    `When should I add manure to my ${focus}?`,
    `What soil is best for ${focus}?`,
    `Why might my ${focus} look unhealthy?`,
  ];

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { id: nextId.current++, role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/rootly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, plant: plant || null }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiReply;
      if (!res.ok || !data.reply) {
        setError(data.error ?? "Rootly couldn't answer just now. Please try again.");
        return;
      }
      if (data.plant) setPlant(data.plant); // follow-ups ("and fertilizer?") keep the same plant
      setMessages((m) => [
        ...m,
        { id: nextId.current++, role: "rootly", text: data.reply!, source: data.source, notice: data.notice },
      ]);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex h-[calc(100vh-15rem)] min-h-[480px] flex-col overflow-hidden md:h-[calc(100vh-13rem)]">
      {/* status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-inkline bg-pond/40 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Bot size={16} aria-hidden="true" />
          Grounded in Canopy&apos;s plant file
        </p>
        <p
          className={`chip ${aiConfigured ? "bg-leaf text-white" : "bg-sand-soft"}`}
          title={aiConfigured ? "OpenAI is connected" : "Add OPENAI_API_KEY to .env.local to enable AI phrasing"}
        >
          {aiConfigured ? <Sparkles size={13} aria-hidden="true" /> : <Info size={13} aria-hidden="true" />}
          {aiConfigured ? "AI connected" : "Plant-file mode (no AI key)"}
        </p>
      </div>

      {/* messages */}
      <div role="log" aria-live="polite" aria-label="Conversation with Rootly" className="flex-1 space-y-4 overflow-y-auto bg-parchment/70 p-4 sm:p-5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {m.role === "rootly" && <CanopyLogo size={36} className="shrink-0" />}
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl border-2 border-inkline px-4 py-3 text-sm leading-relaxed shadow-[3px_3px_0_#1E3A29] ${
                  m.role === "user" ? "bg-lotus/80" : "bg-surface"
                }`}
              >
                {m.text}
                {m.notice && (
                  <span className="mt-2 block border-t border-inkline/20 pt-2 text-xs text-muted">{m.notice}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex items-end gap-2.5" role="status">
            <CanopyLogo size={36} className="shrink-0" />
            <div className="rounded-2xl border-2 border-inkline bg-surface px-4 py-3 text-sm shadow-[3px_3px_0_#1E3A29]">
              <span className="sr-only">Rootly is thinking</span>
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="inline-block h-2 w-2 rounded-full bg-moss"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="border-t-2 border-inkline bg-surface p-3 sm:p-4">
        {error && (
          <p role="alert" className="mb-2 rounded-xl border-2 border-danger bg-[#fbe9e4] px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <div className="mb-3 flex flex-wrap gap-2" aria-label="Quick questions">
          {chips.map((c) => (
            <button key={c} type="button" onClick={() => ask(c)} disabled={busy} className="chip cursor-pointer hover:bg-sand-soft disabled:opacity-50">
              {c}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="sm:w-44">
            <label htmlFor="rootly-plant" className="sr-only">Plant you&apos;re asking about</label>
            <select id="rootly-plant" value={plant} onChange={(e) => setPlant(e.target.value)} className="field !py-2.5">
              <option value="">Any plant</option>
              {supported.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <label htmlFor="rootly-input" className="sr-only">Your question</label>
          <input
            id="rootly-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="Ask Rootly about your plants…"
            className="field flex-1"
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary">
            <Send size={16} aria-hidden="true" /> Ask
          </button>
        </form>
      </div>
    </div>
  );
}
