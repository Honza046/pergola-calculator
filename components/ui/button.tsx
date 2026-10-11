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
        "inline-flex h-10 touch-manipulation items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
        variant === "primary" && "bg-forest text-white hover:bg-forest-deep",
        variant === "secondary" && "border border-line bg-white text-ink hover:border-ink/30",
        variant === "ghost" && "text-ink hover:bg-black/5",
        className,
      )}
      {...props}
    />
  );
}
