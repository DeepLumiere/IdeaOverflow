/* ═══════════════════════════════════════════════════════
   Editor Page — 3-panel layout with sidebar, editor,
   preview, resize handles, modals, and chat
   ═══════════════════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages.editor = function (container) {

  /* ─── Load manuscript from backend on first visit ─── */
  async function fetchManuscript() {
    AppState.isLoading = true;
    State.setLoadError(null);
    try {
      const data = await API.getManuscript();
      AppState.isLoading = false;
      if (data.content && Array.isArray(data.content)) {
        State.setDoc(Parser.transformPaperJsonToDoc(data));
      } else {
        State.setDoc(Parser.coerceDoc(data));
      }
      // Explicitly re-render both panels after loading completes
      rerenderEditorPanel();
      rerenderPreviewPanel();
    } catch (err) {
      AppState.isLoading = false;
      State.setLoadError(err.message || 'Failed to load manuscript');
      rerenderEditorPanel();
    }
  }

  // Check conference from URL query
  const urlConf = new URLSearchParams(window.location.hash.split('?')[1] || '').get('conf');
  const validConfs = ['ieee', 'acm', 'nature', 'springer', 'arxiv', 'iclr', 'cvpr', 'acl'];
  if (urlConf && validConfs.includes(urlConf.toLowerCase())) {
    State.setSelectedConference(urlConf.toLowerCase());
  }

  fetchManuscript();

  /* ─── Render full editor ─── */
  function render() {
    const doc = AppState.doc;
    const conf = AppState.selectedConference;
    const fmt = Conferences.CONFERENCE_FORMATS[conf] || Conferences.CONFERENCE_FORMATS.ieee;
    const ps = AppState.panelSizes;
    const sidebarW = ps.sidebarCollapsed ? 72 : ps.sidebarWidth;

    container.innerHTML = `
      ${App.renderNavbar()}
      <div class="editor-layout">
        <!-- Sidebar -->
        <div id="sidebar-col" style="width: ${sidebarW}px; min-width: 72px; max-width: 520px;">
          ${renderSidebar()}
        </div>
        <!-- Resize 1 -->
        <div class="resize-handle ${ps.sidebarCollapsed ? 'disabled' : ''}" id="resize-sidebar">
          <div class="resize-handle-line"></div>
          <div class="resize-handle-glow"></div>
        </div>
        <!-- Editor Panel -->
        <div id="editor-col" style="width: ${ps.jsonWidth}px; min-width: 340px; max-width: 900px;">
          ${renderEditorPanel()}
        </div>
        <!-- Resize 2 -->
        <div class="resize-handle" id="resize-editor">
          <div class="resize-handle-line"></div>
          <div class="resize-handle-glow"></div>
        </div>
        <!-- Preview Panel -->
        <div id="preview-col" style="flex: 1; min-width: 320px;">
          ${renderPreviewPanel()}
        </div>
      </div>
      <!-- Chat FAB -->
      <button class="chat-fab" id="chat-fab" title="Open AI Chat">💬</button>
    `;

    App.attachNavbarEvents();
    attachEditorEvents();
  }

  render();

  /* ─── Subscribe to state changes ─── */
  const unsubs = [
    State.on('docChanged', () => {
      rerenderEditorPanel();
      rerenderPreviewPanel();
    }),
    State.on('conferenceChanged', () => {
      rerenderPreviewPanel();
      rerenderSidebarConf();
    }),
  ];

  /* ─── Cleanup function ─── */
  return function cleanup() {
    unsubs.forEach(fn => fn());
  };

  /* ═══════════ SIDEBAR ═══════════ */
  function renderSidebar() {
    const ps = AppState.panelSizes;
    const collapsed = ps.sidebarCollapsed;
    const conf = AppState.selectedConference;
    const templates = Conferences.CONFERENCE_TEMPLATES;

    const actions = [
      { id: 'section', icon: '📄', title: 'Add Section', shortcut: 'Ctrl+Shift+S' },
      { id: 'subsection', icon: '📑', title: 'Add Subsection', shortcut: 'Ctrl+Shift+U' },
      { id: 'table', icon: '📊', title: 'Add Table', shortcut: 'Ctrl+Shift+T' },
      { id: 'image', icon: '🖼️', title: 'Add Image', shortcut: 'Ctrl+Shift+I' },
      { id: 'author', icon: '👤', title: 'Add Author', shortcut: 'Ctrl+Shift+A' },
    ];

    const actionBtns = actions.map(a => `
      <button class="sidebar-btn" data-action="${a.id}" title="${a.shortcut ? a.title + ' (' + a.shortcut + ')' : a.title}">
        <div class="sidebar-btn-icon">${a.icon}</div>
        ${!collapsed ? `<div class="sidebar-btn-text">
          <div class="sidebar-btn-label">${a.title}</div>
          ${a.shortcut ? `<div class="sidebar-btn-shortcut">${a.shortcut}</div>` : ''}
        </div>` : ''}
      </button>
    `).join('');

    let confSection = '';
    if (!collapsed) {
      const activeConf = templates.find(c => c.id === conf);
      confSection = `
        <div class="glass-card p-3 mt-5" id="sidebar-conf-section">
          <div class="text-xs font-semibold text-secondary mb-3">Conference Templates</div>
          <div class="conf-grid">
            ${templates.map(c => `
              <button class="conf-grid-btn ${conf === c.id ? 'active' : ''}" data-sidebar-conf="${c.id}" title="${c.fullName}">
                <div class="emoji">${c.logo}</div>
                <div class="name">${c.name}</div>
                <div class="format">${c.format}</div>
              </button>
            `).join('')}
          </div>
          ${activeConf ? `
            <div class="conf-guidelines">
              <div class="conf-guidelines-title">${activeConf.name} Guidelines</div>
              <div class="conf-guidelines-grid">
                <div class="label">Layout</div><div class="value">${activeConf.format}</div>
                <div class="label">Citations</div><div class="value">${Conferences.CITATION_MAP[activeConf.id] || 'Numbered'}</div>
                <div class="label">Font</div><div class="value">${Conferences.FONT_MAP[activeConf.id] || 'Serif'}</div>
                <div class="label">Headings</div><div class="value">${activeConf.id === 'ieee' ? 'UPPERCASE' : activeConf.id === 'nature' ? 'Plain' : 'Numbered'}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="tips-box">
          <div class="text-xs font-semibold text-secondary">Tips</div>
          <ul>
            <li>- Use the shortcuts for faster authoring.</li>
            <li>- Editor panel stays editable; preview updates live.</li>
            <li>- Drag separators to resize panels.</li>
            <li>- Switch conferences to see formatting changes instantly.</li>
          </ul>
        </div>
      `;
    }

    return `
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-header-title">${collapsed ? 'TOOLS' : 'Modification Panel'}</div>
          <button class="icon-btn" id="sidebar-toggle" title="${collapsed ? 'Expand' : 'Collapse'}" style="height: 2rem; width: 2rem; font-size: 0.85rem;">
            ${collapsed ? '▶' : '◀'}
          </button>
        </div>
        <div class="sidebar-body">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${actionBtns}
          </div>
          ${confSection}
        </div>
      </div>
    `;
  }

  function rerenderSidebarConf() {
    const el = document.getElementById('sidebar-conf-section');
    if (el) {
      // Simple re-render of sidebar conf buttons
      const conf = AppState.selectedConference;
      el.querySelectorAll('[data-sidebar-conf]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sidebarConf === conf);
      });
    }
  }

  /* ═══════════ EDITOR PANEL ═══════════ */
  function renderEditorPanel() {
    const doc = AppState.doc;
    if (AppState.isLoading) return '<div class="editor-panel"><div class="p-8 text-center text-secondary">Loading manuscript from backend...</div></div>';
    if (AppState.loadError) return `<div class="editor-panel"><div class="p-8 text-center text-rose">${AppState.loadError} <button class="btn btn-sm btn-outline" id="retry-load">Retry</button></div></div>`;

    const authorsHTML = doc.authors.map((a, i) => `
      <div class="author-badge">
        <span class="name">${a.name}</span>
        <span>${a.affiliation || ''}</span>
      </div>
    `).join('');

    const sectionsHTML = doc.sections.map((section, idx) => {
      const subsHTML = section.subsections.map((sub, sIdx) => `
        <div class="ml-6" style="margin-top: 0.5rem;">
          <h3 class="text-lg font-semibold text-primary">${idx + 1}.${sIdx + 1} ${sub.name}</h3>
          <p class="text-secondary" style="margin-top: 0.25rem;">${sub.content}</p>
        </div>
      `).join('');

      return `
        <div style="margin-top: 2rem;">
          <div class="flex items-baseline gap-3">
            <span class="section-number">${idx + 1}.</span>
            <h2 contenteditable="true" class="text-xl font-bold text-primary" data-edit-section-name="${section.id}">${section.name}</h2>
          </div>
          <div contenteditable="true" class="text-secondary leading-relaxed whitespace-pre-wrap" style="margin-top: 0.5rem;" data-edit-section-content="${section.id}">${section.content}</div>
          ${subsHTML}
        </div>
      `;
    }).join('');

    const tablesHTML = doc.tables.length > 0 ? `
      <div style="margin-top: 2.5rem; padding-top: 2.5rem; border-top: 1px solid var(--border);">
        <h2 class="text-sm font-bold uppercase text-muted mb-6">Tables & Data</h2>
        ${doc.tables.map((table, i) => `
          <div style="margin-bottom: 2rem; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;">
            <div class="editor-table caption-bar" style="background: var(--bg-hover); padding: 0.5rem; font-size: 0.75rem; font-weight: 500; border-bottom: 1px solid var(--border);">
              Table ${i + 1}: ${table.caption || ''}
            </div>
            <table class="editor-table">
              <thead><tr>${table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="editor-panel" id="editor-panel-root">
        <div class="editor-panel-inner">
          <header style="margin-bottom: 1rem;">
            <h1 contenteditable="true" class="font-bold text-primary" style="font-size: 1.875rem;" id="edit-title">${doc.title}</h1>
            <div class="flex flex-wrap gap-4" style="margin-top: 1rem;">
              ${authorsHTML}
            </div>
          </header>

          <div class="abstract-box">
            <div class="abstract-label">Abstract</div>
            <div contenteditable="true" class="text-secondary italic leading-relaxed" id="edit-abstract">${doc.abstract}</div>
          </div>

          ${sectionsHTML}
          ${tablesHTML}
        </div>
      </div>
    `;
  }

  function rerenderEditorPanel() {
    const col = document.getElementById('editor-col');
    if (col) {
      col.innerHTML = renderEditorPanel();
      attachEditorInlineEvents();
    }
  }

  /* ═══════════ PREVIEW PANEL ═══════════ */
  function renderPreviewPanel() {
    const doc = AppState.doc;
    const conf = AppState.selectedConference;
    const fmt = Conferences.CONFERENCE_FORMATS[conf] || Conferences.CONFERENCE_FORMATS.ieee;

    return `
      <div class="preview-panel" id="preview-panel-root">
        <div class="preview-header">
          <div class="flex items-center gap-2">
            <div style="height: 2rem; width: 2rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; background: ${fmt.accentColor}; font-size: 0.85rem;">📄</div>
            <div class="flex items-center gap-2">
              <div class="text-xs font-semibold text-secondary tracking-wide">Live Preview</div>
              <span class="badge" style="background: ${fmt.accentColor};">${conf.toUpperCase()}</span>
              <span class="text-xs text-muted">${fmt.layout === 'two-column' ? 'Two-Column' : 'Single-Column'} • ${fmt.citationStyle === 'numbered' ? '[1]' : fmt.citationStyle === 'author-year' ? '(Author, Year)' : 'Superscript'}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-outline btn-sm" id="btn-fullpage">⛶ Full Preview</button>
            <button class="btn btn-primary btn-sm" id="btn-export">⬇ Export</button>
          </div>
        </div>
        <div class="preview-body">
          <div class="mx-auto max-w-5xl">
            ${renderPaperContent(doc, fmt, false)}
          </div>
        </div>
      </div>
    `;
  }

  function rerenderPreviewPanel() {
    const col = document.getElementById('preview-col');
    if (col) {
      col.innerHTML = renderPreviewPanel();
      attachPreviewEvents();
    }
  }

  /* ─── Shared Paper Content Renderer ─── */
  function renderPaperContent(doc, fmt, isFullPage) {
    // Build assets by section
    const tablesBySection = {};
    const imagesBySection = {};
    doc.tables.forEach(t => {
      const key = t.sectionId || '';
      if (!tablesBySection[key]) tablesBySection[key] = [];
      tablesBySection[key].push(t);
    });
    doc.images.forEach(img => {
      const key = img.sectionId || '';
      if (!imagesBySection[key]) imagesBySection[key] = [];
      imagesBySection[key].push(img);
    });

    const tH = Conferences.transformHeading;

    // Authors
    const authorsHTML = doc.authors.map((a, idx) => {
      let html = `<div style="${fmt.authorStyle === 'block' ? 'margin-bottom: 0.75rem;' : 'display: inline-block; padding: 0.25rem 0.75rem;'}">`;
      html += `<div style="font-weight: 600;">${a.name}`;
      if (fmt.authorStyle === 'superscript') html += `<sup style="font-size: 9px; margin-left: 2px; color: ${fmt.accentColor};">${idx + 1}</sup>`;
      html += '</div>';
      if (a.affiliation) {
        html += `<div style="font-size: 0.75rem; color: #475569;">`;
        if (fmt.authorStyle === 'superscript') html += `<sup style="font-size: 9px; margin-right: 2px;">${idx + 1}</sup>`;
        html += `${a.affiliation}</div>`;
      }
      if (a.email) html += `<div style="font-size: 0.75rem; color: #94a3b8; font-style: italic;">${a.email}</div>`;
      html += '</div>';
      return html;
    }).join('');

    // Sections
    const sectionsHTML = doc.sections.map((section, idx) => {
      const secImages = (imagesBySection[section.id] || []).map((img, ii) => `
        <figure style="margin-top: 1rem;">
          <div style="position: relative; width: 100%; height: 14rem; border-radius: var(--radius-md); overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">
            ${img.url ? `<img src="${img.url}" alt="${img.alt || 'Figure ' + (ii + 1)}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" loading="lazy" />` : ''}
          </div>
          ${img.caption ? `<figcaption style="margin-top: 0.5rem; font-size: 0.75rem; color: #475569; text-align: center; font-style: italic;"><span style="font-weight: 700; font-style: normal;">Figure ${ii + 1}:</span> ${img.caption}</figcaption>` : ''}
        </figure>
      `).join('');

      const secTables = (tablesBySection[section.id] || []).map((t, ti) => `
        <div style="margin-top: 1rem;">
          ${t.caption ? `<div style="margin-bottom: 0.5rem; font-size: 0.75rem; color: #334155; text-align: center;"><span style="font-weight: 700;">Table ${ti + 1}:</span> ${t.caption}</div>` : ''}
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.75rem; border-collapse: collapse;">
              <thead><tr style="border-bottom: 2px solid #0f172a;">${t.headers.map(h => `<th style="text-align: left; padding: 0.5rem 0.75rem; font-weight: 700;">${h}</th>`).join('')}</tr></thead>
              <tbody>${t.rows.map(row => `<tr style="border-bottom: 1px solid #e2e8f0;">${row.map(cell => `<td style="padding: 0.5rem 0.75rem; vertical-align: top;">${cell}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </div>
        </div>
      `).join('');

      const subsHTML = section.subsections.length > 0 ? `
        <div style="margin-top: 1rem;">
          ${section.subsections.map((sub, subIdx) => `
            <div style="margin-top: 1rem;">
              <h3 style="font-size: 0.875rem; font-weight: 700; ${fmt.headingTransform === 'none' ? 'font-style: italic;' : ''}">
                ${fmt.headingNumbered ? `${idx + 1}.${subIdx + 1} ` : ''}${tH(sub.name, fmt.headingTransform)}
              </h3>
              <p style="margin-top: 0.25rem; font-size: inherit; line-height: 1.625; text-align: justify;">${sub.content}</p>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="break-inside-avoid" style="margin-top: 1.5rem;">
          <h2 style="font-weight: 700; font-size: ${fmt.headingTransform === 'uppercase' ? '0.75rem' : '0.9rem'}; letter-spacing: ${fmt.headingTransform === 'uppercase' ? '0.04em' : 'normal'}; ${fmt.sectionDivider ? 'border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem;' : ''}">
            ${fmt.headingNumbered ? `${idx + 1}. ` : ''}${tH(section.name, fmt.headingTransform)}
          </h2>
          <p style="margin-top: 0.5rem; font-size: inherit; line-height: 1.625; text-align: justify;">${section.content}</p>
          ${secImages}${secTables}${subsHTML}
        </div>
      `;
    }).join('');

    // Unattached assets
    const unattachedImages = (imagesBySection[''] || []);
    const unattachedTables = (tablesBySection[''] || []);
    let unattachedHTML = '';
    if (unattachedImages.length > 0) {
      unattachedHTML += `<div class="break-inside-avoid" style="margin-top: 1.5rem;"><h2 style="font-size: 1rem; font-weight: 700;">${fmt.headingNumbered ? `${doc.sections.length + 1}. ` : ''}${tH('Figures', fmt.headingTransform)}</h2>`;
      unattachedHTML += unattachedImages.map((img, ii) => `
        <figure style="margin-top: 1rem;">
          <div style="position: relative; width: 100%; height: 14rem; border-radius: var(--radius-md);overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">${img.url ? `<img src="${img.url}" alt="${img.alt || 'Figure'}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy" />` : ''}</div>
          ${img.caption ? `<figcaption style="margin-top:0.5rem;font-size:0.75rem;color:#475569;text-align:center;font-style:italic;"><span style="font-weight:700;font-style:normal;">Figure ${ii + 1}:</span> ${img.caption}</figcaption>` : ''}
        </figure>
      `).join('');
      unattachedHTML += '</div>';
    }

    // References
    const fmtCit = Conferences.formatCitation;
    const refsHTML = `
      <div class="break-inside-avoid" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #cbd5e1;">
        <h2 style="font-weight: 700; margin-bottom: 0.75rem; font-size: ${fmt.headingTransform === 'uppercase' ? '0.75rem' : '0.9rem'}; letter-spacing: ${fmt.headingTransform === 'uppercase' ? '0.04em' : 'normal'};">${tH('References', fmt.headingTransform)}</h2>
        <div style="font-size: 0.75rem; color: #475569; line-height: 1.625;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.375rem;">
            <span style="font-family: monospace; color: ${fmt.accentColor}; flex-shrink: 0;">${fmt.citationStyle === 'superscript' ? '<sup>1</sup>' : fmtCit(fmt.citationStyle, 1)}</span>
            <span>Author, A., et al., "Title of the paper", <em>Conference/Journal Name</em>, 2024.</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <span style="font-family: monospace; color: ${fmt.accentColor}; flex-shrink: 0;">${fmt.citationStyle === 'superscript' ? '<sup>2</sup>' : fmtCit(fmt.citationStyle, 2)}</span>
            <span>Author, B., "Another paper title", <em>Publication Name</em>, 2023.</span>
          </div>
        </div>
      </div>
    `;

    const bodyClass = isFullPage && fmt.layout === 'two-column' ? 'paper-body two-column' : fmt.layout === 'two-column' ? 'paper-body' : 'paper-body';
    const colStyle = fmt.layout === 'two-column' && !isFullPage ? '' : '';

    return `
      <div class="paper-preview" style="font-family: ${fmt.fontFamily};">
        <div class="paper-banner" style="background-color: ${fmt.accentColor};">${fmt.headerInfo}</div>
        <div class="${fmt.layout === 'two-column' ? 'paper-body two-column' : 'paper-body'}" style="padding: ${fmt.paperPadding}; font-size: ${fmt.baseFontSize};">
          <div class="break-inside-avoid">
            <h1 style="font-weight: 700; text-align: center; line-height: 1.25; font-size: ${fmt.titleFontSize};">${doc.title}</h1>
            <div style="margin-top: 1rem; text-align: center; font-size: 0.875rem; color: #334155;">${authorsHTML}</div>
            <div style="margin-top: 1.5rem; padding: 1rem 0; ${fmt.sectionDivider ? 'border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;' : 'border-top: 1px solid #e2e8f0;'}">
              <h2 style="font-weight: 700; margin-bottom: 0.5rem; font-size: ${fmt.headingTransform === 'uppercase' ? '0.7rem' : '0.85rem'}; letter-spacing: ${fmt.headingTransform === 'uppercase' ? '0.05em' : 'normal'};">${fmt.abstractLabel}</h2>
              <p style="font-size: 0.875rem; line-height: 1.625; text-align: justify;">${doc.abstract}</p>
            </div>
            ${fmt.showKeywords ? '<div style="margin-top: 0.5rem; margin-bottom: 1rem;"><span style="font-size: 0.75rem; font-weight: 700;">Keywords: </span><span style="font-size: 0.75rem; color: #475569; font-style: italic;">keyword1, keyword2, keyword3</span></div>' : ''}
          </div>
          <div style="margin-top: 1.5rem;">
            ${sectionsHTML}
            ${unattachedHTML}
            ${refsHTML}
          </div>
        </div>
        <div class="paper-footer-info">
          Formatted following ${fmt.headerInfo} guidelines • ${fmt.layout === 'two-column' ? 'Two-Column' : 'Single-Column'} Layout • ${fmt.citationStyle === 'numbered' ? 'Numbered' : fmt.citationStyle === 'author-year' ? 'Author-Year' : 'Superscript'} Citations • Font: ${fmt.fontFamily.split(',')[0].replace(/"/g, '')}
        </div>
      </div>
    `;
  }

  /* ═══════════ EVENT HANDLERS ═══════════ */
  function attachEditorEvents() {
    attachSidebarEvents();
    attachEditorInlineEvents();
    attachPreviewEvents();
    attachResizeEvents();
    attachChatEvents();
    attachKeyboardShortcuts();
  }

  /* ── Sidebar ── */
  function attachSidebarEvents() {
    // Toggle collapse
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      const ps = { ...AppState.panelSizes, sidebarCollapsed: !AppState.panelSizes.sidebarCollapsed };
      State.setPanelSizes(ps);
      render();
    });

    // Action buttons → open modals
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.action));
    });

    // Conference template switches
    document.querySelectorAll('[data-sidebar-conf]').forEach(btn => {
      btn.addEventListener('click', () => {
        State.setSelectedConference(btn.dataset.sidebarConf);
      });
    });
  }

  /* ── Inline editing ── */
  function attachEditorInlineEvents() {
    const titleEl = document.getElementById('edit-title');
    if (titleEl) {
      titleEl.addEventListener('blur', () => {
        const val = titleEl.textContent.trim();
        if (val !== AppState.doc.title) State.updateDoc({ title: val });
      });
    }

    const abstractEl = document.getElementById('edit-abstract');
    if (abstractEl) {
      abstractEl.addEventListener('blur', () => {
        const val = abstractEl.textContent.trim();
        if (val !== AppState.doc.abstract) State.updateDoc({ abstract: val });
      });
    }

    document.querySelectorAll('[data-edit-section-name]').forEach(el => {
      el.addEventListener('blur', () => {
        const id = el.dataset.editSectionName;
        const val = el.textContent.trim();
        const sections = AppState.doc.sections.map(s => s.id === id ? { ...s, name: val } : s);
        State.updateDoc({ sections });
      });
    });

    document.querySelectorAll('[data-edit-section-content]').forEach(el => {
      el.addEventListener('blur', () => {
        const id = el.dataset.editSectionContent;
        const val = el.textContent.trim();
        const sections = AppState.doc.sections.map(s => s.id === id ? { ...s, content: val } : s);
        State.updateDoc({ sections });
      });
    });

    document.getElementById('retry-load')?.addEventListener('click', fetchManuscript);
  }

  /* ── Preview ── */
  function attachPreviewEvents() {
    document.getElementById('btn-fullpage')?.addEventListener('click', openFullPagePreview);
    document.getElementById('btn-export')?.addEventListener('click', () => window.print());
  }

  /* ── Resize handles ── */
  function attachResizeEvents() {
    let drag = null;

    function onPointerDown(kind, e) {
      if (kind === 'sidebar' && AppState.panelSizes.sidebarCollapsed) return;
      drag = { kind, startX: e.clientX, startSidebar: AppState.panelSizes.sidebarWidth, startJson: AppState.panelSizes.jsonWidth };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    function onPointerMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      if (drag.kind === 'sidebar') {
        const next = Math.max(220, Math.min(520, drag.startSidebar + dx));
        State.setPanelSizes({ ...AppState.panelSizes, sidebarWidth: next });
        document.getElementById('sidebar-col').style.width = next + 'px';
      } else {
        const next = Math.max(340, Math.min(900, drag.startJson + dx));
        State.setPanelSizes({ ...AppState.panelSizes, jsonWidth: next });
        document.getElementById('editor-col').style.width = next + 'px';
      }
    }

    function onPointerUp() {
      drag = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    const r1 = document.getElementById('resize-sidebar');
    const r2 = document.getElementById('resize-editor');
    if (r1) {
      r1.addEventListener('pointerdown', e => onPointerDown('sidebar', e));
    }
    if (r2) {
      r2.addEventListener('pointerdown', e => onPointerDown('json', e));
    }
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  /* ── Keyboard shortcuts ── */
  function attachKeyboardShortcuts() {
    document.addEventListener('keydown', function editorShortcuts(e) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || !e.shiftKey) return;
      const map = { s: 'section', u: 'subsection', t: 'table', i: 'image', a: 'author' };
      const action = map[e.key.toLowerCase()];
      if (action) { e.preventDefault(); openModal(action); }
    });
  }

  /* ── Chat ── */
  function attachChatEvents() {
    const fab = document.getElementById('chat-fab');
    if (fab) {
      fab.addEventListener('click', () => openChat());
    }
  }

  /* ═══════════ MODALS ═══════════ */
  function openModal(action) {
    const titles = { section: 'Add Section', subsection: 'Add Subsection', table: 'Add Table', image: 'Add Image', author: 'Add Author' };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';
    overlay.innerHTML = `
      <div class="modal-backdrop" id="modal-close-backdrop"></div>
      <div class="modal-container slide-up">
        <div class="modal-head">${titles[action] || 'Edit'}</div>
        <div class="modal-body" id="modal-form-area"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#modal-close-backdrop').addEventListener('click', () => overlay.remove());
    document.addEventListener('keydown', function escClose(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escClose); }
    });

    const formArea = overlay.querySelector('#modal-form-area');

    if (action === 'section') renderSectionForm(formArea, overlay);
    else if (action === 'subsection') renderSubsectionForm(formArea, overlay);
    else if (action === 'table') renderTableForm(formArea, overlay);
    else if (action === 'image') renderImageForm(formArea, overlay);
    else if (action === 'author') renderAuthorForm(formArea, overlay);
  }

  function renderSectionForm(area, overlay) {
    const doc = AppState.doc;
    const options = doc.sections.map(s => `<option value="after:${s.id}">After: ${s.name}</option>`).join('');
    area.innerHTML = `
      <form id="modal-form">
        <div class="form-group">
          <label class="form-label">Position</label>
          <select class="form-input" id="mf-position">
            <option value="start">At the top</option>
            <option value="end" selected>At the bottom</option>
            ${options}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Section name</label><input class="form-input" id="mf-name" placeholder="Introduction" /></div>
        <div class="form-group"><label class="form-label">Content</label><textarea class="form-input" id="mf-content" rows="6" placeholder="Write your section content…"></textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outline" id="mf-cancel">Cancel</button>
          <button type="submit" class="btn btn-brand">Add section</button>
        </div>
      </form>
    `;
    area.querySelector('#mf-cancel').addEventListener('click', () => overlay.remove());
    area.querySelector('#modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const pos = area.querySelector('#mf-position').value;
      const name = area.querySelector('#mf-name').value.trim() || 'Untitled Section';
      const content = area.querySelector('#mf-content').value.trim();
      const next = [...doc.sections];
      let idx = next.length;
      if (pos === 'start') idx = 0;
      else if (pos.startsWith('after:')) {
        const afterIdx = next.findIndex(s => s.id === pos.slice(6));
        if (afterIdx >= 0) idx = afterIdx + 1;
      }
      next.splice(idx, 0, { id: State.uid('sec'), name, content, subsections: [] });
      State.updateDoc({ sections: next });
      overlay.remove();
    });
  }

  function renderSubsectionForm(area, overlay) {
    const doc = AppState.doc;
    const opts = doc.sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    area.innerHTML = `
      <form id="modal-form">
        <div class="form-group"><label class="form-label">Parent section</label><select class="form-input" id="mf-parent">${opts}</select></div>
        <div class="form-group"><label class="form-label">Subsection name</label><input class="form-input" id="mf-name" placeholder="Background" /></div>
        <div class="form-group"><label class="form-label">Content</label><textarea class="form-input" id="mf-content" rows="6" placeholder="Write your subsection content…"></textarea></div>
        <div class="modal-actions"><button type="button" class="btn btn-outline" id="mf-cancel">Cancel</button><button type="submit" class="btn btn-brand">Add subsection</button></div>
      </form>
    `;
    area.querySelector('#mf-cancel').addEventListener('click', () => overlay.remove());
    area.querySelector('#modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const parentId = area.querySelector('#mf-parent').value;
      const name = area.querySelector('#mf-name').value.trim() || 'Untitled Subsection';
      const content = area.querySelector('#mf-content').value.trim();
      const sections = doc.sections.map(s => {
        if (s.id !== parentId) return s;
        return { ...s, subsections: [...s.subsections, { id: State.uid('sub'), name, content }] };
      });
      State.updateDoc({ sections });
      overlay.remove();
    });
  }

  function renderTableForm(area, overlay) {
    const doc = AppState.doc;
    const opts = doc.sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    area.innerHTML = `
      <form id="modal-form">
        <div class="form-group"><label class="form-label">Attach to section (optional)</label><select class="form-input" id="mf-section"><option value="">No specific section</option>${opts}</select></div>
        <div class="form-group"><label class="form-label">Caption</label><input class="form-input" id="mf-caption" placeholder="Table caption" /></div>
        <div class="form-group"><label class="form-label">Headers <span class="text-xs text-muted">(comma-separated)</span></label><input class="form-input" id="mf-headers" value="Column 1, Column 2, Column 3" /></div>
        <div class="form-group"><label class="form-label">Rows <span class="text-xs text-muted">(one per line, comma-separated)</span></label><textarea class="form-input" id="mf-rows" rows="5">Data 1, Data 2, Data 3</textarea></div>
        <div class="modal-actions"><button type="button" class="btn btn-outline" id="mf-cancel">Cancel</button><button type="submit" class="btn btn-brand">Add table</button></div>
      </form>
    `;
    area.querySelector('#mf-cancel').addEventListener('click', () => overlay.remove());
    area.querySelector('#modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const headers = area.querySelector('#mf-headers').value.split(',').map(h => h.trim()).filter(Boolean);
      const rows = area.querySelector('#mf-rows').value.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split(',').map(c => c.trim()));
      const table = {
        id: State.uid('table'),
        caption: area.querySelector('#mf-caption').value.trim() || undefined,
        headers, rows,
        sectionId: area.querySelector('#mf-section').value || undefined,
      };
      State.updateDoc({ tables: [...doc.tables, table] });
      overlay.remove();
    });
  }

  function renderImageForm(area, overlay) {
    const doc = AppState.doc;
    const opts = doc.sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    area.innerHTML = `
      <form id="modal-form">
        <div class="form-group"><label class="form-label">Attach to section (optional)</label><select class="form-input" id="mf-section"><option value="">No specific section</option>${opts}</select></div>
        <div class="form-group"><label class="form-label">Image URL</label><input class="form-input" id="mf-url" placeholder="https://…" required /></div>
        <div class="form-group"><label class="form-label">Caption (optional)</label><input class="form-input" id="mf-caption" placeholder="Figure caption" /></div>
        <div class="form-group"><label class="form-label">Alt text (optional)</label><input class="form-input" id="mf-alt" placeholder="Describe the image" /></div>
        <div class="modal-actions"><button type="button" class="btn btn-outline" id="mf-cancel">Cancel</button><button type="submit" class="btn btn-brand">Add image</button></div>
      </form>
    `;
    area.querySelector('#mf-cancel').addEventListener('click', () => overlay.remove());
    area.querySelector('#modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const img = {
        id: State.uid('img'),
        url: area.querySelector('#mf-url').value.trim(),
        caption: area.querySelector('#mf-caption').value.trim() || undefined,
        alt: area.querySelector('#mf-alt').value.trim() || undefined,
        sectionId: area.querySelector('#mf-section').value || undefined,
      };
      State.updateDoc({ images: [...doc.images, img] });
      overlay.remove();
    });
  }

  function renderAuthorForm(area, overlay) {
    area.innerHTML = `
      <form id="modal-form">
        <div class="form-group"><label class="form-label">Author name</label><input class="form-input" id="mf-name" placeholder="Author Name" required /></div>
        <div class="form-group"><label class="form-label">Affiliation</label><input class="form-input" id="mf-affiliation" placeholder="University / Company" /></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="mf-email" type="email" placeholder="author@university.edu" /></div>
        <div class="modal-actions"><button type="button" class="btn btn-outline" id="mf-cancel">Cancel</button><button type="submit" class="btn btn-brand">Add author</button></div>
      </form>
    `;
    area.querySelector('#mf-cancel').addEventListener('click', () => overlay.remove());
    area.querySelector('#modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const author = {
        name: area.querySelector('#mf-name').value.trim() || 'Author',
        affiliation: area.querySelector('#mf-affiliation').value.trim() || undefined,
        email: area.querySelector('#mf-email').value.trim() || undefined,
      };
      State.updateDoc({ authors: [...AppState.doc.authors, author] });
      overlay.remove();
    });
  }

  /* ═══════════ FULL PAGE PREVIEW ═══════════ */
  function openFullPagePreview() {
    const doc = AppState.doc;
    const conf = AppState.selectedConference;
    const fmt = Conferences.CONFERENCE_FORMATS[conf] || Conferences.CONFERENCE_FORMATS.ieee;
    let zoom = 100;

    const overlay = document.createElement('div');
    overlay.className = 'fullpage-overlay';
    overlay.innerHTML = `
      <div class="fullpage-toolbar">
        <div class="flex items-center gap-3">
          <div style="height: 2.25rem; width: 2.25rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); background: ${fmt.accentColor};">📄</div>
          <div>
            <div class="text-sm font-semibold text-primary flex items-center gap-2">
              Full Page Preview <span class="badge" style="background: ${fmt.accentColor};">${conf.toUpperCase()}</span>
            </div>
            <div class="text-xs text-muted">${fmt.layout === 'two-column' ? 'Two-Column' : 'Single-Column'} • ${fmt.fontFamily.split(',')[0].replace(/"/g, '')} • ${fmt.citationStyle === 'numbered' ? 'Numbered [1]' : fmt.citationStyle === 'author-year' ? 'Author-Year' : 'Superscript'} Citations</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="zoom-controls">
            <button class="zoom-btn" id="fp-zoom-out" title="Zoom Out">−</button>
            <span class="zoom-label" id="fp-zoom-label">100%</span>
            <button class="zoom-btn" id="fp-zoom-in" title="Zoom In">+</button>
            <button class="zoom-btn" id="fp-zoom-reset" title="Reset">↺</button>
          </div>
          <button class="btn btn-primary btn-sm" id="fp-export">⬇ Export</button>
          <button class="icon-btn" id="fp-close" title="Close (Escape)" style="height: 2.25rem; width: 2.25rem;">✕</button>
        </div>
      </div>
      <div class="fullpage-paper-area">
        <div class="fullpage-paper-container" id="fp-paper-wrapper">
          ${renderPaperContent(doc, fmt, true)}
        </div>
      </div>
      <div class="fullpage-status-bar">
        <span>A4 Paper (210 × 297 mm)</span><span>•</span>
        <span>Press <kbd>Esc</kbd> to close</span><span>•</span>
        <span><kbd>Ctrl +/-</kbd> to zoom</span>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function updateZoom() {
      document.getElementById('fp-zoom-label').textContent = zoom + '%';
      document.getElementById('fp-paper-wrapper').style.transform = `scale(${zoom / 100})`;
    }

    function closeOverlay() {
      overlay.remove();
      document.body.style.overflow = '';
    }

    overlay.querySelector('#fp-close').addEventListener('click', closeOverlay);
    overlay.querySelector('#fp-export').addEventListener('click', () => window.print());
    overlay.querySelector('#fp-zoom-out').addEventListener('click', () => { zoom = Math.max(50, zoom - 10); updateZoom(); });
    overlay.querySelector('#fp-zoom-in').addEventListener('click', () => { zoom = Math.min(200, zoom + 10); updateZoom(); });
    overlay.querySelector('#fp-zoom-reset').addEventListener('click', () => { zoom = 100; updateZoom(); });

    const keyHandler = (e) => {
      if (e.key === 'Escape') closeOverlay();
      if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); zoom = Math.min(200, zoom + 10); updateZoom(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoom = Math.max(50, zoom - 10); updateZoom(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoom = 100; updateZoom(); }
    };
    window.addEventListener('keydown', keyHandler);
    // Cleanup on close
    const origRemove = overlay.remove.bind(overlay);
    overlay.remove = () => { window.removeEventListener('keydown', keyHandler); document.body.style.overflow = ''; origRemove(); };
  }

  /* ═══════════ CHAT PANEL ═══════════ */
  function openChat() {
    // Remove FAB
    document.getElementById('chat-fab')?.remove();

    const messages = [];

    const panel = document.createElement('div');
    panel.className = 'chat-panel slide-up';
    panel.innerHTML = `
      <div class="chat-header">
        <div class="flex items-center gap-2">
          <span style="color: var(--brand-from); font-size: 1.2rem;">▶</span>
          <span class="font-semibold text-primary">IdeaOverflow AI</span>
        </div>
        <button class="icon-btn" id="chat-close" style="height: 2rem; width: 2rem; font-size: 0.85rem;">✕</button>
      </div>
      <div class="chat-messages" id="chat-msgs">
        <div class="chat-empty">
          <p class="font-medium">Ask me anything about your document!</p>
          <p class="text-xs mt-2">I can generate JSON that I'll convert to your document structure.</p>
        </div>
      </div>
      <div class="chat-input-bar">
        <input class="chat-input" id="chat-input" type="text" placeholder="Ask a question..." />
        <button class="chat-send-btn" id="chat-send" disabled>➤</button>
      </div>
    `;

    document.body.appendChild(panel);

    const input = panel.querySelector('#chat-input');
    const sendBtn = panel.querySelector('#chat-send');
    const msgsContainer = panel.querySelector('#chat-msgs');

    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) sendMessage();
    });

    sendBtn.addEventListener('click', sendMessage);

    panel.querySelector('#chat-close').addEventListener('click', () => {
      panel.remove();
      // Add FAB back
      const fab = document.createElement('button');
      fab.className = 'chat-fab';
      fab.id = 'chat-fab';
      fab.title = 'Open AI Chat';
      fab.textContent = '💬';
      fab.addEventListener('click', openChat);
      document.body.appendChild(fab);
    });

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      // Clear empty state
      if (messages.length === 0) msgsContainer.innerHTML = '';

      messages.push({ role: 'user', content: text });
      msgsContainer.innerHTML += `<div class="chat-msg user">${escapeHtml(text)}</div>`;
      input.value = '';
      sendBtn.disabled = true;

      // Loading
      const loadingEl = document.createElement('div');
      loadingEl.className = 'chat-msg assistant';
      loadingEl.innerHTML = '<span class="animate-spin" style="display: inline-block;">⏳</span> Thinking...';
      msgsContainer.appendChild(loadingEl);
      msgsContainer.scrollTop = msgsContainer.scrollHeight;

      try {
        const data = await API.chat(AppState.doc, text);
        loadingEl.remove();

        // Try to parse JSON from response
        const jsonPayload = parseJsonFromResponse(data.response);
        if (jsonPayload && typeof jsonPayload === 'object') {
          State.setDoc(Parser.coerceDoc(jsonPayload));
          messages.push({ role: 'assistant', content: '✅ Updated the document with AI-generated content.' });
          msgsContainer.innerHTML += `<div class="chat-msg assistant">✅ Updated the document with AI-generated content.</div>`;
        } else {
          messages.push({ role: 'assistant', content: data.response });
          msgsContainer.innerHTML += `<div class="chat-msg assistant">${escapeHtml(data.response)}</div>`;
        }
      } catch (err) {
        loadingEl.remove();
        const errMsg = '❌ Error reaching backend. Make sure it\'s running on port 8000.';
        messages.push({ role: 'assistant', content: errMsg });
        msgsContainer.innerHTML += `<div class="chat-msg assistant">${errMsg}</div>`;
      }

      msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }
  }

  function parseJsonFromResponse(text) {
    if (!text) return null;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch?.[1]) {
      try { return JSON.parse(fenceMatch[1].trim()); } catch { }
    }
    try { return JSON.parse(text.trim()); } catch { return null; }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
