import { readFile } from 'node:fs/promises';
import { extname, normalize } from 'node:path';

// Serves ../app/public images for the offline /local check only.
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const ROOT = normalize(`${process.cwd()}/../app/public/`);

export async function GET(_: Request, { params }: RouteContext<'/local-assets/[...path]'>) {
  const { path } = await params;
  const file = normalize(`${ROOT}${path.join('/')}`);
  if (!file.startsWith(ROOT)) return new Response('Not found', { status: 404 });
  try { return new Response(await readFile(file), { headers: { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' } }); }
  catch { return new Response('Not found', { status: 404 }); }
}
