/* ============================================================
   Bambouk Motors — Script principal
   Fonctionnalités : dark/light mode, hamburger, lightbox,
                     animations scroll, bouton WhatsApp flottant
   ============================================================ */

/* ── Attente chargement DOM ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Dark / Light mode ─────────────────────────────────
     Persisté via localStorage.
     Valeur stockée : 'dark' ou 'light'
  ─────────────────────────────────────────────────────────── */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  /* Applique le thème sauvegardé ou la préférence système */
  const savedTheme = localStorage.getItem('bm-theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('bm-theme', next);
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre');
    }
  }


  /* ── 2. Menu hamburger mobile ─────────────────────────────
     Bascule l'état open/closed du menu mobile
  ─────────────────────────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      /* Empêche le scroll du body quand le menu est ouvert */
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Ferme le menu au clic sur un lien */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('active')) {
          document.body.style.overflow = '';
        }
      });
    });
  }


  /* ── 3. Navbar : lien actif selon la page courante ────────
  ─────────────────────────────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === currentPath ||
        (currentPath === '' && href === 'index.html') ||
        (currentPath === 'index.html' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });


  /* ── 4. Animations au scroll (IntersectionObserver) ───────
     Les éléments avec .reveal, .reveal-left, .reveal-right
     deviennent visibles en entrant dans le viewport
  ─────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* On désobserve pour ne pas re-animer */
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }


  /* ── 5. Lightbox galerie ──────────────────────────────────
     Affiche les images en plein écran avec navigation prev/next
     Zéro dépendance externe
  ─────────────────────────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lb-img');
  const lbClose      = document.getElementById('lb-close');
  const lbPrev       = document.getElementById('lb-prev');
  const lbNext       = document.getElementById('lb-next');
  const lbCounter    = document.getElementById('lb-counter');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex   = 0;

  if (lightbox && galleryItems.length > 0) {

    /* Ouvre la lightbox à l'index donné */
    function openLightbox(index) {
      currentIndex = index;
      const img = galleryItems[index].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateCounter();
    }

    /* Ferme la lightbox */
    function closeLightbox() {
      lightbox.classList.remove('active');
      const ham = document.getElementById('hamburger');
      if (!ham || !ham.classList.contains('open')) {
        document.body.style.overflow = '';
      }
      lbImg.src = '';
    }

    /* Mise à jour du compteur */
    function updateCounter() {
      if (lbCounter) {
        lbCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
      }
    }

    /* Navigation */
    function showPrev() {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      lbImg.src = galleryItems[currentIndex].querySelector('img').src;
      lbImg.alt = galleryItems[currentIndex].querySelector('img').alt;
      updateCounter();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      lbImg.src = galleryItems[currentIndex].querySelector('img').src;
      lbImg.alt = galleryItems[currentIndex].querySelector('img').alt;
      updateCounter();
    }

    /* Liaisons événements */
    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);

    /* Clic sur le fond ferme la lightbox */
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    /* Navigation clavier */
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   showPrev();
      if (e.key === 'ArrowRight')  showNext();
    });

    /* Support swipe tactile (mobile) */
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? showNext() : showPrev();
      }
    }, { passive: true });
  }


  /* ── 6. Bouton WhatsApp flottant ──────────────────────────
     Injecté dynamiquement sur toutes les pages
  ─────────────────────────────────────────────────────────── */
  const waFloat = document.createElement('a');
  waFloat.href  = 'https://wa.me/221705335652';
  waFloat.target = '_blank';
  waFloat.rel    = 'noopener noreferrer';
  waFloat.className = 'whatsapp-float';
  waFloat.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
  waFloat.innerHTML = `
    <span class="whatsapp-pulse"></span>
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>`;
  document.body.appendChild(waFloat);


  /* ── 7. Navbar : effet de fond au scroll ──────────────────
  ─────────────────────────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.background = window.scrollY > 50
        ? (document.documentElement.getAttribute('data-theme') === 'light'
            ? 'rgba(245,244,240,0.97)'
            : 'rgba(10,10,10,0.97)')
        : '';
    }, { passive: true });
  }

});

