// O2 in-life app home (page type app_home): My O2 header and cards, Priority rewards, bottom nav.
// Port of inlife/amber-home.html; styles in src/styles/inlife.css, all under .ia.
import type { ReactNode } from 'react';
import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { lines, src, type Blok } from '@/lib/fields';
import { Greeting, PriorityTabs } from './AppHomeClient';

const ed = (b: Blok) => storyblokEditable(b) as Record<string, string>;
const CARDS = new Set(['bill_card', 'plan_card', 'usage_card']);

const Chevron = ({ stroke = 'currentColor', className }: { stroke?: string; className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
);

export default function AppHome({ blok }: { blok: Blok }) {
  const blocks: Blok[] = blok.blocks ?? [];
  const nav: Blok[] = blok.nav ?? [];
  // Consecutive bill/plan/usage cards share one grid (2 columns from 48em; usage spans both).
  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    if (CARDS.has(blocks[i].component)) {
      const group: Blok[] = [];
      while (i < blocks.length && CARDS.has(blocks[i].component)) group.push(blocks[i++]);
      i--;
      out.push(<div key={group[0]._uid} className="ia-col"><div className="ia-stack">{group.map(b => <StoryblokServerComponent key={b._uid} blok={b} />)}</div></div>);
    } else out.push(<StoryblokServerComponent key={blocks[i]._uid} blok={blocks[i]} />);
  }
  return (
    <div className="ia" {...ed(blok)}>
      {out}
      {nav.length > 0 && <nav className="ia-nav" aria-label="Main"><ul>{nav.map(t => <StoryblokServerComponent key={t._uid} blok={t} />)}</ul></nav>}
    </div>
  );
}

export function AppHeader({ blok }: { blok: Blok }) {
  const notify = !!blok.notifications;
  return (
    <header className="ia-hdr" {...ed(blok)}>
      <div className="ia-col">
        <div className="ia-hdr-top">
          <img src={src(blok.logo) ?? '/brand/logo.svg'} alt="O2" />
          <button type="button" className="ia-icon-btn" aria-label={notify ? 'Notifications (1 new)' : 'Notifications'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            {notify && <span className="ia-dot" />}
          </button>
        </div>
        <Greeting mode={blok.greeting} name={blok.name} />
        {(blok.number || blok.plan_line) && (
          <div className="ia-who">
            {blok.number && <span>{blok.number}</span>}
            {blok.number && blok.plan_line && <span className="ia-sep">•</span>}
            {blok.plan_line && <span>{blok.plan_line}</span>}
          </div>
        )}
      </div>
    </header>
  );
}

export function BillCard({ blok }: { blok: Blok }) {
  return (
    <article className="ia-card" {...ed(blok)}>
      <div className="ia-row"><span className="ia-amt">{blok.amount}</span>{blok.status && <span className={`ia-pill${blok.tone === 'due' ? ' ia-due' : ''}`}><i />{blok.status}</span>}</div>
      <div className="ia-row" style={{ marginTop: 6 }}><span className="ia-muted ia-b">{blok.date_label}</span><span className="ia-muted">{blok.date}</span></div>
      {blok.link_label && <div style={{ marginTop: 14 }}><a href="#">{blok.link_label}</a></div>}
    </article>
  );
}

export function PlanCard({ blok }: { blok: Blok }) {
  return (
    <article className="ia-card" {...ed(blok)}>
      <a className="ia-plan" href="#">
        <span className="ia-plan-ico"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><rect x="8.5" y="11" width="7" height="7" rx="1" /></svg></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="ia-small ia-b" style={{ display: 'block' }}>{blok.label}</span>
          <span className="ia-num" style={{ display: 'block' }}>{blok.number}</span>
          <span className="ia-small" style={{ display: 'block', color: 'var(--ia-ink-2)' }}>{blok.description}</span>
        </span>
        <Chevron className="ia-chev" />
      </a>
      {(blok.footer_label || blok.footer_value) && <>
        <div className="ia-hr" />
        <div className="ia-row"><span className="ia-muted">{blok.footer_label}</span><span className="ia-muted ia-b">{blok.footer_value}</span></div>
      </>}
    </article>
  );
}

const ARC = 'M12 66a48 48 0 0 1 96 0';

export function UsageCard({ blok }: { blok: Blok }) {
  const pct = Math.max(0, Math.min(100, Number(blok.data_percent) || 0));
  return (
    <article className="ia-card ia-span" {...ed(blok)}>
      <div className="ia-row">
        <span><span className="ia-small ia-muted">{blok.label}</span><br /><span className="ia-b" style={{ fontSize: 18 }}>{blok.number}</span></span>
        <Chevron className="ia-chev" />
      </div>
      <div className="ia-usage">
        <div className="ia-dial">
          <svg viewBox="0 0 120 72"><path d={ARC} fill="none" stroke="#D0D0D8" strokeWidth="10" strokeLinecap="round" />{pct > 0 && <path d={ARC} fill="none" stroke="#0050FF" strokeWidth="10" strokeLinecap="round" pathLength={100} strokeDasharray={`${pct} 100`} />}</svg>
          <div className="ia-v">{blok.data_left}</div><div className="ia-u">{blok.data_unit || ' '}</div>
          <div className="ia-t">Data</div><div className="ia-u">{blok.data_total || ' '}</div>
        </div>
        <div className="ia-dial">
          <svg viewBox="0 0 120 72"><path d={ARC} fill="none" stroke="#5FB4F5" strokeWidth="10" strokeLinecap="round" /></svg>
          <div className="ia-v">∞</div><div className="ia-u">&nbsp;</div>
          <div className="ia-t">{blok.minutes_title}</div><div className="ia-u">{blok.minutes_value || ' '}</div>
        </div>
      </div>
    </article>
  );
}

export function PrioritySection({ blok }: { blok: Blok }) {
  const cards: Blok[] = blok.cards ?? [];
  const banner: Blok[] = blok.banner ?? [];
  const id = `ia-pr-${blok._uid}`;
  return (
    <section className="ia-pr" aria-labelledby={id} {...ed(blok)}>
      <div className="ia-col">
        <div className="ia-pr-head">
          <div><div className="ia-wordmark">{blok.wordmark || 'PRIORITY'}</div><h2 id={id}>{blok.title}</h2></div>
          {blok.link_label && <a href="#">{blok.link_label}</a>}
        </div>
        <PriorityTabs tabs={lines(blok.tabs)} />
        {cards.length > 0 && <div className="ia-rail">{cards.map(c => <StoryblokServerComponent key={c._uid} blok={c} />)}</div>}
        {banner.map(b => <StoryblokServerComponent key={b._uid} blok={b} />)}
      </div>
    </section>
  );
}

export function PriorityCard({ blok }: { blok: Blok }) {
  const pos = (blok.image_position ?? '').trim();
  return (
    <article className="ia-pcard" {...ed(blok)}>
      <div className="ia-img">{src(blok.image) && <img src={src(blok.image)} alt="" style={pos ? { objectPosition: pos } : undefined} />}</div>
      <div className="ia-body">
        {blok.kicker && <div className="ia-kicker">{blok.kicker}</div>}
        <h3>{blok.title}</h3>
        {blok.body && <p>{blok.body}</p>}
      </div>
    </article>
  );
}

export function PriorityBanner({ blok }: { blok: Blok }) {
  return (
    <div className="ia-monday" {...ed(blok)}>
      <div><div className="ia-t1">{blok.highlight && <span>{blok.highlight}</span>}{blok.highlight && blok.title ? ' ' : ''}{blok.title}</div>{blok.body && <p>{blok.body}</p>}</div>
      <Chevron stroke="#fff" />
    </div>
  );
}

const NAV_ICONS: Record<string, ReactNode> = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2.5 11h2.5v9h5v-6h4v6h5v-9h2.5z" /></svg>,
  offers: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" /></svg>,
  tickets: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"><path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 1 0-4V6H3z" transform="rotate(-30 12 12)" /></svg>,
  help: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><circle cx="12" cy="17.4" r=".6" fill="currentColor" /></svg>,
  account: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
};

export function AppNavTab({ blok }: { blok: Blok }) {
  return (
    <li {...ed(blok)}>
      <button type="button" className="ia-tab" aria-current={blok.active ? 'page' : undefined}>
        <span className="ia-ic">{NAV_ICONS[blok.icon] ?? NAV_ICONS.home}</span>{blok.label}
      </button>
    </li>
  );
}
