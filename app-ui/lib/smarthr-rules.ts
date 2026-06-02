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

/** SmartHR 行送り: NONE / TIGHT / NORMAL */
const LINE_HEIGHT_TOKENS: { value: number; label: string }[] = [
  { value: 1, label: "NONE" },
  { value: 1.25, label: "TIGHT" },
  { value: 1.5, label: "NORMAL" },
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

function nearestFontScaleByPx(px: number): { rem: string; token: string } {
  let best = FONT_SCALE[0]!;
  let bestDist = Infinity;
  for (const s of FONT_SCALE) {
    const d = Math.abs(s.px - px);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return { rem: best.rem, token: best.token };
}

function closestLineHeight(val: number): { value: number; label: string } {
  let best = LINE_HEIGHT_TOKENS[0]!;
  let bestDist = Infinity;
  for (const t of LINE_HEIGHT_TOKENS) {
    const d = Math.abs(t.value - val);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
}

function isSmartHRLineHeight(val: number): boolean {
  return LINE_HEIGHT_TOKENS.some((t) => Math.abs(t.value - val) < 0.02);
}

function ensureSmarthrUiImports(code: string, names: string[]): string {
  if (names.length === 0) return code;
  const sorted = [...new Set(names)].sort();
  const existing = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]smarthr-ui['"]/);
  if (existing) {
    const merged = new Set(
      existing[1]!
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .concat(sorted)
    );
    return code.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"]smarthr-ui['"]/,
      `import { ${[...merged].join(", ")} } from 'smarthr-ui'`
    );
  }
  const line = `import { ${sorted.join(", ")} } from 'smarthr-ui';\n`;
  const firstImport = code.match(/^import\s.+$/m);
  if (firstImport) {
    return code.replace(/^import\s.+$/m, (m) => `${m}\n${line.trim()}`);
  }
  return line + code;
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

function replaceNonSmartHRHexColors(
  value: string,
  violations: Omit<Violation, "line">[]
): string {
  return value.replace(/#([0-9a-fA-F]{3,8})\b/g, (hex) => {
    if (isSmartHRColor(hex)) return hex;
    const { color: closest, distance } = findClosestColor(hex);
    const severity: RuleSeverity = distance < 30 ? "warning" : "error";
    violations.push({
      severity,
      original: hex,
      message: `"${hex}" はSmartHRカラーパレット外の色です`,
      suggestion: `${closest.name} (${closest.hex}) に置換しました [${closest.group}]`,
    });
    return closest.hex;
  });
}

function fixCssPropValue(propName: string, value: string): PropFixResult {
  const prop = propName.trim().toLowerCase();
  const violations: Omit<Violation, "line">[] = [];
  let fixed = value;

  // 値内の #hex はプロパティ種別に関わらず置換（--bg 等のカスタムプロパティも対象）
  fixed = replaceNonSmartHRHexColors(fixed, violations);

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

    // rem 値がスケール外 → 最寄りトークンに置換
    fixed = fixed.replace(/([\d.]+)rem\b/g, (_, num) => {
      const px = parseFloat(num) * 16;
      const near = closestFontSize(px);
      if (near) return `${num}rem`;
      const best = nearestFontScaleByPx(px);
      violations.push({
        severity: "error",
        original: `${num}rem`,
        message: `font-size: ${num}rem はSmartHRタイポグラフィスケール外です`,
        suggestion: `${best.rem} (SmartHR ${best.token}トークン) に変更しました`,
      });
      return best.rem;
    });
  }

  // ── line-height ──
  if (prop === "line-height") {
    const trimmed = value.trim();
    const unitless = /^-?[\d.]+$/.test(trimmed);
    const val = parseFloat(trimmed);
    if (!isNaN(val) && unitless && val !== 0 && !isSmartHRLineHeight(val)) {
      const best = closestLineHeight(val);
      violations.push({
        severity: "info",
        original: trimmed,
        message: `line-height: ${val} はSmartHR行送りルール外です`,
        suggestion: `${best.value} (${best.label}) に変更しました`,
      });
      fixed = String(best.value);
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

  // 4. 素の HTML 要素 → smarthr-ui コンポーネントへ置換
  const uiImports = new Set<string>();

  fixed = fixed.replace(/<button\b/g, (match, offset) => {
    uiImports.add("Button");
    violations.push({
      line: lineOf(fixed, offset),
      severity: "info",
      original: match,
      message: "<button> を SmartHR UI の Button に置換しました",
      suggestion: "import { Button } from 'smarthr-ui'",
    });
    return "<Button";
  });
  fixed = fixed.replace(/<\/button\s*>/g, "</Button>");

  fixed = fixed.replace(/<input\b([^>]*)\/?>/g, (match, attrs, offset) => {
    const isText =
      !/\btype\s*=/i.test(attrs) || /\btype\s*=\s*["']?text["']?/i.test(attrs);
    if (!isText) return match;
    uiImports.add("Input");
    const cleaned = attrs
      .replace(/\s*type\s*=\s*["']text["']/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    violations.push({
      line: lineOf(fixed, offset),
      severity: "info",
      original: match.substring(0, 50) + (match.length > 50 ? "…" : ""),
      message: '<input type="text"> を SmartHR UI の Input に置換しました',
      suggestion: "import { Input } from 'smarthr-ui'",
    });
    const space = cleaned ? ` ${cleaned}` : "";
    return match.endsWith("/>") ? `<Input${space} />` : `<Input${space}>`;
  });

  fixed = fixed.replace(/<select\b/g, (match, offset) => {
    uiImports.add("Select");
    violations.push({
      line: lineOf(fixed, offset),
      severity: "info",
      original: match,
      message: "<select> を SmartHR UI の Select に置換しました",
      suggestion: "import { Select } from 'smarthr-ui'",
    });
    return "<Select";
  });
  fixed = fixed.replace(/<\/select\s*>/g, "</Select>");

  fixed = fixed.replace(/<textarea\b/g, (match, offset) => {
    uiImports.add("Textarea");
    violations.push({
      line: lineOf(fixed, offset),
      severity: "info",
      original: match,
      message: "<textarea> を SmartHR UI の Textarea に置換しました",
      suggestion: "import { Textarea } from 'smarthr-ui'",
    });
    return "<Textarea";
  });
  fixed = fixed.replace(/<\/textarea\s*>/g, "</Textarea>");

  if (uiImports.size > 0) {
    fixed = ensureSmarthrUiImports(fixed, [...uiImports]);
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
