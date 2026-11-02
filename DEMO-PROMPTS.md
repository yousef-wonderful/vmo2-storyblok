# Live demo prompts · Storyblok MCP

> Prefer the `/o2-change` skill: it picks up a ticket from Monday.com, makes the change (content, or code + content), raises a Storyblok Release and a Jira change request, and resets with `/o2-change reset`. See [DEMO-CHANGES.md](DEMO-CHANGES.md). The prompts below are the older fixed, content-only version.

Space `296241792561322` (EU). Draft preview runs at `https://localhost:3010/preview/…`, the published site at `https://localhost:3010/…`.

Run these in Wonderful Code from `o2-buying-layer/storyblok/`, in this order: **1 Setup** before the demo, **2 Demo** live, **3 Reset** afterwards (or before the next rehearsal).

---

## 1 · Setup (before the demo)

```
Get the Storyblok demo ready. Work in o2-buying-layer/storyblok.

1. Check the dev server is answering on https://localhost:3010. If it isn't, start `npm run dev` in the background and wait until it answers.
2. Reset the content to baseline by running `npm run seed -- --only=stories`. This republishes all 70 journey steps from seed/journeys.json and overwrites any drafts.
3. Use the Storyblok MCP to read the story journeys/virgin-media-household-volt/05-you-can-get-volt and confirm the MCP connection works.
4. Give me these links to open before I start:
   - Storyblok editor for that story: https://app.storyblok.com/#/me/spaces/296241792561322/stories/0/0/<story id>
   - Draft preview: https://localhost:3010/preview/journeys/virgin-media-household-volt/05-you-can-get-volt

Don't change any content apart from the reset in step 2. Report in three lines or fewer.
```

---

## 2 · Demo (live; about 3–4 minutes)

```
Using the Storyblok MCP on the O2 space (296241792561322), make the changes below as DRAFTS ONLY. Save them, but do not publish anything.

Before changing a story, read it and tell me in one line what you're about to change.

Targeted changes:
1. Virgin Media household · Volt, step "05 · You can get Volt": rewrite the offer's body so it opens with the household benefit, in O2's tone and no longer than it is now. Then add a `note` block after the offer: "Volt benefits are added to your Virgin Media account automatically."
2. Upgrade · O2 Recycle trade-in, step "04 · Trade in your iPhone 13?": add a `note` block after the choice: "Your trade-in value is confirmed once we've received and checked your device."
3. Cheapest iPhone · search, step "01 · Great iPhones for less": change the primary button label to "Show me the cheapest plans".
4. Help me choose, step "02 · What matters most to you?": add a "Storage" option (meta: "Room for photos and apps") to the choice block, after "Big screen".

Rule across journeys:
5. Find every "Let's check you're likely to be approved" step in every journey. In each one's `note` block, add this sentence at the start: "Checking won't affect your credit score." Keep the rest of the note unchanged, and tell me how many steps you found before you edit them.

When you're done, give me one table with these columns:
journey · step · what changed · editor link · draft preview link

- Editor link: https://app.storyblok.com/#/me/spaces/296241792561322/stories/0/0/<story id>
- Draft preview link: https://localhost:3010/preview/<full_slug>

Then stop and wait for my approval before publishing anything.
```

Follow-ups to use live:
- `Approved. Publish 1, 3 and 5. Leave 2 and 4 as drafts.`
- `Show me the published Volt page`: https://localhost:3010/journeys/virgin-media-household-volt/05-you-can-get-volt

---

## 3 · Reset / teardown (after the demo)

```
Reset the Storyblok demo. Work in o2-buying-layer/storyblok.

1. Run `npm run seed -- --only=stories`. This republishes every journey step from seed/journeys.json, which undoes both drafts and anything published during the demo.
2. Use the Storyblok MCP to spot-check that these stories match seed/journeys.json again, both as draft and as published:
   - virgin-media-household-volt/05-you-can-get-volt
   - help-me-choose/02-what-matters-most-to-you
   - cheapest-iphone-search/01-great-iphones-for-less
3. List any story under journeys/ whose draft differs from what is published.

Report pass or fail in three lines or fewer. Don't change anything other than the reseed.
```
