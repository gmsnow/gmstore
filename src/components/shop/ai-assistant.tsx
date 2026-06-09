"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const replies: [string, string][] = [
  ["دفع", "طرق الدفع المتاحة:\n💳 الدفع عند الاستلام (كاش)\n💳 بطاقة ائتمان (Visa/Mastercard)\n💳 تحويل بنكي"],
  ["شراء", "يمكنك تصفح جميع المنتجات: /products. اختر المنتج وأضفه إلى السلة ثم أكمل الطلب."],
  ["منتجات", "تصفح جميع المنتجات: /products\nيمكنك البحث عن منتج معين بمربع البحث في الأعلى."],
  ["بيع", "سجل كتاجر: /register واختر 'تاجر' ثم أضف منتجاتك من لوحة التحكم."],
  ["تاجر", "سجل كتاجر: /register واختر 'تاجر'."],
  ["سعر", "جميع الأسعار على صفحة كل منتج. تصفح: /products"],
  ["لون", "اختر اللون عند إضافة المنتج للسلة. يمكنك تغييره لاحقاً من السلة /cart بالضغط على الدائرة الملونة."],
  ["توصيل", "مدة التوصيل تعتمد على منطقتك. تتبع طلبك: /track"],
  ["شحن", "مدة التوصيل تعتمد على منطقتك. تتبع طلبك: /track"],
  ["تتبع", "لتتبع طلبك أدخل رقم الطلب هنا: /track"],
  ["ترجيع", "للإرجاع تواصل معنا عبر البريد الإلكتروني."],
  ["استرجاع", "للإرجاع تواصل معنا عبر البريد الإلكتروني."],
  ["مرتجع", "للإرجاع تواصل معنا عبر البريد الإلكتروني."],
  ["استبدال", "للإستبدال تواصل معنا عبر البريد الإلكتروني."],
  ["خصم", "تابع العروض والتخفيضات: /products"],
  ["عروض", "تابع العروض والتخفيضات: /products"],
  ["تخفيض", "تابع العروض والتخفيضات: /products"],
  ["تسجيل", "أنشئ حساب جديد: /register"],
  ["دخول", "سجل الدخول: /login"],
  ["حساب", "أنشئ حساب أو سجل دخول: /register أو /login"],
  ["مساعدة", "أنا هنا لمساعدتك!\n🛍️ /products\n📦 /track\n💳 طرق الدفع\n🚚 التوصيل\n📝 /register"],
  ["السلام", "وعليكم السلام! كيف أقدر أساعدك؟ 🙂"],
  ["مرحبا", "مرحباً بك في GMstore! 🙂"],
  ["تحيه", "أهلاً وسهلاً!"],
  ["اهلا", "أهلاً وسهلاً!"],
  ["هلا", "هلا والله! 😊"],
  ["hello", "Welcome to GMstore! 🙂"],
  ["hi", "Hi there! Welcome to GMstore!"],
  ["help", "I'm here to help!\n🛍️ /products\n📦 /track\n💳 Payment\n🚚 Delivery\n📝 /register"],
  ["product", "Browse all products: /products\nUse search bar to find specific items."],
  ["order", "Track your order: /track"],
  ["color", "Select color when adding to cart. Change it later in /cart by clicking the color dot."],
  ["pay", "Payment methods:\n💳 Cash on delivery\n💳 Credit card (Visa/Mastercard)\n💳 Bank transfer"],
];

const fallbackReplies = [
  "أهلاً بك في GMstore!\n🛍️ ابحث عن منتج\n📦 تتبع طلبك\n💳 طرق الدفع\n💡 اكتب سؤالك!",
  "تصفح المنتجات: /products أو تتبع: /track. هل تبحث عن شيء معين؟",
  "اكتب ما تبحث عنه. مثلاً:\n- ابحث عن مصباح\n- كيفية الدفع\n- تتبع طلبي",
  "أنا مساعد GMstore. جرب:\n- أريد شراء...\n- كيف أدفع؟\n- أبي أتتبع طلبي",
];

function getSmartReply(input: string): string | null {
  const lower = input.toLowerCase();
  for (const [word, reply] of replies) {
    if (lower.includes(word)) return reply;
  }
  return null;
}

async function tryBrowserAI(messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    const ai = (window as any).ai;
    if (!ai?.languageModel) return null;
    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === "no") return null;
    const session = await ai.languageModel.create({
      systemPrompt: "أنت مساعد متجر GMstore للتسوق الإلكتروني باللغة العربية. تساعد العملاء باقتراح المنتجات والإجابة عن أسئلتهم. كن مفيداً وودوداً. أجب دائماً بالعربية.",
    });
    const lastMsg = messages[messages.length - 1]?.content || "";
    const result = await session.prompt(lastMsg);
    session.destroy();
    return result;
  } catch { return null; }
}

function extractProductQuery(text: string): string | null {
  const patterns = [
    /ابحث\s+عن\s+(.+)/i,
    /دور\s+لي\s+(.+)/i,
    /(?:عندك|عندكم)\s+(.+)/i,
    /(?:ابي|أبي|بدي|ودي)\s+(.+)/i,
    /(?:ادور|دور)\s+على\s+(.+)/i,
    /search\s+(?:for\s+)?(.+)/i,
    /find\s+(.+)/i,
    /(?:looking\s+for|want)\s+(.+)/i,
    /(?:قصدك|تقصد)\s+(.+)/i,
    /(?:شنو|شو|وش|ماهو)\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1] && m[1].length < 50) return m[1].trim();
  }
  return null;
}

function rankProducts(query: string, products: any[]): any[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return products
      .map((p) => {
        let score = 0;
        const searchText = `${p.name} ${p.nameEn || ""} ${p.description} ${p.descriptionEn || ""} ${p.category?.name || ""} ${p.category?.nameEn || ""}`.toLowerCase();
        for (const word of words) {
          if (searchText.includes(word)) score += word.length;
        }
        if (searchText.includes(query.toLowerCase())) score += 100;
        return { product: p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((p) => p.product);
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا مساعد GMstore الذكي. كيف يمكنني مساعدتك؟ 🛍️" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const allProducts = useRef<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          allProducts.current = data;
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const allMessages = [...messages, userMsg];
      const browserResult = await tryBrowserAI(allMessages);
      if (browserResult) {
        setMessages((prev) => [...prev, { role: "assistant", content: browserResult }]);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
          setLoading(false);
          return;
        }
      }
    } catch {}

    const products = allProducts.current;
    const productQuery = extractProductQuery(text) || text;
    const ranked = products.length ? rankProducts(productQuery, products) : [];

    if (ranked.length > 0) {
      const top = ranked.slice(0, 5);
      const lines = top.map((p: any) =>
        `🔸 **${p.name}** — ${Number(p.price).toFixed(2)} ريال${p.colors?.length ? `\n   الألوان: ${p.colors.join(" · ")}` : ""}${p._avgRating ? `\n   ⭐ ${Number(p._avgRating).toFixed(1)}` : ""}\n   /products/${p.slug}`
      );
      const total = ranked.length > 5 ? `\n\nو ${ranked.length - 5} نتائج إضافية، تصفح الكل: /products?q=${encodeURIComponent(productQuery)}` : "";
      setMessages((prev) => [...prev, { role: "assistant", content: `وجدت هذه المنتجات:\n${lines.join("\n\n")}${total}` }]);
      setLoading(false);
      return;
    }

    const smart = getSmartReply(text);
    const fallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    const msg = smart || (ready ? fallback : "جاري تحميل المنتجات...");
    setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    setLoading(false);
  }, [input, loading, messages, ready]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        title="المساعد الذكي"
      >
        <Bot className="h-6 w-6" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            dir="rtl"
          >
            <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold text-sm">GMstore AI</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3" style={{ scrollBehavior: "smooth" }}>
              {!ready && (
                <div className="text-center text-xs text-muted-foreground py-2">جاري تحميل المنتجات...</div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-muted text-foreground rounded-br-sm"
                        : "bg-primary/10 text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content.split(/(\/\w+(?:\?\w+=[^&\s]+)?)/g).map((part, j) =>
                      part.startsWith("/")
                        ? <a key={j} href={part} className="text-primary underline font-medium">{part}</a>
                        : part
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                  <div className="bg-primary/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      جاري التفكير...
                    </motion.span>
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>
            <div className="border-t border-border p-3">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسألني عن أي شيء..."
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
