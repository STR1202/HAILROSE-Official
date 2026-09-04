'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SSR では false、クライアントにマウントされたら true を返す。
 *
 * createPortal は document を触るのでサーバー側では呼べない。
 * useEffect + setState でマウント判定すると「エフェクト内の同期 setState」になり
 * lint (react-hooks/set-state-in-effect) にも引っかかるため、
 * ハイドレーションのずれを React 側が面倒を見てくれる
 * useSyncExternalStore を使う。
 */
const subscribeNever = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

// 閉じるボタンは MobileHeader と同じ見た目・同じ位置に揃える
const CLOSE_BUTTON =
  'flex items-center justify-center w-14 h-14 text-white/80 hover:text-white ' +
  'active:scale-90 transition-transform duration-200 touch-manipulation select-none';

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
    className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
  >
    <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" />
    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" />
  </svg>
);

/**
 * NEWS 記事を全画面で重ねて表示するモーダルの外枠。
 *
 * このコンポーネントが描画されるのは、一覧から <Link href="/news/[id]"> を
 * たどったとき（Intercepting Routes が /news/[id] を横取りしたとき）だけ。
 * URL を直接開いた・リロードした・共有リンクから来た・クローラが来た場合は
 * 横取りが起きず、通常の記事ページ（app/news/[id]/page.tsx）が表示される。
 *
 * 閉じる操作は router.back()。URL が /news に戻り、ブラウザの戻る／進むとも
 * 自然に噛み合う。
 */
export default function NewsModal({
  children,
  titleId,
}: {
  children: ReactNode;
  titleId: string;
}) {
  const router = useRouter();
  const mounted = useMounted();
  const dialogRef = useRef<HTMLDivElement>(null);

  /*
    open を経由してから戻るのは、閉じるアニメーションを見せるため。
    router.back() を直に呼ぶとコンポーネントが即座に外れ、
    AnimatePresence の exit が走る前に消えてしまう。
    ここでは「open=false → exit アニメーション → onExitComplete で back()」
    の順に倒す。（ブラウザの戻るボタンで閉じた場合は即時アンマウントになり
    exit は出ないが、その挙動はブラウザ側の操作として自然）
  */
  const [open, setOpen] = useState(true);

  // 詳細を開いている間は背面のページをスクロールさせない
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    // 開いた直後に本文へフォーカスを移し、そのままスクロール・読み上げできるようにする
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

  /*
    document.body 直下へポータルで飛ばしている。
    layout.tsx の <div className="relative z-10"> が重ね合わせコンテキストを
    作っているため、その内側にいる限り z-index をいくつ積んでも
    body 直下にいるヘッダー(z-100)より上に出られず、
    メニューの三本線と閉じるボタンが右上で重なってしまう。
  */
  return createPortal(
    <AnimatePresence onExitComplete={() => router.back()}>
      {open && (
        <motion.div
          key="news-detail"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          // z-150：ヘッダー(z-100)より上、ナビのフルスクリーンメニュー(z-200)より下
          className="fixed inset-0 z-150 bg-black/95 backdrop-blur-xl"
        >
          {/*
            罰ボタン：画面右上。
            top / right のオフセットではなく、画面全体に広げたラッパーの
            justify-end / items-start で寄せている。値が効かなかった場合でも
            「右上の角に付く」だけで済み、中央に落ちる事故が起きない。
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
              onClick={() => setOpen(false)}
              aria-label="閉じる"
              className={`pointer-events-auto ${CLOSE_BUTTON}`}
            >
              <CloseIcon />
            </button>
          </div>

          {/* 本文（長文になりうるのでこの層がスクロールする） */}
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="
              absolute inset-0 overflow-y-auto overscroll-contain focus:outline-none
              pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))]
              pb-[max(3rem,calc(env(safe-area-inset-bottom)+2rem))]
              pl-[max(1.5rem,env(safe-area-inset-left))]
              pr-[max(1.5rem,env(safe-area-inset-right))]
            "
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
