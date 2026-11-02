# Demo change lists · `/o2-change`

These changes are now tickets on the Monday.com board **O2 Web (Acquisition)** (workspace O2 Digital). Type `/o2-change` to pick one, or `/o2-change <item ID or name>` to go straight to it. The skill makes the change, bundles it into a Storyblok Release in review, puts any code on a local `o2-change/...` branch, and raises a change request in Jira (KAN, O2 Change Management). `/o2-change publish KAN-n` ships it once approved, and `/o2-change reset` puts the demo back to baseline.

The lists below match the board's tickets and are kept for reference.

---

## A · Content and a rule across journeys (about 3 minutes, no stop before changes)

```
1. Volt journey, "You can get Volt" step: rewrite the offer so it leads with the household benefit, same length or shorter. Add a note under it: "Volt benefits are added to your Virgin Media account automatically."
2. Trade-in journey, trade-in step: add a note after the choice: "Your trade-in value is confirmed once we've received and checked your device."
3. Cheapest iPhone journey, first step: change the main button to "Show me the cheapest plans".
4. Help me choose, "what matters most" step: add a Storage option after Big screen, meta "Room for photos and apps".
5. Every credit check step in every journey: start the note with "Checking won't affect your credit score."
```

## B · Code + content (about 4 minutes, stops once for a go-ahead)

```
1. Add a trust badge under the offer on the Volt "You can get Volt" step and on the trade-in step. Short line of text with a tick icon, in O2's style.
2. Cheapest iPhone journey, first step: change the main button to "Show me the cheapest plans".
3. Every credit check step in every journey: start the note with "Checking won't affect your credit score."
```

Change 1 has no block to use, so the agent classifies it as code + content: a new `trust_badge` component in Next.js and Storyblok, then placed on two stories. It leaves the badge text open, so it asks for it with a proposed default. Reply `Go` to accept the defaults.

## C · Deliberately vague (shows it asking)

```
1. Make the Volt offer more compelling.
2. Add a reassurance message on checkout.
3. Show the monthly saving on the trade-in step.
```

It should ask: which checkout steps (there are several), what the reassurance says, and where the saving figure comes from (change 3 may need a new field, so code + content).

---

Follow-ups to use live:
- `Publish 1 and 3. Leave the rest as drafts.`
- `Show me the published Volt page`: https://localhost:3010/journeys/virgin-media-household-volt/05-you-can-get-volt

Before showing this to O2: "Checking won't affect your credit score." and the trust badge wording are demo copy, not O2's. Check them against O2's real copy.
