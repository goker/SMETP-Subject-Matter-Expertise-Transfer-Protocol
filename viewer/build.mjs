// node viewer/build.mjs [graph.json] [verified-trace.json] [out.html]
// Embeds a graph and a verified trace into the viewer so it opens with no server.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const [graphPath = join(here, '../examples/graph/credit_risk.graph.json'),
  tracePath = join(here, '../examples/traces/credit_risk.trace.json'),
  outPath = join(here, 'trace-viewer.html')] = process.argv.slice(2)

const safe = (p) => JSON.stringify(JSON.parse(readFileSync(p, 'utf8'))).replace(/</g, '\\u003c')
const html = readFileSync(join(here, 'template.html'), 'utf8')
  .replace('/*GRAPH*/null', safe(graphPath))
  .replace('/*TRACE*/null', safe(tracePath))
writeFileSync(outPath, `<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${html}\n</html>\n`)
console.error(`wrote ${outPath}`)
