'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

/**
 * Very mild entrance transition: a short fade and 12px rise, once, on first
 * intersection. The hidden state is defined only inside a
 * `prefers-reduced-motion: no-preference` media query, so readers who ask for
 * less motion — and anyone without JavaScript — simply see the content.
 *
 * Content must never be able to get stuck invisible, so there are three ways in:
 * anything already on screen at mount is shown immediately, an IntersectionObserver
 * handles the rest, and a health check reveals the element anyway if the observer
 * never reports (it always reports its initial state in a working browser).
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    // Already in view (or scrolled past): show it now, don't wait for a callback.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.95) {
      setVisible(true);
      return;
    }

    let reported = false;
    const observer = new IntersectionObserver(
      (entries) => {
        reported = true;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(node);

    const healthCheck = setTimeout(() => {
      if (!reported) setVisible(true);
    }, 1500);

    return () => {
      clearTimeout(healthCheck);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-visible={visible ? 'true' : 'false'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
