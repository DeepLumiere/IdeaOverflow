"""Quick test of all API endpoints that the frontend uses."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import requests
import json

BASE = "http://127.0.0.1:8100"
results = []

# 1. GET /manuscript
try:
    r = requests.get(f"{BASE}/manuscript")
    results.append(("GET /manuscript", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
except Exception as e:
    results.append(("GET /manuscript", 0, str(e)[:80]))

# 2. GET /manuscript/schema
try:
    r = requests.get(f"{BASE}/manuscript/schema")
    results.append(("GET /manuscript/schema", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
except Exception as e:
    results.append(("GET /manuscript/schema", 0, str(e)[:80]))

# 3. POST /upload (TXT file)
try:
    r = requests.post(f"{BASE}/upload", files={"file": ("test.txt", b"Deep Learning for OCR\n\nJohn Smith\n\nAbstract\nThis paper studies OCR.\n\nIntroduction\nOCR has evolved.\n\nMethodology\nWe propose a CNN.\n\nConclusion\nWe presented results.", "text/plain")})
    results.append(("POST /upload", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
    raw_text = r.json().get("raw_text", "") if r.status_code == 200 else ""
except Exception as e:
    results.append(("POST /upload", 0, str(e)[:80]))
    raw_text = ""

# 4. POST /clean
try:
    r = requests.post(f"{BASE}/clean", json={"raw_text": raw_text})
    results.append(("POST /clean", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
    clean_text = r.json().get("clean_text", "") if r.status_code == 200 else ""
except Exception as e:
    results.append(("POST /clean", 0, str(e)[:80]))
    clean_text = ""

# 5. POST /detect-sections
try:
    r = requests.post(f"{BASE}/detect-sections", json={"clean_text": clean_text})
    results.append(("POST /detect-sections", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
    if r.status_code == 200:
        doc = r.json().get("document", {})
        detail = f"title={doc.get('title','?')}, sections={len(doc.get('sections',[]))}"
        results[-1] = ("POST /detect-sections", 200, detail)
except Exception as e:
    results.append(("POST /detect-sections", 0, str(e)[:80]))

# 6. POST /parse
try:
    r = requests.post(f"{BASE}/parse", json={"latex_code": "\\section{Intro}\nHello world"})
    results.append(("POST /parse", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
except Exception as e:
    results.append(("POST /parse", 0, str(e)[:80]))

# 7. POST /compile
try:
    r = requests.post(f"{BASE}/compile", json={"latex_code": "\\documentclass{article}\\begin{document}Hello\\end{document}"})
    if r.status_code == 200:
        results.append(("POST /compile", 200, f"PDF returned ({len(r.content)} bytes)"))
    else:
        results.append(("POST /compile", r.status_code, r.text[:80]))
except Exception as e:
    results.append(("POST /compile", 0, str(e)[:80]))

# 8. GET / (SPA frontend)
try:
    r = requests.get(f"{BASE}/")
    has_html = "IdeaOverflow" in r.text if r.status_code == 200 else False
    results.append(("GET / (frontend HTML)", r.status_code, "OK (IdeaOverflow found)" if has_html else r.text[:80]))
except Exception as e:
    results.append(("GET / (frontend HTML)", 0, str(e)[:80]))

# 9. Registered routes check
try:
    r = requests.get(f"{BASE}/openapi.json")
    routes = list(r.json().get("paths", {}).keys()) if r.status_code == 200 else []
    results.append(("OpenAPI routes", r.status_code, ", ".join(routes)))
except Exception as e:
    results.append(("OpenAPI routes", 0, str(e)[:80]))

# Print results
print("=" * 75)
print(f"  {'Endpoint':<30} {'Status':<8} {'Result'}")
print("=" * 75)
for name, status, msg in results:
    icon = "✅" if status == 200 else "❌"
    print(f"  {icon} {name:<28} {status:<8} {msg}")
print("=" * 75)

# Frontend ↔ Backend match check
frontend_endpoints = {
    "GET /manuscript": "getManuscript()",
    "GET /manuscript/schema": "getSchema()",
    "POST /parse": "parse()",
    "POST /compile": "compile()",
    "POST /upload": "uploadFile()",
    "POST /clean": "cleanText()",
    "POST /detect-sections": "detectSections()",
}
print("\n  Frontend ↔ Backend Mapping:")
for endpoint, method in frontend_endpoints.items():
    matched = any(name == endpoint and status == 200 for name, status, _ in results)
    icon = "✅" if matched else "❌"
    print(f"    {icon} API.{method:<25} → {endpoint}")
