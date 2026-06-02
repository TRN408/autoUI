"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { SMARTHR_PALETTE, PALETTE_GROUPS, SmartHRColor } from "@/lib/smarthr-palette";
import { PINTEREST_SCHEMES } from "@/lib/pinterest-schemes";
import { SMARTHR_12_SCHEMES, ColorScheme } from "@/lib/color-schemes";

// ── ロゴスタイル ──────────────────────────────────
type LogoLayout   = "icon-text-h" | "icon-text-v" | "icon-only" | "text-only";
type IconShape    = "circle" | "rounded" | "square" | "hexagon" | "diamond";
type IconContent  = "initials" | "symbol-star" | "symbol-check" | "symbol-bolt" | "symbol-leaf";

interface LogoConfig {
  companyName:  string;
  tagline:      string;
  layout:       LogoLayout;
  iconShape:    IconShape;
  iconContent:  IconContent;
  primaryColor: string;
  textColor:    string;
  bgColor:      string;
  fontSize:     number;
}

const DEFAULT: LogoConfig = {
  companyName:  "Company",
  tagline:      "",
  layout:       "icon-text-h",
  iconShape:    "rounded",
  iconContent:  "initials",
  primaryColor: "#00c4cc",
  textColor:    "#23221f",
  bgColor:      "#ffffff",
  fontSize:     32,
};

// ── カラースキームプリセット ──────────────────────────
// SmartHR 12パターンは `lib/color-schemes.ts` に集約

const LAYOUTS: { value: LogoLayout; label: string }[] = [
  { value: "icon-text-h", label: "横並び" },
  { value: "icon-text-v", label: "縦並び" },
  { value: "icon-only",   label: "アイコンのみ" },
  { value: "text-only",   label: "テキストのみ" },
];

const ICON_SHAPES: { value: IconShape; label: string }[] = [
  { value: "circle",   label: "円" },
  { value: "rounded",  label: "角丸" },
  { value: "square",   label: "四角" },
  { value: "hexagon",  label: "六角形" },
  { value: "diamond",  label: "ダイヤ" },
];

const ICON_CONTENTS: { value: IconContent; label: string }[] = [
  { value: "initials",      label: "イニシャル" },
  { value: "symbol-star",   label: "★" },
  { value: "symbol-check",  label: "✓" },
  { value: "symbol-bolt",   label: "⚡" },
  { value: "symbol-leaf",   label: "♠" },
];

// ── Canvas 描画 ──────────────────────────────────

function getInitials(name: string): string {
  return name.split(/[\s\-_]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function drawIconShape(
  ctx: CanvasRenderingContext2D, shape: IconShape,
  cx: number, cy: number, size: number, color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  switch (shape) {
    case "circle":
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      break;
    case "rounded": {
      const r = size * 0.22, x = cx - size / 2, y = cy - size / 2;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + size - r, y);   ctx.quadraticCurveTo(x + size, y, x + size, y + r);
      ctx.lineTo(x + size, y + size - r); ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
      ctx.lineTo(x + r, y + size);   ctx.quadraticCurveTo(x, y + size, x, y + size - r);
      ctx.lineTo(x, y + r);          ctx.quadraticCurveTo(x, y, x + r, y);
      break;
    }
    case "square":
      ctx.rect(cx - size / 2, cy - size / 2, size, size);
      break;
    case "hexagon":
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + (size/2)*Math.cos(a), cy + (size/2)*Math.sin(a))
                : ctx.lineTo(cx + (size/2)*Math.cos(a), cy + (size/2)*Math.sin(a));
      }
      ctx.closePath();
      break;
    case "diamond": {
      const h = size / 2;
      ctx.moveTo(cx, cy - h); ctx.lineTo(cx + h * 0.75, cy);
      ctx.lineTo(cx, cy + h); ctx.lineTo(cx - h * 0.75, cy);
      ctx.closePath();
      break;
    }
  }
  ctx.fill();
}

function drawIconContent(
  ctx: CanvasRenderingContext2D, content: IconContent,
  name: string, cx: number, cy: number, size: number, color: string
) {
  ctx.fillStyle = color; ctx.strokeStyle = color;
  if (content === "initials") {
    const initials = getInitials(name) || "A";
    ctx.font = `700 ${size * (initials.length > 1 ? 0.38 : 0.46)}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(initials, cx, cy + 1);
  } else {
    const s = size * 0.42;
    ctx.lineWidth = size * 0.06; ctx.lineCap = "round"; ctx.lineJoin = "round";
    switch (content) {
      case "symbol-star": {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const oa = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const ia = oa + Math.PI / 5;
          i === 0 ? ctx.moveTo(cx + s*Math.cos(oa), cy + s*Math.sin(oa)) : ctx.lineTo(cx + s*Math.cos(oa), cy + s*Math.sin(oa));
          ctx.lineTo(cx + s*0.38*Math.cos(ia), cy + s*0.38*Math.sin(ia));
        }
        ctx.closePath(); ctx.fill(); break;
      }
      case "symbol-check":
        ctx.beginPath();
        ctx.moveTo(cx - s*0.55, cy); ctx.lineTo(cx - s*0.1, cy + s*0.5); ctx.lineTo(cx + s*0.65, cy - s*0.5);
        ctx.stroke(); break;
      case "symbol-bolt":
        ctx.beginPath();
        ctx.moveTo(cx + s*0.15, cy - s); ctx.lineTo(cx - s*0.35, cy + s*0.1);
        ctx.lineTo(cx + s*0.1, cy + s*0.1); ctx.lineTo(cx - s*0.15, cy + s);
        ctx.lineTo(cx + s*0.45, cy - s*0.1); ctx.lineTo(cx, cy - s*0.1);
        ctx.closePath(); ctx.fill(); break;
      case "symbol-leaf":
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.bezierCurveTo(cx + s, cy - s, cx + s, cy + s*0.4, cx, cy + s*0.6);
        ctx.bezierCurveTo(cx - s, cy + s*0.4, cx - s, cy - s, cx, cy - s);
        ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s); ctx.stroke();
        break;
    }
  }
}

function drawLogo(canvas: HTMLCanvasElement, cfg: LogoConfig) {
  const dpr = window.devicePixelRatio || 1;
  const W = 600, H = 260;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = cfg.bgColor;
  ctx.fillRect(0, 0, W, H);

  const iconSize = 80;

  if (cfg.layout === "icon-only") {
    drawIconShape(ctx, cfg.iconShape, W/2, H/2, iconSize, cfg.primaryColor);
    drawIconContent(ctx, cfg.iconContent, cfg.companyName, W/2, H/2, iconSize, cfg.bgColor);

  } else if (cfg.layout === "text-only") {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `700 ${cfg.fontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = cfg.primaryColor;
    const baseY = cfg.tagline ? H/2 - cfg.fontSize*0.4 : H/2;
    ctx.fillText(cfg.companyName, W/2, baseY);
    if (cfg.tagline) {
      const ts = Math.max(14, cfg.fontSize * 0.42);
      ctx.font = `400 ${ts}px -apple-system, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = cfg.textColor; ctx.globalAlpha = 0.7;
      ctx.fillText(cfg.tagline, W/2, baseY + cfg.fontSize * 0.85);
      ctx.globalAlpha = 1;
    }

  } else if (cfg.layout === "icon-text-h") {
    ctx.font = `700 ${cfg.fontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    const tw = ctx.measureText(cfg.companyName).width;
    const totalW = iconSize + 20 + tw;
    const sx = (W - totalW) / 2;
    const cy = H / 2;
    drawIconShape(ctx, cfg.iconShape, sx + iconSize/2, cy, iconSize, cfg.primaryColor);
    drawIconContent(ctx, cfg.iconContent, cfg.companyName, sx + iconSize/2, cy, iconSize, cfg.bgColor);
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = cfg.textColor;
    const baseY = cfg.tagline ? cy - cfg.fontSize*0.35 : cy;
    ctx.fillText(cfg.companyName, sx + iconSize + 20, baseY);
    if (cfg.tagline) {
      const ts = Math.max(12, cfg.fontSize * 0.4);
      ctx.font = `400 ${ts}px -apple-system, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = cfg.textColor; ctx.globalAlpha = 0.6;
      ctx.fillText(cfg.tagline, sx + iconSize + 20, baseY + cfg.fontSize * 0.9);
      ctx.globalAlpha = 1;
    }

  } else { // icon-text-v
    const totalH = iconSize + 16 + cfg.fontSize + (cfg.tagline ? cfg.fontSize*0.55 : 0);
    const sy = (H - totalH) / 2;
    drawIconShape(ctx, cfg.iconShape, W/2, sy + iconSize/2, iconSize, cfg.primaryColor);
    drawIconContent(ctx, cfg.iconContent, cfg.companyName, W/2, sy + iconSize/2, iconSize, cfg.bgColor);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `700 ${cfg.fontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = cfg.textColor;
    const ty = sy + iconSize + 16 + cfg.fontSize / 2;
    ctx.fillText(cfg.companyName, W/2, ty);
    if (cfg.tagline) {
      const ts = Math.max(12, cfg.fontSize * 0.4);
      ctx.font = `400 ${ts}px -apple-system, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = cfg.textColor; ctx.globalAlpha = 0.6;
      ctx.fillText(cfg.tagline, W/2, ty + cfg.fontSize * 0.85);
      ctx.globalAlpha = 1;
    }
  }
}

// ── スキームセレクター ────────────────────────────

type SchemeSource = "smarthr" | "pinterest";

function SchemeCard({
  scheme, active, onClick,
}: {
  scheme: { name: string; primary: string; text: string; bg: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={`${scheme.name}  bg:${scheme.bg} / icon:${scheme.primary} / text:${scheme.text}`}
      className={`relative rounded overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0 ${
        active ? "border-[#0077c7] shadow-md scale-105" : "border-[#d6d3d0]"
      }`}
      style={{ width: 72, height: 44 }}
    >
      <span className="absolute inset-0" style={{ backgroundColor: scheme.bg }} />
      <span
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold flex-shrink-0"
        style={{ backgroundColor: scheme.primary, color: scheme.bg }}
      >
        {[...scheme.name].find(c => /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u.test(c)) ?? scheme.name[0]}
      </span>
      <span
        className="absolute left-8 right-0.5 top-1/2 -translate-y-1/2 text-[7px] font-semibold leading-tight text-left truncate"
        style={{ color: scheme.text }}
      >
        {scheme.name}
      </span>
      {active && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-[#0077c7] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 8 8" className="w-2 h-2">
            <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </span>
      )}
    </button>
  );
}

function SchemeSelector({
  cfg, update,
}: {
  cfg: LogoConfig;
  update: (p: Partial<LogoConfig>) => void;
}) {
  const [source, setSource] = useState<SchemeSource>("smarthr");

  const schemes = source === "smarthr" ? SMARTHR_12_SCHEMES : PINTEREST_SCHEMES;

  const isActive = (s: { primary: string; text: string; bg: string }) =>
    cfg.primaryColor === s.primary && cfg.textColor === s.text && cfg.bgColor === s.bg;

  return (
    <div className="mb-4">
      {/* タブ */}
      <div className="flex items-center gap-0 mb-2 border border-[#d6d3d0] rounded overflow-hidden w-fit">
        {(["smarthr", "pinterest"] as SchemeSource[]).map((src) => (
          <button
            key={src}
            onClick={() => setSource(src)}
            className={`px-3 py-1 text-[11px] font-medium transition-colors ${
              source === src
                ? "bg-[#0077c7] text-white"
                : "bg-white text-[#706d65] hover:bg-[#f2f1f0]"
            }`}
          >
            {src === "smarthr" ? "SmartHR (12)" : `Pinterest (${PINTEREST_SCHEMES.length})`}
          </button>
        ))}
      </div>

      {/* スクロールエリア */}
      <div className="overflow-y-auto rounded border border-[#f2f1f0] bg-[#fafafa]" style={{ maxHeight: 168 }}>
        <div className="flex flex-wrap gap-1.5 p-2">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.name}
              scheme={scheme}
              active={isActive(scheme)}
              onClick={() => update({ primaryColor: scheme.primary, textColor: scheme.text, bgColor: scheme.bg })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── カラーピッカー（グループ別） ──────────────────

function ColorPicker({
  value, onChange, label,
}: {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  const byGroup: Record<string, SmartHRColor[]> = {};
  for (const g of PALETTE_GROUPS) {
    byGroup[g] = SMARTHR_PALETTE.filter((c) => c.group === g);
  }

  return (
    <div>
      <label className="text-xs text-[#706d65] mb-1.5 block">{label}</label>
      <div className="relative">
        {/* 現在の色 + トグル */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 border border-[#d6d3d0] rounded px-2.5 py-1.5 bg-white hover:border-[#0077c7] transition-colors w-full"
        >
          <span className="w-5 h-5 rounded border border-[#d6d3d0] flex-shrink-0" style={{ backgroundColor: value }} />
          <span className="text-xs font-mono text-[#706d65] flex-1 text-left">{value}</span>
          <span className="text-[#c1bdb7] text-xs">{open ? "▲" : "▼"}</span>
        </button>

        {/* ドロップダウン */}
        {open && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#d6d3d0] rounded shadow-lg p-3 max-h-72 overflow-y-auto">
            {PALETTE_GROUPS.map((group) => (
              <div key={group} className="mb-2">
                <p className="text-[10px] text-[#c1bdb7] font-medium uppercase mb-1">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {byGroup[group].map((c) => (
                    <button
                      key={c.hex}
                      title={`${c.name} ${c.hex}${c.textRecommended ? " (テキスト推奨)" : ""}`}
                      onClick={() => { onChange(c.hex); setOpen(false); }}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                        value === c.hex
                          ? "border-[#0077c7] scale-110 shadow-md"
                          : "border-[#d6d3d0]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
            {/* カスタム */}
            <div className="mt-2 pt-2 border-t border-[#f2f1f0]">
              <p className="text-[10px] text-[#c1bdb7] font-medium uppercase mb-1">カスタム</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="w-6 h-6 rounded border-2 border-dashed border-[#d6d3d0] flex items-center justify-center text-[10px] text-[#c1bdb7]">+</span>
                <span className="text-xs text-[#706d65]">カラーピッカーで選択</span>
                <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="sr-only" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────

export default function LogoGenerator() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const darkCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cfg, setCfg] = useState<LogoConfig>(DEFAULT);

  const update = useCallback((partial: Partial<LogoConfig>) => {
    setCfg((prev) => ({ ...prev, ...partial }));
  }, []);

  useEffect(() => {
    if (canvasRef.current) drawLogo(canvasRef.current, cfg);
    if (darkCanvasRef.current) drawLogo(darkCanvasRef.current, { ...cfg, bgColor: "#23221f", textColor: "#ffffff" });
  }, [cfg]);

  function downloadPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${cfg.companyName.replace(/\s+/g, "-").toLowerCase()}-logo.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="flex gap-6 h-full">
      {/* 設定パネル */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-1 pb-4">

        {/* テキスト */}
        <section className="bg-white rounded border border-[#d6d3d0] p-4">
          <h3 className="text-xs font-semibold text-[#706d65] uppercase tracking-wide mb-3">テキスト</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-[#706d65] mb-1 block">会社名 / ブランド名</label>
              <input
                type="text" value={cfg.companyName}
                onChange={(e) => update({ companyName: e.target.value || "A" })}
                className="w-full border border-[#d6d3d0] rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077c7]"
                placeholder="Company" maxLength={20}
              />
            </div>
            <div>
              <label className="text-xs text-[#706d65] mb-1 block">タグライン（任意）</label>
              <input
                type="text" value={cfg.tagline}
                onChange={(e) => update({ tagline: e.target.value })}
                className="w-full border border-[#d6d3d0] rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0077c7]"
                placeholder="Your tagline here" maxLength={30}
              />
            </div>
            <div>
              <label className="text-xs text-[#706d65] mb-1 block">フォントサイズ: {cfg.fontSize}px</label>
              <input
                type="range" min={20} max={52} step={2} value={cfg.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                className="w-full accent-[#0077c7]"
              />
            </div>
          </div>
        </section>

        {/* レイアウト */}
        <section className="bg-white rounded border border-[#d6d3d0] p-4">
          <h3 className="text-xs font-semibold text-[#706d65] uppercase tracking-wide mb-3">レイアウト</h3>
          <div className="grid grid-cols-2 gap-2">
            {LAYOUTS.map((l) => (
              <button key={l.value} onClick={() => update({ layout: l.value })}
                className={`py-2 rounded text-xs font-medium border transition-colors ${
                  cfg.layout === l.value
                    ? "bg-[#0077c7] text-white border-[#0077c7]"
                    : "bg-white text-[#706d65] border-[#d6d3d0] hover:border-[#0077c7] hover:text-[#0077c7]"
                }`}
              >{l.label}</button>
            ))}
          </div>
        </section>

        {/* アイコン */}
        {cfg.layout !== "text-only" && (
          <section className="bg-white rounded border border-[#d6d3d0] p-4">
            <h3 className="text-xs font-semibold text-[#706d65] uppercase tracking-wide mb-3">アイコン</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#706d65] mb-1.5 block">形状</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ICON_SHAPES.map((s) => (
                    <button key={s.value} onClick={() => update({ iconShape: s.value })}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        cfg.iconShape === s.value
                          ? "bg-[#0077c7] text-white border-[#0077c7]"
                          : "bg-white text-[#706d65] border-[#d6d3d0] hover:border-[#0077c7]"
                      }`}
                    >{s.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[#706d65] mb-1.5 block">内容</label>
                <div className="flex gap-1.5 flex-wrap">
                  {ICON_CONTENTS.map((c) => (
                    <button key={c.value} onClick={() => update({ iconContent: c.value })}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        cfg.iconContent === c.value
                          ? "bg-[#0077c7] text-white border-[#0077c7]"
                          : "bg-white text-[#706d65] border-[#d6d3d0] hover:border-[#0077c7]"
                      }`}
                    >{c.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* カラー */}
        <section className="bg-white rounded border border-[#d6d3d0] p-4">
          <h3 className="text-xs font-semibold text-[#706d65] uppercase tracking-wide mb-3">
            カラー
            <span className="ml-1 text-[#c1bdb7] font-normal normal-case">（SmartHRColor.clr 46色）</span>
          </h3>

          {/* スキームプリセット */}
          <SchemeSelector cfg={cfg} update={update} />

          {/* 区切り */}
          <div className="border-t border-[#f2f1f0] mb-3" />

          {/* 個別ピッカー */}
          <div className="flex flex-col gap-3">
            <ColorPicker value={cfg.primaryColor} onChange={(hex) => update({ primaryColor: hex })} label="メイン色（アイコン背景）" />
            <ColorPicker value={cfg.textColor}    onChange={(hex) => update({ textColor: hex })}    label="テキスト色" />
            <ColorPicker value={cfg.bgColor}      onChange={(hex) => update({ bgColor: hex })}      label="背景色" />
          </div>
        </section>
      </div>

      {/* プレビュー + ダウンロード */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* プレビュー */}
        <div className="flex-1 bg-white rounded border border-[#d6d3d0] overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-[#d6d3d0] bg-[#edebe8] flex items-center justify-between">
            <span className="text-xs font-medium text-[#706d65]">プレビュー</span>
            <span className="text-[10px] text-[#c1bdb7]">600 × 260 px</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-8"
            style={{ backgroundImage: "radial-gradient(#d6d3d0 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
            <div className="shadow-lg rounded overflow-hidden">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>

        {/* ダーク */}
        <div className="bg-white rounded border border-[#d6d3d0] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#d6d3d0] bg-[#edebe8]">
            <span className="text-xs font-medium text-[#706d65]">ダーク背景での見え方</span>
          </div>
          <div className="p-6 flex justify-center" style={{ backgroundColor: "#23221f" }}>
            <canvas ref={darkCanvasRef} style={{ width: 300, height: 130 }} />
          </div>
        </div>

        {/* ダウンロード */}
        <div className="bg-white rounded border border-[#d6d3d0] p-4 flex items-center gap-3">
          <span className="text-sm text-[#706d65] flex-1">ロゴをダウンロード</span>
          <button onClick={downloadPNG}
            className="px-4 py-2 bg-[#0077c7] text-white rounded text-sm font-medium hover:bg-[#005fa3] transition-colors">
            PNG でダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}
