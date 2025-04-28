// dashboard.js
document.addEventListener('DOMContentLoaded', function() {

    // ... (Previous code for view switching and new entry button)

    // Function to fetch and display memories (replace with your actual API endpoint)
    async function fetchMemories(view, filter = {}) { // Added filter parameter
        try {
            const response = await fetch(`/api/memories?view=${view}`, { // Use template literals for dynamic URL
                method: 'POST', // Use POST for filters
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filter) // Send filters in request body
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Update the display with the retrieved memories (Implementation depends on your HTML structure)
            displayMemories(data);
        } catch (error) {
            console.error('Error fetching memories:', error);
            // Display error message to the user
        }
    }




    // Helper function to display memories (you'll need to customize this)
    function displayMemories(memories) {
        // Your display logic here, possibly rendering in a table
        console.log(memories)
    }


    // Initial fetch and display of memories
    fetchMemories('timeline'); // Default view

    // ... Event listeners for view switching buttons (similar to before, but now call fetchMemories with the appropriate view)

    // Add click event listeners to each button
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the URL from the data-url attribute
            const view = this.dataset.view;

            //Fetch the data from the correct endpoint
            fetchMemories(view);

        });

    });

    // ... (Code for "New Entry" button and other features)
});