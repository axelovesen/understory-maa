document.addEventListener('DOMContentLoaded', () => {
  // Modaler
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const twoFactorModal = document.getElementById('twoFactorModal'); 

  // Knapper i headeren
  const openLoginBtn = document.getElementById('openLogin');
  const openSignupBtn = document.getElementById('openSignup');

  // Close-knapper
  const closeLoginBtn = document.getElementById('closeLogin');
  const closeSignupBtn = document.getElementById('closeSignup');
  const close2FABtn = document.getElementById('close2FA');

  // Forms og feilmeldinger
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const twoFactorError = document.getElementById('twoFactorError');

  const switchToSignupBtn = document.getElementById('switchToSignup');
  const verify2FAButton = document.getElementById('verify2FA');
  const twoFactorCodeInput = document.getElementById('twoFactorCode');


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

  if (close2FABtn) {
    close2FABtn.addEventListener('click', () => closeModal(twoFactorModal));
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


        if (data.requires2FA) {
          closeModal(loginModal);
          twoFactorError.textContent = '';
          if(twoFactorCodeInput) twoFactorCodeInput.value = '';
          openModal(twoFactorModal);
          return;
        }

      } catch (err){
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
      const phone = formData.get('phone');
      const password = formData.get('password');

      try {
        const res = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, phone, password }),
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
  //2FA bekreft kode
  if(verify2FAButton){
    verify2FAButton.addEventListener('click', async () => {
      if(!twoFactorCodeInput) return;

      const code = twoFactorCodeInput.value.trim();
      twoFactorError.textContent = '';

      if(!code){
        twoFactorError.textContent = 'skriv inn koden du fikk på SMS';
        return;
      }

      try{
        const res = await fetch('/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if(!data.success){
          twoFactorError.textContent = data.message || 'Ugyldig kode, Prøv igjen.';
          return;
        }

        window.location.href = data.redirect || '/understory-toplist';

      } catch (err){
        console.error(err);
        twoFactorError.textContent = 'En uventet feil oppstod under 2FA.';
      }
    });
  }
});
