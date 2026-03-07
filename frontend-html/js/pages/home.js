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
    { id: 'acm', name: 'ACM Conference', description: 'Clean single-column layout focused on readability.' }
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
            ${AppState.selectedConference === c.id ? '<span class="conf-check">✓</span>' : ''}
          </div>
          <button class="btn ${AppState.selectedConference === c.id ? 'btn-brand' : 'btn-outline'} btn-full select-conf-btn" data-select-conf="${c.id}" style="margin-top: 1rem;">
            ${AppState.selectedConference === c.id ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = `
    ${App.renderNavbar()}
    <main style="flex: 1;">
      <div class="home-container fade-in" style="padding: 0;">
        <!-- Massive Hero Section - 70% of viewport height -->
        <div class="hero-section" style="min-height: 70vh; display: flex; align-items: center; justify-content: center; text-align: center; background: radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);">
          <div style="max-width: 900px; padding: 2rem;">
            <h1 class="home-title" style="font-size: clamp(3rem, 8vw, 5rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1.5rem; background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand-from) 80%, var(--brand-to) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              Build conference papers, fast
            </h1>
            <p class="home-subtitle" style="font-size: clamp(1.1rem, 3vw, 1.5rem); max-width: 700px; margin: 1.5rem auto; color: var(--text-secondary); line-height: 1.6;">
              Upload a manuscript (optional), choose a template, then compose structured sections with a live preview.
            </p>
            
            <!-- Get Started Button - Large and prominent -->
            <div style="margin-top: 2rem;">
              <button class="start-editing-btn" id="get-started-btn" style="padding: 1.25rem 4rem; font-size: 1.5rem; border-radius: 60px; box-shadow: 0 20px 40px rgba(37, 99, 235, 0.3);">
                <span class="btn-text">Get Started</span>
                <span class="btn-icon" style="font-size: 1.8rem; margin-left: 0.5rem;">↓</span>
              </button>
              <p style="margin-top: 1.5rem; color: var(--text-muted); font-size: 0.9rem; letter-spacing: 0.5px;">
                Click to configure your paper settings below
              </p>
            </div>
          </div>
        </div>

        <!-- User Input Content Section (with id for scrolling) -->
        <div id="user-input-content" style="scroll-margin-top: 5rem; padding: 3rem 1.5rem 2rem;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <div class="home-grid">
              <!-- Upload Section -->
              <section class="home-section upload-section">
                <div class="section-header">
                  <h2 class="section-title">File upload</h2>
                  <span id="file-badge" class="file-selected-badge" style="${uploadedFile ? '' : 'display: none;'}">
                    Selected: <span id="file-badge-name">${uploadedFile?.name || ''}</span>
                  </span>
                </div>
                
                <div class="upload-box" id="upload-area">
                  <div class="upload-box-hover-gradient"></div>
                  <div class="upload-content">
                    <div class="upload-icon-box">📤</div>
                    <h3 class="upload-title">Upload files</h3>
                    <p class="upload-description">Drag & drop a PDF / LaTeX / text / Word file here, or click to browse.</p>
                    <p class="upload-supported">Supported: PDF, .tex, .txt, .docx</p>
                    <div class="upload-browse-btn">
                      <span class="btn btn-primary">Browse files</span>
                    </div>
                  </div>
                  <input type="file" id="file-input" style="display: none;" accept=".pdf,.tex,.txt,.docx,application/pdf,text/plain,application/x-latex,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                </div>

                <div id="file-info" class="file-info-card" style="${uploadedFile ? '' : 'display: none;'}">
                  <div class="file-info-content">
                    <div>
                      <div class="file-info-name" id="file-info-name">${uploadedFile?.name || ''}</div>
                      <div class="file-info-size" id="file-info-size"></div>
                    </div>
                    <button class="icon-btn file-clear-btn" id="clear-file" title="Clear">✕</button>
                  </div>
                </div>
                
                <div id="extraction-preview" class="extraction-preview" style="display: none;"></div>
              </section>

              <!-- Conference Section -->
              <section class="home-section conference-section">
                <div class="section-header">
                  <h2 class="section-title">Select a conference</h2>
                  <div class="current-badge">Current: <span class="current-value">${AppState.selectedConference.toUpperCase()}</span></div>
                </div>
                <div class="conference-grid" id="conf-cards">
                  ${renderConfCards()}
                </div>
              </section>
            </div>

            <!-- Start Editing Button -->
            <div class="start-editing-container">
              <button class="start-editing-btn" id="start-editing">
                <span class="btn-text">Start Editing</span>
                <span class="btn-icon">→</span>
              </button>
              <p class="start-editing-hint">Your selected conference will be applied to the editor</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    ${App.renderFooter()}
  `;

  // Add CSS to fix the conference grid layout
  const style = document.createElement('style');
  style.textContent = `
    /* Force the conference grid to display exactly 2 columns */
    .conference-grid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1rem;
      align-items: stretch !important;
    }
    
    /* Make cards take full height and use flex column layout */
    .conf-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      margin: 0;
    }
    
    .conf-card-inner {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
    }
    
    /* Push content to top and button to bottom */
    .conf-card-inner .flex {
      flex: 0 1 auto;
    }
    
    .conf-card .btn {
      margin-top: auto !important;
      align-self: stretch;
    }
    
    /* Ensure consistent height for both cards */
    .home-section.conference-section {
      height: fit-content;
      display: flex;
      flex-direction: column;
    }
    
    .conference-grid {
      flex: 1;
    }
    
    /* Fix description text to prevent overflow */
    .conf-card-inner p.text-secondary {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(style);

  App.attachNavbarEvents();

  // Get Started button - scroll to user input content
  document.getElementById('get-started-btn').addEventListener('click', () => {
    document.getElementById('user-input-content').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  });

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

  // Start editing button
  document.getElementById('start-editing').addEventListener('click', () => {
    App.navigate('/editor');
  });

  // Conference selection
  document.getElementById('conf-cards').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-select-conf]');
    if (btn) {
      const confId = btn.dataset.selectConf;
      State.setSelectedConference(confId);
      
      // Update UI
      document.querySelectorAll('.conf-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.conf === confId);
      });
      
      document.querySelectorAll('.select-conf-btn').forEach(b => {
        const isSelected = b.dataset.selectConf === confId;
        b.textContent = isSelected ? 'Selected' : 'Select';
        b.classList.toggle('btn-brand', isSelected);
        b.classList.toggle('btn-outline', !isSelected);
      });
      
      document.querySelectorAll('.conf-check').forEach(check => check.remove());
      
      const selectedCard = document.querySelector(`.conf-card[data-conf="${confId}"] .flex`);
      if (selectedCard) {
        const checkSpan = document.createElement('span');
        checkSpan.className = 'conf-check';
        checkSpan.textContent = '✓';
        selectedCard.appendChild(checkSpan);
      }

      // Update current badge
      const currentValue = document.querySelector('.current-value');
      if (currentValue) {
        currentValue.textContent = confId.toUpperCase();
      }
    }
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
            if (doc.abstract) structHtml += `<div style="margin-top:0.5rem;padding:0.5rem;border-radius:6px;background:var(--bg-hover);"><div class="text-xs font-semibold text-secondary">Abstract</div><div class="text-xs text-primary" style="margin-top:0.25rem;">${escapeHtml(doc.abstract.substring(0, 300))}${doc.abstract.length > 300 ? '…' : ''}</div></div>`;
            if (doc.keywords && doc.keywords.length) structHtml += `<div class="text-xs text-muted" style="margin-top:0.5rem;">Keywords: ${escapeHtml(doc.keywords.join(', '))}</div>`;
            if (doc.sections && doc.sections.length) {
              structHtml += `<div style="margin-top:0.5rem;"><div class="text-xs font-semibold text-secondary" style="margin-bottom:0.25rem;">Sections (${doc.sections.length})</div>`;
              doc.sections.forEach((s, i) => {
                const preview = s.content.substring(0, 80).replace(/\n/g, ' ');
                structHtml += `<div class="text-xs" style="padding:0.25rem 0;border-bottom:1px solid var(--border);"><span class="font-medium text-primary">${i + 1}. ${escapeHtml(s.heading)}</span> <span class="text-muted">— ${escapeHtml(preview)}${s.content.length > 80 ? '…' : ''}</span></div>`;
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
                previewEl.querySelectorAll('.preview-tab').forEach(b => { 
                  b.classList.remove('active'); 
                  b.style.opacity = '0.6'; 
                });
                btn.classList.add('active'); 
                btn.style.opacity = '1';
                document.getElementById('preview-structure').style.display = tab === 'structure' ? '' : 'none';
                document.getElementById('preview-cleaned').style.display = tab === 'cleaned' ? '' : 'none';
                document.getElementById('preview-raw').style.display = tab === 'raw' ? '' : 'none';
              });
            });
            const activeTab = previewEl.querySelector('.preview-tab.active');
            if (activeTab) activeTab.style.opacity = '1';
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
};