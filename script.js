(function () {
  'use strict';
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. CUSTOM CURSOR ── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring && !noMotion) {
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
      // dot follows exactly
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
      // ring lerps behind
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      rafCursor = requestAnimationFrame(moveCursor);
    }
    moveCursor();
  }

  /* ── 2. STARFIELD ── */
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], raf;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function makeStars() {
      const n = Math.min(Math.floor(W * H / 8500), 240);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.35 + 0.25,
        a: Math.random() * 0.55 + 0.12,
        sp: Math.random() * 0.014 + 0.004,
        ph: Math.random() * Math.PI * 2,
        dr: (Math.random() - 0.5) * 0.04
      }));
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        const a = noMotion ? s.a : s.a * (0.7 + 0.3 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195,215,255,${a})`; ctx.fill();
        if (!noMotion) {
          s.x += s.dr * 0.04;
          if (s.x < -2) s.x = W + 2;
          if (s.x > W + 2) s.x = -2;
        }
      });
      raf = requestAnimationFrame(draw);
    }
    function init() {
      resize(); makeStars(); cancelAnimationFrame(raf);
      if (noMotion) { draw(0); cancelAnimationFrame(raf); }
      else raf = requestAnimationFrame(draw);
    }
    let rTimer;
    window.addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(init, 250); });
    init();
  }

  /* ── 3. PARALLAX ON SCROLL ── */
  if (!noMotion) {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    function onScroll() {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const factor = parseFloat(el.dataset.parallax) || 0.05;
        el.style.transform = `translateY(${sy * factor}px)`;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── 4. TYPEWRITER ── */
  const roleEl = document.getElementById('typed-role');
  if (roleEl) {
    roleEl.style.color = '#C084FC';
    roleEl.style.textShadow = '0 0 18px rgba(192, 132, 252, 0.55)';
    const roles = ['Developer', 'Data Analyst', 'Data Engineer'];
    let ri = 0, ci = 0, del = false, paused = false;
    if (noMotion) { roleEl.textContent = roles[0]; }
    else {
      function tick() {
        if (paused) return;
        const role = roles[ri];
        if (!del) {
          roleEl.textContent = role.slice(0, ci + 1); ci++;
          if (ci === role.length) { paused = true; setTimeout(() => { paused = false; del = true; tick(); }, 2200); return; }
          setTimeout(tick, 85);
        } else {
          roleEl.textContent = role.slice(0, ci - 1); ci--;
          if (ci === 0) {
            del = false; ri = (ri + 1) % roles.length;
            paused = true; setTimeout(() => { paused = false; tick(); }, 320); return;
          }
          setTimeout(tick, 45);
        }
      }
      setTimeout(tick, 900);
    }
  }

  /* ── 5. SCROLL REVEAL ── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (noMotion) { reveals.forEach(el => el.classList.add('in-view')); }
    else {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
      }, { threshold: 0.1, rootMargin: '0px 0px -55px 0px' });
      reveals.forEach(el => obs.observe(el));
    }
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

  /* ── 7. STAR MAP ── */
  const PROJECTS = {
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

})();