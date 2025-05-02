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
                    audioPreview.audioBlob = blob;
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
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("location", location);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("type", type);

        if (type === "text") {
            formData.append("content", text);
        } else if (type === "photo" && photo) {
            formData.append("photo", photo);
        }
        // reset location picker
        pickerMap.setView([25.2048, 55.2708], 10);
        if(locationMarker){
            pickerMap.removeLayer(locationMarker);
            locationMarker = null;
        }

        // Append recorded audio if available
        if (audioPreview.audioBlob) {
            const audioFile = new File([audioPreview.audioBlob], "recording.webm", { type: "audio/webm" });
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
        div.className = "memory-card";

        let contentHtml = `
            <div class="memory-content">
                <h6 class="memory-title">${memory.title}</h6>
                <p class="memory-text">${memory.description || ''}</p>`;

        if (Array.isArray(memory.attachments)) {
            contentHtml += '<div class="memory-attachments">';
            memory.attachments.forEach(att => {
                if (att.mimeType.startsWith("image/")) {
                    contentHtml += `
                        <img src="${att.filePath}" 
                             alt="${memory.title}" 
                             class="img-fluid rounded"
                             style="max-width: 100%; height: auto;">`;
                } else if (att.mimeType.startsWith("audio/")) {
                    contentHtml += `
                        <audio controls class="w-100">
                            <source src="${att.filePath}" type="${att.mimeType}">
                            Your browser does not support the audio element.
                        </audio>`;
                }
            });
            contentHtml += '</div>';
        }

        contentHtml += `
            <div class="memory-meta">
                <span><i class="fas fa-calendar"></i> ${memory.date || ''}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${memory.location || ''}</span>
            </div>
        </div>`;

        div.innerHTML = contentHtml;
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
            const container = document.getElementById("mini-cards");
            data.forEach(memory => {
                if (memory.latitude && memory.longitude && !isNaN(memory.latitude) && mainMap) {
                    const marker = L.marker([memory.latitude, memory.longitude])
                        .addTo(mainMap)
                        .bindPopup(`<strong>${memory.title}</strong><br>${memory.location || ""}`);
                }
            });
            document.getElementById("mapSection").style.display = "block";
            document.getElementById("mapSection").scrollIntoView({behavior: "smooth", block: "start"});

            // Add marker to map

            })
        .catch(err => {
            console.error("Error loading memories:", err.message);
            alert("Session expired. Please log in again.");
            window.location.href = "/login";
        });
    let mainMap;
    let mapInitialized = false;

    const mapButton = document.getElementById("mapTab");
    const mapSection = document.getElementById("mapSection");
    const memoryFormSection = document.querySelector(".form-card");
    mapButton.addEventListener('click', () => {
        const isHidden = mapSection.classList.contains("hidden");

        if (isHidden) {
            mapSection.classList.remove("hidden");
            memoryFormSection.classList.add("hidden");
            if (!mapInitialized) {
                mainMap = L.map('map').setView([25.2048, 55.2708], 10);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mainMap);

                fetch("/api/memories", {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token },
                    credentials: "include"
                })
                    .then(res => res.json())
                    .then(memories => {
                        memories.forEach(memory => {
                            if (memory.latitude && memory.longitude) {
                                L.marker([memory.latitude, memory.longitude])
                                    .addTo(mainMap)
                                    .bindPopup(`<strong>${memory.title}</strong><br>${memory.location || ""}`);
                            }
                        });
                    });

                mapInitialized = true;
            }

            setTimeout(() => mainMap.invalidateSize(), 200);
            mapSection.scrollIntoView({ behavior: "smooth" });

        } else {
            mapSection.classList.add("hidden");
            memoryFormSection.classList.remove("hidden");
            memoryFormSection.scrollIntoView({behavior:"smooth"});
        }
    });


    // map location picker

    const pickerMap = L.map('locationPickerMap', {
        center: [25.2048, 55.2708],
        zoom: 10
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(pickerMap);

    let locationMarker;

    pickerMap.on('click', function(e) {
        const { lat, lng } = e.latlng;

        if (!locationMarker) {
            locationMarker = L.marker([lat, lng]).addTo(pickerMap);
        } else {
            locationMarker.setLatLng([lat, lng]);
        }

        document.getElementById('latitude').value = lat.toFixed(6);
        document.getElementById('longitude').value = lng.toFixed(6);
    });

    // Color Customization
    const customizeBtn = document.getElementById('customizeBtn');
    const customizeModal = new bootstrap.Modal(document.getElementById('customizeModal'));
    const colorThemes = document.querySelectorAll('.color-theme');
    const primaryColorInput = document.getElementById('primaryColor');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const saveThemeBtn = document.getElementById('saveTheme');

    // Store custom colors separately
    let customColors = {
        primary: '#3498db',
        secondary: '#2ecc71',
        cardBg: '#ffffff',
        bodyBg: '#f8f9fa',
        textPrimary: '#2c3e50',
        textSecondary: '#34495e',
        borderColor: '#e0e0e0'
    };

    // Load saved custom colors from localStorage
    const savedCustomColors = localStorage.getItem('customColors');
    if (savedCustomColors) {
        customColors = JSON.parse(savedCustomColors);
        // Update color inputs with saved custom colors
        primaryColorInput.value = customColors.primary;
        secondaryColorInput.value = customColors.secondary;
        updateColorPreviews();
        updateCustomThemePreview(customColors.primary, customColors.secondary);
    }

    function getThemeColors(themeName) {
        const themes = {
            default: {
                primary: '#3498db',
                secondary: '#2ecc71',
                cardBg: '#ffffff',
                bodyBg: '#f8f9fa',
                textPrimary: '#2c3e50',
                textSecondary: '#34495e',
                borderColor: '#e0e0e0'
            },
            sunset: {
                primary: '#e74c3c',
                secondary: '#f39c12',
                cardBg: '#fff5f5',
                bodyBg: '#fff0f0',
                textPrimary: '#2c1810',
                textSecondary: '#3c2415',
                borderColor: '#ffe0e0'
            },
            ocean: {
                primary: '#1abc9c',
                secondary: '#3498db',
                cardBg: '#f0f9f7',
                bodyBg: '#e8f4f1',
                textPrimary: '#1a3c35',
                textSecondary: '#2c4e45',
                borderColor: '#d0e9e3'
            },
            lavender: {
                primary: '#9b59b6',
                secondary: '#8e44ad',
                cardBg: '#f9f0ff',
                bodyBg: '#f5e8ff',
                textPrimary: '#2d1a35',
                textSecondary: '#3c2445',
                borderColor: '#e8d0f5'
            },
            forest: {
                primary: '#27ae60',
                secondary: '#2ecc71',
                cardBg: '#f0f7f3',
                bodyBg: '#e8f4ed',
                textPrimary: '#1a352d',
                textSecondary: '#2c453c',
                borderColor: '#d0e9dc'
            }
        };
        return themes[themeName] || themes.default;
    }

    function toggleCustomColorsSection(show) {
        const customColorsSection = document.getElementById('customColorsSection');
        if (customColorsSection) {
            customColorsSection.style.display = show ? 'block' : 'none';
        }
    }

    function updateCustomThemePreview(primary, secondary) {
        const customTheme = document.querySelector('.color-theme[data-theme="custom"]');
        if (customTheme) {
            const preview = customTheme.querySelector('.theme-preview');
            if (preview) {
                preview.style.background = `linear-gradient(45deg, ${primary}, ${secondary})`;
            }
        }
    }

    function applyTheme(theme) {
        console.log('Applying theme:', theme); // Debug log
        
        // Set the theme attribute on the body
        document.body.setAttribute('data-theme', theme.name || 'default');
        
        if (theme.name === 'custom') {
            // Set CSS variables for custom theme
            document.documentElement.style.setProperty('--primary-color', theme.primary);
            document.documentElement.style.setProperty('--secondary-color', theme.secondary);
            document.documentElement.style.setProperty('--card-bg', theme.cardBg);
            document.documentElement.style.setProperty('--body-bg', theme.bodyBg);
            document.documentElement.style.setProperty('--text-primary', theme.textPrimary);
            document.documentElement.style.setProperty('--text-secondary', theme.textSecondary);
            document.documentElement.style.setProperty('--border-color', theme.borderColor);
        }
        
        // Update color inputs if they exist
        const primaryColorInput = document.getElementById('primaryColor');
        const secondaryColorInput = document.getElementById('secondaryColor');
        if (primaryColorInput && secondaryColorInput) {
            primaryColorInput.value = theme.primary;
            secondaryColorInput.value = theme.secondary;
            // Update color previews immediately
            updateColorPreviews();
            // Update custom theme preview
            updateCustomThemePreview(theme.primary, theme.secondary);
        }
        
        // Update active theme preview
        const activeTheme = document.querySelector('.color-theme.active');
        if (activeTheme) {
            activeTheme.querySelector('.theme-preview').style.borderColor = theme.primary;
        }
    }

    function updateColorPreviews() {
        const primaryPreview = document.getElementById('primaryColorPreview');
        const secondaryPreview = document.getElementById('secondaryColorPreview');
        if (primaryPreview && secondaryPreview) {
            primaryPreview.style.backgroundColor = primaryColorInput.value;
            secondaryPreview.style.backgroundColor = secondaryColorInput.value;
        }
    }

    // Handle theme selection
    colorThemes.forEach(theme => {
        theme.addEventListener('click', () => {
            const themeName = theme.dataset.theme;
            console.log('Theme clicked:', themeName); // Debug log
            
            // Remove active class from all themes
            colorThemes.forEach(t => t.classList.remove('active'));
            // Add active class to selected theme
            theme.classList.add('active');
            
            if (themeName === 'custom') {
                console.log('Custom theme selected, current custom colors:', customColors); // Debug log
                
                // For custom theme, use the saved custom colors
                const currentCustomTheme = {
                    ...customColors,
                    name: 'custom'
                };
                
                // Show custom colors section
                toggleCustomColorsSection(true);
                
                // Apply the custom theme
                applyTheme(currentCustomTheme);
                
                // Save current theme to localStorage
                localStorage.setItem('dashboardTheme', JSON.stringify(currentCustomTheme));
            } else {
                // For preset themes, use the predefined colors
                const presetTheme = {
                    ...getThemeColors(themeName),
                    name: themeName
                };
                
                // Hide custom colors section
                toggleCustomColorsSection(false);
                
                // Apply the preset theme
                applyTheme(presetTheme);
                
                // Save current theme to localStorage
                localStorage.setItem('dashboardTheme', JSON.stringify(presetTheme));
                
                // Update custom theme preview with current custom colors
                updateCustomThemePreview(customColors.primary, customColors.secondary);
            }
        });
    });

    // Handle custom color inputs
    const primaryColorPreview = document.getElementById('primaryColorPreview');
    const secondaryColorPreview = document.getElementById('secondaryColorPreview');

    // Make color previews clickable
    primaryColorPreview.addEventListener('click', () => {
        primaryColorInput.click();
    });

    secondaryColorPreview.addEventListener('click', () => {
        secondaryColorInput.click();
    });

    [primaryColorInput, secondaryColorInput].forEach(input => {
        input.addEventListener('input', () => {
            console.log('Color input changed:', input.id, input.value); // Debug log
            
            // Activate custom theme when colors are changed
            const customThemeElement = document.querySelector('.color-theme[data-theme="custom"]');
            if (customThemeElement) {
                colorThemes.forEach(t => t.classList.remove('active'));
                customThemeElement.classList.add('active');
                toggleCustomColorsSection(true);
            }
            
            // Update color previews
            updateColorPreviews();
            
            // Update custom theme preview
            updateCustomThemePreview(primaryColorInput.value, secondaryColorInput.value);
            
            // Update custom colors
            customColors = {
                ...customColors,
                primary: primaryColorInput.value,
                secondary: secondaryColorInput.value
            };
            
            console.log('Updated custom colors:', customColors); // Debug log
            
            // Save custom colors to localStorage
            localStorage.setItem('customColors', JSON.stringify(customColors));
            
            // Create and apply custom theme
            const updatedCustomTheme = {
                ...customColors,
                name: 'custom'
            };
            
            // Apply the custom theme
            applyTheme(updatedCustomTheme);
            
            // Save current theme to localStorage
            localStorage.setItem('dashboardTheme', JSON.stringify(updatedCustomTheme));
        });
    });

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('dashboardTheme');
    if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        console.log('Loading saved theme:', theme); // Debug log
        
        // Update color inputs
        primaryColorInput.value = theme.primary;
        secondaryColorInput.value = theme.secondary;
        
        // Update color previews
        updateColorPreviews();
        
        // Update custom theme preview
        updateCustomThemePreview(theme.primary, theme.secondary);
        
        // Activate the appropriate theme button
        const themeElement = document.querySelector(`.color-theme[data-theme="${theme.name}"]`);
        if (themeElement) {
            colorThemes.forEach(t => t.classList.remove('active'));
            themeElement.classList.add('active');
            toggleCustomColorsSection(theme.name === 'custom');
        }
        
        // Apply the theme
        applyTheme(theme);
    } else {
        // Default to showing custom colors section
        toggleCustomColorsSection(true);
    }

    // Save theme changes
    saveThemeBtn.addEventListener('click', () => {
        const activeTheme = document.querySelector('.color-theme.active');
        let theme;
        
        if (activeTheme) {
            const themeName = activeTheme.dataset.theme;
            if (themeName === 'custom') {
                // If custom theme is selected, use the current color input values
                theme = {
                    name: 'custom',
                    primary: primaryColorInput.value,
                    secondary: secondaryColorInput.value,
                    cardBg: '#ffffff',
                    bodyBg: '#f8f9fa',
                    textPrimary: '#2c3e50',
                    textSecondary: '#34495e',
                    borderColor: '#e0e0e0'
                };
            } else {
                // If a preset theme is selected
                theme = { ...getThemeColors(themeName), name: themeName };
            }
        } else {
            // If no theme is selected, use custom colors
            theme = {
                name: 'custom',
                primary: primaryColorInput.value,
                secondary: secondaryColorInput.value,
                cardBg: '#ffffff',
                bodyBg: '#f8f9fa',
                textPrimary: '#2c3e50',
                textSecondary: '#34495e',
                borderColor: '#e0e0e0'
            };
        }
        
        // Save to localStorage
        localStorage.setItem('dashboardTheme', JSON.stringify(theme));
        
        // Apply the theme
        applyTheme(theme);
        
        // Close modal
        customizeModal.hide();
    });

    customizeBtn.addEventListener('click', () => {
        customizeModal.show();
    });
});