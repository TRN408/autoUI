# autoUI — アプリケーション

Next.js で動作する autoUI のフロントエンドです。  
リポジトリ全体の説明は [ルート README](../README.md) を参照してください。

## セットアップ

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run lint` | ESLint |

## 主要ファイル

| パス | 役割 |
|------|------|
| `app/page.tsx` | UI修正・ロゴ生成のメイン画面 |
| `lib/smarthr-rules.ts` | SmartHR 基準の監査・自動修正エンジン |
| `lib/theme-overlay.ts` | アップロードサイト向け配色プレビュー |
| `lib/color-schemes.ts` | SmartHR 12 配色 |
| `lib/pinterest-schemes.ts` | Pinterest 配色 |
| `app/api/project/upload/` | フォルダ一時アップロード API |
| `app/__project/` | アップロードファイルのプレビュー配信 |

## 開発指針

[`AGENTS.md`](./AGENTS.md) にプロダクトの目的と実装判断の指針を記載しています。
