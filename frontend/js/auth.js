(() => {
  const toast = document.querySelector('.toast');
  let toastTimer;
  const showToast = (message, type) => {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 3800);
  };
  const setError = (input, message = '') => {
    document.getElementById(`${input.id}-error`).textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  };
  const validate = (input, password) => {
    const value = input.value.trim();
    if (!value) return 'This field is required.';
    if (input.name === 'name' && value.length < 2) return 'Please enter at least 2 characters.';
    if (input.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    if (input.name === 'password' && value.length < 8) return 'Password must be at least 8 characters.';
    if (input.name === 'confirmPassword' && value !== password) return 'Passwords do not match.';
    return '';
  };
  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
      button.setAttribute('aria-pressed', String(!visible));
      button.textContent = visible ? '◉' : '◉';
    });
  });
  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    const inputs = [...form.querySelectorAll('input')];
    const password = () => form.elements.password.value;
    inputs.forEach((input) => input.addEventListener('blur', () => setError(input, validate(input, password()))));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let valid = true;
      inputs.forEach((input) => { const error = validate(input, password()); setError(input, error); valid &&= !error; });
      if (!valid) { showToast('Please correct the highlighted fields.', 'error'); form.querySelector('[aria-invalid="true"]')?.focus(); return; }
      showToast(form.dataset.authForm === 'register' ? 'Account created successfully. Opening Notes…' : 'Signed in successfully. Opening Notes…', 'success');
      form.reset();
      setTimeout(() => { window.location.href = './notes.html'; }, 900);
    });
  });
  document.querySelectorAll('[data-provider]').forEach((button) => button.addEventListener('click', () => showToast(`${button.dataset.provider} sign-in is not configured yet.`, 'error')));
})();
