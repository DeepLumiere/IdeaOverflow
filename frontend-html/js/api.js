/* ═══════════════════════════════════════════
   API Client — all FastAPI backend endpoints
   ═══════════════════════════════════════════ */

const API_BASE = window.location.origin;

const API = {
    /** GET /manuscript — load paper.json from backend */
    async getManuscript() {
        const res = await fetch(`${API_BASE}/manuscript`);
        if (!res.ok) throw new Error('Failed to load manuscript');
        return res.json();
    },

    /** GET /manuscript/schema — load paper-schema.json */
    async getSchema() {
        const res = await fetch(`${API_BASE}/manuscript/schema`);
        if (!res.ok) throw new Error('Failed to load schema');
        return res.json();
    },

    /** POST /parse — parse LaTeX code into AST */
    async parse(latexCode) {
        const res = await fetch(`${API_BASE}/parse`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latex_code: latexCode }),
        });
        if (!res.ok) throw new Error('Parse error');
        return res.json();
    },

    /** POST /compile — compile LaTeX to PDF */
    async compile(latexCode) {
        const res = await fetch(`${API_BASE}/compile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latex_code: latexCode }),
        });
        if (!res.ok) throw new Error('Compilation failed');
        return res.blob();
    },

    /** POST /chat — ask AI about document */
    async chat(docJson, query) {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latex_code: JSON.stringify(docJson, null, 2),
                query: query,
            }),
        });
        if (!res.ok) throw new Error('Backend error');
        return res.json();
    },

    /** POST /upload — upload a file and extract raw text */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Upload failed');
        }
        return res.json();
    },

    /** POST /clean — clean raw text (remove noise, normalise headings) */
    async cleanText(rawText) {
        const res = await fetch(`${API_BASE}/clean`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raw_text: rawText }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Cleaning failed');
        }
        return res.json();
    },

    /** POST /detect-sections — detect sections and build document AST */
    async detectSections(cleanText) {
        const res = await fetch(`${API_BASE}/detect-sections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clean_text: cleanText }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Section detection failed');
        }
        return res.json();
    },

    /** POST /format-citations — format raw references via Crossref lookup */
    async formatCitations(references, style = 'ieee') {
        const res = await fetch(`${API_BASE}/format-citations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ references, style }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Citation formatting failed');
        }
        return res.json();
    },

    /** GET /templates — list available conference templates */
    async getTemplates() {
        const res = await fetch(`${API_BASE}/templates`);
        if (!res.ok) throw new Error('Failed to load templates');
        return res.json();
    },

    /** POST /map-template — map document AST to a Typst template */
    async mapTemplate(document, conference, layout) {
        const res = await fetch(`${API_BASE}/map-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document, conference, layout }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Template mapping failed');
        }
        return res.json();
    },

    /** POST /generate-typst — generate a .typ file from document data */
    async generateTypst({ document, conference, layout, mapped_data, formatted_references } = {}) {
        const res = await fetch(`${API_BASE}/generate-typst`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document, conference, layout, mapped_data, formatted_references }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Typst generation failed');
        }
        return res.json();
    },

    /** POST /compile-typst — generate + compile Typst to PDF, returns blob */
    async compileTypst({ document, conference, layout, mapped_data, formatted_references } = {}) {
        const res = await fetch(`${API_BASE}/compile-typst`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document, conference, layout, mapped_data, formatted_references }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Typst compilation failed');
        }
        return res.blob();
    },

    /** POST /schema-json — map AST to schema JSON and generate file */
    async schemaJson(document) {
        const res = await fetch(`${API_BASE}/schema-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Schema mapping failed');
        }
        return res.json();
    },

    /** POST /api/debug-json — debug: return schema JSON without saving */
    async debugJson(document) {
        const res = await fetch(`${API_BASE}/api/debug-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Debug JSON failed');
        }
        return res.json();
    },

    /** POST /pipeline — complete pipeline: file upload → JSON + PDF */
    async runPipeline(file, conference = 'ieee', layout = 'single-column') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conference', conference);
        formData.append('layout', layout);
        const res = await fetch(`${API_BASE}/pipeline`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || 'Pipeline failed');
        }
        return res.json();
    },
};

window.API = API;
