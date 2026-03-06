/* ═══════════════════════════════════════════
   Signup Page
   ═══════════════════════════════════════════ */

window.Pages = window.Pages || {};

window.Pages.signup = function (container) {
    container.innerHTML = `
    ${App.renderNavbar()}
    <main class="flex-1 flex items-center justify-center" style="min-height: calc(100vh - 4rem - 12rem); padding: 3rem 1.5rem;">
      <div style="width: 100%; max-width: 28rem;">
        <div class="auth-card fade-in">
          <div class="auth-card-gradient green"></div>
          <div class="auth-card-inner">
            <h1 style="font-size: 1.5rem;" class="font-semibold tracking-tight text-primary">Create your account</h1>
            <p class="mt-1 text-sm text-secondary">Start a new paper with structured sections and a live preview.</p>

            <div id="signup-error" class="alert-error mt-5" style="display: none;"></div>

            <form id="signup-form" style="margin-top: 1.5rem;">
              <div class="form-group">
                <label class="form-label" for="signup-name">Full name</label>
                <input class="form-input" id="signup-name" type="text" placeholder="Your Name" required autocomplete="name" />
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="signup-email">Email</label>
                <input class="form-input" id="signup-email" type="email" placeholder="you@university.edu" required autocomplete="email" />
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="signup-password">Password</label>
                <input class="form-input" id="signup-password" type="password" placeholder="••••••••" required autocomplete="new-password" />
              </div>
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label" for="signup-confirm">Confirm password</label>
                <input class="form-input" id="signup-confirm" type="password" placeholder="••••••••" required autocomplete="new-password" />
                <p id="signup-mismatch" class="text-xs text-rose" style="display: none;">Passwords don't match.</p>
              </div>
              <button type="submit" class="btn btn-full btn-lg" style="margin-top: 1.25rem; background: linear-gradient(135deg, #059669, #14b8a6); color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.15);" id="signup-submit">
                <span>Create account →</span>
              </button>
              <p class="text-sm text-secondary text-center" style="margin-top: 0.75rem;">
                Already have an account? <a href="#/login" class="link-blue">Sign in</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
    ${App.renderFooter()}
  `;

    App.attachNavbarEvents();

    const form = document.getElementById('signup-form');
    const errorEl = document.getElementById('signup-error');
    const confirmInput = document.getElementById('signup-confirm');
    const mismatchEl = document.getElementById('signup-mismatch');

    confirmInput.addEventListener('input', () => {
        const pw = document.getElementById('signup-password').value;
        const cpw = confirmInput.value;
        mismatchEl.style.display = cpw.length > 0 && pw !== cpw ? 'block' : 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = confirmInput.value;

        if (!name || !email || !password) {
            errorEl.textContent = 'All fields are required';
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

        if (name.length < 2) {
            errorEl.textContent = 'Name must be at least 2 characters';
            errorEl.style.display = 'block';
            return;
        }

        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match.';
            errorEl.style.display = 'block';
            return;
        }

        const user = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            name,
        };

        State.setUser(user);
        App.navigate('/home');
    });
};
