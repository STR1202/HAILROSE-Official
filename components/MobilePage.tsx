// components/MobilePage.tsx
import Image from 'next/image';
import {
  SiYoutube,
  SiX,
  SiInstagram,
  SiSpotify,
  SiApplemusic,
} from 'react-icons/si';

const socialLinks = [
  { name: 'YouTube', href: 'https://www.youtube.com/@hailrose_droid', icon: SiYoutube },
  { name: 'X (Twitter)', href: 'https://x.com/HAILROSE_droid', icon: SiX },
  { name: 'Instagram', href: 'https://www.instagram.com/nudigitalhcjp/', icon: SiInstagram },
  { name: 'Spotify', href: 'https://open.spotify.com/intl-ja/artist/4Y8fSqvFWOtl3lWwZJh91p', icon: SiSpotify },
  { name: 'Apple Music', href: 'https://music.apple.com/jp/artist/hailrose/1517272909', icon: SiApplemusic },
];

// 登場アニメーションは CSS（globals.css）で行う。
// framer-motion を使うと SSR に opacity:0 が焼き込まれ、
// JS が止まった瞬間にロゴとリンクが見えなくなるため 'use client' も不要にした。
export default function MobilePage() {
  return (
    // 背景画像は layout.tsx が全ページ共通で敷いているのでここでは重ねない。
    // h-screen-safe は 100vh フォールバック付きの1画面高（globals.css で定義）。
    <main className="relative w-full h-screen-safe overflow-hidden">
      {/* ロゴの視認性を上げるための暗幕 */}
      <div className="absolute inset-0 z-0 bg-black/45 pointer-events-none" />

      {/*
        ロゴ：親と同じ矩形を absolute inset-0 で切り出してから中央寄せする。
        h-full だと親の高さ計算に依存するが、inset-0 なら main の四辺に
        直接張り付くので、高さの解決に失敗しても中央から外れない。
      */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        {/* aspect は logo.png の実寸 4152x2197。比率を合わせると object-contain の余白が出ない */}
        <div className="no-image-save animate-logo-in relative w-[82%] max-w-md sm:max-w-lg md:max-w-xl aspect-4152/2197">
          <Image
            src="/logo.png"
            alt="HAILROSE"
            fill
            draggable={false}
            // priority は付けない。付けると <link rel=preload> が出て、
            // PC 側（display:none で使わない方）まで先読みしてしまう。
            // 初期表示領域内の画像なので lazy でも即座に読み込まれる。
            sizes="(min-width: 768px) 45vw, 82vw"
            className="object-contain drop-shadow-2xl"
          />
          {/*
            透明な覆い。長押し／右クリックの当たり判定をこの div に逃がすことで、
            ブラウザのコンテキストメニューに「画像を保存」が出なくなる。
            -webkit-touch-callout が効かない Android Chrome ではこちらが効く。
          */}
          <div className="absolute inset-0" aria-hidden />
        </div>
      </div>

      {/* 画面下部：SNSリンク */}
      <footer
        className="
          animate-footer-in absolute bottom-0 left-0 right-0 z-20 flex justify-center
          pb-[max(2rem,env(safe-area-inset-bottom))]
          pl-[max(1rem,env(safe-area-inset-left))]
          pr-[max(1rem,env(safe-area-inset-right))]
        "
      >
        <div className="flex flex-wrap justify-center items-center gap-2 max-w-[95%] bg-black/60 backdrop-blur-md px-4 py-2 rounded-4xl border border-white/10 shadow-2xl">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                // min-w/min-h 11 (44px) でタップ領域をiOSの推奨サイズ以上に保つ
                className="flex items-center justify-center min-w-11 min-h-11 text-white active:text-red-500 active:scale-95 transition-all duration-200 touch-manipulation"
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </footer>
    </main>
  );
}
