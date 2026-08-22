import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: getSiteUrl(), lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
