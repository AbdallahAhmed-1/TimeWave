window.addEventListener("DOMContentLoaded", function () {
  const div = document.querySelector("#main-text");
  const text = div.textContent;

  function typewriterEffect(element, text, i = 0) {
    if (i === 0) {
      element.textContent = "";
    }
    element.textContent += text[i];
    if (i === text.length - 1) {
      return;
    }
    setTimeout(() => typewriterEffect(element, text, i + 1), 60);
  }

  typewriterEffect(div, text);
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletter-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("newsletter-email");
    const email = emailInput.value.trim();

    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email }),
      });

      if (response.ok) {
        alert(`Thanks for subscribing, ${email}!`);
        form.reset();
      } else {
        const message = await response.text();
        alert("Subscription failed: " + message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });

  function validateEmail(email) {
    // Basic email pattern check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
