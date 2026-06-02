"use client";

import { useState } from "react";
import { SMARTHR_12_SCHEMES } from "@/lib/color-schemes";
import { PINTEREST_SCHEMES } from "@/lib/pinterest-schemes";

type SchemeSource = "smarthr" | "pinterest";

function SchemeCard({
  scheme,
  active,
  onClick,
}: {
  scheme: { name: string; primary: string; text: string; bg: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${scheme.name} — 背景 ${scheme.bg} / アクセント ${scheme.primary} / 文字 ${scheme.text}`}
      className={`relative rounded overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0 ${
        active ? "border-[var(--ui-accent)] shadow-md scale-105" : "border-[var(--ui-border)]"
      }`}
      style={{ width: 72, height: 44 }}
    >
      <span className="absolute inset-0" style={{ backgroundColor: scheme.bg }} />
      <span
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
        style={{ backgroundColor: scheme.primary, color: scheme.bg }}
      >
        {[...scheme.name].find((c) => /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u.test(c)) ??
          scheme.name[0]}
      </span>
      <span
        className="absolute left-8 right-0.5 top-1/2 -translate-y-1/2 text-[7px] font-semibold leading-tight text-left truncate"
        style={{ color: scheme.text }}
      >
        {scheme.name}
      </span>
      {active && (
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-[var(--ui-accent)] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 8 8" className="w-2 h-2" aria-hidden>
            <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

export function ProjectColorSchemePicker({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (schemeId: string | null) => void;
  disabled?: boolean;
}) {
  const [source, setSource] = useState<SchemeSource>("smarthr");
  const schemes = source === "smarthr" ? SMARTHR_12_SCHEMES : PINTEREST_SCHEMES;

  return (
    <div className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div>
          <span className="text-xs font-semibold text-[var(--ui-text)]">配色候補（アップロードサイトに適用）</span>
          <p className="text-[10px] text-[var(--ui-muted)] mt-0.5">
            クリックで After プレビューに反映。Before はアップロード時のまま表示します。
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || !value}
          onClick={() => onChange(null)}
          className="px-2 py-1 border border-[var(--ui-border)] rounded text-[10px] text-[var(--ui-muted)] hover:bg-[var(--ui-border-soft)] disabled:opacity-40"
        >
          元の配色
        </button>
      </div>

      <div className="flex items-center gap-0 mb-2 border border-[var(--ui-border)] rounded overflow-hidden w-fit">
        {(["smarthr", "pinterest"] as SchemeSource[]).map((src) => (
          <button
            key={src}
            type="button"
            disabled={disabled}
            onClick={() => setSource(src)}
            className={`px-3 py-1 text-[11px] font-medium transition-colors disabled:opacity-40 ${
              source === src
                ? "bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)]"
                : "bg-[var(--ui-surface)] text-[var(--ui-muted)] hover:bg-[var(--ui-border-soft)]"
            }`}
          >
            {src === "smarthr" ? "SmartHR (12)" : `Pinterest (${PINTEREST_SCHEMES.length})`}
          </button>
        ))}
      </div>

      <div
        className={`overflow-y-auto rounded border border-[var(--ui-border-soft)] bg-[var(--ui-border-soft)]/40 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
        style={{ maxHeight: 168 }}
      >
        <div className="flex flex-wrap gap-1.5 p-2">
          {schemes.map((scheme) => {
            const id = `${source}:${scheme.name}`;
            return (
              <SchemeCard
                key={id}
                scheme={scheme}
                active={value === id}
                onClick={() => onChange(id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
