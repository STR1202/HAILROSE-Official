// app/news/@modal/default.tsx

/**
 * modal スロットに対応するルートが無いときのフォールバック。
 *
 * /news をそのまま開いたときや、/news/[id] をリロードしたとき（＝横取りが
 * 起きずに children 側が記事ページになるとき）にここが使われる。
 * default.tsx が無いと、スロットが解決できず 404 になる。
 */
export default function Default() {
  return null;
}
