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
      //Set the timer in the second parameter
      setTimeout(() => typewriterEffect(element, text, i + 1), 60);
    }
    typewriterEffect(div, text);
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
  
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim();
      if (!email) {
        alert('Please enter a valid email address.');
      } else {
        alert(`Thanks for subscribing, ${email}!`);
        form.reset();
      }
    });
  });
  