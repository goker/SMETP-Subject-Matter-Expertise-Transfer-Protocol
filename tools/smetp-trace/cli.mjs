#!/usr/bin/env node
// smetp-trace: plug an SMETP knowledge graph into any LLM and verify the answer.
//
//   node tools/smetp-trace/cli.mjs validate <graph.json>
//   node tools/smetp-trace/cli.mjs context  <graph.json> "<question>" [--json] [--hops 1] [--floor sme_confirmed]
//   node tools/smetp-trace/cli.mjs verify   <graph.json> <trace.json> [--out verified.json]
//   node tools/smetp-trace/cli.mjs ask      <graph.json> "<question>" --provider anthropic|openai|openai-compatible
//                                           [--model NAME] [--base-url URL] [--response answer.json] [--out trace.json]
//
// `ask` builds the context pack, sends the Cite-or-Refuse prompt to the model,
// turns the JSON reply into a trace, and verifies it. Use --response to verify
// an answer you already have (from any chat UI) without a network call.
// Keys: ANTHROPIC_API_KEY, OPENAI_API_KEY, or LLM_API_KEY for openai-compatible
// endpoints (Ollama, vLLM, LM Studio, Gemini's OpenAI-compatible API, ...).

import { readFileSync, writeFileSync } from 'node:fs'
import {
  validateGraph, buildContextPack, renderPrompt, verifyTrace, traceFromModelAnswer,
} from './lib.mjs'

const [cmd, ...rest] = process.argv.slice(2)
const flags = {}
const pos = []
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) {
    const k = rest[i].slice(2)
    const next = rest[i + 1]
    if (next === undefined || next.startsWith('--')) flags[k] = true
    else { flags[k] = next; i++ }
  } else pos.push(rest[i])
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const out = (obj) => {
  const s = JSON.stringify(obj, null, 2)
  if (flags.out) { writeFileSync(flags.out, s + '\n'); console.error(`wrote ${flags.out}`) } else console.log(s)
}

function printVerification(v) {
  const icon = { pass: 'PASS', pass_with_warnings: 'PASS (warnings)', fail: 'FAIL' }[v.verdict]
  console.error(`\n${icon}  grounded ${(v.metrics.grounded_ratio * 100).toFixed(0)}%  mean TAL ${v.metrics.mean_tal}  citation validity ${(v.metrics.citation_validity * 100).toFixed(0)}%  unsupported numbers ${v.metrics.unsupported_numbers}`)
  for (const s of v.segments) {
    console.error(`  [TAL ${s.tal}] ${s.text}`)
    for (const i of s.issues) console.error(`      ${i.level === 'error' ? 'x' : '!'} ${i.code}: ${i.msg}`)
  }
  if (Object.keys(v.expert_credit).length) console.error(`  credit: ${Object.entries(v.expert_credit).map(([k, n]) => `${k} ${(n * 100).toFixed(0)}%`).join(', ')}`)
}

async function callModel(prompt) {
  const provider = flags.provider
  if (provider === 'anthropic') {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY is not set')
    const model = flags.model ?? 'claude-sonnet-4-5'
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 1500, temperature: 0, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return { model: { provider, name: model, temperature: 0 }, text: data.content.map((b) => b.text ?? '').join('') }
  }
  if (provider === 'openai' || provider === 'openai-compatible') {
    const key = provider === 'openai' ? process.env.OPENAI_API_KEY : (process.env.LLM_API_KEY ?? 'none')
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    const base = flags['base-url'] ?? 'https://api.openai.com/v1'
    const model = flags.model ?? 'gpt-4.1'
    const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    })
    if (!res.ok) throw new Error(`${provider} ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return { model: { provider, name: model, temperature: 0 }, text: data.choices[0].message.content }
  }
  throw new Error('--provider must be anthropic, openai, or openai-compatible (or pass --response)')
}

function parseAnswer(text) {
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) throw new Error('model reply contained no JSON object')
  return JSON.parse(m[0])
}

async function main() {
  if (cmd === 'validate') {
    const g = readJson(pos[0])
    const r = validateGraph(g)
    for (const i of r.issues) console.error(`${i.level === 'error' ? 'x' : '!'} ${i.id} ${i.code}: ${i.msg}`)
    console.error(r.ok ? `OK  ${pos[0]}` : `INVALID  ${pos[0]}`)
    process.exit(r.ok ? 0 : 1)
  }
  if (cmd === 'context') {
    const g = readJson(pos[0])
    const pack = buildContextPack(g, pos[1], { hops: Number(flags.hops ?? 1), floor: flags.floor })
    if (flags.json) out(pack)
    else console.log(renderPrompt(pack))
    return
  }
  if (cmd === 'verify') {
    const g = readJson(pos[0])
    const t = readJson(pos[1])
    const verification = verifyTrace(g, t)
    printVerification(verification)
    out({ ...t, verification })
    process.exit(verification.verdict === 'fail' ? 2 : 0)
  }
  if (cmd === 'ask') {
    const graphText = readFileSync(pos[0], 'utf8')
    const g = JSON.parse(graphText)
    const question = pos[1]
    const pack = buildContextPack(g, question, { hops: Number(flags.hops ?? 1), floor: flags.floor })
    const prompt = renderPrompt(pack)
    let model, answer
    if (flags.response) {
      answer = readJson(flags.response)
      model = { provider: flags.provider ?? 'external', name: flags.model ?? 'unknown' }
    } else {
      const r = await callModel(prompt)
      model = r.model
      answer = parseAnswer(r.text)
    }
    const workflowRuns = flags.runs ? readJson(flags.runs) : []
    const trace = traceFromModelAnswer({ graph: g, pack, question, model, answer, workflowRuns, graphText })
    const verification = verifyTrace(g, trace)
    printVerification(verification)
    out({ ...trace, verification })
    process.exit(verification.verdict === 'fail' ? 2 : 0)
  }
  console.error('usage: cli.mjs validate|context|verify|ask ... (see header of this file)')
  process.exit(64)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
