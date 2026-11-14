document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Sticky Header Scroll Effect
  const header = document.getElementById('main-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');

  function openMobileMenu() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawerBackdrop.classList.remove('hidden');
      setTimeout(() => {
        mobileDrawer.classList.remove('translate-x-full');
      }, 10);
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && mobileDrawerBackdrop) {
      mobileDrawer.classList.add('translate-x-full');
      setTimeout(() => {
        mobileDrawerBackdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileMenu);

  // FAQ Accordions
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        if (!isActive) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
  });

  // Modal Management
  const enquiryModal = document.getElementById('enquiryModal');
  const closeModalBtns = document.querySelectorAll('.close-modal-btn');
  const modalPackageInput = document.getElementById('modalPackageTitle');
  const modalDestinationInput = document.getElementById('modalDestination');
  const modalTitleSpan = document.getElementById('modalTargetTitle');

  window.openEnquiryModal = function(packageTitle = '', destination = '') {
    if (!enquiryModal) return;
    if (modalPackageInput) modalPackageInput.value = packageTitle;
    if (modalDestinationInput) modalDestinationInput.value = destination;
    if (modalTitleSpan) {
      modalTitleSpan.textContent = packageTitle || destination ? `Enquiry for ${packageTitle || destination}` : 'Plan Your Kashmir Trip';
    }
    enquiryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeEnquiryModal = function() {
    if (!enquiryModal) return;
    enquiryModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', window.closeEnquiryModal);
  });

  if (enquiryModal) {
    enquiryModal.addEventListener('click', (e) => {
      if (e.target === enquiryModal) {
        window.closeEnquiryModal();
      }
    });
  }

  // Bind clicks for all "enquire-now-btn" buttons
  document.querySelectorAll('.enquire-now-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pkg = btn.getAttribute('data-package') || '';
      const dest = btn.getAttribute('data-destination') || '';
      window.openEnquiryModal(pkg, dest);
    });
  });

  // Universal AJAX Enquiry Form Submitter
  const enquiryForms = document.querySelectorAll('.ajax-enquiry-form');
  enquiryForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

      const alertContainer = form.querySelector('.form-alert-container') || form;

      // Disable button & show spinner
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg> Sending Details...
        `;
      }

      // Collect form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => { data[key] = value; });

      try {
        const response = await fetch('/api/enquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Success State
          form.reset();
          
          // Show celebration/success message
          const successBox = document.createElement('div');
          successBox.className = 'bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-6 my-4 text-center shadow-sm animate-fade-in';
          successBox.innerHTML = `
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h4 class="font-serif text-xl font-bold text-emerald-950 mb-1">Enquiry Received Successfully!</h4>
            <p class="text-sm text-emerald-800 mb-2">${result.message}</p>
            <p class="text-xs text-emerald-700 bg-white/70 py-1.5 px-3 rounded-md inline-block font-mono">Reference ID: <strong>#${result.enquiryId}</strong></p>
            <div class="mt-4 pt-3 border-t border-emerald-200/60">
              <p class="text-xs text-emerald-800">Need instant reply? <a href="https://wa.me/916006725007?text=Hi%20City%20Line%20Tours,%20I%20just%20submitted%20enquiry%20%23${result.enquiryId}" class="underline font-semibold text-emerald-900 hover:text-emerald-700">Chat directly on WhatsApp (6006725007)</a></p>
            </div>
          `;

          // Replace form or append
          if (form.closest('#enquiryModal')) {
            form.innerHTML = '';
            form.appendChild(successBox);
          } else {
            form.parentNode.insertBefore(successBox, form);
            form.style.display = 'none';
          }
        } else {
          alert(result.message || 'Error sending enquiry. Please check your information.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      } catch (err) {
        console.error('Submission error:', err);
        alert('Network error while sending your enquiry. Please check your connection or contact us via WhatsApp.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  });

  // Scroll Reveal Animations via IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-scale, .reveal-stagger');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.08
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // CountUp Animated Numbers
  const countElements = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && countElements.length > 0) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = parseFloat(target.getAttribute('data-count-to') || '0');
          const prefix = target.getAttribute('data-count-prefix') || '';
          const suffix = target.getAttribute('data-count-suffix') || '';
          const isDecimal = String(target.getAttribute('data-count-to')).includes('.');
          const duration = 1600;
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeProgress * endValue;

            target.textContent = prefix + (isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)) + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              target.textContent = prefix + (isDecimal ? endValue.toFixed(1) : endValue) + suffix;
            }
          };

          requestAnimationFrame(updateCount);
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.2 });

    countElements.forEach(el => countObserver.observe(el));
  }

  // ========================================================
  // ABOUT PAGE VIDEO SHOWCASE SWITCHER
  // ========================================================
  const mainAboutVideo = document.getElementById('mainAboutVideo');
  const activeVideoTitle = document.getElementById('activeVideoTitle');
  const videoAudioToggleBtn = document.getElementById('videoAudioToggleBtn');
  const volumeIcon = document.getElementById('volumeIcon');
  const aboutThumbs = document.querySelectorAll('.about-video-thumb');

  if (mainAboutVideo && aboutThumbs.length > 0) {
    aboutThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const videoSrc = thumb.getAttribute('data-video');
        const title = thumb.getAttribute('data-title');
        if (!videoSrc) return;

        aboutThumbs.forEach(t => {
          t.classList.remove('border-brand-blue', 'active');
          t.classList.add('border-slate-200');
        });
        thumb.classList.add('border-brand-blue', 'active');
        thumb.classList.remove('border-slate-200');

        mainAboutVideo.style.opacity = '0.5';
        setTimeout(() => {
          mainAboutVideo.src = videoSrc;
          mainAboutVideo.play().catch(() => {});
          mainAboutVideo.style.opacity = '1';
          if (activeVideoTitle && title) activeVideoTitle.textContent = title;
        }, 150);
      });
    });

    if (videoAudioToggleBtn && volumeIcon) {
      videoAudioToggleBtn.addEventListener('click', () => {
        mainAboutVideo.muted = !mainAboutVideo.muted;
        if (mainAboutVideo.muted) {
          volumeIcon.setAttribute('data-lucide', 'volume-x');
        } else {
          volumeIcon.setAttribute('data-lucide', 'volume-2');
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }
  }

  // Interactive Route Explorer Switcher
  const routeData = {
    gulmarg: {
      title: 'Srinagar to Gulmarg',
      badge: 'Classic Route',
      desc: 'Passes through the rural countryside of Tangmarg with towering pine slopes, roadside apple orchards, and sweeping views of Apharwat Peak.',
      distance: '54 km',
      time: '~1.5 - 2 Hours',
      vehicle: 'Sedan / SUV / Innova',
      stay: '1 - 2 Nights in Gulmarg',
      pkg: 'Glimpse of Paradise (Srinagar & Gulmarg)',
      destText: 'Gulmarg (2,650m)',
      elevation: 'Altitude Gain: +1,065 m (Alpine Climb)',
      carPos: '60%'
    },
    pahalgam: {
      title: 'Srinagar to Pahalgam',
      badge: 'Romantic River Valley',
      desc: 'Follows the National Highway passing the historic Pampore saffron fields, Avantipur ancient temple ruins, and alongside the roaring turquoise Lidder River.',
      distance: '92 km',
      time: '~2.5 - 3 Hours',
      vehicle: 'Sedan / SUV / Innova',
      stay: '2 Nights in Pahalgam',
      pkg: 'Kashmir Classic Honeymoon',
      destText: 'Pahalgam (2,130m)',
      elevation: 'Altitude Gain: +545 m (Lidder Valley Route)',
      carPos: '75%'
    },
    sonamarg: {
      title: 'Srinagar to Sonamarg',
      badge: 'Meadow of Gold & Glaciers',
      desc: 'Scenic drive cutting through the dramatic Sindh Valley with foaming mountain rapids, walnut trees, and views of snow bridges leading to Thajiwas Glacier.',
      distance: '80 km',
      time: '~2 - 2.5 Hours',
      vehicle: 'Dedicated SUV / Innova',
      stay: '1 Night / Day Excursion',
      pkg: 'Magnificent Kashmir Grand Tour',
      destText: 'Sonamarg (2,730m)',
      elevation: 'Altitude Gain: +1,145 m (Glacier Valley Highway)',
      carPos: '70%'
    },
    doodhpathri: {
      title: 'Srinagar to Doodhpathri',
      badge: 'Virgin Pine Offbeat',
      desc: 'Untouched countryside drive through Budgam villages directly up to the milky foaming Shaliganga river and boundless alpine pastures.',
      distance: '42 km',
      time: '~1.5 Hours',
      vehicle: 'Sedan / SUV',
      stay: 'Day Excursion from Srinagar',
      pkg: 'Offbeat Kashmir & Hidden Valleys',
      destText: 'Doodhpathri (2,730m)',
      elevation: 'Altitude Gain: +1,145 m (Alpine Meadow Ascent)',
      carPos: '45%'
    },
    gurez: {
      title: 'Srinagar to Gurez Valley',
      badge: 'Frontier Mountain Pass',
      desc: 'Thrilling mountain expedition crossing the high Razdan Pass at 11,672 feet before descending into the pristine frontier of the Kishanganga river.',
      distance: '125 km',
      time: '~5 - 6 Hours',
      vehicle: '4x4 / High Clearance SUV',
      stay: '2 Nights in Dawar, Gurez',
      pkg: 'Enchanting Gurez Valley Expedition',
      destText: 'Gurez Valley (2,400m)',
      elevation: 'Altitude Gain: Razdan Pass Summit (3,557m)',
      carPos: '90%'
    }
  };

  const routeBtns = document.querySelectorAll('.route-btn');
  const routeDisplayCard = document.getElementById('routeDisplayCard');
  if (routeBtns.length > 0 && routeDisplayCard) {
    routeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-route');
        const data = routeData[key];
        if (!data) return;

        routeBtns.forEach(b => {
          b.className = 'route-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-white text-brand-navy hover:bg-brand-light border border-brand-border';
        });
        btn.className = 'route-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition bg-brand-blue text-white shadow-sm';

        routeDisplayCard.style.opacity = '0';
        routeDisplayCard.style.transform = 'translateY(6px)';

        setTimeout(() => {
          document.getElementById('routeTitle').textContent = data.title;
          document.getElementById('routeBadge').textContent = data.badge;
          document.getElementById('routeDesc').textContent = data.desc;
          document.getElementById('routeDistance').textContent = data.distance;
          document.getElementById('routeTime').textContent = data.time;
          document.getElementById('routeVehicle').textContent = data.vehicle;
          document.getElementById('routeStay').textContent = data.stay;

          const destEl = document.getElementById('routeDestText');
          const elevEl = document.getElementById('routeElevationBadge');
          const carIcon = document.getElementById('routeVehicleIcon');

          if (destEl && data.destText) destEl.textContent = data.destText;
          if (elevEl && data.elevation) elevEl.textContent = data.elevation;
          if (carIcon && data.carPos) carIcon.style.left = data.carPos;
          
          const enquireBtn = document.getElementById('routeEnquireBtn');
          if (enquireBtn) {
            enquireBtn.setAttribute('data-package', data.pkg);
          }

          routeDisplayCard.style.opacity = '1';
          routeDisplayCard.style.transform = 'translateY(0)';
          if (window.lucide) window.lucide.createIcons();
        }, 150);
      });
    });
  }

  // ========================================================
  // 1. TOP SCROLL PROGRESS BAR (THROTTLED)
  // ========================================================
  const progressBar = document.getElementById('scrollProgressBar');
  if (progressBar) {
    let progressTicking = false;
    window.addEventListener('scroll', () => {
      if (!progressTicking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          if (scrollHeight > 0) {
            const percent = Math.min((scrollTop / scrollHeight) * 100, 100);
            progressBar.style.width = percent + '%';
          }
          progressTicking = false;
        });
        progressTicking = true;
      }
    }, { passive: true });
  }

  // ========================================================
  // 2. KEN-BURNS MULTI-SCENE HERO SLIDER (OPTIMIZED ZERO-LAG)
  // ========================================================
  const heroSlides = document.querySelectorAll('.hero-slide');
  let currentHeroSlide = 0;
  let heroInterval = null;

  function setHeroSlide(index) {
    if (heroSlides.length === 0) return;
    currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach((slide, i) => {
      if (i === currentHeroSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  function startHeroTimer() {
    if (heroSlides.length <= 1) return;
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      setHeroSlide(currentHeroSlide + 1);
    }, 6500);
  }

  if (heroSlides.length > 0) {
    startHeroTimer();

    // Pause slider when browser tab is hidden to prevent catch-up jumps
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (heroInterval) clearInterval(heroInterval);
      } else {
        startHeroTimer();
      }
    });
  }

  // ========================================================
  // 3. REAL-TIME SRINAGAR WEATHER ENGINE (RAIN, SNOW, THUNDERSTORM, FOG, CLEAR)
  // ========================================================
  const snowCanvas = document.getElementById('snowCanvas');
  const heroSection = document.getElementById('heroSection');
  const snowStatusText = document.getElementById('snowStatusText');
  const heroWeatherIcon = document.getElementById('heroWeatherIcon');
  const heroWeatherPulseDot = document.getElementById('heroWeatherPulseDot');

  if (snowCanvas && heroSection) {
    const ctx = snowCanvas.getContext('2d');
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let isHeroInView = true;

    // Real-time state
    let activeMode = 'auto'; // 'auto' | 'rain' | 'thunderstorm' | 'snow' | 'fog' | 'clear' | 'off'
    let liveSrinagar = {
      code: parseInt(heroSection.getAttribute('data-srinagar-code') || '1', 10),
      temp: parseInt(heroSection.getAttribute('data-srinagar-temp') || '10', 10),
      cond: heroSection.getAttribute('data-srinagar-cond') || 'Mainly Clear',
      icon: heroSection.getAttribute('data-srinagar-icon') || 'sun'
    };

    function resolveWeatherType(code, condName) {
      const c = parseInt(code, 10);
      const name = (condName || '').toLowerCase();

      // Thunderstorm: WMO 95, 96, 99, 82 or condition includes thunder/lightning
      if ([95, 96, 99, 82].includes(c) || name.includes('thunder') || name.includes('lightning')) {
        return 'thunderstorm';
      }
      // Snow: WMO 71, 73, 75, 77, 85, 86, 56, 57, 66, 67 or condition includes snow/blizzard/sleet
      if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(c) || name.includes('snow') || name.includes('sleet') || name.includes('blizzard') || name.includes('flurry')) {
        return 'snow';
      }
      // Rain: WMO 51, 53, 55, 61, 63, 65, 80, 81 or condition includes rain/drizzle/shower
      if ([51, 53, 55, 61, 63, 65, 80, 81].includes(c) || name.includes('rain') || name.includes('drizzle') || name.includes('shower')) {
        return 'rain';
      }
      // Fog: WMO 45, 48 or condition includes fog/mist/haze
      if ([45, 48].includes(c) || name.includes('fog') || name.includes('mist') || name.includes('haze')) {
        return 'fog';
      }
      // Default / Clear / Partly Cloudy
      return 'clear';
    }

    function getEffectiveType() {
      if (activeMode === 'auto') {
        return resolveWeatherType(liveSrinagar.code, liveSrinagar.cond);
      }
      return activeMode;
    }

    function resizeCanvas() {
      if (!snowCanvas || !snowCanvas.parentElement) return;
      width = snowCanvas.width = snowCanvas.parentElement.clientWidth;
      height = snowCanvas.height = snowCanvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Particle Pools
    let rainDrops = [];
    let rainSplashes = [];
    let snowFlakes = [];
    let fogWisps = [];
    let clearMotes = [];

    // Lightning State for Thunderstorm
    let lightning = {
      active: false,
      flashAlpha: 0,
      bolts: [],
      nextStrikeTime: performance.now() + Math.random() * 4000 + 2000
    };

    function initRainParticles(count = 85) {
      rainDrops = [];
      rainSplashes = [];
      for (let i = 0; i < count; i++) {
        rainDrops.push({
          x: Math.random() * (width + 100) - 50,
          y: Math.random() * height,
          length: Math.random() * 16 + 14,
          speedY: Math.random() * 7 + 13,
          speedX: -2.2, // realistic mountain wind angle
          opacity: Math.random() * 0.4 + 0.35,
          width: Math.random() * 0.6 + 1.0
        });
      }
    }

    function initSnowParticles(count = 55) {
      snowFlakes = [];
      for (let i = 0; i < count; i++) {
        snowFlakes.push({
          x: Math.random() * (width || 800),
          y: Math.random() * (height || 600),
          r: Math.random() * 2.4 + 0.8,
          speedY: Math.random() * 0.8 + 0.4,
          speedX: Math.random() * 0.5 - 0.25,
          opacity: Math.random() * 0.6 + 0.25,
          swaySpeed: Math.random() * 0.02 + 0.008,
          swayAngle: Math.random() * Math.PI * 2
        });
      }
    }

    function initFogParticles(count = 18) {
      fogWisps = [];
      for (let i = 0; i < count; i++) {
        fogWisps.push({
          x: Math.random() * (width + 200) - 100,
          y: Math.random() * height * 0.8 + height * 0.1,
          r: Math.random() * 100 + 90,
          speedX: Math.random() * 0.35 + 0.15,
          opacity: Math.random() * 0.05 + 0.03
        });
      }
    }

    function initClearParticles(count = 32) {
      clearMotes = [];
      for (let i = 0; i < count; i++) {
        clearMotes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.8 + 0.6,
          speedY: -(Math.random() * 0.4 + 0.1),
          speedX: Math.random() * 0.4 - 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseAngle: Math.random() * Math.PI * 2
        });
      }
    }

    function generateLightningBolt(startX, startY, endY) {
      const bolt = [];
      let curX = startX;
      let curY = startY;
      bolt.push({ x: curX, y: curY });

      while (curY < endY) {
        curY += Math.random() * 28 + 14;
        curX += (Math.random() - 0.5) * 45;
        bolt.push({ x: curX, y: curY });

        // Occasional branch
        if (Math.random() < 0.25 && bolt.length < 12) {
          const branch = [];
          let bX = curX;
          let bY = curY;
          for (let j = 0; j < 4; j++) {
            bY += Math.random() * 20 + 10;
            bX += (Math.random() - 0.3) * 35;
            branch.push({ x: bX, y: bY });
          }
          bolt.branch = branch;
        }
      }
      return bolt;
    }

    function triggerLightning() {
      lightning.active = true;
      lightning.flashAlpha = Math.random() * 0.35 + 0.45;
      const startX = Math.random() * (width * 0.6) + width * 0.2;
      lightning.bolts = [
        generateLightningBolt(startX, 0, height * (Math.random() * 0.4 + 0.5))
      ];
      lightning.nextStrikeTime = performance.now() + Math.random() * 5000 + 3500;
    }

    function renderActiveWeather(timestamp) {
      if (!isHeroInView) {
        animationFrameId = null;
        return;
      }

      const type = getEffectiveType();
      if (type === 'off') {
        ctx.clearRect(0, 0, width, height);
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------
      // A. SNOW EFFECT
      // ----------------------------------------------------
      if (type === 'snow') {
        if (snowFlakes.length === 0) initSnowParticles();

        snowFlakes.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();

          p.swayAngle += p.swaySpeed;
          p.x += Math.sin(p.swayAngle) * 0.5 + p.speedX;
          p.y += p.speedY;

          if (p.y > height + 5) {
            p.y = -5;
            p.x = Math.random() * width;
          }
          if (p.x > width + 5) p.x = -5;
          if (p.x < -5) p.x = width + 5;
        });
      }

      // ----------------------------------------------------
      // B. RAIN EFFECT
      // ----------------------------------------------------
      else if (type === 'rain') {
        if (rainDrops.length === 0) initRainParticles(85);

        ctx.lineWidth = 1.2;
        rainDrops.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * (p.length / 10), p.y + p.length);
          ctx.strokeStyle = `rgba(186, 224, 255, ${p.opacity})`;
          ctx.stroke();

          p.x += p.speedX;
          p.y += p.speedY;

          // Splash on hitting bottom ground
          if (p.y >= height - 20) {
            if (rainSplashes.length < 25 && Math.random() < 0.4) {
              rainSplashes.push({
                x: p.x,
                y: height - Math.random() * 15,
                radius: 1,
                maxRadius: Math.random() * 8 + 6,
                opacity: 0.6
              });
            }
            p.y = -p.length;
            p.x = Math.random() * (width + 100) - 50;
          }
        });

        // Draw and update splashes
        for (let i = rainSplashes.length - 1; i >= 0; i--) {
          const sp = rainSplashes[i];
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 1.5, sp.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200, 230, 255, ${sp.opacity})`;
          ctx.stroke();

          sp.radius += 0.7;
          sp.opacity -= 0.045;
          if (sp.opacity <= 0 || sp.radius >= sp.maxRadius) {
            rainSplashes.splice(i, 1);
          }
        }
      }

      // ----------------------------------------------------
      // C. THUNDERSTORM EFFECT (HEAVY RAIN + LIGHTNING)
      // ----------------------------------------------------
      else if (type === 'thunderstorm') {
        if (rainDrops.length === 0) initRainParticles(115);

        // Thunderstorm rain is heavier & faster
        ctx.lineWidth = 1.4;
        rainDrops.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.8, p.y + p.length * 1.2);
          ctx.strokeStyle = `rgba(195, 225, 255, ${p.opacity * 1.1})`;
          ctx.stroke();

          p.x += p.speedX * 1.3;
          p.y += p.speedY * 1.25;

          if (p.y >= height - 20) {
            if (rainSplashes.length < 35 && Math.random() < 0.5) {
              rainSplashes.push({
                x: p.x,
                y: height - Math.random() * 18,
                radius: 1,
                maxRadius: Math.random() * 11 + 8,
                opacity: 0.75
              });
            }
            p.y = -p.length * 1.2;
            p.x = Math.random() * (width + 120) - 60;
          }
        });

        // Splashes
        for (let i = rainSplashes.length - 1; i >= 0; i--) {
          const sp = rainSplashes[i];
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.radius * 1.6, sp.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220, 240, 255, ${sp.opacity})`;
          ctx.stroke();

          sp.radius += 0.9;
          sp.opacity -= 0.05;
          if (sp.opacity <= 0 || sp.radius >= sp.maxRadius) {
            rainSplashes.splice(i, 1);
          }
        }

        // Lightning strike trigger
        if (timestamp >= lightning.nextStrikeTime) {
          triggerLightning();
        }

        // Draw Lightning Flash & Bolt
        if (lightning.active) {
          // Ambient sky illumination
          ctx.fillStyle = `rgba(220, 235, 255, ${lightning.flashAlpha})`;
          ctx.fillRect(0, 0, width, height);

          // Draw jagged bolt
          if (lightning.bolts && lightning.bolts.length > 0) {
            ctx.save();
            ctx.shadowColor = '#60a5fa';
            ctx.shadowBlur = 16;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.2;

            lightning.bolts.forEach(bolt => {
              ctx.beginPath();
              bolt.forEach((pt, idx) => {
                if (idx === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              });
              ctx.stroke();

              // Branch
              if (bolt.branch) {
                ctx.beginPath();
                ctx.lineWidth = 1.2;
                bolt.branch.forEach((bpt, bidx) => {
                  if (bidx === 0) ctx.moveTo(bpt.x, bpt.y);
                  else ctx.lineTo(bpt.x, bpt.y);
                });
                ctx.stroke();
              }
            });
            ctx.restore();
          }

          // Fade out lightning flash
          lightning.flashAlpha *= 0.82;
          if (lightning.flashAlpha < 0.02) {
            lightning.active = false;
            lightning.flashAlpha = 0;
            lightning.bolts = [];
          }
        }
      }

      // ----------------------------------------------------
      // D. FOG / MOUNTAIN MIST EFFECT
      // ----------------------------------------------------
      else if (type === 'fog') {
        if (fogWisps.length === 0) initFogParticles(18);

        fogWisps.forEach(f => {
          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
          grad.addColorStop(0, `rgba(235, 245, 255, ${f.opacity})`);
          grad.addColorStop(0.6, `rgba(225, 240, 255, ${f.opacity * 0.5})`);
          grad.addColorStop(1, 'rgba(220, 235, 255, 0)');

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          f.x += f.speedX;
          if (f.x - f.r > width) {
            f.x = -f.r;
            f.y = Math.random() * height * 0.8 + height * 0.1;
          }
        });
      }

      // ----------------------------------------------------
      // E. CLEAR SKIES / SHIMMERING MOUNTAIN SUNSHINE
      // ----------------------------------------------------
      else if (type === 'clear') {
        if (clearMotes.length === 0) initClearParticles(32);

        clearMotes.forEach(m => {
          m.pulseAngle += m.pulseSpeed;
          const currentOpacity = m.opacity * (0.65 + Math.sin(m.pulseAngle) * 0.35);

          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(254, 243, 199, ${currentOpacity})`;
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          m.x += m.speedX;
          m.y += m.speedY;

          if (m.y < -5) {
            m.y = height + 5;
            m.x = Math.random() * width;
          }
          if (m.x > width + 5) m.x = -5;
          if (m.x < -5) m.x = width + 5;
        });
      }

      animationFrameId = requestAnimationFrame(renderActiveWeather);
    }

    function switchWeatherMode(newMode) {
      activeMode = newMode;
      // Reset particle caches
      rainDrops = [];
      rainSplashes = [];
      snowFlakes = [];
      fogWisps = [];
      clearMotes = [];
      lightning.active = false;

      // Update pill UI
      updateWeatherPillUI();

      // Ensure render loop is active if in view
      if (activeMode !== 'off' && isHeroInView) {
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(renderActiveWeather);
        }
      } else if (activeMode === 'off') {
        ctx.clearRect(0, 0, width, height);
      }
    }

    function updateWeatherPillUI() {
      const type = getEffectiveType();

      // Update text and icon
      if (snowStatusText) {
        snowStatusText.textContent = `Srinagar: ${liveSrinagar.cond} (${liveSrinagar.temp}°C)`;
      }

      if (heroWeatherPulseDot) {
        heroWeatherPulseDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-cyan-400';
        const ping = heroWeatherPulseDot.previousElementSibling;
        if (ping) ping.style.display = '';
      }

      // Update icon dynamically
      if (heroWeatherIcon) {
        let iconName = 'sun';
        let iconColor = 'text-amber-300';

        if (type === 'snow') {
          iconName = 'snowflake';
          iconColor = 'text-cyan-200';
        } else if (type === 'rain') {
          iconName = 'cloud-rain';
          iconColor = 'text-cyan-300';
        } else if (type === 'thunderstorm') {
          iconName = 'cloud-lightning';
          iconColor = 'text-amber-400';
        } else if (type === 'fog') {
          iconName = 'cloud-fog';
          iconColor = 'text-slate-300';
        }

        heroWeatherIcon.setAttribute('data-lucide', iconName);
        heroWeatherIcon.className = `w-3.5 h-3.5 ${iconColor}`;
        if (window.lucide) window.lucide.createIcons();
      }
    }

    // Pause canvas animation when hero is scrolled off screen to save GPU/CPU cycles
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroInView = entry.isIntersecting;
          if (isHeroInView && activeMode !== 'off') {
            if (!animationFrameId) {
              animationFrameId = requestAnimationFrame(renderActiveWeather);
            }
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroSection);
    } else {
      animationFrameId = requestAnimationFrame(renderActiveWeather);
    }

    // Pause canvas when browser tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (isHeroInView && activeMode !== 'off') {
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(renderActiveWeather);
        }
      }
    });

    // Synchronize live Srinagar weather payload with hero pill & canvas animation
    window.__syncHeroWeatherWithPayload = function(srinagarData) {
      if (!srinagarData || !srinagarData.current) return;
      const curr = srinagarData.current;
      liveSrinagar.code = curr.weatherCode !== undefined ? curr.weatherCode : 0;
      liveSrinagar.temp = curr.temperature !== undefined ? curr.temperature : 9;
      liveSrinagar.cond = curr.condition || 'Clear Skies';
      liveSrinagar.icon = curr.icon || 'sun';

      if (activeMode === 'auto') {
        switchWeatherMode('auto');
      } else {
        updateWeatherPillUI();
      }
    };

    // Initial trigger & 10-minute background sync
    updateWeatherPillUI();
    animationFrameId = requestAnimationFrame(renderActiveWeather);
  }

  // ========================================================
  // 4. 3D PERSPECTIVE TILT ON TOUR CARDS (CACHED BOUNDS)
  // ========================================================
  // Check if non-touch desktop
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) {
    const tiltCards = document.querySelectorAll('.card-hover');
    tiltCards.forEach(card => {
      // Add sheen element if not present
      if (!card.querySelector('.card-sheen')) {
        const sheen = document.createElement('div');
        sheen.className = 'card-sheen';
        card.appendChild(sheen);
      }

      let cardRect = null;
      card.addEventListener('mouseenter', () => {
        cardRect = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        if (!cardRect) cardRect = card.getBoundingClientRect();
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;

        const centerX = cardRect.width / 2;
        const centerY = cardRect.height / 2;

        const rotateX = ((y - centerY) / (centerY || 1)) * -5;
        const rotateY = ((x - centerX) / (centerX || 1)) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;

        const sheen = card.querySelector('.card-sheen');
        if (sheen) {
          sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        cardRect = null;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  // ========================================================
  // 5. ANIMATED DAY-BY-DAY ITINERARY TIMELINE (THROTTLED)
  // ========================================================
  const itineraryTimeline = document.getElementById('itineraryTimeline');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineNodes = document.querySelectorAll('.timeline-node');

  if (itineraryTimeline && timelineNodes.length > 0) {
    let timelineTicking = false;
    function updateTimelineOnScroll() {
      if (!timelineTicking) {
        requestAnimationFrame(() => {
          const rect = itineraryTimeline.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Calculate progress of timeline in view
          const visibleDistance = (windowHeight * 0.65) - rect.top;
          const progressPercent = Math.max(0, Math.min((visibleDistance / (rect.height || 1)) * 100, 100));

          if (timelineProgress) {
            timelineProgress.style.height = progressPercent + '%';
          }

          timelineNodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            if (nodeRect.top < windowHeight * 0.7) {
              node.classList.add('active');
            } else {
              node.classList.remove('active');
            }
          });
          timelineTicking = false;
        });
        timelineTicking = true;
      }
    }

    window.addEventListener('scroll', updateTimelineOnScroll, { passive: true });
    updateTimelineOnScroll();
  }

  // ========================================================
  // 6. INTERACTIVE MONTH-BY-MONTH KASHMIR TRAVEL PLANNER
  // ========================================================
  const monthSelectorBar = document.getElementById('monthSelectorBar');
  const monthDisplayCard = document.getElementById('monthDisplayCard');

  const monthGuideData = [
    {
      month: 'January',
      short: 'Jan',
      season: 'Winter',
      seasonBadge: 'Peak Powder Snow',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      tagline: 'Deep winter wonderland blanketed in thick powder snow',
      temp: '-2°C to 7°C',
      climate: 'Frequent Snowfall • Frozen Waterfalls • Crisp Mountain Sun',
      highlights: [
        'Skiing and snowboarding at Apharwat Peak, Gulmarg (Phase 2)',
        'Romantic winter Shikara ride across mist-veiled Dal Lake',
        'Cozy traditional Kangri and wood-fire Bukhari in luxury houseboats',
        'Savoring authentic Kashmiri Harissa for breakfast'
      ],
      attire: 'Heavy woollens, thermal top & bottom innerwear, waterproof down jacket, snow gumboots, and insulated gloves.',
      snowStatus: 'Guaranteed Deep Snow in Srinagar, Gulmarg, and Pahalgam',
      packageQuery: 'Kashmir Winter Snow & Skiing Tour'
    },
    {
      month: 'February',
      short: 'Feb',
      season: 'Winter',
      seasonBadge: 'Alpine Snow Sports',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      tagline: 'Glistening snow-covered valleys with pleasant sunny afternoons',
      temp: '0°C to 10°C',
      climate: 'Thick Snow Blanket • Bright Blue Skies • Crisp Mountain Air',
      highlights: [
        'Gulmarg Gondola rides over snow-laden pine forest valleys',
        'Snowmobiling and sledge rides in Betaab Valley, Pahalgam',
        'Snow photography and honeymoon couple portraits in Gulmarg',
        'Visiting frozen Drung waterfall with dramatic ice stalactites'
      ],
      attire: 'Merino wool thermals, fleece layers, waterproof snow jacket, snow boots, and UV protection sunglasses.',
      snowStatus: 'Peak Snow Season across Gulmarg, Pahalgam, and Sonamarg',
      packageQuery: 'Kashmir Romantic Winter Honeymoon'
    },
    {
      month: 'March',
      short: 'Mar',
      season: 'Spring',
      seasonBadge: 'Almond Blossoms',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
      tagline: 'Valley thaw begins with delicate pink and white almond blossoms',
      temp: '5°C to 15°C',
      climate: 'Mild Sun • Spring Thaw • Fresh Mountain Streams',
      highlights: [
        'Badamwari Garden in full bloom with thousands of almond trees',
        'First outdoor Shikara cruises with blooming shores on Dal Lake',
        'Snow still abundant at Gulmarg Gondola Phase 2 while valleys bloom',
        'Fresh mountain trout dining by the gushing Lidder River'
      ],
      attire: 'Medium woollens, light sweaters, evening windbreaker jacket, and comfortable sneakers.',
      snowStatus: 'Snow active on Gulmarg Gondola & Sonamarg; Valley floor greening',
      packageQuery: 'Kashmir Spring Blossoms Tour'
    },
    {
      month: 'April',
      short: 'Apr',
      season: 'Spring',
      seasonBadge: 'Tulip Festival Season',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      tagline: 'Asia’s largest Tulip Garden opens with over 1.5 million blooms',
      temp: '7°C to 20°C',
      climate: 'Vibrant Blooms • Pleasant Mountain Sun • Fresh Green Slopes',
      highlights: [
        'Indira Gandhi Memorial Tulip Garden in peak colorful bloom',
        'Brilliant yellow mustard flower carpets across Pulwama valley',
        'Centuries-old Chinar trees sprouting tender green leaves',
        'Shalimar Bagh & Nishat Mughal terraced water fountains active'
      ],
      attire: 'Light woollens or cardigans for evenings, comfortable cottons for day, and walking shoes.',
      snowStatus: 'Snow available at Apharwat Peak Gulmarg (Phase 2)',
      packageQuery: 'Kashmir Tulip Special Holiday'
    },
    {
      month: 'May',
      short: 'May',
      season: 'Spring / Summer',
      seasonBadge: 'Lush Green Meadows',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tagline: 'Velvet green valleys, gushing rivers, and snow-capped horizons',
      temp: '11°C to 24°C',
      climate: 'Warm Gentle Sunshine • Clear Blue Skies • Cool River Breeze',
      highlights: [
        'Rolling green meadows and pine forests of Doodhpathri & Yusmarg',
        'Pony rides to Baisaran (Mini Switzerland) in Pahalgam',
        'River rafting on the roaring Lidder and Sindh rivers',
        'Shopping for authentic Pashmina, hand-knotted rugs, and walnut wood'
      ],
      attire: 'Breathable daytime cottons, sunglasses, light jacket or shawl for mountain night temperatures.',
      snowStatus: 'Glacier snow accessible in Sonamarg (Thajiwas) & Gulmarg Phase 2',
      packageQuery: 'Kashmir Classic Family Holiday'
    },
    {
      month: 'June',
      short: 'Jun',
      season: 'Summer',
      seasonBadge: 'River Rafting & Glaciers',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tagline: 'The ultimate escape from mainland summer heat into alpine serenity',
      temp: '15°C to 29°C',
      climate: 'Pleasant Summer • Cool High Valleys • Starlit Nights',
      highlights: [
        'White-water river rafting in Sonamarg and Pahalgam',
        'Trekking or pony ride to Thajiwas Glacier in Sonamarg',
        'Sunset Shikara rides with floating market vegetable shopping',
        'Campfire and stargazing in pristine Aru Valley'
      ],
      attire: 'Summer cottons, sun hat, UV sunglasses, sunscreen SPF 50+, and a light evening sweatshirt.',
      snowStatus: 'Permanent glaciers at Thajiwas Sonamarg & Apharwat Peak',
      packageQuery: 'Kashmir Summer Escape'
    },
    {
      month: 'July',
      short: 'Jul',
      season: 'Summer',
      seasonBadge: 'Wildflower Meadows',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      tagline: 'Wild alpine flowers bloom across high-altitude mountain slopes',
      temp: '17°C to 30°C',
      climate: 'Warm Afternoons • Occasional Mountain Showers • Green Valleys',
      highlights: [
        'Lush alpine wildflower meadows in high meadows above Gulmarg',
        'Visiting the ancient Martand Sun Temple and Awantipora ruins',
        'Fresh Kashmiri cherries, apricots, and plums right from trees',
        'Pleasant evenings on open houseboat sun-decks with Wazwan dining'
      ],
      attire: 'Quick-dry light clothes, sturdy walking shoes, compact travel umbrella or rain jacket.',
      snowStatus: 'Snow restricted to high glaciers; perfect green landscape',
      packageQuery: 'Kashmir Alpine Meadow Tour'
    },
    {
      month: 'August',
      short: 'Aug',
      season: 'Summer / Monsoon',
      seasonBadge: 'Frontier Valleys',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      tagline: 'Clear skies, lush pine canopies, and offbeat frontier valley roads',
      temp: '16°C to 28°C',
      climate: 'Moderate Mountain Air • Misty Pine Forests • Serene Lakes',
      highlights: [
        'Offbeat exploration of Gurez Valley along the Kishanganga river',
        'Sinthan Top panoramic 360-degree mountain pass drive',
        'Plentiful fresh fruit harvest: apples, pears, and walnuts begin ripening',
        'Quiet, relaxed exploration with fewer crowds'
      ],
      attire: 'Comfortable cottons, waterproof light jacket, sports sneakers, and light sweater for passes.',
      snowStatus: 'High pass snow at Sinthan Top & Razdan Pass',
      packageQuery: 'Offbeat Kashmir & Gurez Expedition'
    },
    {
      month: 'September',
      short: 'Sep',
      season: 'Autumn',
      seasonBadge: 'Apple Harvest Season',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      tagline: 'Crisp mountain breezes and orchards laden with ruby-red apples',
      temp: '12°C to 25°C',
      climate: 'Zero Humidity • Deep Blue Skies • Crystal Clear Views',
      highlights: [
        'Plucking crisp apples directly in Sopore and Shopian orchards',
        'Best time for mountain landscape photography with clear horizons',
        'First subtle golden hues appearing on majestic Chinar leaves',
        'Trout fishing in Lidder and scenic camping in Doodhpathri'
      ],
      attire: 'Light layers, long-sleeve cottons, light jacket for morning and evening chill.',
      snowStatus: 'Crisp high mountains; snow usually absent on lower passes',
      packageQuery: 'Kashmir Autumn Splendour Tour'
    },
    {
      month: 'October',
      short: 'Oct',
      season: 'Autumn',
      seasonBadge: 'Golden Chinar & Saffron',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      tagline: 'Kashmir turns into pure gold with crimson Chinar leaves & purple saffron',
      temp: '6°C to 20°C',
      climate: 'Golden Autumn Sunshine • Crisp Chilly Mornings & Nights',
      highlights: [
        'Walking over rustling golden-red Chinar leaves in Naseem Bagh',
        'Purple saffron (Kesar) flower harvesting in Pampore fields',
        'Sipping hot saffron Kahwa tea overlooking golden Char Chinar',
        'Breathtaking autumn photography with mirror reflections on Dal Lake'
      ],
      attire: 'Medium woollens, fleece jacket, warm scarves/shawls, and closed walking shoes.',
      snowStatus: 'Early snowfall possible on Apharwat peaks by late October',
      packageQuery: 'Golden Autumn & Saffron Tour'
    },
    {
      month: 'November',
      short: 'Nov',
      season: 'Late Autumn / Winter',
      seasonBadge: 'First Mountain Frost',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tagline: 'Frosty mountain mornings, peaceful lakes, and snow on high peaks',
      temp: '2°C to 14°C',
      climate: 'Chilly Air • Clear Starlit Nights • Early Mountain Snow',
      highlights: [
        'First snowfalls dusting Apharwat Peak Gulmarg and Zojila Pass',
        'Peaceful, uncrowded sightseeing with discounted luxury stays',
        'Warm traditional Wazwan feasts and authentic Kashmiri hospitality',
        'Roasted Kashmiri chestnuts and dry fruits shopping in Lal Chowk'
      ],
      attire: 'Thermal inners, heavy woollen sweaters, windproof coat, gloves, and warm socks.',
      snowStatus: 'Snow arrives on high mountain summits and Gulmarg slopes',
      packageQuery: 'Kashmir Early Winter Tour'
    },
    {
      month: 'December',
      short: 'Dec',
      season: 'Winter',
      seasonBadge: 'Chilai Kalan Whiteout',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      tagline: 'The onset of Chilai Kalan: pure white snow covering valleys & pine forests',
      temp: '-3°C to 8°C',
      climate: 'Sub-Zero Nights • Magical Snowfalls • Winter Wonderland',
      highlights: [
        'White Christmas and New Year celebrations in snow-clad Gulmarg',
        'Gondola skiing season officially opens on world-class powder slopes',
        'Frozen snow on pine boughs and fairytale wooden cottages',
        'Traditional Bukhari-heated luxury stays in Pahalgam and Srinagar'
      ],
      attire: 'Heavy-duty thermals, down jacket/parka, waterproof snow boots, woollen beanies, and insulated gloves.',
      snowStatus: 'Widespread snow across Gulmarg, Sonamarg, Pahalgam, and Srinagar',
      packageQuery: 'Kashmir Christmas & New Year Snow Tour'
    }
  ];

  if (monthSelectorBar && monthDisplayCard) {
    let activeMonthIndex = 3; // Default to April (Tulip season!)

    function renderMonthButtons() {
      monthSelectorBar.innerHTML = '';
      monthGuideData.forEach((m, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isActive = idx === activeMonthIndex;
        btn.className = `month-btn shrink-0 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200 flex flex-col items-center min-w-[70px] ${
          isActive 
            ? 'bg-brand-blue text-white shadow-md scale-105' 
            : 'bg-brand-offwhite text-brand-navy hover:bg-brand-light border border-brand-border'
        }`;
        btn.innerHTML = `
          <span class="text-sm font-bold">${m.short}</span>
          <span class="text-[10px] opacity-80 uppercase tracking-tighter">${m.season.split('/')[0]}</span>
        `;
        btn.addEventListener('click', () => {
          activeMonthIndex = idx;
          renderMonthButtons();
          renderMonthDetails(idx);
        });
        monthSelectorBar.appendChild(btn);
      });
    }

    function renderMonthDetails(index) {
      const data = monthGuideData[index];
      if (!data) return;

      monthDisplayCard.style.opacity = '0';
      monthDisplayCard.style.transform = 'translateY(6px)';

      setTimeout(() => {
        const waText = encodeURIComponent(`Hi City Line Tours, I am planning a Kashmir trip in ${data.month} for the ${data.seasonBadge}. Please share recommended packages and customized quotation!`);
        
        monthDisplayCard.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <!-- Left 2 Cols: Main Info -->
            <div class="lg:col-span-2 space-y-5">
              
              <div class="flex flex-wrap items-center gap-2.5">
                <span class="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${data.badgeColor}">
                  ${data.seasonBadge}
                </span>
                <span class="text-xs bg-white text-brand-navy font-semibold px-3 py-1 rounded-full border border-brand-border">
                  ${data.season}
                </span>
              </div>

              <div>
                <h3 class="font-serif text-2xl sm:text-3xl font-bold text-brand-navy">
                  ${data.month} in Kashmir
                </h3>
                <p class="text-sm text-brand-blue font-medium mt-1">
                  "${data.tagline}"
                </p>
              </div>

              <!-- Quick Metrics Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-sm flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <i data-lucide="thermometer" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <span class="text-[11px] text-brand-muted uppercase block">Temperature Range</span>
                    <strong class="text-sm font-bold text-brand-navy">${data.temp}</strong>
                  </div>
                </div>

                <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-sm flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-xl bg-sky-50 text-brand-blue flex items-center justify-center shrink-0">
                    <i data-lucide="cloud-sun" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <span class="text-[11px] text-brand-muted uppercase block">Mountain Climate</span>
                    <strong class="text-xs font-bold text-brand-navy">${data.climate.split('•')[0]}</strong>
                  </div>
                </div>
              </div>

              <!-- Highlights -->
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-brand-navy mb-3 flex items-center space-x-1.5">
                  <i data-lucide="sparkles" class="w-4 h-4 text-brand-blue"></i>
                  <span>Top Experiences in ${data.month}:</span>
                </h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  ${data.highlights.map(h => `
                    <div class="flex items-start space-x-2 text-xs text-brand-navy bg-white/70 p-2.5 rounded-xl border border-slate-100">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0"></i>
                      <span>${h}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Attire & Packing -->
              <div class="bg-blue-50/70 border border-blue-100 rounded-2xl p-4">
                <div class="flex items-center space-x-2 text-brand-blue font-bold text-xs uppercase tracking-wider mb-1">
                  <i data-lucide="backpack" class="w-4 h-4"></i>
                  <span>What to Pack & Wear in ${data.month}</span>
                </div>
                <p class="text-xs text-slate-700 leading-relaxed">
                  ${data.attire}
                </p>
              </div>

            </div>

            <!-- Right Col: Snow Status & Booking CTA Card -->
            <div class="bg-white rounded-2xl border border-brand-border p-6 shadow-md space-y-5 lg:sticky lg:top-28">
              
              <div>
                <span class="text-[11px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Snow & Alpine Conditions</span>
                <div class="p-3 bg-brand-light/50 rounded-xl border border-brand-border text-xs font-semibold text-brand-navy flex items-start space-x-2">
                  <i data-lucide="snowflake" class="w-4 h-4 text-sky-500 shrink-0 mt-0.5"></i>
                  <span>${data.snowStatus}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-100 space-y-3">
                <span class="text-[11px] font-bold text-brand-muted uppercase tracking-wider block">Plan Your ${data.month} Vacation</span>
                
                <a href="https://wa.me/916006725007?text=${waText}" target="_blank" class="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-sm">
                  <i data-lucide="message-circle" class="w-4 h-4"></i>
                  <span>WhatsApp Enquiry for ${data.month}</span>
                </a>

                <a href="/packages" class="w-full btn-primary py-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2">
                  <span>Browse Tour Packages</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>

                <div class="text-[11px] text-center text-brand-muted flex items-center justify-center space-x-1 pt-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  <span>Free Itinerary Consultation with Local Experts</span>
                </div>
              </div>

            </div>

          </div>
        `;

        monthDisplayCard.style.opacity = '1';
        monthDisplayCard.style.transform = 'translateY(0)';
        if (window.lucide) window.lucide.createIcons();
      }, 150);
    }

    renderMonthButtons();
    renderMonthDetails(activeMonthIndex);
  }

  // ========================================================
  // 7. INTERACTIVE KASHMIR TRAVEL ADVISORY & PACKING CHECKLIST
  // ========================================================
  const checklistGrid = document.getElementById('checklistItemsGrid');
  const checklistTabs = document.getElementById('checklistTabs');
  const packProgressBar = document.getElementById('packProgressBar');
  const packProgressText = document.getElementById('packProgressText');
  const checkAllBtn = document.getElementById('checkAllBtn');
  const resetCheckBtn = document.getElementById('resetCheckBtn');

  const checklistData = [
    {
      id: 'chk-postpaid-sim',
      category: 'advisory',
      title: 'Postpaid Mobile SIM Card (Airtel / Jio / BSNL)',
      desc: 'Critical: Prepaid SIM cards from other Indian states do not work in J&K due to telecom regulations.',
      badge: 'Mandatory',
      badgeClass: 'bg-red-100 text-red-800'
    },
    {
      id: 'chk-govt-id',
      category: 'advisory',
      title: 'Original Government Photo ID',
      desc: 'Aadhaar, Passport, or Voter ID required for hotel check-ins, airport security, and Gondola boarding.',
      badge: 'Mandatory',
      badgeClass: 'bg-red-100 text-red-800'
    },
    {
      id: 'chk-gondola-tickets',
      category: 'advisory',
      title: 'Gulmarg Gondola Phase 1 & 2 Tickets',
      desc: 'Book tickets 10-15 days in advance on the official J&K cable car portal to avoid sold-out dates.',
      badge: 'Important',
      badgeClass: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'chk-powerbank',
      category: 'advisory',
      title: 'High-Capacity Power Bank (10,000+ mAh)',
      desc: 'Cold mountain temperatures drain phone batteries up to 40% faster during outdoor sightseeing.',
      badge: 'Recommended',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'chk-cash-atm',
      category: 'advisory',
      title: 'Physical Cash (Currency Notes)',
      desc: 'Carry cash for pony rides, local sledge drivers, and remote valleys where UPI is intermittent.',
      badge: 'Recommended',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'chk-thermals',
      category: 'winter',
      title: 'Thermal Innerwear (Top & Bottom Sets)',
      desc: 'Merino wool or warm synthetic thermals are essential for cold mountain nights and snow zones.',
      badge: 'Winter Essential',
      badgeClass: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'chk-snow-jacket',
      category: 'winter',
      title: 'Waterproof Snow Jacket / Parka',
      desc: 'Wind-resistant and water-repellent outer shell for snow sports and Gulmarg summits.',
      badge: 'Winter Essential',
      badgeClass: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'chk-snow-boots',
      category: 'winter',
      title: 'Waterproof Boots with Rubber Grip',
      desc: 'Keeps feet warm and prevents slipping on icy mountain paths and frozen snow.',
      badge: 'Winter Essential',
      badgeClass: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'chk-gloves-socks',
      category: 'winter',
      title: 'Woollen Gloves & 3+ Pairs Thick Socks',
      desc: 'Protects fingers and toes from mountain frost; insulated fleece-lined gloves are best.',
      badge: 'Winter Essential',
      badgeClass: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'chk-beanie',
      category: 'winter',
      title: 'Woollen Beanie / Monkey Cap & Muffler',
      desc: 'Covers ears and forehead against chilling mountain winds and evening breezes.',
      badge: 'Winter Essential',
      badgeClass: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'chk-cold-cream',
      category: 'winter',
      title: 'Cold Cream, Lip Balm & Heavy Moisturiser',
      desc: 'Prevents dry mountain skin and chapped lips in sub-zero alpine air.',
      badge: 'Personal Care',
      badgeClass: 'bg-slate-100 text-slate-800'
    },
    {
      id: 'chk-cottons',
      category: 'summer',
      title: 'Breathable Cotton Shirts & Light Trousers',
      desc: 'Comfortable daytime wear for exploring Mughal Gardens, old Srinagar, and sunny meadows.',
      badge: 'Summer Essential',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'chk-windbreaker',
      category: 'summer',
      title: 'Light Fleece Jacket or Windcheater',
      desc: 'Even in May to July, evenings in Pahalgam and Gulmarg drop to 12°C-15°C.',
      badge: 'Summer Essential',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'chk-sunglasses',
      category: 'summer',
      title: 'Polarized UV Sunglasses',
      desc: 'Crucial for eye protection against high-altitude UV radiation and bright snow glare.',
      badge: 'High Altitude',
      badgeClass: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'chk-sunscreen',
      category: 'summer',
      title: 'High-SPF Sunscreen (SPF 50+) & Sun Hat',
      desc: 'High mountain sun causes quick sunburn; reapply every 3-4 hours during day trips.',
      badge: 'Personal Care',
      badgeClass: 'bg-slate-100 text-slate-800'
    },
    {
      id: 'chk-motion-sickness',
      category: 'summer',
      title: 'Motion Sickness Tablets & Basic First Aid',
      desc: 'Recommended for travelers sensitive to winding mountain passes on the way to Gulmarg.',
      badge: 'Health',
      badgeClass: 'bg-emerald-100 text-emerald-800'
    }
  ];

  if (checklistGrid && checklistTabs) {
    let currentCategory = 'all';
    
    // Load saved checklist state from localStorage
    function getSavedChecked() {
      try {
        const saved = localStorage.getItem('cityline_packing_checklist');
        return saved ? JSON.parse(saved) : {};
      } catch (e) {
        return {};
      }
    }

    function saveChecked(state) {
      try {
        localStorage.setItem('cityline_packing_checklist', JSON.stringify(state));
      } catch (e) {}
    }

    let checkedState = getSavedChecked();

    let confettiTriggered = false;

    function launchConfetti() {
      let canvas = document.getElementById('confettiCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'confettiCanvas';
        document.body.appendChild(canvas);
      }
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const pieces = [];
      const colors = ['#145DA0', '#0B2545', '#38BDF8', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

      for (let i = 0; i < 75; i++) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height * 0.4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedY: Math.random() * 3 + 2,
          speedX: Math.random() * 2.5 - 1.25,
          rotation: Math.random() * 360,
          rotSpeed: Math.random() * 6 - 3,
          opacity: 1
        });
      }

      const startTime = performance.now();

      function animate(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const elapsed = now - startTime;

        pieces.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotSpeed;
          if (elapsed > 1800) {
            p.opacity = Math.max(0, 1 - (elapsed - 1800) / 900);
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        });

        if (elapsed < 2800) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
      }

      requestAnimationFrame(animate);
    }

    function updateProgress() {
      const total = checklistData.length;
      let count = 0;
      checklistData.forEach(item => {
        if (checkedState[item.id]) count++;
      });
      const pct = Math.round((count / total) * 100);

      if (packProgressBar) packProgressBar.style.width = pct + '%';
      if (packProgressText) {
        if (pct === 100) {
          packProgressText.innerHTML = '<span class="text-emerald-600 font-bold">🎉 All 16 Packed! 100% Ready!</span>';
          if (!confettiTriggered) {
            confettiTriggered = true;
            launchConfetti();
          }
        } else {
          confettiTriggered = false;
          packProgressText.textContent = `${count} of ${total} (${pct}%)`;
        }
      }
    }

    function renderChecklist() {
      checklistGrid.innerHTML = '';
      const filtered = checklistData.filter(item => {
        if (currentCategory === 'all') return true;
        return item.category === currentCategory;
      });

      filtered.forEach(item => {
        const isChecked = !!checkedState[item.id];
        const card = document.createElement('label');
        card.className = `flex items-start space-x-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer ${
          isChecked 
            ? 'bg-emerald-50/70 border-emerald-300' 
            : 'bg-brand-offwhite border-brand-border hover:bg-brand-light'
        }`;

        card.innerHTML = `
          <input type="checkbox" class="checklist-box mt-1 rounded border-slate-300 text-brand-blue focus:ring-brand-blue h-4 w-4" data-id="${item.id}" ${isChecked ? 'checked' : ''}>
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-brand-navy ${isChecked ? 'line-through text-slate-500' : ''}">${item.title}</span>
              <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.badgeClass}">${item.badge}</span>
            </div>
            <p class="text-[11px] text-brand-muted mt-0.5 leading-relaxed">${item.desc}</p>
          </div>
        `;

        const checkbox = card.querySelector('input');
        checkbox.addEventListener('change', () => {
          checkedState[item.id] = checkbox.checked;
          saveChecked(checkedState);
          updateProgress();
          renderChecklist();
        });

        checklistGrid.appendChild(card);
      });

      updateProgress();
      if (window.lucide) window.lucide.createIcons();
    }

    // Category Tabs click listeners
    const tabBtns = checklistTabs.querySelectorAll('.check-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => {
          b.className = 'check-tab-btn px-4 py-2 rounded-xl text-xs font-semibold bg-brand-offwhite text-brand-navy hover:bg-brand-light transition';
        });
        btn.className = 'check-tab-btn active px-4 py-2 rounded-xl text-xs font-semibold bg-brand-blue text-white shadow-sm transition';
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderChecklist();
      });
    });

    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', () => {
        checklistData.forEach(item => {
          checkedState[item.id] = true;
        });
        saveChecked(checkedState);
        renderChecklist();
      });
    }

    if (resetCheckBtn) {
      resetCheckBtn.addEventListener('click', () => {
        checkedState = {};
        saveChecked(checkedState);
        renderChecklist();
      });
    }

    renderChecklist();
  }

  // ========================================================
  // ========================================================
  // 8. LIVE KASHMIR WEATHER INTEGRATION & INTERACTIVE MODAL
  // ========================================================
  const weatherCardsGrid = document.getElementById('weatherCardsGrid');
  const weatherModal = document.getElementById('weatherDetailModal');
  const closeModalBtn = document.getElementById('closeWeatherModalBtn');
  const modalTabs = document.querySelectorAll('#modalDestTabs .modal-tab-btn');
  let cachedWeatherData = null;
  let activeModalDest = 'srinagar';

  async function fetchLiveWeather() {
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.destinations) return;
      cachedWeatherData = data;

      // Update overview cards
      Object.keys(data.destinations).forEach(destId => {
        const d = data.destinations[destId];
        const curr = d.current;
        if (!curr) return;

        const tempEl = document.getElementById(`weatherTemp-${destId}`);
        const feelsEl = document.getElementById(`weatherFeels-${destId}`);
        const humEl = document.getElementById(`weatherHumidity-${destId}`);
        const windEl = document.getElementById(`weatherWind-${destId}`);
        const descEl = document.getElementById(`weatherDesc-${destId}`);
        const precipEl = document.getElementById(`weatherPrecip-${destId}`);

        if (tempEl && curr.temperature !== null && curr.temperature !== undefined) tempEl.textContent = `${curr.temperature}°C`;
        if (feelsEl && curr.apparentTemperature !== null && curr.apparentTemperature !== undefined) feelsEl.textContent = `${curr.apparentTemperature}°C`;
        if (humEl && curr.relativeHumidity !== null && curr.relativeHumidity !== undefined) humEl.textContent = `${curr.relativeHumidity}%`;
        if (windEl && curr.windSpeed !== null && curr.windSpeed !== undefined) windEl.textContent = `${curr.windSpeed} km/h ${curr.windCardinal || ''}`;
        if (descEl && curr.condition) descEl.textContent = curr.condition;
        if (precipEl && d.todaySummary && d.todaySummary.precipProbability !== undefined) precipEl.textContent = `${d.todaySummary.precipProbability}%`;

        const card = document.querySelector(`.weather-card[data-dest="${destId}"]`);
        if (card) {
          const badge = card.querySelector('.weather-status-badge');
          if (badge) {
            badge.textContent = data.isCached ? 'Cached Feed' : 'Live Feed';
            badge.className = `weather-status-badge text-[9px] px-1.5 py-0.5 rounded-full font-semibold border ${data.isCached ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`;
          }
        }
      });

      // Synchronize hero section weather indicator pill and dynamic canvas effects with live Srinagar data
      if (data.destinations.srinagar && typeof window.__syncHeroWeatherWithPayload === 'function') {
        window.__syncHeroWeatherWithPayload(data.destinations.srinagar);
      }

      const updatedEl = document.getElementById('weatherLastUpdated');
      if (updatedEl) {
        const timeStr = data.modelTimeIST || data.lastUpdatedIST || 'Live Satellite Feed';
        updatedEl.textContent = data.isCached ? `${timeStr} (Cached)` : timeStr;
      }

      // If modal is currently open, refresh its content
      if (weatherModal && !weatherModal.classList.contains('pointer-events-none')) {
        renderModalDestination(activeModalDest);
      }
    } catch (e) {
      console.warn('Weather fetch error:', e.message);
      const updatedEl = document.getElementById('weatherLastUpdated');
      if (updatedEl && !updatedEl.textContent.includes('Cached')) {
        updatedEl.textContent += ' (Cached)';
      }
      document.querySelectorAll('.weather-status-badge').forEach(badge => {
        badge.textContent = 'Cached Feed';
        badge.className = 'weather-status-badge text-[9px] px-1.5 py-0.5 rounded-full font-semibold border bg-amber-50 text-amber-700 border-amber-200';
      });
    }
  }

  function renderModalDestination(destId) {
    if (!cachedWeatherData || !cachedWeatherData.destinations) return;
    const dest = cachedWeatherData.destinations[destId];
    if (!dest) return;
    activeModalDest = destId;

    // Update active tab styles
    modalTabs.forEach(tab => {
      const isCurrent = tab.getAttribute('data-dest') === destId;
      tab.className = `modal-tab-btn px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${isCurrent ? 'bg-brand-blue text-white border-brand-blue shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'}`;
    });

    // Populate modal titles & metrics
    const titleEl = document.getElementById('modalDestTitle');
    if (titleEl) titleEl.textContent = `${dest.name} Weather & Mountain Travel Advisory`;

    const curr = dest.current || {};
    const sum = dest.todaySummary || {};
    const adv = dest.travelAdvisory || {};

    const tempEl = document.getElementById('modalCurrentTemp');
    if (tempEl) tempEl.textContent = `${(curr.temperature !== null && curr.temperature !== undefined) ? curr.temperature : (dest.defaultTemp || 8)}°C`;

    const descEl = document.getElementById('modalConditionDesc');
    if (descEl) descEl.textContent = curr.condition || 'Fair Mountain Weather';

    const feelsEl = document.getElementById('modalFeelsLike');
    if (feelsEl) feelsEl.textContent = `${(curr.apparentTemperature !== null && curr.apparentTemperature !== undefined) ? curr.apparentTemperature : ((curr.temperature || 8) - 2)}°C`;

    const maxEl = document.getElementById('modalTempMax');
    if (maxEl) maxEl.textContent = `${(sum.tempMax !== null && sum.tempMax !== undefined) ? sum.tempMax : ((curr.temperature || 8) + 4)}°C`;

    const minEl = document.getElementById('modalTempMin');
    if (minEl) minEl.textContent = `${(sum.tempMin !== null && sum.tempMin !== undefined) ? sum.tempMin : ((curr.temperature || 8) - 4)}°C`;

    const sunrEl = document.getElementById('modalSunrise');
    if (sunrEl) sunrEl.textContent = (sum.sunrise && sum.sunrise !== 'N/A') ? sum.sunrise : '06:45 AM';

    const sunsEl = document.getElementById('modalSunset');
    if (sunsEl) sunsEl.textContent = (sum.sunset && sum.sunset !== 'N/A') ? sum.sunset : '05:30 PM';

    const windEl = document.getElementById('modalWind');
    if (windEl) windEl.textContent = `${(curr.windSpeed !== null && curr.windSpeed !== undefined) ? curr.windSpeed : '5'} km/h ${curr.windCardinal || 'N'}`;

    const humEl = document.getElementById('modalHumidity');
    if (humEl) humEl.textContent = `${(curr.relativeHumidity !== null && curr.relativeHumidity !== undefined) ? curr.relativeHumidity : '72'}%`;

    const precipEl = document.getElementById('modalPrecipProb');
    if (precipEl) precipEl.textContent = `${(sum.precipProbability !== undefined && sum.precipProbability !== null) ? sum.precipProbability : '10'}%`;

    const elevEl = document.getElementById('modalElevation');
    if (elevEl) elevEl.textContent = dest.altitude || '--';

    // Populate Travel Advisory Card
    const advBadge = document.getElementById('modalAdvisoryBadge');
    if (advBadge) {
      advBadge.textContent = adv.badge || 'Advisory';
      const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        sky: 'bg-sky-50 text-sky-700 border-sky-200',
        red: 'bg-rose-50 text-rose-700 border-rose-200'
      };
      advBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${colorMap[adv.badgeColor] || colorMap.emerald}`;
    }

    const advHead = document.getElementById('modalAdvisoryHeadline');
    if (advHead) advHead.textContent = adv.headline || 'Mountain Travel Guidance';

    const advMsg = document.getElementById('modalAdvisoryMessage');
    if (advMsg) advMsg.textContent = adv.message || 'Check local guidelines.';

    const actNotice = document.getElementById('modalActivityNotice');
    if (actNotice) actNotice.textContent = adv.activityNotice ? `⚠️ ${adv.activityNotice}` : '';

    const precipSummary = document.getElementById('modalPrecipSummary');
    if (precipSummary) precipSummary.textContent = adv.precipSummary || '';

    // Populate 24h Hourly Track
    const hourlyTrack = document.getElementById('modalHourlyTrack');
    if (hourlyTrack && dest.next24Hours) {
      hourlyTrack.innerHTML = dest.next24Hours.map(h => `
        <div class="flex flex-col items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[75px] shrink-0 text-center">
          <span class="text-[10px] font-semibold text-slate-500">${h.timeFormatted}</span>
          <i data-lucide="${h.icon}" class="w-5 h-5 my-1 text-brand-blue"></i>
          <span class="text-xs font-bold text-brand-navy">${h.temp}°C</span>
          <span class="text-[9px] font-semibold text-blue-600 mt-0.5">${h.precipProb}% rain</span>
        </div>
      `).join('');
    }

    // Populate 5-Day Outlook Grid
    const dailyGrid = document.getElementById('modalDailyGrid');
    if (dailyGrid && dest.fiveDayForecast) {
      dailyGrid.innerHTML = dest.fiveDayForecast.map(d => `
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div class="flex items-center justify-between text-xs font-bold text-brand-navy mb-1">
            <span>${d.dayName}</span>
            <span class="text-[10px] font-normal text-slate-400">${d.dateFormatted}</span>
          </div>
          <div class="flex items-center space-x-1.5 my-1">
            <i data-lucide="${d.icon}" class="w-4 h-4 text-brand-blue shrink-0"></i>
            <span class="text-[11px] text-slate-600 font-medium truncate">${d.condition}</span>
          </div>
          <div class="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span class="font-bold text-brand-navy">${d.tempMax}° / <span class="text-slate-400 font-normal">${d.tempMin}°</span></span>
            <span class="text-[10px] font-semibold text-blue-600">${d.precipProb}%</span>
          </div>
        </div>
      `).join('');
    }

    // Provider Timestamp
    const provTimestamp = document.getElementById('modalProviderTimestamp');
    if (provTimestamp && cachedWeatherData) {
      provTimestamp.textContent = `Model Timestamp: ${cachedWeatherData.modelTimeIST || 'Live'} (Next automated site refresh in 15 min)`;
    }

    // Re-render Lucide icons inside modal
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function openWeatherModal(destId) {
    if (!weatherModal) return;
    activeModalDest = destId || 'srinagar';
    weatherModal.classList.remove('opacity-0', 'pointer-events-none');
    renderModalDestination(activeModalDest);
  }

  function closeWeatherModal() {
    if (!weatherModal) return;
    weatherModal.classList.add('opacity-0', 'pointer-events-none');
  }

  if (weatherCardsGrid) {
    // Initial fetch to sync any dynamic updates
    fetchLiveWeather();
    // 15-minute automatic refresh
    setInterval(fetchLiveWeather, 15 * 60 * 1000);

    // Event listeners for opening detail modal
    document.querySelectorAll('.weather-detail-trigger, .weather-card').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const targetDest = elem.getAttribute('data-target-dest') || elem.getAttribute('data-dest');
        if (targetDest) {
          openWeatherModal(targetDest);
        }
      });
    });

    // Close button
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeWeatherModal);
    }

    // Click outside modal content to close
    if (weatherModal) {
      weatherModal.addEventListener('click', (e) => {
        if (e.target === weatherModal) {
          closeWeatherModal();
        }
      });
    }

    // Modal destination tabs
    modalTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const dest = tab.getAttribute('data-dest');
        if (dest) {
          renderModalDestination(dest);
        }
      });
    });
  }

  // ========================================================
  // 9. SUBTLE MOUNTAIN DEPTH SCROLL EFFECT (Respects reduced motion)
  // ========================================================
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parallaxBanners = document.querySelectorAll('.parallax-bg, #heroSlider');
  if (!prefersReduced && parallaxBanners.length > 0 && window.innerWidth > 1024) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          if (scrollY < 900) {
            const heroSlider = document.getElementById('heroSlider');
            if (heroSlider) {
              heroSlider.style.transform = `translate3d(0, ${scrollY * 0.1}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ========================================================
  // 10. CRAFTED & DEVELOPED BY ZTM — SIGNATURE MICRO-ANIMATION
  // ========================================================
  const ztmCredit = document.getElementById('ztmCredit');
  if (ztmCredit) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      ztmCredit.classList.add('ztm-settled');
    } else if ('IntersectionObserver' in window) {
      ztmCredit.classList.add('ztm-ready');
      const ztmObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ztmCredit.classList.remove('ztm-ready');
            ztmCredit.classList.add('ztm-animate');
            // Unobserve so it never replays while scrolling
            observer.unobserve(entry.target);

            // Settle into final clean, sharp, stationary state
            setTimeout(() => {
              ztmCredit.classList.remove('ztm-animate');
              ztmCredit.classList.add('ztm-settled');
            }, 1800);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -20px 0px'
      });
      ztmObserver.observe(ztmCredit);
    } else {
      ztmCredit.classList.add('ztm-settled');
    }
  }

  // ----------------------------------------------------
  // Testimonials / Verified Reviews Mobile Carousel & Filtering
  // ----------------------------------------------------
  const reviewsGrid = document.getElementById('reviewsGrid');
  const reviewDots = document.querySelectorAll('#reviewsMobileDots .review-dot');
  const filterBtns = document.querySelectorAll('.review-filter-btn');

  if (reviewsGrid) {
    if (reviewDots.length > 0) {
      let reviewTicking = false;
      reviewsGrid.addEventListener('scroll', () => {
        if (!reviewTicking) {
          requestAnimationFrame(() => {
            const scrollLeft = reviewsGrid.scrollLeft;
            const visibleCards = Array.from(reviewsGrid.querySelectorAll('.review-card:not(.hidden)'));
            if (visibleCards.length > 0) {
              const cardWidth = visibleCards[0].offsetWidth;
              const activeIndex = Math.min(
                reviewDots.length - 1,
                Math.max(0, Math.round(scrollLeft / (cardWidth + 12)))
              );
              reviewDots.forEach((dot, i) => {
                if (i === activeIndex) {
                  dot.className = 'review-dot h-1.5 rounded-full transition-all duration-300 w-5 bg-brand-blue';
                } else {
                  dot.className = 'review-dot h-1.5 rounded-full transition-all duration-300 w-1.5 bg-slate-300';
                }
              });
            }
            reviewTicking = false;
          });
          reviewTicking = true;
        }
      }, { passive: true });

      reviewDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          const visibleCards = Array.from(reviewsGrid.querySelectorAll('.review-card:not(.hidden)'));
          if (visibleCards[idx]) {
            reviewsGrid.scrollTo({
              left: visibleCards[idx].offsetLeft - reviewsGrid.offsetLeft,
              behavior: 'smooth'
            });
          }
        });
      });
    }

    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.getAttribute('data-category');
          filterBtns.forEach(b => {
            b.className = 'review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border bg-white hover:bg-slate-50 text-slate-600 border-slate-200';
          });
          btn.className = 'review-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border bg-brand-blue text-white border-brand-blue shadow-sm';

          const cards = reviewsGrid.querySelectorAll('.review-card');
          cards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (category === 'all' || cardCat === category) {
              card.classList.remove('hidden');
            } else {
              card.classList.add('hidden');
            }
          });
          reviewsGrid.scrollTo({ left: 0, behavior: 'smooth' });
        });
      });
    }
  }
});



