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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (name) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [name, pathname]);

  if (!name || !visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-md:hidden flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <User className="h-4 w-4 text-primary" />
      <span><T k="nav.greeting" />, {name}</span>
    </motion.div>
  );
}
