import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" &&
            "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-lg",
          variant === "secondary" &&
            "border border-orange-200 bg-white/80 text-slate-700 hover:bg-orange-50",
          variant === "ghost" && "bg-transparent text-slate-600 hover:bg-white/70",
          variant === "danger" && "bg-rose-500 text-white hover:bg-rose-600",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
