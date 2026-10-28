import json,os
os.environ.pop("XAI_API_KEY",None)
import bench
from bench import *
C={}
for l in open("llm_cache.jsonl"):
    d=json.loads(l); C[(d["p"],d["k"])]=d["r"]
n=s=acc=0
for c in CASES:
    p=p_plain(c)
    if all((p,k) in C for k in range(3)):
        outs=set()
        for k in range(3):
            j=jparse(C[(p,k)][0]); outs.add((j.get("decision"),j.get("tier") or None) if isinstance(j,dict) else None)
        n+=1; s+= len(outs)==1
print("plain cases with 3 runs:",n,"consistent:",s, s/max(n,1))
