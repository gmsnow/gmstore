"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    title: "تخفيضات تصل إلى 50%",
    desc: "على جميع المنتجات المختارة لفترة محدودة",
  },
  {
    image: "https://images.unsplash.com/photo-1607082350899-7e74aa90c30b?w=1200&q=80",
    title: "شحن مجاني للطلبات",
    desc: "للطلبات التي تتجاوز 5000 ريال",
  },
  {
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80",
    title: "توصيل سريع",
    desc: "استلم طلبك في غضون 24 ساعة",
  },
];

export function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDir(1);
      setCurrent((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function prev() {
    setDir(-1);
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }

  function next() {
    setDir(1);
    setCurrent((p) => (p + 1) % slides.length);
  }

  const s = slides[current];

  return (
    <div className="relative overflow-hidden rounded-2xl h-[200px] sm:h-[280px]">
      <AnimatePresence custom={dir}>
        <motion.div
          key={current}
          custom={dir}
          initial={{ x: dir * 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * -300, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={s.image}
            alt={s.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <h3 className="text-xl sm:text-3xl font-bold mb-1 drop-shadow-lg">{s.title}</h3>
            <p className="text-sm sm:text-base text-white/80 drop-shadow">{s.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute top-1/2 -translate-y-1/2 right-3 z-10 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 -translate-y-1/2 left-3 z-10 h-8 w-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
