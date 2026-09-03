/* ═══════════════════════════════════════════════════════════════
   ARUN KARTHICK P — Portfolio JavaScript
   Modules: Starfield · Typewriter · ScrollReveal · Navbar · StarMap
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. STARFIELD CANVAS
  ───────────────────────────────────────────── */
  (function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, stars = [], animId;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createStars(count) {
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x:     Math.random() * W,
          y:     Math.random() * H,
          r:     Math.random() * 1.4 + 0.3,
          alpha: Math.random() * 0.6 + 0.15,
          speed: Math.random() * 0.015 + 0.005,
          phase: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.06
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);

      stars.forEach(s => {
        // Gentle twinkle
        const twinkle = prefersReducedMotion ? s.alpha : s.alpha * (0.7 + 0.3 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${twinkle})`;
        ctx.fill();

        // Very slow drift
        if (!prefersReducedMotion) {
          s.x += s.drift * 0.05;
          if (s.x < -2) s.x = W + 2;
          if (s.x > W + 2) s.x = -2;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      const count = Math.floor((W * H) / 9000);
      createStars(Math.min(count, 220));
      cancelAnimationFrame(animId);
      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(draw);
      } else {
        draw(0);
      }
    }

    window.addEventListener('resize', debounce(init, 300));
    init();
  })();


  /* ─────────────────────────────────────────────
     2. ROLE TYPEWRITER
  ───────────────────────────────────────────── */
  (function initTypewriter() {
    const el = document.getElementById('hero-role');
    if (!el) return;

    const roles = ['Developer', 'Data Analyst', 'Data Engineer'];
    let roleIdx = 0, charIdx = 0, deleting = false, paused = false;

    // Timings (ms)
    const TYPE_SPEED   = 85;
    const DELETE_SPEED = 45;
    const PAUSE_AFTER  = 2200;
    const PAUSE_BEFORE = 350;

    function tick() {
      const role = roles[roleIdx];

      if (prefersReducedMotion) {
        el.textContent = roles[0];
        return;
      }

      if (paused) return;

      if (!deleting) {
        el.textContent = role.slice(0, charIdx + 1);
        charIdx++;
        if (charIdx === role.length) {
          paused = true;
          setTimeout(() => { paused = false; deleting = true; tick(); }, PAUSE_AFTER);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        el.textContent = role.slice(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          roleIdx  = (roleIdx + 1) % roles.length;
          paused = true;
          setTimeout(() => { paused = false; tick(); }, PAUSE_BEFORE);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }

    setTimeout(tick, 800);
  })();


  /* ─────────────────────────────────────────────
     3. SCROLL REVEAL (IntersectionObserver)
  ───────────────────────────────────────────── */
  (function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (prefersReducedMotion) {
      reveals.forEach(el => el.classList.add('in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(el => observer.observe(el));
  })();


  /* ─────────────────────────────────────────────
     4. NAVBAR — Scroll state + Active Link + Hamburger
  ───────────────────────────────────────────── */
  (function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const navLinks  = document.querySelectorAll('.nav-link:not(.nav-cta), .mobile-link');

    // Scroll state
    function onScroll() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      updateActiveLink();
    }

    // Active link tracking
    function updateActiveLink() {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
          current = sec.id;
        }
      });

      document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.remove('active-link');
        if (a.getAttribute('href') === '#' + current) {
          a.classList.add('active-link');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger toggle
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileNav.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          mobileNav.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });
    }
  })();


  /* ─────────────────────────────────────────────
     5. STAR MAP — Project Data & Interactions
  ───────────────────────────────────────────── */
  (function initStarMap() {
    /* ── Project Data ── */
    const PROJECTS = {
      synapse: {
        title:   'SYNAPSE — Synthetic Data Intelligence Platform',
        roles:   ['developer', 'engineer'],
        desc:    'End-to-end synthetic data pipeline generating 50,000+ records across e-commerce, IoT, and fintech domains. Hybrid CTGAN + statistical engine with a comprehensive ML validation framework and interactive analytics dashboard.',
        tech:    ['Python', 'Pandas', 'NumPy', 'DuckDB', 'Scikit-learn', 'Plotly', 'Streamlit', 'CTGAN'],
        links:   [
          { label: 'Live Demo', url: 'https://synapse-ai-data-platform.streamlit.app/', type: 'primary' },
          { label: 'GitHub',    url: '#',                                               type: 'secondary' }
        ]
      },
      behavioural: {
        title:   'Behavioural Analytics Web Application',
        roles:   ['analyst', 'developer'],
        desc:    'Analysed 5,000+ simulated user interaction records to evaluate digital consumption patterns and anomalous usage signals. Built an interactive Streamlit app for EDA and behavioural risk scoring.',
        tech:    ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Streamlit'],
        links:   [
          { label: 'Live Demo', url: 'https://digital-wellbeing-ai-dashboard.streamlit.app/', type: 'primary' },
          { label: 'GitHub',    url: '#',                                                     type: 'secondary' }
        ]
      },
      freelancer: {
        title:   'Freelancer Platform Funnel Analysis',
        roles:   ['analyst', 'engineer'],
        desc:    'Lifecycle-based conversion analysis on 35,000+ platform interaction events using SQL to identify retention bottlenecks, cohort drop-offs, and data-informed optimisation opportunities.',
        tech:    ['SQL', 'PostgreSQL', 'Funnel Analytics', 'Relational Data Analysis'],
        links:   [
          { label: 'View on GitHub', url: '#', type: 'secondary' }
        ]
      },
      powerbi: {
        title:   'Online Retail Power BI Dashboard',
        roles:   ['analyst'],
        desc:    'Interactive dashboard analysing retail sales performance and customer trends. Visualised KPIs including revenue, order volume, and regional sales distribution with optimised data models.',
        tech:    ['Power BI', 'Data Modeling', 'Business Intelligence', 'DAX'],
        links:   [
          { label: 'View on GitHub', url: 'https://github.com/arunp061106/Online-Retail-PowerBI-dashboard', type: 'primary' }
        ]
      },
      flight: {
        title:   'Flight Delay Analysis',
        roles:   ['analyst', 'developer'],
        desc:    'EDA-driven study of airline delay patterns across operational and seasonal dimensions. Uncovered root causes and presented visual insights highlighting scheduling improvement opportunities.',
        tech:    ['Python', 'Pandas', 'EDA', 'Matplotlib', 'Seaborn'],
        links:   [
          { label: 'View on GitHub', url: 'https://github.com/arunp061106/flight-delay-analysis', type: 'primary' }
        ]
      },
      internship: {
        title:   'Smart Internship Analyzer',
        roles:   ['developer', 'analyst'],
        desc:    'Resume analysis system that evaluates compatibility between résumés and job descriptions using structured keyword comparison. Generates skill gap reports and résumé alignment scores.',
        tech:    ['Python', 'Text Processing', 'NLP', 'Data Analysis'],
        links:   [
          { label: 'Academic Project', url: null, type: 'disabled' }
        ]
      }
    };

    const ROLE_LABELS = {
      developer: { label: 'Developer',     cls: 'role-developer' },
      analyst:   { label: 'Data Analyst',  cls: 'role-analyst'   },
      engineer:  { label: 'Data Engineer', cls: 'role-engineer'  }
    };

    /* ── Elements ── */
    const panel      = document.getElementById('project-panel');
    const panelClose = document.getElementById('panel-close');
    const panelTitle = document.getElementById('panel-title');
    const panelDesc  = document.getElementById('panel-desc');
    const panelRoles = document.getElementById('panel-roles');
    const panelTech  = document.getElementById('panel-tech');
    const panelLinks = document.getElementById('panel-links');
    const starNodes  = document.querySelectorAll('.star-node');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!panel) return;

    let activeNode = null;

    /* ── Render Panel ── */
    function openPanel(projectKey, node) {
      const data = PROJECTS[projectKey];
      if (!data) return;

      // Close previous active
      if (activeNode) activeNode.classList.remove('active');
      activeNode = node;
      node.classList.add('active');

      // Roles
      panelRoles.innerHTML = data.roles.map(r => {
        const info = ROLE_LABELS[r];
        return `<span class="role-tag ${info.cls}">${info.label}</span>`;
      }).join('');

      // Title & desc
      panelTitle.textContent = data.title;
      panelDesc.textContent  = data.desc;

      // Tech chips
      panelTech.innerHTML = data.tech
        .map(t => `<span class="tech-chip">${t}</span>`)
        .join('');

      // Links
      panelLinks.innerHTML = data.links.map(lnk => {
        if (lnk.type === 'disabled' || lnk.url === null) {
          return `<span class="panel-btn panel-btn-disabled">${lnk.label}</span>`;
        }
        const cls = lnk.type === 'primary' ? 'panel-btn-primary' : 'panel-btn-secondary';
        return `<a href="${lnk.url}" target="_blank" rel="noopener" class="panel-btn ${cls}">${lnk.label}</a>`;
      }).join('');

      // Show
      panel.classList.add('visible');
      panel.setAttribute('aria-hidden', 'false');
      panelClose.focus();
    }

    function closePanel() {
      panel.classList.remove('visible');
      panel.setAttribute('aria-hidden', 'true');
      if (activeNode) {
        activeNode.classList.remove('active');
        activeNode.focus();
        activeNode = null;
      }
    }

    /* ── Star Node Events ── */
    starNodes.forEach(node => {
      const key = node.dataset.project;

      // Click / tap
      node.addEventListener('click', () => openPanel(key, node));

      // Keyboard
      node.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPanel(key, node);
        }
      });
    });

    /* ── Close Panel ── */
    panelClose.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('visible')) {
        closePanel();
      }
    });

    // Click outside on desktop
    const starmap = document.getElementById('starmap');
    if (starmap) {
      starmap.addEventListener('click', e => {
        if (!e.target.closest('.star-node') && panel.classList.contains('visible')) {
          closePanel();
        }
      });
    }

    /* ── Role Filter ── */
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;

        // Active state on buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/dim stars
        starNodes.forEach(node => {
          node.removeAttribute('data-highlight');
          if (role === 'all') {
            node.classList.remove('dimmed');
          } else {
            const nodeRoles = (node.dataset.roles || '').split(',');
            const match = nodeRoles.includes(role);
            node.classList.toggle('dimmed', !match);
            if (match) node.setAttribute('data-highlight', role);
          }
        });

        // Close panel when filter changes
        if (panel.classList.contains('visible')) closePanel();
      });
    });

  })();


  /* ─────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────── */
  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

})();