// Walks the scripted journeys in ../app through its planner and writes them as Storyblok
// content: one folder per journey, one `journey_step` story per screen (seed/journeys.json).
// Only customer-facing content is kept; the demo's presenter/agent layer stays in ../app.
// Run: npm run extract
// Placeholders resolved by seed.ts: { __asset: "/path/in/app/public" } and { __step: <index in journey> }.
import { writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import catalogueJson from '../../app/src/data/catalogue.json' with { type: 'json' };
import { PERSONAS } from '../../app/src/data/personas';
import { next, commit, preview, type Draft } from '../../app/src/engine/planner';
import { addonMonthly, gbp, handset, plansFor, totals } from '../../app/src/engine/pricing';
import type { Answers, Block, Catalogue, Persona, ScreenSpec } from '../../app/src/engine/types';

const cat = catalogueJson as unknown as Catalogue;
const EMPTY: Answers = { addons: [], declined: [] };
type Blok = Record<string, unknown> & { component: string };
const asset = (p?: string) => (p ? { __asset: p } : undefined);
const lines = (xs?: string[]) => (xs ?? []).filter(Boolean).join('\n');
const blok = (component: string, fields: Record<string, unknown>): Blok => {
  const out: Blok = { _uid: randomUUID(), component };
  for (const [k, v] of Object.entries(fields)) if (v !== undefined && v !== null && v !== '') out[k] = v;
  return out;
};
const slugify = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/, '');

// Customer-facing journey names. Help me chat (p7) and the EE-style layout (p8) are behaviours
// on top of the p1 journey, not different content, so they are not seeded.
const JOURNEYS: { persona: Persona['id']; name: string; slug: string }[] = [
  { persona: 'p1', name: 'iPhone 17 · paid social', slug: 'iphone-17-paid-social' },
  { persona: 'p2', name: 'Virgin Media household · Volt', slug: 'virgin-media-household-volt' },
  { persona: 'p3', name: 'Cheapest iPhone · search', slug: 'cheapest-iphone-search' },
  { persona: 'p4', name: 'iPhone 17 · save your basket', slug: 'iphone-17-save-your-basket' },
  { persona: 'p6', name: 'Help me choose', slug: 'help-me-choose' },
  { persona: 'p5', name: 'Upgrade · O2 Recycle trade-in', slug: 'upgrade-o2-recycle' },
];

// The journey is walked with the persona's typical entries, so the recorded steps show realistic choices.
function draftFor(p: Persona, spec: ScreenSpec): Draft {
  const s: Draft = {
    ...p.sample, firstName: p.sample.name.split(' ')[0], holder: p.sample.name, sort: '20-00-00', account: '55779911', password: 'x',
    timeAtAddress: p.credit.timeAtAddress, employment: p.credit.employment, income: p.credit.income,
  };
  const d: Draft = { ...(spec.defaults ?? {}) };
  for (const b of spec.blocks) {
    if (b.kind === 'form') for (const f of b.fields) d[f.id] ??= f.value || s[f.id] || f.options?.[0] || '';
    if ((b.kind === 'choice' || b.kind === 'reco') && !d[b.id]) d[b.id] = (b.options.find(o => o.selected) ?? b.options[0])?.id ?? '';
  }
  return d;
}

function summaryRows(a: Answers): Blok[] {
  const h = handset(cat, a.handset);
  const t = totals(cat, a);
  const plan = plansFor(cat, a).find(x => x.id === a.plan);
  const colour = h?.colours.find(c => c.id === a.colour);
  const del = cat.delivery.find(x => x.id === a.delivery?.option);
  const rows: [string, string, string][] = [];
  if (h) rows.push([`${h.name} ${h.capacities.find(c => c.id === a.capacity)?.label ?? ''}`.trim(), `${colour?.name ?? ''} · Device Plan, ${a.term} months, 0% APR`, gbp(t.device)]);
  if (plan) rows.push([`${plan.data} ${plan.tier}`, plan.term === 1 ? '30-day rolling Airtime Plan' : `Airtime Plan, ${plan.term} months`, gbp(plan.monthly)]);
  for (const ad of cat.addons.filter(x => a.addons.includes(x.id))) { const m = addonMonthly(ad, a); rows.push([ad.name, 'Add-on', m ? gbp(m) : 'Included']); }
  if (a.delivery) rows.push([del?.label ?? 'Delivery', `${a.delivery.keepSim ? 'Keep current SIM and number' : a.delivery.esim ? 'eSIM' : 'Plastic SIM'}`, del?.price ? gbp(del.price) : 'FREE']);
  if (a.tradeIn) rows.push(['O2 Recycle trade-in', 'Paid after we receive and check your old phone', `Up to £${a.tradeIn}`]);
  return [
    ...rows.map(([label, meta, value]) => blok('summary_row', { label, meta, value })),
    blok('summary_row', { label: 'Total monthly', value: gbp(t.monthly), total: true }),
    blok('summary_row', { label: 'Pay today', value: gbp(t.upfront), total: true }),
  ];
}

function toBlok(b: Block, a: Answers, d: Draft): Blok {
  switch (b.kind) {
    case 'hero': {
      const h = handset(cat, b.handset);
      const colour = h?.colours.find(c => c.id === (d.colour ?? a.colour ?? b.colour)) ?? h?.colours[0];
      return blok('hero', {
        title: b.title, subtitle: b.subtitle, image: asset(colour?.image), from_price: b.fromPrice, badges: lines(b.badges),
        rating: h?.rating ? String(h.rating) : undefined, reviews: h?.reviews ? String(h.reviews) : undefined,
        specs: b.specs ? lines(h?.specs?.map(s => `${s.value} | ${s.label}`)) : undefined,
      });
    }
    case 'choice':
      return blok('choice', {
        label: b.label, layout: b.layout, multi: b.multi ? String(b.multi) : undefined, default_option: d[b.id],
        options: b.options.map(o => blok('choice_option', { value: o.id, title: o.title, meta: o.meta, price: o.price, badge: o.badge, swatch: o.swatch, image: asset(o.image) })),
      });
    case 'reco':
      return blok('reco', {
        default_option: d[b.id],
        options: b.options.map(o => blok('reco_option', { value: o.id, title: o.title, meta: o.meta, price: o.price, badge: o.badge, image: asset(o.image), why: lines(o.why) })),
      });
    case 'splash':
      return blok('splash', { title: b.title, body: b.body, points: lines(b.points), images: b.images.map(asset) });
    case 'offer':
      return blok('offer', { title: b.title, body: b.body, bullets: lines(b.bullets), price: b.price, image: asset(b.image), logo: asset(b.logo), legal: b.legal });
    case 'form':
      // Prefilled values only where the customer is already known (e.g. signed in); nothing typed for them.
      return blok('form', {
        fields: b.fields.map(f => blok('form_field', { label: f.label, input_type: f.type ?? 'text', value: f.value, options: lines(f.options), read_only: f.readOnly || undefined })),
      });
    case 'result':
      return blok('result', { tone: b.tone, title: b.title, body: b.body });
    case 'card':
      return blok('info_card', { title: b.title, lines: lines(b.lines), image: asset(b.image), logo: asset(b.logo) });
    case 'summary':
      return blok('order_summary', { image: asset(handset(cat, a.handset)?.colours.find(c => c.id === a.colour)?.image), rows: summaryRows(a) });
    case 'legal':
      return blok('legal', { title: b.title, body: b.body });
    case 'note':
      return blok('note', { body: b.body });
  }
}

function walk(p: Persona) {
  type Rec = { spec: ScreenSpec; answers: Answers; d: Draft; alt?: string };
  const recs: Rec[] = [];
  let a = EMPTY;
  for (let i = 0; i < 40; i++) {
    const { spec, answers } = next(cat, p, a);
    if (!spec) break;
    const d = draftFor(p, spec);
    // Where the secondary button (No thanks / Skip) leads, so its link can point at the right later step.
    const alt = spec.secondary ? next(cat, p, commit(cat, p, answers, spec.id, d, spec.secondary.action)).spec?.id : undefined;
    recs.push({ spec, answers, d, alt });
    a = commit(cat, p, answers, spec.id, d, 'primary');
  }
  return recs.map(({ spec, answers, d, alt }, i) => {
    const live = preview(cat, p, answers, spec.id, d);
    const h = handset(cat, live.handset);
    const t = totals(cat, live);
    const priced = !!h && live.term != null;
    const last = i === recs.length - 1;
    const altIdx = alt ? recs.findIndex((r, j) => j > i && r.spec.id === alt) : -1;
    const title = spec.title || spec.blocks.find(b => b.kind === 'splash')?.title || 'Step';
    return {
      name: `${String(i + 1).padStart(2, '0')} · ${title}`,
      slug: `${String(i + 1).padStart(2, '0')}-${slugify(title)}`,
      content: blok('journey_step', {
        title: spec.title, subtitle: spec.subtitle, stage: spec.stage, secure_checkout: spec.secure || undefined,
        blocks: spec.blocks.map(b => toBlok(b, answers, d)),
        primary_label: spec.primary.label, primary_link: last ? undefined : { __step: i + 1 },
        secondary_label: spec.secondary?.label, secondary_link: spec.secondary && !last ? { __step: altIdx > 0 ? altIdx : i + 1 } : undefined,
        back_link: i > 0 ? { __step: i - 1 } : undefined,
        buttons_in_page: spec.inline || undefined, payment_logos: spec.id === 'S9' || undefined,
        basket_label: h?.name, basket_upfront: priced ? gbp(t.upfront) : undefined, basket_monthly: priced ? gbp(t.monthly) : undefined,
      }),
    };
  });
}

const journeys = JOURNEYS.map(j => ({ name: j.name, slug: j.slug, steps: walk(PERSONAS.find(p => p.id === j.persona)!) }));

mkdirSync(new URL('../seed/', import.meta.url), { recursive: true });
writeFileSync(new URL('../seed/journeys.json', import.meta.url), JSON.stringify({ extracted_at: new Date().toISOString(), catalogue_captured_at: cat.captured_at, journeys }, null, 2));
for (const j of journeys) console.log(`${j.slug.padEnd(30)} ${j.steps.length} steps`);
