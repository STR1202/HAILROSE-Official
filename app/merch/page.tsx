import Image from 'next/image';
import { buildPageMetadata } from '@/libs/site';

export const metadata = buildPageMetadata({
  title: 'MERCH',
  description:
    'HAILROSE（ヘイルローズ）のオフィシャルグッズ。オンラインストアは現在準備中です。',
  path: '/merch',
});

export default function MerchPage() {
  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* 1. 背景画像エリア */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <Image
          src="/bg-image.jpg"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {/* 背景オーバーレイ */}
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* 2. MERCH コンテンツエリア */}
      <section className="relative z-10 w-full min-h-screen pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-4 md:px-8 pb-20 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center grow">
          
          {/* MERCH タイトル & 破線セパレーター */}
          <div className="w-full flex items-center gap-4 mb-10 md:mb-14">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">MERCH</h1>
            <div className="grow border-b border-dashed border-white/60"></div>
          </div>

          {/* COMING SOON 表示（枠組みを削除） */}
          <div className="my-auto py-16 md:py-24 flex flex-col items-center justify-center text-center">
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-[0.2em] uppercase text-white/90 mb-4 drop-shadow-md">
              COMING SOON
            </h3>
            <p className="text-xs md:text-sm tracking-widest text-gray-400 uppercase font-medium">
              Official Store Opening Soon
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}