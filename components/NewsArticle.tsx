import type { ReactNode } from 'react';
import Image from 'next/image';
import type { NewsItem } from '@/libs/microcms';
import { formatNewsDate } from '@/libs/news';

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

/**
 * NEWS 記事の中身。記事ページ（/news/[id]）とモーダルの両方から使う。
 *
 * サーバーコンポーネントのままにしてあるので、モーダル側でも本文の
 * リンク変換はサーバーで済み、クライアントに linkify のコードが送られない。
 *
 * @param headingLevel 見出しタグ。記事ページでは h1、モーダルでは h2。
 *   モーダルは一覧ページ（h1 は「NEWS」）に重なって出るため、そこで h1 を
 *   足すと1ページに h1 が2つ並ぶ。クローラが見るのは常に片方だけなので
 *   検索結果には影響しないが、支援技術から見た見出し構造は正しく保つ。
 * @param titleId モーダルの aria-labelledby から参照するための id。
 */
export default function NewsArticle({
  item,
  headingLevel = 'h1',
  titleId,
}: {
  item: NewsItem;
  headingLevel?: 'h1' | 'h2';
  titleId?: string;
}) {
  const Heading = headingLevel;

  return (
    <article className="w-full max-w-3xl mx-auto">
      <time
        dateTime={item.publishedAt}
        className="block text-xs md:text-sm font-semibold tracking-widest text-red-400"
      >
        {formatNewsDate(item.publishedAt)}
      </time>

      <Heading
        id={titleId}
        className="mt-3 text-xl md:text-3xl font-bold tracking-wide text-white leading-snug"
      >
        {item.title}
      </Heading>

      <div className="my-6 md:my-8 border-t border-white/15" />

      {/*
        本文の上に microCMS の画像を出す。
        縦長・横長どちらも来るのでコンテナで比率を固定せず、
        microCMS が返す width / height をそのまま渡して元の縦横比で出す。
        （寸法を渡しておくと読み込み前から高さが確保され、本文が下へずれない）
      */}
      {item.photo?.url && (
        <Image
          src={item.photo.url}
          alt=""
          width={item.photo.width}
          height={item.photo.height}
          sizes="(max-width: 768px) 100vw, 768px"
          className="w-full h-auto mb-6 md:mb-8 rounded-xl border border-white/10 shadow-xl"
        />
      )}

      {item.word ? (
        <p className="text-sm md:text-base text-neutral-200 leading-relaxed whitespace-pre-wrap wrap-break-word">
          {linkify(item.word)}
        </p>
      ) : (
        <p className="text-sm text-gray-400">本文はありません。</p>
      )}
    </article>
  );
}
