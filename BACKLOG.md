# Backlog — v1.0.17

Working list for the next release. Publishing flow: `npm run release` locally
(bumps/commits/tags/pushes) → `publish.yml` publishes via OIDC Trusted
Publisher. n8n auto-detects the new version for re-review.

## Shadow mode framing (new, 2026-07-17)

"Score" mode is detection-only: always honored (even over a policy block),
never modifies or blocks text, reports risk score + violations, exits via
"Route Score Only To". That is exactly what security buyers call **shadow
mode** (WAF/CSP/fraud-tool detection-only rollout), and we should say so:

- README: add a rollout section — "Run PromptLock in shadow mode first
  (Score: zero impact on your flow), review what it would have caught, then
  turn on enforcement (Flag → Redact/Block or Inherit from Policy)."
- Node UI: rename the dropdown option display name to `Score (Shadow Mode)`
  (value stays `score` — no breaking change).
- Same wording is the agency/MSP pitch: deploy shadow-mode screening on a
  client's existing workflows with zero behavioral risk, show the findings
  report, upsell enforcement.

## Carried from v1.0.16 review notes

- Document "Route Score Only To" in README (currently undocumented).
- Richer codex/operation description — see
  `PromptLock_n8n_Listing_Action_Items.docx` in the business docs folder.
- Fix `.eslintrc.js` so `npx @n8n/node-cli lint` doesn't error on JS config
  files.

## API changes to reflect (server shipped 2026-07-17)

- `action_on_high_risk` omitted now means true policy-inherit server-side —
  the node's "Inherit from Policy" option finally does what its description
  says (per-framework policies decide: HIPAA redact, GDPR redact, PCI block
  at their thresholds). Update the option description to be concrete about
  this instead of "Use server-side policy configuration".
- Detector false positives fixed server-side (GPS day-numbers, leetspeak
  was_obfuscated, medical-context vocabulary): no node change needed, but
  README example outputs that showed inflated risk scores can be refreshed.
