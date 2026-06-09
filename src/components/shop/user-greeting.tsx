"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { T } from "@/components/translate";
import { User } from "lucide-react";

export function UserGreeting({ userName: propName }: { userName?: string | null }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const name = propName || (session?.user as any)?.name;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (name) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [name, pathname]);

  return (
    <AnimatePresence>
      {show && name && (
        <motion.div
          key={pathname}
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed top-20 left-4 z-50 flex items-center gap-2.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl shadow-lg"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.15 }}
          >
            <User className="h-4 w-4" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            <T k="nav.greeting" />, {name}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
