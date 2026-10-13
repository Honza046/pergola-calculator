import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 touch-manipulation items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium tracking-tight transition disabled:cursor-not-allowed disabled:opacity-45",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
        variant === "primary" &&
          "bg-forest text-white shadow-[2px_2px_0_rgba(22,53,40,0.35)] hover:bg-forest-deep active:translate-x-px active:translate-y-px active:shadow-none",
        variant === "secondary" &&
          "border border-ink/20 bg-card text-ink hover:border-forest/40 hover:bg-moss/50",
        variant === "ghost" && "text-ink hover:bg-moss/60",
        className,
      )}
      {...props}
    />
  );
}
