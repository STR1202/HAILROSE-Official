// app/news/NewsList.tsx
'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { NewsItem } from '@/libs/microcms';

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

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0 text-red-400"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

/**
 * 本文中の URL を <a> に変換する。
 *
 * microCMS の本文(word)はプレーンテキストなので、そのまま出すと
 * URL が「ただの文字列」になってタップもクリックもできない。
 * HTML を受け取っているわけではないので dangerouslySetInnerHTML は使わず、
 * URL らしき部分だけを拾って React 要素に組み替える。
 */
// 全角の括弧・読点・句点は URL に含めない（日本語の文中に貼られた URL 対策）
const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s<>"'「」『』（）()［］[\]、。]+/gi;

const LINK_CLASS =
  'text-red-400 underline underline-offset-4 decoration-red-400/60 ' +
  'hover:text-red-300 hover:decoration-red-300 active:text-red-300 ' +
  'transition-colors duration-200 break-all touch-manipulation';

function linkify(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    let url = match[0];

    // 「詳細はこちら https://example.com/news 。」のような書き方で
    // 文末記号までリンクに巻き込まないようにする
    const trailing = url.match(/[.,!?:;]+$/);
    if (trailing) url = url.slice(0, -trailing[0].length);
    if (!url) continue;

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));
    nodes.push(
      <a
        key={`${start}-${url}`}
        href={url.toLowerCase().startsWith('www.') ? `https://${url}` : url}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASS}
      >
        {url}
      </a>
    );
    lastIndex = start + url.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

// 日付フォーマット (例: 2026.09.02)
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export default function NewsList({ items }: { items: NewsItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openItem = items.find((item) => item.id === openId) ?? null;

  const mounted = useMounted();
  const dialogRef = useRef<HTMLDivElement>(null);

  // 詳細を開いている間は背面のページをスクロールさせない
  useEffect(() => {
    if (!openId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    // 開いた直後に本文へフォーカスを移し、そのままスクロール・読み上げできるようにする
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openId]);

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 py-10">現在お知らせはありません。</p>
    );
  }

  return (
    <>
      {/* 一覧：公開日とタイトルを並べる（本文は詳細を開くまで出さない） */}
      <ul className="w-full flex flex-col gap-3 md:gap-4">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(item.id)}
              // min-h-14 (56px) でタップ領域を確保する
              className="
                w-full min-h-14 flex items-center justify-between gap-4 text-left
                bg-black/30 backdrop-blur-sm px-5 py-4 md:px-7 md:py-5
                rounded-2xl border border-white/10 shadow-xl
                transition-colors duration-200
                hover:border-white/30 hover:bg-black/50
                active:border-red-500/60 active:bg-black/60
                touch-manipulation
              "
            >
              {/* min-w-0 が無いと、長いタイトルが flex の縮小を拒否して
                  右端の矢印を画面外へ押し出してしまう */}
              <span className="min-w-0 flex flex-col gap-1.5">
                <time
                  dateTime={item.publishedAt}
                  className="text-xs md:text-sm font-semibold tracking-widest text-red-400"
                >
                  {formatDate(item.publishedAt)}
                </time>
                <span className="text-base md:text-xl font-bold tracking-wide text-white leading-snug">
                  {item.title}
                </span>
              </span>
              <ChevronIcon />
            </button>
          </li>
        ))}
      </ul>

      {/*
        詳細：画面全体にタイトルと本文を表示する。

        document.body 直下へポータルで飛ばしている。
        layout.tsx の <div className="relative z-10"> が重ね合わせコンテキストを
        作っているため、その内側にいる限り z-index をいくつ積んでも
        body 直下にいるヘッダー(z-100)より上に出られず、
        メニューの三本線と閉じるボタンが右上で重なってしまう。
      */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {openItem && (
              <motion.div
                key="news-detail"
                role="dialog"
                aria-modal="true"
                aria-labelledby="news-detail-title"
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
                    onClick={() => setOpenId(null)}
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
                  <article className="w-full max-w-3xl mx-auto">
                    <time className="block text-xs md:text-sm font-semibold tracking-widest text-red-400">
                      {formatDate(openItem.publishedAt)}
                    </time>

                    <h2
                      id="news-detail-title"
                      className="mt-3 text-xl md:text-3xl font-bold tracking-wide text-white leading-snug"
                    >
                      {openItem.title}
                    </h2>

                    <div className="my-6 md:my-8 border-t border-white/15" />

                    {/*
                      本文の上に microCMS の画像を出す。
                      縦長・横長どちらも来るのでコンテナで比率を固定せず、
                      microCMS が返す width / height をそのまま渡して元の縦横比で出す。
                      （寸法を渡しておくと読み込み前から高さが確保され、本文が下へずれない）
                    */}
                    {openItem.photo?.url && (
                      <Image
                        src={openItem.photo.url}
                        alt=""
                        width={openItem.photo.width}
                        height={openItem.photo.height}
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="w-full h-auto mb-6 md:mb-8 rounded-xl border border-white/10 shadow-xl"
                      />
                    )}

                    {openItem.word ? (
                      <p className="text-sm md:text-base text-neutral-200 leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {linkify(openItem.word)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">本文はありません。</p>
                    )}
                  </article>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
