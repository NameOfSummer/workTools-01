# Work Tools (workTools-01)

エンジニアの仕事で使う便利ツールを集めた Web アプリです。

## 機能

- **ストップウォッチ** — 計測終了時に Google カレンダーへ予定を登録
- **JSON 整形** — 整形・圧縮・コピー
- **ランダム文字列生成** — 文字種・文字数を選択して生成
- **UNIX 時間（ミリ秒）** — 現在時刻の取得・日時変換
- **設定** — Google ログイン/ログアウト、登録先カレンダーの選択

## 技術スタック

- React + TypeScript + Vite
- shadcn/ui（Radix UI + Tailwind CSS v4）
- gh-pages（GitHub Pages デプロイ）

## セットアップ

```bash
npm install
cp .env.example .env
# .env に VITE_GOOGLE_CLIENT_ID を設定
npm run dev
```

## Google カレンダー連携の設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. **Google Calendar API** を有効化
3. **OAuth 2.0 クライアント ID**（ウェブアプリケーション）を作成
4. **承認済みの JavaScript 生成元** に以下を追加:
   - `http://localhost:5173`（開発用）
   - `https://<username>.github.io`（GitHub Pages 用）
5. クライアント ID を `.env` の `VITE_GOOGLE_CLIENT_ID` に設定

## デプロイ（GitHub Pages）

```bash
npm run deploy
```

リポジトリの Settings → Pages で **Deploy from branch: gh-pages** を選択してください。

公開 URL: `https://<username>.github.io/workTools-01/`

## UI

INFOBAR「NISHIKIGOI（錦鯉）」を参考にした配色（クリムゾン・ネイビー・桜色）を使用しています。
