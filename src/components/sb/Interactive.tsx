'use client';
// Blocks the customer interacts with. Selections are local to the demo; nothing is submitted.
import { useState } from 'react';
import { storyblokEditable } from '@storyblok/react';
import { Icon } from '../Icon';
import { lines, src, type Blok } from '@/lib/fields';

const val = (o: Blok): string => o.value || o._uid;
const ed = (b: Blok) => storyblokEditable(b) as Record<string, string>;

export function Choice({ blok }: { blok: Blok }) {
  const options: Blok[] = blok.options ?? [];
  const multi = Number(blok.multi) || 0;
  const [value, setValue] = useState<string>(blok.default_option ?? '');
  const picked = value.split(',').filter(Boolean);
  const sel = options.find(o => val(o) === value);
  const layout: string = blok.layout || 'cards';
  return (
    <fieldset className={`choice ${layout}`} {...ed(blok)}>
      {blok.label && <legend>{blok.label}{(layout === 'swatches' || layout === 'chips') && sel ? <span>: {sel.title}</span> : null}</legend>}
      <div className="options">
        {options.map(o => {
          const on = multi ? picked.includes(val(o)) : value === val(o);
          const toggle = () => setValue(!multi ? val(o) : (on ? picked.filter(x => x !== val(o)) : [...picked, val(o)].slice(-multi)).join(','));
          return (
            <button key={o._uid} {...ed(o)} type="button" className={`opt ${on ? 'on' : ''}`} aria-pressed={on} aria-label={layout === 'swatches' ? o.title : undefined} onClick={toggle}>
              {layout === 'swatches' && <span className="swatch" style={{ background: o.swatch }} />}
              {(layout === 'cards' || layout === 'list') && <span className={`signifier ${on ? 'on' : ''}`}>{on && <Icon name="fas-check" size={14} />}</span>}
              {layout === 'cards' && src(o.image) && <img className="opt-img" src={src(o.image)} alt="" />}
              {layout !== 'swatches' && <span className="opt-text">
                {o.badge && <span className="badge">{o.badge}</span>}
                <span className="opt-title">{o.title}</span>
                {o.meta && <span className="opt-meta">{o.meta}</span>}
              </span>}
              {o.price && <span className="opt-price">{o.price}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Reco({ blok }: { blok: Blok }) {
  const options: Blok[] = blok.options ?? [];
  const [value, setValue] = useState<string>(blok.default_option ?? '');
  return (
    <div className="reco" {...ed(blok)}>
      {options.map(o => {
        const on = value === val(o);
        return (
          <button key={o._uid} {...ed(o)} type="button" className={`reco-card ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => setValue(val(o))}>
            <span className={`signifier ${on ? 'on' : ''}`}>{on && <Icon name="fas-check" size={14} />}</span>
            {src(o.image) && <img className="reco-img" src={src(o.image)} alt="" />}
            <span className="reco-body">
              {o.badge && <span className="badge">{o.badge}</span>}
              <span className="reco-top"><span className="opt-title">{o.title}</span><span className="opt-price">{o.price}</span></span>
              {o.meta && <span className="opt-meta">{o.meta}</span>}
              <span className="reco-why-label">Why we picked this</span>
              <ul className="reco-why">{lines(o.why).map(w => <li key={w}><Icon name="o2-line-check" size={14} /> {w}</li>)}</ul>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Form({ blok }: { blok: Blok }) {
  const fields: Blok[] = blok.fields ?? [];
  const [d, setD] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f._uid, f.value ?? ''])));
  const set = (k: string, v: string) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="form" {...ed(blok)}>
      {fields.map(f => {
        const opts = lines(f.options);
        return (
          <label key={f._uid} className="field" {...ed(f)}>
            <span>{f.label}{!f.read_only && <em aria-hidden> *</em>}</span>
            {opts.length
              ? <select value={d[f._uid] ?? ''} onChange={e => set(f._uid, e.target.value)}><option value="" disabled>Please select</option>{opts.map(o => <option key={o}>{o}</option>)}</select>
              : <input type={f.input_type || 'text'} value={d[f._uid] ?? ''} placeholder={f.label} readOnly={f.read_only} onChange={e => set(f._uid, e.target.value)} />}
          </label>
        );
      })}
    </div>
  );
}
