import { SMARTHR_12_SCHEMES, ColorScheme } from "./color-schemes";
import { PINTEREST_SCHEMES } from "./pinterest-schemes";

/** `smarthr:SmartHR` / `pinterest:白浜のアクア` 形式 */
export function resolveColorScheme(schemeId: string): ColorScheme | undefined {
  const idx = schemeId.indexOf(":");
  if (idx < 0) return undefined;
  const src = schemeId.slice(0, idx);
  const name = schemeId.slice(idx + 1);
  if (src === "smarthr") return SMARTHR_12_SCHEMES.find((s) => s.name === name);
  if (src === "pinterest") return PINTEREST_SCHEMES.find((s) => s.name === name);
  return undefined;
}

/** アップロードサイト／プレビュー iframe に重ねる配色オーバーレイ */
export function buildThemeOverlayCss(scheme: ColorScheme): string {
  const { bg, primary, text } = scheme;
  return `
/* [autoUI] 配色プレビュー: ${scheme.name} */
:root {
  --bg: ${bg} !important;
  --background: ${bg} !important;
  --surface: ${bg} !important;
  --panel: ${bg} !important;
  --card-bg: ${bg} !important;
  --primary: ${primary} !important;
  --brand: ${primary} !important;
  --accent: ${primary} !important;
  --link: ${primary} !important;
  --text: ${text} !important;
  --foreground: ${text} !important;
  --color-text: ${text} !important;
  --body-color: ${text} !important;
  --on-primary: ${bg} !important;
}
html, body {
  background-color: ${bg} !important;
  color: ${text} !important;
}
main, #root, #app, .app, [role="main"] {
  background-color: ${bg};
  color: ${text};
}
a, .link {
  color: ${primary} !important;
}
button,
[type="button"],
[type="submit"],
[type="reset"],
.btn,
[class*="button"],
[class*="Button"] {
  background-color: ${primary} !important;
  border-color: ${primary} !important;
  color: ${bg} !important;
}
input, textarea, select, .input {
  background-color: ${bg} !important;
  color: ${text} !important;
  border-color: color-mix(in srgb, ${text} 25%, ${bg}) !important;
}
header, nav, .header, .navbar, [class*="header"], [class*="Header"] {
  background-color: color-mix(in srgb, ${primary} 12%, ${bg}) !important;
  color: ${text} !important;
}
.card, [class*="card"], [class*="Card"], .panel, [class*="Panel"] {
  background-color: color-mix(in srgb, ${text} 4%, ${bg}) !important;
  color: ${text} !important;
  border-color: color-mix(in srgb, ${text} 18%, ${bg}) !important;
}
`.trim();
}

export function injectThemeIntoHtml(html: string, schemeId: string): string {
  const scheme = resolveColorScheme(schemeId);
  if (!scheme) return html;
  const css = buildThemeOverlayCss(scheme).replace(/<\/style/gi, "<\\/style");
  const tag = `<style id="__autoui_theme" data-autoui-scheme="${schemeId}">\n${css}\n</style>`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${tag}\n</head>`);
  if (/<head(\s[^>]*)?>/i.test(html)) return html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n${tag}`);
  return `${tag}\n${html}`;
}

export function appendThemeQuery(url: string, schemeId: string | null | undefined): string {
  if (!url || !schemeId) return url;
  const u = new URL(url, "http://local");
  u.searchParams.set("autoui_theme", schemeId);
  return `${u.pathname}${u.search}`;
}
