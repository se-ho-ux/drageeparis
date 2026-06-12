/* ================================================
   DRAGÉE PARIS · JavaScript principal
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Header sticky scroll + hide-on-scroll-down ---- */
  const header = document.getElementById('header');
  if (header) {
    let lastY      = window.scrollY;
    let ticking    = false;
    let hiddenAtY  = Infinity;
    const HIDE_AFTER = 64;
    const SHOW_AFTER = 8;
    const isHomePage = !header.classList.contains('header--inner');
    const isMobile   = () => window.innerWidth <= 1100;
    // Sur mobile homepage, TOP_ZONE = fin du hero (100vh)
    const TOP_ZONE   = () => (isHomePage && isMobile()) ? window.innerHeight : 80;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const topZone = TOP_ZONE();
        // Mobile homepage : fond blanc uniquement après le hero
        const scrolledThreshold = (isHomePage && isMobile()) ? topZone : 40;
        header.classList.toggle('scrolled', y > scrolledThreshold);
        const menuOpen = navPanel && navPanel.classList.contains('open');
        if (!menuOpen) {
          if (y <= topZone) {
            header.classList.remove('header--hidden');
            hiddenAtY = Infinity;
          } else if (y > lastY) {
            hiddenAtY = y;
            if (!header.classList.contains('header--hidden') && y >= topZone + HIDE_AFTER) {
              header.classList.add('header--hidden');
            }
          } else if (y < lastY && header.classList.contains('header--hidden')) {
            if (hiddenAtY - y >= SHOW_AFTER) {
              header.classList.remove('header--hidden');
              hiddenAtY = Infinity;
            }
          }
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- 2. Hamburger menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navPanel  = document.getElementById('nav-panel');
  const backdrop  = document.getElementById('nav-backdrop');
  const closeBtn  = document.getElementById('nav-close');
  if (hamburger && navPanel) {
    const closeMenu = () => {
      navPanel.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      backdrop?.classList.remove('open');
      closeBtn?.classList.remove('visible');
      document.body.style.overflow = '';
      header.classList.remove('header--hidden');
    };
    hamburger.addEventListener('click', () => {
      const isOpen = navPanel.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      backdrop?.classList.toggle('open', isOpen);
      closeBtn?.classList.toggle('visible', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    closeBtn?.addEventListener('click', closeMenu);
    backdrop?.addEventListener('click', closeMenu);
    navPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- 3. Active nav link ---- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- 4. Intersection Observer — fade-in ---- */
  const fadeEls = document.querySelectorAll('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ---- helpers carrousel ---- */
  const duoPerPage = () => window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const duoGap    = () => window.innerWidth <= 640 ? 20 : window.innerWidth <= 1024 ? 28 : 44;

  function makeDuoCarousel(trackId, filterOptionsId, toggleId, prevId, nextId, countId) {
    const track      = document.getElementById(trackId);
    const filterOpts = document.getElementById(filterOptionsId);
    const toggleBtn  = document.getElementById(toggleId);
    const prevBtn    = document.getElementById(prevId);
    const nextBtn    = document.getElementById(nextId);
    const countEl    = document.getElementById(countId);
    const navEl      = countEl ? countEl.closest('.carousel-nav') : null;
    const wrapEl     = track ? track.parentElement : null;
    if (!track) return;

    const filters  = filterOpts ? Array.from(filterOpts.querySelectorAll('.filter-btn')) : [];
    const allItems = Array.from(track.querySelectorAll('.col-item[data-category]'));
    let activeFilter = 'all';
    let page = 0;

    /* -- filter toggle -- */
    if (toggleBtn && filterOpts) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = filterOpts.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        const icon = toggleBtn.querySelector('.filter-toggle__icon');
        if (icon) icon.textContent = isOpen ? '–' : '+';
      });
    }

    const getFiltered = () =>
      activeFilter === 'all' ? allItems : allItems.filter(i => i.dataset.category === activeFilter);

    const animateItems = (items) => {
      items.forEach(item => {
        item.classList.remove('col-item--entering');
        item.style.animationDelay = '';
      });
      track.offsetHeight; // force reflow
      items.forEach((item, idx) => {
        item.style.animationDelay = `${idx * 0.07}s`;
        item.classList.add('col-item--entering');
      });
    };

    const render = (animate, isFilterChange = false) => {
      const filtered   = getFiltered();
      const perPage    = duoPerPage();
      const gap        = duoGap();
      const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

      allItems.forEach(i => {
        i.style.display = 'none';
        i.classList.remove('col-item--entering');
        i.style.animationDelay = '';
      });
      filtered.forEach(i => { i.style.display = ''; });

      if (isFilterChange) animateItems(filtered);

      if (!animate) track.style.transition = 'none';
      const offset = page * (track.offsetWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      if (!animate) { track.offsetHeight; track.style.transition = ''; }

      if (prevBtn) prevBtn.disabled = page === 0;
      if (nextBtn) nextBtn.disabled = page >= totalPages - 1;
      if (navEl)   navEl.style.visibility = totalPages > 1 ? 'visible' : 'hidden';
      if (countEl) {
        countEl.innerHTML = '';
        if (totalPages > 1) {
          for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === page ? ' active' : '');
            dot.setAttribute('aria-label', `Page ${i + 1}`);
            dot.dataset.page = i;
            countEl.appendChild(dot);
          }
          countEl.querySelectorAll('.carousel-dot').forEach(dot => {
            dot.addEventListener('click', () => { page = Number(dot.dataset.page); render(true); });
          });
        }
      }
    };

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        page = 0;
        render(false, true);
      });
    });

    prevBtn?.addEventListener('click', () => {
      if (page > 0) { page--; render(true); }
    });
    nextBtn?.addEventListener('click', () => {
      const total = Math.max(1, Math.ceil(getFiltered().length / duoPerPage()));
      if (page < total - 1) { page++; render(true); }
    });

    window.addEventListener('resize', () => { page = 0; render(false); }, { passive: true });

    // Suivi des puces au scroll horizontal (mobile)
    if (wrapEl) {
      wrapEl.addEventListener('scroll', () => {
        if (window.innerWidth > 640) return;
        const firstItem = track.querySelector('.col-item[style*="display: none"]') ||
                          track.querySelector('.col-item:not([style*="display: none"])');
        const items = Array.from(track.querySelectorAll('.col-item')).filter(i => i.style.display !== 'none');
        if (!items.length) return;
        const itemWidth = items[0].offsetWidth;
        const gap = 16;
        const newPage = Math.round(wrapEl.scrollLeft / (itemWidth + gap));
        const clamped = Math.min(Math.max(newPage, 0), items.length - 1);
        if (clamped !== page) {
          page = clamped;
          if (countEl) {
            countEl.querySelectorAll('.carousel-dot').forEach((dot, i) => {
              dot.classList.toggle('active', i === page);
            });
          }
        }
      }, { passive: true });

      // Scroll horizontal souris/trackpad sur desktop
      let lastWheelTime = 0;
      wrapEl.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 640) return;
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime < 600) return;
        lastWheelTime = now;
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (delta > 0 && nextBtn) { nextBtn.click(); }
        else if (delta < 0 && prevBtn) { prevBtn.click(); }
      }, { passive: false });
    }

    render(false);

    // Stagger animation on initial load for first visible items
    const perPageInit = duoPerPage();
    const visibleOnLoad = allItems.filter(i => i.style.display !== 'none').slice(0, perPageInit);
    animateItems(visibleOnLoad);
  }

  /* ---- 5. Dragées ---- */
  makeDuoCarousel('dragees-track', 'dragees-filter-options', 'dragees-filter-toggle', 'dragees-prev', 'dragees-next', 'dragees-count');
  const urlFilter = new URLSearchParams(window.location.search).get('filter');
  if (urlFilter) {
    const btn = document.querySelector(`#dragees-filter-options .filter-btn[data-filter="${urlFilter}"]`);
    if (btn) btn.click();
  }

  /* ---- 5b. Bougies ---- */
  makeDuoCarousel('bougies-track', 'bougies-filter-options', 'bougies-filter-toggle', 'bougies-prev', 'bougies-next', 'bougies-count');

  /* ---- 6. Form validation & submit ---- */
  const devisForm = document.getElementById('devis-form');
  if (devisForm) {
    const validateField = field => {
      const group = field.closest('.form__group');
      if (!group) return true;
      const valid = field.value.trim() !== '';
      group.classList.toggle('has-error', !valid);
      return valid;
    };

    devisForm.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form__group')?.classList.contains('has-error')) {
          validateField(field);
        }
      });
    });

    devisForm.addEventListener('submit', e => {
      e.preventDefault();
      let allValid = true;
      devisForm.querySelectorAll('[required]').forEach(field => {
        if (!validateField(field)) allValid = false;
      });
      if (!allValid) {
        devisForm.querySelector('.has-error [required]')?.focus();
        return;
      }
      devisForm.style.display = 'none';
      const success = document.getElementById('form-success');
      if (success) { success.classList.add('visible'); success.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  /* ---- 7. File upload label update ---- */
  const fileInput = document.getElementById('inspiration-file');
  const fileLabel = document.getElementById('file-label-text');
  if (fileInput && fileLabel) {
    fileInput.addEventListener('change', () => {
      fileLabel.textContent = fileInput.files[0]?.name ?? 'Cliquez pour ajouter une image d\'inspiration';
    });
  }

  /* ---- 8. FAQ accordion ---- */
  document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- 10. Newsletter forms ---- */
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button');
      if (input?.value && btn) {
        const original = btn.textContent;
        btn.textContent = '✓';
        input.value = '';
        input.placeholder = 'Merci pour votre inscription !';
        setTimeout(() => { btn.textContent = original; input.placeholder = 'Votre adresse e-mail'; }, 4000);
      }
    });
  });

});
