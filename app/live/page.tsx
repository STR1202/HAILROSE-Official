import Image from 'next/image';
import { client, LiveItem } from '@/libs/microcms';
import { buildPageMetadata } from '@/libs/site';

export const metadata = buildPageMetadata({
  title: 'LIVE',
  description:
    'HAILROSE（ヘイルローズ）のライブスケジュール。出演日・会場・チケット情報を掲載しています。',
  path: '/live',
});

// microCMS の更新をサイトに反映させるための ISR（再検証）設定。
// 未指定だと build 時に一度だけ生成され、再デプロイするまで内容が固定される。
// 60 秒を過ぎた後の最初のアクセスをきっかけに裏側で再生成し、
// その完了以降のアクセスが新しい内容になる（生成中も古い内容を即座に返す）。
export const revalidate = 60;

// microCMSからLIVE一覧を取得（日時の降順）
async function getLiveList(): Promise<LiveItem[]> {
  try {
    const data = await client.get({
      endpoint: 'live',
      queries: {
        orders: '-day',
        limit: 100,
      },
    });
    return data.contents;
  } catch (error) {
    console.error('microCMS Fetch Error:', error);
    return [];
  }
}

// 日付フォーマット関数 (例: 2026/09/02)
function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

export default async function LivePage() {
  const liveList = await getLiveList();

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* 1. 背景画像エリア */}
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
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* 2. LIVE コンテンツエリア */}
      <section className="relative z-10 w-full pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-4 md:px-8 pb-20 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* LIVE タイトル & 破線セパレーター */}
          <div className="w-full flex items-center gap-4 mb-10 md:mb-14">
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">LIVE</h1>
            <div className="grow border-b border-dashed border-white/60"></div>
          </div>

          {/* ライブリスト */}
          <div className="w-full flex flex-col gap-10 md:gap-12">
            {liveList.length === 0 ? (
              <p className="text-center text-gray-400 py-10">現在予定されているライブはありません。</p>
            ) : (
              liveList.map((item) => (
                <article
                  key={item.id}
                  className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl"
                >
                  {/* 左側: フライヤー + 情報 */}
                  <div className="flex flex-col sm:flex-row items-start gap-6 w-full md:w-auto">
                    {item.photo && (
                      <div className="relative w-32 h-44 shrink-0 bg-black overflow-hidden rounded-lg border border-white/20 shadow-lg">
                        <Image
                          src={item.photo.url}
                          alt={item.name}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      {/* 会場 & 日付 */}
                      <div className="text-lg md:text-xl font-bold tracking-wide text-red-400">
                        {item.place && <span className="mr-3">{item.place}</span>}
                        {item.day && <span>{formatDate(item.day)}</span>}
                      </div>

                      {/* ライブ名 */}
                      <h3 className="text-xl md:text-2xl font-extrabold tracking-wider text-white">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* 右側: ボタンエリア（詳細＋Ticketを縦並びで配置） */}
                  {(item.information || item.ticket) && (
                    <div className="w-full md:w-auto flex flex-col gap-3 justify-center items-center shrink-0 md:self-center md:px-4">
                      {/* 上段: 詳細ボタン */}
                      {item.information && (
                        <a
                          href={item.information}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full md:w-40 text-center px-6 py-2.5 border border-white/30 bg-white/10 hover:bg-white hover:text-black font-bold text-xs md:text-sm tracking-widest transition-all duration-300 uppercase rounded-full backdrop-blur-sm"
                        >
                          詳細
                        </a>
                      )}

                      {/* 下段: Ticketボタン */}
                      {item.ticket && (
                        <a
                          href={item.ticket}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full md:w-40 text-center px-6 py-2.5 border border-red-500/50 bg-red-600/20 hover:bg-red-600 hover:text-white font-bold text-xs md:text-sm tracking-widest transition-all duration-300 uppercase rounded-full shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        >
                          TICKET
                        </a>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

        </div>
      </section>

    </main>
  );
}