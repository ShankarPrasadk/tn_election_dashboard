import { useEffect, useRef } from 'react';

/**
 * Google AdSense responsive ad unit.
 * Replace data-ad-client and data-ad-slot with your AdSense values.
 *
 * Variants:
 *  - "banner"    : horizontal banner between sections (leaderboard 728x90)
 *  - "sidebar"   : vertical sidebar ad (300x250 / 160x600)
 *  - "in-feed"   : in-feed native ad within card grids
 */
export default function AdBanner({ variant = 'banner', className = '' }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded (ad-blocker or script not yet ready)
    }
  }, []);

  const variantStyles = {
    banner: 'w-full min-h-[90px] my-6',
    sidebar: 'w-full min-h-[250px] my-4',
    'in-feed': 'w-full min-h-[100px] my-4',
  };

  return (
    <div className={`${variantStyles[variant] || variantStyles.banner} flex items-center justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
