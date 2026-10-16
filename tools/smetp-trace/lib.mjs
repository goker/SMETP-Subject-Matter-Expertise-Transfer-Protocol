// SMETP trace toolkit: zero dependencies, Node 18+.
//
//   validateGraph(graph)            integrity of the knowledge graph itself
//   buildContextPack(graph, q)      GraphRAG-style retrieval for ANY LLM
//   renderPrompt(pack, q)           the Cite-or-Refuse contract as a prompt
//   verifyTrace(graph, trace)       deterministic verification of an answer
//
// The verifier never trusts the model. It re-derives every verdict from the
// graph: cited ids must exist, be eligible, have hashed evidence, and every
// number in the answer must come from the question, a cited claim, or a
// recorded workflow binding.

import { createHash } from 'node:crypto'

export const TOOLKIT_VERSION = '0.1.0'
export const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex')

const STATUS_RANK = { blocked: -1, deprecated: -1, extracted: 0, sme_confirmed: 1, validated: 2 }
const INELIGIBLE = new Set(['blocked', 'deprecated'])

// ---------------------------------------------------------------------------
// Indexing
// ---------------------------------------------------------------------------

export function indexGraph(graph) {
  const byId = new Map()
  const kinds = ['experts', 'sessions', 'sources', 'spans', 'concepts', 'claims', 'formulas', 'regulations', 'workflows']
  for (const k of kinds) for (const n of graph[k] ?? []) byId.set(n.id, { ...n, _kind: k })
  for (const wf of graph.workflows ?? []) for (const s of wf.steps ?? []) byId.set(s.id, { ...s, _kind: 'steps', _workflow: wf.id })

  const claimsAbout = new Map()
  const exceptionsOf = new Map()
  const modifiersOf = new Map()
  const stepsImplementing = new Map()
  const push = (m, k, v) => (m.has(k) ? m.get(k).push(v) : m.set(k, [v]))
  for (const c of graph.claims ?? []) {
    for (const k of c.about ?? []) push(claimsAbout, k, c.id)
    for (const r of c.exception_to ?? []) push(exceptionsOf, r, c.id)
    for (const r of c.modifies ?? []) push(modifiersOf, r, c.id)
  }
  for (const wf of graph.workflows ?? [])
    for (const s of wf.steps ?? []) for (const c of s.implements ?? []) push(stepsImplementing, c, s.id)

  return { byId, claimsAbout, exceptionsOf, modifiersOf, stepsImplementing }
}

// ---------------------------------------------------------------------------
// Graph validation
// ---------------------------------------------------------------------------

export function validateGraph(graph) {
  const issues = []
  const err = (id, code, msg) => issues.push({ level: 'error', id, code, msg })
  const warn = (id, code, msg) => issues.push({ level: 'warning', id, code, msg })
  const seen = new Set()
  const all = [
    ...(graph.experts ?? []), ...(graph.sessions ?? []), ...(graph.sources ?? []), ...(graph.spans ?? []),
    ...(graph.concepts ?? []), ...(graph.claims ?? []), ...(graph.formulas ?? []), ...(graph.regulations ?? []),
    ...(graph.workflows ?? []), ...(graph.workflows ?? []).flatMap((w) => w.steps ?? []),
  ]
  for (const n of all) {
    if (seen.has(n.id)) err(n.id, 'duplicate_id', 'id is used more than once')
    seen.add(n.id)
  }
  const ix = indexGraph(graph)
  const mustBe = (from, ref, kind) => {
    const t = ix.byId.get(ref)
    if (!t) err(from, 'dangling_ref', `references missing ${ref}`)
    else if (kind && t._kind !== kind) err(from, 'wrong_ref_kind', `${ref} should be a ${kind}, is ${t._kind}`)
  }

  for (const src of graph.sources ?? []) {
    if (typeof src.text === 'string' && sha256(src.text) !== src.sha256) err(src.id, 'source_hash_mismatch', 'source text does not match its sha256')
  }
  for (const sp of graph.spans ?? []) {
    mustBe(sp.id, sp.source, 'sources')
    const src = ix.byId.get(sp.source)
    if (src && typeof src.text === 'string') {
      const slice = src.text.slice(sp.start, sp.end)
      if (sha256(slice) !== sp.sha256) err(sp.id, 'span_hash_mismatch', 'text at [start,end) does not match span sha256')
      if (sp.quote !== undefined && sp.quote !== slice) err(sp.id, 'span_quote_mismatch', 'quote differs from source text at offsets')
    }
  }
  for (const c of graph.claims ?? []) {
    if (!c.evidence?.length) err(c.id, 'no_evidence', 'claim has no evidence span')
    for (const e of c.evidence ?? []) mustBe(c.id, e, 'spans')
    for (const k of c.about ?? []) mustBe(c.id, k, 'concepts')
    if (!c.about?.length) err(c.id, 'unanchored', 'claim is not about any concept')
    mustBe(c.id, c.attributed_to, 'experts')
    for (const r of [...(c.constrained_by ?? []), ...(c.conflicts_with ?? [])]) mustBe(c.id, r, 'regulations')
    for (const r of [...(c.exception_to ?? []), ...(c.modifies ?? []), ...(c.contradicts ?? [])]) mustBe(c.id, r, 'claims')
    if (c.type === 'EdgeCase' && !c.exception_to?.length) err(c.id, 'orphan_edge_case', 'EdgeCase must name the rule it overrides')
    if (c.conflicts_with?.length && c.status !== 'blocked') err(c.id, 'unblocked_conflict', 'claim conflicts with a regulation but is not blocked')
    if (['sme_confirmed', 'validated'].includes(c.status) && !c.confirmed_by?.length) err(c.id, 'unconfirmed', `status ${c.status} requires confirmed_by`)
    if (c.status === 'extracted') warn(c.id, 'awaiting_confirmation', 'extracted claim is not eligible for answers until an SME confirms it')
    for (const other of c.contradicts ?? []) {
      const o = ix.byId.get(other)
      if (o && !INELIGIBLE.has(o.status) && !INELIGIBLE.has(c.status)) warn(c.id, 'live_contradiction', `contradicts ${other} and both are eligible`)
    }
  }
  for (const k of graph.concepts ?? []) for (const r of [...(k.broader ?? []), ...(k.depends_on ?? [])]) mustBe(k.id, r, 'concepts')
  for (const f of graph.formulas ?? []) {
    mustBe(f.id, f.computes, 'concepts')
    for (const u of f.uses ?? []) mustBe(f.id, u, 'concepts')
  }
  for (const wf of graph.workflows ?? [])
    for (const s of wf.steps ?? []) {
      if (!s.implements?.length) err(s.id, 'step_without_claim', 'step implements no claim')
      for (const c of s.implements ?? []) mustBe(s.id, c, 'claims')
      if (s.uses_formula) mustBe(s.id, s.uses_formula, 'formulas')
    }
  return { ok: !issues.some((i) => i.level === 'error'), issues }
}

// ---------------------------------------------------------------------------
// Retrieval: question -> seed concepts -> k-hop -> claims (+ exceptions)
// ---------------------------------------------------------------------------

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function seedConcepts(graph, question) {
  const q = question.toLowerCase()
  const hits = []
  for (const k of graph.concepts ?? []) {
    const terms = [k.label, ...(k.alt_labels ?? []), ...(k.notation ?? [])].filter(Boolean)
    const matched = terms.find((t) => new RegExp(`(^|[^a-z0-9])${escapeRe(t.toLowerCase())}([^a-z0-9]|$)`).test(q))
    if (matched) hits.push({ id: k.id, matched })
  }
  return hits
}

export function buildContextPack(graph, question, opts = {}) {
  const hops = opts.hops ?? 1
  const floor = opts.floor ?? 'sme_confirmed'
  const ix = indexGraph(graph)
  const seeds = seedConcepts(graph, question)
  const conceptIds = new Set(seeds.map((s) => s.id))

  // k-hop expansion over concept relations, both directions
  const neighbours = (id) => {
    const out = new Set()
    for (const k of graph.concepts ?? []) {
      const rel = [...(k.depends_on ?? []), ...(k.broader ?? [])]
      if (k.id === id) rel.forEach((r) => out.add(r))
      if (rel.includes(id)) out.add(k.id)
    }
    return out
  }
  let frontier = [...conceptIds]
  for (let h = 0; h < hops; h++) {
    const next = []
    for (const id of frontier) for (const n of neighbours(id)) if (!conceptIds.has(n)) { conceptIds.add(n); next.push(n) }
    frontier = next
  }

  const excluded = []
  const eligible = (c) => {
    if (INELIGIBLE.has(c.status)) return { ok: false, reason: c.status }
    if (STATUS_RANK[c.status] < STATUS_RANK[floor]) return { ok: false, reason: `below_floor(${c.status}<${floor})` }
    return { ok: true }
  }

  const claimIds = new Set()
  const consider = (cid, why) => {
    if (claimIds.has(cid) || excluded.some((e) => e.id === cid)) return
    const c = ix.byId.get(cid)
    const e = eligible(c)
    if (!e.ok) { excluded.push({ id: cid, reason: e.reason, via: why }); return }
    claimIds.add(cid)
  }
  for (const k of conceptIds) for (const cid of ix.claimsAbout.get(k) ?? []) consider(cid, `about ${k}`)
  // Never return a rule without its exceptions and modifiers.
  let grew = true
  while (grew) {
    grew = false
    for (const cid of [...claimIds]) {
      for (const ex of [...(ix.exceptionsOf.get(cid) ?? []), ...(ix.modifiersOf.get(cid) ?? [])]) {
        const before = claimIds.size
        consider(ex, `exception/modifier of ${cid}`)
        if (claimIds.size > before) grew = true
      }
    }
  }
  // Exclusions are always in scope so the model can refuse correctly.
  for (const c of graph.claims ?? []) if (c.type === 'Exclusion') consider(c.id, 'exclusion')

  const claims = [...claimIds].map((id) => ix.byId.get(id))
  const regulations = [...new Set(claims.flatMap((c) => c.constrained_by ?? []))].map((id) => ix.byId.get(id))
  const workflows = (graph.workflows ?? []).filter((wf) => wf.steps.some((s) => s.implements.some((c) => claimIds.has(c))))
  const concepts = [...conceptIds].map((id) => ix.byId.get(id))

  const strip = ({ _kind, _workflow, ...rest }) => rest
  const pack = {
    graph: graph.id,
    question,
    seeds: seeds.map((s) => s.id),
    hops,
    floor,
    concepts: concepts.map(({ id, label, notation, definition, unit }) => ({ id, label, notation, definition, unit })),
    claims: claims.map((c) => {
      const { id, type, statement, condition, value, unit, confidence, status, exception_to, modifies, constrained_by } = strip(c)
      return { id, type, statement, condition, value, unit, confidence, status, exception_to, modifies, constrained_by }
    }),
    regulations: regulations.map(({ id, label, citation, jurisdiction }) => ({ id, label, citation, jurisdiction })),
    workflows: workflows.map((wf) => ({ id: wf.id, name: wf.name, steps: wf.steps.map((s) => ({ id: s.id, label: s.label, implements: s.implements })) })),
    excluded,
  }
  pack.retrieved = [...pack.concepts.map((c) => c.id), ...pack.claims.map((c) => c.id), ...pack.regulations.map((r) => r.id)]
  pack.sha256 = sha256(JSON.stringify({ ...pack, sha256: undefined }))
  return pack
}

// ---------------------------------------------------------------------------
// The Cite-or-Refuse contract, rendered for any chat model
// ---------------------------------------------------------------------------

export const ANSWER_JSON_SCHEMA = {
  type: 'object',
  required: ['segments'],
  properties: {
    segments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['text', 'kind', 'claims'],
        properties: {
          text: { type: 'string', description: 'One sentence of the answer.' },
          kind: { enum: ['entailed', 'computed', 'synthesized', 'unsupported', 'refusal'] },
          claims: { type: 'array', items: { type: 'string' }, description: 'Claim ids from the context pack that support this sentence.' },
          bindings: { type: 'array', items: { type: 'string' }, description: 'Workflow binding names reported by this sentence (computed only).' },
        },
      },
    },
  },
}

export function renderPrompt(pack) {
  const lines = []
  lines.push('You answer on behalf of captured subject-matter expertise. Follow the Cite-or-Refuse contract:')
  lines.push('1. Split your answer into sentences. Every sentence cites one or more claim ids from the CLAIMS list.')
  lines.push('2. Use only the claim ids listed below. Never invent ids. Never cite a claim for something it does not say.')
  lines.push('3. Every number you write must appear in the question, in a cited claim, or in a workflow binding you report.')
  lines.push('4. If a sentence cannot be supported, mark it kind="unsupported" with no claims, or leave it out.')
  lines.push('5. If the question touches an Exclusion claim, answer that part with kind="refusal" citing the Exclusion.')
  lines.push('6. When an EdgeCase lists exception_to a rule you use, check whether it applies before applying the rule.')
  lines.push('Return JSON only, matching the ANSWER SCHEMA.')
  lines.push('')
  lines.push(`QUESTION: ${pack.question}`)
  lines.push('')
  lines.push('CONCEPTS:')
  for (const k of pack.concepts) lines.push(`- ${k.id} | ${k.label}${k.notation?.length ? ` (${k.notation.join(', ')})` : ''}: ${k.definition}`)
  lines.push('')
  lines.push('CLAIMS:')
  for (const c of pack.claims) {
    const extra = [
      c.condition && `condition: ${c.condition}`,
      c.confidence !== undefined && `confidence: ${c.confidence}`,
      c.exception_to?.length && `exception_to: ${c.exception_to.join(', ')}`,
      c.modifies?.length && `modifies: ${c.modifies.join(', ')}`,
      c.constrained_by?.length && `constrained_by: ${c.constrained_by.join(', ')}`,
    ].filter(Boolean)
    lines.push(`- ${c.id} [${c.type}, ${c.status}] ${c.statement}${extra.length ? ` {${extra.join('; ')}}` : ''}`)
  }
  if (pack.regulations.length) {
    lines.push('')
    lines.push('REGULATIONS:')
    for (const r of pack.regulations) lines.push(`- ${r.id} | ${r.label} (${r.citation ?? r.jurisdiction})`)
  }
  if (pack.workflows.length) {
    lines.push('')
    lines.push('WORKFLOWS (steps implement claims):')
    for (const wf of pack.workflows) lines.push(`- ${wf.id} ${wf.name}: ${wf.steps.map((s) => `${s.id}→[${s.implements.join(',')}]`).join(' · ')}`)
  }
  lines.push('')
  lines.push('ANSWER SCHEMA:')
  lines.push(JSON.stringify(ANSWER_JSON_SCHEMA))
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

const NUM_RE = /(?<![\w.])\$?\d[\d,]*(?:\.\d+)?%?/g

function numbersIn(text) {
  return [...String(text).matchAll(NUM_RE)].map((m) => {
    const raw = m[0]
    const pct = raw.endsWith('%')
    const v = Number(raw.replace(/[$,%]/g, ''))
    // "43%" means 0.43. It must not be satisfied by an unrelated bare "43".
    return { raw, values: [pct ? v / 100 : v] }
  }).filter((n) => n.values.every(Number.isFinite))
}

function knownNumbers(texts, values) {
  const out = []
  for (const t of texts) for (const n of numbersIn(t)) out.push(...n.values)
  for (const v of values) if (Number.isFinite(Number(v))) out.push(Number(v))
  return out
}

const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b))

export function verifyTrace(graph, trace) {
  const ix = indexGraph(graph)
  const retrieved = trace.retrieval?.retrieved ? new Set(trace.retrieval.retrieved) : null
  const runs = trace.workflow_runs ?? []
  const allBindings = Object.assign({}, ...runs.map((r) => r.bindings ?? {}))
  const executedSteps = new Set(runs.flatMap((r) => r.steps ?? []))

  const spanOk = (spid) => {
    const sp = ix.byId.get(spid)
    if (!sp) return false
    const src = ix.byId.get(sp.source)
    if (src && typeof src.text === 'string') return sha256(src.text.slice(sp.start, sp.end)) === sp.sha256
    return /^[0-9a-f]{64}$/.test(sp.sha256 ?? '')
  }

  const segResults = []
  const credit = {}
  let citations = 0
  let validCitations = 0
  let unsupportedNumbers = 0

  for (const seg of trace.answer.segments) {
    const issues = []
    const err = (code, msg) => issues.push({ level: 'error', code, msg })
    const warn = (code, msg) => issues.push({ level: 'warning', code, msg })
    const valid = []

    for (const cid of seg.claims ?? []) {
      citations++
      const c = ix.byId.get(cid)
      if (!c || c._kind !== 'claims') { err('unknown_claim', `${cid} does not exist in ${graph.id}`); continue }
      if (INELIGIBLE.has(c.status)) { err('ineligible_claim', `${cid} is ${c.status}${c.review_note ? `: ${c.review_note}` : ''}`); continue }
      if (retrieved && !retrieved.has(cid)) warn('not_in_context', `${cid} was not in the context pack given to the model`)
      if (c.status === 'extracted') warn('below_floor', `${cid} is extracted and not yet SME-confirmed`)
      validCitations++
      valid.push(c)
    }

    if (seg.kind === 'refusal') {
      if (!valid.some((c) => c.type === 'Exclusion')) warn('refusal_without_exclusion', 'refusal does not cite an Exclusion claim')
    } else if (seg.kind === 'unsupported' || (seg.claims ?? []).length === 0) {
      err('unsupported_segment', 'sentence has no supporting claim')
    }

    // Numbers must be grounded.
    const bindingVals = (seg.bindings ?? []).map((b) => allBindings[b])
    const known = knownNumbers(
      [trace.question, ...valid.map((c) => c.statement)],
      [...valid.flatMap((c) => [c.value, c.confidence]), ...bindingVals].filter((v) => v !== undefined),
    )
    for (const n of numbersIn(seg.text)) {
      if (!n.values.some((v) => known.some((k) => near(v, k)))) {
        unsupportedNumbers++
        err('unsupported_number', `${n.raw} is not in the question, the cited claims, or a reported binding`)
      }
    }

    // Computed segments must come from a recorded workflow run that implements a cited claim.
    if (seg.kind === 'computed') {
      for (const b of seg.bindings ?? []) if (!(b in allBindings)) err('unknown_binding', `binding ${b} is not in any workflow run`)
      const linked = valid.some((c) => (ix.stepsImplementing.get(c.id) ?? []).some((s) => executedSteps.has(s)))
      if (!linked) err('computation_not_traced', 'no executed workflow step implements the cited claims')
    }

    // Lexical anchor: the sentence should mention a concept the claim is about.
    const lower = seg.text.toLowerCase()
    for (const c of valid) {
      const anchored = (c.about ?? []).some((kid) => {
        const k = ix.byId.get(kid)
        return k && [k.label, ...(k.alt_labels ?? []), ...(k.notation ?? [])].some((t) => lower.includes(t.toLowerCase()))
      })
      if (!anchored) warn('weak_anchor', `sentence does not mention any concept that ${c.id} is about`)
    }

    // Trace Assurance Level
    let tal = 0
    if (!issues.some((i) => i.level === 'error') && valid.length) {
      tal = Math.min(...valid.map((c) => {
        if (!(c.evidence ?? []).length || !(c.evidence ?? []).every(spanOk)) return 1
        if (c.status === 'validated') return 4
        if (c.status === 'sme_confirmed' && (c.confirmed_by ?? []).length) return 3
        return 2
      }))
    }

    // Credit: each grounded sentence splits one unit across its valid claims' experts.
    if (tal >= 2) for (const c of valid) credit[c.attributed_to] = (credit[c.attributed_to] ?? 0) + 1 / valid.length

    segResults.push({
      id: seg.id,
      text: seg.text,
      kind: seg.kind,
      tal,
      claims: seg.claims ?? [],
      evidence: valid.flatMap((c) => c.evidence ?? []),
      experts: [...new Set(valid.map((c) => c.attributed_to))],
      issues,
    })
  }

  const scored = segResults.filter((s) => s.kind !== 'refusal')
  const totalCredit = Object.values(credit).reduce((a, b) => a + b, 0)
  const expert_credit = Object.fromEntries(Object.entries(credit).map(([k, v]) => [k, +(v / (totalCredit || 1)).toFixed(4)]))
  const errors = segResults.flatMap((s) => s.issues).filter((i) => i.level === 'error').length
  const warnings = segResults.flatMap((s) => s.issues).filter((i) => i.level === 'warning').length

  const metrics = {
    segments: segResults.length,
    grounded_ratio: +(scored.filter((s) => s.tal >= 2).length / (scored.length || 1)).toFixed(4),
    mean_tal: +(scored.reduce((a, s) => a + s.tal, 0) / (scored.length || 1)).toFixed(2),
    min_tal: scored.length ? Math.min(...scored.map((s) => s.tal)) : null,
    citation_validity: +(validCitations / (citations || 1)).toFixed(4),
    unsupported_numbers: unsupportedNumbers,
    errors,
    warnings,
  }
  return {
    verifier: `smetp-trace@${TOOLKIT_VERSION}`,
    verified_at: new Date().toISOString(),
    segments: segResults,
    metrics,
    expert_credit,
    verdict: errors ? 'fail' : warnings ? 'pass_with_warnings' : 'pass',
  }
}

// ---------------------------------------------------------------------------
// Turning a model's JSON answer into a trace
// ---------------------------------------------------------------------------

export function traceFromModelAnswer({ graph, pack, question, model, answer, workflowRuns = [], graphText }) {
  const segments = (answer.segments ?? []).map((s, i) => ({ id: `seg-${i + 1}`, text: s.text, kind: s.kind, claims: s.claims ?? [], bindings: s.bindings ?? [] }))
  return {
    smetp_trace_version: '0.1.0',
    id: `trace:${sha256(question + JSON.stringify(segments)).slice(0, 12)}`,
    graph: graph.id,
    graph_sha256: graphText ? sha256(graphText) : undefined,
    question,
    asked_at: new Date().toISOString(),
    model,
    retrieval: { seeds: pack.seeds, hops: pack.hops, retrieved: pack.retrieved, context_pack_sha256: pack.sha256 },
    workflow_runs: workflowRuns,
    answer: { text: segments.map((s) => s.text).join(' '), segments },
  }
}
