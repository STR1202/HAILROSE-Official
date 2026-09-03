// app/profile/page.tsx
import Image from 'next/image';
import { client, ProfileItem } from '@/libs/microcms';

// microCMS の更新をサイトに反映させるための ISR（再検証）設定。
// 未指定だと build 時に一度だけ生成され、再デプロイするまで内容が固定される。
// 60 秒を過ぎた後の最初のアクセスをきっかけに裏側で再生成し、
// その完了以降のアクセスが新しい内容になる（生成中も古い内容を即座に返す）。
export const revalidate = 60;

async function getProfile(): Promise<ProfileItem | null> {
  try {
    const data = await client.get({ endpoint: 'profile' });
    return data.contents ? data.contents[0] : data;
  } catch (error) {
    console.error('microCMS Fetch Error:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <main className="relative w-full min-h-screen pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      
      {/* PROFILEページ用暗めオーバーレイ */}
      <div className="fixed inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* コンテンツエリア */}
      <section className="relative z-10 w-full min-h-screen pt-[calc(6.5rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] px-6 pb-16 flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col items-center">
          
          {/* PROFILE タイトル */}
          <div className="w-full flex items-center gap-4 mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">PROFILE</h2>
            <div className="grow h-px bg-white/60"></div>
          </div>

          {/* アー写 (ArtistPhoto) エリア */}
          {profile?.ArtistPhoto?.url && (
            <div className="w-full mb-6 md:mb-8 flex justify-center">
              <Image
                src={profile.ArtistPhoto.url}
                alt="Artist Photo"
                width={profile.ArtistPhoto.width || 1200}
                height={profile.ArtistPhoto.height || 800}
                priority
                className="w-full h-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {/* バンド名 (hailrose) エリア */}
          {profile?.hailrose && (
            <div className="w-full mb-8 md:mb-12 flex justify-center">
              <h3 className="text-xl md:text-2xl font-bold tracking-widest text-white">
                {profile.hailrose}
              </h3>
            </div>
          )}

          {/* Biography エリア（枠線を削除） */}
          {profile?.biography && (
            <div className="w-full max-w-3xl text-left">
              <p className="text-base md:text-lg leading-relaxed tracking-wide whitespace-pre-wrap text-neutral-200">
                {profile.biography}
              </p>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}