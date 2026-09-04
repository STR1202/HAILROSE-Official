// app/news/layout.tsx

/**
 * NEWS セクションのレイアウト。
 *
 * modal は Parallel Routes のスロット（app/news/@modal/）。
 * 一覧から記事リンクをたどると Intercepting Routes が /news/[id] を横取りし、
 * children（一覧）はそのままに modal 側だけが記事に切り替わる。
 * URL を直接開いた場合は横取りが起きず、children が記事ページになり、
 * modal は @modal/default.tsx（null）になる。
 *
 * 見た目の要素はここに置かない。一覧と記事ページで背景の敷き方が違うため、
 * 共通化するとどちらかに不要な重なりが生まれる。
 */
export default function NewsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
