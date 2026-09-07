# Visual verification notes

The desktop home preview rendered successfully at 1280px wide with the intended EcoSort AI dark glassmorphism language. The sticky top navigation, green/cyan accents, hero hierarchy, AI command deck, telemetry cards, and demo metrics are visually coherent. The live status correctly reads **Agent setup pending** because `N8N_WEBHOOK_URL` is not configured; the dashboard does not imply a connected AI agent. The screenshot showed no visible overflow or broken styling in the initial viewport.

Validation completed before this inspection: `pnpm check`, `pnpm test -- --runInBand` (2 files / 2 tests passed), and `pnpm build` (successful; one non-blocking Vite chunk-size warning).

## Route verification findings

The assistant screen renders the real-response-only empty state, the n8n payload contract, session ID badge, suggestion cards, and responsive chat surface correctly. The classifier screen renders the image drop zone, model-pending badge, explicit no-guessing result state, and expected response fields. The report screen renders a complete validated form and workflow handoff panel. The guide screen renders search, category filters, and disposal cards with semantic color accents. The About screen clearly communicates the Website → n8n → AI Agent → response architecture and correctly reports `Webhook URL pending`.

No route showed visible overflow or missing styles in the desktop screenshots. The duplicate assistant capture confirmed consistent rendering and stable session IDs per browser session.

## Mobile verification findings

At 390×844, the home page stacks the hero and command deck without horizontal overflow, keeps the primary actions readable, and collapses navigation to the avatar/menu controls. The assistant page stacks its heading and chat panel, retains the explicit no-response-is-invented copy, and keeps suggestion cards within the phone viewport. The visual language remains consistent at the mobile breakpoint.

## Unconfigured integration fix

After the fix, `/assistant` shows a non-error amber setup notice: questions are not sent while `N8N_WEBHOOK_URL` is absent, and the composer/send control is disabled instead of producing a tRPC mutation error. `/classify` remains honest with a not-connected model state, and `/report` keeps its form visible while pausing submission until n8n is configured. Typecheck, both Vitest tests, and the production build all pass.
