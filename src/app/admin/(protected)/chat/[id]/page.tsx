"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, XCircle, Check } from "lucide-react";
import Link from "next/link";

type Sender = { id: string; name: string | null; role: string };
type Message = { id: string; content: string; senderId: string; sender: Sender; createdAt: string; read: boolean };
type Customer = { id: string; name: string | null; email: string };

export default function AdminChatDetail() {
  const { t, direction } = useI18n();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState("OPEN");
  const [subject, setSubject] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/chat/${id}`);
      if (!res.ok) { router.push("/admin/chat"); return; }
      const data = await res.json();
      setMessages(data.messages);
      setCustomer(data.customer);
      setStatus(data.status);
      setSubject(data.subject);
    } catch { router.push("/admin/chat"); }
  }, [id, router]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { const iv = setInterval(fetchMessages, 5000); return () => clearInterval(iv); }, [fetchMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`/api/admin/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        if (status === "CLOSED") setStatus("OPEN");
      }
    } catch {}
    setSending(false);
  };

  const handleToggleStatus = async () => {
    const newStatus = status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/admin/chat/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setStatus(newStatus);
    } catch {}
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Link href="/admin/chat" className="p-1 -ml-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className={`h-5 w-5 ${direction === "rtl" ? "rotate-180" : ""}`} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${status === "CLOSED" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
              {customer?.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="font-medium text-sm">{customer?.name || customer?.email || "—"}</p>
              {subject && <p className="text-xs text-muted-foreground">{subject}</p>}
            </div>
          </div>
        </div>
        <button onClick={handleToggleStatus}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === "CLOSED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >
          {status === "CLOSED" ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {status === "CLOSED" ? t("admin.chat_reopen") : t("admin.chat_close")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => {
          const isAdmin = msg.sender.role === "ADMIN";
          return (
            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isAdmin ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {status !== "CLOSED" && (
        <div className="border-t p-4 shrink-0">
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t("admin.chat_placeholder")}
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
