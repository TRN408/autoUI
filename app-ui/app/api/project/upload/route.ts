import { NextResponse } from "next/server";
import crypto from "node:crypto";

type StoredFile = {
  content: Uint8Array;
  contentType: string;
};

type Store = Map<string, Map<string, StoredFile>>;
type MetaStore = Map<string, { rootDir: string }>;

function getStore(): Store {
  const g = globalThis as any;
  if (!g.__AUTOUI_PROJECT_STORE) g.__AUTOUI_PROJECT_STORE = new Map();
  return g.__AUTOUI_PROJECT_STORE as Store;
}

function getMetaStore(): MetaStore {
  const g = globalThis as any;
  if (!g.__AUTOUI_PROJECT_META) g.__AUTOUI_PROJECT_META = new Map();
  return g.__AUTOUI_PROJECT_META as MetaStore;
}

function contentTypeForPath(p: string): string {
  const ext = p.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "html":
    case "htm":
      return "text/html; charset=utf-8";
    case "css":
      return "text/css; charset=utf-8";
    case "js":
    case "mjs":
      return "text/javascript; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    case "svg":
      return "image/svg+xml; charset=utf-8";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "ico":
      return "image/x-icon";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "eot":
      return "application/vnd.ms-fontobject";
    default:
      return "application/octet-stream";
  }
}

function normalizePath(p: string): string {
  return p.replaceAll("\\", "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function pickEntry(paths: string[]): string | null {
  const normalized = paths.map(normalizePath);
  const lower = normalized.map((p) => p.toLowerCase());
  const exact = (p: string) => normalized[lower.indexOf(p.toLowerCase())] ?? null;
  const endsWithIndex = (dirPrefix: string) =>
    normalized.find((x) => x.toLowerCase().startsWith(dirPrefix) && x.toLowerCase().endsWith("/index.html")) ?? null;

  return (
    exact("dist/index.html") ||
    exact("build/index.html") ||
    exact("out/index.html") ||
    endsWithIndex("dist/") ||
    endsWithIndex("build/") ||
    endsWithIndex("out/") ||
    exact("public/index.html") ||
    endsWithIndex("public/") ||
    exact("index.html") ||
    normalized.find((x) => x.toLowerCase().endsWith("/index.html")) ||
    null
  );
}

function dirname(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf("/");
  return idx >= 0 ? n.slice(0, idx) : "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files");

  const sid = crypto.randomBytes(12).toString("hex");
  const store = getStore();
  const meta = getMetaStore();
  const bucket = new Map<string, StoredFile>();

  const paths: string[] = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    // filename に相対パスを入れて送る想定
    const p = normalizePath(f.name || "");
    if (!p || p.includes("..") || p.startsWith("/")) continue;
    const buf = new Uint8Array(await f.arrayBuffer());
    bucket.set(p, { content: buf, contentType: contentTypeForPath(p) });
    paths.push(p);
  }

  store.set(sid, bucket);

  const entry = pickEntry(paths);
  const rootDir = entry ? dirname(entry) : "";
  meta.set(sid, { rootDir });
  return NextResponse.json({ sid, entry, rootDir });
}

