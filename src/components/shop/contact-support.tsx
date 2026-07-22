"use client";
import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function ContactSupport() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    fetch("/api/chat").then(r => { if (r.ok) setAuthed(true); }).catch(() => {});
  }, []);
  if (!authed) return null;
  return (
    <Link
      href="/chat"
      className="fixed bottom-20 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all hover:scale-105"
      title="الدعم الفني"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}
