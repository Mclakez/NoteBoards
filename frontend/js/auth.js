
import { api } from "./api.js";
const BASE_URL = "https://noteboards.onrender.com"

const authToast = document.querySelector('.toast');
let authToastTimer;

function showAuthToast(message, type) {
  authToast.textContent = message;
  authToast.className = `toast show ${type}`;
  clearTimeout(authToastTimer);
  authToastTimer = setTimeout(hideAuthToast, 3800);
}

function hideAuthToast() {
  authToast.className = 'toast';
}

function getFieldErrorElement(input) {
  return document.getElementById(`${input.id}-error`);
}

function setFieldError(input, message = '') {
  const errorElement = getFieldErrorElement(input);

  errorElement.textContent = message;
  //What this means
  input.setAttribute('aria-invalid', String(Boolean(message)));
}

function validateRequiredValue(value) {
  return value ? '' : 'This field is required.';
}

function validateInput(input, passwordValue) {
  const value = input.value.trim();
  const requiredError = validateRequiredValue(value);

  if (requiredError) {
    return requiredError;
  }

  if (input.name === 'name' && value.length < 2) {
    return 'Please enter at least 2 characters.';
  }

  if (input.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address.';
  }

  if (input.name === 'password' && value.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (input.name === 'confirmPassword' && value !== passwordValue) {
    return 'Passwords do not match.';
  }

  return '';
}

function togglePasswordVisibility(event) {
  const toggleButton = event.currentTarget;
  const passwordInput = toggleButton.previousElementSibling;
  const passwordIsVisible = passwordInput.type === 'text';
  const toggleImg = toggleButton.querySelector('img')
  

  passwordInput.type = passwordIsVisible ? 'password' : 'text';
  toggleImg.src = passwordIsVisible ? './images/icons8-eye-50.png' : './images/icons8-closed-eye-50.png'
  
  toggleButton.setAttribute(
    'aria-label',
    passwordIsVisible ? 'Show password' : 'Hide password'
  );
  toggleButton.setAttribute('aria-pressed', String(!passwordIsVisible));
}

function validateFieldOnBlur(event) {
  const input = event.currentTarget;
  const form = input.form;
  const passwordValue = form.elements.password.value;

  setFieldError(input, validateInput(input, passwordValue));
}

function validateForm(form) {
  const inputs = [...form.querySelectorAll('input')];
  const passwordValue = form.elements.password.value;
  let formIsValid = true;

  inputs.forEach((input) => {
    const errorMessage = validateInput(input, passwordValue);

    setFieldError(input, errorMessage);
    formIsValid = formIsValid && !errorMessage;
  });

  return formIsValid;
}

function focusFirstInvalidField(form) {
  const invalidInput = form.querySelector('[aria-invalid="true"]');

  invalidInput?.focus();
}

function redirectToNotes() {
  window.location.href = './notes.html';
}
function redirectToLogin() {
  window.location.href = './login.html';
}

function setButtonLoading(button, isLoading, label = 'Loading...') {
  if (!button) {
    return;
  }

  const defaultLabel = button.dataset.defaultLabel || button.textContent.trim();
  button.dataset.defaultLabel = defaultLabel;
  button.disabled = isLoading;
  button.classList.toggle('is-loading', isLoading);
  button.setAttribute('aria-busy', String(isLoading));

  if (isLoading) {
    button.innerHTML = `<span class="button-spinner" aria-hidden="true"></span><span>${label}</span>`;
    return;
  }

  button.innerHTML = defaultLabel;
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const formIsValid = validateForm(form);

  if (!formIsValid) {
    showAuthToast('Please correct the highlighted fields.', 'error');
    focusFirstInvalidField(form);
    return;
  }

  const isRegistration = form.dataset.authForm === 'register';
  const loadingLabel = isRegistration ? 'Creating your account...' : 'Signing you in...';
  const defaultLabel = isRegistration ? 'Create account' : 'Sign in';
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());

  setButtonLoading(submitButton, true, loadingLabel);
  showAuthToast(loadingLabel, 'success');

  try {
    if (isRegistration) {
      await api.post('/auth/signup', body);

      if (body.username) {
        localStorage.setItem('noteboards-user', body.username);
      }

      form.reset();
      showAuthToast('Account created successfully. Redirecting to sign in…', 'success');
      setTimeout(redirectToLogin, 900);
      return;
    }

    const login = await api.post('/auth/login', body);
    const loggedInUser = login?.username || body.username;

    if (loggedInUser) {
      localStorage.setItem('noteboards-user', loggedInUser);
    }

    form.reset();
    showAuthToast('Signed in successfully. Opening Notes…', 'success');
    setTimeout(redirectToNotes, 900);
  } catch (error) {
    const errorMessage = error.message || (isRegistration ? 'Unable to create your account right now.' : 'Unable to sign you in right now.');
    showAuthToast(errorMessage, 'error');
  } finally {
    setButtonLoading(submitButton, false, defaultLabel);
  }
}

function handleProviderClick(event) {
  const providerButton = event.currentTarget;
  const providerName = providerButton.dataset.provider || 'Google';
  const providerLabel = providerName === 'google' ? 'Google' : providerName;
  const fallbackTimer = setTimeout(() => {
    if (!document.hidden) {
      setButtonLoading(providerButton, false, providerLabel);
      showAuthToast('The sign-in server is not responding right now. Please try again in a moment.', 'error');
    }
  }, 12000);

  setButtonLoading(providerButton, true, `Connecting to ${providerLabel}...`);
  showAuthToast(`Connecting to ${providerLabel}...`, 'success');
  handleGoogleSignup();

  window.addEventListener('pageshow', () => {
    clearTimeout(fallbackTimer);
  }, { once: true });
}

function initializeAuthPage() {
  document.querySelectorAll('.password-toggle').forEach((toggleButton) => {
    toggleButton.addEventListener('click', togglePasswordVisibility);
  });

  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('blur', validateFieldOnBlur);
    });

    form.addEventListener('submit', handleAuthSubmit);
  });

  document.querySelectorAll('[data-provider]').forEach((providerButton) => {
    providerButton.addEventListener('click', handleProviderClick);
  });
}

initializeAuthPage();


const handleGoogleSignup = () => {
    window.location.href = `${BASE_URL}/api/auth/google`
   
  };