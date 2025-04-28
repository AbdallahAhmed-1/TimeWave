document.addEventListener('DOMContentLoaded', function() {
    // Get existing elements
    const form = document.querySelector('form');
    const heading = document.querySelector('h1');
    const submitButton = document.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error-message');
    const toggleContainer = document.querySelector('.mt-3.text-center');

    // Create signup fields
    const usernameField = document.createElement('div');
    usernameField.className = 'mb-3 signup-field';
    usernameField.innerHTML = `
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" name="username" placeholder="Choose a username" required>
            `;
    usernameField.style.display = 'none'; // Hidden by default

    const confirmPasswordField = document.createElement('div');
    confirmPasswordField.className = 'mb-3 signup-field';
    confirmPasswordField.innerHTML = `
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
            `;
    confirmPasswordField.style.display = 'none'; // Hidden by default

    // Add fields to the form
    const emailField = document.querySelector('.mb-3'); // First form group (email)
    form.insertBefore(usernameField, emailField);
    const passwordField = document.querySelector('#password').closest('.mb-3');
    passwordField.after(confirmPasswordField);

    // Initialize state
    let isLoginForm = true;
    updateFormState();

    // Add event listener to the toggle link
    document.getElementById('toggleForm').addEventListener('click', function(e) {
        e.preventDefault();
        isLoginForm = !isLoginForm; // Toggle state
        updateFormState();

        // Clear error message when switching forms
        errorMessage.style.display = 'none';
    });

    // Function to update the form based on current state
    function updateFormState() {
        if (isLoginForm) {
            // Login form
            heading.textContent = 'Log into TimeWeave';
            submitButton.textContent = 'Log in';
            toggleContainer.innerHTML = 'Don\'t have an account? <a href="#" id="toggleForm">Sign up</a>';

            // Hide signup fields and disable their required attribute
            document.querySelectorAll('.signup-field').forEach(field => {
                field.style.display = 'none';
                field.querySelector('input').required = false;
            });
        } else {
            // Signup form
            heading.textContent = 'Sign up for TimeWeave';
            submitButton.textContent = 'Sign up';
            toggleContainer.innerHTML = 'Already have an account? <a href="#" id="toggleForm">Log in</a>';

            // Show signup fields and enable their required attribute
            document.querySelectorAll('.signup-field').forEach(field => {
                field.style.display = 'block';
                field.querySelector('input').required = true;
            });
        }

        // Re-attach event listener to the new toggle link
        document.getElementById('toggleForm').addEventListener('click', function(e) {
            e.preventDefault();
            isLoginForm = !isLoginForm;
            updateFormState();
            errorMessage.style.display = 'none';
        });
    }

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate passwords match for registration
        if (!isLoginForm) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                errorMessage.textContent = 'Passwords do not match!';
                errorMessage.style.display = 'block';
                return;
            }
        }

        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (isLoginForm) {
            // Login request
            fetch('/api/v1/auth/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
                .then(response => {
                    if (response.ok) return response.json();
                    throw new Error('Login failed');
                })
                .then(data => {
                    // Store token in localStorage
                    localStorage.setItem('token', data.token);
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                })
                .catch(error => {
                    // Show error message
                    errorMessage.textContent = 'Invalid email or password';
                    errorMessage.style.display = 'block';
                });
        } else {
            // Registration request
            const username = document.getElementById('username').value;

            fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            })
                .then(response => {
                    if (response.ok) return response.json();
                    throw new Error('Registration failed');
                })
                .then(data => {
                    // Store token in localStorage
                    localStorage.setItem('token', data.token);
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                })
                .catch(error => {
                    // Show error message
                    errorMessage.textContent = 'Registration failed. Email or username may already be in use.';
                    errorMessage.style.display = 'block';
                });
        }
    });
});