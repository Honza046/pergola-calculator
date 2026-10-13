import { cn } from "@/lib/cn";

export function optionCard(active: boolean) {
  return cn(
    "relative flex w-full cursor-pointer flex-col rounded-sm border p-2 text-left transition-colors",
    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-forest/25",
    active
      ? "border-forest bg-card shadow-[2px_2px_0_rgba(35,72,54,0.18)]"
      : "border-line bg-card hover:border-forest/35",
  );
}

export function fieldClass(invalid = false, multiline = false) {
  return cn(
    "w-full rounded-sm border bg-card px-3 text-[15px] text-ink outline-none transition placeholder:text-muted/70",
    "focus:border-forest focus:ring-2 focus:ring-forest/10",
    multiline ? "min-h-12 resize-y py-1.5" : "h-9",
    invalid ? "border-danger" : "border-line",
  );
}
