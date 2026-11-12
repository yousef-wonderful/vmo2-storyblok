import { storyblokEditable, StoryblokServerComponent } from '@storyblok/react/rsc';
import { Icon } from '../Icon';
import { StepLink } from '../StepLink';
import type { Blok } from '@/lib/fields';

const STAGES = ['Phone', 'Plan', 'Check', 'Details', 'Pay'];
const STEP_NAMES: Record<string, string> = { Phone: 'Your phone', Plan: 'Your plan', Check: 'Quick check', Details: 'Your details', Pay: 'Review and pay' };
const PAY = ['visa-white.png', 'american-express-logo.png', 'mastercard-logo.png', 'google-pay-white.png', 'applepay-white.png'];

// One step of an O2 buying journey: O2's checkout frame (header, progress, basket bar) around the Storyblok blocks.
export default function Step({ blok }: { blok: Blok }) {
  const blocks: Blok[] = blok.blocks ?? [];
  const inPage = !!blok.buttons_in_page;
  const at = STAGES.indexOf(blok.stage);
  const priced = !!blok.basket_monthly;
  return (
    <div className="o2-page">
      <main className="o2" {...storyblokEditable(blok)}>
        <header className="o2-header">
          <div className="o2-header-inner">
            <div className="o2-header-top">
              <img className="o2-logo" src="/brand/logo.svg" alt="O2" />
              <span className="header-right">{blok.secure_checkout && <span className="secure-label">Secure Checkout <Icon name="fal-lock" size={18} /></span>}</span>
            </div>
            {!inPage && at >= 0 && <>
              <ol className="progress" aria-label="Progress">{STAGES.map((s, n) => <li key={s} className={n < at ? 'done' : n === at ? 'now' : ''} />)}</ol>
              <div className="step-label">Step {at + 1} of {STAGES.length}: {STEP_NAMES[blok.stage]}</div>
            </>}
          </div>
        </header>
        <div className="o2-body">
          <div className="screen-wrap fwd">
            <div className="screen">
              {blok.back_link?.cached_url && <StepLink link={blok.back_link} className="back-link"><Icon name="far-chevron-left" size={14} /> Back</StepLink>}
              {blocks[0]?.component !== 'splash' && blok.title && <header className="screen-head">
                <h1>{blok.title}</h1>
                {blok.subtitle && <p className="sub">{blok.subtitle}</p>}
              </header>}
              <div className="blocks">{blocks.map(b => <StoryblokServerComponent blok={b} key={b._uid} />)}</div>
              {(blok.secondary_label || inPage) && <footer className={`screen-foot ${inPage ? 'inline' : ''}`}>
                {inPage && <StepLink link={blok.primary_link} className="btn primary">{blok.primary_label}</StepLink>}
                {blok.secondary_label && <StepLink link={blok.secondary_link} className="btn secondary">{blok.secondary_label}</StepLink>}
              </footer>}
            </div>
          </div>
        </div>
        {!inPage && (
          <div className="total-bar">
            <div className="total-inner">
              {priced ? <span className="total-toggle"><Icon name="far-chevron-up" size={16} /> Total</span> : <span className="total-name">{blok.basket_label}</span>}
              {priced && <div className="total-figs">
                <div><span>Upfront</span><strong>{blok.basket_upfront}</strong></div>
                <div><span>Monthly</span><strong>{blok.basket_monthly}</strong></div>
                {blok.basket_saving && <div className="saving"><span>{blok.basket_saving_label || 'Saving'}</span><strong>{blok.basket_saving}</strong></div>}
              </div>}
              <div className="total-cta">
                <StepLink link={blok.primary_link} className="btn on-navy">{blok.primary_label}</StepLink>
                {blok.payment_logos && <div className="pay-logos">{PAY.map(f => <img key={f} src={`/o2/payment/${f}`} alt="" />)}</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
