import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
  apiKey: process.env.MICROCMS_API_KEY || '',
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