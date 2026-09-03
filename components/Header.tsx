'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 全ページ共通ナビゲーション項目
const navItems = [
  { name: 'HOME', href: '/' },
  { name: 'PROFILE', href: '/profile' },
  { name: 'MUSIC', href: '/music' },
  { name: 'VIDEOS', href: '/videos' },
  { name: 'LIVE', href: '/live' },
  { name: 'NEWS', href: '/news' },
  { name: 'MERCH', href: '/merch' },
  { name: 'CONTACT', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    // framer-motion を外し、普通の <header> タグに変更。z-[100] で強制最前面。
    // left-1/2 の計算を外し、w-full 内での flex justify-center に変更して配置を安定化。
    <header className="fixed top-0 left-0 w-full z-100 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] flex justify-center pointer-events-auto">
      <nav className="relative w-full max-w-6xl flex items-center justify-start md:justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-2 shadow-2xl shadow-black/80">
        
        {/* モバイル向け横スクロール指示用グラデーションマスク */}
        {/* ⚠️ bg-linear-to-r は Tailwind のバージョンによって効かないため、標準の bg-gradient-to-r に変更 */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-black/80 to-transparent rounded-l-full md:hidden z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-black/80 to-transparent rounded-r-full md:hidden z-10" />

        {/* ナビゲーションリスト */}
        <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto whitespace-nowrap scrollbar-none py-1 px-2 [-webkit-overflow-scrolling:touch]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative shrink-0 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base font-semibold tracking-widest transition-all duration-300 uppercase ${
                  isActive 
                    ? 'text-white bg-red-600/80 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}