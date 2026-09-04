// app/news/NewsList.tsx
import Link from 'next/link';
import type { NewsItem } from '@/libs/microcms';
import { formatNewsDate } from '@/libs/news';

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
 * NEWS 一覧。
 *
 * 各行は /news/[id] への実リンク。クリック時は Intercepting Routes が
 * この遷移を横取りして一覧の上にモーダルを重ねる（URL は /news/[id] に変わる）。
 * リロード・共有リンク・クローラは横取りされず記事ページが開く。
 *
 * 以前は button + useState でモーダルを開いていたため、記事に URL が無く
 * 検索エンジンからは本文が存在しないのと同じだった。<a href> にしたことで
 * クローラが各記事をたどれるようになり、この一覧自体は状態を持たなくなったので
 * サーバーコンポーネントに戻している（framer-motion も portal も送らない）。
 */
export default function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 py-10">現在お知らせはありません。</p>
    );
  }

  return (
    <ul className="w-full flex flex-col gap-3 md:gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/news/${item.id}`}
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
                {formatNewsDate(item.publishedAt)}
              </time>
              <span className="text-base md:text-xl font-bold tracking-wide text-white leading-snug">
                {item.title}
              </span>
            </span>
            <ChevronIcon />
          </Link>
        </li>
      ))}
    </ul>
  );
}
