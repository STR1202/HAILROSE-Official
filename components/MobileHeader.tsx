// components/MobileHeader.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

// メニューボタンと罰ボタンは画面右上の同じ座標に重ねる。
// ボタンの位置が動かないので「開く → 閉じる」の操作が指で追いやすい。
const CORNER_BUTTON =
  'flex items-center justify-center w-14 h-14 text-white ' +
  'active:scale-90 transition-transform duration-200 touch-manipulation select-none';

// 背景写真の明暗どちらの上でも線が沈まないよう、白い線に黒い影を落として縁取る
const ICON_SHADOW = 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]';

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="38"
    height="38"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
    className={ICON_SHADOW}
  >
    <line x1="3" y1="6.5" x2="21" y2="6.5" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17.5" x2="21" y2="17.5" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="38"
    height="38"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={ICON_SHADOW}
  >
    <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
  </svg>
);

export default function MobileHeader() {
  const pathname = usePathname();

  // 「どのページで開いたか」を持ち、現在地と一致する間だけ開いた状態とみなす。
  // こうするとページ遷移（ブラウザの戻る操作を含む）で自動的に閉じるため、
  // pathname を監視して setState する useEffect が要らない。
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const isOpen = openedAt === pathname;

  const open = () => setOpenedAt(pathname);
  const close = () => setOpenedAt(null);

  // メニューを開いている間は背面のページをスクロールさせない
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenedAt(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/*
        メニューボタン（横三本線）：画面右上に固定。
        header 自体は pointer-events-none にして、ボタン以外の帯が
        背面のコンテンツのタップを吸わないようにする。
      */}
      <header
        className="
          fixed top-0 right-0 z-100 flex justify-end pointer-events-none
          pt-[max(1rem,env(safe-area-inset-top))]
          pr-[max(0.75rem,env(safe-area-inset-right))]
        "
      >
        <button
          type="button"
          onClick={open}
          aria-label="メニューを開く"
          aria-expanded={isOpen}
          className={`pointer-events-auto ${CORNER_BUTTON}`}
        >
          <MenuIcon />
        </button>
      </header>

      {/* フルスクリーンメニュー */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="サイトメニュー"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="
              fixed inset-0 z-200 bg-black/95 backdrop-blur-xl
              flex flex-col justify-center items-center
              pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))]
              pb-[max(2rem,env(safe-area-inset-bottom))]
              pl-[max(2rem,env(safe-area-inset-left))]
              pr-[max(2rem,env(safe-area-inset-right))]
            "
          >
            {/*
              罰ボタン：メニューボタンと寸分違わず同じ右上の座標に重ねる。

              top / right のオフセットで直接置くのではなく、画面全体に広げた
              ラッパーの justify-end / items-start で右上に寄せている。
              オフセット指定だと、値が何らかの理由で効かなかったときに
              absolute の静的位置が親フレックス（justify-center / items-center）の
              中央に落ち、罰ボタンが画面中央に出てしまう。
              flex 寄せなら最悪でも「右上の角にぴったり付く」だけで済む。
            */}
            <div
              className="
                absolute inset-0 z-10 flex justify-end items-start pointer-events-none
                pt-[max(1rem,env(safe-area-inset-top))]
                pr-[max(0.75rem,env(safe-area-inset-right))]
              "
            >
              <button
                type="button"
                onClick={close}
                aria-label="メニューを閉じる"
                className={`pointer-events-auto text-white/80 hover:text-white ${CORNER_BUTTON}`}
              >
                <CloseIcon />
              </button>
            </div>

            {/* ナビゲーションリスト（縦に長いので念のためスクロール可） */}
            <nav className="w-full max-h-full overflow-y-auto overscroll-contain">
              <ul className="flex flex-col items-center gap-6 sm:gap-8">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href;

                  return (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: 0.08 + index * 0.04,
                        ease: 'easeOut',
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? 'page' : undefined}
                        className={`block px-6 py-1 text-2xl sm:text-3xl font-semibold tracking-widest uppercase transition-colors duration-300 ${
                          isActive
                            ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                            : 'text-neutral-300 active:text-white'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
