import { createClient } from 'microcms-js-sdk';

type Client = ReturnType<typeof createClient>;

let cached: Client | null = null;

/**
 * createClient() は serviceDomain / apiKey が空だとその場で例外を投げる。
 *
 * これをモジュールのトップレベルで実行していると、環境変数の設定漏れが
 * 「import した時点での throw」になる。各ページの取得関数が持つ try/catch は
 * import より後ろにあるため捕捉できず、next build が
 * "parameter is required" だけを残して丸ごと失敗する。
 * （Vercel への初回デプロイで環境変数を入れ忘れたときに起きる）
 *
 * 生成を実際に呼ばれるまで遅らせることで、例外は呼び出し側の try/catch に届き、
 * ビルドは通ったうえで各ページが既存の空表示（「楽曲情報がありません。」等）に
 * フォールバックする。原因はログに出す。
 */
const getClient = (): Client => {
  if (!cached) {
    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_API_KEY;

    if (!serviceDomain || !apiKey) {
      throw new Error(
        'MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が設定されていません。' +
          'ローカルは .env.local、Vercel は Project Settings → Environment Variables を確認してください。'
      );
    }

    cached = createClient({ serviceDomain, apiKey });
  }
  return cached;
};

// createClient() が返すのはメソッドを持つただのオブジェクト（this に依存しない
// クロージャ）なので、Proxy でそのまま委譲できる。呼び出し側は従来どおり
// client.get({ ... }) と書ける。
export const client = new Proxy({} as Client, {
  get: (_target, prop) => getClient()[prop as keyof Client],
});

// プロフィールページ //
export type ProfileItem = {
  ArtistPhoto: {
    url: string;
    height: number;
    width: number;
  };
  hailrose: string;
  biography: string;
};

// MUSICページ //
export type MusicItem = {
  id: string;
  title: string;       // タイトル (曲名)
  release: string;     // リリリース日 (例: 2026.04.01 RELEASE)
  link: string;        // Tunecoreリンク
  photo: {            // ジャケット
    url: string;
    height: number;
    width: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

// VIDEOSページ //
export type VideoItem = {
  id: string;
  youtubeID: string; // YouTubeID（リンクの"v="以降）
  title: string;     // タイトル
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

// ライブ情報ページ //
export type LiveItem = {
  id: string;
  name: string; // ライブ名
  day: string; // 日付 (ISO 8601形式文字列)
  place: string; // 場所
  information: string; // 情報
  ticket: string; // 詳細URL (取り置きGoogleフォームなど)
  photo: {
    url: string;
    height: number;
    width: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

// お知らせページ
export type NewsItem = {
  id: string;
  title: string;     // タイトル
  word: string;     // 本文
  photo?: {          // 本文上部に出す画像（未登録の記事もあるので任意）
    url: string;
    height: number;
    width: number;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};