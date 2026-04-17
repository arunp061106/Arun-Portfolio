document.addEventListener("DOMContentLoaded", function () {

  const text = "Data Analyst | Business Intelligence | Insights & Reporting";
  const typingElement = document.querySelector(".typing");

  let i = 0;

  function typingEffect() {
    if (i < text.length) {
      typingElement.textContent += text.charAt(i);
      i++;
      setTimeout(typingEffect, 40);
    }
  }

  if (typingElement) {
    typingEffect();
  }

  const reveals = document.querySelectorAll(".reveal");

  function revealOnScroll() {
    reveals.forEach((reveal) => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 50;

      if (revealTop < windowHeight - revealPoint) {
        reveal.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  // Trigger once on load
  revealOnScroll();

  // Add glass nav effect on scroll
  const nav = document.querySelector('.glass-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.background = 'rgba(7, 11, 20, 0.85)';
      nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
      nav.style.background = 'rgba(7, 11, 20, 0.7)';
      nav.style.boxShadow = 'none';
    }
  });

});