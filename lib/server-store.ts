import fs from "node:fs/promises";
import path from "node:path";

type MemoryBag = Record<string, unknown>;

declare global {
  var __coworking_store__: MemoryBag | undefined;
}

function getMemoryStore(): MemoryBag {
  if (!globalThis.__coworking_store__) {
    globalThis.__coworking_store__ = {};
  }

  return globalThis.__coworking_store__;
}

export async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  const store = getMemoryStore();
  const key = `json:${fileName}`;

  if (Object.prototype.hasOwnProperty.call(store, key)) {
    return store[key] as T;
  }

  const filePath = path.join(process.cwd(), "data", fileName);

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = raw ? JSON.parse(raw) : fallback;
    store[key] = parsed;
    return parsed;
  } catch {
    store[key] = fallback;
    return fallback;
  }
}

export async function writeJsonFile<T>(fileName: string, value: T): Promise<T> {
  const store = getMemoryStore();
  const key = `json:${fileName}`;
  store[key] = value;

  const filePath = path.join(process.cwd(), "data", fileName);

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
  } catch {
    // Serverless deployments like Vercel may not allow writes to the repo filesystem.
    // Keep the in-memory value available for the active request lifecycle.
  }

  return value;
}
