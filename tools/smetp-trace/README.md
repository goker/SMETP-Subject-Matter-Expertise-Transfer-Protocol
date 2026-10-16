# smetp-trace

Plug an SMETP knowledge graph into any LLM and verify every sentence of the answer. Zero dependencies, Node 18+.

```bash
# 1. Check the graph: hashes, references, blocked conflicts, orphan edge cases
node tools/smetp-trace/cli.mjs validate examples/graph/credit_risk.graph.json

# 2. Build the context pack and Cite-or-Refuse prompt for a question (paste into any chat model)
node tools/smetp-trace/cli.mjs context examples/graph/credit_risk.graph.json "Would you approve a 690 FICO with 35% DTI?"

# 3. Ask a model directly and verify the reply
ANTHROPIC_API_KEY=... node tools/smetp-trace/cli.mjs ask examples/graph/credit_risk.graph.json "..." --provider anthropic
OPENAI_API_KEY=...    node tools/smetp-trace/cli.mjs ask examples/graph/credit_risk.graph.json "..." --provider openai
# Ollama / vLLM / LM Studio / any OpenAI-compatible endpoint
node tools/smetp-trace/cli.mjs ask examples/graph/credit_risk.graph.json "..." --provider openai-compatible --base-url http://localhost:11434/v1 --model llama3.1

# 4. Verify an answer you already have (copied from any chat UI), offline
node tools/smetp-trace/cli.mjs ask examples/graph/credit_risk.graph.json "..." --response answer.json --runs workflow-runs.json --out trace.json

# 5. Re-verify a stored trace
node tools/smetp-trace/cli.mjs verify examples/graph/credit_risk.graph.json examples/traces/credit_risk.trace.json

# Tests
node --test tools/smetp-trace/test.mjs
```

## What the verifier checks, per sentence

| Check | Error code | Why |
|---|---|---|
| Cited id exists in the graph | `unknown_claim` | Models invent plausible ids. |
| Cited claim is not blocked or deprecated | `ineligible_claim` | Regulatory conflicts and superseded knowledge never reach users. |
| Sentence has a supporting claim | `unsupported_segment` | No claim, no sentence. |
| Every number is grounded | `unsupported_number` | Numbers must come from the question, a cited claim, or a workflow binding. |
| Computed values came from an executed step | `computation_not_traced` | A run of a step that implements the cited claim. |
| Claim was in the context pack | `not_in_context` (warning) | The model cited something it was not given. |
| Sentence mentions the claim's concept | `weak_anchor` (warning) | Cheap check for citation drift. |
| Refusal cites an Exclusion | `refusal_without_exclusion` (warning) | Refusals are knowledge too. |

Each sentence gets a **Trace Assurance Level** (0 to 4) equal to its weakest cited claim, and grounded sentences split one unit of credit across the experts behind their claims. See [docs/knowledge-graph-and-traceability.md](../../docs/knowledge-graph-and-traceability.md).

The checks above are deterministic. Semantic entailment (does the claim actually say what the sentence says?) is an optional second pass with an NLI model or LLM judge; the doc gives the judge contract.
