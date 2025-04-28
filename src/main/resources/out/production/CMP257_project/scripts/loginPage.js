document.addEventListener('DOMContentLoaded', function() {
    // Get existing elements
    const form = document.querySelector('form');
    const heading = document.querySelector('h1');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Create toggle container (only created once)
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'mt-3 text-center';
    form.after(toggleContainer);
    
    // Create signup fields (only created once)
    const nameField = document.createElement('div');
    nameField.className = 'mb-3 signup-field';
    nameField.innerHTML = `
        <label for="name" class="form-label">Full Name</label>
        <input type="text" class="form-control" id="name" name="name" placeholder="Your name" required>
    `;
    nameField.style.display = 'none'; // Hidden by default
    
    const confirmPasswordField = document.createElement('div');
    confirmPasswordField.className = 'mb-3 signup-field';
    confirmPasswordField.innerHTML = `
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input type="password" class="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm password" required>
    `;
    confirmPasswordField.style.display = 'none'; // Hidden by default
    
    // Add fields to the form (only once)
    const emailField = document.querySelector('.mb-3'); // First form group (email)
    form.insertBefore(nameField, emailField);
    submitButton.parentNode.before(confirmPasswordField);
    
    // Initialize state
    let isLoginForm = true;
    updateFormState();
    
    // Add single event listener to the container (using event delegation)
    toggleContainer.addEventListener('click', function(e) {
        if (e.target.id === 'toggleForm' || e.target.parentNode.id === 'toggleForm') {
            e.preventDefault();
            isLoginForm = !isLoginForm; // Toggle state
            updateFormState();
        }
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
    }
    
    // Form validation
    form.addEventListener('submit', function(e) {
        if (!isLoginForm) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Passwords do not match!');
            }
        }
    });
    // form submission to REST endpoint
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

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
                document.getElementById('error-message').style.display = 'block';
            });
    });
});