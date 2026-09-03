import type { NextConfig } from 'next';

// 開発サーバーへ localhost 以外（＝同一 LAN 上のスマホ）からアクセスするために必要な許可リスト。
// 未指定だと Next.js が /_next/hmr への WebSocket 接続を 403 で拒否し、
// クライアントが再接続に 12 回失敗した時点で window.location.reload() を実行するため、
// スマホでは約40秒ごとにページがリロードされ、フォームの入力・送信が中断される。
// DHCP で IP が変わっても効くよう、プライベート IP レンジをまとめて許可する。
// （172.20.10.* は iPhone のインターネット共有で割り当てられるレンジ）
const privateNetworkOrigins = [
  '192.168.*.*',
  '10.*.*.*',
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
  '*.local',
];

const nextConfig: NextConfig = {
  allowedDevOrigins: privateNetworkOrigins,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },
};

export default nextConfig;
