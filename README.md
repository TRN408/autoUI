# autoUI

見栄えの悪いサイトやアプリを、**SmartHR Design System** など一定の基準に沿って **最低限ちゃんと使える UI** に仕上げる Web ツールです。

> 完璧なデザイン再現ではなく、**底上げ** が目的です。  
> アップロードした既存プロジェクトを対象に、監査・自動修正・Before/After プレビュー・書き出しを行います。

**リポジトリ:** [github.com/TRN408/autoUI](https://github.com/TRN408/autoUI)

---

## 主な機能

### UI修正

| 機能 | 説明 |
|------|------|
| **コード監査** | HTML / CSS / JSX / TSX を SmartHR 基準でチェック（色・フォントサイズ・行送り・Tailwind 色など） |
| **自動修正** | エラー・警告・情報レベルの違反を可能な限りコードに反映 |
| **Before / After プレビュー** | Before＝アップロード時のまま、After＝修正後（＋配色プレビュー） |
| **フォルダ読み込み** | D&D またはフォルダ選択でサイト全体をアップロード・監査 |
| **配色候補** | SmartHR 12 色 / Pinterest パレットを **アップロード先の After プレビュー** に適用 |
| **保存候補 → ZIP** | 違反なしファイルは自動で候補に。修正ファイルを追加して一括ダウンロード（元ファイルは上書きしない） |

### ロゴ生成

SmartHR / Pinterest の配色を使ったロゴ案の生成。

---

## クイックスタート

```bash
cd app-ui
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

本番ビルド:

```bash
npm run build
npm run start
```

---

## 使い方（UI修正）

1. **フォルダ** を D&D または「選択」で読み込む  
2. 自動監査が走り、ファイル一覧に ○ / △ / — / 修 が表示される  
3. **SmartHR基準に修正** で現在ファイルを修正  
4. 違反ファイルは **修正を候補に追加** → 一覧の △ が **修**（グレーアウト）に変わる  
5. **配色候補** をクリックすると After プレビューに反映（Before は変わらない）  
6. **まとめてダウンロード** で `autoUI-fixed-日時.zip` を取得  

### 保存候補のルール

- **違反なし（○）** … 監査完了後、自動で保存候補に入る（アップロード時の内容）
- **違反あり（△）** … 修正後に候補へ追加。追加済みは **修** マーク表示
- **ZIP 内容** … 候補のテキスト ＋ 画像など未修正ファイル。ローカルの元フォルダは変更しない

---

## 技術スタック

- [Next.js 16](https://nextjs.org/)（App Router）
- React 19 / TypeScript
- Tailwind CSS 4
- ルールエンジン: `app-ui/lib/smarthr-rules.ts`

---

## プロジェクト構成

```
autoUI/
├── README.md          … このファイル
└── app-ui/            … Next.js アプリ本体
    ├── app/           … ページ・API ルート
    ├── components/    … UI コンポーネント
    ├── lib/           … SmartHR ルール・配色・テーマ
    ├── icon/          … SmartHR アイコン素材
    └── AGENTS.md      … 開発者向けプロダクト指針
```

---

## ブランチ

| ブランチ | 内容 |
|----------|------|
| `UI-main` | UI 修正機能のメイン開発ブランチ |
| `main` | 初期リリースベース |

---

## 開発

詳細は [`app-ui/README.md`](./app-ui/README.md) および [`app-ui/AGENTS.md`](./app-ui/AGENTS.md) を参照してください。

```bash
cd app-ui
npm run lint
npm run build
```

---

## 参考

- [SmartHR Design System](https://smarthr.design/)
- [SmartHR タイポグラフィ](https://smarthr.design/basics/typography/website/)
