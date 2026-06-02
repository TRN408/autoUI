# autoUI — プロダクトの目的（必ず守る）

このアプリの存在理由は次のとおりです。**実装・UI・文言の判断はすべてこの目的に従うこと。**

> **見栄えの悪いサイトやアプリができてしまったときに、SmartHR など一定の基準に則って、最低限の UI に仕上げること。**

## 何を目指すか

- 完璧なデザインやブランド再現ではなく、**「最低限ちゃんと見える・使える」UI への底上げ**
- 基準は主に **SmartHR Design System**（色・タイポ・コンポーネント・行送りなど）
- ユーザーがアップロードした **既存のサイト／アプリ／コード** を対象にする（autoUI ツール自体の見た目の実験場ではない）

## 機能判断の指針

| 優先 | 内容 |
|------|------|
| 高 | Before＝**アップロード時のまま**、After＝**基準適用後**の比較ができること |
| 高 | 違反の検出だけでなく、**可能な限りコード・プレビューに修正を反映**すること |
| 高 | フォルダ単位で **サイト全体** をプレビュー・修正・書き出しできること |
| 中 | 配色候補は **アップロード先のプレビュー** に適用（ツール UI のテーマ化ではない） |
| 低 | autoUI 画面自体の装飾や、基準と無関係な機能追加 |

## 関連コード

- ルールエンジン: `lib/smarthr-rules.ts`
- 配色オーバーレイ（プレビュー用）: `lib/theme-overlay.ts`
- UI 修正メイン画面: `app/page.tsx`（`UIFixPanel`）

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
