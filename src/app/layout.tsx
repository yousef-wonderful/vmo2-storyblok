import type { Metadata } from 'next';
import '../styles/o2-brand.css';
import '../styles/o2-tokens.css';
import '../styles/styles.css';
import '../styles/storyblok.css';

export const metadata: Metadata = { title: 'O2 buying layer · Storyblok', description: 'O2 journeys composed from Storyblok components' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return <html lang="en-GB"><body>{children}</body></html>;
}
