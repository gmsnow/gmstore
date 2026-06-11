"use client";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
  "https://images.unsplash.com/photo-1607082350899-7e74aa90c30b?w=1600&q=80",
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&q=80",
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  function prev() { setCurrent((p) => (p - 1 + slides.length) % slides.length); }
  function next() { setCurrent((p) => (p + 1) % slides.length); }

  function handleTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX; }
  function handleTouchMove(e: React.TouchEvent) { touchEnd.current = e.touches[0].clientX; }
  function handleTouchEnd() {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }

  return (
    <section
      className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden -mt-[70px] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((src, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-4 z-10 h-10 w-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors">
        <ChevronRight className="h-5 w-5" />
      </button>
      <button onClick={next} className="absolute top-1/2 -translate-y-1/2 left-4 z-10 h-10 w-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
