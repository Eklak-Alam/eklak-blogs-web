"use client";

import { ReactLenis } from 'lenis/react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrolling({ children }) {
  const pathname = usePathname();

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08, // The lower the number, the smoother/heavier the scroll
        duration: 1.2,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}