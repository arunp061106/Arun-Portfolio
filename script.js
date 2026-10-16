(function () {
  'use strict';
  // Animations active by default so typewriter, cursor, and scroll reveals run smoothly
  const noMotion = false;

  /* ── 1. CUSTOM CURSOR ── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

    document.querySelectorAll('a,button,[tabindex],.star-node,.cert-card,.contact-card,.glass,.btn-primary,.btn-ghost,.soc-btn').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    let rafCursor;
    function moveCursor() {
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      rafCursor = requestAnimationFrame(moveCursor);
    }
    moveCursor();
  }

  /* ── 2. IMMERSIVE SPACE WARP STARFIELD ── */
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, cx = 0, cy = 0, stars = [], raf;
    const CRUISE_SPEED = 0.8;
    const MAX_SPEED = 8.5;
    let speed = CRUISE_SPEED;
    let targetSpeed = CRUISE_SPEED;
    let lastY = window.scrollY;
    let scrollTimer = null;

    const PALETTE = [
      'rgba(255, 255, 255,',   // Pure White
      'rgba(56, 189, 248,',    // Vibrant Cyan
      'rgba(168, 85, 247,',    // Cosmic Violet
      'rgba(192, 132, 252,',   // Radiant Lilac
      'rgba(147, 197, 253,'    // Soft Ice Blue
    ];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W * 0.5;
      cy = H * 0.5;
    }

    function resetStar(s, randomZ) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.pow(Math.random(), 1.3) * (Math.max(W, H) * 0.95) + 16;
      s.x = Math.cos(angle) * dist;
      s.y = Math.sin(angle) * dist;
      s.z = randomZ ? Math.random() * 1000 + 1 : 1000;
      s.pz = s.z;
      s.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      s.size = Math.random() * 1.5 + 0.8;
      s.twinkle = Math.random() * Math.PI * 2;
    }

    function makeStars() {
      const n = Math.min(Math.floor((W * H) / 3800), 380);
      stars = [];
      for (let i = 0; i < n; i++) {
        const s = {};
        resetStar(s, true);
        stars.push(s);
      }
    }

    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      const delta = Math.abs(sy - lastY);
      lastY = sy;
      targetSpeed = Math.min(CRUISE_SPEED + delta * 0.22, MAX_SPEED);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        targetSpeed = CRUISE_SPEED;
      }, 180);
    }, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      speed += (targetSpeed - speed) * 0.12;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          resetStar(s, false);
          continue;
        }

        const k = 270 / s.z;
        const sx = cx + s.x * k;
        const sy = cy + s.y * k;

        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) {
          resetStar(s, false);
          continue;
        }

        const alpha = Math.min(0.88, (1 - s.z / 1000) * 1.05);

        // Hyperdrive / warp streaks when scrolling fast
        if (speed > 1.3) {
          const pk = 270 / Math.max(s.pz, 1);
          const px = cx + s.x * pk;
          const py = cy + s.y * pk;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.lineWidth = Math.min(s.size * 1.2, 2.8);
          ctx.strokeStyle = `${s.color} ${alpha})`;
          ctx.stroke();
        } else {
          // Subtle twinkle when cruising
          s.twinkle += 0.05;
          const r = s.size * (1 + 0.15 * Math.sin(s.twinkle));
          ctx.fillStyle = `${s.color} ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      makeStars();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    let rTimer;
    window.addEventListener('resize', () => {
      clearTimeout(rTimer);
      rTimer = setTimeout(init, 200);
    });

    init();
  }

  /* ── 3. STATIC IMAGES & STABLE LAYOUT (NO SCROLL PARALLAX JITTER) ── */
  // All images and elements stay firmly stationary without any scroll jitter

  /* ── 4. DYNAMIC HERO ROLE CYCLER & TYPEWRITER ── */
  const roleEl = document.getElementById('typed-role');
  const roleLine = document.querySelector('.hero-role-line');
  if (roleEl) {
    const roles = [
      { text: 'Data Analyst', color: '#C084FC', glow: 'rgba(192, 132, 252, 0.65)' },
      { text: 'Data Engineer', color: '#34D399', glow: 'rgba(52, 211, 153, 0.65)' },
      { text: 'Developer', color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.65)' }
    ];
    let ri = 0;
    let ci = roles[0].text.length;
    let del = false;
    let timerId = null;

    function applyRoleStyle(index) {
      const item = roles[index % roles.length];
      roleEl.style.color = item.color;
      roleEl.style.textShadow = `0 0 18px ${item.glow}`;
    }

    // Immediately display full initial text on load (NEVER blank!)
    roleEl.textContent = roles[0].text;
    applyRoleStyle(0);

    function tick() {
      const currentRole = roles[ri];
      applyRoleStyle(ri);

      if (!del) {
        ci++;
        roleEl.textContent = currentRole.text.slice(0, ci);
        if (ci >= currentRole.text.length) {
          del = true;
          timerId = setTimeout(tick, 2400);
          return;
        }
        timerId = setTimeout(tick, 75);
      } else {
        ci--;
        roleEl.textContent = currentRole.text.slice(0, Math.max(ci, 0));
        if (ci <= 0) {
          del = false;
          ri = (ri + 1) % roles.length;
          applyRoleStyle(ri);
          timerId = setTimeout(tick, 350);
          return;
        }
        timerId = setTimeout(tick, 45);
      }
    }

    timerId = setTimeout(() => {
      del = true;
      tick();
    }, 2800);

    function switchTo(idx) {
      clearTimeout(timerId);
      del = false;
      ri = idx % roles.length;
      ci = roles[ri].text.length;
      roleEl.textContent = roles[ri].text;
      applyRoleStyle(ri);
      timerId = setTimeout(() => {
        del = true;
        tick();
      }, 3000);
    }

    if (roleLine) {
      roleLine.style.cursor = 'pointer';
      roleLine.setAttribute('title', 'Click or hover to switch role');
      roleLine.addEventListener('click', () => switchTo(ri + 1));
    }

    document.querySelectorAll('.role-chip, .chip').forEach(chip => {
      chip.addEventListener('mouseenter', () => {
        const txt = chip.textContent.trim().toLowerCase();
        const found = roles.findIndex(r => r.text.toLowerCase() === txt);
        if (found !== -1) switchTo(found);
      });
    });
  }

  /* ── 5. SCROLL REVEAL ANIMATIONS ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.02, rootMargin: '60px 0px' });
    reveals.forEach(el => {
      obs.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('in-view');
      }
    });
  }

  /* ── 6. NAVBAR ── */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    let cur = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) cur = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }, { passive: true });

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      mobileNav.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mob-link').forEach(l => {
      l.addEventListener('click', () => {
        hamburger.classList.remove('open'); mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 6b. FLOATING NAVBAR RESUME DROPDOWN ── */
  const navResumeWrapper = document.getElementById('navResumeWrapper');
  const navResumeBtn = document.getElementById('navResumeBtn');
  const navResumeMenu = document.getElementById('navResumeMenu');

  if (navResumeWrapper && navResumeBtn) {
    function toggleNavResume(open) {
      const isOpen = open !== undefined ? open : !navResumeWrapper.classList.contains('open');
      navResumeWrapper.classList.toggle('open', isOpen);
      navResumeBtn.setAttribute('aria-expanded', String(isOpen));
    }

    navResumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNavResume();
    });

    document.addEventListener('click', (e) => {
      if (!navResumeWrapper.contains(e.target)) {
        toggleNavResume(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navResumeWrapper.classList.contains('open')) {
        toggleNavResume(false);
        navResumeBtn.focus();
      }
    });

    if (navResumeMenu) {
      navResumeMenu.querySelectorAll('.nav-resume-item').forEach(item => {
        item.addEventListener('click', () => {
          setTimeout(() => toggleNavResume(false), 200);
        });
        item.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
  }

  /* ── 7. STAR MAP ── */
  const PROJECTS = {
    sentimentscope: {
      title: 'Brand Pulse Monitor (SentimentScope) — DND Winning Dashboard',
      roles: ['developer', 'analyst', 'engineer'],
      desc:  'Delivered a clarity-first HTML/CSS/JS dashboard analysing 732 social media posts across Twitter, Instagram, and Facebook covering 10+ countries — winning 1st Place at DND Data Arena 24-Hour Sprint. Built with in-browser CSV parsing (PapaParse), 8 interactive Chart.js 4.4.1 visualisations, and a live Auto Story Headline feature that auto-narrates the full data story dynamically on every filter change — zero backend, zero frameworks, zero installation required.',
      tech:  ['HTML5', 'CSS3', 'Vanilla JS', 'Chart.js 4.4.1', 'PapaParse', 'GitHub Pages'],
      links: [
        { l: 'Live Interactive Demo', u: 'https://arunp061106.github.io/Sentiment-Scope/', t: 'p' },
        { l: 'GitHub Repository', u: 'https://github.com/arunp061106/Sentiment-Scope', t: 's' }
      ]
    },
    synapse: {
      title: 'SYNAPSE — Synthetic Data Intelligence Platform',
      roles: ['developer', 'engineer'],
      desc:  'End-to-end synthetic data pipeline generating 50,000+ records across e-commerce, IoT & fintech domains. Hybrid CTGAN + statistical engine with comprehensive ML validation framework and interactive analytics dashboard.',
      tech:  ['Python', 'Pandas', 'NumPy', 'DuckDB', 'Scikit-learn', 'Plotly', 'Streamlit', 'CTGAN'],
      links: [{ l: 'Live Demo', u: 'https://synapse-ai-data-platform.streamlit.app/', t: 'p' }, { l: 'GitHub', u: '#', t: 's' }]
    },
    behavioural: {
      title: 'Behavioural Analytics Web Application',
      roles: ['analyst', 'developer'],
      desc:  'Analysed 5,000+ simulated user interaction records to evaluate digital consumption patterns and anomalous usage signals. Interactive Streamlit app for EDA and behavioural risk scoring.',
      tech:  ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Streamlit'],
      links: [{ l: 'Live Demo', u: 'https://digital-wellbeing-ai-dashboard.streamlit.app/', t: 'p' }, { l: 'GitHub', u: '#', t: 's' }]
    },
    freelancer: {
      title: 'Freelancer Platform Funnel Analysis',
      roles: ['analyst', 'engineer'],
      desc:  'Lifecycle-based conversion analysis on 35,000+ platform interaction events using SQL to identify retention bottlenecks, cohort drop-offs, and data-informed optimisation opportunities.',
      tech:  ['SQL', 'PostgreSQL', 'Funnel Analytics', 'Relational Data Analysis'],
      links: [{ l: 'GitHub', u: '#', t: 's' }]
    },
    powerbi: {
      title: 'Online Retail Power BI Dashboard',
      roles: ['analyst'],
      desc:  'Interactive dashboard analysing retail sales performance and customer trends. Visualised KPIs including revenue, order volume, and regional distribution with optimised data models.',
      tech:  ['Power BI', 'Data Modeling', 'Business Intelligence', 'DAX'],
      links: [{ l: 'View on GitHub', u: 'https://github.com/arunp061106/Online-Retail-PowerBI-dashboard', t: 'p' }]
    },
    flight: {
      title: 'Flight Delay Analysis',
      roles: ['analyst', 'developer'],
      desc:  'EDA-driven study of airline delay patterns across operational and seasonal dimensions. Uncovered root causes and presented visual insights highlighting scheduling improvement opportunities.',
      tech:  ['Python', 'Pandas', 'EDA', 'Matplotlib', 'Seaborn'],
      links: [{ l: 'View on GitHub', u: 'https://github.com/arunp061106/flight-delay-analysis', t: 'p' }]
    },
    internship: {
      title: 'Smart Internship Analyzer',
      roles: ['developer', 'analyst'],
      desc:  'Resume analysis system that evaluates compatibility between résumés and job descriptions using structured keyword comparison. Generates skill gap reports and résumé alignment scores.',
      tech:  ['Python', 'Text Processing', 'NLP', 'Data Analysis'],
      links: [{ l: 'Academic Project', u: null, t: 'd' }]
    },
    dataforge: {
      title: 'DataForge — Official Technical Club Web Platform',
      roles: ['developer'],
      desc:  'Official web application engineered for DataForge, the student technical club at SRM Institute of Science and Technology. Built with responsive layout architecture, event showcases, member onboarding flows, and club resource portals.',
      tech:  ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI', 'Web Architecture'],
      links: [{ l: 'View on GitHub', u: 'https://github.com/arunp061106/DataforgewebV1', t: 'p' }]
    },
    ngo: {
      title: 'NGO Work Tracker & Reminder System',
      roles: ['developer'],
      desc:  'Modern dual-architecture management platform tailored for NGO field operations. Features daily work logging, IndexedDB offline evidence storage, automated reminder pipelines, attendance stopwatch, interactive analytics charts, and an AI-powered accomplishment summary generator.',
      tech:  ['React', 'FastAPI', 'Tailwind CSS', 'IndexedDB', 'PostgreSQL', 'Python', 'JavaScript'],
      links: [{ l: 'View on GitHub', u: 'https://github.com/arunp061106/NGO-Work-Tracker-Reminder-System', t: 'p' }]
    },
    lawfirm: {
      title: 'Sri Sai Law Firm — Digital Legal Portal',
      roles: ['developer'],
      desc:  'High-performance professional web platform developed for Sri Sai Law Firm. Includes practice area showcases, appointment scheduling workflows, client case consultation inquiry systems, and attorney profile directories.',
      tech:  ['HTML5', 'CSS3', 'JavaScript', 'UI/UX Design', 'Client Solution'],
      links: [{ l: 'View on GitHub', u: 'https://github.com/arunp061106/srisailawfirm', t: 'p' }]
    }
  };

  const ROLE_INFO = {
    developer: { label: 'Developer',     cls: 'chip chip-dev' },
    analyst:   { label: 'Data Analyst',  cls: 'chip chip-ana' },
    engineer:  { label: 'Data Engineer', cls: 'chip chip-eng' }
  };

  const panel   = document.getElementById('proj-panel');
  const panelX  = document.getElementById('panel-x');
  const pRoles  = document.getElementById('p-roles');
  const pTitle  = document.getElementById('p-title');
  const pDesc   = document.getElementById('p-desc');
  const pTech   = document.getElementById('p-tech');
  const pLinks  = document.getElementById('p-links');
  const starmap = document.getElementById('starmap');
  const nodes   = document.querySelectorAll('.star-node');
  const rfBtns  = document.querySelectorAll('.rf-btn');

  if (!panel) return;
  let activeNode = null;

  function openPanel(key, node) {
    const d = PROJECTS[key]; if (!d) return;
    if (activeNode) activeNode.classList.remove('sel');
    activeNode = node; node.classList.add('sel');
    pRoles.innerHTML = d.roles.map(r => `<span class="${ROLE_INFO[r].cls}">${ROLE_INFO[r].label}</span>`).join('');
    pTitle.textContent = d.title;
    pDesc.textContent  = d.desc;
    pTech.innerHTML  = d.tech.map(t => `<span class="tc">${t}</span>`).join('');
    pLinks.innerHTML = d.links.map(lk => {
      if (lk.t === 'd' || !lk.u) return `<span class="pl-d">${lk.l}</span>`;
      return `<a href="${lk.u}" target="_blank" rel="noopener" class="pl-${lk.t}">${lk.l}</a>`;
    }).join('');
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    panelX.focus();
  }

  function closePanel() {
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true');
    if (activeNode) { activeNode.classList.remove('sel'); activeNode.focus(); activeNode = null; }
  }

  nodes.forEach(n => {
    n.addEventListener('click', () => openPanel(n.dataset.project, n));
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(n.dataset.project, n); } });
  });
  panelX.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  if (starmap) starmap.addEventListener('click', e => { if (!e.target.closest('.star-node')) closePanel(); });

  rfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rfBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
      const role = btn.dataset.role;
      nodes.forEach(n => {
        n.removeAttribute('data-hl');
        if (role === 'all') { n.classList.remove('dimmed'); }
        else {
          const roles = (n.dataset.roles || '').split(',');
          const match = roles.includes(role);
          n.classList.toggle('dimmed', !match);
          if (match) n.setAttribute('data-hl', role);
        }
      });
      closePanel();
    });
  });

  /* ── RESUME DROPDOWN ── */
  const resumeWrapper = document.getElementById('resumeDropdownWrapper');
  const resumeBtn     = document.getElementById('resumeDropdownBtn');
  const resumeMenu    = document.getElementById('resumeDropdownMenu');

  if (resumeWrapper && resumeBtn && resumeMenu) {
    function toggleResumeMenu(open) {
      const isOpen = open !== undefined ? open : !resumeWrapper.classList.contains('open');
      resumeWrapper.classList.toggle('open', isOpen);
      resumeBtn.setAttribute('aria-expanded', String(isOpen));
    }

    resumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleResumeMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!resumeWrapper.contains(e.target)) {
        toggleResumeMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && resumeWrapper.classList.contains('open')) {
        toggleResumeMenu(false);
        resumeBtn.focus();
      }
    });

    // Close when clicking any menu item
    resumeMenu.querySelectorAll('.resume-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        setTimeout(() => toggleResumeMenu(false), 200);
      });
      item.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      item.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

    /* ── 9. PROBLEM SOLVING & CODING ACTIVITY SECTION (CLEAN & RESPONSIVE) ── */
  const activitySection = document.getElementById('activity');

  if (activitySection) {
    const RING_CIRCUMFERENCE = 2 * Math.PI * 74; // 464.96 for r=74 circle

    // Session cache
    const statsCache = {
      githubContribs: {},
      githubActivity: null,
      leetcode: null,
      hackerrank: null
    };

    let lastRenderedLcSolved = null;
    let lastRenderedHrSolved = null;

    // Helper: smooth single count-up animation for main numbers
    function animateCountUp(element, target, duration = 800) {
      if (!element) return;
      const targetNum = Number(target) || 0;
      const startTime = performance.now();
      function frame(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(targetNum * ease);
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          element.textContent = targetNum;
        }
      }
      requestAnimationFrame(frame);
    }

    // Helper: escape HTML for safe rendering
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Helper: format commit date into human-friendly or relative string
    function formatCommitDate(isoDate) {
      if (!isoDate) return 'Recent';
      try {
        const d = new Date(isoDate);
        const now = new Date();
        const diffMs = now - d;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        return 'Recent';
      }
    }

    // DOM Elements
    const elTooltip = document.getElementById('gh-tooltip');

    // GitHub Elements
    const elGhTotal = document.getElementById('gh-total-contribs');
    const elGhPeriod = document.getElementById('gh-period-label');
    const elGhMatrix = document.getElementById('gh-heatmap-matrix');
    const elGhMonths = document.getElementById('gh-months-row');
    const elGhSummaryCommits = document.getElementById('gh-summary-commits');
    const elGhSummaryRepos = document.getElementById('gh-summary-repos');
    const elGhSummaryDays = document.getElementById('gh-summary-days');
    const elGhStarredGrid = document.getElementById('gh-starred-grid');
    const ghYearTabs = activitySection.querySelectorAll('.gh-year-tab, .gh-year-btn');

    // LeetCode Elements
    const elLcSolved = document.getElementById('lc-solved-num');
    const elLcTotal = document.getElementById('lc-total-problems');
    const elLcRingFill = document.getElementById('lc-ring-fill');
    const elLcEasySolved = document.getElementById('lc-easy-solved');
    const elLcEasyTotal = document.getElementById('lc-easy-total');
    const elLcMedSolved = document.getElementById('lc-med-solved');
    const elLcMedTotal = document.getElementById('lc-med-total');
    const elLcHardSolved = document.getElementById('lc-hard-solved');
    const elLcHardTotal = document.getElementById('lc-hard-total');
    const elLcEasyBar = document.getElementById('lc-easy-bar');
    const elLcMedBar = document.getElementById('lc-med-bar');
    const elLcHardBar = document.getElementById('lc-hard-bar');
    const elLcEasyPct = document.getElementById('lc-easy-pct');
    const elLcMedPct = document.getElementById('lc-med-pct');
    const elLcHardPct = document.getElementById('lc-hard-pct');

    // HackerRank Elements
    const elHrTotal = document.getElementById('hr-total-num');
    const elHrRingFill = document.getElementById('hr-ring-fill');
    const elHrSqlSolved = document.getElementById('hr-sql-num');
    const elHrSqlTotal = document.getElementById('hr-sql-total');
    const elHrPsSolved = document.getElementById('hr-ps-num');
    const elHrPsTotal = document.getElementById('hr-ps-total');
    const elHrPySolved = document.getElementById('hr-python-num');
    const elHrPyTotal = document.getElementById('hr-py-total');
    const elHrSqlBar = document.getElementById('hr-sql-bar');
    const elHrPsBar = document.getElementById('hr-ps-bar');
    const elHrPyBar = document.getElementById('hr-python-bar');
    const elHrSqlPct = document.getElementById('hr-sql-pct');
    const elHrPsPct = document.getElementById('hr-ps-pct');
    const elHrPyPct = document.getElementById('hr-python-pct');

    // Verified Starred Repositories (Fallback & Hydration Data)
    const DEFAULT_STARRED_REPOSITORIES = [
      {
        name: 'SYNAPSE',
        fullName: 'arunp061106/SYNAPSE',
        owner: 'arunp061106',
        description: 'Synthetic Data Intelligence Platform',
        language: 'Python',
        stars: 1,
        forks: 0,
        url: 'https://github.com/arunp061106/SYNAPSE'
      },
      {
        name: 'Sentiment-Scope',
        fullName: 'arunp061106/Sentiment-Scope',
        owner: 'arunp061106',
        description: 'Live social media sentiment analysis dashboard — 732 posts across Twitter, Instagram & Facebook | DND Data nDreads 2026',
        language: 'JavaScript',
        stars: 1,
        forks: 0,
        url: 'https://github.com/arunp061106/Sentiment-Scope'
      },
      {
        name: 'tata-ipl-green-initiative',
        fullName: 'arunp061106/tata-ipl-green-initiative',
        owner: 'arunp061106',
        description: 'Python/Streamlit dashboard analyzing environmental sustainability of TATA IPL Green Dot Ball Initiative with full ETL and ML.',
        language: 'Python',
        stars: 1,
        forks: 0,
        url: 'https://github.com/arunp061106/tata-ipl-green-initiative'
      },
      {
        name: 'kaggle-s6e10-airline-satisfaction',
        fullName: 'arunp061106/kaggle-s6e10-airline-satisfaction',
        owner: 'arunp061106',
        description: 'Dual rank-anchor stacking champion, blend evaluations, sanitized pipelines, and research documentation for Kaggle S6E10.',
        language: 'Python',
        stars: 1,
        forks: 0,
        url: 'https://github.com/arunp061106/kaggle-s6e10-airline-satisfaction'
      }
    ];

    // Helper: load fallback snapshot
    let fallbackStatsPromise = null;
    function getFallbackSnapshot() {
      if (!fallbackStatsPromise) {
        fallbackStatsPromise = fetch('data/fallback-stats.json')
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);
      }
      return fallbackStatsPromise;
    }

    // Client-side fallback dynamic fetch for GitHub Activity & Stars (CORS friendly)
    async function fetchClientGitHubActivity() {
      const username = 'arunp061106';
      try {
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
        const [starredRes, searchRes, userRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}/starred`, { headers }).catch(() => null),
          fetch(`https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=10`, {
            headers: { 'Accept': 'application/vnd.github.cloak-preview+json' }
          }).catch(() => null),
          fetch(`https://api.github.com/users/${username}`, { headers }).catch(() => null),
          fetch(`https://api.github.com/users/${username}/events?per_page=30`, { headers }).catch(() => null)
        ]);

        let publicRepos = 25;
        if (userRes && userRes.ok) {
          const u = await userRes.json();
          if (typeof u.public_repos === 'number') publicRepos = u.public_repos;
        }

        let totalCommits = 202;
        const recentCommits = [];
        if (searchRes && searchRes.ok) {
          const sData = await searchRes.json();
          if (typeof sData.total_count === 'number' && sData.total_count > 0) {
            totalCommits = Math.max(sData.total_count, 202);
          }
          if (Array.isArray(sData.items)) {
            sData.items.forEach(c => {
              recentCommits.push({
                repo: c.repository?.name || 'repository',
                message: c.commit?.message ? c.commit.message.split('\n')[0] : 'Code update',
                sha: c.sha ? c.sha.substring(0, 7) : 'commit',
                date: c.commit?.author?.date || c.commit?.committer?.date || new Date().toISOString(),
                url: c.html_url || `https://github.com/${username}/${c.repository?.name}/commit/${c.sha}`
              });
            });
          }
        }

        // Supplementary parsing from events if search is rate-limited or to enrich
        if (eventsRes && eventsRes.ok) {
          const events = await eventsRes.json();
          if (Array.isArray(events)) {
            events.forEach(ev => {
              if (ev.type === 'PushEvent') {
                const repoName = (ev.repo?.name || '').replace(`${username}/`, '') || 'repository';
                const commits = ev.payload?.commits || [];
                if (commits.length > 0) {
                  commits.forEach(c => {
                    const sha = c.sha ? c.sha.substring(0, 7) : (ev.payload?.head ? ev.payload.head.substring(0, 7) : 'commit');
                    if (!recentCommits.some(rc => rc.sha === sha)) {
                      recentCommits.push({
                        repo: repoName,
                        message: c.message ? c.message.split('\n')[0] : 'Push update',
                        sha,
                        date: ev.created_at,
                        url: `https://github.com/${ev.repo?.name || repoName}/commit/${c.sha || ev.payload?.head}`
                      });
                    }
                  });
                } else if (ev.payload?.head) {
                  const sha = ev.payload.head.substring(0, 7);
                  if (!recentCommits.some(rc => rc.sha === sha)) {
                    recentCommits.push({
                      repo: repoName,
                      message: `Pushed updates to ${ev.payload.ref ? ev.payload.ref.replace('refs/heads/', '') : 'main'}`,
                      sha,
                      date: ev.created_at,
                      url: `https://github.com/${ev.repo?.name || repoName}/commit/${ev.payload.head}`
                    });
                  }
                }
              }
            });
          }
        }

        // Sort newest first
        recentCommits.sort((a, b) => new Date(b.date) - new Date(a.date));

        let starredRepositories = DEFAULT_STARRED_REPOSITORIES;
        if (starredRes && starredRes.ok) {
          const sData = await starredRes.json();
          if (Array.isArray(sData) && sData.length > 0) {
            starredRepositories = sData.map(r => {
              const matchDefault = DEFAULT_STARRED_REPOSITORIES.find(d => d.fullName.toLowerCase() === (r.full_name || '').toLowerCase() || d.name.toLowerCase() === (r.name || '').toLowerCase());
              return {
                name: r.name,
                fullName: r.full_name,
                owner: r.owner?.login || username,
                description: r.description || matchDefault?.description || 'GitHub starred repository.',
                language: r.language || matchDefault?.language || 'Python',
                stars: r.stargazers_count ?? 1,
                forks: r.forks_count ?? 0,
                url: r.html_url
              };
            });
          }
        }

        const latestCommit = recentCommits[0] || {
          repo: 'data-canvas-26-DF-dashboard',
          message: 'Fix unstable map pins, eliminate transform jitter, luminous taluk map with ice-white lines, and clean non-overlapping labels',
          sha: '93b63cc',
          date: '2026-10-15T04:47:43.000+05:30',
          url: `https://github.com/${username}/data-canvas-26-DF-dashboard/commit/93b63ccc6ec0d613c4ebf8fd5635afdd2659a2ba`
        };

        return {
          username,
          publicRepos,
          totalCommits,
          activeDays: 44,
          starredRepositories,
          repositories: starredRepositories,
          recentActivity: recentCommits.slice(0, 10),
          latestCommit,
          updatedAt: new Date().toISOString()
        };
      } catch (e) {
        return null;
      }
    }

    // Client-side fallback dynamic fetch for GitHub Contributions (CORS friendly)
    async function fetchClientGitHubContributions(year = 'last') {
      const username = 'arunp061106';
      try {
        const snapshot = await getFallbackSnapshot();
        const baseContribs = snapshot && snapshot.github ? JSON.parse(JSON.stringify(snapshot.github)) : null;
        if (!baseContribs) return null;

        // Fetch live events to overlay recent commits onto the calendar matrix
        const evRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        }).catch(() => null);

        if (evRes && evRes.ok) {
          const events = await evRes.json();
          if (Array.isArray(events)) {
            const pushEvents = events.filter(e => e.type === 'PushEvent');
            const commitsByDate = {};
            pushEvents.forEach(e => {
              const d = e.created_at ? e.created_at.split('T')[0] : null;
              if (d) {
                const cCount = e.payload?.commits?.length || (e.payload?.head ? 1 : 0);
                commitsByDate[d] = (commitsByDate[d] || 0) + cCount;
              }
            });

            // Overlay into weeks
            let additionalCount = 0;
            if (baseContribs.weeks) {
              baseContribs.weeks.forEach(w => {
                (w.days || []).forEach(day => {
                  if (day && day.date && commitsByDate[day.date]) {
                    const eventCount = commitsByDate[day.date];
                    if (eventCount > day.count) {
                      additionalCount += (eventCount - day.count);
                      day.count = eventCount;
                      day.level = eventCount >= 9 ? 4 : (eventCount >= 5 ? 3 : (eventCount >= 3 ? 2 : 1));
                      day.tooltip = `${eventCount} contribution${eventCount === 1 ? '' : 's'} on ${day.date}`;
                    }
                  }
                });
              });
            }
            if (additionalCount > 0) {
              baseContribs.totalContributions = (baseContribs.totalContributions || 253) + additionalCount;
            }
          }
        }
        return baseContribs;
      } catch (e) {
        return null;
      }
    }

    // Client-side fallback dynamic fetch for LeetCode
    async function fetchClientLeetCode() {
      const username = 'f5oMCKlfVr';
      try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
        if (res.ok) {
          const alfa = await res.json();
          return {
            username,
            realName: 'Arun Karthick P',
            totalSolved: alfa.solvedProblem || 18,
            totalProblems: 4082,
            easySolved: alfa.easySolved || 11,
            easyTotal: 971,
            mediumSolved: alfa.mediumSolved || 6,
            mediumTotal: 2128,
            hardSolved: alfa.hardSolved || 1,
            hardTotal: 983,
            attempting: 0,
            ranking: 4788736,
            updatedAt: new Date().toISOString()
          };
        }
      } catch (e) {}
      return null;
    }

    /* ── A. RENDER GITHUB CONTRIBUTION GRAPH ── */
    function formatTooltipContent(count, dateStr) {
      const c = Number(count) || 0;
      const countText = c === 0 ? 'No contributions' : `${c} contribution${c === 1 ? '' : 's'}`;
      let formattedDate = dateStr;
      try {
        if (dateStr) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
        }
      } catch (e) {}
      return `<div style="font-weight:600">${countText}</div><div style="color:#848d97;font-size:10px">${formattedDate}</div>`;
    }

    function renderGitHubHeatmap(data, year) {
      if (!data) return;

      const total = data.totalContributions ?? 226;
      if (elGhTotal) elGhTotal.textContent = total.toLocaleString();
      if (elGhPeriod) {
        elGhPeriod.textContent = (year === 'last' || !year) ? 'last year' : `${year}`;
      }

      const weeks = data.weeks || [];
      if (!elGhMatrix || weeks.length === 0) return;

      // Active days count
      let activeDaysCount = 0;
      weeks.forEach(w => {
        (w.days || []).forEach(d => {
          if ((d && d.count || 0) > 0) activeDaysCount++;
        });
      });
      if (elGhSummaryDays && activeDaysCount > 0) {
        animateCountUp(elGhSummaryDays, activeDaysCount);
      }

      // Build 53 columns x 7 rows cells
      const cellFragments = [];
      weeks.forEach((week) => {
        const days = week.days || [];
        for (let i = 0; i < 7; i++) {
          const day = days[i];
          if (!day) {
            cellFragments.push('<div class="gh-cell lvl-0" style="visibility:hidden"></div>');
            continue;
          }
          const count = day.count || 0;
          const level = Math.min(Math.max(day.level ?? (count > 0 ? 1 : 0), 0), 4);
          const tooltip = day.tooltip || `${count} contribution${count === 1 ? '' : 's'} on ${day.date}`;
          cellFragments.push(
            `<div class="gh-cell lvl-${level}" role="gridcell" tabindex="0" data-date="${day.date}" data-count="${count}" data-tip="${tooltip}" aria-label="${tooltip}"></div>`
          );
        }
      });

      elGhMatrix.innerHTML = cellFragments.join('');

      // Attach tooltip listeners
      const cells = elGhMatrix.querySelectorAll('.gh-cell');
      cells.forEach(cell => {
        const showTip = () => {
          if (!elTooltip) return;
          const count = cell.getAttribute('data-count');
          const date = cell.getAttribute('data-date');
          elTooltip.innerHTML = formatTooltipContent(count, date);
          const rect = cell.getBoundingClientRect();
          elTooltip.style.left = `${rect.left + rect.width / 2}px`;
          elTooltip.style.top = `${rect.top - 8}px`;
          elTooltip.classList.add('visible');
          elTooltip.setAttribute('aria-hidden', 'false');
        };

        const hideTip = () => {
          if (!elTooltip) return;
          elTooltip.classList.remove('visible');
          elTooltip.setAttribute('aria-hidden', 'true');
        };

        cell.addEventListener('mouseenter', showTip);
        cell.addEventListener('mouseleave', hideTip);
        cell.addEventListener('focusin', showTip);
        cell.addEventListener('focusout', hideTip);
      });
    }

    async function loadGitHubContributions(year = 'last', bypassCache = false) {
      if (statsCache.githubContribs[year]) {
        renderGitHubHeatmap(statsCache.githubContribs[year], year);
      }

      // Check localStorage first for instant render on refresh
      let savedLocal = null;
      try {
        const raw = localStorage.getItem(`arun_portfolio_gh_contribs_${year}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          savedLocal = parsed && parsed.data ? parsed.data : parsed;
        }
      } catch (e) {}

      if (savedLocal && !statsCache.githubContribs[year]) {
        statsCache.githubContribs[year] = savedLocal;
        renderGitHubHeatmap(savedLocal, year);
      } else if (!statsCache.githubContribs[year]) {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.github) {
          statsCache.githubContribs[year] = snapshot.github;
          renderGitHubHeatmap(snapshot.github, year);
        }
      }

      // Always automatically sync from live API on page refresh
      let data = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`/api/github/contributions?year=${encodeURIComponent(year)}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      // If backend failed (e.g. running statically without server), fetch directly from GitHub
      if (!data) {
        data = await fetchClientGitHubContributions(year);
      }

      if (data) {
        statsCache.githubContribs[year] = data;
        try {
          localStorage.setItem(`arun_portfolio_gh_contribs_${year}`, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
        renderGitHubHeatmap(data, year);
      } else {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.github) {
          statsCache.githubContribs[year] = snapshot.github;
          renderGitHubHeatmap(snapshot.github, year);
        }
      }
    }

    // Year selection tabs
    ghYearTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        ghYearTabs.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const selectedYear = btn.getAttribute('data-year') || 'last';
        loadGitHubContributions(selectedYear);
      });
    });

    /* ── B. RENDER GITHUB ACTIVITY & STARRED REPOSITORIES ── */
    function renderGitHubActivity(data) {
      if (!data) return;

      const commits = data.totalCommits ?? 202;
      if (elGhSummaryCommits) {
        animateCountUp(elGhSummaryCommits, commits);
      }
      if (elGhSummaryRepos && typeof data.publicRepos === 'number') {
        elGhSummaryRepos.textContent = data.publicRepos;
      }
      if (elGhSummaryDays && data.activeDays) {
        elGhSummaryDays.textContent = data.activeDays;
      }

      // Populate Live Latest Commit Bar
      const elLatestBar = document.getElementById('gh-latest-commit-bar');
      const elLatestRepo = document.getElementById('gh-latest-repo');
      const elLatestMsg = document.getElementById('gh-latest-msg');
      const elLatestDate = document.getElementById('gh-latest-date');
      const elLatestLink = document.getElementById('gh-latest-commit-link');

      const commit = data.latestCommit || (Array.isArray(data.recentActivity) && data.recentActivity.length > 0 ? data.recentActivity[0] : null);
      if (commit && elLatestBar) {
        if (elLatestRepo && commit.repo) elLatestRepo.textContent = commit.repo;
        if (elLatestMsg && commit.message) elLatestMsg.textContent = commit.message;
        if (elLatestDate && commit.date) {
          elLatestDate.textContent = formatCommitDate(commit.date);
        }
        if (elLatestLink && commit.url) {
          elLatestLink.href = commit.url;
        }
        elLatestBar.style.display = 'flex';
      }

      // Populate Starred Repositories Grid
      if (!elGhStarredGrid) return;
      const repos = (data.starredRepositories && data.starredRepositories.length > 0)
        ? data.starredRepositories
        : (data.repositories && data.repositories.length > 0 ? data.repositories : DEFAULT_STARRED_REPOSITORIES);

      const starCardsHtml = repos.map(repo => {
        const lang = repo.language || 'Code';
        const dotClass = lang.toLowerCase().includes('python') ? 'dot-py' : 'dot-js';
        const owner = repo.owner || repo.fullName?.split('/')[0] || 'arunp061106';
        const stars = repo.stars ?? 1;
        return `
        <a href="${repo.url || '#'}" target="_blank" rel="noopener noreferrer" class="gh-star-card" title="Open ${repo.name} on GitHub">
          <div class="gh-star-title-row">
            <div class="gh-star-title-left">
              <span class="gh-star-dot ${dotClass}"></span>
              <span class="gh-star-name">${repo.name}</span>
            </div>
            <span class="gh-star-count"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ${stars}</span>
          </div>
          <p class="gh-star-desc">${repo.description || 'GitHub starred repository.'}</p>
          <div class="gh-star-meta-row">
            <span class="gh-star-owner">${owner}</span>
            <span class="gh-star-lang">${lang}</span>
          </div>
        </a>
      `;
      }).join('');

      elGhStarredGrid.innerHTML = starCardsHtml;
    }

    async function loadGitHubActivity(bypassCache = false) {
      if (statsCache.githubActivity) {
        renderGitHubActivity(statsCache.githubActivity);
      }

      // Check localStorage first for instant render of latest user data
      let savedLocal = null;
      try {
        const raw = localStorage.getItem('arun_portfolio_gh_activity');
        if (raw) {
          const parsed = JSON.parse(raw);
          savedLocal = parsed && parsed.data ? parsed.data : parsed;
        }
      } catch (e) {}

      if (savedLocal && !statsCache.githubActivity) {
        statsCache.githubActivity = savedLocal;
        renderGitHubActivity(savedLocal);
      } else if (!statsCache.githubActivity) {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.githubActivity) {
          statsCache.githubActivity = snapshot.githubActivity;
          renderGitHubActivity(snapshot.githubActivity);
        } else {
          renderGitHubActivity({
            publicRepos: 25,
            totalCommits: 202,
            activeDays: 44,
            starredRepositories: DEFAULT_STARRED_REPOSITORIES
          });
        }
      }

      // Always automatically sync from live API on page refresh

      // Try local /api route first
      let data = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch('/api/github/activity', { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      // If /api failed (e.g. running statically, Live Server, or GitHub Pages), fetch directly from GitHub
      if (!data) {
        data = await fetchClientGitHubActivity();
      }

      if (data) {
        statsCache.githubActivity = data;
        try {
          localStorage.setItem('arun_portfolio_gh_activity', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {}
        renderGitHubActivity(data);
      } else {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.githubActivity) {
          statsCache.githubActivity = snapshot.githubActivity;
          renderGitHubActivity(snapshot.githubActivity);
        }
      }
    }

    /* ── C. RENDER LEETCODE PROGRESS ── */
    function renderLeetCodeDashboard(data) {
      if (!data) return;

      const total = data.totalSolved ?? 18;
      const totalProblems = data.totalProblems ?? 4082;
      const easy = data.easySolved ?? 11;
      const easyTotal = data.easyTotal ?? 971;
      const med = data.mediumSolved ?? 6;
      const medTotal = data.mediumTotal ?? 2128;
      const hard = data.hardSolved ?? 1;
      const hardTotal = data.hardTotal ?? 983;

      if (lastRenderedLcSolved === null || lastRenderedLcSolved !== total) {
        animateCountUp(elLcSolved, total);
        lastRenderedLcSolved = total;
      } else if (elLcSolved) {
        elLcSolved.textContent = total;
      }

      if (elLcTotal) elLcTotal.textContent = totalProblems;
      if (elLcEasySolved) elLcEasySolved.textContent = easy;
      if (elLcEasyTotal) elLcEasyTotal.textContent = easyTotal;
      if (elLcMedSolved) elLcMedSolved.textContent = med;
      if (elLcMedTotal) elLcMedTotal.textContent = medTotal;
      if (elLcHardSolved) elLcHardSolved.textContent = hard;
      if (elLcHardTotal) elLcHardTotal.textContent = hardTotal;

      const easyPctVal = ((easy / easyTotal) * 100).toFixed(1);
      const medPctVal = ((med / medTotal) * 100).toFixed(1);
      const hardPctVal = ((hard / hardTotal) * 100).toFixed(1);

      if (elLcEasyPct) elLcEasyPct.textContent = `${easyPctVal}%`;
      if (elLcMedPct) elLcMedPct.textContent = `${medPctVal}%`;
      if (elLcHardPct) elLcHardPct.textContent = `${hardPctVal}%`;

      if (elLcEasyBar) elLcEasyBar.style.width = '25%';
      if (elLcMedBar) elLcMedBar.style.width = '14%';
      if (elLcHardBar) elLcHardBar.style.width = '6%';

      if (elLcRingFill) {
        const visualPct = 0.25;
        const targetOffset = RING_CIRCUMFERENCE * (1 - visualPct);
        elLcRingFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
        elLcRingFill.style.strokeDashoffset = `${targetOffset}`;
      }
    }

    async function loadLeetCodeStats(bypassCache = false) {
      if (!bypassCache && statsCache.leetcode) {
        renderLeetCodeDashboard(statsCache.leetcode);
        return;
      }

      let savedLocal = null;
      try {
        const raw = localStorage.getItem('arun_portfolio_lc_stats');
        if (raw) savedLocal = JSON.parse(raw);
      } catch (e) {}

      if (savedLocal && !statsCache.leetcode) {
        statsCache.leetcode = savedLocal;
        renderLeetCodeDashboard(savedLocal);
      } else {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.leetcode && !statsCache.leetcode) {
          renderLeetCodeDashboard(snapshot.leetcode);
        }
      }

      let data = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch('/api/leetcode/stats', { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {}

      // Fallback directly to client-accessible LeetCode API if /api failed
      if (!data) {
        data = await fetchClientLeetCode();
      }

      if (data) {
        statsCache.leetcode = data;
        try {
          localStorage.setItem('arun_portfolio_lc_stats', JSON.stringify(data));
        } catch (e) {}
        renderLeetCodeDashboard(data);
      } else {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.leetcode) {
          statsCache.leetcode = snapshot.leetcode;
          renderLeetCodeDashboard(snapshot.leetcode);
        }
      }
    }

    /* ── D. RENDER HACKERRANK PROGRESS ── */
    function renderHackerRankDashboard(data) {
      if (!data) return;

      const total = data.problemsSolved ?? 62;
      const skills = data.skills || [];

      if (lastRenderedHrSolved === null || lastRenderedHrSolved !== total) {
        animateCountUp(elHrTotal, total);
        lastRenderedHrSolved = total;
      } else if (elHrTotal) {
        elHrTotal.textContent = total;
      }

      const sqlSkill = skills.find(s => s.name.toLowerCase() === 'sql');
      const psSkill = skills.find(s => s.name.toLowerCase().includes('problem'));
      const pySkill = skills.find(s => s.name.toLowerCase().includes('python'));

      const sqlCount = sqlSkill?.solved ?? 58;
      const sqlTotal = sqlSkill?.totalChallenges ?? 58;
      const psCount = psSkill?.solved ?? 2;
      const psTotal = psSkill?.totalChallenges ?? 563;
      const pyCount = pySkill?.solved ?? 2;
      const pyTotal = pySkill?.totalChallenges ?? 115;

      if (elHrSqlSolved) elHrSqlSolved.textContent = sqlCount;
      if (elHrSqlTotal) elHrSqlTotal.textContent = sqlTotal;
      if (elHrPsSolved) elHrPsSolved.textContent = psCount;
      if (elHrPsTotal) elHrPsTotal.textContent = psTotal;
      if (elHrPySolved) elHrPySolved.textContent = pyCount;
      if (elHrPyTotal) elHrPyTotal.textContent = pyTotal;

      const sqlPctVal = ((sqlCount / sqlTotal) * 100).toFixed(0);
      const psPctVal = ((psCount / psTotal) * 100).toFixed(1);
      const pyPctVal = ((pyCount / pyTotal) * 100).toFixed(1);

      if (elHrSqlPct) elHrSqlPct.textContent = `${sqlPctVal}%`;
      if (elHrPsPct) elHrPsPct.textContent = `${psPctVal}%`;
      if (elHrPyPct) elHrPyPct.textContent = `${pyPctVal}%`;

      if (elHrSqlBar) elHrSqlBar.style.width = '100%';
      if (elHrPsBar) elHrPsBar.style.width = '12%';
      if (elHrPyBar) elHrPyBar.style.width = '15%';

      if (elHrRingFill) {
        const visualPct = 0.62;
        const targetOffset = RING_CIRCUMFERENCE * (1 - visualPct);
        elHrRingFill.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
        elHrRingFill.style.strokeDashoffset = `${targetOffset}`;
      }
    }

    async function loadHackerRankStats(bypassCache = false) {
      if (!bypassCache && statsCache.hackerrank) {
        renderHackerRankDashboard(statsCache.hackerrank);
        return;
      }

      let savedLocal = null;
      try {
        const raw = localStorage.getItem('arun_portfolio_hr_stats');
        if (raw) savedLocal = JSON.parse(raw);
      } catch (e) {}

      if (savedLocal && !statsCache.hackerrank) {
        statsCache.hackerrank = savedLocal;
        renderHackerRankDashboard(savedLocal);
      } else {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.hackerrank && !statsCache.hackerrank) {
          renderHackerRankDashboard(snapshot.hackerrank);
        }
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4500);
        const res = await fetch('/api/hackerrank/stats', { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        statsCache.hackerrank = data;
        try {
          localStorage.setItem('arun_portfolio_hr_stats', JSON.stringify(data));
        } catch (e) {}
        renderHackerRankDashboard(data);
      } catch (err) {
        const snapshot = await getFallbackSnapshot();
        if (snapshot && snapshot.hackerrank) {
          statsCache.hackerrank = snapshot.hackerrank;
          renderHackerRankDashboard(snapshot.hackerrank);
        }
      }
    }

    /* ── E. SYNC ALL CODING STATS ── */
    async function syncAllCodingStats(bypassCache = false) {
      await Promise.allSettled([
        loadGitHubContributions('last', bypassCache),
        loadGitHubActivity(bypassCache),
        loadLeetCodeStats(bypassCache),
        loadHackerRankStats(bypassCache)
      ]);
    }

    // Automatically sync all coding statistics dynamically whenever the page refreshes
    syncAllCodingStats(true);

    // Dynamic periodic update every 5 minutes when tab is visible
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncAllCodingStats(true);
      }
    }, 5 * 60 * 1000);
  }
})();
