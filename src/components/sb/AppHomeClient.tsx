'use client';
// Client parts of the O2 in-life app home (app_home): greeting by time of day, Priority tabs, and the offer slot + bottom sheet.
import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { src, type Blok } from '@/lib/fields';

const ed = (b: Blok) => storyblokEditable(b) as Record<string, string>;

// Server renders "Hello"; the time-of-day greeting is set after hydration (as the static page does) to avoid a mismatch.
export function Greeting({ mode, name }: { mode?: string; name?: string }) {
  const [hello, setHello] = useState('Hello');
  useEffect(() => {
    if (mode === 'hello') { setHello('Hello'); return; }
    const h = new Date().getHours();
    setHello(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, [mode]);
  return <h1 className="ia-greet">{name ? `${hello}, ${name}` : hello}</h1>;
}

// Priority tabs: visual only.
export function PriorityTabs({ tabs }: { tabs: string[] }) {
  const [at, setAt] = useState(0);
  if (!tabs.length) return null;
  return (
    <div className="ia-tabs" role="tablist">
      {tabs.map((t, i) => <button key={t + i} type="button" className="ia-chip" role="tab" aria-selected={i === at} onClick={() => setAt(i)}>{t}</button>)}
    </div>
  );
}

type Creative = { headline?: string; sheet?: string };
type Reason = 'close' | 'not-now' | 'backdrop' | 'escape' | 'swipe' | 'api';
declare global {
  interface Window { InlifeOffer?: { open: () => void; close: (reason?: string) => void; setCreative: (c: string | Creative) => void } }
}

const isUrl = (v: string) => /^(https?:|\/|\.|assets\/)/.test(v);
const emit = (name: string, detail: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

function SlotContent({ value, url, alt }: { value?: string; url?: string; alt: string }) {
  if (value) return isUrl(value) ? <img src={value} alt="" /> : <div dangerouslySetInnerHTML={{ __html: value }} />;
  return url ? <img src={url} alt={alt} /> : null;
}

// Headline offer slot (inline, where the blok sits) + the same offer as a bottom sheet that opens on load.
export function OfferSlot({ blok }: { blok: Blok }) {
  const headlineUrl = src(blok.headline_creative);
  const sheetUrl = src(blok.sheet_creative) ?? headlineUrl;
  const alt: string = blok.alt ?? '';
  const [override, setOverride] = useState<Creative>({});
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const sheetRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const drag = useRef<{ y0: number | null; dy: number }>({ y0: null, dy: 0 });

  const doOpen = useCallback(() => {
    lastFocus.current = document.activeElement;
    openRef.current = true;
    setOpen(true);
    setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    emit('offer:shown', { slot: 'sheet' });
  }, []);

  const doClose = useCallback((reason: Reason | string) => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    if (sheetRef.current) sheetRef.current.style.transform = '';
    (lastFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    emit('offer:dismissed', { reason });
  }, []);

  // Scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') doClose('escape'); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [doClose]);

  // Public hook for whatever drives the offer later.
  useEffect(() => {
    const api = {
      open: doOpen,
      close: (reason?: string) => doClose(reason ?? 'api'),
      setCreative(c: string | Creative) {
        const v: Creative = typeof c === 'string' ? { headline: c, sheet: c } : (c || {});
        setOverride(p => ({ headline: v.headline || p.headline, sheet: v.sheet || p.sheet }));
      },
    };
    window.InlifeOffer = api;
    return () => { if (window.InlifeOffer === api) delete window.InlifeOffer; };
  }, [doOpen, doClose]);

  // Open on load (after the window load event + delay). ?sheet=off suppresses it.
  useEffect(() => {
    if (!blok.open_on_load) return;
    if (new URLSearchParams(location.search).get('sheet') === 'off') return;
    const ms = Number(blok.delay_ms);
    const delay = Number.isFinite(ms) && String(blok.delay_ms ?? '').trim() !== '' ? ms : 700;
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = () => { t = setTimeout(doOpen, delay); };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
    return () => { window.removeEventListener('load', go); if (t) clearTimeout(t); };
  }, [blok.open_on_load, blok.delay_ms, doOpen]);

  // Drag down to dismiss.
  const onDown = (e: RPointerEvent<HTMLElement>) => {
    const el = sheetRef.current;
    if (!el || el.scrollTop > 0 || (e.target as Element).closest('button')) return;
    drag.current = { y0: e.clientY, dy: 0 };
    el.classList.add('ia-dragging');
    el.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current, el = sheetRef.current;
    if (d.y0 === null || !el) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    el.style.transform = `translateY(${d.dy}px)`;
  };
  const onEnd = () => {
    const d = drag.current, el = sheetRef.current;
    if (d.y0 === null || !el) return;
    el.classList.remove('ia-dragging');
    d.y0 = null;
    if (d.dy > 120) doClose('swipe'); else el.style.transform = '';
  };

  const hasHeadline = !!(override.headline || headlineUrl);
  const hasSheet = !!(override.sheet || sheetUrl);
  return (
    <div className="ia-col" {...ed(blok)}>
      <section className={`ia-slot ia-slot-hero${hasHeadline ? ' ia-has-creative' : ''}`} data-slot="headline"
        data-label={blok.headline_placeholder || 'Offer slot · headline'} aria-label="Offer for you" onClick={doOpen}>
        <SlotContent value={override.headline} url={headlineUrl} alt={alt} />
      </section>

      <div className={`ia-scrim${open ? ' ia-open' : ''}`} onClick={() => doClose('backdrop')} />
      <section ref={sheetRef} className={`ia-sheet${open ? ' ia-open' : ''}`} role="dialog" aria-modal="true" aria-label="Offer for you" aria-hidden={!open}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd}>
        <div className="ia-grab" aria-hidden="true" />
        <div className="ia-sheet-top">
          <button ref={closeRef} type="button" className="ia-icon-btn" aria-label="Close" onClick={() => doClose('close')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00001E" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className={`ia-slot ia-slot-sheet${hasSheet ? ' ia-has-creative' : ''}`} data-slot="sheet" data-label={blok.sheet_placeholder || 'Offer slot · pop-up'}>
          <SlotContent value={override.sheet} url={sheetUrl} alt={alt} />
        </div>
        <button type="button" className="ia-later" onClick={() => doClose('not-now')}>{blok.dismiss_label || 'Not now'}</button>
      </section>
    </div>
  );
}
