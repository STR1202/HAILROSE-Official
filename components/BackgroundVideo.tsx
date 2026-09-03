// components/BackgroundVideo.tsx
'use client';

import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * PC 幅でのみ背景動画をマウントする。
 *
 * CSS の hidden / md:block で切り替えると <video> が DOM に残り続け、
 * 非表示でもブラウザが bg-video.mp4（8.5MB）の読み込みを始めてしまう。
 * モバイル回線でこれを流さないため、要素そのものを出し分ける。
 * SSR 時は常に null なので、スマホでは一度も DOM に現れない。
 */
export default function BackgroundVideo() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setIsDesktop(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
