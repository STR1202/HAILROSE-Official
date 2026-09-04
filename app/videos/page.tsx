import Image from 'next/image';
import { client, VideoItem } from '@/libs/microcms';
import { buildPageMetadata } from '@/libs/site';

export const metadata = buildPageMetadata({
  title: 'VIDEOS',
  description:
    'HAILROSE（ヘイルローズ）のミュージックビデオ・ライブ映像の一覧。',
  path: '/videos',
});

// microCMS の更新をサイトに反映させるための ISR（再検証）設定。
// 未指定だと build 時に一度だけ生成され、再デプロイするまで内容が固定される。
// 60 秒を過ぎた後の最初のアクセスをきっかけに裏側で再生成し、
// その完了以降のアクセスが新しい内容になる（生成中も古い内容を即座に返す）。
export const revalidate = 60;

// microCMSからVIDEOS一覧を取得
async function getVideoList(): Promise<VideoItem[]> {
  try {
    const data = await client.get({
      endpoint: 'videos',
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

export default async function VideosPage() {
  const videoList = await getVideoList();

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* 1. 背景画像エリア (固定表示) */}
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

      {/* 2. VIDEOS コンテンツエリア */}
      <section className="relative z-10 w-full pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-4 md:px-6 pb-20 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* VIDEOS タイトル */}
          <div className="w-full flex items-center gap-4 mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">VIDEOS</h1>
            <div className="grow h-px bg-white/60"></div>
          </div>

          {/* 動画の縦並びリスト */}
          <div className="w-full flex flex-col gap-12 md:gap-16">
            {videoList.length === 0 ? (
              <p className="text-center text-gray-400 py-10">動画情報がありません。</p>
            ) : (
              videoList.map((video) => (
                <article
                  key={video.id}
                  className="w-full flex flex-col items-center"
                >
                  {/* 16:9 のレスポンシブ動画プレイヤー枠 */}
                  <div className="relative w-full aspect-video bg-black shadow-2xl overflow-hidden rounded-lg border border-white/10">
                    {video.youtubeID && (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeID}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full border-0"
                      ></iframe>
                    )}
                  </div>

                  {/* 動画タイトル */}
                  <h3 className="mt-4 text-base md:text-xl font-bold tracking-wider text-left w-full text-gray-200">
                    {video.title}
                  </h3>
                </article>
              ))
            )}
          </div>

        </div>
      </section>

    </main>
  );
}