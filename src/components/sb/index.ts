// Storyblok technical name → React component. Must match seed/components.ts.
import Step from './Step';
import { Hero, InfoCard, Legal, Note, Offer, OrderSummary, Result, Splash } from './Static';
import { Choice, Form, Reco } from './Interactive';
import AppHome, { AppHeader, AppNavTab, BillCard, PlanCard, PriorityBanner, PriorityCard, PrioritySection, UsageCard } from './AppHome';
import { OfferSlot } from './AppHomeClient';

export const COMPONENTS = {
  journey_step: Step,
  hero: Hero, choice: Choice, reco: Reco, splash: Splash, offer: Offer, form: Form,
  result: Result, info_card: InfoCard, order_summary: OrderSummary, legal: Legal, note: Note,
  // O2 in-life app home
  app_home: AppHome, app_header: AppHeader, offer_slot: OfferSlot, bill_card: BillCard, plan_card: PlanCard, usage_card: UsageCard,
  priority_section: PrioritySection, priority_card: PriorityCard, priority_banner: PriorityBanner, app_nav_tab: AppNavTab,
};
