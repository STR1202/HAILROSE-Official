# HAILROSE Official Site

HAILROSE のオフィシャルサイト。Next.js (App Router) + Tailwind CSS で構築し、
コンテンツは microCMS から取得、お問い合わせは Gmail SMTP 経由で送信する。

- Next.js 16.3.4 / React 19 (App Router, Turbopack)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- microCMS (`microcms-js-sdk`)
- Nodemailer (Gmail SMTP)
- Node.js 20.9 以上

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を埋める（下記「環境変数」参照）
npm run dev                  # http://localhost:3000
```

同一 LAN 上のスマホから開発サーバーを確認できるよう、`next.config.ts` の
`allowedDevOrigins` でプライベート IP レンジを許可している（開発時のみ有効）。

## スクリプト

| コマンド        | 内容                                     |
| --------------- | ---------------------------------------- |
| `npm run dev`   | 開発サーバーを起動                       |
| `npm run build` | 本番ビルド（Vercel もこれを実行する）    |
| `npm run start` | ビルド済みの本番サーバーを起動           |
| `npm run lint`  | ESLint (`eslint-config-next`) を実行     |

## 環境変数

必要なキーは `.env.example` に一覧がある。ローカルでは `.env.local`、
Vercel では **Project Settings → Environment Variables** に登録する。

| キー                      | 必須 | 用途                                                     |
| ------------------------- | ---- | -------------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN` | ✓    | microCMS のサービスドメイン（`xxx.microcms.io` の `xxx`） |
| `MICROCMS_API_KEY`        | ✓    | microCMS の API キー（GET 権限）                          |
| `GMAIL_USER`              | ✓    | お問い合わせメールの送信元 Gmail アドレス                 |
| `GMAIL_PASS`              | ✓    | Google アカウントの「アプリ パスワード」（16桁）          |
| `CONTACT_TO_EMAIL`        |      | 受信先。未設定なら `hailrose.work@gmail.com`              |

すべてサーバー専用（`NEXT_PUBLIC_` 接頭辞なし）で、ブラウザには渡らない。
`.env.local` はコミットしないこと（`.gitignore` 済み）。

## 構成

```
app/
  layout.tsx          共通レイアウト（背景・ヘッダーの PC / スマホ出し分け）
  page.tsx            トップ（lg ブレークポイントで Desktop / Mobile を切替）
  profile/            PROFILE   … microCMS `profile`
  music/              MUSIC     … microCMS `music`
  videos/             VIDEOS    … microCMS `videos`
  live/               LIVE      … microCMS `live`
  news/               NEWS      … microCMS `news`
  merch/              MERCH     … COMING SOON（静的）
  contact/            CONTACT   … 問い合わせフォーム
  api/contact/        フォーム送信先（Node.js ランタイム / 動的）
  robots.ts           /robots.txt を生成
  sitemap.ts          /sitemap.xml を生成（lastmod は microCMS の revisedAt）
components/           Header, MobileHeader, BackgroundVideo, Desktop/MobilePage
libs/microcms.ts      microCMS クライアントと各コンテンツの型定義
libs/site.ts          サイト URL・SNS リンク・ページ共通メタデータの生成
```

## SEO

- **メタデータ** — 共通部分は `app/layout.tsx`、各ページは `libs/site.ts` の
  `buildPageMetadata()` で組み立てる。`openGraph` / `twitter` は入れ子ごと
  後勝ちで置き換わる仕様のため、ページ側では毎回すべて指定する必要がある。
  その繰り返しをヘルパーに集約している。
- **canonical** — 全ページに設定済み。SNS 経由のクエリ付き URL
  （`?fbclid=...` など）が別ページ扱いされて評価が分散するのを防ぐ。
- **OGP 画像** — `public/og-image.png`（1200x630）。`public/logo.png` を
  黒地の中央に配置したもの。
- **構造化データ** — `app/layout.tsx` に JSON-LD（`MusicGroup` + `WebSite`）。
  `sameAs` は `libs/site.ts` の `SOCIAL_LINKS` から生成するので、
  トップページに表示している SNS リンクと必ず一致する。
  裏取りできない項目（ジャンル・メンバー構成など）は意図的に入れていない。
- **公開後にやること** — Google Search Console にサイトを登録し、
  `https://hailrose.com/sitemap.xml` を送信する。これはコード側では完結しない。

## Vercel へのデプロイ

1. GitHub リポジトリを Vercel にインポートする。Framework Preset は
   **Next.js** が自動検出され、Build Command / Output Directory /
   Install Command は既定のままでよい。
2. 上表の環境変数を **Production / Preview / Development** すべてに登録する。
3. Deploy を実行する。

補足:

- `package.json` の `engines.node` で Node.js 20.9 以上を要求している。
  Vercel の Project Settings → Node.js Version もこれを満たすものを選ぶこと。
- microCMS の画像は `next.config.ts` の `images.remotePatterns` で
  `images.microcms-assets.io` を許可済み。新しい配信ドメインを使う場合は追記する。
- `/api/contact` は Nodemailer が Node.js API に依存するため
  `runtime = 'nodejs'` を明示している。Edge Runtime では動作しない。
  SMTP 接続に時間がかかることがあるため `maxDuration = 30` を指定している。
- コンテンツの更新反映については下記「microCMS の更新反映」を参照。

## microCMS の更新反映

microCMS 連携ページ（PROFILE / MUSIC / VIDEOS / LIVE / NEWS）には
**ISR（Incremental Static Regeneration）** を設定している。

```ts
export const revalidate = 60;
```

- 通常のアクセスは静的生成済みのページを返すので高速（microCMS を都度叩かない）。
- 最終生成から 60 秒を過ぎた後の最初のアクセスをきっかけに、裏側でページを
  再生成する。そのアクセス自体には古い内容を即座に返すため待たされない。
- 再生成が終わると、以降のアクセスは新しい内容になる。
- つまり **microCMS を更新すると、最大 1 分ほどでサイトに反映される。
  再デプロイは不要。**

`npm run build` の出力で、対象ページに `Revalidate 1m` が付いていることを確認できる。

```
Route (app)       Revalidate  Expire
├ ○ /live                 1m      1y
├ ○ /music                1m      1y
├ ○ /news                 1m      1y
├ ○ /profile              1m      1y
└ ○ /videos               1m      1y
```

間隔を変えたい場合は各ページ先頭の `revalidate` の秒数を変更する
（例: 5 分なら `300`）。即時反映が必要なら、microCMS の Webhook から
`revalidatePath()` を呼ぶ Route Handler を追加する方法もある。
