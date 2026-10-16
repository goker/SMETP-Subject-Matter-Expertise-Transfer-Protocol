// node --test tools/smetp-trace/test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { validateGraph, buildContextPack, verifyTrace } from './lib.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const load = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const graph = () => load('examples/graph/credit_risk.graph.json')
const trace = () => load('examples/traces/credit_risk.trace.json')

test('example graph is valid', () => {
  assert.equal(validateGraph(graph()).ok, true)
})

test('tampered evidence is detected', () => {
  const g = graph()
  g.sources[0].text = g.sources[0].text.replace('650 is my floor', '600 is my floor')
  const codes = validateGraph(g).issues.map((i) => i.code)
  assert.ok(codes.includes('source_hash_mismatch'))
  assert.ok(codes.includes('span_hash_mismatch'))
})

test('a regulatory conflict must be blocked', () => {
  const g = graph()
  g.claims.find((c) => c.id === 'c:married-coapplicant').status = 'sme_confirmed'
  g.claims.find((c) => c.id === 'c:married-coapplicant').confirmed_by = ['ex:jane-doe']
  assert.ok(validateGraph(g).issues.some((i) => i.code === 'unblocked_conflict'))
})

test('retrieval excludes blocked and unconfirmed claims and always includes exclusions', () => {
  const pack = buildContextPack(graph(), 'Should a 25 year old with a 640 FICO and medical debt be approved?')
  const ids = pack.claims.map((c) => c.id)
  assert.ok(!ids.includes('c:age-trajectory'))
  assert.ok(!ids.includes('c:medical-debt-half'))
  assert.ok(ids.includes('c:excl-pricing'))
})

test('retrieval never returns a rule without its exceptions', () => {
  const pack = buildContextPack(graph(), 'What is the minimum years at the job for standard tier?')
  const ids = pack.claims.map((c) => c.id)
  assert.ok(ids.includes('c:employment-min'))
  assert.ok(ids.includes('c:self-employed-tenure'))
})

test('verifier catches invented ids and ungrounded numbers', () => {
  const v = verifyTrace(graph(), trace())
  const bad = v.segments.find((s) => s.text.includes('2%'))
  const codes = bad.issues.map((i) => i.code)
  assert.ok(codes.includes('unknown_claim'))
  assert.ok(codes.includes('unsupported_number'))
  assert.equal(bad.tal, 0)
  assert.equal(v.verdict, 'fail')
})

test('verifier rejects citations of blocked claims', () => {
  const t = trace()
  t.answer.segments = [{ id: 'x', text: 'A married co-applicant makes the file stronger.', kind: 'entailed', claims: ['c:married-coapplicant'] }]
  const v = verifyTrace(graph(), t)
  assert.equal(v.segments[0].issues[0].code, 'ineligible_claim')
})

test('grounded sentences reach the assurance level of their weakest claim', () => {
  const v = verifyTrace(graph(), trace())
  const s = v.segments.find((x) => x.text.startsWith('A 690 FICO'))
  assert.equal(s.tal, 4) // both cited claims are validated
  const d = v.segments.find((x) => x.text.startsWith('DTI is 35%'))
  assert.equal(d.tal, 3) // c:dti-ceiling is sme_confirmed, not validated
})

test('expert credit sums to one', () => {
  const v = verifyTrace(graph(), trace())
  const sum = Object.values(v.expert_credit).reduce((a, b) => a + b, 0)
  assert.ok(Math.abs(sum - 1) < 1e-3)
})
