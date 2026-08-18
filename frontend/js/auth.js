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

  passwordInput.type = passwordIsVisible ? 'password' : 'text';
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

function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formIsValid = validateForm(form);

  if (!formIsValid) {
    showAuthToast('Please correct the highlighted fields.', 'error');
    focusFirstInvalidField(form);
    return;
  }

  const isRegistration = form.dataset.authForm === 'register';
  const message = isRegistration
    ? 'Account created successfully. Opening Notes…'
    : 'Signed in successfully. Opening Notes…';

  showAuthToast(message, 'success');
  form.reset();
  setTimeout(redirectToNotes, 900);
}

function handleProviderClick(event) {
  const provider = event.currentTarget.dataset.provider;

  showAuthToast(`${provider} sign-in is not configured yet.`, 'error');
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
