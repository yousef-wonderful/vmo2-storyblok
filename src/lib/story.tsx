import { notFound } from 'next/navigation';
import { StoryblokStory } from '@storyblok/react/rsc';
import { configured, getStoryblokApi } from './storyblok';
import { Setup } from '@/components/Setup';

export type Version = 'draft' | 'published';

// release: a Storyblok Release ID; draft content is read as it will be once that release ships.
export async function renderStory(slug: string[], version: Version, release?: string) {
  if (!configured()) return <Setup />;
  try {
    const { data } = await getStoryblokApi().get(`cdn/stories/${slug.join('/')}`, { version, ...(release ? { from_release: release } : {}) }, { cache: 'no-store' });
    return <StoryblokStory story={data.story} />;
  } catch (e) {
    if ((e as { status?: number })?.status === 404) notFound();
    throw e;
  }
}

// Journeys are folders under journeys/; each one starts at its first step (slugs are numbered).
export async function listJourneys(version: Version) {
  const api = getStoryblokApi();
  const { data: links } = await api.get('cdn/links', { version, starts_with: 'journeys/', per_page: 1000 }, { cache: 'no-store' });
  const all = Object.values(links.links as Record<string, { slug: string; name: string; is_folder: boolean; parent_id: number; id: number }>);
  return all.filter(l => l.is_folder && l.slug.split('/').length === 2)
    .map(f => ({ name: f.name, steps: all.filter(l => !l.is_folder && l.parent_id === f.id).sort((a, b) => a.slug.localeCompare(b.slug)) }))
    .filter(j => j.steps.length)
    .map(j => ({ name: j.name, first: j.steps[0].slug, count: j.steps.length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
