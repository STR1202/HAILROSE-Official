import Image from 'next/image';
import { client, MusicItem } from '@/libs/microcms';
import MusicGrid from './MusicGrid';

// microCMSからMUSIC一覧を取得
async function getMusicList(): Promise<MusicItem[]> {
  try {
    const data = await client.get({
      endpoint: 'music',
      queries: {
        limit: 100,
      },
    });
    return data.contents;
  } catch (error) {
    console.error('microCMS Fetch Error:', error);
    return [];
  }
}

export default async function MusicPage() {
  const musicList = await getMusicList();

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* 1. MUSICページ用背景画像エリア (layout.tsxの動画上に重ねて表示) */}
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

      {/* 2. MUSIC コンテンツエリア */}
      <section className="relative z-10 w-full pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-6 pb-20 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col items-center">
          
          {/* MUSIC タイトル */}
          <div className="w-full flex items-center gap-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">MUSIC</h2>
            <div className="grow h-px bg-white/60"></div>
          </div>

          {/* ジャケット写真のグリッド (クライアントコンポーネント) */}
          {musicList.length === 0 ? (
            <p className="text-center text-gray-400 py-10">楽曲情報がありません。</p>
          ) : (
            <MusicGrid musicList={musicList} />
          )}

        </div>
      </section>

    </main>
  );
}