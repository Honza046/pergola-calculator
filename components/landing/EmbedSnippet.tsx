"use client";

import { Check, Copy } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

function currentOrigin() {
  return window.location.origin;
}

function serverOrigin() {
  return "https://vase-domena.cz";
}

export function EmbedSnippet() {
  const origin = useSyncExternalStore(subscribe, currentOrigin, serverOrigin);
  const [copied, setCopied] = useState(false);

  const snippet = `<iframe
  src="${origin}/embed"
  title="Kalkulačka poptávky"
  data-pergola-calculator
  style="width:100%;border:0;min-height:760px;color-scheme:light"
></iframe>
<script src="${origin}/embed.js" async></script>`;

  return (
    <div>
      <textarea
        readOnly
        value={snippet}
        aria-label="Kód pro vložení kalkulačky"
        className="h-52 w-full resize-none rounded-2xl border border-line bg-white p-4 font-mono text-sm leading-6 text-ink"
        onFocus={(event) => event.currentTarget.select()}
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
        className="mt-3 inline-flex h-11 items-center gap-2 rounded-lg bg-forest px-4 text-sm font-medium text-white"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Zkopírováno" : "Kopírovat kód"}
      </button>
    </div>
  );
}
