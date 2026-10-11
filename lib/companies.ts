import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import { defaultCompanyConfig } from "@/lib/company-config";
import { structureCatalog } from "@/lib/catalog";
import {
  normalizeCompanyConfig,
  slugifyCompanyName,
  type CompanyConfig,
} from "@/types/company-config";
import { structureTypes, type StructureType } from "@/types/calculator";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "companies.json");
const LOCK_FILE = path.join(DATA_DIR, "companies.lock");

type Store = { companies: CompanyConfig[] };

async function ensureStore(): Promise<Store> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* read-only filesystem */
  }
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.companies)) {
      throw new Error("invalid store");
    }
    return {
      companies: parsed.companies.map((item) => normalizeCompanyConfig(item)),
    };
  } catch {
    const seeded: Store = { companies: [defaultCompanyConfig()] };
    try {
      await fs.writeFile(DATA_FILE, `${JSON.stringify(seeded, null, 2)}\n`, "utf8");
    } catch {
      // Demo seed in memory when data/ is not writable (e.g. some serverless hosts).
    }
    return seeded;
  }
}

async function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const started = Date.now();
  while (true) {
    try {
      const handle = await fs.open(LOCK_FILE, "wx");
      try {
        return await fn();
      } finally {
        await handle.close();
        await fs.unlink(LOCK_FILE).catch(() => undefined);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() - started > 5000) {
        await fs.unlink(LOCK_FILE).catch(() => undefined);
        continue;
      }
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await fs.rename(tmp, DATA_FILE);
}

export async function listCompanies(): Promise<CompanyConfig[]> {
  const store = await ensureStore();
  return store.companies;
}

export async function getCompanyConfig(slug: string): Promise<CompanyConfig | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  const store = await ensureStore();
  return store.companies.find((item) => item.slug === normalized) ?? null;
}

export async function saveCompany(config: CompanyConfig): Promise<CompanyConfig> {
  const normalized = normalizeCompanyConfig(config);
  const categorySet = new Set(normalized.enabledCategories);
  const filteredTypes = normalized.enabledTypes.filter((type) =>
    categorySet.has(structureCatalog[type].group),
  );
  const saved: CompanyConfig = {
    ...normalized,
    enabledTypes: filteredTypes.length
      ? filteredTypes
      : (structureTypes as readonly StructureType[]).filter((type) =>
          categorySet.has(structureCatalog[type].group),
        ),
  };

  return withFileLock(async () => {
    const store = await ensureStore();
    const index = store.companies.findIndex((item) => item.slug === saved.slug);
    if (index >= 0) {
      store.companies[index] = saved;
    } else {
      store.companies.push(saved);
    }
    await writeStore(store);
    return saved;
  });
}

export async function allocateUniqueSlug(companyName: string, preferred?: string): Promise<string> {
  const base = (preferred?.trim() || slugifyCompanyName(companyName)).toLowerCase() || "firma";
  const store = await ensureStore();
  const taken = new Set(store.companies.map((item) => item.slug));
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
