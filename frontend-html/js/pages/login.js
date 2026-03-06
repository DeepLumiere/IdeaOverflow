/* ═══════════════════════════════════════════
   Login Page
   ═══════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages.login = function (container) {
    container.innerHTML = `
    ${App.renderNavbar()}
    <main class="flex-1 flex items-center justify-center" style="min-height: calc(100vh - 4rem - 12rem); padding: 3rem 1.5rem;">
      <div style="width: 100%; max-width: 28rem;">
        <div class="auth-card fade-in">
          <div class="auth-card-gradient"></div>
          <div class="auth-card-inner">
            <h1 style="font-size: 1.5rem;" class="font-semibold tracking-tight text-primary">Welcome back</h1>
            <p class="mt-1 text-sm text-secondary">Sign in to continue building conference-ready papers.</p>

            <div id="login-error" class="alert-error mt-5" style="display: none;"></div>

            <form id="login-form" style="margin-top: 1.5rem;">
              <div class="form-group">
                <label class="form-label" for="login-email">Email</label>
                <input class="form-input" id="login-email" type="email" placeholder="you@university.edu" required autocomplete="email" />
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="login-password">Password</label>
                <input class="form-input" id="login-password" type="password" placeholder="••••••••" required autocomplete="current-password" />
              </div>
              <button type="submit" class="btn btn-brand btn-full btn-lg" style="margin-top: 1.25rem;" id="login-submit">
                <span>Sign in →</span>
              </button>
              <p class="text-sm text-secondary text-center" style="margin-top: 0.75rem;">
                New here? <a href="#/signup" class="link-blue">Create an account</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
    ${App.renderFooter()}
  `;

    App.attachNavbarEvents();

    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            errorEl.textContent = 'Email and password are required';
            errorEl.style.display = 'block';
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorEl.textContent = 'Invalid email format';
            errorEl.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.style.display = 'block';
            return;
        }

        const user = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name: email.split('@')[0],
        };

        State.setUser(user);
        App.navigate('/home');
    });
};
