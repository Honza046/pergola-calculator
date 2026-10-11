import { cn } from "@/lib/cn";

export function optionCard(active: boolean) {
  return cn(
    "relative flex w-full cursor-pointer flex-col rounded-lg border p-2 text-left transition-colors",
    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink/20",
    active ? "border-ink bg-white shadow-[0_0_0_1px_#141311]" : "border-line bg-white hover:border-ink/25",
  );
}

export function fieldClass(invalid = false, multiline = false) {
  return cn(
    "w-full rounded-lg border bg-white px-3 text-[15px] text-ink outline-none transition placeholder:text-muted/70",
    "focus:border-ink focus:ring-2 focus:ring-ink/5",
    multiline ? "min-h-12 resize-y py-1.5" : "h-9",
    invalid ? "border-danger" : "border-line",
  );
}
