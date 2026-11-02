// Blocks with no client state.
import { storyblokEditable } from '@storyblok/react/rsc';
import { Icon } from '../Icon';
import { lines, src, type Asset, type Blok } from '@/lib/fields';

const ed = (b: Blok) => storyblokEditable(b) as Record<string, string>;

export function PhoneImage({ image, alt }: { image: Asset; alt: string }) {
  return src(image) ? <img className="phone-img" src={src(image)} alt={alt} /> : <div className="phone-img placeholder" aria-label={alt} />;
}

export function Hero({ blok }: { blok: Blok }) {
  const rating = Number(blok.rating);
  return (
    <div className="hero" {...ed(blok)}>
      <PhoneImage image={blok.image} alt={blok.title} />
      <div className="hero-copy">
        {lines(blok.badges).map(x => <span key={x} className="badge">{x}</span>)}
        {rating > 0 && <div className="rating">{Array.from({ length: 5 }, (_, i) => <Icon key={i} name={i < Math.round(rating) ? 'fas-star' : 'far-star'} size={18} />)}<span>{rating.toFixed(1)}{blok.reviews ? ` (${blok.reviews} reviews)` : ''}</span></div>}
        {blok.from_price && <div className="from">{blok.from_price}</div>}
        {lines(blok.specs).length > 0 && <ul className="specs">{lines(blok.specs).map(x => { const [v, l] = x.split('|').map(s => s.trim()); return <li key={x}><strong>{v}</strong><span>{l}</span></li>; })}</ul>}
      </div>
    </div>
  );
}

export function Splash({ blok }: { blok: Blok }) {
  const imgs: Asset[] = blok.images ?? [];
  return (
    <div className="splash" {...ed(blok)}>
      <div className="splash-mast">
        <h1>{blok.title}</h1>
        <p>{blok.body}</p>
        <div className="splash-phones">{imgs.map((a, i) => src(a) && <img key={i} src={src(a)} alt="" style={{ ['--i' as string]: i }} />)}</div>
      </div>
      <ul className="splash-points">{lines(blok.points).map(x => <li key={x}><Icon name="fas-circle-check" size={20} /> {x}</li>)}</ul>
    </div>
  );
}

export function Offer({ blok }: { blok: Blok }) {
  const price: string = blok.price ?? '';
  return (
    <div className="offer" {...ed(blok)}>
      {src(blok.image) && <div className="offer-head" style={{ backgroundImage: `url(${src(blok.image)})` }}>{src(blok.logo) && <img className="offer-logo" src={src(blok.logo)} alt="" />}</div>}
      <div className="offer-body">
        <h2>{blok.title}</h2>
        <p>{blok.body}</p>
        {lines(blok.bullets).length > 0 && <ul>{lines(blok.bullets).map(x => <li key={x}><Icon name="o2-line-check" size={16} /> {x}</li>)}</ul>}
        {price && <div className="offer-price"><strong>{price.replace(/\/mo$/, '')}</strong>{/\/mo$/.test(price) && <span>A MONTH</span>}</div>}
        {blok.legal && <details className="legal offer-legal"><summary>Important information<Icon name="far-chevron-down" size={16} /></summary><p>{blok.legal}</p></details>}
      </div>
    </div>
  );
}

export function Result({ blok }: { blok: Blok }) {
  return <div className={`result ${blok.tone || 'good'}`} {...ed(blok)}><span className="tick"><Icon name="fas-circle-check" size={32} /></span><div><strong>{blok.title}</strong><p>{blok.body}</p></div></div>;
}

export function Note({ blok }: { blok: Blok }) {
  return <p className="note" {...ed(blok)}><Icon name="far-circle-info" size={18} /> <span>{blok.body}</span></p>;
}

export function Legal({ blok }: { blok: Blok }) {
  return <details className="legal" {...ed(blok)}><summary>{blok.title}<Icon name="far-chevron-down" size={16} /></summary><p>{blok.body}</p></details>;
}

export function InfoCard({ blok }: { blok: Blok }) {
  return (
    <div className="info-card" {...ed(blok)}>
      {src(blok.image) && <img className="info-img" src={src(blok.image)} alt="" />}
      <div className="info-body">
        {src(blok.logo) && <img className="info-logo" src={src(blok.logo)} alt="" />}
        <strong>{blok.title}</strong>
        <ul>{lines(blok.lines).map(l => <li key={l}>{l}</li>)}</ul>
      </div>
    </div>
  );
}

export function OrderSummary({ blok }: { blok: Blok }) {
  const rows: Blok[] = blok.rows ?? [];
  return (
    <div className="summary" {...ed(blok)}>
      <div className="summary-media"><PhoneImage image={blok.image} alt="" /></div>
      <div className="summary-rows">
        {rows.map(r => r.total
          ? <div key={r._uid} className="row total" {...ed(r)}><span>{r.label}</span><span>{r.value}</span></div>
          : <div key={r._uid} className="row" {...ed(r)}><span><strong>{r.label}</strong><small>{r.meta}</small></span><span>{r.value}</span></div>)}
      </div>
    </div>
  );
}
