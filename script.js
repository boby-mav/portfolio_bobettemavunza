const canvas = document.querySelector("#ambient-canvas");
const ctx = canvas.getContext("2d");
const themeToggle = document.querySelector(".theme-toggle");
const typingText = document.querySelector("#typing-text");
const revealEls = document.querySelectorAll(".reveal");
const statEls = document.querySelectorAll("[data-count]");
const filters = document.querySelectorAll(".filter");
const projects = document.querySelectorAll(".project");
const magneticEls = document.querySelectorAll(".magnetic");
const quickOutput = document.querySelector("#quick-output");
const quickCommands = document.querySelectorAll("[data-command]");

let width = 0;
let height = 0;
let particles = [];
let activeTheme = localStorage.getItem("portfolio-theme") || "dark";

const phrases = [
  "adonis make:app portfolio",
  "designing with Figma...",
  "building APIs with PostgreSQL..."
];

const commandReplies = {
  stack: "Stack: HTML5, CSS3, JavaScript, Figma, Node.js, AdonisJS, API REST, SQL et PostgreSQL.",
  projet: "Projet phare: X clone Adonis avec authentification, publication, timeline, likes et PostgreSQL.",
  valeur: "Valeur ajoutee: autonomie, organisation, creativite et envie d'apprendre vite en equipe."
};

function setTheme(theme) {
  activeTheme = theme;
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("portfolio-theme", theme);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(76, Math.floor(width / 15)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    r: Math.random() * 1.9 + 0.7
  }));
}

function drawAmbient() {
  ctx.clearRect(0, 0, width, height);
  const dot = activeTheme === "light" ? "rgba(12, 18, 28, 0.24)" : "rgba(255, 255, 255, 0.28)";
  const line = activeTheme === "light" ? "rgba(46, 230, 166, 0.18)" : "rgba(46, 230, 166, 0.22)";

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();

    for (let j = index + 1; j < particles.length; j += 1) {
      const next = particles[j];
      const dist = Math.hypot(p.x - next.x, p.y - next.y);
      if (dist < 120) {
        ctx.globalAlpha = 1 - dist / 120;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = line;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });

  requestAnimationFrame(drawAmbient);
}

function typeLoop() {
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    typingText.textContent = phrase.slice(0, charIndex);

    if (!deleting && charIndex < phrase.length) {
      charIndex += 1;
    } else if (deleting && charIndex > 0) {
      charIndex -= 1;
    } else if (!deleting) {
      deleting = true;
      setTimeout(tick, 1100);
      return;
    } else {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    setTimeout(tick, deleting ? 38 : 70);
  }

  tick();
}

function animateCount(el) {
  if (el.dataset.done) return;
  el.dataset.done = "true";
  const target = Number(el.dataset.count);
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 34));

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = `${current}+`;
  }, 32);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      if (entry.target.matches("[data-count]")) animateCount(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealEls.forEach((el) => observer.observe(el));
statEls.forEach((el) => observer.observe(el));

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));

    projects.forEach((project) => {
      const shouldShow = filter === "all" || project.dataset.kind === filter;
      project.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

quickCommands.forEach((button) => {
  button.addEventListener("click", () => {
    quickCommands.forEach((item) => item.classList.toggle("active", item === button));
    quickOutput.textContent = commandReplies[button.dataset.command];
  });
});

magneticEls.forEach((el) => {
  el.addEventListener("mousemove", (event) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "translate(0, 0)";
  });
});

themeToggle.addEventListener("click", () => {
  setTheme(activeTheme === "dark" ? "light" : "dark");
});

setTheme(activeTheme);
resizeCanvas();
drawAmbient();
typeLoop();
window.addEventListener("resize", resizeCanvas);
