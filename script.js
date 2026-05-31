const emailJsConfig = {
  // Add your EmailJS Public Key from:
  // EmailJS Dashboard -> Account -> General
  publicKey: "fHzCcpUj6yXfeioB9",

  // Add your EmailJS Service ID from:
  // EmailJS Dashboard -> Email Services
  serviceId: "service_k3prphr",

  // Add your EmailJS Template ID from:
  // EmailJS Dashboard -> Email Templates
  templateId: "template_g6p918l"
};

const THEME_STORAGE_KEY = "ayush-portfolio-theme";
const FEEDBACK_STORAGE_KEY = "ayush-portfolio-feedback";
const WHATSAPP_NUMBER = "918953866016";

let emailJsInitialized = false;

const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav .nav-link");
const sectionLinks = document.querySelectorAll(".site-nav .nav-link[href^='#']");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("year");
const themeToggle = document.getElementById("theme-toggle");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const blogFilterButtons = document.querySelectorAll("[data-blog-filter]");
const blogCards = document.querySelectorAll("[data-blog-card]");
const blogSearchInput = document.querySelector("[data-blog-search]");
const blogEmptyState = document.querySelector("[data-blog-empty]");
const blogExpandButtons = document.querySelectorAll("[data-blog-expand]");
const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");
const feedbackList = document.getElementById("feedback-list");
const whatsappPlanLinks = document.querySelectorAll("[data-whatsapp-plan]");

function getStoredItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read localStorage key "${key}".`, error);
    return null;
  }
}

function setStoredItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Unable to write localStorage key "${key}".`, error);
  }
}

function isEmailJsConfigured() {
  return ![
    emailJsConfig.publicKey,
    emailJsConfig.serviceId,
    emailJsConfig.templateId
  ].some((value) => value.startsWith("YOUR_"));
}

function initializeEmailJs() {
  if (emailJsInitialized) {
    return true;
  }

  if (!window.emailjs) {
    console.error("EmailJS SDK not found. Make sure the CDN script is loaded before script.js.");
    return false;
  }

  if (!isEmailJsConfigured()) {
    console.error("EmailJS config is incomplete. Add your public key, service ID, and template ID in script.js.");
    return false;
  }

  window.emailjs.init({
    publicKey: emailJsConfig.publicKey
  });

  emailJsInitialized = true;
  return true;
}

function setStatus(statusNode, message, type = "") {
  if (!statusNode) {
    return;
  }

  statusNode.textContent = message;
  statusNode.className = "form-status";

  if (type) {
    statusNode.classList.add(`is-${type}`);
  }
}

function getFieldWrapper(field) {
  return field.closest(".form-field");
}

function clearFieldError(field) {
  const wrapper = getFieldWrapper(field);
  if (!wrapper) {
    return;
  }

  wrapper.classList.remove("has-error");

  const errorNode = wrapper.querySelector(".field-error");
  if (errorNode) {
    errorNode.textContent = "";
  }
}

function showFieldError(field, message) {
  const wrapper = getFieldWrapper(field);
  if (!wrapper) {
    return;
  }

  wrapper.classList.add("has-error");

  const errorNode = wrapper.querySelector(".field-error");
  if (errorNode) {
    errorNode.textContent = message;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getFieldErrorMessage(field) {
  const value = field.value.trim();
  const type = field.dataset.field;

  if (type === "name" && !value) {
    return "Please enter your name.";
  }

  if (type === "email" && !isValidEmail(value)) {
    return "Please enter a valid email address.";
  }

  if (type === "message" && !value) {
    return "Please enter your message.";
  }

  if (type === "feedback" && !value) {
    return "Please share your feedback.";
  }

  if (type === "rating" && !value) {
    return "Please select a rating.";
  }

  return "";
}

function validateField(field) {
  const message = getFieldErrorMessage(field);

  if (message) {
    showFieldError(field, message);
    return false;
  }

  clearFieldError(field);
  return true;
}

function closeMenu() {
  if (!nav || !navToggle) {
    return;
  }

  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

function initializeMobileNav() {
  if (!nav || !navToggle) {
    return;
  }

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 820) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  setStoredItem(THEME_STORAGE_KEY, theme);

  if (!themeToggle) {
    return;
  }

  const icon = themeToggle.querySelector("i");
  const label = themeToggle.querySelector("[data-theme-label]");
  const nextTheme = theme === "dark" ? "light" : "dark";

  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);

  if (icon) {
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  if (label) {
    label.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function initializeThemeToggle() {
  const savedTheme = getStoredItem(THEME_STORAGE_KEY);
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";

  applyTheme(initialTheme);

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function initializeRevealAnimations() {
  if (!revealItems.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initializeActiveNav() {
  if (!sections.length || !sectionLinks.length) {
    return;
  }

  const linkMap = new Map(
    Array.from(sectionLinks).map((link) => [link.getAttribute("href"), link])
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      const activeLink = linkMap.get(`#${visibleEntry.target.id}`);
      if (!activeLink) {
        return;
      }

      sectionLinks.forEach((link) => {
        link.classList.remove("is-active");
      });

      activeLink.classList.add("is-active");
    },
    {
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0.2, 0.4, 0.6]
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function applyBlogFilters() {
  if (!blogCards.length) {
    return;
  }

  const activeButton = Array.from(blogFilterButtons).find((button) => button.classList.contains("is-active"));
  const activeFilter = activeButton ? activeButton.dataset.blogFilter : "all";
  const searchTerm = blogSearchInput ? blogSearchInput.value.trim().toLowerCase() : "";
  let visibleCount = 0;

  blogCards.forEach((card) => {
    const category = card.dataset.blogCategory || "";
    const searchableText = card.textContent.toLowerCase();
    const matchesCategory = activeFilter === "all" || category === activeFilter;
    const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
    const shouldShow = matchesCategory && matchesSearch;

    card.classList.toggle("is-hidden", !shouldShow);

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  if (blogEmptyState) {
    blogEmptyState.hidden = visibleCount !== 0;
  }
}

function initializeBlogFilters() {
  if (!blogFilterButtons.length && !blogSearchInput) {
    return;
  }

  blogFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      blogFilterButtons.forEach((currentButton) => currentButton.classList.remove("is-active"));
      button.classList.add("is-active");
      applyBlogFilters();
    });
  });

  if (blogSearchInput) {
    blogSearchInput.addEventListener("input", applyBlogFilters);
  }

  applyBlogFilters();
}

function initializeBlogExpansion() {
  if (!blogExpandButtons.length) {
    return;
  }

  blogExpandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-blog-card]");
      if (!card) {
        return;
      }

      const isExpanded = card.classList.toggle("is-expanded");
      button.textContent = isExpanded ? "Read Less" : "Read More";
    });
  });
}

async function handleContactSubmit(event) {
  event.preventDefault();

  if (!contactForm) {
    return;
  }

  const fields = Array.from(contactForm.querySelectorAll("[data-field]"));
  const isValid = fields.every((field) => validateField(field));

  if (!isValid) {
    setStatus(contactStatus, "Please check the highlighted fields.", "error");
    return;
  }

  if (!initializeEmailJs()) {
    setStatus(
      contactStatus,
      "EmailJS is not configured yet. Add your public key, service ID, and template ID in script.js.",
      "error"
    );
    return;
  }

  const submitButton = contactForm.querySelector("button[type='submit']");

  try {
    contactForm.classList.add("is-submitting");
    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus(contactStatus, "Sending message...", "pending");

    // This sends all form fields directly to the EmailJS template:
    // user_name, user_email, message, to_email
    await window.emailjs.sendForm(
      emailJsConfig.serviceId,
      emailJsConfig.templateId,
      contactForm
    );

    contactForm.reset();
    fields.forEach((field) => clearFieldError(field));
    setStatus(contactStatus, "Message sent successfully.", "success");
  } catch (error) {
    console.error("EmailJS sendForm failed:", error);
    setStatus(contactStatus, "Message failed to send. Please try again.", "error");
  } finally {
    contactForm.classList.remove("is-submitting");
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

function initializeContactForm() {
  if (!contactForm) {
    return;
  }

  const fields = Array.from(contactForm.querySelectorAll("[data-field]"));

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field);
      setStatus(contactStatus, "", "");
    });

    field.addEventListener("blur", () => {
      validateField(field);
    });
  });

  contactForm.addEventListener("submit", handleContactSubmit);
}

function getStarRating(rating) {
  const parsedRating = Number(rating);
  const safeRating = Number.isFinite(parsedRating) ? Math.max(1, Math.min(5, parsedRating)) : 5;
  return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function createFeedbackCard(entry) {
  const card = document.createElement("article");
  card.className = "testimonial-card";

  const chip = document.createElement("span");
  chip.className = "feedback-chip";
  chip.textContent = "New Feedback";

  const head = document.createElement("div");
  head.className = "testimonial-head";

  const name = document.createElement("strong");
  name.textContent = entry.name;

  const rating = document.createElement("span");
  rating.className = "testimonial-rating";
  rating.textContent = getStarRating(entry.rating);

  const message = document.createElement("p");
  message.textContent = entry.message;

  head.append(name, rating);
  card.append(chip, head, message);
  return card;
}

function readStoredFeedback() {
  const rawValue = getStoredItem(FEEDBACK_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Saved feedback data was invalid JSON.", error);
    return [];
  }
}

function saveStoredFeedback(entries) {
  setStoredItem(FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
}

function renderStoredFeedback() {
  if (!feedbackList) {
    return;
  }

  const savedEntries = readStoredFeedback();

  savedEntries.forEach((entry) => {
    feedbackList.prepend(createFeedbackCard(entry));
  });
}

function initializeFeedbackForm() {
  if (!feedbackForm || !feedbackList) {
    return;
  }

  renderStoredFeedback();

  const fields = Array.from(feedbackForm.querySelectorAll("[data-field]"));

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field);
      setStatus(feedbackStatus, "", "");
    });

    field.addEventListener("change", () => {
      clearFieldError(field);
    });

    field.addEventListener("blur", () => {
      validateField(field);
    });
  });

  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = fields.every((field) => validateField(field));

    if (!isValid) {
      setStatus(feedbackStatus, "Please complete all feedback fields.", "error");
      return;
    }

    const entry = {
      name: feedbackForm.elements.feedback_name.value.trim(),
      rating: feedbackForm.elements.feedback_rating.value.trim(),
      message: feedbackForm.elements.feedback_message.value.trim()
    };

    const savedEntries = readStoredFeedback();
    const updatedEntries = [entry, ...savedEntries].slice(0, 6);

    saveStoredFeedback(updatedEntries);
    feedbackList.prepend(createFeedbackCard(entry));
    feedbackForm.reset();
    fields.forEach((field) => clearFieldError(field));
    setStatus(feedbackStatus, "Feedback added successfully.", "success");
  });
}

function initializeWhatsAppPlanLinks() {
  if (!whatsappPlanLinks.length) {
    return;
  }

  whatsappPlanLinks.forEach((link) => {
    const planName = link.dataset.whatsappPlan || "Data Analysis Plan";
    const message = `Hello, I want to discuss the ${planName} for a data analysis project.`;
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  });
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

initializeThemeToggle();
initializeMobileNav();
initializeRevealAnimations();
initializeActiveNav();
initializeBlogFilters();
initializeBlogExpansion();
initializeContactForm();
initializeFeedbackForm();
initializeWhatsAppPlanLinks();
