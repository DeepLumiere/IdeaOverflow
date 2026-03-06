/* ═══════════════════════════════════════════
   State Manager — replaces all React contexts
   Pub/sub event system for reactive updates
   ═══════════════════════════════════════════ */

const AppState = {
    /* ─── Document ─── */
    doc: {
        title: 'Paper Title',
        authors: [
            { name: 'Author 1', affiliation: 'University / Organization', email: 'author1@example.com' },
            { name: 'Author 2', affiliation: 'University / Organization', email: 'author2@example.com' },
        ],
        abstract: 'Write your abstract here. This preview updates instantly as you add sections, subsections, tables, and images.',
        sections: [
            { id: 'sec-intro', name: 'Introduction', content: 'Introduce the problem, context, and motivation.', subsections: [] },
        ],
        tables: [],
        images: [],
        updatedAt: Date.now(),
    },

    /* ─── Conference ─── */
    selectedConference: 'ieee',

    /* ─── Panel sizes ─── */
    panelSizes: {
        sidebarWidth: 300,
        jsonWidth: 520,
        sidebarCollapsed: false,
    },

    /* ─── Auth (localStorage-backed) ─── */
    user: null,

    /* ─── Theme ─── */
    theme: 'light',

    /* ─── Upload ─── */
    uploadedFile: null,

    /* ─── Loading states ─── */
    isLoading: false,
    loadError: null,

    /* ─── JSON sync flag ─── */
    isJsonSynced: true,
};

/* ─── Pub/Sub Events ─── */
const _listeners = {};

function on(event, callback) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(callback);
    return () => {
        _listeners[event] = _listeners[event].filter(cb => cb !== callback);
    };
}

function emit(event, data) {
    if (_listeners[event]) {
        _listeners[event].forEach(cb => cb(data));
    }
}

/* ─── Document Helpers ─── */
function setDoc(newDoc) {
    AppState.doc = { ...newDoc, updatedAt: Date.now() };
    emit('docChanged', AppState.doc);
}

function updateDoc(updates) {
    AppState.doc = { ...AppState.doc, ...updates, updatedAt: Date.now() };
    AppState.isJsonSynced = true;
    emit('docChanged', AppState.doc);
}

/* ─── Conference ─── */
function setSelectedConference(conf) {
    AppState.selectedConference = conf;
    emit('conferenceChanged', conf);
}

/* ─── Panel Sizes ─── */
function setPanelSizes(sizes) {
    AppState.panelSizes = sizes;
    emit('panelSizesChanged', sizes);
}

/* ─── Auth ─── */
function setUser(user) {
    AppState.user = user;
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        localStorage.removeItem('user');
    }
    emit('authChanged', user);
}

function loadUser() {
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            AppState.user = JSON.parse(stored);
        }
    } catch {
        localStorage.removeItem('user');
    }
}

function isAuthenticated() {
    return !!AppState.user;
}

/* ─── Theme ─── */
function setTheme(mode) {
    AppState.theme = mode;
    try { localStorage.setItem('io_theme', mode); } catch { }
    if (mode === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    emit('themeChanged', mode);
}

function toggleTheme() {
    setTheme(AppState.theme === 'dark' ? 'light' : 'dark');
}

function loadTheme() {
    try {
        const stored = localStorage.getItem('io_theme');
        if (stored === 'light' || stored === 'dark') {
            setTheme(stored);
            return;
        }
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
        setTheme(prefersDark ? 'dark' : 'light');
    } catch {
        setTheme('light');
    }
}

/* ─── Upload ─── */
function setUploadedFile(file) {
    AppState.uploadedFile = file;
    emit('uploadChanged', file);
}

/* ─── Loading ─── */
function setLoading(val) {
    AppState.isLoading = val;
    emit('loadingChanged', val);
}

function setLoadError(err) {
    AppState.loadError = err;
    emit('loadErrorChanged', err);
}

/* ─── UID Generator ─── */
function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ─── Export ─── */
window.AppState = AppState;
window.State = {
    on, emit,
    setDoc, updateDoc,
    setSelectedConference,
    setPanelSizes,
    setUser, loadUser, isAuthenticated,
    setTheme, toggleTheme, loadTheme,
    setUploadedFile,
    setLoading, setLoadError,
    uid,
};
