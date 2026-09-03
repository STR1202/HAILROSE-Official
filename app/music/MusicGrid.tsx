// app/music/MusicGrid.tsx
import Image from 'next/image';
import { MusicItem } from '@/libs/microcms';

type Props = {
  musicList: MusicItem[];
};

export default function MusicGrid({ musicList }: Props) {
  return (
    // 列数はタブレットから2列。1列のままだとiPadでジャケットが巨大になりすぎる。
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      {musicList.map((item) => (
        <div
          key={item.id}
          className="relative w-full aspect-square bg-black overflow-hidden shadow-2xl"
        >
          {item.photo?.url && (
            <Image
              src={item.photo.url}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}

          {/* ==========================================
              1. タッチ端末用レイアウト（既定で表示）

              曲名とリンクを常に見せる。隠すのは
              「ホバーできる入力手段があり、かつ lg 以上」のときだけ。

              以前は md (768px) 未満という幅だけの条件だったため、
              iPad 縦(768〜1023px)も横(1194px)もホバー版に入ってしまい、
              ホバーできない端末で曲名と Listen リンクに一切たどり着けなかった。
              ========================================== */}
          <div className="flex can-hover:lg:hidden absolute inset-0 bg-black/50 flex-col justify-end p-4 text-left z-10">
            <span className="text-xs font-semibold text-gray-300 mb-1">
              {item.release}
            </span>
            <h3 className="text-base font-bold text-white mb-3 leading-snug">
              {item.title}
            </h3>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                // min-h-11 (44px) でタップ領域をiOSの推奨サイズ以上に保つ
                className="w-full min-h-11 flex items-center justify-center bg-white text-black font-bold text-xs tracking-widest uppercase rounded-sm active:bg-neutral-300 transition-colors duration-200 touch-manipulation"
              >
                Listen
              </a>
            )}
          </div>

          {/* ==========================================
              2. PC専用レイアウト（ホバーできる環境かつ lg 以上でのみ有効）
              ========================================== */}
          <div className="hidden can-hover:lg:flex absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 flex-col items-center justify-center p-6 text-center z-10">
            <span className="text-sm font-semibold tracking-widest text-gray-300 mb-2">
              {item.release}
            </span>
            <h3 className="text-2xl font-bold tracking-wider mb-6 text-white leading-snug">
              {item.title}
            </h3>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 border border-white text-white font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-200 rounded-sm"
              >
                Listen
              </a>
            )}
          </div>

        </div>
      ))}
    </div>
  );
}
