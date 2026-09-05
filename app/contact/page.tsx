// app/contact/page.tsx
import Image from 'next/image';
import ContactForm from './ContactForm';
import { buildPageMetadata, SITE_DESCRIPTION } from '@/libs/site';

export const metadata = buildPageMetadata({
  title: 'CONTACT',
  description: SITE_DESCRIPTION,
  path: '/contact',
});

export default function ContactPage() {
  return (
    // min-h-svh を使用。dvh はスクロールに追従して高さが変わるため、
    // fixed 背景と併用すると iOS Safari でガタつきが発生する。
    <main className="relative w-full min-h-svh overflow-x-hidden">
      {/* 1. 背景画像エリア
          lvh（最大ビューポート高）で固定し、アドレスバーの開閉時に
          背景下端に隙間ができるのを防ぐ */}
      <div className="fixed inset-x-0 top-0 h-lvh z-0 overflow-hidden pointer-events-none">
        <Image
          src="/bg-image.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="fixed inset-x-0 top-0 h-lvh bg-black/70 z-0 pointer-events-none" />

      {/*
        2. CONTACT コンテンツエリア

        余白はすべて Tailwind の任意値で指定する。
        （元コードは className の pt-28 / px-4 を style 属性が上書きしており、
         md: のレスポンシブ指定が効かない状態だった）

        env() が値を返すには layout.tsx の viewport で
        viewportFit: 'cover' を指定する必要がある。
      */}
      <section
        className="
          relative z-10 w-full min-h-svh flex flex-col items-center
          pt-[max(7rem,calc(env(safe-area-inset-top)+6rem))]
          md:pt-[max(8rem,calc(env(safe-area-inset-top)+7rem))]
          pb-[max(5rem,calc(env(safe-area-inset-bottom)+3rem))]
          pl-[max(1rem,env(safe-area-inset-left))]
          pr-[max(1rem,env(safe-area-inset-right))]
          md:pl-[max(2rem,env(safe-area-inset-left))]
          md:pr-[max(2rem,env(safe-area-inset-right))]
        "
      >
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* CONTACT タイトル & 破線セパレーター */}
          <div className="w-full flex items-center gap-4 mb-6 md:mb-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">
              CONTACT
            </h1>
            <div className="grow border-b border-dashed border-white/60" />
          </div>

          {/* 冒頭案内文 */}
          <p className="w-full text-left text-sm md:text-base text-gray-200 leading-relaxed tracking-wide mb-8 md:mb-10">
            ご相談やご質問などございましたら、下記フォームにてお気軽にお問合せください。
          </p>

          {/* 切り出したクライアントフォームを呼び出し */}
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
