/* ================================================
   DRAGÉE PARIS · JavaScript principal
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- 1. Header sticky scroll ---- */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- 2. Hamburger menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navPanel  = document.getElementById('nav-panel');
  const backdrop  = document.getElementById('nav-backdrop');
  if (hamburger && navPanel) {
    const closeMenu = () => {
      navPanel.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      backdrop?.classList.remove('open');
      document.body.style.overflow = '';
    };
    hamburger.addEventListener('click', () => {
      const isOpen = navPanel.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      backdrop?.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
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

  /* ---- 5. Dragées — Accordéon filtrable + paginé ---- */
  const drageesAccord  = document.getElementById('dragees-accord');
  const drageesPrevBtn = document.getElementById('dragees-prev');
  const drageesNextBtn = document.getElementById('dragees-next');
  const drageesCount   = document.getElementById('dragees-count');
  const drageesNav     = drageesCount ? drageesCount.closest('.dragees-nav') : null;
  const drageesFilters = document.querySelectorAll('.dragees-filters .filter-btn');

  if (drageesAccord && drageesFilters.length) {
    const PAGE = 6;
    let activeFilter = 'all';
    let currentPage  = 0;
    const items = Array.from(drageesAccord.querySelectorAll('.accord-gallery__item'));

    const getVisible = () =>
      activeFilter === 'all' ? items : items.filter(el => el.dataset.category === activeFilter);

    const render = () => {
      const filtered   = getVisible();
      const totalPages = Math.ceil(filtered.length / PAGE);
      const pageItems  = filtered.slice(currentPage * PAGE, (currentPage + 1) * PAGE);

      items.forEach(el => { el.style.display = 'none'; });
      pageItems.forEach(el => { el.style.display = ''; });

      if (drageesPrevBtn) drageesPrevBtn.disabled = currentPage === 0;
      if (drageesNextBtn) drageesNextBtn.disabled = currentPage >= totalPages - 1;
      if (drageesNav)     drageesNav.style.visibility = totalPages > 1 ? 'visible' : 'hidden';
      if (drageesCount)   drageesCount.textContent = totalPages > 1 ? `${currentPage + 1} / ${totalPages}` : '';

      /* Reset scroll position on mobile carousel */
      if (drageesAccord) drageesAccord.scrollLeft = 0;
    };

    drageesFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        drageesFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        currentPage  = 0;
        render();
      });
    });

    drageesPrevBtn?.addEventListener('click', () => {
      if (currentPage > 0) { currentPage--; render(); }
    });
    drageesNextBtn?.addEventListener('click', () => {
      const total = Math.ceil(getVisible().length / PAGE);
      if (currentPage < total - 1) { currentPage++; render(); }
    });

    render();
  }

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

  /\* ---- 10. Newsletter forms ---- */
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
