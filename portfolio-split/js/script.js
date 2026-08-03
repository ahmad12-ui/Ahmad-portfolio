const nav = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => nav.classList.toggle("scrolled", window.scrollY > 30),
  { passive: true },
);

const burger = document.getElementById("burger");
const mobilePanel = document.getElementById("mobilePanel");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  mobilePanel.classList.toggle("open");
});
mobilePanel.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    mobilePanel.classList.remove("open");
  }),
);

const navLinks = document.querySelectorAll("#navLinks a");
const sections = [...navLinks]
  .map((a) => document.getElementById(a.dataset.target))
  .filter(Boolean);
const navObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((a) =>
          a.classList.toggle("active", a.dataset.target === entry.target.id),
        );
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" },
);
sections.forEach((s) => navObs.observe(s));

const revealEls = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealEls.forEach((el) => revealObs.observe(el));

const form = document.getElementById("contactForm");
const success = document.getElementById("formSuccess");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const serviceID = "service_furpwpm";
  const templateID = "template_bivw3rj";

  // sendForm grabs all input fields inside 'this' (the form element)
  emailjs.sendForm(serviceID, templateID, form).then(
    () => {
      console.log(form);
      success.classList.add("show");
    },
    (error) => {
      alert("Failed to send email. Error: " + JSON.stringify(error));
      console.log(error);
    },
  );

  setTimeout(() => form.reset(), 400);
});
