// Storyblok technical name → React component. Must match seed/components.ts.
import Step from './Step';
import { Hero, InfoCard, Legal, Note, Offer, OrderSummary, Result, Splash } from './Static';
import { Choice, Form, Reco } from './Interactive';

export const COMPONENTS = {
  journey_step: Step,
  hero: Hero, choice: Choice, reco: Reco, splash: Splash, offer: Offer, form: Form,
  result: Result, info_card: InfoCard, order_summary: OrderSummary, legal: Legal, note: Note,
};
