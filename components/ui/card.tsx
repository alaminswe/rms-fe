import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel rounded-[28px] border border-white/60 shadow-soft", className)}>
      {children}
    </div>
  );
}
