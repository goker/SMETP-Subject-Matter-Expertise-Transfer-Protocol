# Discussion drafts (not posted)

GitHub Discussions are **disabled** on this repository (checked 2026-10-28; the discussions API returns 410). A maintainer needs to enable Discussions, create categories, paste the posts below, and pin the benchmark post.

Until then, benchmark questions go to Issues with the `benchmark` label. The benchmark issue templates live in `.github/ISSUE_TEMPLATE/`.

Report link used below: [2026-10-credit-risk.md](2026-10-credit-risk.md).

Maintainer note on the site: do not post the ieataiforbreakfast.com capture sentence until someone completes an interview there. The October 2026 pass fetched the homepage only. It did not finish a capture, and the homepage still describes npm packages and drop-in host adapters that this repo does not ship.

---

## 3a. Pinned — category: Benchmark (or Announcements)

**Title:** Benchmark: method, results, caveats (Oct 2026)

We ran the finance credit-risk example through four setups on 139 synthetic cases (grok-4.7, one scored run per case).

Headline: the hybrid (LLM extracts fields, the SMETP graph decides) matched an LLM given the expert's docs (97.1%) at $0.36 vs $2.29 for the 139 decisions, 2.5 s vs 16.8 s median, with a rule path on 100% of decisions.

Read before quoting:

- The graph-only 100% is by construction (same rules as the test answers).
- Synthetic, one domain, one model, one run per case. Gaps like 87.5% vs 75% adversarial accuracy (14 vs 12 of 16) are noise.
- All 4 hybrid misses: the parser normalized bad input types ("800" as a string) before validation. Fix: validate raw types first.

Report: [October 2026 credit-risk benchmark](2026-10-credit-risk.md)

Questions, critiques, and replication attempts welcome here.

---

## 3b. Category: Ideas

**Title:** Which expert decision should we capture next?

We want a second and third domain for the benchmark. Reply with:

1. The decision (e.g. "approve a supplier", "triage a support ticket")
2. Who makes it today (role, not name)
3. What makes it hard (thresholds? exceptions? missing data?)
4. Could you share anonymized or synthetic examples? (Never post real personal data.)

---

## 3c. Category: Show and tell

**Title:** Share your capture

Ran an interview with the SMETP templates in this repo?
Share (redacted) what came out: the inputs, the decision tree, where the expert said "it depends".
What did writing it down expose that you didn't expect?

Optional sentence, only after the capture flow is verified end to end:

> Ran an interview with the SMETP templates or the free capture on https://ieataiforbreakfast.com?
