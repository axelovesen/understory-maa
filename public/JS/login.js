document.addEventListener('DOMContentLoaded', () => {
  //Modaler/Moduler
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const twoFactorModal = document.getElementById('twoFactorModal'); 

  //Knapper i header
  const openLoginBtn = document.getElementById('openLogin');
  const openSignupBtn = document.getElementById('openSignup');

  //close knapper
  const closeLoginBtn = document.getElementById('closeLogin');
  const closeSignupBtn = document.getElementById('closeSignup');
  const close2FABtn = document.getElementById('close2FA');

  //forms og feilmeldinger
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const twoFactorError = document.getElementById('twoFactorError');

  const switchToSignupBtn = document.getElementById('switchToSignup');
  const verify2FAButton = document.getElementById('verify2FA');
  const twoFactorCodeInput = document.getElementById('twoFactorCode');

  //hjelpefunksjoner for å vise/skjule modal
  function openModal(modal) {
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
  }

  // åpne/lukke modaler
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', () => {
      loginError.textContent = '';
      openModal(loginModal);
    });
  }

  if (openSignupBtn) { //åpne signup
    openSignupBtn.addEventListener('click', () => {
      signupError.textContent = '';
      openModal(signupModal);
    });
  }

  if (closeLoginBtn) { //lukke login
    closeLoginBtn.addEventListener('click', () => closeModal(loginModal));
  }

  if (closeSignupBtn) { //lukke signup
    closeSignupBtn.addEventListener('click', () => closeModal(signupModal));
  }

  if (close2FABtn) { //lukke 2FA
    close2FABtn.addEventListener('click', () => closeModal(twoFactorModal));
  }

  //bytter fra login til signup skjema
  if (switchToSignupBtn) {
    switchToSignupBtn.addEventListener('click', () => {
      closeModal(loginModal);
      signupError.textContent = '';
      openModal(signupModal);
    });
  }

  //submit login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); //forhindre standard form submit
      loginError.textContent = ''; //nullstill feilmelding

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try { //Sender login data til server
        const res = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'same-origin', //sender cookies med session
        });

        const data = await res.json(); //leser JSON respons

        if (!data.success) {
          loginError.textContent = data.message || 'Innlogging feilet.';
          return;
        }

        //hvis bruker har 2FA aktivert
        if (data.requires2FA) {
          closeModal(loginModal); //lukk login modal
          twoFactorError.textContent = ''; //nullstill 2FA feilmeldin
          if(twoFactorCodeInput) twoFactorCodeInput.value = ''; //tøm input
          openModal(twoFactorModal); //åpner 2FA modal
          return;
        }

      //redirect på server om ikke
      } catch (err){
        console.error(err);
        loginError.textContent = 'En uventet feil oppstod under innlogging.';
      }
    });
  }


  //submit signup
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault(); //hindrer standard form submit
      signupError.textContent = ''; //nullstill feilmelding

      const formData = new FormData(signupForm);
      const email = formData.get('email');
      const phone = formData.get('phone');
      const password = formData.get('password');

      try { //sender data til server
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

        // Registrering ok, lukk signup og åpne login med melding
        closeModal(signupModal);
        openModal(loginModal);
        loginError.textContent = 'Bruker opprettet. Logg inn med e-post og passord.';
      } catch (err) {
        console.error(err);
        signupError.textContent = 'En uventet feil oppstod under registrering.';
      }
    });
  }
  //2FA bekreftet kode
  if(verify2FAButton){
    verify2FAButton.addEventListener('click', async () => {
      if(!twoFactorCodeInput) return; //sikkerhetssjekk

      const code = twoFactorCodeInput.value.trim(); //leser kode
      twoFactorError.textContent = ''; //nullstill feilmelding

      if(!code){
        twoFactorError.textContent = 'skriv inn koden du fikk på SMS';
        return;
      }

      try{ //sender 2FA kode til server
        const res = await fetch('/2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
          credentials: 'same-origin', //bruker samme session

        });

        const data = await res.json();

        //hvis koden er feil, send feilmelding
        if(!data.success){
          twoFactorError.textContent = data.message || 'Ugyldig kode, Prøv igjen.';
          return;
        }

        window.location.href = data.redirect || '/'; //redirect videre ved riktig verdier

      } catch (err){
        console.error(err);
        twoFactorError.textContent = 'En uventet feil oppstod under 2FA.';
      }
    });
  }
});
