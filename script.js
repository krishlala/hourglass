/* ============================================================
   Hourglass Recycling Foundation — Main Script
   ============================================================ */

// ── Theme ──────────────────────────────────────────────────
const Theme = (() => {
  const key = 'hrf-theme';
  let current = localStorage.getItem(key) || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

  function apply(theme) {
    current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(key, theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function toggle() {
    apply(current === 'dark' ? 'light' : 'dark');
  }

  function init() { apply(current); }
  return { init, toggle, current: () => current };
})();

// ── Toast Notifications ────────────────────────────────────
const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    const remove = () => {
      toast.classList.add('hide');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  }

  return { show };
})();

// ── Scroll Animations ──────────────────────────────────────
const ScrollAnimator = (() => {
  function init() {
    const elements = document.querySelectorAll('[data-animate]');
    const staggerParents = document.querySelectorAll('[data-stagger]');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('in-view'), Number(delay));
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => io.observe(el));

    // Stagger children
    staggerParents.forEach(parent => {
      const children = Array.from(parent.children);
      const childIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('in-view'), i * 80);
          });
          childIo.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      childIo.observe(parent);
    });
  }

  return { init };
})();

// ── Sticky Nav ─────────────────────────────────────────────
const Nav = (() => {
  let activeSection = '';

  function init() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll shrink
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
      updateActiveLink();
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');

    hamburger?.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav?.classList.toggle('open');
    });

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger?.classList.remove('open');
        mobileNav?.classList.remove('open');
      });
    });
  }

  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const scrollPos = window.scrollY + 120;

    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) current = section.id;
    });

    if (current !== activeSection) {
      activeSection = current;
      navLinks.forEach(link => {
        const href = link.getAttribute('href')?.replace('#', '');
        link.classList.toggle('active', href === current);
      });
    }
  }

  return { init };
})();

// ── Smooth Scroll ──────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
}

// ── Smart Search ───────────────────────────────────────────
const Search = (() => {
  const items = [
    { label: 'Home', icon: '🏠', href: '#home' },
    { label: 'About Us', icon: 'ℹ️', href: '#about' },
    { label: 'Locations', icon: '📍', href: '#locations' },
    { label: 'Contact', icon: '✉️', href: '#contact' },
    { label: 'Apply for a Position', icon: '💼', href: '#apply' },
    { label: 'Leaderboard', icon: '🏆', href: '#leaderboard' },
    { label: 'Newsletters', icon: '📰', href: '/newsletters/newsletters.html' },
    { label: 'Recycling Captain', icon: '♻️', href: '#apply' },
    { label: 'Data Entry Coordinator', icon: '📊', href: '#apply' },
    { label: 'Neighborhood Manager', icon: '🏘️', href: '#apply' },
    { label: 'Marketing Coordinator', icon: '📢', href: '#apply' },
  ];

  function init() {
    const input = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (!query) { dropdown.classList.remove('open'); return; }

      const matches = items.filter(item =>
        item.label.toLowerCase().includes(query)
      ).slice(0, 5);

      if (!matches.length) { dropdown.classList.remove('open'); return; }

      dropdown.innerHTML = matches.map(item => `
        <div class="search-item" data-href="${item.href}" role="option" tabindex="0">
          <div class="search-item-icon">${item.icon}</div>
          <span>${item.label}</span>
        </div>
      `).join('');

      dropdown.querySelectorAll('.search-item').forEach(el => {
        el.addEventListener('click', () => {
          const href = el.dataset.href;
          dropdown.classList.remove('open');
          input.value = '';
          if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
          } else {
            window.location.href = href;
          }
        });
      });

      dropdown.classList.add('open');
    });

    input.addEventListener('focus', () => { if (input.value) dropdown.classList.add('open'); });

    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-search')) dropdown.classList.remove('open');
    });

    // Keyboard nav in dropdown
    input.addEventListener('keydown', e => {
      const items = dropdown.querySelectorAll('.search-item');
      const focused = dropdown.querySelector('.search-item:focus');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        (focused ? focused.nextElementSibling || items[0] : items[0])?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        (focused ? focused.previousElementSibling || items[items.length - 1] : items[items.length - 1])?.focus();
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
        input.blur();
      }
    });
  }

  return { init };
})();

// ── Button Ripple ──────────────────────────────────────────
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

// ── Keyboard Shortcuts ─────────────────────────────────────
function initKeyboardShortcuts() {
  const modal = document.getElementById('shortcuts-modal');

  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);

    // ? → show shortcuts
    if (e.key === '?' && !isInput) {
      modal?.classList.toggle('open');
      return;
    }

    if (e.key === 'Escape') {
      modal?.classList.remove('open');
      document.getElementById('search-dropdown')?.classList.remove('open');
    }

    if (isInput) return;

    // / → focus search
    if (e.key === '/') {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    }

    // d → toggle dark mode
    if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
      Theme.toggle();
      Toast.show(`Switched to ${Theme.current()} mode`, 'info', 2000);
    }

    // Number keys → scroll to section
    const sectionMap = { '1': '#home', '2': '#about', '3': '#locations', '4': '#contact', '5': '#apply', '6': '#leaderboard' };
    if (sectionMap[e.key]) {
      const target = document.querySelector(sectionMap[e.key]);
      if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });

  // Close modal on backdrop click
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// ── Form Handling ──────────────────────────────────────────
function initForms() {
  document.querySelectorAll('form[data-form]').forEach(form => {
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn?.textContent || 'Submit';

    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Validate
      const inputs = form.querySelectorAll('[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('error');
          valid = false;
        } else {
          input.classList.remove('error');
          input.classList.add('success');
        }
      });

      if (!valid) { Toast.show('Please fill in all required fields', 'error'); return; }

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: new FormData(form)
        });
        const data = await res.json();

        if (data.success) {
          Toast.show('Message sent successfully!', 'success');
          form.reset();
          inputs.forEach(i => i.classList.remove('success', 'error'));
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        Toast.show(err.message || 'Something went wrong. Please try again.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      }
    });

    // Live validation feedback
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          input.classList.add('error');
          input.classList.remove('success');
        } else if (input.value.trim()) {
          input.classList.remove('error');
          input.classList.add('success');
        }
      });
      input.addEventListener('input', () => {
        if (input.classList.contains('error') && input.value.trim()) {
          input.classList.remove('error');
        }
      });
    });
  });

  // Char counter for textarea
  document.querySelectorAll('textarea[data-maxlength]').forEach(ta => {
    const max = Number(ta.dataset.maxlength);
    const counter = ta.parentElement?.querySelector('.char-counter');
    if (!counter) return;
    ta.addEventListener('input', () => {
      const len = ta.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.style.color = len > max * 0.9 ? '#ef4444' : '';
    });
  });
}

// ── Lazy Loading Images ────────────────────────────────────
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('loaded'));
      io.unobserve(img);
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => io.observe(img));
}

// ── Leaderboard ────────────────────────────────────────────
const Leaderboard = (() => {
  const token = 'pathiKExL9MWBgEio.e6fd1bbd1deb43b024ce6245527e5178985fee9dc5b65c8f9304da6cc57f94b1';
  const baseId = 'appjGCPWUcCwlhE8m';
  const tableName = 'Sheet1';

  function showSkeletons(tbody, count = 5) {
    tbody.innerHTML = Array(count).fill(0).map(() => `
      <tr class="skeleton-row">
        <td><div class="skeleton" style="width:28px;height:28px;border-radius:50%"></div></td>
        <td><div class="skeleton" style="width:120px;height:14px"></div></td>
        <td><div class="skeleton" style="width:80px;height:10px;border-radius:3px"></div></td>
      </tr>
    `).join('');
  }

  function buildPodium(top3) {
    const podium = document.getElementById('podium');
    if (!podium || !top3.length) return;

    // Reorder: 2nd, 1st, 3rd
    const order = [top3[1], top3[0], top3[2]].filter(Boolean);
    const positions = top3[1] ? [2, 1, 3] : [1];
    const maxGlass = top3[0]?.fields.Glass || 1;

    podium.innerHTML = order.map((record, i) => {
      const pos = positions[i];
      const name = record?.fields.Name || '—';
      const glass = record?.fields.Glass || 0;
      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉';
      const heights = { 1: 110, 2: 80, 3: 60 };

      return `
        <div class="podium-place">
          <div class="podium-avatar" style="${pos === 1 ? 'width:72px;height:72px' : ''}">${initials}</div>
          <div class="podium-name" title="${name}">${name}</div>
          <div class="podium-score">🍾 ${glass}</div>
          <div class="podium-base" style="height:${heights[pos]}px">${medal}</div>
        </div>
      `;
    }).join('');
  }

  async function load() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;

    showSkeletons(tbody);

    try {
      const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.records) throw new Error('No data');

      const sorted = data.records.sort((a, b) => (b.fields.Glass || 0) - (a.fields.Glass || 0));
      const maxGlass = sorted[0]?.fields.Glass || 1;

      buildPodium(sorted.slice(0, 3));

      tbody.innerHTML = sorted.map((record, i) => {
        const rank = i + 1;
        const name = record.fields.Name || '—';
        const glass = record.fields.Glass || 0;
        const pct = Math.round((glass / maxGlass) * 100);
        const rankDisplay = rank <= 3
          ? `<span class="rank-medal rank-${rank}">${['🥇','🥈','🥉'][rank-1]}</span>`
          : `<strong>${rank}</strong>`;

        return `
          <tr>
            <td class="rank-cell">${rankDisplay}</td>
            <td class="name-cell">${name}</td>
            <td>
              <div class="glass-bar-wrap">
                <div class="glass-bar" style="width:0" data-pct="${pct}"></div>
                <span class="glass-count">🍾 ${glass}</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Animate bars after render
      requestAnimationFrame(() => {
        setTimeout(() => {
          tbody.querySelectorAll('.glass-bar').forEach(bar => {
            bar.style.width = bar.dataset.pct + '%';
          });
        }, 100);
      });

    } catch {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--text-muted)">Could not load leaderboard data.</td></tr>`;
    }
  }

  return { load };
})();

// ── Scroll Progress Bar ────────────────────────────────────
function initProgressBar() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Copy to clipboard ──────────────────────────────────────
document.querySelectorAll('[data-copy]')?.forEach?.(el => {
  el.addEventListener('click', () => {
    navigator.clipboard.writeText(el.dataset.copy).then(() => {
      Toast.show('Copied to clipboard!', 'success', 2000);
    });
  });
});

// ── Page Transition ────────────────────────────────────────
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;

  // Animate in on load
  overlay.classList.add('entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.remove('entering');
      overlay.classList.add('leaving');
    });
  });

  // Animate out on external link clicks
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('leaving');
      overlay.classList.add('entering');
      setTimeout(() => window.location.assign(href), 400);
    });
  });
}

// ── Number Counter Animation ───────────────────────────────
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.unobserve(el);
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.round(current).toLocaleString() + (el.dataset.suffix || '');
        if (current < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    io.observe(el);
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Nav.init();
  initSmoothScroll();
  Search.init();
  ScrollAnimator.init();
  initRipple();
  initKeyboardShortcuts();
  initForms();
  initLazyImages();
  initProgressBar();
  initPageTransitions();
  initCounters();
  Leaderboard.load();

  // Theme toggle button
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    Theme.toggle();
    Toast.show(`Switched to ${Theme.current()} mode`, 'info', 2000);
  });
});
