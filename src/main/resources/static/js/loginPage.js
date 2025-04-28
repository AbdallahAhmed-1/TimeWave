


document.addEventListener('DOMContentLoaded', function() {

    const form       = document.querySelector('form#loginForm');
    const heading    = document.querySelector('h1');
    const submitBtn  = document.querySelector('button[type="submit"]');
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'mt-3 text-center';
    form.after(toggleContainer);

    // Signup extra fields
    const nameField = document.createElement('div');
    nameField.className = 'mb-3 signup-field';
    nameField.innerHTML = `
    <label for="name" class="form-label">Username</label>
    <input type="text" class="form-control" id="name" name="username" placeholder="Your name" required>
  `;
    nameField.style.display = 'none';
    form.insertBefore(nameField, form.querySelector('.mb-3'));

    const confirmField = document.createElement('div');
    confirmField.className = 'mb-3 signup-field';
    confirmField.innerHTML = `
    <label for="confirmPassword" class="form-label">Confirm Password</label>
    <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
  `;
    confirmField.style.display = 'none';
    form.insertBefore(confirmField, submitBtn);

    let isLogin = true;
    updateForm();

    toggleContainer.addEventListener('click', e => {
        if (e.target.matches('#toggleForm')) {
            e.preventDefault();
            isLogin = !isLogin;
            updateForm();
        }
    });

    function updateForm() {
        if (isLogin) {
            heading.textContent = 'Log into TimeWeave';
            submitBtn.textContent = 'Log in';
            toggleContainer.innerHTML = `Don’t have an account? <a href="#" id="toggleForm">Sign up</a>`;
            document.querySelectorAll('.signup-field').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.signup-field input').forEach(i => i.required = false);
        } else {
            heading.textContent = 'Sign up for TimeWeave';
            submitBtn.textContent = 'Sign up';
            toggleContainer.innerHTML = `Already have an account? <a href="#" id="toggleForm">Log in</a>`;
            document.querySelectorAll('.signup-field').forEach(el => el.style.display = 'block');
            document.querySelectorAll('.signup-field input').forEach(i => i.required = true);
        }
    }

    form.addEventListener('submit', async e => {

        e.preventDefault();

        const email    = form.email.value.trim();
        const password = form.password.value;
        let url, body;

        if (isLogin) {
            url  = '/api/v1/auth/authenticate';
            JSON.stringify({ email, password });
        } else {
            const username        = form.username.value.trim();
            const confirmPassword = form.confirmPassword.value;
            if (password !== confirmPassword) {
                return alert('Passwords do not match!');
            }
            url  = '/api/v1/auth/register';
            body = JSON.stringify({
                username: username,
                email: email,
                password: password});

        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);

                if(!isLogin) {
                    alert('Registration successful. Please log in.');
                    isLogin = true;
                    updateForm();
                    form.reset();
                }
                else{
                    window.location.href = '/dashboard';
                }
            }
            else{
                const text = await response.text();
                alert((isLogin ? 'Login' : 'Registration') + ' failed. ' + (text.length > 0 ? text : 'Please try again.'))
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
});
})
