'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/utm';
import { trackPageView } from '@/lib/analytics';

/**
 * Runs once per page load: stores campaign attribution for the session and
 * records the internal `page_view` event. Meta's PageView is fired by the
 * pixel's own base snippet.
 */
export default function PageAnalytics() {
  useEffect(() => {
    captureAttribution();
    trackPageView();
  }, []);

  return null;
}
