# Frontend-Backend API Connection Analysis

**Date:** March 6, 2026  
**Status:** ⚠️ ISSUES FOUND

---

## Summary
The frontend and backend are **mostly connected properly**, but there is **1 critical issue** with the `/chat` endpoint.

---

## ✅ Working Endpoints (Properly Connected)

| # | HTTP Method | Endpoint | Frontend Call | Backend Handler | Status |
|---|---|---|---|---|---|
| 1 | GET | `/manuscript` | `API.getManuscript()` | `async def get_manuscript()` | ✅ OK |
| 2 | GET | `/manuscript/schema` | `API.getSchema()` | `async def get_manuscript_schema()` | ✅ OK |
| 3 | POST | `/upload` | `API.uploadFile(file)` | `async def upload_document()` | ✅ OK |
| 4 | POST | `/clean` | `API.cleanText(rawText)` | `async def clean_document()` | ✅ OK |
| 5 | POST | `/detect-sections` | `API.detectSections(cleanText)` | `async def detect_sections()` | ✅ OK |
| 6 | POST | `/parse` | `API.parse(latexCode)` | `async def parse_latex()` | ✅ OK |
| 7 | POST | `/compile` | `API.compile(latexCode)` | `async def compile_latex()` | ✅ OK |

---

## ❌ Issues Found

### **ISSUE #1: `/chat` Endpoint - Parameter Mismatch (CRITICAL)**

**Location:** `main.py` line 155 & `api.js` line 45

#### The Problem:
The frontend and backend have **incompatible parameter passing** for the `/chat` endpoint.

**Backend Function Signature:**
```python
@app.post("/chat")
async def chat_with_gemini(request: LatexRequest, query: str):
    # LatexRequest = {"latex_code": str}
    # query = query parameter (in URL)
    response = await ai_assistant.ask_gemini(request.latex_code, query)
    return {"response": response}
```

**Frontend Call:**
```javascript
async chat(docJson, query) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            latex_code: JSON.stringify(docJson, null, 2),
            query: query,  // ❌ SENDING IN BODY, NOT AS QUERY PARAM
        }),
    });
    return res.json();
}
```

#### Expected vs Actual:

| Parameter | Expected (Backend) | Actual (Frontend) |
|---|---|---|
| **latex_code** | In JSON body ✅ | In JSON body ✅ |
| **query** | As URL query parameter `?query=...` ❌ | In JSON body ❌ |

#### How to Fix:

**Option A - Fix Backend (Recommended):**
Update `main.py` line 155:
```python
class ChatRequest(BaseModel):
    latex_code: str
    query: str

@app.post("/chat")
async def chat_with_gemini(request: ChatRequest):
    response = await ai_assistant.ask_gemini(request.latex_code, request.query)
    return {"response": response}
```

**Option B - Fix Frontend:**
Update `api.js` line 45-52:
```javascript
async chat(docJson, query) {
    const res = await fetch(`${API_BASE}/chat?query=${encodeURIComponent(query)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            latex_code: JSON.stringify(docJson, null, 2),
        }),
    });
    if (!res.ok) throw new Error('Backend error');
    return res.json();
}
```

**Recommendation:** Use Option A (fix backend) as it's cleaner and more RESTful for a POST request with JSON payload.

---

## 📋 API Endpoint Summary

### Backend Routes Defined (in `main.py`):
```
✅ POST /upload          - Extract text from uploaded files
✅ POST /clean           - Clean extracted text
✅ POST /detect-sections - Detect document sections
✅ POST /parse           - Parse LaTeX to AST
✅ POST /compile         - Compile LaTeX to PDF
❌ POST /chat            - Ask AI (parameter mismatch)
✅ GET  /manuscript      - Get paper.json
✅ GET  /manuscript/schema - Get paper-schema.json
✅ GET  /{full_path}     - SPA catch-all (serve index.html)
```

### Frontend API Calls (in `api.js`):
```
✅ getManuscript()       → GET /manuscript
✅ getSchema()           → GET /manuscript/schema
✅ parse()               → POST /parse
✅ compile()             → POST /compile
❌ chat()                → POST /chat (BROKEN)
✅ uploadFile()          → POST /upload
✅ cleanText()           → POST /clean
✅ detectSections()      → POST /detect-sections
```

---

## 🧪 Test Results

From `test_endpoints.py`:
- The test file validates endpoints 1-9
- **Does NOT test** the `/chat` endpoint parameter format

---

## 🔧 Recommended Actions

### Immediate (Critical):
1. **Fix the `/chat` endpoint** - Choose Option A above

### Testing:
```bash
# Test /chat endpoint after fix
curl -X POST "http://127.0.0.1:8100/chat" \
  -H "Content-Type: application/json" \
  -d '{"latex_code": "test", "query": "hello"}'
```

### Testing Script Update:
Add to `test_endpoints.py` after line 59:
```python
# 10. POST /chat
try:
    r = requests.post(f"{BASE}/chat", 
        json={"latex_code": "Sample text", "query": "What is this about?"})
    results.append(("POST /chat", r.status_code, "OK" if r.status_code == 200 else r.text[:80]))
except Exception as e:
    results.append(("POST /chat", 0, str(e)[:80]))
```

---

## 📊 Connection Health Score

- **Endpoints working properly:** 7/8 (87.5%)
- **Critical issues:** 1
- **Overall Status:** ⚠️ Needs fix to `/chat` endpoint

Once the `/chat` endpoint is fixed, the connection will be **100% operational**.
