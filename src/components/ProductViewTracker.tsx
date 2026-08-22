'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { trackProductView } from '@/lib/analytics';

/** How much of the block counts as "seen", and how long it has to stay there. */
const SEEN_RATIO = 0.5;
const DWELL_MS = 500;

/**
 * A block taller than the screen can never be 50% visible, so visibility is
 * measured against the smaller of the block and the viewport.
 */
function seenRatio(rect: DOMRect): number {
  const reference = Math.min(rect.height, window.innerHeight);
  if (reference <= 0) return 0;
  const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return Math.max(0, visible) / reference;
}

/**
 * Fires `product_view` (and Meta ViewContent) the first time the product block
 * is meaningfully on screen — held there for a moment, not scrolled straight past.
 */
export default function ProductViewTracker({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;

    const clear = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    };

    const fire = () => {
      done = true;
      clear();
      trackProductView();
    };

    const evaluate = (rect: DOMRect) => {
      if (done) return;
      if (seenRatio(rect) >= SEEN_RATIO) {
        if (!timer) timer = setTimeout(fire, DWELL_MS);
      } else {
        clear();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      trackProductView();
      return;
    }

    // Covers the case where the block is already on screen when the page loads.
    evaluate(node.getBoundingClientRect());

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) evaluate(entry.boundingClientRect);
        if (done) observer.disconnect();
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(node);

    return () => {
      clear();
      observer.disconnect();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
