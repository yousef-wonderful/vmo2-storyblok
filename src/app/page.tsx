export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { configured } from '@/lib/storyblok';
import { listJourneys } from '@/lib/story';
import { Setup } from '@/components/Setup';

// Plain index of the journeys in the space. Not part of any Storyblok page.
export default async function Home() {
  if (!configured()) return <Setup />;
  const journeys = await listJourneys('draft');
  return (
    <div className="sb-index">
      <h1>O2 journeys <em>from Storyblok</em></h1>
      {journeys.length === 0 && <p>No journeys in the space yet. Run <code>npm run seed</code>.</p>}
      <ul>
        {journeys.map(j => (
          <li key={j.first}>
            <Link href={`/preview/${j.first}`}><strong>{j.name}</strong> <span>{j.count} steps</span></Link>
            <Link className="pub" href={`/${j.first}`}>published</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
