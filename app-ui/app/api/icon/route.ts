import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const ICON_ROOT = path.join(process.cwd(), "icon");

function contentTypeFor(ext: string): string {
  switch (ext) {
    case "svg":
      return "image/svg+xml; charset=utf-8";
    case "png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rel = url.searchParams.get("path") ?? "";
  if (!rel) return new NextResponse("missing path", { status: 400 });
  if (rel.includes("..") || rel.startsWith("/") || rel.includes("\\"))
    return new NextResponse("invalid path", { status: 400 });

  const abs = path.join(ICON_ROOT, rel);
  const normalized = path.normalize(abs);
  if (!normalized.startsWith(ICON_ROOT)) return new NextResponse("invalid path", { status: 400 });

  const ext = path.extname(rel).slice(1).toLowerCase();
  if (!["svg", "png"].includes(ext)) return new NextResponse("unsupported", { status: 415 });

  const buf = await fs.readFile(normalized);
  return new NextResponse(buf, {
    headers: {
      "content-type": contentTypeFor(ext),
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

