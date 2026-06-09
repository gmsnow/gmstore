"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
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
    if (name && !show) {
      setShow(true);
    }
  }, [name, show]);

  if (!name || !show) return null;

  return (
    <motion.div
      key={pathname}
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="fixed top-20 left-4 z-50 flex items-center gap-2 bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm"
    >
      <User className="h-3 w-3" />
      <span className="font-medium"><T k="nav.greeting" />, {name}</span>
    </motion.div>
  );
}
