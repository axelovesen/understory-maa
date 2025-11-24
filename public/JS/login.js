const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const closeLoginButton = document.getElementById('closeLogin');
const closeSignupButton = document.getElementById('closeSignup');
const logoutButton = document.getElementById('logoutButton');

const openLoginButtons = [
  document.getElementById('openLogin'),
  document.getElementById('openLoginOverlay')
];

const openSignupButtons = [
  document.getElementById('openSignup'),
  document.getElementById('openSignupOverlay')
];

function openModal(modal) {
  if (modal) modal.classList.remove('hidden');
}

function closeModal(modal) {
  if (modal) modal.classList.add('hidden');
}

openLoginButtons.forEach(button => {
  if (button) {
    button.addEventListener('click', () => openModal(loginModal));
  }
});

openSignupButtons.forEach(button => {
  if (button) {
    button.addEventListener('click', () => openModal(signupModal));
  }
});

if (closeLoginButton) {
  closeLoginButton.addEventListener('click', () => closeModal(loginModal));
}

if (closeSignupButton) {
  closeSignupButton.addEventListener('click', () => closeModal(signupModal));
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const response = await fetch('/login', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.error) {
      document.getElementById('loginError').innerText = data.error;
    } else {
      location.reload();
    }
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);
    const response = await fetch('/signup', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();

    if (data.error) {
      document.getElementById('signupError').innerText = data.error;
    } else {
      location.reload();
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    const response = await fetch('/logout', { method: 'POST' });
    const data = await response.json();

    if (data.success) {
      location.reload();
    }
  });
}