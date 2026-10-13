"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function DeploySnippets({
  pageUrl,
  embedUrl,
  origin,
}: {
  pageUrl: string;
  embedUrl: string;
  origin: string;
}) {
  const iframe = `<iframe
  src="${embedUrl}"
  title="Kalkulačka poptávky"
  data-pergola-calculator
  style="width:100%;border:0;min-height:760px;color-scheme:light"
></iframe>
<script src="${origin}/embed.js" async></script>`;

  const floatingButton = `<!-- Plovoucí tlačítko → modal s kalkulačkou -->
<button id="pergola-calc-open" type="button"
  style="position:fixed;right:20px;bottom:20px;z-index:9999;padding:12px 18px;border:0;border-radius:10px;background:#234836;color:#fff;font:600 14px/1.2 system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.18)">
  Spočítat cenu
</button>
<div id="pergola-calc-modal" hidden
  style="position:fixed;inset:0;z-index:10000;background:rgba(20,19,17,.55);display:grid;place-items:center;padding:16px">
  <div style="position:relative;width:min(720px,100%);max-height:90vh;overflow:auto;background:#fffcf8;border-radius:14px;padding:8px">
    <button type="button" id="pergola-calc-close" aria-label="Zavřít"
      style="position:sticky;top:8px;float:right;margin:4px 4px 0 0;border:0;background:#fff;border-radius:999px;width:32px;height:32px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.12)">×</button>
    <iframe src="${embedUrl}" title="Kalkulačka" data-pergola-calculator
      style="width:100%;border:0;min-height:760px;color-scheme:light"></iframe>
  </div>
</div>
<script src="${origin}/embed.js" async></script>
<script>
(function () {
  var modal = document.getElementById("pergola-calc-modal");
  var openBtn = document.getElementById("pergola-calc-open");
  var closeBtn = document.getElementById("pergola-calc-close");
  if (!modal || !openBtn || !closeBtn) return;
  function show() { modal.hidden = false; modal.style.display = "grid"; }
  function hide() { modal.hidden = true; modal.style.display = "none"; }
  openBtn.addEventListener("click", show);
  closeBtn.addEventListener("click", hide);
  modal.addEventListener("click", function (e) { if (e.target === modal) hide(); });
})();
</script>`;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Jak nasadit na web klienta
      </h2>
      <SnippetBlock title="1. Přímý odkaz" value={pageUrl} />
      <SnippetBlock title="2. iframe embed" value={iframe} tall />
      <SnippetBlock title='3. Plovoucí tlačítko „Spočítat cenu“' value={floatingButton} tall />
    </div>
  );
}

function SnippetBlock({
  title,
  value,
  tall,
}: {
  title: string;
  value: string;
  tall?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium hover:border-ink/25"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Zkopírováno" : "Kopírovat"}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        aria-label={title}
        className={
          tall
            ? "h-44 w-full resize-none rounded-lg border border-line bg-white p-3 font-mono text-[11px] leading-5 text-ink"
            : "h-16 w-full resize-none rounded-lg border border-line bg-white p-3 font-mono text-[11px] leading-5 text-ink"
        }
        onFocus={(event) => event.currentTarget.select()}
      />
    </div>
  );
}
