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

    /* ── 9. PROBLEM SOLVING SCORECARD PANEL (LEETCODE & HACKERRANK) ── */
  const scorecardPanel = document.getElementById('coding-stats');

  if (scorecardPanel) {
    // Breakdown row hover / focus interaction: dims other dots in the section to 25%
    const sections = scorecardPanel.querySelectorAll('.sc-section');
    sections.forEach(section => {
      const rows = section.querySelectorAll('.sc-row-item');
      rows.forEach(row => {
        const cat = row.getAttribute('data-category');
        if (!cat) return;

        const activate = () => section.setAttribute('data-active-cat', cat);
        const deactivate = (e) => {
          // If focus moved to another row within same section, let that row's focusin handle it
          if (e && e.type === 'focusout' && e.relatedTarget && e.relatedTarget.closest('.sc-section') === section) {
            return;
          }
          section.removeAttribute('data-active-cat');
        };

        row.addEventListener('mouseenter', activate);
        row.addEventListener('mouseleave', deactivate);
        row.addEventListener('focusin', activate);
        row.addEventListener('focusout', deactivate);
      });
    });

    // Helper to calculate shares that strictly sum to 100.0%
    function computeShares(counts, total) {
      if (total <= 0) return counts.map(() => '0.0%');
      const raw = counts.map(c => (c / total) * 100);
      const rounded = raw.map(r => Math.round(r * 10) / 10);
      let diff = Math.round((100 - rounded.reduce((a, b) => a + b, 0)) * 10) / 10;
      
      // Adjust largest share if rounding causes tenths discrepancy
      if (Math.abs(diff) > 0.001) {
        let maxIdx = 0;
        for (let i = 1; i < raw.length; i++) {
          if (raw[i] > raw[maxIdx]) maxIdx = i;
        }
        rounded[maxIdx] = Math.round((rounded[maxIdx] + diff) * 10) / 10;
      }
      return rounded.map(r => `${r.toFixed(1)}%`);
    }

    // In-memory cache to guarantee single-fetch on mount & no polling
    let cachedLeetCodeStats = null;

    function renderLeetCode(total, easy, med, hard) {
      const elTotal = document.getElementById('lc-total-num');
      const elEasy = document.getElementById('lc-easy-num');
      const elMed = document.getElementById('lc-med-num');
      const elHard = document.getElementById('lc-hard-num');
      const elEasyShare = document.getElementById('lc-easy-share');
      const elMedShare = document.getElementById('lc-med-share');
      const elHardShare = document.getElementById('lc-hard-share');
      const dotGrid = document.getElementById('lc-dot-grid');

      if (elTotal) elTotal.textContent = total;
      if (elEasy) elEasy.textContent = easy;
      if (elMed) elMed.textContent = med;
      if (elHard) elHard.textContent = hard;

      const shares = computeShares([easy, med, hard], total);
      if (elEasyShare) elEasyShare.textContent = shares[0];
      if (elMedShare) elMedShare.textContent = shares[1];
      if (elHardShare) elHardShare.textContent = shares[2];

      // Update dot grid accessibility label
      if (dotGrid) {
        dotGrid.setAttribute('aria-label', `LeetCode solved problems: ${easy} easy, ${med} medium, ${hard} hard`);

        // If counts differ from current dot count, rebuild dots to match exact total
        const currentDots = dotGrid.querySelectorAll('.sc-dot');
        if (currentDots.length !== total) {
          const dots = [];
          const step = Math.min(500 / Math.max(total, 1), 25);
          let idx = 0;
          for (let i = 0; i < easy; i++, idx++) {
            dots.push(`<span class="sc-dot dot-easy" data-category="easy" aria-hidden="true" style="animation-delay: ${Math.round(idx * step)}ms;"></span>`);
          }
          for (let i = 0; i < med; i++, idx++) {
            dots.push(`<span class="sc-dot dot-med" data-category="med" aria-hidden="true" style="animation-delay: ${Math.round(idx * step)}ms;"></span>`);
          }
          for (let i = 0; i < hard; i++, idx++) {
            dots.push(`<span class="sc-dot dot-hard" data-category="hard" aria-hidden="true" style="animation-delay: ${Math.round(idx * step)}ms;"></span>`);
          }
          dotGrid.innerHTML = dots.join('');
        }
      }
    }

    async function syncLeetCodeStats() {
      if (cachedLeetCodeStats) {
        return; // Already cached, never re-fetch
      }

      const elFallback = document.getElementById('analytics-fallback-note');
      const elDate = document.getElementById('lc-fetch-date');

      if (elDate) {
        elDate.textContent = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://alfa-leetcode-api.onrender.com/f5oMCKlfVr/solved', {
          signal: controller.signal
        });
        clearTimeout(timer);

        if (!res.ok) throw new Error('API response not ok: ' + res.status);
        const data = await res.json();
        if (data && typeof data.solvedProblem === 'number') {
          const total = data.solvedProblem;
          const easy = typeof data.easySolved === 'number' ? data.easySolved : 11;
          const med = typeof data.mediumSolved === 'number' ? data.mediumSolved : 6;
          const hard = typeof data.hardSolved === 'number' ? data.hardSolved : 1;

          cachedLeetCodeStats = { total, easy, med, hard };
          renderLeetCode(total, easy, med, hard);
          if (elFallback) elFallback.hidden = true;
        }
      } catch (err) {
        // API failed or offline: show cached values indicator
        if (elFallback) elFallback.hidden = false;
      }
    }

    syncLeetCodeStats();
  }

})();
