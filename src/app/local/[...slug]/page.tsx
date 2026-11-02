import { readFile } from 'node:fs/promises';
import { notFound } from 'next/navigation';
import { StoryblokServerComponent } from '@storyblok/react/rsc';
import '@/lib/storyblok';

// Offline check: renders seed/journeys.json through the same components, without Storyblok.
// e.g. /local/journeys/iphone-17-paid-social/01-iphone-17
type Step = { slug: string; content: unknown };
const swap = (n: unknown, j: string, steps: Step[]): unknown => Array.isArray(n) ? n.map(x => swap(x, j, steps)) : n && typeof n === 'object'
  ? '__asset' in n ? { filename: `/local-assets${(n as { __asset: string }).__asset}` }
  : '__step' in n ? { cached_url: `journeys/${j}/${steps[(n as { __step: number }).__step]?.slug}` }
  : Object.fromEntries(Object.entries(n).map(([k, v]) => [k, swap(v, j, steps)]))
  : n;

export default async function Local({ params }: PageProps<'/local/[...slug]'>) {
  const [, j, step] = (await params).slug;
  const { journeys } = JSON.parse(await readFile(`${process.cwd()}/seed/journeys.json`, 'utf8'));
  const steps: Step[] | undefined = journeys.find((x: { slug: string }) => x.slug === j)?.steps;
  const s = steps?.find(x => x.slug === step) ?? (step ? undefined : steps?.[0]);
  if (!steps || !s) notFound();
  return <StoryblokServerComponent blok={swap(s.content, j, steps) as never} />;
}
