import { initRevealAnimations, initContributionGrid } from "./animations.js";

const WHATSAPP_PHONE_NUMBER =
  window.PORTFOLIO_WHATSAPP_NUMBER || "7618639841";

const projects = [
  {
    title: "Bushra School",
    category: "fullstack",
    type: "Full stack",
    description:
      "A calm, real-time learning workspace that makes complex knowledge feel simple.",
    tech: ["HTML", "CSS", "JS", "Node.js", "MongoDB"],
    image: "image-one",
    github: "https://github.com",
    live: "https://demo-avhj.vercel.app/",
  },
  {
    title: "Elysian Glow",
    category: "fullstack",
    type: "Full stack",
    description:
      "A calm, real-time beauty workspace that makes salon stress feel like pure relaxation.",
    tech: ["Node.js", "MongoDB", "Maps"],
    image: "image-four",
    github: "https://github.com",
    live: "https://thelooksfamilysalon.vercel.app",
  },
{
    title: "Star-Catcher-Game",
    category: "Frontend",
    type: "Frontend",
    description:
      "A gameplay arena for high-speed reflexes, cosmic collection, and precision scores.",
    tech: ["Hypertext Markup Language", "Cascading Style Sheets", "JavaScript"],
    image: "image-six",
    github: "https://github.com",
    live: "https://star-catcher-iota.vercel.app/",
  },

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];

function renderProjects(filter = "all") {
  const list =
    filter === "all"
      ? projects
      : projects.filter((project) => project.category === filter);
  $("#projects-grid").innerHTML = list
    .map(
      (project, index) =>
        `<article class="project-card" data-project="${projects.indexOf(project)}" style="animation-delay:${index * 70}ms"><div class="project-image ${project.image}"><span class="project-number">0${projects.indexOf(project) + 1} / ${project.type}</span></div><div class="project-info"><h3>${project.title}</h3><p>${project.description}</p><div class="tags">${project.tech.map((tech) => `<span class="tag">${tech}</span>`).join("")}</div></div></article>`,
    )
    .join("");
  $$(".project-card").forEach((card) =>
    card.addEventListener("click", () =>
      openProject(Number(card.dataset.project)),
    ),
  );
}

function openProject(index) {
  const project = projects[index];
  $("#modal-content").innerHTML =
    `<span class="modal-kicker">${project.type} / 2025</span><h2>${project.title}</h2><p>${project.description} This sample case study is ready for your own project details, outcomes, and story.</p><div class="tags">${project.tech.map((tech) => `<span class="tag">${tech}</span>`).join("")}</div><div class="modal-links"><a class="button button-primary" href="${project.live}" target="_blank" rel="noreferrer">Live demo ↗</a><a class="button button-ghost" href="${project.github}" target="_blank" rel="noreferrer">GitHub ↗</a></div>`;
  $("#project-modal").showModal();
}

function initNavigation() {
  const menu = $(".menu-toggle");
  const links = $(".nav-links");
  menu.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
  });
  $$(".nav-link").forEach((link) =>
    link.addEventListener("click", () => links.classList.remove("open")),
  );
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-link");
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting)
          navLinks.forEach((link) =>
            link.classList.toggle(
              "active",
              link.hash === `#${entry.target.id}`,
            ),
          );
      }),
    { rootMargin: "-35% 0px -55% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}

function initTheme() {
  const button = $(".theme-toggle");
  const saved = localStorage.getItem("portfolio-theme");
  if (saved === "light") document.body.classList.add("light");
  const update = () => {
    const light = document.body.classList.toggle("light");
    localStorage.setItem("portfolio-theme", light ? "light" : "dark");
    button.setAttribute(
      "aria-label",
      `Switch to ${light ? "dark" : "light"} theme`,
    );
    $(".theme-icon", button).textContent = light ? "☾" : "☼";
  };
  button.addEventListener("click", update);
  $(".theme-icon", button).textContent = document.body.classList.contains(
    "light",
  )
    ? "☾"
    : "☼";
}

function initContactForm() {
  const form = $("#contact-form");
  const status = $(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    $$(".field-error", form).forEach((error) => {
      error.textContent = "";
    });

    const data = Object.fromEntries(new FormData(form));
    let valid = true;

    $$("input, textarea", form).forEach((field) => {
      if (!field.checkValidity()) {
        valid = false;
        field.nextElementSibling.textContent = field.validationMessage;
      }
    });

    if (!valid) {
      status.textContent = "Please check the highlighted fields.";
      status.className = "form-status error";
      return;
    }

    const button = $(".submit-button");
    button.disabled = true;
    button.innerHTML = "Opening WhatsApp <span>…</span>";
    status.textContent = "";

    const messageTemplate = [
      "Hello, I’d like to connect.",
      `Name: ${String(data.name || "").trim()}`,
      `Email: ${String(data.email || "").trim()}`,
      `Subject: ${String(data.subject || "").trim()}`,
      "",
      "Message:",
      String(data.message || "").trim(),
    ].join("\n");

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(messageTemplate)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    form.reset();
    status.textContent = "Opening WhatsApp with your message.";
    status.className = "form-status";
    button.disabled = false;
    button.innerHTML = "Send message <span>↗</span>";
  });
}

renderProjects();
initNavigation();
initTheme();
initContactForm();
initRevealAnimations();
initContributionGrid();
$("#year").textContent = new Date().getFullYear();
$("#project-modal").addEventListener("click", (event) => {
  if (event.target === $("#project-modal")) $("#project-modal").close();
});
$(".modal-close").addEventListener("click", () => $("#project-modal").close());
