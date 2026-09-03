// components/DesktopPage.tsx
import Image from 'next/image';
import { 
  SiYoutube, 
  SiX, 
  SiInstagram, 
  SiSpotify, 
  SiApplemusic 
} from 'react-icons/si';

const socialLinks = [
  { name: 'YouTube', href: 'https://www.youtube.com/@hailrose_droid', icon: SiYoutube },
  { name: 'X (Twitter)', href: 'https://x.com/HAILROSE_droid', icon: SiX },
  { name: 'Instagram', href: 'https://www.instagram.com/nudigitalhcjp/', icon: SiInstagram },
  { name: 'Spotify', href: 'https://open.spotify.com/intl-ja/artist/4Y8fSqvFWOtl3lWwZJh91p', icon: SiSpotify },
  { name: 'Apple Music', href: 'https://music.apple.com/jp/artist/hailrose/1517272909', icon: SiApplemusic },
];

export default function TopPage() {
  return (
    <main className="relative w-full h-screen-safe overflow-hidden flex flex-col justify-between items-center pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* トップページ用オーバーレイ */}
      <div className="fixed inset-0 bg-black/40 z-0 pointer-events-none" />

      {/* 画面中央：ロゴエリア */}
      <section className="relative z-10 w-full h-full flex items-center justify-center px-6">
        <div
          className="no-image-save animate-logo-in relative w-full max-w-3xl aspect-4152/2197 flex items-center justify-center"
        >
          <Image
            src="/logo.png"
            alt="BAND LOGO"
            fill
            draggable={false}
            sizes="(max-width: 1200px) 50vw, 33vw"
            className="object-contain drop-shadow-2xl"
          />
          {/* 長押し／右クリックの当たり判定を逃がす透明な覆い（globals.css の .no-image-save 参照） */}
          <div className="absolute inset-0" aria-hidden />
        </div>
      </section>

      {/* 画面下部：SNSリンク */}
      <footer className="absolute bottom-0 left-0 w-full z-20 flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-8">
        <div
          className="animate-footer-in flex flex-col items-center justify-center"
        >
          <div className="flex items-center gap-6 md:gap-8 bg-black/40 backdrop-blur-md px-7 py-3 rounded-full border border-white/10 shadow-lg">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="p-1 text-neutral-300 hover:text-red-500 hover:scale-110 transition-all duration-200 active:scale-95"
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7 drop-shadow-md" />
                </a>
              );
            })}
          </div>
        </div>
      </footer>
    </main>
  );
}