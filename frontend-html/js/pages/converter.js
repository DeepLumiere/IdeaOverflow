/* ═══════════════════════════════════════════
   Converter Page — Full Typst Pipeline Workflow
   Upload → Template → Layout → Convert → Preview → Download
   ═══════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages.converter = function (container) {
  // ── Supported conferences (must match backend templates) ──
  const CONFERENCES = [
    { id: 'ieee',     name: 'IEEE',     icon: '📊', desc: 'Two-column, numbered citations' },
    { id: 'acm',      name: 'ACM',      icon: '🏛️', desc: 'Single-column, balanced layout' },
    { id: 'neurips',  name: 'NeurIPS',  icon: '🧠', desc: 'ML conference, wide margins' },
    { id: 'springer', name: 'Springer', icon: '📚', desc: 'LNCS proceedings format' },
    { id: 'elsevier', name: 'Elsevier', icon: '📰', desc: 'Journal article format' },
  ];

  const LAYOUTS = [
    { id: 'single-column', name: 'Single Column', icon: '📄' },
    { id: 'double-column', name: 'Double Column', icon: '📰' },
  ];

  // ── Local state ──
  let selectedConf = 'ieee';
  let selectedLayout = 'single-column';
  let uploadedFile = null;
  let pipelineStatus = 'idle';       // idle | uploading | processing | done | error
  let pipelineMessage = '';
  let pdfBlobUrl = null;
  let pdfBlob = null;
  let schemaJson = null;
  let jsonUrl = null;

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── JSON Tree Builder ──
  function buildJsonTree(data, key, depth) {
    depth = depth || 0;
    const isRoot = key === undefined;

    if (data === null || data === undefined) {
      return isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span><span class="jt-null">null</span>`;
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        const label = isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span>`;
        return `<div class="jt-line">${label}<span class="jt-bracket">[]</span></div>`;
      }
      const header = isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span>`;
      const items = data.map((item, i) => {
        if (typeof item === 'object' && item !== null) {
          return `<div class="jt-node">
            <div class="jt-line"><button class="jt-toggle">▾</button><span class="jt-index">[${i}]</span></div>
            <div class="jt-children">${Object.keys(item).map(k => buildJsonTree(item[k], k, depth + 2)).join('')}</div>
          </div>`;
        }
        return buildJsonTree(item, `[${i}]`, depth + 1);
      }).join('');
      return `<div class="jt-node">
        <div class="jt-line"><button class="jt-toggle">▾</button>${header}<span class="jt-badge">${data.length} items</span></div>
        <div class="jt-children">${items}</div>
      </div>`;
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        const label = isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span>`;
        return `<div class="jt-line">${label}<span class="jt-bracket">{}</span></div>`;
      }
      const header = isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span>`;
      const children = keys.map(k => buildJsonTree(data[k], k, depth + 1)).join('');
      if (isRoot) return children;
      return `<div class="jt-node">
        <div class="jt-line"><button class="jt-toggle">▾</button>${header}<span class="jt-badge">${keys.length} fields</span></div>
        <div class="jt-children">${children}</div>
      </div>`;
    }

    // Primitive
    const val = typeof data === 'string'
      ? `<span class="jt-str">"${escapeHtml(data.length > 120 ? data.slice(0, 120) + '…' : data)}"</span>`
      : `<span class="jt-num">${escapeHtml(String(data))}</span>`;
    const label = isRoot ? '' : `<span class="jt-key">${escapeHtml(String(key))}</span><span class="jt-sep">: </span>`;
    return `<div class="jt-line">${label}${val}</div>`;
  }

  function formatSize(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const u = ['B', 'KB', 'MB'];
    const i = Math.min(u.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${u[i]}`;
  }

  // ── Render ──
  function render() {
    container.innerHTML = `
      ${App.renderNavbar()}
      <main style="flex: 1;">
        <div class="mx-auto max-w-5xl px-6 py-10 fade-in">
          <h1 class="tracking-tight text-primary" style="font-size: clamp(1.5rem, 4vw, 2.25rem);">
            Convert to Conference PDF
          </h1>
          <p class="text-secondary mt-2" style="max-width: 40rem;">
            Upload a research paper, pick a conference template and layout, then convert to a formatted PDF.
          </p>

          <!-- Steps -->
          <div class="converter-steps mt-8">
            ${renderStepIndicator()}
          </div>

          <div class="converter-grid mt-6">
            <!-- Left: Controls -->
            <div class="converter-controls">
              ${renderUploadSection()}
              ${renderTemplateSection()}
              ${renderLayoutSection()}
              ${renderConvertButton()}
            </div>

            <!-- Right: Preview -->
            <div class="converter-preview-panel">
              ${renderPreview()}
            </div>
          </div>
        </div>
      </main>
      ${App.renderFooter()}
    `;

    App.attachNavbarEvents();
    attachEvents();
  }

  // ── Step Indicator ──
  function renderStepIndicator() {
    const steps = [
      { num: 1, label: 'Upload',   done: !!uploadedFile },
      { num: 2, label: 'Template', done: !!selectedConf },
      { num: 3, label: 'Layout',   done: !!selectedLayout },
      { num: 4, label: 'Convert',  done: pipelineStatus === 'done' },
    ];
    return `<div class="step-indicator">${steps.map(s => `
      <div class="step-item ${s.done ? 'done' : ''}">
        <div class="step-circle">${s.done ? '✓' : s.num}</div>
        <span class="step-label">${s.label}</span>
      </div>
    `).join('<div class="step-line"></div>')}</div>`;
  }

  // ── Upload Section ──
  function renderUploadSection() {
    return `
      <section class="converter-section">
        <h2 class="text-base font-semibold text-primary">1. Upload Research Paper</h2>
        <p class="text-sm text-muted mt-1">Supported: PDF, DOCX, TXT, MD</p>
        ${uploadedFile ? `
          <div class="glass-card mt-3 p-3 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-medium text-primary">${escapeHtml(uploadedFile.name)}</div>
              <div class="text-xs text-muted">${formatSize(uploadedFile.size)}</div>
            </div>
            <button class="icon-btn" id="conv-clear-file" title="Remove">✕</button>
          </div>
        ` : `
          <div class="upload-box mt-3" id="conv-upload-area" style="padding: 1.5rem;">
            <div class="upload-box-hover-gradient"></div>
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div class="upload-icon-box">📤</div>
              <p class="mt-3 text-sm font-medium text-primary">Drop file here or click to browse</p>
              <p class="mt-1 text-xs text-muted">PDF, DOCX, TXT, MD — max 20 MB</p>
            </div>
            <input type="file" id="conv-file-input" style="display: none;" accept=".pdf,.tex,.txt,.docx,.md" />
          </div>
        `}
      </section>
    `;
  }

  // ── Template Section ──
  function renderTemplateSection() {
    return `
      <section class="converter-section">
        <h2 class="text-base font-semibold text-primary">2. Select Conference Template</h2>
        <div class="template-grid mt-3">
          ${CONFERENCES.map(c => `
            <button class="template-option ${selectedConf === c.id ? 'selected' : ''}" data-conf="${c.id}">
              <span class="template-icon">${c.icon}</span>
              <span class="template-name">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  // ── Layout Section ──
  function renderLayoutSection() {
    return `
      <section class="converter-section">
        <h2 class="text-base font-semibold text-primary">3. Choose Layout</h2>
        <div class="layout-grid mt-3">
          ${LAYOUTS.map(l => `
            <button class="layout-option ${selectedLayout === l.id ? 'selected' : ''}" data-layout="${l.id}">
              <span class="layout-icon">${l.icon}</span>
              <span class="layout-name">${l.name}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  // ── Convert Button ──
  function renderConvertButton() {
    const disabled = !uploadedFile || pipelineStatus === 'uploading' || pipelineStatus === 'processing';
    const label = {
      idle: '⚡ Convert',
      uploading: '📤 Uploading…',
      processing: '⏳ Converting…',
      done: '🔄 Convert Again',
      error: '⚡ Retry Conversion',
    }[pipelineStatus];

    return `
      <section class="converter-section">
        <button class="btn btn-brand btn-full btn-lg" id="conv-convert-btn" ${disabled ? 'disabled' : ''}>
          ${label}
        </button>
        ${pipelineStatus === 'error' ? `<p class="text-sm mt-2" style="color: #dc2626;">${escapeHtml(pipelineMessage)}</p>` : ''}
        ${pipelineStatus === 'processing' ? `
          <div class="converter-progress mt-3">
            <div class="progress-bar"><div class="progress-bar-fill"></div></div>
            <p class="text-xs text-muted mt-1">${escapeHtml(pipelineMessage)}</p>
          </div>
        ` : ''}
      </section>
    `;
  }

  // ── Preview Panel ──
  function renderPreview() {
    if (pipelineStatus === 'done' && pdfBlobUrl) {
      return `
        <div class="preview-container">
          <div class="preview-header">
            <h2 class="text-base font-semibold text-primary">Preview</h2>
            <div class="preview-actions">
              <button class="btn btn-brand btn-sm" id="conv-download-pdf">⬇ Download PDF</button>
              <button class="btn btn-outline btn-sm" id="conv-download-json">⬇ Download JSON</button>
            </div>
          </div>
          <iframe src="${pdfBlobUrl}" class="pdf-iframe" title="PDF Preview"></iframe>
          ${schemaJson ? `
            <details class="json-preview mt-4" open>
              <summary class="text-sm font-semibold text-primary" style="cursor:pointer;">📋 Schema JSON</summary>
              <div class="json-tree mt-2" id="json-tree-root"></div>
            </details>
          ` : ''}
        </div>
      `;
    }
    return `
      <div class="preview-empty">
        <div class="preview-empty-icon">📄</div>
        <p class="text-sm text-muted">Your formatted PDF and JSON will appear here after conversion.</p>
      </div>
    `;
  }

  // ── Event Binding ──
  function attachEvents() {
    // Upload area
    const uploadArea = document.getElementById('conv-upload-area');
    const fileInput = document.getElementById('conv-file-input');
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
      uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragging'); });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
      uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('dragging');
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', e => {
        if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
      });
    }

    // Clear file
    document.getElementById('conv-clear-file')?.addEventListener('click', () => {
      uploadedFile = null;
      pipelineStatus = 'idle';
      pipelineMessage = '';
      revokePdf();
      render();
    });

    // Template selection
    container.querySelectorAll('[data-conf]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedConf = btn.dataset.conf;
        render();
      });
    });

    // Layout selection
    container.querySelectorAll('[data-layout]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLayout = btn.dataset.layout;
        render();
      });
    });

    // Convert button
    document.getElementById('conv-convert-btn')?.addEventListener('click', runPipeline);

    // Download buttons
    document.getElementById('conv-download-pdf')?.addEventListener('click', downloadPdf);
    document.getElementById('conv-download-json')?.addEventListener('click', downloadJson);

    // Render JSON tree if present
    const treeRoot = document.getElementById('json-tree-root');
    if (treeRoot && schemaJson) {
      treeRoot.innerHTML = buildJsonTree(schemaJson);
      treeRoot.querySelectorAll('.jt-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const node = btn.closest('.jt-node');
          node.classList.toggle('jt-collapsed');
        });
      });
    }
  }

  // ── File selection ──
  function handleFileSelect(file) {
    if (file.size > 20 * 1024 * 1024) {
      pipelineStatus = 'error';
      pipelineMessage = 'File exceeds 20 MB limit.';
      render();
      return;
    }
    uploadedFile = file;
    pipelineStatus = 'idle';
    pipelineMessage = '';
    revokePdf();
    render();
  }

  // ── Full Pipeline (single API call) ──
  async function runPipeline() {
    if (!uploadedFile) return;
    pipelineStatus = 'processing';
    revokePdf();
    schemaJson = null;
    jsonUrl = null;

    try {
      pipelineMessage = 'Running full pipeline: extract → clean → detect → map → generate → compile…';
      render();

      const result = await API.runPipeline(uploadedFile, selectedConf, selectedLayout);

      // Store schema JSON data
      schemaJson = result.schema_json || null;
      jsonUrl = result.json_url || null;

      // Fetch the generated PDF from the returned URL
      const pdfRes = await fetch(result.pdf_url);
      if (!pdfRes.ok) throw new Error('Failed to load generated PDF');
      pdfBlob = await pdfRes.blob();
      pdfBlobUrl = URL.createObjectURL(pdfBlob);

      pipelineStatus = 'done';
      pipelineMessage = '';
      render();

    } catch (err) {
      pipelineStatus = 'error';
      pipelineMessage = err.message || 'Conversion failed.';
      render();
    }
  }

  // ── Downloads ──
  function downloadPdf() {
    if (!pdfBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(pdfBlob);
    a.download = 'paper_formatted.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadJson() {
    if (!schemaJson) return;
    const blob = new Blob([JSON.stringify(schemaJson, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'paper.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Cleanup ──
  function revokePdf() {
    if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); pdfBlobUrl = null; }
    pdfBlob = null;
    schemaJson = null;
    jsonUrl = null;
  }

  // Initial render
  render();

  // Return cleanup function
  return () => { revokePdf(); };
};
