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
  