// Seeds the Storyblok space through the Management API:
//   1. component folders + components (upsert by name, from seed/components.ts)
//   2. images used by the journeys (uploaded once, cached in seed/.asset-map.<space>.json)
//   3. a `journeys` folder, a subfolder per journey and one published `journey_step` story per step,
//      with the buttons linked to the right steps (upsert by slug, from seed/journeys.json)
//   4. the space's Visual Editor preview URL (STORYBLOK_PREVIEW_URL)
//   5. asset libraries (seed/inlife.json `library`): every image in a folder, into a named Storyblok asset folder
// seed/inlife.json adds hand-written journeys (own page type and asset folder) next to the extracted ones.
// Usage: npm run seed              (everything)
//        npm run seed -- --dry      (print what would happen, no writes)
//        npm run seed -- --prune    (also delete stale stories under journeys/ and components/folders from earlier seeds)
//        npm run seed -- --only=components|assets|stories|library|preview-url
//        npm run seed -- --journey=o2-in-life-app   (assets and stories for that journey only; never touches the others, no prune)
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { COMPONENTS } from '../seed/components';

const root = new URL('../', import.meta.url);
if (existsSync(new URL('.env.local', root))) process.loadEnvFile(new URL('.env.local', root).pathname);

const env = (k: string) => {
  const v = process.env[k]?.trim();
  if (!v) { console.error(`Missing ${k} in .env.local`); process.exit(1); }
  return v;
};
const REGION = (process.env.STORYBLOK_REGION || 'eu').trim().toLowerCase();
const BASE: Record<string, string> = {
  eu: 'https://mapi.storyblok.com/v1', us: 'https://api-us.storyblok.com/v1', ca: 'https://api-ca.storyblok.com/v1',
  ap: 'https://api-ap.storyblok.com/v1', cn: 'https://app.storyblokchina.cn/v1',
};
if (!BASE[REGION]) { console.error(`STORYBLOK_REGION must be one of ${Object.keys(BASE).join(', ')}`); process.exit(1); }
const PAT = env('STORYBLOK_PERSONAL_ACCESS_TOKEN');
const SPACE = env('STORYBLOK_SPACE_ID');
const DRY = process.argv.includes('--dry');
const PRUNE = process.argv.includes('--prune');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.slice(7);
const step = (s: string) => !ONLY || ONLY === s;
const JOURNEY = process.argv.find(a => a.startsWith('--journey='))?.slice(10);
if (JOURNEY && PRUNE) { console.error('--prune cannot be combined with --journey'); process.exit(1); }
const APP_PUBLIC = new URL('../../app/public', import.meta.url).pathname;
// Assets that only this project uses (in-life journey, libraries); checked before ../app/public.
const SEED_ASSETS = new URL('../seed/assets', import.meta.url).pathname;

// Trial / Growth plans allow 6 requests per second; stay under it and back off on 429.
let last = 0;
async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const wait = last + 200 - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    last = Date.now();
    const res = await fetch(`${BASE[REGION]}/spaces/${SPACE}/${path}`, {
      method, headers: { Authorization: PAT, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 && attempt < 6) { await new Promise(r => setTimeout(r, 1000 * 2 ** attempt)); continue; }
    const txt = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 500)}`);
    return (txt ? JSON.parse(txt) : {}) as T;
  }
}

async function components() {
  const { component_groups: groups = [] } = await api<{ component_groups: { name: string; uuid: string }[] }>('GET', 'component_groups/');
  const folder: Record<string, string> = {};
  for (const name of new Set(COMPONENTS.map(c => c.folder))) {
    const found = groups.find(g => g.name === name);
    if (found) { folder[name] = found.uuid; continue; }
    console.log(`  + folder ${name}`);
    if (!DRY) folder[name] = (await api('POST', 'component_groups/', { component_group: { name } })).component_group.uuid;
  }
  const { components: existing = [] } = await api<{ components: { id: number; name: string }[] }>('GET', 'components/');
  for (const c of COMPONENTS) {
    const schema = Object.fromEntries(Object.entries(c.schema).map(([k, f], pos) => [k, { pos, ...f }]));
    const component = {
      name: c.name, display_name: c.display_name, is_root: !!c.is_root, is_nestable: c.is_nestable ?? !c.is_root,
      preview_field: c.preview_field, icon: c.icon, color: c.color, component_group_uuid: folder[c.folder], schema,
    };
    const found = existing.find(x => x.name === c.name);
    console.log(`  ${found ? '~' : '+'} component ${c.name}`);
    if (DRY) continue;
    if (found) await api('PUT', `components/${found.id}`, { component });
    else await api('POST', 'components/', { component });
  }
}

type AssetRef = { id: number; filename: string };
const mapFile = new URL(`../seed/.asset-map.${SPACE}.json`, import.meta.url);
const assetMap: Record<string, AssetRef> = existsSync(mapFile) ? JSON.parse(readFileSync(mapFile, 'utf8')) : {};
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' };

const seen = new Set<string>();
const folderIds: Record<string, number> = {};
async function assetFolder(name?: string): Promise<number | undefined> {
  if (!name) return undefined;
  if (folderIds[name] !== undefined) return folderIds[name];
  const { asset_folders: all = [] } = await api<{ asset_folders: { id: number; name: string; parent_id: number | null }[] }>('GET', 'asset_folders/');
  const found = all.find(f => f.name === name && !f.parent_id);
  if (found) return (folderIds[name] = found.id);
  console.log(`  + asset folder ${name}`);
  if (DRY) return (folderIds[name] = 0);
  return (folderIds[name] = (await api('POST', 'asset_folders/', { asset_folder: { name } })).asset_folder.id);
}

async function upload(local: string, folderName?: string): Promise<AssetRef> {
  if (assetMap[local]) return assetMap[local];
  if (DRY && seen.has(local)) return { id: 0, filename: local };
  seen.add(local);
  const file = existsSync(`${SEED_ASSETS}${local}`) ? `${SEED_ASSETS}${local}` : `${APP_PUBLIC}${local}`;
  const asset_folder_id = await assetFolder(folderName);
  console.log(`  + asset ${local}${folderName ? ` → ${folderName}` : ''}`);
  if (DRY) return { id: 0, filename: local };
  const signed = await api('POST', 'assets/', { filename: basename(file), validate_upload: 1, ...(asset_folder_id ? { asset_folder_id } : {}) });
  const form = new FormData();
  for (const [k, v] of Object.entries(signed.fields as Record<string, string>)) form.append(k, v);
  form.append('file', new Blob([readFileSync(file)], { type: MIME[extname(file).toLowerCase()] ?? 'application/octet-stream' }), basename(file));
  const s3 = await fetch(signed.post_url, { method: 'POST', body: form });
  if (!s3.ok) throw new Error(`S3 upload ${local} → ${s3.status}: ${(await s3.text()).slice(0, 300)}`);
  await api('GET', `assets/${signed.id}/finish_upload`);
  const url = String(signed.pretty_url ?? signed.public_url ?? '');
  const ref = { id: Number(signed.id), filename: url.startsWith('//') ? `https:${url}` : url };
  assetMap[local] = ref;
  writeFileSync(mapFile, JSON.stringify(assetMap, null, 2));
  return ref;
}

// Replaces { __asset: path } placeholders with Storyblok asset objects (uploading on first use).
async function resolveAssets(node: unknown, upload_: boolean, folderName?: string): Promise<unknown> {
  if (Array.isArray(node)) { const out = []; for (const n of node) out.push(await resolveAssets(n, upload_, folderName)); return out; }
  if (!node || typeof node !== 'object') return node;
  const o = node as Record<string, unknown>;
  if (typeof o.__asset === 'string') {
    const ref = upload_ ? await upload(o.__asset, folderName) : assetMap[o.__asset];
    if (!ref) throw new Error(`Asset ${o.__asset} not uploaded yet: run npm run seed -- --only=assets`);
    return { id: ref.id, filename: ref.filename, fieldtype: 'asset', alt: '', name: '', title: '', focus: '', copyright: '', is_external_url: false };
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = await resolveAssets(v, upload_, folderName);
  return out;
}

type Step = { name: string; slug: string; content: Record<string, unknown> };
type Journey = { name: string; slug: string; steps: Step[]; root?: string; asset_folder?: string };
const inlife = JSON.parse(readFileSync(new URL('../seed/inlife.json', import.meta.url), 'utf8')) as { journeys: Journey[]; library?: { asset_folder: string; dir: string }[] };
const journeys: Journey[] = [
  ...JSON.parse(readFileSync(new URL('../seed/journeys.json', import.meta.url), 'utf8')).journeys,
  ...inlife.journeys,
].filter(j => !JOURNEY || j.slug === JOURNEY);
if (JOURNEY && !journeys.length) { console.error(`No journey with slug ${JOURNEY}`); process.exit(1); }

async function assets() {
  for (const j of journeys) for (const st of j.steps) await resolveAssets(st.content, true, j.asset_folder);
}

const IMAGE = /\.(png|jpe?g|webp|svg|gif)$/i;
async function library() {
  for (const lib of inlife.library ?? []) {
    const dir = `${SEED_ASSETS}${lib.dir}`;
    const files = existsSync(dir) ? readdirSync(dir).filter(f => IMAGE.test(f)).sort() : [];
    console.log(`  ~ ${lib.asset_folder} · ${files.length} images`);
    for (const f of files) await upload(`${lib.dir}/${f}`, lib.asset_folder);
  }
}

type Ref = { id: number; uuid: string; full_slug: string };
// Replaces { __step: n } with a story link to step n of the same journey (empty on the first pass).
function resolveLinks(node: unknown, refs: Ref[] | null): unknown {
  if (Array.isArray(node)) return node.map(n => resolveLinks(n, refs));
  if (!node || typeof node !== 'object') return node;
  const o = node as Record<string, unknown>;
  if (typeof o.__step === 'number') {
    const r = refs?.[o.__step];
    return { id: r?.uuid ?? '', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: r?.full_slug ?? '' };
  }
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, resolveLinks(v, refs)]));
}

async function find(full_slug: string): Promise<Ref | undefined> {
  const { stories = [] } = await api('GET', `stories/?with_slug=${encodeURIComponent(full_slug)}`);
  return stories[0];
}

async function folder(name: string, slug: string, parent_id?: number, default_root = 'journey_step'): Promise<number> {
  const full = parent_id ? `journeys/${slug}` : slug;
  const found = await find(full);
  if (found) return found.id;
  console.log(`  + folder ${full}`);
  if (DRY) return 0;
  return (await api('POST', 'stories/', { story: { name, slug, is_folder: true, parent_id, default_root } })).story.id;
}

async function upsert(story: Record<string, unknown>, full_slug: string, publish: boolean): Promise<Ref> {
  const found = await find(full_slug);
  if (DRY) return { id: 0, uuid: '', full_slug };
  const body = { story, ...(publish ? { publish: 1 } : {}), force_update: 1 };
  const res = found ? await api('PUT', `stories/${found.id}`, body) : await api('POST', 'stories/', body);
  return { id: res.story.id, uuid: res.story.uuid, full_slug: res.story.full_slug };
}

async function stories() {
  const root = await folder('Journeys', 'journeys');
  const keep = new Set<string>(['journeys']);
  for (const j of journeys) {
    const parent = await folder(j.name, j.slug, root, j.root);
    keep.add(`journeys/${j.slug}`);
    console.log(`  ~ journeys/${j.slug} · ${j.steps.length} steps`);
    // Pass 1 creates every step so later steps exist; pass 2 adds the button links and publishes.
    const refs: Ref[] = [];
    for (const st of j.steps) {
      const full = `journeys/${j.slug}/${st.slug}`;
      keep.add(full);
      const content = resolveLinks(DRY ? st.content : await resolveAssets(st.content, false), null);
      refs.push(await upsert({ name: st.name, slug: st.slug, parent_id: parent, content }, full, false));
    }
    if (DRY) continue;
    for (const [i, st] of j.steps.entries()) {
      const content = resolveLinks(await resolveAssets(st.content, false), refs);
      await api('PUT', `stories/${refs[i].id}`, { story: { name: st.name, slug: st.slug, parent_id: parent, content }, publish: 1, force_update: 1 });
    }
  }
  if (!PRUNE) return;
  const { stories: all = [] } = await api('GET', 'stories/?starts_with=journeys&per_page=100');
  const stale = (all as (Ref & { is_folder: boolean })[]).filter(s => !keep.has(s.full_slug.replace(/\/$/, '')));
  // Stories first, then folders, deepest first.
  stale.sort((a, b) => Number(a.is_folder) - Number(b.is_folder) || b.full_slug.split('/').length - a.full_slug.split('/').length);
  for (const s of stale) {
    console.log(`  - ${s.is_folder ? 'folder' : 'story'} ${s.full_slug}`);
    if (!DRY) await api('DELETE', `stories/${s.id}`);
  }
}

// Only components and folders this seed created in earlier versions; never the space's own components.
const OBSOLETE = { components: ['journey', 'screen'], folders: ['Journey'] };

async function pruneComponents() {
  const { components: existing = [] } = await api<{ components: { id: number; name: string }[] }>('GET', 'components/');
  for (const c of existing.filter(x => OBSOLETE.components.includes(x.name))) {
    console.log(`  - component ${c.name}`);
    if (!DRY) await api('DELETE', `components/${c.id}`);
  }
  const { component_groups: groups = [] } = await api<{ component_groups: { id: number; name: string }[] }>('GET', 'component_groups/');
  for (const g of groups.filter(x => OBSOLETE.folders.includes(x.name))) {
    console.log(`  - component folder ${g.name}`);
    if (!DRY) await api('DELETE', `component_groups/${g.id}`);
  }
}

async function previewUrl() {
  const url = process.env.STORYBLOK_PREVIEW_URL?.trim() || 'https://localhost:3010/preview/';
  console.log(`  ~ space preview URL → ${url}`);
  if (DRY) return;
  const res = await fetch(`${BASE[REGION]}/spaces/${SPACE}`, {
    method: 'PUT', headers: { Authorization: PAT, 'Content-Type': 'application/json' }, body: JSON.stringify({ space: { domain: url } }),
  });
  if (!res.ok) console.warn(`  ! could not set the preview URL (${res.status}); set it in Settings → Visual Editor instead`);
}

(async () => {
  console.log(`Storyblok space ${SPACE} (${REGION})${DRY ? ' · dry run' : ''}`);
  if (step('components')) { console.log('Components'); await components(); }
  if (step('assets')) { console.log('Assets'); await assets(); }
  if (step('stories')) { console.log('Stories'); await stories(); }
  if (step('library')) { console.log('Library'); await library(); }
  if (PRUNE && step('components')) { console.log('Prune components'); await pruneComponents(); }
  if (step('preview-url')) { console.log('Visual Editor'); await previewUrl(); }
  console.log('Done.');
})().catch(e => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
