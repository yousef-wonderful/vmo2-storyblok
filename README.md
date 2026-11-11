# O2 buying layer · Storyblok (Next.js)

The O2 buying journeys from `../app`, sliced into Storyblok components and pages, rendered by Next.js App Router with `@storyblok/react/rsc` (O2's own stack: Next.js + Storyblok).

Storyblok holds customer-facing content only. The demo's presenter bar, persona switcher and agent panel stay in `../app` and are not part of this build.

## Content model

- `journeys/` is a folder per journey (6). Each step is one `journey_step` story, numbered `01-…`, and its buttons link to the next step.
- A `journey_step` page holds the title, blocks, button labels and links, and the O2 checkout frame settings (progress step, secure header, basket bar figures).
- Blocks: hero, choice, reco, splash, offer, form, result, info card, order summary, legal, note. Parts: choice option, recommendation, form field, summary row.
- **O2 In Life app** (`journeys/o2-in-life-app/01-home`) is hand-written in `seed/inlife.json`, not extracted. It uses its own page type, `app_home` (My O2 account cards plus Priority), and the `App` blocks. `offer_slot` drives both the headline slot and the bottom sheet that opens on load; its `creative_endpoint` (the public `html-design` function in the VMO2 workspace) is fetched on load and the newest design renders inline in both slots (Shadow DOM, scaled 1080 canvas, creative scripts not run); add `?status=live` or `?tag=…` to narrow it. With no endpoint and no images, both slots stay grey placeholders. Events: `offer:loaded`, `offer:error`. The page exposes `window.InlifeOffer` (`open`, `close`, `setCreative`) and fires `offer:shown` / `offer:dismissed`.
- Assets this project owns live in `seed/assets/` (checked before `../app/public`). `seed/inlife.json` `library` uploads whole folders into named Storyblok asset folders (currently **iPhone Duo** cut-outs).
- The Help me chat (p7) and EE-style layout (p8) journeys are behaviours on top of p1, not different content, so they are not seeded.

## Setup

1. Fill in `.env.local` (template: `.env.example`).
2. `npm run seed -- --dry`, then `npm run seed`. `--journey=<slug>` seeds one journey only (use it when other journeys have been edited in Storyblok or sit in a workflow stage). Add `--prune` to remove stale stories under `journeys/` and components from earlier seeds.
3. `npm run dev` (https://localhost:3010, self-signed certificate). In Chrome, allow **Local network access** for app.storyblok.com, or the Visual Editor frame is blocked.

## Scripts and routes

- `npm run extract` re-walks `../app`'s planner and rewrites `seed/journeys.json`.
- `/` lists the journeys. `/<slug>` shows published content, `/preview/<slug>` shows draft content for the Visual Editor, and `/local/<slug>` renders the seed file offline.
- Selections and form inputs stay in the browser. Each button follows the recorded path; "No thanks" and "Skip" go to the step that path would show next.
