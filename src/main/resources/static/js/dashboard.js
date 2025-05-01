document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    const newEntryBtn = document.getElementById("new-entry");
    const entryModal = new bootstrap.Modal(document.getElementById("entryModal"));
    const entryType = document.getElementById("entryType");
    const textInput = document.getElementById("textInput");
    const photoInput = document.getElementById("photoInput");
    const entryForm = document.getElementById("entryForm");

    // Load existing memories
    fetch("/api/memories", {
        headers: {
            "Authorization": "Bearer " + token
        },
        method: "GET",
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch memories");
            return res.json();
        })
        .then(data => {
            data.forEach(appendMemoryToRecent);
        })
        .catch(err => {
            console.error("Error loading memories:", err.message);
            alert("Session expired. Please log in again.");
            window.location.href = "/login";
        });

    // Show modal when clicking "+ New Entry"
    newEntryBtn.addEventListener("click", () => {
        entryModal.show();
    });

    // Toggle input fields based on selected type
    entryType.addEventListener("change", () => {
        const type = entryType.value;
        textInput.style.display = type === "text" ? "block" : "none";
        photoInput.style.display = type === "photo" ? "block" : "none";
    });

    // Handle form submission
    entryForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const type = entryType.value;
        const title = document.getElementById("entryTitle").value;
        const text = document.getElementById("entryText").value;
        const photo = document.getElementById("entryPhoto").files[0];
        const location = document.getElementById("entryLocation").value;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("location", location);
        formData.append("type", type);

        if (type === "text") {
            formData.append("content", text);
        } else if (type === "photo" && photo) {
            formData.append("photo", photo);
        }

        fetch("/api/memories", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData,
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(`Server error (${res.status}): ${text}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                alert("Memory saved successfully!");
                entryModal.hide();
                entryForm.reset();
                textInput.style.display = "none";
                photoInput.style.display = "none";
                appendMemoryToRecent(data);
            })
            .catch((err) => {
                console.error("Detailed error:", err.message);
                alert("Error saving memory: " + err.message);
            });
    });
});

function appendMemoryToRecent(memory) {
    const container = document.getElementById("mini-cards");
    const div = document.createElement("div");

    let contentHtml = '';
    if (memory.type === "text") {
        contentHtml = `<p>${memory.content}</p>`;
    } else if (memory.type === "photo") {
        contentHtml = `<img src="/uploads/${memory.content}" alt="${memory.title}" class="img-thumbnail" style="max-width: 100%; height: auto;">`;
    }

    div.innerHTML = `
        <h6>${memory.title}</h6>
        ${contentHtml}
        <small>${memory.date} | ${memory.location}</small>
        <hr/>
    `;

    container.prepend(div);
}
