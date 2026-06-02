import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { injectThemeIntoHtml } from "@/lib/theme-overlay";

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

function normalizePath(p: string): string {
  return p.replaceAll("\\", "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function rewriteHtmlForMountedRoot(html: string, mountPrefix: string): string {
  // build成果物が "/assets/..." のような絶対パス参照を使うと、
  // /__project/... 配下では 404 になり真っ白になりがちなので prefix を付与する。
  // 単純な属性置換（完全ではないが多くのSPAで効く）
  const prefix = mountPrefix.replace(/\/+$/, "");
  let out = html;
  out = out.replace(/(\s(?:src|href)=["'])\/(?!\/)/gi, `$1${prefix}/`);
  out = out.replace(/(url\(["']?)\/(?!\/)/gi, `$1${prefix}/`);
  // base href も差し込んで相対解決を安定させる
  if (!/<base\s/i.test(out)) {
    out = out.replace(/<head(\s[^>]*)?>/i, (m) => `${m}<base href="${prefix}/">`);
  }
  return out;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ sid: string; path: string[] }> }
) {
  const themeId = new URL(req.url).searchParams.get("autoui_theme");
  const { sid, path } = await ctx.params;
  const p = normalizePath(path.join("/"));
  if (!sid || !p || p.includes("..") || p.startsWith("/")) {
    return new NextResponse("invalid", { status: 400 });
  }

  const store = getStore();
  const meta = getMetaStore();
  const bucket = store.get(sid);
  const file = bucket?.get(p);
  if (!file) return new NextResponse("not found", { status: 404 });

  if (file.contentType.startsWith("text/html")) {
    const rootDir = meta.get(sid)?.rootDir ?? "";
    const mountPrefix = rootDir ? `/__project/${encodeURIComponent(sid)}/${rootDir}` : `/__project/${encodeURIComponent(sid)}`;
    const html = Buffer.from(file.content).toString("utf-8");
    let rewritten = rewriteHtmlForMountedRoot(html, mountPrefix);
    if (themeId) rewritten = injectThemeIntoHtml(rewritten, themeId);
    return new NextResponse(rewritten, {
      headers: {
        "content-type": file.contentType,
        "cache-control": "no-store",
      },
    });
  }

  return new NextResponse(Buffer.from(file.content), {
    headers: {
      "content-type": file.contentType,
      // セッション内一時データなので強めにキャッシュはしない
      "cache-control": "no-store",
    },
  });
}

