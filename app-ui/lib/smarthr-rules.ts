// ─────────────────────────────────────────────
//  SmartHR Design System ルールエンジン
//  ・言語自動検出
//  ・スタイル定義部分のみを対象に修正
// ─────────────────────────────────────────────

import { isSmartHRColor, findClosestColor } from "./smarthr-palette";

export type Language = "html" | "css" | "tsx" | "jsx";
export type RuleSeverity = "error" | "warning" | "info";

export interface Violation {
  line: number;
  message: string;
  severity: RuleSeverity;
  original: string;
  suggestion?: string;
}

export interface FixResult {
  code: string;
  violations: Violation[];
  detectedLanguage: Language;
}

const FONT_SCALE: { px: number; rem: string; token: string }[] = [
  { px: 10.67, rem: "0.667rem", token: "XXS" },
  { px: 12,    rem: "0.75rem",  token: "XS" },
  { px: 13.71, rem: "0.857rem", token: "S" },
  { px: 16,    rem: "1rem",     token: "M" },
  { px: 19.2,  rem: "1.2rem",   token: "L" },
  { px: 24,    rem: "1.5rem",   token: "XL" },
  { px: 32,    rem: "2rem",     token: "XXL" },
];

// Tailwind の汎用色クラス → SmartHR トークン色
const TAILWIND_COLOR_MAP: Record<string, string> = {
  "text-blue-600":    "text-[#0077c7]",
  "text-blue-500":    "text-[#0077c7]",
  "bg-blue-600":      "bg-[#0077c7]",
  "bg-blue-500":      "bg-[#0077c7]",
  "text-red-500":     "text-[#e01e5a]",
  "text-red-600":     "text-[#e01e5a]",
  "bg-red-500":       "bg-[#e01e5a]",
  "text-gray-900":    "text-[#23221e]",
  "text-gray-800":    "text-[#23221e]",
  "text-gray-500":    "text-[#706d65]",
  "text-gray-400":    "text-[#706d65]",
  "text-gray-300":    "text-[#c1bdb7]",
  "border-gray-200":  "border-[#d6d3d0]",
  "border-gray-300":  "border-[#d6d3d0]",
  "bg-gray-50":       "bg-[#f8f7f6]",
  "bg-gray-100":      "bg-[#f8f7f6]",
  "bg-gray-200":      "bg-[#edebe8]",
};

// SmartHR UI コンポーネント提案 (React)
const COMPONENT_HINTS: { pattern: RegExp; hint: string }[] = [
  { pattern: /<button\b[^>]*>/gi,   hint: "<PrimaryButton> / <DangerButton> / <Button> (smarthr-ui)" },
  { pattern: /<input\b[^>]*type="text"[^>]*>/gi, hint: "<Input> (smarthr-ui)" },
  { pattern: /<select\b[^>]*>/gi,   hint: "<Select> (smarthr-ui)" },
  { pattern: /<textarea\b[^>]*>/gi, hint: "<Textarea> (smarthr-ui)" },
];

// ── ユーティリティ ────────────────────────────

function lineOf(code: string, index: number): number {
  return code.substring(0, index).split("\n").length;
}

function closestFontSize(px: number): { rem: string; token: string } | null {
  let best: { rem: string; token: string; dist: number } | null = null;
  for (const s of FONT_SCALE) {
    const d = Math.abs(s.px - px);
    if (!best || d < best.dist) best = { rem: s.rem, token: s.token, dist: d };
  }
  return best && best.dist <= 4 ? { rem: best.rem, token: best.token } : null;
}

// ── 言語自動検出 ──────────────────────────────

export function detectLanguage(code: string): Language {
  const t = code.trim();

  // TypeScript の型記法 + JSX
  const hasTS =
    /:\s*(string|number|boolean|React\.FC|JSX\.Element|void|ReactNode)\b/.test(t) ||
    /^(interface|type)\s+\w+/m.test(t);
  const hasJSX =
    /className\s*=/.test(t) ||
    /<[A-Z]\w*[\s/>]/.test(t) ||
    /import\s+.*from\s+['"]react['"]/i.test(t) ||
    /export\s+(default\s+)?(function|const|class)\s+\w/.test(t);

  if (hasJSX && hasTS) return "tsx";
  if (hasJSX) return "jsx";

  // HTML: < タグがあり CSS セレクタ構造でない
  if (/<[a-zA-Z][^>]*>/.test(t) || /<!DOCTYPE/i.test(t)) return "html";

  // CSS: セレクタ { プロパティ: 値 } 構造
  if (/^\s*[\w\-\.#\[\]:*>~+\s,@]+\s*\{[\s\S]*?\}/m.test(t) ||
      /^\s*[\w-]+\s*:\s*[^;{]+;/m.test(t)) return "css";

  return "html";
}

// ── CSS プロパティ値の修正 ────────────────────
// 1行分の "propName: value" を受け取り修正済み文字列と違反を返す

interface PropFixResult {
  fixed: string;
  violations: Omit<Violation, "line">[];
}

function fixCssPropValue(propName: string, value: string): PropFixResult {
  const prop = propName.trim().toLowerCase();
  const violations: Omit<Violation, "line">[] = [];
  let fixed = value;

  // ── 色プロパティ ──
  const isColorProp =
    prop === "color" ||
    prop === "background-color" ||
    prop === "background" ||
    prop === "border-color" ||
    prop.endsWith("-color") ||
    prop === "fill" ||
    prop === "stroke";

  if (isColorProp) {
    fixed = fixed.replace(/#([0-9a-fA-F]{3,6})\b/g, (hex) => {
      if (isSmartHRColor(hex)) return hex; // すでに SmartHR カラー
      const { color: closest, distance } = findClosestColor(hex);
      const severity: RuleSeverity = distance < 30 ? "warning" : "error";
      violations.push({
        severity,
        original: hex,
        message: `"${hex}" はSmartHRカラーパレット外の色です`,
        suggestion: `最も近い候補: ${closest.name} (${closest.hex}) [${closest.group}]`,
      });
      return hex;
    });
  }

  // ── フォントサイズ ──
  if (prop === "font-size") {
    fixed = fixed.replace(/(\d+(?:\.\d+)?)px\b/g, (_, num) => {
      const px = parseFloat(num);
      const s = closestFontSize(px);
      if (s) {
        violations.push({
          severity: "warning",
          original: `${num}px`,
          message: `font-size: ${num}px はpx単位を使用しています`,
          suggestion: `${s.rem} (SmartHR ${s.token}トークン) に変更しました`,
        });
        return s.rem;
      }
      violations.push({
        severity: "error",
        original: `${num}px`,
        message: `font-size: ${num}px はSmartHRタイポグラフィスケール外です`,
        suggestion: "XXS(0.667rem)〜XXL(2rem) のSmartHRトークンを使用してください",
      });
      return `${num}px`;
    });

    // rem 値がスケール外でないかチェック
    fixed = fixed.replace(/([\d.]+)rem\b/g, (_, num) => {
      const px = parseFloat(num) * 16;
      if (!closestFontSize(px)) {
        violations.push({
          severity: "error",
          original: `${num}rem`,
          message: `font-size: ${num}rem はSmartHRタイポグラフィスケール外です`,
          suggestion: "SmartHRのフォントサイズトークン (XXS〜XXL) を使用してください",
        });
      }
      return `${num}rem`;
    });
  }

  // ── line-height ──
  if (prop === "line-height") {
    const val = parseFloat(value);
    if (!isNaN(val) && (val > 2 || (val < 1 && val !== 0))) {
      violations.push({
        severity: "info",
        original: value.trim(),
        message: `line-height: ${val} はSmartHR行送りルール外の可能性があります`,
        suggestion: "見出し: 1.25 (TIGHT) / 本文: 1.5 (NORMAL) / ラベル: 1 (NONE)",
      });
    }
  }

  return { fixed, violations };
}

// ── CSS ブロックの修正 ────────────────────────
// セレクタ・コメントは保持し、プロパティ値のみ修正する

function fixCssBlock(
  css: string,
  baseOffset: number,
  baseCode: string
): { fixed: string; violations: Violation[] } {
  const violations: Violation[] = [];

  // "propName: value" を分離して個別に修正
  const fixed = css.replace(
    /([\w-]+)\s*:\s*([^;{}]+)(;?)/g,
    (match, propName, rawValue, semi, offset) => {
      const result = fixCssPropValue(propName, rawValue);
      const line = lineOf(baseCode, baseOffset + offset);
      for (const v of result.violations) {
        violations.push({ ...v, line });
      }
      return `${propName}: ${result.fixed}${semi}`;
    }
  );

  return { fixed, violations };
}

// ── Tailwind クラス文字列の修正 ───────────────

function fixTailwindClasses(
  classStr: string,
  line: number
): { fixed: string; violations: Violation[] } {
  const violations: Violation[] = [];
  let fixed = classStr;

  for (const [bad, good] of Object.entries(TAILWIND_COLOR_MAP)) {
    if (new RegExp(`\\b${bad}\\b`).test(fixed)) {
      violations.push({
        line,
        severity: "warning",
        original: bad,
        message: `Tailwindクラス "${bad}" はSmartHRトークン外の色です`,
        suggestion: `"${good}" に変更しました`,
      });
      fixed = fixed.replace(new RegExp(`\\b${bad}\\b`, "g"), good);
    }
  }

  return { fixed, violations };
}

// ── HTML 修正 ────────────────────────────────
// style="" と <style> ブロックと class="" のみを対象にする

function fixHtml(code: string): { fixed: string; violations: Violation[] } {
  let fixed = code;
  const violations: Violation[] = [];

  // 1. style="..." インライン属性
  fixed = fixed.replace(/\bstyle="([^"]*)"/gi, (match, styleContent, offset) => {
    const result = fixCssBlock(styleContent, offset + 7, code); // 7 = 'style="'.length
    violations.push(...result.violations);
    return `style="${result.fixed}"`;
  });

  // 2. <style>...</style> ブロック
  fixed = fixed.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, open, css, close, offset) => {
    const result = fixCssBlock(css, offset + open.length, code);
    violations.push(...result.violations);
    return open + result.fixed + close;
  });

  // 3. class="..." の Tailwind クラス
  fixed = fixed.replace(/\bclass="([^"]*)"/gi, (match, classStr, offset) => {
    const result = fixTailwindClasses(classStr, lineOf(code, offset));
    violations.push(...result.violations);
    return `class="${result.fixed}"`;
  });

  return { fixed, violations };
}

// ── CSS ファイル修正 ──────────────────────────

function fixCss(code: string): { fixed: string; violations: Violation[] } {
  const result = fixCssBlock(code, 0, code);
  return result;
}

// ── React (TSX/JSX) 修正 ─────────────────────
// className="..." / className={`...`} と style={{...}} のみ対象

function fixReact(code: string, lang: Language): { fixed: string; violations: Violation[] } {
  let fixed = code;
  const violations: Violation[] = [];

  // 1. className="..." の Tailwind クラス
  fixed = fixed.replace(/\bclassName="([^"]*)"/g, (match, classStr, offset) => {
    const result = fixTailwindClasses(classStr, lineOf(code, offset));
    violations.push(...result.violations);
    return `className="${result.fixed}"`;
  });

  // 2. className={`...`} テンプレートリテラル内の Tailwind クラス
  fixed = fixed.replace(/\bclassName=\{`([^`]*)`\}/g, (match, classStr, offset) => {
    const result = fixTailwindClasses(classStr, lineOf(code, offset));
    violations.push(...result.violations);
    return `className={\`${result.fixed}\`}`;
  });

  // 3. style={{ propName: "value" }} 内のスタイル値
  // JSX の style オブジェクト: style={{ color: "#333", fontSize: "14px" }}
  fixed = fixed.replace(
    /\bstyle=\{\{([\s\S]*?)\}\}/g,
    (match, styleObj, offset) => {
      // プロパティ名を camelCase → kebab-case に変換してチェック
      const fixedObj = styleObj.replace(
        /(\w+)\s*:\s*["']([^"']+)["']/g,
        (propMatch: string, camel: string, val: string, propOffset: number) => {
          const kebab = camel.replace(/([A-Z])/g, "-$1").toLowerCase();
          const result = fixCssPropValue(kebab, val);
          const line = lineOf(code, offset + propOffset);
          for (const v of result.violations) violations.push({ ...v, line });
          return `${camel}: "${result.fixed}"`;
        }
      );
      return `style={{${fixedObj}}}`;
    }
  );

  // 4. SmartHR UI コンポーネント提案
  for (const { pattern, hint } of COMPONENT_HINTS) {
    let m;
    const re = new RegExp(pattern.source, pattern.flags);
    while ((m = re.exec(fixed)) !== null) {
      violations.push({
        line: lineOf(fixed, m.index),
        severity: "info",
        original: m[0].substring(0, 50) + (m[0].length > 50 ? "…" : ""),
        message: "SmartHR UIコンポーネントの利用を検討してください",
        suggestion: hint,
      });
    }
  }

  return { fixed, violations };
}

// ── メインエントリ ────────────────────────────

export function analyzeAndFix(code: string, overrideLang?: Language): FixResult {
  const detectedLanguage = overrideLang ?? detectLanguage(code);

  let result: { fixed: string; violations: Violation[] };
  if (detectedLanguage === "css") {
    result = fixCss(code);
  } else if (detectedLanguage === "tsx" || detectedLanguage === "jsx") {
    result = fixReact(code, detectedLanguage);
  } else {
    result = fixHtml(code);
  }

  const { fixed, violations } = result;

  // 変更があった場合にのみサマリーコメントを先頭に追加
  let outputCode = fixed;
  if (fixed !== code && violations.length > 0) {
    const e = violations.filter((v) => v.severity === "error").length;
    const w = violations.filter((v) => v.severity === "warning").length;
    const i = violations.filter((v) => v.severity === "info").length;
    const isCSS = detectedLanguage === "css";
    const c = (s: string) => isCSS ? `/* ${s} */` : `// ${s}`;
    const header = [
      c(`[autoUI] SmartHR Design System 修正サマリー (${detectedLanguage.toUpperCase()})`),
      c(`エラー: ${e}  警告: ${w}  情報: ${i}`),
      ...(detectedLanguage === "tsx" || detectedLanguage === "jsx"
        ? [c("SmartHR UI: import { Button, Input, ... } from 'smarthr-ui'")]
        : []),
      "",
    ].join("\n");
    outputCode = header + outputCode;
  }

  return { code: outputCode, violations, detectedLanguage };
}
