/* ═══════════════════════════════════════════
   Home Page — Upload + Conference Selection
   ═══════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages.home = function (container) {
  const user = AppState.user;
  const conf = AppState.selectedConference;
  const uploadedFile = AppState.uploadedFile;

  const confs = [
    { id: 'ieee', name: 'IEEE Conference', description: 'Two-column layout with a crisp, technical tone.' },
    { id: 'acm', name: 'ACM Conference', description: 'Clean single-column layout focused on readability.' },
    { id: 'springer', name: 'Springer Conference', description: 'Proceedings style with structured headings and spacing.' },
    { id: 'nature', name: 'Nature', description: 'Scientific journal format with Harvard citations.' },
    { id: 'arxiv', name: 'ArXiv Preprint', description: 'Flexible preprint format for open access.' },
    { id: 'iclr', name: 'ICLR', description: 'Machine learning conference, IEEE-style.' },
    { id: 'cvpr', name: 'CVPR', description: 'Computer vision conference, two-column.' },
    { id: 'acl', name: 'ACL', description: 'NLP conference format with author-year citations.' },
  ];

  function renderConfCards() {
    return confs.map(c => `
      <div class="conf-card ${AppState.selectedConference === c.id ? 'selected' : ''}" data-conf="${c.id}">
        <div class="conf-card-hover-gradient"></div>
        <div class="conf-card-inner">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-primary leading-tight">${c.name}</h3>
              <p class="mt-1 text-sm text-secondary">${c.description}</p>
            </div>
            ${AppState.selectedConference === c.id ? '<span style="color: var(--brand-from); font-size: 1.2rem;">✓</span>' : ''}
          </div>
          <button class="btn ${AppState.selectedConference === c.id ? 'btn-brand' : 'btn-primary'} btn-full" style="margin-top: 1rem;" data-select-conf="${c.id}">
            ${AppState.selectedConference === c.id ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = `
    ${App.renderNavbar()}
    <main style="flex: 1;">
      <div class="mx-auto max-w-7xl px-6 py-10 fade-in">
        <div class="flex flex-col gap-2">
          <h1 class="tracking-tight text-primary" style="font-size: clamp(1.5rem, 4vw, 2.25rem);">Build conference papers, fast</h1>
          <p class="text-secondary" style="max-width: 40rem;">Upload a manuscript (optional), choose a template, then compose structured sections with a live preview.</p>
          <div class="text-sm text-muted">Signed in as <span class="font-medium text-primary">${user?.email || ''}</span></div>
        </div>

        <div style="margin-top: 2.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;" id="home-grid">
          <!-- Upload Section -->
          <section>
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="text-lg font-semibold text-primary">File upload</h2>
              <span id="file-badge" class="file-selected-badge" style="${uploadedFile ? '' : 'display: none;'}">
                Selected: <span id="file-badge-name">${uploadedFile?.name || ''}</span>
              </span>
            </div>
            <div class="mt-4">
              <div class="upload-box" id="upload-area">
                <div class="upload-box-hover-gradient"></div>
                <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                  <div class="upload-icon-box">📤</div>
                  <h3 class="mt-4 text-base font-semibold text-primary">Upload files</h3>
                  <p class="mt-1 text-sm text-secondary">Drag & drop a PDF / LaTeX / text / Word file here, or click to browse.</p>
                  <p class="mt-2 text-xs text-muted">Supported: PDF, .tex, .txt, .docx</p>
                  <div class="mt-4">
                    <span class="btn btn-primary">Browse files</span>
                  </div>
                </div>
                <input type="file" id="file-input" style="display: none;" accept=".pdf,.tex,.txt,.docx,application/pdf,text/plain,application/x-latex,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
              </div>

              <div id="file-info" class="glass-card mt-4 p-4" style="${uploadedFile ? '' : 'display: none;'}">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="text-sm font-medium text-primary" id="file-info-name">${uploadedFile?.name || ''}</div>
                    <div class="mt-1 text-xs text-muted" id="file-info-size"></div>
                  </div>
                  <button class="icon-btn" id="clear-file" title="Clear" style="height: 2rem; width: 2rem; font-size: 0.85rem;">✕</button>
                </div>
              </div>
              <div id="extraction-preview" class="glass-card mt-4 p-4" style="display: none;"></div>
            </div>
          </section>

          <!-- Conference Section -->
          <section>
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="text-lg font-semibold text-primary">Select a conference</h2>
              <div class="text-xs text-muted">Current: <span class="font-medium">${AppState.selectedConference}</span></div>
            </div>
            <div class="mt-4" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;" id="conf-cards">
              ${renderConfCards()}
            </div>
          </section>
        </div>
      </div>
    </main>
    ${App.renderFooter()}
  `;

  App.attachNavbarEvents();

  // File upload
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileBadge = document.getElementById('file-badge');

  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragging');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });

  function formatSize(bytes) {
    if (!bytes || bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${sizes[i]}`;
  }

  function handleFile(file) {
    const meta = { name: file.name, size: file.size, type: file.type, lastModified: file.lastModified };
    State.setUploadedFile(meta);

    // Show file info immediately
    document.getElementById('file-info-name').textContent = file.name;
    document.getElementById('file-info-size').textContent = formatSize(file.size) + ' • Uploading…';
    document.getElementById('file-badge-name').textContent = file.name;
    fileInfo.style.display = '';
    fileBadge.style.display = '';

    // Upload to backend for text extraction
    API.uploadFile(file).then(result => {
      // Store raw_text in state for later pipeline stages
      AppState.extractedText = result.raw_text;
      AppState.extractionResult = result;

      document.getElementById('file-info-size').textContent =
        `${formatSize(file.size)} • ${result.format.toUpperCase()} • ${result.word_count.toLocaleString()} words • ${result.char_count.toLocaleString()} chars`;

      // Show extraction preview (raw)
      const previewEl = document.getElementById('extraction-preview');
      if (previewEl) {
        const truncated = result.raw_text.length > 800
          ? result.raw_text.substring(0, 800) + '…'
          : result.raw_text;
        previewEl.innerHTML = `
                    <div class="text-xs font-semibold text-secondary mb-2">📄 Raw Extracted Text</div>
                    <pre class="extraction-preview-text">${escapeHtml(truncated)}</pre>
                    <div class="text-xs text-muted" style="margin-top: 0.5rem;">🔄 Cleaning text…</div>
                `;
        previewEl.style.display = '';
      }

      // ── Text Cleaning Layer: auto-clean after extraction ──
      return API.cleanText(result.raw_text).then(cleanResult => {
        AppState.cleanedText = cleanResult.clean_text;
        AppState.cleaningResult = cleanResult;

        const saved = cleanResult.original_length - cleanResult.cleaned_length;
        const pct = cleanResult.original_length > 0
          ? Math.round((saved / cleanResult.original_length) * 100)
          : 0;

        // ── Section Detection: auto-detect after cleaning ──
        return API.detectSections(cleanResult.clean_text).then(detectResult => {
          AppState.documentAST = detectResult.document;
          AppState.sectionCount = detectResult.section_count;

          if (previewEl) {
            const doc = detectResult.document;
            const cleanTruncated = cleanResult.clean_text.length > 800
              ? cleanResult.clean_text.substring(0, 800) + '…'
              : cleanResult.clean_text;

            // Build structure view
            let structHtml = '';
            if (doc.title) structHtml += `<div class="text-sm font-semibold text-primary">${escapeHtml(doc.title)}</div>`;
            if (doc.authors.length) structHtml += `<div class="text-xs text-muted" style="margin-top:0.25rem;">By ${escapeHtml(doc.authors.join(', '))}</div>`;
            if (doc.abstract) structHtml += `<div style="margin-top:0.5rem;padding:0.5rem;border-radius:6px;background:var(--glass-bg);"><div class="text-xs font-semibold text-secondary">Abstract</div><div class="text-xs text-primary" style="margin-top:0.25rem;">${escapeHtml(doc.abstract.substring(0, 300))}${doc.abstract.length > 300 ? '…' : ''}</div></div>`;
            if (doc.keywords.length) structHtml += `<div class="text-xs text-muted" style="margin-top:0.5rem;">Keywords: ${escapeHtml(doc.keywords.join(', '))}</div>`;
            if (doc.sections.length) {
              structHtml += `<div style="margin-top:0.5rem;"><div class="text-xs font-semibold text-secondary" style="margin-bottom:0.25rem;">Sections (${doc.sections.length})</div>`;
              doc.sections.forEach((s, i) => {
                const preview = s.content.substring(0, 80).replace(/\n/g, ' ');
                structHtml += `<div class="text-xs" style="padding:0.25rem 0;border-bottom:1px solid var(--border-subtle);"><span class="font-medium text-primary">${i + 1}. ${escapeHtml(s.heading)}</span> <span class="text-muted">— ${escapeHtml(preview)}${s.content.length > 80 ? '…' : ''}</span></div>`;
              });
              structHtml += `</div>`;
            }
            if (doc.references) structHtml += `<div class="text-xs text-muted" style="margin-top:0.5rem;">📚 References detected</div>`;

            previewEl.innerHTML = `
              <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
                <button class="btn btn-primary btn-sm preview-tab active" data-tab="structure" style="font-size:0.75rem; padding:0.25rem 0.75rem;">🧩 Structure</button>
                <button class="btn btn-primary btn-sm preview-tab" data-tab="cleaned" style="font-size:0.75rem; padding:0.25rem 0.75rem; opacity:0.6;">✅ Cleaned</button>
                <button class="btn btn-primary btn-sm preview-tab" data-tab="raw" style="font-size:0.75rem; padding:0.25rem 0.75rem; opacity:0.6;">📄 Raw</button>
              </div>
              <div class="text-xs text-muted" style="margin-bottom:0.5rem;">Cleaned ${pct}% noise • ${detectResult.section_count} sections detected</div>
              <div id="preview-structure">${structHtml}</div>
              <div id="preview-cleaned" style="display:none;"><pre class="extraction-preview-text">${escapeHtml(cleanTruncated)}</pre></div>
              <div id="preview-raw" style="display:none;"><pre class="extraction-preview-text">${escapeHtml(result.raw_text.length > 800 ? result.raw_text.substring(0, 800) + '…' : result.raw_text)}</pre></div>
            `;
            // Tab switching
            previewEl.querySelectorAll('.preview-tab').forEach(btn => {
              btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                previewEl.querySelectorAll('.preview-tab').forEach(b => { b.classList.remove('active'); b.style.opacity = '0.6'; });
                btn.classList.add('active'); btn.style.opacity = '1';
                document.getElementById('preview-structure').style.display = tab === 'structure' ? '' : 'none';
                document.getElementById('preview-cleaned').style.display = tab === 'cleaned' ? '' : 'none';
                document.getElementById('preview-raw').style.display = tab === 'raw' ? '' : 'none';
              });
            });
            previewEl.querySelector('.preview-tab.active').style.opacity = '1';
          }
        });
      });
    }).catch(err => {
      document.getElementById('file-info-size').textContent =
        `${formatSize(file.size)} • ❌ ${err.message}`;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.getElementById('clear-file')?.addEventListener('click', () => {
    State.setUploadedFile(null);
    AppState.extractedText = null;
    AppState.extractionResult = null;
    AppState.cleanedText = null;
    AppState.cleaningResult = null;
    AppState.documentAST = null;
    AppState.sectionCount = null;
    fileInfo.style.display = 'none';
    fileBadge.style.display = 'none';
    fileInput.value = '';
    const previewEl = document.getElementById('extraction-preview');
    if (previewEl) { previewEl.style.display = 'none'; previewEl.innerHTML = ''; }
  });

  // Conference selection
  document.getElementById('conf-cards').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-select-conf]');
    if (btn) {
      const confId = btn.dataset.selectConf;
      State.setSelectedConference(confId);
      App.navigate(`/editor`);
    }
  });
};
