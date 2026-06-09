"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { T } from "@/components/translate";
import { User } from "lucide-react";

export function UserGreeting() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const name = (user as any)?.name;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [user, pathname]);

  return (
    <AnimatePresence mode="wait">
      {show && user && (
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="hidden md:flex fixed top-20 left-4 z-50 items-center gap-1.5 text-sm text-muted-foreground"
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
