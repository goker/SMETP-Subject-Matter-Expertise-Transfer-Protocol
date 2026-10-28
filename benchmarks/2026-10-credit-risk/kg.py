"""SMETP credit-risk skill encoded as a knowledge graph + deterministic reasoner.
Graph = (subject, predicate, object) triples built from the repo's decision_tree JSON.
No LLM, no randomness."""
import json, re, pathlib
SPEC = json.loads(pathlib.Path(__file__).with_name("repo").joinpath(
    "examples/finance_credit_risk_assessment.json").read_text())
TREE, INPUTS = SPEC["decision_tree"], SPEC["inputs"]
# Ontology: classes and relations
EXTRA_INPUTS = {"has_2yr_tax_returns": "boolean", "tax_return_trend": "string"}  # referenced by tree, absent from inputs schema

def build_triples():
    T = [("Skill:credit_risk", "rdf:type", "smetp:Skill"),
         ("Skill:credit_risk", "smetp:capturedFrom", "SME:" + SPEC["metadata"]["smeName"])]
    for k, v in INPUTS.items():
        T.append(("Input:" + k, "rdf:type", "smetp:InputFeature"))
        T.append(("Input:" + k, "smetp:datatype", v["type"]))
    for n, d in TREE.items():
        if n == "description": continue
        if "condition" in d:
            T += [("Node:" + n, "rdf:type", "smetp:Check"), ("Node:" + n, "smetp:condition", d["condition"]),
                  ("Node:" + n, "smetp:ifTrue", "Node:" + d["yes"]["node"]),
                  ("Node:" + n, "smetp:ifFalse", "Node:" + d["no"]["node"])]
            for var in re.findall(r"[a-z0-9_]+(?= ?[<>=!])", d["condition"]):
                T.append(("Node:" + n, "smetp:tests", "Input:" + var))
        else:
            T += [("Node:" + n, "rdf:type", "smetp:Outcome"), ("Node:" + n, "smetp:decision", d["decision"])]
            if "confidence" in d: T.append(("Node:" + n, "smetp:confidence", d["confidence"]))
    return T

def validate_graph():
    """Static checks on the captured knowledge (SHACL-style)."""
    issues = []
    for n, d in TREE.items():
        if n == "description": continue
        for b in ("yes", "no"):
            if b in d and d[b]["node"] not in TREE: issues.append(f"{n}.{b} -> missing node {d[b]['node']}")
        if "condition" in d:
            for var in re.findall(r"^([a-z0-9_]+)", d["condition"]):
                if var not in INPUTS and var != "debt_to_income":
                    issues.append(f"{n}: tests '{var}', which is not declared in inputs schema")
        if d.get("decision") in ("APPROVE", "CONDITIONAL") and "confidence" not in d:
            issues.append(f"{n}: approval outcome without confidence")
        if d.get("decision") in ("DENY", "ESCALATE") and "confidence" not in d:
            issues.append(f"{n}: {d['decision']} outcome has no confidence value")
    if "3" in TREE["deny_credit_seeking"]["reason"]:
        issues.append("deny_credit_seeking: reason says '>3 inquiries' but the path reaching it fires at >1")
    issues.append("deny_high_dti: reason says '43%' but it is also reached from check_post_bankruptcy_dti (35% threshold)")
    issues.append("check_recent_bankruptcy only sits under credit_score 600-649; applicants >=650 with a bankruptcy <7y are never checked for it")
    return issues

def _eval(cond, f):
    m = re.fullmatch(r"(\w+) (>=|<=|==) (.+)", cond)
    var, op, rhs = m.groups()
    val = f.get(var)
    if rhs == "null": return val is None
    if val is None: raise KeyError(var)
    rhs = {"true": True, "false": False}.get(rhs, rhs.strip("'"))
    if op == "==": return val == rhs
    rhs = float(rhs)
    return val >= rhs if op == ">=" else val <= rhs

def reason(case):
    """Returns dict(decision, tier, confidence, path, cited_rules)."""
    f = dict(case)
    # schema guard = calibrated escalation for out-of-scope input
    for k, spec in INPUTS.items():
        v = f.get(k)
        if v is None:
            if spec.get("required"):
                return dict(decision="ESCALATE", tier=None, confidence=None, path=["schema:" + k],
                            cited_rules=[f"input '{k}' required but missing -> out of scope"])
            continue
        if spec["type"] == "number" and (isinstance(v, bool) or not isinstance(v, (int, float))):
            return dict(decision="ESCALATE", tier=None, confidence=None, path=["schema:" + k], cited_rules=[f"'{k}' not numeric"])
        if spec["type"] == "boolean" and not isinstance(v, bool):
            return dict(decision="ESCALATE", tier=None, confidence=None, path=["schema:" + k], cited_rules=[f"'{k}' not boolean"])
        lo, hi = spec.get("min", spec.get("minimum")), spec.get("max")
        if (lo is not None and v < lo) or (hi is not None and v > hi):
            return dict(decision="ESCALATE", tier=None, confidence=None, path=["schema:" + k], cited_rules=[f"'{k}'={v} outside [{lo},{hi}]"])
    if f["income_annual"] <= 0:
        return dict(decision="ESCALATE", tier=None, confidence=None, path=["schema:income_annual"], cited_rules=["DTI undefined at zero income"])
    f["debt_to_income"] = f["debt_monthly"] / (f["income_annual"] / 12)
    node, path, cited = "root", [], []
    while True:
        d = TREE[node]; path.append(node)
        if "condition" in d:
            try: r = _eval(d["condition"], f)
            except KeyError as e:
                return dict(decision="ESCALATE", tier=None, confidence=None, path=path,
                            cited_rules=cited + [f"{node}: needs '{e.args[0]}' which was not provided -> escalate"])
            cited.append(f"{node}: {d['condition']} = {r}")
            node = d["yes" if r else "no"]["node"]
        else:
            return dict(decision=d["decision"], tier=d.get("tier"), confidence=d.get("confidence"),
                        path=path, cited_rules=cited + [f"{node}: {d['reason']}"])

if __name__ == "__main__":
    print(len(build_triples()), "triples")
    for i in validate_graph(): print("ISSUE:", i)
    for tc in SPEC["validation"]["test_cases"]:
        r = reason(tc["inputs"]); e = tc["expectedOutput"]
        print(("OK  " if r["decision"] == e["decision"] and r.get("tier") == e.get("tier") else "MISMATCH"),
              tc["name"], "| tree:", r["decision"], r["tier"], "| doc expects:", e["decision"], e.get("tier"))
