"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { T } from "@/components/translate";
import { User } from "lucide-react";

export function UserGreeting({ userName: propName }: { userName?: string | null }) {
  const { data: session } = useSession();
  const name = propName || (session?.user as any)?.name;
  const [open, setOpen] = useState(false);

  if (!name) return null;

  return (
    <div className="fixed top-24 left-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex items-center gap-2 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-xl shadow-lg whitespace-nowrap"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            <span className="font-medium"><T k="nav.greeting" />, {name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/80 text-primary-foreground shadow-md cursor-pointer"
      >
        <User className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
