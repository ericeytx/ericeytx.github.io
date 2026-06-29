// ===== Portfolio Site - Main Script =====

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initSmoothScroll();
  initRevealAnimations();
  initContactForm();
  loadPortfolioData();
});

// ===== Scroll Progress Bar =====
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// ===== Navigation =====
function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  // Scroll shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Keep the toggle button's ARIA state in sync with the menu's visibility
  const setNavState = (open) => {
    links.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };

  // Mobile toggle
  toggle.addEventListener('click', () => {
    setNavState(!links.classList.contains('open'));
  });

  // Close mobile nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => setNavState(false));
  });

  // Close the mobile menu with Escape and return focus to the toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      setNavState(false);
      toggle.focus();
    }
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      // Only handle in-page hash links (e.g. "#about"); ignore "#" placeholders
      // and links whose href is later changed to a full URL (e.g. LinkedIn).
      if (!href || !href.startsWith('#') || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        gsap.to(window, {
          duration: 1,
          scrollTo: { y: target, offsetY: 64 },
          ease: 'power2.inOut'
        });
      }
    });
  });
}

// ===== Reveal Animations =====
function initRevealAnimations() {
  // Respect users who prefer reduced motion: skip the entrance animations
  // entirely so GSAP never leaves elements stuck at opacity:0.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const reveals = document.querySelectorAll('.reveal');

  reveals.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        delay: el.classList.contains('hero-content') ? 0 : 0
      }
    );
  });

  // Hero stagger
  const heroItems = document.querySelectorAll('.hero-content .reveal');
  heroItems.forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.2 + i * 0.12
      }
    );
  });

  // Highlight counter animation
  const counterEl = document.querySelector('[data-count]');
  if (counterEl) {
    const target = parseInt(counterEl.dataset.count);
    gsap.to(counterEl, {
      innerText: target,
      duration: 1.5,
      delay: 1,
      ease: 'power1.out',
      snap: { innerText: 1 },
      onUpdate: function () {
        counterEl.textContent = Math.round(parseFloat(counterEl.textContent)) + '+';
      }
    });
  }

  // Dynamically-rendered cards (skills, experience, education) are animated
  // separately in initDynamicAnimations(), called once their content exists.
}

// ===== Animate dynamically-rendered content =====
// Content is fetched after the initial ScrollTrigger setup, so re-create the
// batches for the dynamic elements and refresh ScrollTrigger once rendered.
function initDynamicAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Under reduced-motion, leave dynamically-rendered content fully visible.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const batches = [
    { selector: '.skill-category', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' } },
    { selector: '.company-block', from: { opacity: 0, y: 36 }, to: { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out' } },
    { selector: '.portfolio-card', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' } },
    { selector: '.edu-item, .training-list li', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' } }
  ];

  batches.forEach(({ selector, from, to }) => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.set(els, from);
    ScrollTrigger.batch(selector, {
      onEnter: (elements) => gsap.to(elements, to),
      start: 'top 88%'
    });
  });

  ScrollTrigger.refresh();
}

// ===== Load & Render Portfolio Data =====
async function loadPortfolioData() {
  try {
    const response = await fetch('artifacts/portfolio.json');
    if (!response.ok) throw new Error('Failed to load portfolio data');
    const data = await response.json();

    renderHero(data);
    renderAbout(data);
    renderSkills(data);
    renderExperience(data);
    renderPortfolio(data);
    renderEducation(data);
    renderContact(data);
    setYear();
    initDynamicAnimations();
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    // Show fallback content if JSON fails to load
    document.getElementById('about-summary').textContent = 'Content could not be loaded. Please ensure portfolio.json is accessible.';
  }
}

function renderHero(data) {
  const taglineEl = document.getElementById('hero-tagline');
  if (taglineEl) {
    taglineEl.textContent = data.person.heroTagline || data.person.tagline || '';
  }
}

function renderAbout(data) {
  document.getElementById('about-summary').textContent = data.person.summary;
  document.getElementById('about-location').textContent = data.person.location;
}

function renderSkills(data) {
  const grid = document.getElementById('skills-grid');
  grid.innerHTML = '';

  data.skills.forEach(category => {
    const card = document.createElement('div');
    card.className = 'skill-category';
    card.innerHTML = `
      <h3>${category.category}</h3>
      <div class="skill-items">
        ${category.items.map(item => `<span class="skill-tag">${item}</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderExperience(data) {
  const timeline = document.getElementById('experience-timeline');
  timeline.innerHTML = '';

  data.experience.forEach(company => {
    if (company.enabled === false) return;

    const companyBlock = document.createElement('div');
    companyBlock.className = 'company-block';

    // Company header
    companyBlock.innerHTML = `
      <div class="company-header">
        <div class="company-identity">
          <div class="company-name">${company.company}</div>
          <div class="company-location">${company.location}</div>
        </div>
        <div class="company-period">${company.period}</div>
      </div>
    `;

    // Roles container
    const rolesContainer = document.createElement('div');
    rolesContainer.className = 'company-roles';

    company.roles.forEach(role => {
      const roleEntry = document.createElement('div');
      roleEntry.className = 'role-entry';

      const projectsHtml = role.projects && role.projects.length > 0
        ? `<div class="projects-list">
             ${role.projects.map(project => `
               <div class="project-card">
                 <div class="project-name">${project.name}</div>
                 <div class="project-desc">${project.description}</div>
                 ${project.tech ? `<div class="project-tech">${project.tech.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
               </div>
             `).join('')}
           </div>`
        : '';

      const achievementsHtml = role.achievements && role.achievements.length > 0
        ? `<ul class="timeline-achievements">
             ${role.achievements.map(a => `<li>${a}</li>`).join('')}
           </ul>`
        : '';

      const currentBadge = role.current ? `<span class="role-current-badge">Current</span>` : '';

      roleEntry.innerHTML = `
        <div class="role-header">
          <div class="role-title">${role.role}${currentBadge}</div>
          <div class="role-period">${role.period}</div>
        </div>
        ${achievementsHtml}
        ${projectsHtml}
      `;

      rolesContainer.appendChild(roleEntry);
    });

    companyBlock.appendChild(rolesContainer);
    timeline.appendChild(companyBlock);
  });
}

function renderPortfolio(data) {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!data.portfolio || data.portfolio.length === 0) {
    grid.closest('section').style.display = 'none';
    return;
  }

  data.portfolio.forEach(item => {
    if (item.enabled === false) return;

    const card = document.createElement(item.url ? 'a' : 'div');
    card.className = 'portfolio-card';
    if (item.url) {
      card.href = item.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const techHtml = item.tech && item.tech.length > 0
      ? `<div class="portfolio-tech">${item.tech.map(t => `<span>${t}</span>`).join('')}</div>`
      : '';

    const linkHint = item.url
      ? `<span class="portfolio-link">View project
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>
         </span>`
      : '';

    card.innerHTML = `
      <div class="portfolio-body">
        <h3 class="portfolio-title">${item.title}</h3>
        <p class="portfolio-desc">${item.description}</p>
      </div>
      <div class="portfolio-footer">
        ${techHtml}
        ${linkHint}
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderEducation(data) {
  const container = document.getElementById('education-content');
  container.innerHTML = '';

  // Education column
  if (data.education && data.education.length > 0) {
    const eduGroup = document.createElement('div');
    eduGroup.className = 'edu-group';
    eduGroup.innerHTML = `<h3>Education</h3>`;
    data.education.forEach(edu => {
      eduGroup.innerHTML += `
        <div class="edu-item">
          <div class="edu-institution">${edu.institution}</div>
          <div class="edu-credential">${edu.credential}</div>
          <div class="edu-period">${edu.period}</div>
        </div>
      `;
    });
    container.appendChild(eduGroup);
  }

  // Training column
  if (data.training && data.training.length > 0) {
    const trainGroup = document.createElement('div');
    trainGroup.className = 'edu-group';
    trainGroup.innerHTML = `<h3>Training &amp; Certifications</h3>`;
    trainGroup.innerHTML += `<ul class="training-list">
      ${data.training.map(t => `<li>${t}</li>`).join('')}
    </ul>`;
    container.appendChild(trainGroup);
  }
}

function renderContact(data) {
  if (data.person.linkedin) {
    const link = document.getElementById('linkedin-link');
    if (link) link.href = data.person.linkedin;
    const navLink = document.getElementById('nav-linkedin');
    if (navLink) navLink.href = data.person.linkedin;
  }
}

// ===== Contact Form (Web3Forms AJAX submit) =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-status');
  const submitBtn = form.querySelector('.contact-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Require hCaptcha to be solved before submitting (Web3Forms spam protection)
    const captchaField = form.querySelector('textarea[name="h-captcha-response"]');
    if (captchaField && !captchaField.value) {
      if (status) {
        status.classList.add('error');
        status.textContent = 'Please complete the captcha before submitting.';
      }
      return;
    }

    if (status) {
      status.classList.remove('error');
      status.textContent = 'Sending…';
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        if (status) {
          status.classList.remove('error');
          status.textContent = 'Thanks! Your message has been sent.';
        }
      } else {
        if (status) {
          status.classList.add('error');
          status.textContent = result.message || 'Something went wrong. Please try again.';
        }
      }
    } catch (err) {
      if (status) {
        status.classList.add('error');
        status.textContent = 'Network error. Please try again later.';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}
