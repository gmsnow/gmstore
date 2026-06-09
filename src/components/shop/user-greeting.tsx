"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/provider";
import { T } from "@/components/translate";
import { User } from "lucide-react";

export function UserGreeting() {
  const { data: session } = useSession();
  const user = session?.user;
  const name = (user as any)?.name;
  const { direction } = useI18n();
  const [showWelcome, setShowWelcome] = useState(false);
  const prevUser = useRef<typeof user>(null);

  useEffect(() => {
    if (!prevUser.current && user) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      prevUser.current = user;
      return () => clearTimeout(timer);
    }
    prevUser.current = user;
  }, [user]);

  if (!user) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: direction === "rtl" ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground ml-2"
      >
        <User className="h-4 w-4 text-primary" />
        <span>
          <T k="nav.greeting" />, {name}
        </span>
      </motion.div>

      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome-toast"
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed top-4 left-4 z-50 bg-background/70 backdrop-blur-md border border-border text-foreground px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.2 }}
            >
              <User className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-medium"
            >
              <T k="nav.greeting" />, {name}
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 h-0.5 bg-primary/30 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
