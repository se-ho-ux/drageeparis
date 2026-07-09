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
    const TOP_ZONE   = () => {
      if (isHomePage && isMobile()) {
        const hero = document.querySelector('.hero');
        return hero ? hero.offsetHeight : window.innerHeight * 0.6;
      }
      return 80;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const topZone = TOP_ZONE();
        // Mobile homepage : fond blanc uniquement après le hero
        const scrolledThreshold = (isHomePage && isMobile()) ? topZone : 40;
        header.classList.toggle('scrolled', y > scrolledThreshold);
        const menuOpen = drawer && drawer.getAttribute('aria-hidden') === 'false';
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

  /* ---- 2. Drawer menu plein écran bicolonne ---- */
  const drawerToggle = document.getElementById('drawer-toggle');
  const drawer       = document.getElementById('drawer');
  const drawerClose  = document.getElementById('drawer-close');

  if (drawerToggle && drawer) {
    const mainItems     = Array.from(drawer.querySelectorAll('.drawer__main-item[data-sub]'));
    const allDrawerItems = Array.from(drawer.querySelectorAll('.drawer__main-item'));
    const allSubs       = Array.from(drawer.querySelectorAll('.drawer__sub'));

    const activateSub = (subId) => {
      allSubs.forEach(sub => {
        const visible = sub.id === subId;
        sub.setAttribute('aria-hidden', String(!visible));
        sub.inert = !visible;
        sub.classList.toggle('is-visible', false);
        if (visible) requestAnimationFrame(() => sub.classList.add('is-visible'));
      });
      allDrawerItems.forEach(item => {
        item.classList.toggle('is-active', item.dataset.sub === subId);
      });
      drawer.classList.add('sub-open');
    };

    const openDrawer = () => {
      drawer.setAttribute('aria-hidden', 'false');
      drawer.inert = false;
      drawerToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
      drawer.setAttribute('aria-hidden', 'true');
      drawer.inert = true;
      drawerToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      allSubs.forEach(s => { s.setAttribute('aria-hidden', 'true'); s.inert = true; s.classList.remove('is-visible'); });
      allDrawerItems.forEach(i => i.classList.remove('is-active'));
      drawer.classList.remove('sub-open');
      if (header) header.classList.remove('header--hidden');
    };

    drawerToggle.addEventListener('click', openDrawer);
    drawerClose?.addEventListener('click', closeDrawer);
    /* Clic sur la zone droite visible (hors panneau) ferme le menu */
    drawer.addEventListener('click', e => {
      if (!e.target.closest('.drawer__content')) closeDrawer();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

    /* Activation des sous-menus au clic uniquement */
    mainItems.forEach(item => {
      item.querySelector('.drawer__main-btn')?.addEventListener('click', () => activateSub(item.dataset.sub));
    });

    /* Soulignement pour À propos et Contact (pas de sous-menu) */
    allDrawerItems.filter(i => !i.dataset.sub).forEach(item => {
      item.querySelector('.drawer__main-btn')?.addEventListener('click', () => {
        allDrawerItems.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');
        drawer.classList.remove('sub-open');
      });
    });

    /* Fermer quand on clique un lien */
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

    /* Bouton Retour (mobile) — revient au panneau principal sans fermer */
    const drawerBack = document.getElementById('drawer-back');
    const closeSub = () => {
      allSubs.forEach(s => { s.setAttribute('aria-hidden', 'true'); s.inert = true; s.classList.remove('is-visible'); });
      drawer.classList.remove('sub-open');
    };
    drawerBack?.addEventListener('click', closeSub);

    /* Sous-catégories dépliables (ex. Premiers instants > Naissance / Gender reveal / Baby shower) */
    drawer.querySelectorAll('.drawer__sub-group-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const group = trigger.closest('.drawer__sub-group');
        const isOpen = group.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  /* ---- 3. Lien actif dans le drawer au chargement ---- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const navItems = drawer ? Array.from(drawer.querySelectorAll('.drawer__main-item')) : [];
  if (page.startsWith('boutique') || page.startsWith('produit')) {
    navItems.find(li => li.dataset.sub === 'sub-boutique')?.classList.add('is-active');
  } else if (page.startsWith('atelier')) {
    navItems.find(li => li.dataset.sub === 'sub-atelier')?.classList.add('is-active');
  } else if (page === 'a-propos.html') {
    navItems.find(li => li.querySelector('a[href="a-propos.html"]'))?.classList.add('is-active');
  } else if (page === 'message.html' || page === 'contact.html') {
    navItems.find(li => li.querySelector('a[href="message.html"]'))?.classList.add('is-active');
  }

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

      // Scroll horizontal trackpad sur desktop
      // – scroll vertical laissé au navigateur (navigation de page)
      // – scroll horizontal capturé avec accumulation delta pour plus de douceur
      let wheelCooldown = false;
      let wheelAccum = 0;
      wrapEl.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 640) return;
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        // Scroll principalement vertical → laisser la page défiler normalement
        if (absY > absX * 1.5) return;
        // Scroll horizontal → capturer pour le carrousel
        e.preventDefault();
        if (wheelCooldown) return;
        wheelAccum += e.deltaX;
        if (Math.abs(wheelAccum) > 40) {
          if (wheelAccum > 0 && nextBtn) nextBtn.click();
          else if (wheelAccum < 0 && prevBtn) prevBtn.click();
          wheelAccum = 0;
          wheelCooldown = true;
          setTimeout(() => { wheelCooldown = false; }, 700);
        }
      }, { passive: false });
    }

    render(false);

    // Stagger animation on initial load for first visible items
    const perPageInit = duoPerPage();
    const visibleOnLoad = allItems.filter(i => i.style.display !== 'none').slice(0, perPageInit);
    animateItems(visibleOnLoad);
  }

  /* ---- 5. Filtres galeries produits (dragees.html + bougies.html) ---- */
  function initProductFilter(filterId, gridId) {
    const filterEl  = document.getElementById(filterId);
    const grid      = document.getElementById(gridId);
    if (!filterEl || !grid) return;

    const tabs      = Array.from(filterEl.querySelectorAll('.cedric-filter__tab'));
    const cards     = Array.from(grid.querySelectorAll('[data-filter]'));
    const countEl   = filterEl.querySelector('.cedric-filter__count');
    const resetBtn  = filterEl.querySelector('[data-filter-reset]');

    const applyFilter = (f, sub) => {
      tabs.forEach(t => t.classList.remove('active'));
      const activeTab = tabs.find(t => t.dataset.filter === f) || tabs[0];
      activeTab.classList.add('active');
      const matches = card => {
        if (f !== 'all' && card.dataset.filter !== f) return false;
        if (sub && card.dataset.occasion !== sub) return false;
        return true;
      };
      cards.forEach(card => { card.style.display = matches(card) ? '' : 'none'; });
      if (countEl) {
        const visible = cards.filter(matches).length;
        countEl.textContent = `(${visible})`;
      }
      if (history.replaceState) {
        const url = f === 'all' ? window.location.pathname : `${window.location.pathname}?filter=${f}`;
        history.replaceState(null, '', url);
      }
      const main = filterEl.closest('main');
      const headerTitle = main?.querySelector('.collection-header__title');
      const headerDesc  = main?.querySelector('.collection-header__desc');
      if (headerTitle && activeTab.dataset.title) headerTitle.textContent = activeTab.dataset.title;
      if (headerDesc  && activeTab.dataset.desc)  headerDesc.textContent  = activeTab.dataset.desc;
    };

    tabs.forEach(tab => tab.addEventListener('click', () => applyFilter(tab.dataset.filter)));

    resetBtn?.addEventListener('click', () => applyFilter('all'));

    const urlParams = new URLSearchParams(window.location.search);
    applyFilter(urlParams.get('filter') || 'all', urlParams.get('sub'));
  }

  initProductFilter('collection-filter', 'dragees-grid');
  initProductFilter('bougies-filter', 'bougies-grid');
  initProductFilter('boutique-filter', 'boutique-grid');
  initProductFilter('atelier-filter', 'atelier-grid');

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

  /* ---- 11. Lightbox (pages produit) ---- */
  (function() {
    const gallery = document.querySelector('.pdp__gallery');
    if (!gallery) return;
    const img = gallery.querySelector('img');
    if (!img) return;

    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Vue agrandie');
    lb.innerHTML =
      '<button class="lightbox__close" aria-label="Fermer">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>' +
      '<img class="lightbox__img" alt="">';
    document.body.appendChild(lb);

    const lbImg    = lb.querySelector('.lightbox__img');
    const closeBtn = lb.querySelector('.lightbox__close');

    const open = () => {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };
    const close = () => {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    img.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  })();

  /* ---- 12. Bannière RGPD ---- */
  (function() {
    if (localStorage.getItem('dp-consent')) return;
    const banner = document.createElement('div');
    banner.className = 'rgpd-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Confidentialité');
    banner.innerHTML =
      '<p class="rgpd-banner__text">' +
        'Ce site utilise vos données uniquement pour traiter vos demandes — aucun cookie publicitaire. ' +
        '<a href="mentions-legales.html#rgpd">En savoir plus</a>' +
      '</p>' +
      '<div class="rgpd-banner__actions">' +
        '<button class="rgpd-banner__btn rgpd-banner__btn--accept" id="rgpd-accept">Accepter</button>' +
        '<button class="rgpd-banner__btn" id="rgpd-decline">Fermer</button>' +
      '</div>';
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('is-visible'), 900);

    const dismiss = (val) => {
      localStorage.setItem('dp-consent', val);
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 450);
    };
    document.getElementById('rgpd-accept').addEventListener('click', () => dismiss('accepted'));
    document.getElementById('rgpd-decline').addEventListener('click', () => dismiss('declined'));
  })();

  /* ---- 13. Carrousel garanties (mobile, page d'accueil) ---- */
  (function() {
    var grid = document.querySelector('.garanties__grid--4');
    var dots = document.querySelectorAll('.garanties__dot');
    if (!grid || !dots.length) return;

    var syncDots = function() {
      var idx = Math.round(grid.scrollLeft / grid.offsetWidth);
      dots.forEach(function(d, i) { d.classList.toggle('is-active', i === idx); });
    };

    grid.addEventListener('scroll', syncDots, { passive: true });

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        grid.scrollTo({ left: i * grid.offsetWidth, behavior: 'smooth' });
      });
    });
  })();

  /* ---- 14. Bascule grille / liste (boutique & atelier, mobile) ---- */
  (function() {
    var btnGrid = document.getElementById('view-grid');
    var btnList = document.getElementById('view-list');
    var grids = document.querySelectorAll('.product-grid');
    if (!btnGrid || !btnList || !grids.length) return;

    function setGrid() {
      grids.forEach(function(g) { g.classList.remove('product-grid--list'); });
      btnGrid.classList.add('is-active'); btnGrid.setAttribute('aria-pressed', 'true');
      btnList.classList.remove('is-active'); btnList.setAttribute('aria-pressed', 'false');
    }
    function setList() {
      grids.forEach(function(g) { g.classList.add('product-grid--list'); });
      btnList.classList.add('is-active'); btnList.setAttribute('aria-pressed', 'true');
      btnGrid.classList.remove('is-active'); btnGrid.setAttribute('aria-pressed', 'false');
    }
    btnGrid.addEventListener('click', setGrid);
    btnList.addEventListener('click', setList);
  })();

  /* ---- 15. Fiche produit : dropdown quantité -> prix ---- */
  (function() {
    document.querySelectorAll('[data-price-select]').forEach(function(select) {
      var block = select.closest('[data-qty-block]');
      if (!block) return;
      var priceEl = block.querySelector('[data-price-display]');
      var unitEl = block.querySelector('[data-unit-display]');
      function update() {
        var opt = select.options[select.selectedIndex];
        if (priceEl) priceEl.textContent = opt.value;
        if (unitEl) unitEl.textContent = opt.dataset.unit || '';
      }
      select.addEventListener('change', update);
      update();
    });
  })();

});
