import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

type IconEntry = {
  path: string; // icon/ 以下の相対パス
  name: string; // ファイル名（拡張子なし）
  ext: string; // svg/png 等
};

const ICON_ROOT = path.join(process.cwd(), "icon");

async function walk(dirAbs: string, baseAbs: string, out: IconEntry[]) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dirAbs, ent.name);
    if (ent.isDirectory()) {
      await walk(abs, baseAbs, out);
      continue;
    }
    const ext = path.extname(ent.name).slice(1).toLowerCase();
    if (!["svg", "png"].includes(ext)) continue;
    const rel = path.relative(baseAbs, abs).replaceAll(path.sep, "/");
    const name = path.basename(ent.name, path.extname(ent.name));
    out.push({ path: rel, name, ext });
  }
}

export async function GET() {
  const list: IconEntry[] = [];
  try {
    await walk(ICON_ROOT, ICON_ROOT, list);
  } catch {
    return NextResponse.json({ icons: [] satisfies IconEntry[] });
  }

  // ざっくり並び替え（見つけやすさ優先）
  list.sort((a, b) => a.path.localeCompare(b.path, "ja"));
  return NextResponse.json({ icons: list });
}

