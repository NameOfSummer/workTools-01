# Work Tools (workTools-01)

エンジニアの仕事で使う便利ツールを集めた Web アプリです。

## 機能

- **ストップウォッチ** — 経過時間の計測
- **ブランチ名生成** — `feature/SP-[Jira]/[タスク番号]/dev` · `stg` 形式で生成・コピー、履歴管理
- **JSON 整形** — 整形・圧縮・コピー
- **ランダム文字列生成** — 文字種・文字数を選択して生成
- **UNIX 時間（ミリ秒）** — 現在時刻の取得・日時変換
- **画像カラーピッカー** — 画像の貼り付け・D&Dで色を取得・コピー
- **正規表現テスター** — パターン・置換・マッチ一覧
- **テキスト diff** — 2つのテキストを比較（JSON・ログ向け）

## 技術スタック

- React + TypeScript + Vite
- shadcn/ui（Radix UI + Tailwind CSS v4）
- gh-pages（GitHub Pages デプロイ）

## セットアップ

```bash
npm install
npm run dev
```

## デプロイ（GitHub Pages）

```bash
npm run deploy
```

公開 URL: `https://nameofsummer.github.io/workTools-01/`

## UI

INFOBAR「NISHIKIGOI（錦鯉）」を参考にした配色（クリーム・白・ブルーグレー・赤・チャコール）を使用しています。
