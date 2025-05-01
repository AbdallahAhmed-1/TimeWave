document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Form elements (assumes your inline form is visible on the page)
    const entryForm = document.getElementById("entryForm");
    const entryType = document.getElementById("entryType");
    const textInput = document.getElementById("textInput");
    const photoInput = document.getElementById("photoInput");

    // Elements for audio recording
    const recordBtn = document.getElementById("recordAudioBtn");
    const audioPreview = document.getElementById("audioPreview");
    let mediaRecorder;
    let audioChunks = [];

    // Toggle extra inputs based on the selected type:
    entryType.addEventListener("change", () => {
        const type = entryType.value;
        if (type === "text") {
            textInput.style.display = "block";
            photoInput.style.display = "none";
        } else if (type === "photo") {
            photoInput.style.display = "block";
            textInput.style.display = "none";
        } else {
            textInput.style.display = "none";
            photoInput.style.display = "none";
        }
    });
    // Logout button: send a request to the server to log the user out
    document.getElementById("logoutBtn").addEventListener("click", function () {
        fetch("/api/v1/auth/logout", {
            method: "GET",
            credentials: "include"
        })
            .then(() => {
                // Optional: remove token if you're still storing it in localStorage
                localStorage.removeItem("token");
                window.location.href = "/login";
            })
            .catch(err => {
                console.error("Logout failed:", err);
                alert("Error logging out. Please try again.");
            });
    });
    // Record audio button: start/stop recording using MediaRecorder API
    recordBtn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };
                mediaRecorder.onstop = () => {
                    const blob = new Blob(audioChunks, { type: "audio/webm" });
                    const audioUrl = URL.createObjectURL(blob);
                    audioPreview.src = audioUrl;
                    audioPreview.style.display = "block";
                    // Store the blob for later upload
                    audioPreview.dataset.blob = blob;
                };
                mediaRecorder.start();
                recordBtn.textContent = "🛑 Stop Recording";
            } catch (error) {
                console.error("Audio recording error:", error);
                alert("Could not access microphone.");
            }
        } else {
            mediaRecorder.stop();
            recordBtn.textContent = "🎙️ Record Audio";
        }
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

        // Append recorded audio if available
        if (audioPreview.dataset.blob) {
            const audioFile = new File([audioPreview.dataset.blob], "recording.webm", { type: "audio/webm" });
            formData.append("audio", audioFile);
        }

        fetch("/api/memories", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token
            },
            body: formData,
            credentials: "include"
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
                // Reset the form and hide extra inputs
                entryForm.reset();
                textInput.style.display = "none";
                photoInput.style.display = "none";
                audioPreview.style.display = "none";
                delete audioPreview.dataset.blob;
                appendMemoryToRecent(data);
            })
            .catch((err) => {
                console.error("Detailed error:", err.message);
                alert("Error saving memory: " + err.message);
            });
    });
    function appendMemoryToRecent(memory) {
        const container = document.getElementById("mini-cards");
        const div = document.createElement("div");

        let contentHtml = `<p>${memory.description || ''}</p>`;

        if (Array.isArray(memory.attachments)) {
            memory.attachments.forEach(att => {
                if (att.mimeType.startsWith("image/")) {
                    contentHtml += `<img src="${att.filePath}" alt="${memory.title}" class="img-thumbnail" style="max-width: 100%; height: auto;">`;
                } else if (att.mimeType.startsWith("audio/")) {
                    contentHtml += `<audio controls src="${att.filePath}"></audio>`;
                }
                // Add more types as needed
            });
        }

        div.innerHTML = `
        <h6>${memory.title}</h6>
        ${contentHtml}
        <small>${memory.location || ''}</small>
        <hr/>
    `;

        container.prepend(div);
    }

    // Load existing memories on page load
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

    // Map functionality
    const mapButton = document.querySelector('#mapTab');
    const mapDiv = document.getElementById('map');
    let mapInitialized = false;

    if (mapButton) {
        mapButton.addEventListener('click', () => {
            mapDiv.style.display = 'block';
            if (!mapInitialized) {
                const map = L.map('map').setView([25.2048, 55.2708], 12);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
                L.marker([25.2048, 55.2708]).addTo(map)
                    .bindPopup('Dubai')
                    .openPopup();
                mapInitialized = true;
            }
        });
    } else {
        console.warn("Map button with id 'mapTab' not found.");
    }
});