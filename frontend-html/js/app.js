/* ═══════════════════════════════════════════
   App.js — SPA Router, Navbar, Initialization
   ═══════════════════════════════════════════ */

(function () {
    'use strict';

    /* ─── SPA Router ─── */
    const routes = {};
    let currentCleanup = null;

    function registerRoute(hash, mountFn) {
        routes[hash] = mountFn;
    }

    function navigate(hash) {
        window.location.hash = hash;
    }

    function handleRoute() {
        const app = document.getElementById('app');
        if (!app) return;

        // Cleanup previous page
        if (currentCleanup) { currentCleanup(); currentCleanup = null; }

        let hash = window.location.hash.replace('#', '') || '/';
        if (hash === '/') hash = State.isAuthenticated() ? '/home' : '/login';

        // Auth guard
        const publicRoutes = ['/login', '/signup'];
        if (!publicRoutes.includes(hash) && !State.isAuthenticated()) {
            navigate('/login');
            return;
        }
        if (publicRoutes.includes(hash) && State.isAuthenticated()) {
            navigate('/home');
            return;
        }

        const mountFn = routes[hash];
        if (mountFn) {
            app.innerHTML = '';
            currentCleanup = mountFn(app) || null;
        } else {
            navigate('/home');
        }
    }

    window.addEventListener('hashchange', handleRoute);

    /* ─── Navbar Renderer ─── */
    function renderNavbar() {
        const isAuth = State.isAuthenticated();
        const user = AppState.user;
        const theme = AppState.theme;
        const currentHash = window.location.hash.replace('#', '') || '/';

        function initials(input) {
            const v = (input || '').trim();
            if (!v) return 'U';
            return v.split(/\s+/).slice(0, 2).map(p => (p[0] || '').toUpperCase()).join('');
        }

        const themeIcon = theme === 'dark' ? '☀️' : '🌙';

        let rightHTML = '';
        if (isAuth && user) {
            rightHTML = `
        <div class="user-info-pill">
          <div class="user-avatar">${initials(user.name || user.email)}</div>
          <div>
            <div class="user-name">${user.name || ''}</div>
            <div class="user-email">${user.email || ''}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="navbar-logout">
          ↪ Logout
        </button>
      `;
        } else {
            rightHTML = `
        <a href="#/login" class="btn btn-outline btn-sm">Login</a>
        <a href="#/signup" class="btn btn-brand btn-sm">Sign up</a>
      `;
        }

        return `
      <header class="navbar">
        <div class="navbar-inner">
          <a href="${isAuth ? '#/home' : '#/login'}" class="navbar-logo">
            <span class="navbar-logo-icon">IO</span>
            <span class="navbar-logo-text">IdeaOverflow</span>
          </a>
          <div class="flex items-center gap-2">
            <button class="icon-btn" id="theme-toggle" title="Toggle theme">${themeIcon}</button>
            ${rightHTML}
          </div>
        </div>
      </header>
    `;
    }

    function attachNavbarEvents() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.addEventListener('click', () => {
            State.toggleTheme();
            handleRoute(); // re-render
        });

        const logoutBtn = document.getElementById('navbar-logout');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            State.setUser(null);
            navigate('/login');
        });
    }

    /* ─── Footer ─── */
    function renderFooter() {
        return `
      <footer class="footer">
        <div class="footer-inner">
          <div>
            <h3 class="text-sm font-semibold text-primary">About</h3>
            <p class="mt-2 text-sm text-secondary">A platform that helps researchers easily create conference-ready papers.</p>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-primary">Links</h3>
            <ul style="list-style: none; margin-top: 0.5rem;">
              <li><a href="https://github.com/DeepLumiere/IdeaOverflow" target="_blank" class="link-blue text-sm">GitHub</a></li>
              <li class="mt-1"><a href="mailto:contact@ideaoverflow.local" class="link-blue text-sm">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-primary">Build</h3>
            <p class="mt-2 text-sm text-secondary">HTML • CSS • JavaScript • FastAPI • Local persistence</p>
          </div>
        </div>
        <div class="footer-bottom">© ${new Date().getFullYear()} IdeaOverflow. Built for HackaMined 2026.</div>
      </footer>
    `;
    }

    /* ─── Initialization ─── */
    function init() {
        // Load persisted state
        State.loadTheme();
        State.loadUser();

        // Register routes (page modules register themselves via window.Pages)
        registerRoute('/login', window.Pages.login);
        registerRoute('/signup', window.Pages.signup);
        registerRoute('/home', window.Pages.home);
        registerRoute('/editor', window.Pages.editor);

        // Initial route
        handleRoute();
    }

    /* ─── Exports ─── */
    window.App = {
        navigate,
        renderNavbar,
        attachNavbarEvents,
        renderFooter,
        handleRoute,
        init,
    };

    // Boot when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();