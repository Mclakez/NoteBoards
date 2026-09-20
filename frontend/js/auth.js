
import { api } from "./api.js";

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
  //What does this mean
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

async function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formIsValid = validateForm(form);

  if (!formIsValid) {
    showAuthToast('Please correct the highlighted fields.', 'error');
    focusFirstInvalidField(form);
    return;
  }

  let message = ''
  const isRegistration = form.dataset.authForm === 'register';
  const formData = new FormData(form)
  const body = Object.fromEntries(formData.entries())

  if (isRegistration) {
    const register = await api.post('/auth/signup', body)
    console.log(register);

    if (body.username) {
      localStorage.setItem('noteboards-user', body.username);
    }
    
    message = 'Account created successfully. Opening Notes…'
    showAuthToast(message, 'success');
    form.reset();
     setTimeout(redirectToLogin, 900);
  } else {
    console.log("Login button");
    
    const login = await api.post('/auth/login', body)
    console.log(login);

    const loggedInUser = login?.username || body.username;
    if (loggedInUser) {
      localStorage.setItem('noteboards-user', loggedInUser);
    }
    
    message = 'Signed in successfully. Opening Notes…';
    showAuthToast(message, 'success');
    form.reset();
    setTimeout(redirectToNotes, 900);
  }
  

  
 
}

function handleProviderClick(event) {
  const provider = event.currentTarget.dataset.provider;
  handleGoogleSignup()

  showAuthToast(`${provider} sign-in `);
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