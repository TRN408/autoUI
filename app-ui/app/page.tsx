"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import JSZip from "jszip";
import { analyzeAndFix, detectLanguage, Violation, Language } from "@/lib/smarthr-rules";
import LogoGenerator from "@/components/LogoGenerator";
import { ColorScheme } from "@/lib/color-schemes";
import { appendThemeQuery, resolveColorScheme, buildThemeOverlayCss } from "@/lib/theme-overlay";
import { ProjectColorSchemePicker } from "@/components/ProjectColorSchemePicker";

// ── タブ定義 ──────────────────────────────────────
type AppTab = "ui-fix" | "logo";

const APP_TABS: { value: AppTab; label: string; icon: React.ReactNode }[] = [
  {
    value: "ui-fix",
    label: "UI修正",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "logo",
    label: "ロゴ生成",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ── UI修正 パネル ──────────────────────────────────

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "html", label: "HTML" },
  { value: "css",  label: "CSS" },
  { value: "tsx",  label: "React (TSX)" },
  { value: "jsx",  label: "React (JSX)" },
];

type FontScope = "global" | "selector";

type IconEntry = {
  path: string;
  name: string;
  ext: string;
};

type FontChoice = {
  id: string;
  label: string;
  stack: string;
  headCss?: string;
};

const FONT_CHOICES: FontChoice[] = [
  {
    id: "system",
    label: "System（標準）",
    stack:
      '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, "Hiragino Sans", "Noto Sans JP", "Yu Gothic", Meiryo, sans-serif',
  },
  {
    id: "yu-gothic",
    label: "游ゴシック体",
    // SmartHR Design System の「AdjustedYuGothic」方式を踏襲（Windows/macOSで見え方が揃うように調整）
    // https://smarthr.design/basics/typography/website/
    stack: 'AdjustedYuGothic, "Yu Gothic", "YuGothic", "Hiragino Sans", Meiryo, sans-serif',
    headCss: `
      @font-face {
        font-family: "AdjustedYuGothic";
        font-weight: 400;
        src: local("Yu Gothic Medium");
      }
      @font-face {
        font-family: "AdjustedYuGothic";
        font-weight: 500;
        src: local("Yu Gothic Bold");
      }
      @font-face {
        font-family: "AdjustedYuGothic";
        font-weight: 700;
        src: local("Yu Gothic Bold");
      }
    `,
  },
  {
    id: "noto-sans-jp",
    label: "Noto Sans JP（ゴシック）",
    stack: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif',
  },
  {
    id: "noto-serif-jp",
    label: "Noto Serif JP（明朝）",
    stack: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  },
  {
    id: "mono",
    label: "Mono（等幅）",
    stack:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
];

const SEVERITY_STYLE: Record<string, { border: string; bg: string; badge: string; label: string }> = {
  error:   { border: "#e01e5a", bg: "#fff0f3", badge: "#e01e5a", label: "エラー" },
  warning: { border: "#f56121", bg: "#fff8f0", badge: "#f56121", label: "警告" },
  info:    { border: "#0077c7", bg: "#f0f7ff", badge: "#0077c7", label: "情報" },
};

type GroupedViolation = {
  severity: Violation["severity"];
  message: string;
  original: string;
  suggestion?: string;
  lines: number[];
};

function violationGroupKey(v: Violation): string {
  return `${v.severity}\0${v.message}\0${v.original}\0${v.suggestion ?? ""}`;
}

function groupViolations(violations: Violation[]): GroupedViolation[] {
  const map = new Map<string, GroupedViolation>();
  for (const v of violations) {
    const key = violationGroupKey(v);
    const existing = map.get(key);
    if (existing) {
      existing.lines.push(v.line);
    } else {
      map.set(key, {
        severity: v.severity,
        message: v.message,
        original: v.original,
        suggestion: v.suggestion,
        lines: [v.line],
      });
    }
  }
  return Array.from(map.values())
    .map((g) => ({ ...g, lines: [...new Set(g.lines)].sort((a, b) => a - b) }))
    .sort((a, b) => a.lines[0]! - b.lines[0]!);
}

function formatViolationLines(lines: number[]): string {
  if (lines.length === 1) return `行 ${lines[0]}`;
  return `行 ${lines.join(", ")}（${lines.length}件）`;
}

/** 違反なし（○/—）のテキストファイルをアップロード時の内容で保存候補に入れる */
function buildInitialSaveCandidates(
  audits: Record<string, FileAudit>,
  textByPath: Map<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [p, text] of textByPath.entries()) {
    if (!looksTextFile(p)) continue;
    const audit = audits[p];
    if (!audit || audit.mark === "ok" || audit.mark === "skip") {
      out[p] = text;
    }
  }
  return out;
}

function detectLanguagesMixed(code: string): { primary: Language; detected: Language[] } {
  const s = code || "";
  const hasHtml =
    /<\s*[a-z][\w:-]*\b[^>]*>/i.test(s) ||
    /<\/\s*[a-z][\w:-]*\s*>/i.test(s) ||
    /<!doctype\s+html/i.test(s);
  const hasCss =
    /{[^}]*:[^}]*}/.test(s) ||
    /@media\b|@layer\b|@keyframes\b|@font-face\b|:root\b/.test(s);
  const hasReactLike =
    /\b(import|export)\b/.test(s) ||
    /\breturn\s*\(/.test(s) ||
    /\bclassName\s*=/.test(s) ||
    /\buse(State|Effect|Memo|Ref)\b/.test(s);
  const hasTs =
    /\binterface\s+\w+/.test(s) ||
    /\btype\s+\w+\s*=/.test(s) ||
    /:\s*(string|number|boolean|Record<|React\.)/.test(s);
  const hasJsxTag = /<\s*[A-Z][\w]*\b[^>]*>/.test(s);

  const detected: Language[] = [];
  if (hasHtml) detected.push("html");
  if (hasCss) detected.push("css");
  if (hasReactLike || hasJsxTag) detected.push(hasTs ? "tsx" : "jsx");

  const primary: Language =
    (detected.includes("tsx") ? "tsx"
      : detected.includes("jsx") ? "jsx"
      : detected.includes("html") ? "html"
      : detected.includes("css") ? "css"
      : detectLanguage(s));

  const uniq = Array.from(new Set(detected));
  return { primary, detected: uniq.length ? uniq : [primary] };
}

function normalizeHtmlDoc(html: string, extraHead: string = ""): string {
  const baseStyle = `
    <style>
      html, body { height: 100%; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; }
      * { box-sizing: border-box; }
    </style>
  `;
  const trimmed = html.trim();
  if (!trimmed) {
    return `<!doctype html><html><head>${baseStyle}${extraHead}</head><body></body></html>`;
  }
  const hasHtmlTag = /<html[\s>]/i.test(trimmed);
  if (hasHtmlTag) {
    // 既にHTMLドキュメント形式なら head にベースCSSだけ注入
    if (/<head[\s>]/i.test(trimmed)) {
      return trimmed.replace(/<head(\s[^>]*)?>/i, (m) => `${m}${baseStyle}${extraHead}`);
    }
    return trimmed.replace(/<html(\s[^>]*)?>/i, (m) => `${m}<head>${baseStyle}${extraHead}</head>`);
  }
  // 断片HTMLはドキュメントにラップ
  return `<!doctype html><html><head>${baseStyle}${extraHead}</head><body>${trimmed}</body></html>`;
}

type ProjectFile = {
  path: string;
  text: string;
};

type ProjectDropFile = {
  path: string;
  file: File;
};

type CandidateFile = {
  path: string;
  score: number;
  reason: string;
  preview: string;
  text: string;
};

function isHtmlPath(p: string): boolean {
  const x = p.toLowerCase();
  return x.endsWith(".html") || x.endsWith(".htm");
}

type AuditMark = "ok" | "warn" | "skip" | "pending" | "fixed";
type FileAudit = {
  mark: AuditMark;
  violations: number;
  primary?: Language;
  detected?: Language[];
};

function markLabel(mark: AuditMark): string {
  switch (mark) {
    case "ok":
      return "○";
    case "warn":
      return "△";
    case "fixed":
      return "修";
    case "skip":
      return "—";
    case "pending":
      return "…";
  }
}

function markSortKey(mark: AuditMark): number {
  switch (mark) {
    case "warn":
      return 0;
    case "pending":
      return 1;
    case "fixed":
      return 2;
    case "ok":
      return 3;
    case "skip":
      return 4;
  }
}

function basename(p: string): string {
  const n = normalizePath(p);
  const i = n.lastIndexOf("/");
  return i >= 0 ? n.slice(i + 1) : n;
}

function AuditBadge({ mark, violations }: { mark: AuditMark; violations?: number }) {
  const title =
    mark === "ok"
      ? "違反なし"
      : mark === "warn"
        ? `違反 ${violations ?? 0}件`
        : mark === "fixed"
          ? "修正済み（保存候補に追加済み）"
          : mark === "skip"
            ? "対象外"
            : "チェック中";
  const base = "inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 text-[10px] font-bold leading-none";
  if (mark === "ok") {
    return (
      <span className={`${base} bg-[#e6f7ec] text-[#1a7f37] border border-[#1a7f37]/25`} title={title}>
        ○
      </span>
    );
  }
  if (mark === "fixed") {
    return (
      <span className={`${base} bg-[#edebe8] text-[#706d65] border border-[#d6d3d0]`} title={title}>
        修
      </span>
    );
  }
  if (mark === "warn") {
    return (
      <span className={`${base} bg-[#fff8f0] text-[#c45a00] border border-[#f56121]/35`} title={title}>
        △
      </span>
    );
  }
  if (mark === "pending") {
    return (
      <span className={`${base} bg-[var(--ui-border-soft)] text-[var(--ui-muted)] border border-[var(--ui-border)]`} title={title}>
        …
      </span>
    );
  }
  return (
    <span className={`${base} bg-[var(--ui-border-soft)] text-[var(--ui-muted)] border border-[var(--ui-border)]`} title={title}>
      —
    </span>
  );
}

function isAuditTargetPath(p: string): boolean {
  const x = p.toLowerCase();
  // HTML/CSS/React を中心に、自動検出で JSX/TSX を拾える .js/.ts も対象に含める
  return (
    x.endsWith(".html") ||
    x.endsWith(".htm") ||
    x.endsWith(".css") ||
    x.endsWith(".tsx") ||
    x.endsWith(".jsx") ||
    x.endsWith(".js") ||
    x.endsWith(".ts")
  );
}

function looksTextFile(path: string): boolean {
  const p = path.toLowerCase();
  return (
    p.endsWith(".html") ||
    p.endsWith(".htm") ||
    p.endsWith(".css") ||
    p.endsWith(".tsx") ||
    p.endsWith(".jsx") ||
    p.endsWith(".ts") ||
    p.endsWith(".js") ||
    p.endsWith(".vue") ||
    p.endsWith(".svelte")
  );
}

function scoreUiFile(path: string, text: string): { score: number; reason: string } {
  const p = path.toLowerCase();
  const t = text;
  let score = 0;
  const reasons: string[] = [];

  const add = (s: number, r: string) => {
    score += s;
    reasons.push(r);
  };

  if (p.includes("component") || p.includes("components/")) add(12, "components");
  if (p.includes("page") || p.includes("pages/") || p.includes("app/")) add(8, "page/app");
  if (p.includes("ui")) add(6, "ui");
  if (p.endsWith(".tsx")) add(18, "tsx");
  if (p.endsWith(".jsx")) add(14, "jsx");
  if (p.endsWith(".html") || p.endsWith(".htm")) add(10, "html");
  if (p.endsWith(".css")) add(8, "css");

  if (/<\s*[A-Za-z][\w:-]*\b[^>]*>/.test(t)) add(10, "htmlタグ");
  if (/class(Name)?=/.test(t)) add(8, "class/className");
  if (/\bexport\s+default\b|\bexport\s+function\b|\breturn\s*\(/.test(t)) add(8, "react/js");
  if (/\buse(State|Effect|Memo|Ref)\b/.test(t)) add(6, "hooks");
  if (/@tailwind\b|tailwindcss|className="[^"]*(?:flex|grid|px-|py-)/.test(t)) add(6, "tailwind");
  if (/<style[\s>]/i.test(t) || /:root\b|@media\b|@keyframes\b/.test(t)) add(4, "style/css");

  if (!reasons.length) reasons.push("候補");
  return { score, reason: reasons.slice(0, 3).join(", ") };
}

function topUiCandidates(files: ProjectFile[], limit: number): CandidateFile[] {
  const candidates: CandidateFile[] = [];
  for (const f of files) {
    if (!looksTextFile(f.path)) continue;
    const { score, reason } = scoreUiFile(f.path, f.text);
    if (score <= 0) continue;
    const preview = f.text.slice(0, 220).replace(/\s+/g, " ").trim();
    candidates.push({ path: f.path, score, reason, preview, text: f.text });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit);
}

function normalizePath(p: string): string {
  return p.replaceAll("\\", "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function dirname(p: string): string {
  const n = normalizePath(p);
  const idx = n.lastIndexOf("/");
  return idx >= 0 ? n.slice(0, idx) : "";
}

function joinPath(baseDir: string, rel: string): string {
  const b = normalizePath(baseDir);
  let r = normalizePath(rel);
  if (r.startsWith("/")) r = r.slice(1); // フォルダ内相対に寄せる
  const parts = (b ? b.split("/") : []).concat(r.split("/"));
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
}

function findEntryHtmlPath(allPaths: string[]): string | null {
  const normalized = allPaths.map(normalizePath);
  const lower = normalized.map((p) => p.toLowerCase());
  const pickExact = (p: string) => normalized[lower.indexOf(p.toLowerCase())] ?? null;
  const endsWithIndex = (dirPrefix: string) =>
    normalized.find((x) => x.toLowerCase().startsWith(dirPrefix) && x.toLowerCase().endsWith("/index.html")) ?? null;

  // まずはビルド成果物の典型を最優先
  // - Vite/SPA: dist/index.html
  // - CRA: build/index.html
  // - Next export: out/index.html
  // - Astro: dist/index.html
  return (
    pickExact("dist/index.html") ||
    pickExact("build/index.html") ||
    pickExact("out/index.html") ||
    endsWithIndex("dist/") ||
    endsWithIndex("build/") ||
    endsWithIndex("out/") ||
    // 次点: public/ がある静的構成
    pickExact("public/index.html") ||
    endsWithIndex("public/") ||
    // ルートの index.html（静的サイト）
    pickExact("index.html") ||
    normalized.find((x) => x.toLowerCase().endsWith("/index.html")) ||
    null
  );
}

function stripAutoUiSummaryForPreview(code: string, lang: Language): string {
  if (lang !== "css") {
    return code.replace(/^\/\/ \[autoUI\][\s\S]*?\n(?:\/\/[^\n]*\n)*/m, "");
  }
  return code.replace(/^\/\*\s*\[autoUI\][\s\S]*?\*\/\s*\n(?:\/\*[^*]*\*\/\s*\n)*/m, "");
}

const CSS_PREVIEW_BRIDGE = `
  /* autoUI: :root のトークンをサンプル要素へ接続（プレビュー用） */
  html, body {
    background: var(--bg, var(--background, #fff));
    color: var(--text, var(--foreground, var(--color-text, #23221e)));
  }
  .card {
    background: var(--panel, var(--surface, var(--card-bg, #fff));
    border-color: var(--border, var(--line, #d6d3d0));
  }
  .btn {
    background: var(--primary, var(--brand, var(--accent, #0077c7));
    color: var(--on-primary, var(--primary-text, #fff));
    border-color: var(--primary-border, var(--border, #0077c7));
  }
  .link { color: var(--link, var(--primary, #0077c7)); }
  .input {
    background: var(--input-bg, var(--panel, #fff));
    border-color: var(--input-border, var(--border, #d6d3d0));
    color: var(--input-text, inherit);
  }
`;

function cssToPreviewDoc(css: string): string {
  const base = `
    <div style="padding: 16px;">
      <h1 class="preview-title">Preview</h1>
      <p class="preview-desc">CSS単体の場合はサンプルHTMLに適用して表示します（:root の変数も反映）。</p>
      <div class="card">
        <div class="card__header">カード見出し</div>
        <div class="card__body">
          <button class="btn" type="button">ボタン</button>
          <a class="link" href="#">リンク</a>
          <input class="input" placeholder="入力" />
        </div>
      </div>
    </div>
  `;
  return normalizeHtmlDoc(`
    <style>
      ${css}
      ${CSS_PREVIEW_BRIDGE}
      .preview-title { margin: 0 0 12px; font-size: 1.25rem; line-height: 1.25; }
      .preview-desc { margin: 0 0 12px; opacity: 0.85; }
      .card { border: 1px solid; border-radius: 8px; padding: 12px; }
      .card__header { font-weight: 700; margin-bottom: 8px; }
      .card__body { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      .btn { padding: 8px 12px; border-radius: 6px; border: 1px solid; cursor: pointer; }
      .link { text-decoration: underline; }
      .input { padding: 8px 10px; border-radius: 6px; border: 1px solid; }
    </style>
    ${base}
  `);
}

function escapeCssString(value: string): string {
  // Minimal escape for CSS string injection
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function buildFontHead(
  scope: FontScope,
  selector: string,
  fontStack: string,
  extraCss?: string
): string {
  const stack = escapeCssString(fontStack);
  const extra = extraCss?.trim() ? `\n${extraCss}\n` : "";
  if (scope === "global") {
    return `<style>${extra}:root{--__preview-font:"${stack}";} body{font-family:var(--__preview-font)!important;}</style>`;
  }
  const sel = selector.trim() || "*";
  // selector はユーザー入力なので、危険な @import 等は防げないが iframe sandbox + style 内に限定
  return `<style>${extra}:root{--__preview-font:"${stack}";} ${sel}{font-family:var(--__preview-font)!important;}</style>`;
}

function buildPreviewDoc(
  code: string,
  lang: Language,
  fontScope: FontScope,
  fontSelector: string,
  fontStack: string,
  fontExtraCss?: string,
  themeScheme?: ColorScheme | null
): string | null {
  const themeCss = themeScheme ? `<style id="__autoui_theme">\n${buildThemeOverlayCss(themeScheme)}\n</style>` : "";
  const head = buildFontHead(fontScope, fontSelector, fontStack, fontExtraCss) + themeCss;
  if (!code.trim()) return normalizeHtmlDoc("", head);
  if (lang === "html") return normalizeHtmlDoc(code, head);
  if (lang === "css") {
    const doc = cssToPreviewDoc(stripAutoUiSummaryForPreview(code, "css"));
    // cssToPreviewDoc は normalizeHtmlDoc を内部で呼ぶので、あとから head を注入
    return doc.replace(/<\/head>/i, `${head}</head>`);
  }
  return null;
}

function UIFixPanel() {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const beforeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const afterIframeRef = useRef<HTMLIFrameElement | null>(null);
  const droppedFilesRef = useRef<Map<string, File>>(new Map());
  const droppedTextRef = useRef<Map<string, string>>(new Map());
  const [input, setInput]               = useState("");
  const [output, setOutput]             = useState("");
  const [violations, setViolations]     = useState<Violation[]>([]);
  const [detectedLang, setDetectedLang] = useState<Language>("html");
  const [detectedLangs, setDetectedLangs] = useState<Language[]>(["html"]);
  const [overrideLang, setOverrideLang] = useState<Language | "">("");
  const [activeTab, setActiveTab]       = useState<"code" | "violations">("code");
  const [copied, setCopied]             = useState(false);
  const [fontChoiceId, setFontChoiceId] = useState<FontChoice["id"]>("system");
  const [fontScope, setFontScope]       = useState<FontScope>("global");
  const [fontSelector, setFontSelector] = useState<string>("h1, h2, h3");
  const [icons, setIcons]               = useState<IconEntry[]>([]);
  const [iconQuery, setIconQuery]       = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedIconPath, setSelectedIconPath] = useState<string>("");
  const [scanBusy, setScanBusy] = useState(false);
  const [scanSummary, setScanSummary] = useState<string>("");
  const [scanCandidates, setScanCandidates] = useState<CandidateFile[]>([]);
  const [projectSid, setProjectSid] = useState<string>("");
  const [projectEntry, setProjectEntry] = useState<string>("");
  const [projectUploading, setProjectUploading] = useState(false);
  const [projectHtmlList, setProjectHtmlList] = useState<string[]>([]);
  const [projectDetectedEntry, setProjectDetectedEntry] = useState<string>("");
  const [projectAfterSid, setProjectAfterSid] = useState<string>("");
  const [projectAfterEntry, setProjectAfterEntry] = useState<string>("");
  const [projectApplyingAll, setProjectApplyingAll] = useState(false);
  const [activeProjectPath, setActiveProjectPath] = useState<string>("");
  const [modifiedFiles, setModifiedFiles] = useState<Record<string, string>>({});
  const [saveCandidates, setSaveCandidates] = useState<Record<string, string>>({});
  const [projectTextPaths, setProjectTextPaths] = useState<string[]>([]);
  const [fileAudits, setFileAudits] = useState<Record<string, FileAudit>>({});
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditProgress, setAuditProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [fileListFilter, setFileListFilter] = useState("");
  const [showStyleDiff, setShowStyleDiff] = useState(true);
  const [previewReadyTick, setPreviewReadyTick] = useState(0);
  const [previewSchemeId, setPreviewSchemeId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    if (!input.trim()) return;
    const mixed = detectLanguagesMixed(input);
    setDetectedLang(mixed.primary);
    setDetectedLangs(mixed.detected);
  }, [input]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/icons")
      .then((r) => r.json())
      .then((data: { icons?: IconEntry[] }) => {
        if (cancelled) return;
        setIcons(Array.isArray(data.icons) ? data.icons : []);
      })
      .catch(() => {
        if (cancelled) return;
        setIcons([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return icons;
    return icons.filter((i) => (i.path + " " + i.name).toLowerCase().includes(q));
  }, [icons, iconQuery]);

  async function readFileTextSafe(file: File): Promise<string | null> {
    try {
      // 過大ファイル対策（テキスト以外混入も多い想定）
      if (file.size > 2_000_000) return null;
      return await file.text();
    } catch {
      return null;
    }
  }

  async function uploadProjectFiles(dropped: ProjectDropFile[]): Promise<{ sid: string; entry: string | null; rootDir: string }> {
    const fd = new FormData();
    // 上限（事故防止）
    const limited = dropped.slice(0, 2000);
    for (const d of limited) {
      // filename に相対パスを入れる（サーバ側でこの名前をキーに保存）
      fd.append("files", d.file, d.path);
    }
    const res = await fetch("/api/project/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("upload failed");
    const data = (await res.json()) as { sid?: string; entry?: string | null; rootDir?: string };
    return { sid: data.sid || "", entry: data.entry ?? null, rootDir: data.rootDir || "" };
  }

  async function scanFilesFromInput(files: FileList | null) {
    if (!files || files.length === 0) return;
    setScanBusy(true);
    setScanSummary("スキャン中…");
    setScanCandidates([]);
    setProjectUploading(true);
    setActiveProjectPath("");
    setModifiedFiles({});
    setSaveCandidates({});
    setProjectAfterSid("");
    setProjectAfterEntry("");
    setProjectTextPaths([]);
    setFileAudits({});
    setAuditRunning(false);
    setAuditProgress({ done: 0, total: 0 });
    droppedFilesRef.current = new Map();
    droppedTextRef.current = new Map();
    let uploadedForAudit: { sid: string; entry: string | null } = { sid: "", entry: null };
    try {
      const list: ProjectFile[] = [];
      const all = Array.from(files);
      // 上限（事故防止）
      const limited = all.slice(0, 2000);
      const dropped: ProjectDropFile[] = [];
      const droppedPaths: string[] = [];
      for (const f of limited) {
        const rel = (f as any).webkitRelativePath || f.name;
        const relNorm = normalizePath(rel);
        dropped.push({ path: relNorm, file: f });
        droppedPaths.push(relNorm);
        droppedFilesRef.current.set(relNorm, f);
        if (looksTextFile(relNorm)) {
          const text = await readFileTextSafe(f);
          if (text != null) {
            list.push({ path: relNorm, text });
            droppedTextRef.current.set(relNorm, text);
          }
        }
      }
      const textPaths = Array.from(droppedTextRef.current.keys()).sort((a, b) => a.localeCompare(b, "ja"));
      setProjectTextPaths(textPaths);
      const htmlList = droppedPaths.filter(isHtmlPath).sort((a, b) => a.localeCompare(b, "ja"));
      setProjectHtmlList(htmlList);
      const candidates = topUiCandidates(list, 25);
      setScanCandidates(candidates);
      const summaryBase = `読み込み: ${list.length}ファイル / 候補: ${candidates.length}件`;
      setScanSummary(summaryBase);

      // 「現状表示」用: サーバにアップロードしてパス構造のまま配信
      try {
        const uploaded = await uploadProjectFiles(dropped);
        uploadedForAudit = { sid: uploaded.sid, entry: uploaded.entry };
        if (uploaded.sid) {
          setProjectSid(uploaded.sid);
          if (uploaded.entry) {
            setProjectDetectedEntry(uploaded.entry);
            setProjectEntry(uploaded.entry);
            setScanSummary(`${summaryBase} / Before: ${uploaded.entry}`);
          } else {
            setProjectDetectedEntry("");
            setProjectEntry("");
            setScanSummary(`${summaryBase} / Before: index.html が見つからず`);
          }
        } else {
          setScanSummary(`${summaryBase} / Before: アップロード失敗`);
        }
      } catch {
        setScanSummary(`${summaryBase} / Before: アップロード失敗`);
      }
    } finally {
      setScanBusy(false);
      setProjectUploading(false);
    }

    // 自動監査（SmartHR基準チェック）＋修正後サイトを After に反映
    const entries = Array.from(droppedTextRef.current.entries()).filter(([p]) => isAuditTargetPath(p));
    const total = Math.min(entries.length, 250);
    setAuditRunning(true);
    setAuditProgress({ done: 0, total });
    setFileAudits(() => {
      const init: Record<string, FileAudit> = {};
      for (const [p] of entries.slice(0, total)) init[p] = { mark: "pending", violations: 0 };
      // 対象外（拡張子など）
      for (const [p] of droppedTextRef.current.entries()) {
        if (!isAuditTargetPath(p)) init[p] = { mark: "skip", violations: 0 };
      }
      return init;
    });

    // UIを固めないように逐次実行（修正コードを集約し After にサイト全体として反映）
    (async () => {
      let done = 0;
      const overrides: Record<string, string> = {};
      const finalAudits: Record<string, FileAudit> = {};
      for (const [p] of entries.slice(0, total)) finalAudits[p] = { mark: "pending", violations: 0 };
      for (const [p] of droppedTextRef.current.entries()) {
        if (!isAuditTargetPath(p)) finalAudits[p] = { mark: "skip", violations: 0 };
      }

      for (const [p, text] of entries.slice(0, total)) {
        const mixed = detectLanguagesMixed(text);
        const primary = mixed.primary;
        const supported = primary === "html" || primary === "css" || primary === "jsx" || primary === "tsx";
        if (!supported) {
          finalAudits[p] = { mark: "skip", violations: 0, primary, detected: mixed.detected };
          setFileAudits((prev) => ({ ...prev, [p]: finalAudits[p]! }));
          done++;
          setAuditProgress({ done, total });
          continue;
        }
        try {
          const result = analyzeAndFix(text, primary);
          if (result.code !== text) overrides[p] = result.code;
          const v = result.violations?.length ?? 0;
          finalAudits[p] = { mark: v === 0 ? "ok" : "warn", violations: v, primary, detected: mixed.detected };
          setFileAudits((prev) => ({ ...prev, [p]: finalAudits[p]! }));
        } catch {
          finalAudits[p] = { mark: "warn", violations: 1, primary, detected: mixed.detected };
          setFileAudits((prev) => ({ ...prev, [p]: finalAudits[p]! }));
        }
        done++;
        setAuditProgress({ done, total });
        await new Promise((r) => setTimeout(r, 0));
      }
      if (Object.keys(overrides).length) setModifiedFiles(overrides);
      if (uploadedForAudit.sid && uploadedForAudit.entry) {
        await publishAfterSitePreview(overrides);
      }
      setSaveCandidates(buildInitialSaveCandidates(finalAudits, droppedTextRef.current));
      setAuditRunning(false);
    })();
  }

  function handlePickFolderClick() {
    folderInputRef.current?.click();
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    // DataTransfer.files はフォルダでもファイルとして展開されるブラウザが多い（Chrome）
    await scanFilesFromInput(files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function insertIntoInput(snippet: string) {
    const el = inputRef.current;
    if (!el) {
      setInput((prev) => (prev ? prev + "\n" + snippet : snippet));
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + snippet + el.value.slice(end);
    setInput(next);
    // selection restore
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function buildIconSnippet(iconPath: string, lang: Language): string {
    const src = `/api/icon?path=${encodeURIComponent(iconPath)}`;
    const alt = iconPath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "icon";
    if (lang === "css") {
      return `background-image: url("${src}");`;
    }
    if (lang === "jsx" || lang === "tsx") {
      return `<img src="${src}" alt="${alt}" />`;
    }
    // html
    return `<img src="${src}" alt="${alt}">`;
  }

  async function publishAfterSitePreview(overrides: Record<string, string>) {
    if (droppedFilesRef.current.size === 0) return;
    setProjectApplyingAll(true);
    try {
      const uploaded = await uploadProjectWithOverrides(overrides);
      if (uploaded.sid && uploaded.entry) {
        setProjectAfterSid(uploaded.sid);
        setProjectAfterEntry(uploaded.entry);
      }
    } finally {
      setProjectApplyingAll(false);
    }
  }

  async function handleFix() {
    if (!input.trim()) return;
    const result = analyzeAndFix(input, overrideLang || undefined);
    setOutput(result.code);
    setViolations(result.violations);
    setDetectedLang(result.detectedLanguage);
    setActiveTab("code");

    // フォルダ由来: 修正内容を保持し、After は「修正後のサイト全体」を表示
    if (activeProjectPath && projectSid) {
      const original = droppedTextRef.current.get(activeProjectPath) ?? "";
      const nextModified =
        result.code !== original
          ? { ...modifiedFiles, [activeProjectPath]: result.code }
          : (() => {
              const next = { ...modifiedFiles };
              delete next[activeProjectPath];
              return next;
            })();
      setModifiedFiles(nextModified);
      await publishAfterSitePreview(nextModified);
      if (result.code !== original) {
        setSaveCandidates((prev) => ({ ...prev, [activeProjectPath]: result.code }));
      }
    }
  }

  function analyzeCurrentText(text: string, forceShowViolations: boolean) {
    if (!text.trim()) {
      setOutput("");
      setViolations([]);
      return;
    }
    const mixed = detectLanguagesMixed(text);
    const primary = mixed.primary;
    try {
      const result = analyzeAndFix(text, primary);
      setOutput(result.code);
      setViolations(result.violations);
      setDetectedLang(result.detectedLanguage);
      if (forceShowViolations) setActiveTab("violations");
    } catch {
      // 解析エラー時は最低限の状態に
      setOutput(text);
      setViolations([{ severity: "error", line: 1, message: "解析に失敗しました", original: "", suggestion: "" } as any]);
      if (forceShowViolations) setActiveTab("violations");
    }
  }

  function timestampSlug(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function fixedFileName(path: string): string {
    const base = basename(path);
    const dot = base.lastIndexOf(".");
    return dot >= 0 ? `${base.slice(0, dot)}.fixed${base.slice(dot)}` : `${base}.fixed`;
  }

  async function collectAllFixedOverrides(): Promise<Record<string, string>> {
    const overrides: Record<string, string> = {};
    const entries = Array.from(droppedTextRef.current.entries()).filter(([p]) => isAuditTargetPath(p));
    for (const [p, text] of entries) {
      const mixed = detectLanguagesMixed(text);
      const primary = mixed.primary;
      try {
        const result = analyzeAndFix(text, primary);
        if (result.code !== text) overrides[p] = result.code;
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 0));
    }
    return overrides;
  }

  async function downloadTextFile(fileName: string, text: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadBlob(fileName: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function buildExportZipBlob(candidates: Record<string, string>): Promise<Blob> {
    const zip = new JSZip();
    for (const [relPath, file] of droppedFilesRef.current.entries()) {
      const rel = normalizePath(relPath);
      const candidateText = candidates[rel];
      if (candidateText != null && looksTextFile(rel)) {
        zip.file(rel, candidateText);
      } else if (looksTextFile(rel)) {
        const text = droppedTextRef.current.get(rel);
        zip.file(rel, text ?? (await file.text()));
      } else {
        zip.file(rel, await file.arrayBuffer());
      }
    }
    return zip.generateAsync({ type: "blob" });
  }

  async function saveSingleFixedFile(text: string, suggestedName: string) {
    const picker = (window as any).showSaveFilePicker as
      | undefined
      | ((opts: { suggestedName?: string; types?: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle>);
    if (picker) {
      const ext = suggestedName.split(".").pop()?.toLowerCase() ?? "txt";
      const mime =
        ext === "css" ? "text/css" : ext === "html" || ext === "htm" ? "text/html" : "text/plain";
      const handle = await picker({
        suggestedName,
        types: [{ description: "Text", accept: { [mime]: [`.${ext}`] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return;
    }
    await downloadTextFile(suggestedName, text);
  }

  async function addCurrentFileToSaveCandidates() {
    const fixedText =
      output.trim() ||
      (input.trim() ? analyzeAndFix(input, overrideLang || undefined).code : "");
    if (!fixedText.trim()) {
      alert("保存候補に追加する修正済みコードがありません。先に「SmartHR基準に修正」を実行してください。");
      return;
    }
    const path =
      activeProjectPath ||
      (effectiveLang === "css"
        ? "__draft__/styles.css"
        : effectiveLang === "html"
          ? "__draft__/index.html"
          : `__draft__/component.${effectiveLang === "tsx" ? "tsx" : effectiveLang === "jsx" ? "jsx" : "txt"}`);
    setSaveCandidates((prev) => ({ ...prev, [path]: fixedText }));
  }

  async function addAllFixedToSaveCandidates() {
    if (exportBusy) return;
    setExportBusy(true);
    try {
      const overrides = await collectAllFixedOverrides();
      if (!Object.keys(overrides).length) {
        alert("追加できる修正ファイルがありません。");
        return;
      }
      setSaveCandidates((prev) => ({ ...prev, ...overrides }));
    } finally {
      setExportBusy(false);
    }
  }

  function removeSaveCandidate(path: string) {
    setSaveCandidates((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }

  function resetSaveCandidatesToAuto() {
    setSaveCandidates(buildInitialSaveCandidates(fileAudits, droppedTextRef.current));
  }

  async function exportSaveCandidatesBundle() {
    if (exportBusy) return;
    if (droppedFilesRef.current.size === 0 && Object.keys(saveCandidates).length === 0) {
      alert("ダウンロードするファイルがありません。");
      return;
    }
    setExportBusy(true);
    try {
      if (droppedFilesRef.current.size > 0 && projectSid) {
        const zipName = `autoUI-fixed-${timestampSlug()}.zip`;
        const blob = await buildExportZipBlob(saveCandidates);
        await downloadBlob(zipName, blob);
        const fixedCount = Object.keys(saveCandidates).filter(
          (p) => saveCandidates[p] !== droppedTextRef.current.get(p)
        ).length;
        alert(
          `ダウンロードしました: ${zipName}\n` +
            `テキスト: ${Object.keys(saveCandidates).length}件（修正済み ${fixedCount}件）+ 画像等\n` +
            `元のアップロードファイルは変更していません。`
        );
        return;
      }

      const entries = Object.entries(saveCandidates);
      if (entries.length === 1) {
        const [path, text] = entries[0]!;
        const suggestedName = path.startsWith("__draft__/")
          ? fixedFileName(path.replace("__draft__/", ""))
          : fixedFileName(path);
        await saveSingleFixedFile(text, suggestedName);
        alert(`ダウンロードしました: ${suggestedName}\n元のファイルは変更していません。`);
        return;
      }

      if (entries.length > 1) {
        const zipName = `autoUI-fixed-${timestampSlug()}.zip`;
        const zip = new JSZip();
        for (const [path, text] of entries) {
          zip.file(path.replace(/^__draft__\//, ""), text);
        }
        await downloadBlob(zipName, await zip.generateAsync({ type: "blob" }));
        alert(`ダウンロードしました: ${zipName}`);
      }
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") {
        alert("ダウンロードに失敗しました。");
      }
    } finally {
      setExportBusy(false);
    }
  }

  async function addFixedFilesToSaveCandidatesFromReport() {
    if (droppedFilesRef.current.size > 0 && projectSid) {
      await addAllFixedToSaveCandidates();
    } else {
      await addCurrentFileToSaveCandidates();
    }
  }

  function makeTextFileFromString(path: string, text: string): File {
    // 元拡張子に合わせて最低限の type を付与
    const ext = path.split(".").pop()?.toLowerCase();
    const type =
      ext === "html" || ext === "htm"
        ? "text/html"
        : ext === "css"
          ? "text/css"
          : ext === "js" || ext === "mjs"
            ? "text/javascript"
            : ext === "json"
              ? "application/json"
              : "text/plain";
    return new File([text], path, { type });
  }

  async function uploadProjectWithOverrides(overrides: Record<string, string>) {
    const fd = new FormData();
    for (const [path, file] of droppedFilesRef.current.entries()) {
      const override = overrides[path];
      if (override != null && looksTextFile(path)) {
        fd.append("files", makeTextFileFromString(path, override), path);
      } else {
        fd.append("files", file, path);
      }
    }
    const res = await fetch("/api/project/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("upload failed");
    return (await res.json()) as { sid?: string; entry?: string | null; rootDir?: string };
  }

  async function applyAllFixesToAfterPreview() {
    if (projectApplyingAll) return;
    if (droppedFilesRef.current.size === 0) return;
    const entries = Array.from(droppedTextRef.current.entries()).filter(([p]) => isAuditTargetPath(p));
    const max = Math.min(entries.length, 250);
    const overrides: Record<string, string> = {};
    let changed = 0;
    for (const [p, text] of entries.slice(0, max)) {
      const mixed = detectLanguagesMixed(text);
      const primary = mixed.primary;
      try {
        const result = analyzeAndFix(text, primary);
        if (result.code !== text) {
          overrides[p] = result.code;
          changed++;
        }
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 0));
    }
    if (Object.keys(overrides).length) {
      setModifiedFiles(overrides);
      setSaveCandidates((prev) => ({ ...prev, ...overrides }));
    }
    await publishAfterSitePreview(overrides);
    setScanSummary((s) => `${s} / After: 修正後サイト（${changed}件反映）`);
  }

  function handleCopy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const effectiveLang: Language = overrideLang || detectedLang;
  const errorCount   = violations.filter((v) => v.severity === "error").length;
  const warnCount    = violations.filter((v) => v.severity === "warning").length;
  const infoCount    = violations.filter((v) => v.severity === "info").length;
  const groupedViolations = useMemo(() => groupViolations(violations), [violations]);
  const langLabel    = LANGUAGES.find((l) => l.value === effectiveLang)?.label ?? effectiveLang;
  const detectedLabel =
    detectedLangs.length <= 1
      ? (LANGUAGES.find((l) => l.value === detectedLangs[0])?.label ?? detectedLangs[0])
      : `混在（${detectedLangs.map((l) => LANGUAGES.find((x) => x.value === l)?.label ?? l).join(" / ")}）`;
  const fontChoice = FONT_CHOICES.find((f) => f.id === fontChoiceId) ?? FONT_CHOICES[0]!;
  const previewThemeScheme = previewSchemeId ? resolveColorScheme(previewSchemeId) : null;
  const beforeDoc = buildPreviewDoc(
    input,
    effectiveLang,
    fontScope,
    fontSelector,
    fontChoice.stack,
    fontChoice.headCss,
    null
  );
  const afterDoc = buildPreviewDoc(
    output,
    effectiveLang,
    fontScope,
    fontSelector,
    fontChoice.stack,
    fontChoice.headCss,
    previewThemeScheme
  );
  const previewSupported = beforeDoc !== null;
  const useSitePreview = Boolean(projectSid && projectEntry);
  const canShowPreview = useSitePreview || previewSupported;
  const selectedIcon = selectedIconPath
    ? icons.find((i) => i.path === selectedIconPath)
    : undefined;
  const iconListForGrid = filteredIcons.slice(0, 240);
  const projectBeforeUrl = useMemo(() => {
    if (!projectSid || !projectEntry) return "";
    const encodedPath = projectEntry
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    return `/__project/${encodeURIComponent(projectSid)}/${encodedPath}`;
  }, [projectSid, projectEntry]);

  const projectAfterUrl = useMemo(() => {
    if (!projectAfterSid || !projectAfterEntry) return "";
    const encodedPath = projectAfterEntry
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    const base = `/__project/${encodeURIComponent(projectAfterSid)}/${encodedPath}`;
    return appendThemeQuery(base, previewSchemeId);
  }, [projectAfterSid, projectAfterEntry, previewSchemeId]);

  function clearStyleDiff(doc: Document) {
    doc.querySelectorAll("[data-style-diff='1']").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      (el as HTMLElement).style.outlineOffset = "";
      el.removeAttribute("data-style-diff");
      el.removeAttribute("data-style-diff-title");
    });
    doc.getElementById("__autoUI_styleDiffStyle")?.remove();
    doc.getElementById("__autoUI_styleDiffLegend")?.remove();
  }

  function getDomPath(el: Element): string {
    const parts: string[] = [];
    let cur: Element | null = el;
    while (cur && cur.nodeType === 1 && parts.length < 30) {
      const tag = cur.tagName.toLowerCase();
      const parentEl: Element | null = cur.parentElement;
      if (!parentEl) {
        parts.unshift(tag);
        break;
      }
      const siblings = Array.from(parentEl.children).filter((c) => c.tagName === cur!.tagName);
      const idx = siblings.indexOf(cur) + 1;
      parts.unshift(`${tag}:nth-of-type(${idx})`);
      cur = parentEl;
    }
    return parts.join(">");
  }

  function diffComputedStyles(beforeDoc2: Document, afterDoc2: Document) {
    clearStyleDiff(afterDoc2);

    const style = afterDoc2.createElement("style");
    style.id = "__autoUI_styleDiffStyle";
    style.textContent = `
      [data-style-diff='1'] { outline: 2px solid rgba(245, 97, 33, 0.95) !important; outline-offset: 2px !important; }
      #__autoUI_styleDiffLegend {
        position: fixed; z-index: 2147483647; right: 10px; bottom: 10px;
        background: rgba(255,255,255,0.92); color: #23221e;
        border: 1px solid rgba(0,0,0,0.12); border-radius: 10px;
        padding: 8px 10px; font: 12px/1.3 -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        box-shadow: 0 10px 25px rgba(0,0,0,0.12);
      }
      #__autoUI_styleDiffLegend .k { font-weight: 700; margin-right: 6px; }
      #__autoUI_styleDiffLegend .dot { display:inline-block; width:10px; height:10px; border-radius:999px; background: rgba(245, 97, 33, 0.95); margin-right: 6px; vertical-align: -1px; }
    `;
    afterDoc2.head.appendChild(style);

    const beforeMap = new Map<string, Element>();
    const beforeEls = Array.from(beforeDoc2.body?.querySelectorAll("*") ?? []);
    for (const el of beforeEls) beforeMap.set(getDomPath(el), el);

    const props: (keyof CSSStyleDeclaration)[] = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "color",
      "backgroundColor",
      "borderColor",
    ];

    const afterEls = Array.from(afterDoc2.body?.querySelectorAll("*") ?? []);
    let changed = 0;
    for (const el of afterEls.slice(0, 4000)) {
      const key = getDomPath(el);
      const b = beforeMap.get(key);
      if (!b) continue;
      const bs = beforeDoc2.defaultView?.getComputedStyle(b);
      const as = afterDoc2.defaultView?.getComputedStyle(el);
      if (!bs || !as) continue;

      let diff = false;
      for (const p of props) {
        const bv = (bs as any)[p] as string;
        const av = (as as any)[p] as string;
        if (bv !== av) { diff = true; break; }
      }
      if (!diff) continue;

      (el as HTMLElement).setAttribute("data-style-diff", "1");
      changed++;
    }

    const legend = afterDoc2.createElement("div");
    legend.id = "__autoUI_styleDiffLegend";
    legend.innerHTML = `<span class="dot"></span><span class="k">差分</span>フォント/サイズ/色の変更箇所: <b>${changed}</b>`;
    afterDoc2.body?.appendChild(legend);
  }

  useEffect(() => {
    const b = beforeIframeRef.current?.contentDocument;
    const a = afterIframeRef.current?.contentDocument;
    if (!b || !a) return;
    if (!previewSupported) return;
    try {
      if (showStyleDiff) diffComputedStyles(b, a);
      else clearStyleDiff(a);
    } catch {
      // ignore
    }
  }, [showStyleDiff, previewSupported, beforeDoc, afterDoc, projectBeforeUrl, projectAfterUrl, previewReadyTick, previewSchemeId]);

  useEffect(() => {
    setPreviewReadyTick((v) => v + 1);
  }, [previewSchemeId]);

  const auditCounts = useMemo(() => {
    const counts = { ok: 0, warn: 0, skip: 0, pending: 0, fixed: 0 };
    for (const p of projectTextPaths) {
      const auditMark: AuditMark =
        fileAudits[p]?.mark ?? (isAuditTargetPath(p) ? "pending" : "skip");
      const original = droppedTextRef.current.get(p);
      const fixedInCandidates =
        auditMark === "warn" &&
        saveCandidates[p] != null &&
        original != null &&
        saveCandidates[p] !== original;
      if (fixedInCandidates) counts.fixed++;
      else counts[auditMark]++;
    }
    return counts;
  }, [fileAudits, projectTextPaths, saveCandidates]);

  const compactFileList = useMemo(() => {
    const q = fileListFilter.trim().toLowerCase();
    const list = projectTextPaths
      .filter((p) => !q || p.toLowerCase().includes(q) || basename(p).toLowerCase().includes(q))
      .map((p) => {
        const auditMark: AuditMark =
          fileAudits[p]?.mark ?? (isAuditTargetPath(p) ? "pending" : "skip");
        const original = droppedTextRef.current.get(p);
        const fixedInCandidates =
          auditMark === "warn" &&
          saveCandidates[p] != null &&
          original != null &&
          saveCandidates[p] !== original;
        return {
          path: p,
          base: basename(p),
          dir: dirname(p),
          mark: fixedInCandidates ? ("fixed" as AuditMark) : auditMark,
          violations: fileAudits[p]?.violations ?? 0,
        };
      })
      .sort((a, b) => {
        const d = markSortKey(a.mark) - markSortKey(b.mark);
        if (d !== 0) return d;
        return a.path.localeCompare(b.path, "ja");
      });
    return list;
  }, [projectTextPaths, fileAudits, fileListFilter, saveCandidates]);

  function openProjectFile(path: string) {
    const original = droppedTextRef.current.get(path);
    const fixed = saveCandidates[path];
    const text =
      fixed != null && original != null && fixed !== original ? fixed : original;
    if (text == null) return;
    setInput(text);
    setActiveProjectPath(path);
    if (projectSid && isHtmlPath(path)) setProjectEntry(path);
    analyzeCurrentText(text, true);
  }

  const hasPreviewTarget = Boolean(projectSid || input.trim());
  const canSaveFixedFiles =
    Boolean(projectSid && projectTextPaths.length > 0) ||
    Boolean(output.trim() || input.trim());
  const saveCandidatePaths = useMemo(
    () => Object.keys(saveCandidates).sort((a, b) => a.localeCompare(b, "ja")),
    [saveCandidates]
  );
  const saveCandidateCount = saveCandidatePaths.length;
  const saveCandidateFixedCount = useMemo(
    () =>
      saveCandidatePaths.filter((p) => saveCandidates[p] !== droppedTextRef.current.get(p)).length,
    [saveCandidatePaths, saveCandidates]
  );

  function isSaveCandidateFixed(path: string): boolean {
    return saveCandidates[path] !== droppedTextRef.current.get(path);
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <ProjectColorSchemePicker
        value={previewSchemeId}
        onChange={setPreviewSchemeId}
        disabled={!hasPreviewTarget}
      />

      {/* Folder scan */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-lg border border-dashed border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2.5"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[var(--ui-text)]">フォルダ</span>
          <button
            type="button"
            onClick={handlePickFolderClick}
            className="px-2 py-1 border border-[var(--ui-border)] rounded text-[11px] font-medium bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-border-soft)] transition-colors"
            disabled={scanBusy}
          >
            選択
          </button>
          <span className="text-[10px] text-[var(--ui-muted)] truncate max-w-[min(100%,28rem)]">{scanSummary}</span>
          {projectSid && (
            <>
              <button
                type="button"
                onClick={() => projectDetectedEntry && setProjectEntry(projectDetectedEntry)}
                disabled={!projectDetectedEntry}
                className="px-2 py-1 border border-[var(--ui-border)] rounded text-[11px] font-medium hover:bg-[var(--ui-border-soft)] transition-colors disabled:opacity-40"
                title={projectDetectedEntry ? `サイト全体: ${projectDetectedEntry}` : "index.html なし"}
              >
                サイト全体
              </button>
              <button
                type="button"
                onClick={applyAllFixesToAfterPreview}
                disabled={projectApplyingAll || auditRunning || !projectDetectedEntry}
                className="px-2 py-1 border border-[var(--ui-border)] rounded text-[11px] font-medium hover:bg-[var(--ui-border-soft)] transition-colors disabled:opacity-40"
                title="自動修正を全体に適用してAfterで確認"
              >
                Afterに全修正反映
              </button>
            </>
          )}
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory is supported in Chromium
            webkitdirectory=""
            multiple
            className="hidden"
            onChange={(e) => scanFilesFromInput(e.target.files)}
          />
        </div>

        {(projectSid || saveCandidateCount > 0 || canSaveFixedFiles) && (
          <div className="mt-2 rounded border border-[var(--ui-border)] bg-[var(--ui-surface-2)]/50 px-2.5 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[var(--ui-text)]">
                保存候補
                <span className="ml-1 text-[10px] font-normal text-[var(--ui-muted)]">
                  ({saveCandidateCount}件・修正 {saveCandidateFixedCount}件)
                </span>
              </span>
              <button
                type="button"
                onClick={addCurrentFileToSaveCandidates}
                disabled={exportBusy || !canSaveFixedFiles}
                className="px-2 py-1 border border-[var(--ui-border)] rounded text-[10px] font-medium hover:bg-[var(--ui-border-soft)] transition-colors disabled:opacity-40"
                title="表示中の修正済みコードを保存候補に上書き追加"
              >
                現在のファイルを追加
              </button>
              {projectSid && (
                <button
                  type="button"
                  onClick={addAllFixedToSaveCandidates}
                  disabled={exportBusy || auditRunning}
                  className="px-2 py-1 border border-[var(--ui-border)] rounded text-[10px] font-medium hover:bg-[var(--ui-border-soft)] transition-colors disabled:opacity-40"
                  title="違反のあったファイルの修正版をすべて保存候補に追加"
                >
                  修正ファイルをすべて追加
                </button>
              )}
              <button
                type="button"
                onClick={resetSaveCandidatesToAuto}
                disabled={saveCandidateCount === 0 || auditRunning}
                className="px-2 py-1 border border-[var(--ui-border)] rounded text-[10px] text-[var(--ui-muted)] hover:bg-[var(--ui-border-soft)] transition-colors disabled:opacity-40"
                title="違反なしファイルのみの自動状態に戻す"
              >
                候補をリセット
              </button>
              <button
                type="button"
                onClick={exportSaveCandidatesBundle}
                disabled={exportBusy || (!projectSid && saveCandidateCount === 0)}
                className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-40"
                title="保存候補＋その他ファイルを ZIP で一括ダウンロード（上書きなし）"
              >
                {exportBusy ? "ZIP作成中…" : "まとめてダウンロード"}
              </button>
            </div>
            {saveCandidateCount > 0 ? (
              <ul className="mt-1.5 max-h-24 overflow-y-auto flex flex-col gap-0.5">
                {saveCandidatePaths.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-[10px] text-[var(--ui-muted)] font-mono"
                  >
                    <span
                      className={`shrink-0 px-1 rounded text-[9px] font-sans ${
                        isSaveCandidateFixed(p)
                          ? "bg-[#fff8f0] text-[#f56121] border border-[#f56121]/30"
                          : "bg-[#f0f7ff] text-[#0077c7] border border-[#0077c7]/30"
                      }`}
                    >
                      {isSaveCandidateFixed(p) ? "修正" : "元"}
                    </span>
                    <span className="truncate flex-1" title={p}>
                      {p}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSaveCandidate(p)}
                      className="shrink-0 px-1 text-[var(--ui-muted)] hover:text-[var(--ui-danger)]"
                      title="保存候補から除外（ZIPには元ファイルで含まれます）"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-[10px] text-[var(--ui-muted)]">
                監査後、違反なし（○）のファイルは自動で候補に入ります。違反（△）ファイルは修正後に追加してください。
              </p>
            )}
          </div>
        )}

        {projectSid && projectHtmlList.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-[var(--ui-muted)] shrink-0">入口</span>
            <select
              value={projectEntry}
              onChange={(e) => {
                const p = e.target.value;
                setProjectEntry(p);
                const text = droppedTextRef.current.get(p);
                if (text != null) {
                  setActiveProjectPath(p);
                  setInput(text);
                  analyzeCurrentText(text, true);
                }
              }}
              className="flex-1 min-w-0 border border-[var(--ui-border)] rounded px-2 py-0.5 text-[11px] bg-[var(--ui-surface)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--ui-accent)]"
            >
              <option value="">HTML を選択…</option>
              {projectHtmlList.slice(0, 200).map((p) => (
                <option key={p} value={p}>
                  {markLabel(fileAudits[p]?.mark ?? "skip")} {basename(p)}
                </option>
              ))}
            </select>
          </div>
        )}

        {scanCandidates.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <input
                value={fileListFilter}
                onChange={(e) => setFileListFilter(e.target.value)}
                placeholder="ファイル名で絞り込み"
                className="flex-1 min-w-[140px] border border-[var(--ui-border)] rounded px-2 py-1 text-[11px] bg-white text-[var(--ui-text)] placeholder-[#c1bdb7] focus:outline-none focus:ring-1 focus:ring-[var(--ui-accent)]"
              />
              <div className="flex items-center gap-1 text-[10px] text-[var(--ui-muted)]">
                <span className="px-1.5 py-0.5 rounded bg-[#e6f7ec] text-[#1a7f37]">○{auditCounts.ok}</span>
                <span className="px-1.5 py-0.5 rounded bg-[#fff8f0] text-[#c45a00]">△{auditCounts.warn}</span>
                {auditCounts.fixed > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#edebe8] text-[#706d65]">修{auditCounts.fixed}</span>
                )}
                <span className="px-1.5 py-0.5 rounded bg-[var(--ui-border-soft)]">—{auditCounts.skip}</span>
                {auditRunning && (
                  <span className="px-1.5 py-0.5 rounded bg-[var(--ui-border-soft)]">…{auditCounts.pending}</span>
                )}
              </div>
              {projectTextPaths.length > 0 && (
                <span className="text-[10px] text-[var(--ui-muted)] ml-auto">
                  {auditRunning ? `チェック ${auditProgress.done}/${auditProgress.total}` : `${compactFileList.length}件`}
                </span>
              )}
            </div>
            <div className="max-h-[200px] overflow-y-auto rounded-md border border-[var(--ui-border)] bg-white divide-y divide-[var(--ui-border-soft)]">
              {compactFileList.map((c) => {
                const active = activeProjectPath === c.path;
                const isFixedRow = c.mark === "fixed";
                return (
                  <button
                    key={c.path}
                    type="button"
                    onClick={() => openProjectFile(c.path)}
                    className={`w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors hover:bg-[var(--ui-border-soft)] ${
                      active ? "bg-[#f0f7ff] ring-1 ring-inset ring-[var(--ui-accent)]/30" : ""
                    } ${isFixedRow ? "opacity-50" : ""}`}
                    title={isFixedRow ? `${c.path}（修正済み・保存候補）` : c.path}
                  >
                    <AuditBadge mark={c.mark} violations={c.violations} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5 min-w-0">
                        <span
                          className={`text-[11px] font-semibold truncate ${
                            isFixedRow ? "text-[var(--ui-muted)]" : "text-[var(--ui-text)]"
                          }`}
                        >
                          {c.base}
                        </span>
                        {c.mark === "warn" && c.violations > 0 && (
                          <span className="text-[10px] text-[#c45a00] shrink-0">{c.violations}</span>
                        )}
                        {isFixedRow && (
                          <span className="text-[10px] text-[var(--ui-muted)] shrink-0">修正済み</span>
                        )}
                      </span>
                      {c.dir && (
                        <span className="block text-[10px] text-[var(--ui-muted)] truncate font-mono">{c.dir}/</span>
                      )}
                    </span>
                    <span className="hidden sm:inline text-[9px] text-[var(--ui-muted)] shrink-0 max-w-[88px] truncate">
                      {fileAudits[c.path]?.primary ?? ""}
                    </span>
                  </button>
                );
              })}
              {compactFileList.length === 0 && (
                <div className="px-3 py-4 text-center text-[11px] text-[var(--ui-muted)]">該当ファイルがありません</div>
              )}
            </div>
          </div>
        )}
        {scanCandidates.length === 0 && scanSummary && !scanBusy && (
          <div className="mt-2 text-xs text-[var(--ui-muted)]">
            候補が出ない場合は、HTML/CSS/TSX などのUIファイルが含まれているか確認してください。
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--ui-muted)]">検出言語</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] text-xs font-medium">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {detectedLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ui-muted)]">変更</span>
          <select
            value={overrideLang}
            onChange={(e) => setOverrideLang(e.target.value as Language | "")}
            className="border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)]"
          >
            <option value="">自動</option>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Font controls (preview) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ui-muted)]">フォント</span>
          <select
            value={fontChoiceId}
            onChange={(e) => setFontChoiceId(e.target.value)}
            className="border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)]"
          >
            {FONT_CHOICES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ui-muted)]">適用</span>
          <select
            value={fontScope}
            onChange={(e) => setFontScope(e.target.value as FontScope)}
            className="border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)]"
          >
            <option value="global">全体</option>
            <option value="selector">一部（セレクタ）</option>
          </select>
        </div>
        {fontScope === "selector" && (
          <div className="flex items-center gap-1.5 min-w-[240px]">
            <span className="text-xs text-[var(--ui-muted)]">対象</span>
            <input
              value={fontSelector}
              onChange={(e) => setFontSelector(e.target.value)}
              placeholder='例: "h1, .btn, #hero"'
              className="border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-text)] placeholder-[#c1bdb7] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)] w-full"
            />
          </div>
        )}

        {/* Icon insert */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--ui-muted)]">アイコン</span>
          <button
            type="button"
            onClick={() => setIconPickerOpen((v) => !v)}
            className="px-3 py-1.5 border border-[var(--ui-border)] rounded text-xs font-medium bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-border-soft)] transition-colors"
          >
            {iconPickerOpen ? "閉じる" : "選ぶ"}
          </button>
          <button
            type="button"
            disabled={!selectedIconPath}
            onClick={() => insertIntoInput(buildIconSnippet(selectedIconPath, effectiveLang))}
            className="px-3 py-1.5 bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] rounded text-xs font-medium hover:bg-[var(--ui-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            挿入
          </button>
          {selectedIcon && (
            <span className="inline-flex items-center gap-1.5 pl-1">
              <span className="w-5 h-5 rounded border border-[var(--ui-border)] bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={`/api/icon?path=${encodeURIComponent(selectedIcon.path)}`}
                  alt={selectedIcon.name}
                  className="max-w-full max-h-full"
                />
              </span>
            </span>
          )}
        </div>
        <button
          onClick={handleFix}
          disabled={!input.trim()}
          className="ml-auto px-5 py-2 bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] rounded text-sm font-medium hover:bg-[var(--ui-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          SmartHR基準に修正
        </button>
      </div>

      {/* Icon picker grid */}
      {iconPickerOpen && (
        <div className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center gap-3">
            <span className="text-xs font-medium text-[var(--ui-muted)]">アイコンを選択</span>
            <input
              value={iconQuery}
              onChange={(e) => setIconQuery(e.target.value)}
              placeholder="検索（例: メッセージ / service / SVG）"
              className="ml-auto border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-text)] placeholder-[#c1bdb7] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)] w-[320px] max-w-full"
            />
          </div>
          <div className="p-3">
            <div className="text-[11px] text-[var(--ui-muted)] mb-2 flex items-center justify-between">
              <span>
                {icons.length ? `全${icons.length}件` : "読込中…"}
                {iconQuery.trim() ? ` / 検索結果${filteredIcons.length}件` : ""}
                {" / 表示上限240件"}
              </span>
              {selectedIconPath && (
                <span className="truncate max-w-[60%]">
                  選択中: <span className="font-mono">{selectedIconPath}</span>
                </span>
              )}
            </div>
            <div className="max-h-[260px] overflow-y-auto rounded border border-[var(--ui-border-soft)] bg-[#fafafa] p-2">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
                {iconListForGrid.map((ic) => {
                  const active = ic.path === selectedIconPath;
                  const src = `/api/icon?path=${encodeURIComponent(ic.path)}`;
                  return (
                    <button
                      key={ic.path}
                      type="button"
                      onClick={() => setSelectedIconPath(ic.path)}
                      title={ic.path}
                      className={`rounded border text-left overflow-hidden bg-white hover:shadow-sm transition-all ${
                        active ? "border-[var(--ui-accent)] ring-2 ring-[var(--ui-accent)]/20" : "border-[var(--ui-border)]"
                      }`}
                    >
                      <div className="h-10 flex items-center justify-center">
                        <img src={src} alt={ic.name} className="max-h-8 max-w-8" />
                      </div>
                      <div className="px-1.5 pb-1.5 text-[9px] text-[var(--ui-muted)] truncate">
                        {ic.name}
                      </div>
                    </button>
                  );
                })}
                {iconListForGrid.length === 0 && (
                  <div className="col-span-full text-sm text-[var(--ui-muted)] py-8 text-center">
                    見つかりませんでした
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor panels（固定高さ・内部スクロール） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Input */}
        <div className="flex flex-col bg-[var(--ui-surface)] rounded border border-[var(--ui-border)] overflow-hidden">
          <div className="px-3 py-1.5 border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center justify-between shrink-0">
            <span className="text-xs font-medium text-[var(--ui-muted)]">入力コード</span>
            {input && <span className="text-[10px] text-[#c1bdb7]">{input.split("\n").length} 行</span>}
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="コードを貼り付けると言語を自動検出して修正します"
            className="h-[200px] w-full p-3 font-mono text-xs resize-none overflow-y-auto focus:outline-none text-[var(--ui-text)] placeholder-[#c1bdb7] leading-relaxed bg-transparent"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-[var(--ui-surface)] rounded border border-[var(--ui-border)] overflow-hidden">
          <div className="border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center shrink-0">
            <button
              onClick={() => setActiveTab("code")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === "code" ? "border-[var(--ui-accent)] text-[var(--ui-accent)] bg-[var(--ui-surface)]" : "border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]"}`}
            >
              修正済みコード
            </button>
            <button
              onClick={() => setActiveTab("violations")}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "violations" ? "border-[var(--ui-accent)] text-[var(--ui-accent)] bg-[var(--ui-surface)]" : "border-transparent text-[var(--ui-muted)] hover:text-[var(--ui-text)]"}`}
            >
              違反レポート
              {violations.length > 0 && (
                <span className="bg-[#e01e5a] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                  {violations.length}
                </span>
              )}
            </button>
            {output && activeTab === "code" && (
              <button onClick={handleCopy} className="ml-auto mr-3 text-xs text-[var(--ui-accent)] hover:underline">
                {copied ? "コピー済み!" : "コピー"}
              </button>
            )}
            {activeTab === "violations" && (
              <button
                type="button"
                onClick={addFixedFilesToSaveCandidatesFromReport}
                disabled={exportBusy || !canSaveFixedFiles}
                className="ml-auto mr-3 px-2.5 py-1 rounded text-[11px] font-medium bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] hover:opacity-90 disabled:opacity-40 transition-opacity"
                title="修正済みコードを保存候補に追加（まとめてダウンロードは保存候補パネルから）"
              >
                {exportBusy ? "追加中…" : "修正を候補に追加"}
              </button>
            )}
          </div>
          <div className="h-[200px] overflow-y-auto min-h-0">
            {activeTab === "code" ? (
              output ? (
                <pre className="p-3 font-mono text-xs whitespace-pre-wrap text-[var(--ui-text)] leading-relaxed">{output}</pre>
              ) : (
                <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-[#c1bdb7]">
                  <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 6H16M8 10H16M8 14H12" strokeLinecap="round"/>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                  <span className="text-sm">修正済みコードがここに表示されます</span>
                </div>
              )
            ) : (
              <div className="p-4">
                {violations.length === 0 ? (
                    <div className="text-sm text-[var(--ui-muted)] text-center py-8">
                    {output ? "✓ 違反はありませんでした" : "修正を実行してください"}
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {errorCount > 0 && <span className="px-2 py-1 rounded text-xs bg-[#fff0f3] text-[#e01e5a] font-medium border border-[#e01e5a]/30">エラー {errorCount}</span>}
                      {warnCount > 0  && <span className="px-2 py-1 rounded text-xs bg-[#fff8f0] text-[#f56121] font-medium border border-[#f56121]/30">警告 {warnCount}</span>}
                      {infoCount > 0  && <span className="px-2 py-1 rounded text-xs bg-[#f0f7ff] text-[#0077c7] font-medium border border-[#0077c7]/30">情報 {infoCount}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      {groupedViolations.map((g, i) => {
                        const s = SEVERITY_STYLE[g.severity];
                        return (
                          <div key={i} className="rounded border p-3 text-xs" style={{ borderColor: s.border, backgroundColor: s.bg }}>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: s.badge }}>{s.label}</span>
                              <span className="text-[var(--ui-muted)]">{formatViolationLines(g.lines)}</span>
                            </div>
                            <p className="font-medium text-[var(--ui-text)] mb-1">{g.message}</p>
                            {g.original && <code className="block text-[var(--ui-muted)] bg-white/70 px-2 py-0.5 rounded font-mono mb-1 break-all">{g.original}</code>}
                            {g.suggestion && <p className="text-[var(--ui-accent)]">→ {g.suggestion}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded border border-[var(--ui-border)] bg-[var(--ui-surface)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--ui-muted)]">プレビュー（Before → After）</span>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-[11px] text-[var(--ui-muted)] select-none">
              <input
                type="checkbox"
                checked={showStyleDiff}
                onChange={(e) => setShowStyleDiff(e.target.checked)}
              />
              変更箇所を強調
            </label>
            <span className="text-[10px] text-[#c1bdb7]">{langLabel}</span>
          </div>
        </div>
        {!canShowPreview ? (
          <div className="p-4 text-sm text-[var(--ui-muted)]">
            JSX/TSX のプレビューはこの画面内では対応していません（HTML/CSS のみ対応）。フォルダを読み込むとサイト全体を Before/After で比較できます。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0">
            <div className="border-r border-[var(--ui-border)]">
              <div className="px-3 py-1.5 text-[11px] font-medium text-[var(--ui-muted)]">
                {useSitePreview ? "Before（現状のサイト）" : "Before（入力）"}
              </div>
              <div className="h-[320px] bg-white relative">
                <iframe
                  title="before-preview"
                  className="w-full h-full"
                  ref={beforeIframeRef}
                  sandbox="allow-scripts allow-same-origin"
                  src={projectBeforeUrl || undefined}
                  srcDoc={!projectBeforeUrl ? (beforeDoc ?? "") : undefined}
                  onLoad={() => setPreviewReadyTick((v) => v + 1)}
                />
                {projectUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="text-sm text-[var(--ui-muted)]">アップロード中…</div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="px-3 py-1.5 text-[11px] font-medium text-[var(--ui-muted)]">
                {useSitePreview
                  ? previewSchemeId
                    ? "After（修正後・配色プレビュー）"
                    : "After（修正後のサイト）"
                  : previewSchemeId
                    ? "After（修正後・配色プレビュー）"
                    : "After（修正後）"}
              </div>
              <div className="h-[320px] bg-white relative">
                {(projectAfterUrl || !useSitePreview) && (
                  <iframe
                    title="after-preview"
                    className="w-full h-full"
                    ref={afterIframeRef}
                    sandbox="allow-scripts allow-same-origin"
                    src={projectAfterUrl || undefined}
                    srcDoc={!projectAfterUrl && !useSitePreview ? (afterDoc ?? "") : undefined}
                    onLoad={() => setPreviewReadyTick((v) => v + 1)}
                  />
                )}
                {useSitePreview && !projectAfterUrl && !projectApplyingAll && !auditRunning && (
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[var(--ui-muted)]">
                    「Afterに全修正反映」またはファイル修正で、修正後のサイトがここに表示されます
                  </div>
                )}
                {(projectApplyingAll || auditRunning) && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="text-sm text-[var(--ui-muted)]">
                      {auditRunning ? "監査・修正反映中…" : "修正後サイトを生成中…"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── メインページ ──────────────────────────────────

export default function Home() {
  const [appTab, setAppTab] = useState<AppTab>("ui-fix");

  return (
    <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--ui-surface)] border-b border-[var(--ui-border)] px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* ロゴ */}
          <div className="flex items-center gap-3 mr-4">
            <div className="w-8 h-8 bg-[var(--ui-accent)] rounded flex items-center justify-center flex-shrink-0">
              <span className="text-[var(--ui-accent-contrast)] text-sm font-bold">S</span>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">autoUI</h1>
              <p className="text-xs text-[var(--ui-muted)]">SmartHR Design System</p>
            </div>
          </div>

          {/* タブナビゲーション */}
          <nav className="flex items-center gap-1">
            {APP_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setAppTab(tab.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  appTab === tab.value
                    ? "bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)]"
                    : "text-[var(--ui-muted)] hover:bg-[var(--ui-border-soft)] hover:text-[var(--ui-text)]"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 py-5">
        {appTab === "ui-fix" && <UIFixPanel />}
        {appTab === "logo"   && <LogoGenerator />}
      </main>
    </div>
  );
}
