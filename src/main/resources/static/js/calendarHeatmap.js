function fetchCalendarDataAndRender() {
    fetch("/api/memories/calendar-data", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        credentials: "include"
    })
        .then(res => res.json())
        .then(data => {
            const structuredData = Object.entries(data).map(([date, moodObj]) => ({
                date: date,
                mood: moodObj.mood || 'neutral'
            }));
            renderCalendar(structuredData);
        })
        .catch(err => {
            console.error("Error loading calendar data:", err.message);
        });
}

function renderCalendar(data) {
    const moodColors = {
        happy: "#2ecc71",
        sad: "#e74c3c",
        anxious: "#f1c40f",
        relaxed: "#3498db",
        neutral: "#bdc3c7"
    };

    const cal = new CalHeatmap();

    setTimeout(() => {
        cal.paint({
            itemSelector: '#cal-heatmap',
            date: {
                start: new Date('2025-01-01'),
            },
            domain: { type: 'month', sort: 'asc' },
            subDomain: { type: 'day', radius: 2, width: 11, height: 11, gutter: 4 },
            range: 12,
            data: {
                source: data,
                x: 'date',
                y: 'mood',
                groupY: values => values[0]  // Use the first mood if multiple entries exist
            },
            scale: {
                color: {
                    type: 'ordinal',
                    domain: Object.keys(moodColors),
                    range: Object.values(moodColors)
                }
            },
            onClick: function (date, val) {
                alert(`Date: ${date.toDateString()}\nMood: ${val || 'No mood recorded'}`);
            }
        });
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCalendarDataAndRender();
});

