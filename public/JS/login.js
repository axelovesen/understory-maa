document.addEventListener('DOMContentLoaded', () => {
  // Modaler
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');

  // Knapper i headeren
  const openLoginBtn = document.getElementById('openLogin');
  const openSignupBtn = document.getElementById('openSignup');

  // Close-knapper
  const closeLoginBtn = document.getElementById('closeLogin');
  const closeSignupBtn = document.getElementById('closeSignup');

  // Forms og feilmeldinger
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  const switchToSignupBtn = document.getElementById('switchToSignup');

  // Hjelpefunksjoner for å vise/skjule modaler
  function openModal(modal) {
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
  }

  // Åpne/lukke modaler
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', () => {
      loginError.textContent = '';
      openModal(loginModal);
    });
  }

  if (openSignupBtn) {
    openSignupBtn.addEventListener('click', () => {
      signupError.textContent = '';
      openModal(signupModal);
    });
  }

  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
  }

  if (closeSignupBtn) {
    closeSignupBtn.addEventListener('click', () => closeModal(signupModal));
  }

  // Bytt fra login → signup
  if (switchToSignupBtn) {
    switchToSignupBtn.addEventListener('click', () => {
      closeModal(loginModal);
      signupError.textContent = '';
      openModal(signupModal);
    });
  }

  // Submit login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!data.success) {
          loginError.textContent = data.message || 'Innlogging feilet.';
          return;
        }

        // Succes → redirect til topp-listen
        window.location.href = data.redirect || '/understory-toplist';
      } catch (err) {
        console.error(err);
        loginError.textContent = 'En uventet feil oppstod under innlogging.';
      }
    });
  }

  // Submit signup
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      signupError.textContent = '';

      const formData = new FormData(signupForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const res = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!data.success) {
          signupError.textContent = data.message || 'Registrering feilet.';
          return;
        }

        // Registrering ok → lukk signup og åpne login med melding
        closeModal(signupModal);
        openModal(loginModal);
        loginError.textContent = 'Bruker opprettet. Logg inn med e-post og passord.';
      } catch (err) {
        console.error(err);
        signupError.textContent = 'En uventet feil oppstod under registrering.';
      }
    });
  }
});


//MÅ SE OVER OG GJØRE MINDRE CHAT