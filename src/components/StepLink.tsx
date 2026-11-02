'use client';
// Links between journey steps. Keeps the route prefix (/preview for the Visual Editor, /local for the offline check).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type SbLink = { cached_url?: string; url?: string; story?: { full_slug?: string } } | undefined;

export function useHref(link: SbLink): string | undefined {
  const path = usePathname();
  const slug = link?.story?.full_slug ?? link?.cached_url ?? '';
  if (!slug) return undefined;
  const prefix = path.startsWith('/preview/') ? '/preview' : path.startsWith('/local/') ? '/local' : '';
  return `${prefix}/${slug.replace(/^\/+/, '')}`;
}

export function StepLink({ link, className, children }: { link: SbLink; className: string; children: ReactNode }) {
  const href = useHref(link);
  return href
    ? <Link className={className} href={href} scroll>{children}</Link>
    : <button type="button" className={className}>{children}</button>;
}
