"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import Link from "next/link";

type Sender = { name: string | null; role: string };
type Message = { id: string; content: string; sender: Sender; createdAt: string };
type Conv = { messages: Message[]; status: string; subject: string | null; admin: { name: string | null } | null };

export default function CustomerChatDetail() {
  const { t, direction } = useI18n();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conv, setConv] = useState<Conv | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchConv = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${id}`);
      if (!res.ok) { router.push("/chat"); return; }
      const data = await res.json();
      setConv(data);
    } catch { router.push("/chat"); }
  }, [id, router]);

  useEffect(() => { fetchConv(); }, [fetchConv]);
  useEffect(() => { const iv = setInterval(fetchConv, 5000); return () => clearInterval(iv); }, [fetchConv]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv?.messages]);

  useEffect(() => {
    if (conv?.messages?.length) {
      fetch(`/api/chat/${id}/read`, { method: "PATCH" }).catch(() => {});
    }
  }, [id, conv?.messages?.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || conv?.status === "CLOSED") return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setConv(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      }
    } catch {}
    setSending(false);
  };

  if (!conv) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-4 border-b shrink-0">
        <Link href="/chat" className="p-1 -ml-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className={`h-5 w-5 ${direction === "rtl" ? "rotate-180" : ""}`} />
        </Link>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${conv.status === "CLOSED" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{conv.subject || t("chat.admin")}</p>
          <p className={`text-xs ${conv.status === "CLOSED" ? "text-muted-foreground" : "text-green-600"}`}>
            {conv.status === "CLOSED" ? t("chat.closed") : conv.admin ? t("chat.admin") : t("chat.waiting")}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {conv.messages.map(msg => {
          const isCustomer = msg.sender.role !== "ADMIN";
          return (
            <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isCustomer ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isCustomer ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {conv.status !== "CLOSED" && (
        <div className="border-t pt-4 shrink-0">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
