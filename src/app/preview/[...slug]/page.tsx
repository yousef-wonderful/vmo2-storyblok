import { renderStory } from '@/lib/story';

// Draft content, for the Storyblok Visual Editor (preview URL: https://localhost:3010/preview/).
// Add ?release=<release id> to see the draft as it will be once that Storyblok Release ships.
export default async function Preview({ params, searchParams }: PageProps<'/preview/[...slug]'>) {
  const { slug } = await params;
  const { release } = await searchParams;
  return renderStory(slug, 'draft', typeof release === 'string' && /^\d+$/.test(release) ? release : undefined);
}
