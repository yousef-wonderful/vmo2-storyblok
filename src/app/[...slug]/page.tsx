import { renderStory } from '@/lib/story';

// Published content.
export default async function Page({ params }: PageProps<'/[...slug]'>) {
  const { slug } = await params;
  return renderStory(slug, 'published');
}
