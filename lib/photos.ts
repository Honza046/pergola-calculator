import type { DraftPhoto } from "@/types/calculator";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function readSitePhoto(file: File): Promise<DraftPhoto> {
  const extension = file.name.toLowerCase();
  const knownExtension = /\.(jpe?g|png|webp)$/.test(extension);
  if (!acceptedTypes.has(file.type) && !knownExtension) {
    throw new Error("Povolené formáty jsou JPG, PNG a WEBP.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Fotografie může mít nejvýše 8 MB.");
  }

  const dataUrl = await compress(file);
  if (dataUrl.length > 1_400_000) {
    throw new Error("Fotografii se nepodařilo zmenšit. Zkuste jiný snímek.");
  }

  return {
    id: crypto.randomUUID(),
    name: file.name.slice(0, 160) || "fotografie.jpg",
    dataUrl,
  };
}

async function compress(file: File) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Fotografii se nepodařilo načíst. Zkuste JPG nebo PNG.");
  }

  try {
    const attempts = [
      { edge: 1600, quality: 0.82 },
      { edge: 1400, quality: 0.7 },
      { edge: 1200, quality: 0.58 },
    ];
    let last = "";
    for (const attempt of attempts) {
      last = draw(bitmap, attempt.edge, attempt.quality);
      if (last.length <= 1_400_000) return last;
    }
    return last;
  } finally {
    bitmap.close();
  }
}

function draw(bitmap: ImageBitmap, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotografii se nepodařilo zpracovat.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}
