document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    fetch('/api/v1/auth/authenticate', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(user => {
            console.log("Loaded user:", user);
            document.getElementById('welcome').textContent = `Welcome, ${user.username}!`;
        })
        .catch(error => {
            console.error(error);
            window.location.href = '/login';
        });
});