"use client";

import { useState, useEffect } from "react";
import { analyzeAndFix, detectLanguage, Violation, Language } from "@/lib/smarthr-rules";
import LogoGenerator from "@/components/LogoGenerator";
import { SMARTHR_12_SCHEMES, ColorScheme } from "@/lib/color-schemes";
import { PINTEREST_SCHEMES } from "@/lib/pinterest-schemes";

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

const SEVERITY_STYLE: Record<string, { border: string; bg: string; badge: string; label: string }> = {
  error:   { border: "#e01e5a", bg: "#fff0f3", badge: "#e01e5a", label: "エラー" },
  warning: { border: "#f56121", bg: "#fff8f0", badge: "#f56121", label: "警告" },
  info:    { border: "#0077c7", bg: "#f0f7ff", badge: "#0077c7", label: "情報" },
};

function UIFixPanel() {
  const [input, setInput]               = useState("");
  const [output, setOutput]             = useState("");
  const [violations, setViolations]     = useState<Violation[]>([]);
  const [detectedLang, setDetectedLang] = useState<Language>("html");
  const [overrideLang, setOverrideLang] = useState<Language | "">("");
  const [activeTab, setActiveTab]       = useState<"code" | "violations">("code");
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (input.trim()) setDetectedLang(detectLanguage(input));
  }, [input]);

  function handleFix() {
    if (!input.trim()) return;
    const result = analyzeAndFix(input, overrideLang || undefined);
    setOutput(result.code);
    setViolations(result.violations);
    setDetectedLang(result.detectedLanguage);
    setActiveTab("code");
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
  const langLabel    = LANGUAGES.find((l) => l.value === effectiveLang)?.label ?? effectiveLang;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--ui-muted)]">検出言語</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] text-xs font-medium">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {langLabel}
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
        <button
          onClick={handleFix}
          disabled={!input.trim()}
          className="ml-auto px-5 py-2 bg-[var(--ui-accent)] text-[var(--ui-accent-contrast)] rounded text-sm font-medium hover:bg-[var(--ui-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          SmartHR基準に修正
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input */}
        <div className="flex flex-col bg-[var(--ui-surface)] rounded border border-[var(--ui-border)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--ui-muted)]">入力コード</span>
            {input && <span className="text-[10px] text-[#c1bdb7]">{input.split("\n").length} 行</span>}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="コードを貼り付けると言語を自動検出して修正します"
            className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none text-[var(--ui-text)] placeholder-[#c1bdb7] leading-relaxed bg-transparent"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col bg-[var(--ui-surface)] rounded border border-[var(--ui-border)] overflow-hidden">
          <div className="border-b border-[var(--ui-border)] bg-[var(--ui-surface-2)] flex items-center">
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
          </div>
          <div className="flex-1 overflow-auto">
            {activeTab === "code" ? (
              output ? (
                <pre className="p-4 font-mono text-sm whitespace-pre-wrap text-[var(--ui-text)] leading-relaxed">{output}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-[#c1bdb7]">
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
                      {violations.map((v, i) => {
                        const s = SEVERITY_STYLE[v.severity];
                        return (
                          <div key={i} className="rounded border p-3 text-xs" style={{ borderColor: s.border, backgroundColor: s.bg }}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: s.badge }}>{s.label}</span>
                              <span className="text-[var(--ui-muted)]">行 {v.line}</span>
                            </div>
                            <p className="font-medium text-[var(--ui-text)] mb-1">{v.message}</p>
                            {v.original && <code className="block text-[var(--ui-muted)] bg-white/70 px-2 py-0.5 rounded font-mono mb-1 break-all">{v.original}</code>}
                            {v.suggestion && <p className="text-[var(--ui-accent)]">→ {v.suggestion}</p>}
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
    </div>
  );
}

// ── メインページ ──────────────────────────────────

export default function Home() {
  const [appTab, setAppTab] = useState<AppTab>("ui-fix");
  const [uiSchemeId, setUiSchemeId] = useState<string>("smarthr:SmartHR");

  const uiScheme: ColorScheme | undefined = (() => {
    const [src, name] = uiSchemeId.split(":", 2);
    if (src === "smarthr") return SMARTHR_12_SCHEMES.find((s) => s.name === name);
    if (src === "pinterest") return PINTEREST_SCHEMES.find((s) => s.name === name);
    return undefined;
  })();

  const uiVars = uiScheme
    ? ({
        ["--ui-bg" as any]: uiScheme.bg,
        ["--ui-text" as any]: uiScheme.text,
        ["--ui-accent" as any]: uiScheme.primary,
        ["--ui-accent-hover" as any]: uiScheme.primary,
        ["--ui-accent-contrast" as any]: uiScheme.bg,
      } as React.CSSProperties)
    : undefined;

  return (
    <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)] flex flex-col" style={uiVars}>
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

          {/* 配色セレクタ */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[var(--ui-muted)]">配色</span>
            <select
              value={uiSchemeId}
              onChange={(e) => setUiSchemeId(e.target.value)}
              className="border border-[var(--ui-border)] rounded px-2.5 py-1 text-xs bg-[var(--ui-surface)] text-[var(--ui-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-accent)]"
            >
              <optgroup label="SmartHR (12)">
                {SMARTHR_12_SCHEMES.map((s) => (
                  <option key={`smarthr:${s.name}`} value={`smarthr:${s.name}`}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={`Pinterest (${PINTEREST_SCHEMES.length})`}>
                {PINTEREST_SCHEMES.map((s) => (
                  <option key={`pinterest:${s.name}`} value={`pinterest:${s.name}`}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
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
