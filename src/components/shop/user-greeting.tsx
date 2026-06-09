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
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      prevUser.current = user;
      return () => clearTimeout(timer);
    }
    prevUser.current = user;
  }, [user]);

  if (!user) return null;

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          key="welcome-toast"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="hidden md:flex fixed top-20 left-4 z-50 items-center gap-2 text-sm font-medium text-foreground"
        >
          <User className="h-4 w-4 text-primary" />
          <span>
            <T k="nav.greeting" />, {name}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
