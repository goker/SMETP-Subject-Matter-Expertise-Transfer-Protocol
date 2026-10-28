"""Benchmark: (a) plain LLM, (b) LLM + expert JSON in prompt, (c) KG reasoner, (d) hybrid (LLM parses free text, KG decides).
LLM systems run only if OPENAI_API_KEY / ANTHROPIC_API_KEY / XAI_API_KEY is set; otherwise marked PENDING. Never fabricated."""
import json, os, time, statistics, urllib.request, re
from kg import reason, SPEC
CASES = json.load(open("cases.json")); RUNS = int(os.getenv("RUNS", "5"))
import threading; COST = {"ticks": 0}; LOCK = threading.Lock()
from concurrent.futures import ThreadPoolExecutor
PRICE = {"in": float(os.getenv("PRICE_IN_PER_M", "0")), "out": float(os.getenv("PRICE_OUT_PER_M", "0"))}

def llm_backend():
    if os.getenv("OPENAI_API_KEY"): return ("openai", os.getenv("LLM_MODEL", "gpt-4o-mini"), "https://api.openai.com/v1/chat/completions", os.getenv("OPENAI_API_KEY"))
    if os.getenv("XAI_API_KEY"): return ("openai", os.getenv("LLM_MODEL", "grok-3-mini"), "https://api.x.ai/v1/chat/completions", os.getenv("XAI_API_KEY"))
    if os.getenv("ANTHROPIC_API_KEY"): return ("anthropic", os.getenv("LLM_MODEL", "claude-3-5-haiku-latest"), "https://api.anthropic.com/v1/messages", os.getenv("ANTHROPIC_API_KEY"))
    return None

CACHE_F = "llm_cache.jsonl"; CACHE = {}
if os.path.exists(CACHE_F):
    for l in open(CACHE_F):
        d = json.loads(l); CACHE[(d["m"], d["p"], d["k"])] = d["r"]
def call_llm(prompt, k=0):
    key = (os.getenv("LLM_MODEL"), prompt, k)
    if key in CACHE: return tuple(CACHE[key])
    for a in range(4):
        try: r = _call_llm(prompt); break
        except Exception as e:
            if a == 3: raise
            time.sleep(5 * (a + 1))
    with LOCK:
        CACHE[key] = r; open(CACHE_F, "a").write(json.dumps({"m": key[0], "p": prompt, "k": k, "r": r}) + "\n")
    return r
def _call_llm(prompt):
    kind, model, url, key = llm_backend()
    if kind == "openai":
        body = {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.7}
        h = {"Authorization": "Bearer " + key}
    else:
        body = {"model": model, "max_tokens": 600, "messages": [{"role": "user", "content": prompt}]}
        h = {"x-api-key": key, "anthropic-version": "2023-06-01"}
    req = urllib.request.Request(url, json.dumps(body).encode(), {**h, "content-type": "application/json"})
    t = time.time(); r = json.load(urllib.request.urlopen(req, timeout=240)); dt = time.time() - t
    if kind == "openai": txt, u = r["choices"][0]["message"]["content"], r.get("usage", {}); ti, to = u.get("prompt_tokens", 0), u.get("completion_tokens", 0) + u.get("completion_tokens_details", {}).get("reasoning_tokens", 0)
    else: txt, u = r["content"][0]["text"], r["usage"]; ti, to = u["input_tokens"], u["output_tokens"]
    ticks = r.get("usage", {}).get("cost_in_usd_ticks", 0) if kind == "openai" else 0
    return txt, dt, ti, to, ticks

FMT = ('Reply with ONLY JSON: {"decision": "APPROVE|CONDITIONAL|DENY|ESCALATE", "tier": "PRIME|STANDARD|SUBPRIME|null", '
       '"confidence": 0-1 or null, "rule_cited": "name of the specific rule/node used, or null"}. Use ESCALATE if information is missing, invalid or out of scope.')
def p_plain(c): return f"You are a senior credit analyst. Decide on this loan application.\n{json.dumps(c['inputs'])}\n{FMT}"
def p_rag(c):
    doc = {k: SPEC[k] for k in ("inputs", "decision_tree", "heuristics", "edge_cases")}
    return f"You are applying this expert-captured credit policy (SMETP skill):\n{json.dumps(doc)}\nApplication:\n{json.dumps(c['inputs'])}\n{FMT} rule_cited must be a decision_tree node name."
def to_text(i): return "Applicant notes: " + "; ".join(f"{k.replace('_',' ')} is {v}" for k, v in i.items())
def p_parse(c): return ("Extract these fields from the text into JSON (omit any field not stated, never guess): credit_score, income_annual, debt_monthly, "
    "employment_years, savings_months, recent_inquiries, bankruptcy_years_ago, self_employed, has_2yr_tax_returns, tax_return_trend.\n" + to_text(c["inputs"]) + "\nJSON only.")
def jparse(t):
    m = re.search(r"\{.*\}", t, re.S)
    try: return json.loads(m.group(0)) if m else {}
    except Exception: return {}

NODES = set(SPEC["decision_tree"])
def run_system(name):
    def one(c):
        runs = []
        for k in range(RUNS):
            if name == "kg":
                t = time.perf_counter(); r = reason(c["inputs"]); dt = time.perf_counter() - t
                runs.append(dict(decision=r["decision"], tier=r["tier"], cited=len(r["cited_rules"]) > 0 and r["path"][-1] in NODES | {p for p in r["path"] if p.startswith("schema:")}, lat=dt, ti=0, to=0))
            elif name == "hybrid":
                txt, dt, ti, to, tk = call_llm(p_parse(c), k); r = reason(jparse(txt))
                runs.append(dict(decision=r["decision"], tier=r["tier"], cited=True, lat=dt, ti=ti, to=to, tk=tk))
            else:
                txt, dt, ti, to, tk = call_llm(p_plain(c) if name == "llm_plain" else p_rag(c), k); j = jparse(txt)
                rc = j.get("rule_cited")
                runs.append(dict(decision=str(j.get("decision")).upper(), tier=j.get("tier") if j.get("tier") not in ("null", "") else None,
                                 cited=(rc in NODES) if name == "llm_rag" else bool(rc), lat=dt, ti=ti, to=to, tk=tk))
        return dict(case=c, runs=runs)
    with ThreadPoolExecutor(1 if name == "kg" else 8) as ex: return list(ex.map(one, CASES))

def metrics(res):
    acc = [r["decision"] == x["case"]["expected_decision"] for x in res for r in x["runs"]]
    full = [r["decision"] == x["case"]["expected_decision"] and (r["tier"] or None) == x["case"]["expected_tier"] for x in res for r in x["runs"]]
    cons = [len({(r["decision"], r["tier"]) for r in x["runs"]}) == 1 for x in res]
    oos = [x for x in res if x["case"]["category"] == "out_of_scope" or x["case"]["expected_decision"] == "ESCALATE"]
    over = [r["decision"] != "ESCALATE" for x in oos for r in x["runs"]]
    adv = [r["decision"] == x["case"]["expected_decision"] for x in res if x["case"]["category"] == "adversarial" for r in x["runs"]]
    lats = [r["lat"] for x in res for r in x["runs"]]; ti = sum(r["ti"] for x in res for r in x["runs"]); to = sum(r["to"] for x in res for r in x["runs"])
    n = len(lats)
    return {"decision_acc": sum(acc)/len(acc), "decision+tier_acc": sum(full)/len(full), f"consistency_{RUNS}runs": sum(cons)/len(cons),
            "overreach_on_escalate_cases": sum(over)/len(over), "adversarial_acc": sum(adv)/len(adv),
            "citation_rate": sum(r["cited"] for x in res for r in x["runs"])/n, "median_latency_ms": statistics.median(lats)*1000,
            "tokens_per_call": (ti+to)/n, "cost_usd_total": (ti*PRICE["in"]+to*PRICE["out"])/1e6, "billed_cost_usd_xai": sum(r.get("tk",0) for x in res for r in x["runs"])/1e10}

if __name__ == "__main__":
    results = {}
    for s in ("kg", "llm_plain", "llm_rag", "hybrid"):
        if s != "kg" and not llm_backend():
            results[s] = "PENDING: no LLM API key in environment (set OPENAI_API_KEY, XAI_API_KEY or ANTHROPIC_API_KEY, optionally LLM_MODEL, PRICE_IN_PER_M, PRICE_OUT_PER_M)"; continue
        results[s] = metrics(run_system(s))
        if s != "kg": results[s]["runs_per_case"] = RUNS; results[s]["model"] = llm_backend()[1]
        print(s, results[s], flush=True)
    json.dump(results, open("results.json", "w"), indent=1); print(json.dumps(results, indent=1))
