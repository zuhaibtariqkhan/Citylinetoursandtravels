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
  const heroDots = document.querySelectorAll('.hero-scene-dot');
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

    heroDots.forEach((dot, i) => {
      if (i === currentHeroSlide) {
        dot.className = 'hero-scene-dot w-6 sm:w-8 h-1.5 rounded-full bg-brand-sky transition-all duration-300';
      } else {
        dot.className = 'hero-scene-dot w-2 h-1.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300';
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

    heroDots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(heroInterval);
        const target = parseInt(dot.getAttribute('data-target') || '0', 10);
        setHeroSlide(target);
        startHeroTimer();
      });
    });

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
  // 3. AMBIENT GENTLE SNOWFALL EFFECT (OPTIMIZED OFF-SCREEN PAUSE)
  // ========================================================
  const snowCanvas = document.getElementById('snowCanvas');
  const snowToggleBtn = document.getElementById('snowToggleBtn');
  const snowStatusText = document.getElementById('snowStatusText');

  if (snowCanvas) {
    const ctx = snowCanvas.getContext('2d');
    let snowActive = true;
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let isHeroInView = true;

    function resizeCanvas() {
      if (!snowCanvas || !snowCanvas.parentElement) return;
      width = snowCanvas.width = snowCanvas.parentElement.clientWidth;
      height = snowCanvas.height = snowCanvas.parentElement.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Create 45 organic snowflake particles
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 600),
        r: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.25,
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayAngle: Math.random() * Math.PI * 2
      });
    }

    function renderSnow() {
      if (!snowActive || !isHeroInView) {
        animationFrameId = null;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        p.swayAngle += p.swaySpeed;
        p.x += Math.sin(p.swayAngle) * 0.4 + p.speedX;
        p.y += p.speedY;

        // Wrap around borders
        if (p.y > height + 5) {
          p.y = -5;
          p.x = Math.random() * width;
        }
        if (p.x > width + 5) p.x = -5;
        if (p.x < -5) p.x = width + 5;
      });

      animationFrameId = requestAnimationFrame(renderSnow);
    }

    // Pause canvas animation when hero is scrolled off screen to save GPU/CPU cycles
    const heroSection = document.getElementById('heroSection');
    if (heroSection && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isHeroInView = entry.isIntersecting;
          if (isHeroInView && snowActive) {
            if (!animationFrameId) renderSnow();
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
      renderSnow();
    }

    // Pause canvas when browser tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else if (isHeroInView && snowActive) {
        if (!animationFrameId) renderSnow();
      }
    });

    // Snow toggle button click
    if (snowToggleBtn) {
      snowToggleBtn.addEventListener('click', () => {
        snowActive = !snowActive;
        if (snowActive) {
          if (snowStatusText) snowStatusText.textContent = 'Snowfall: Active';
          if (!animationFrameId && isHeroInView) renderSnow();
        } else {
          ctx.clearRect(0, 0, width, height);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          if (snowStatusText) snowStatusText.textContent = 'Snowfall: Paused';
        }
      });
    }
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
  // 8. LIVE KASHMIR WEATHER INTEGRATION (Non-blocking & Graceful Fallback)
  // ========================================================
  const weatherCardsGrid = document.getElementById('weatherCardsGrid');
  if (weatherCardsGrid) {
    const weatherCodes = {
      0: { desc: 'Clear Skies', icon: 'sun' },
      1: { desc: 'Mainly Clear', icon: 'sun' },
      2: { desc: 'Partly Cloudy', icon: 'cloud-sun' },
      3: { desc: 'Overcast Skies', icon: 'cloud' },
      45: { desc: 'Mountain Mist', icon: 'cloud-fog' },
      48: { desc: 'Freezing Rime Fog', icon: 'cloud-fog' },
      51: { desc: 'Light Drizzle', icon: 'cloud-drizzle' },
      61: { desc: 'Gentle Rain', icon: 'cloud-rain' },
      71: { desc: 'Light Snowfall', icon: 'snowflake' },
      73: { desc: 'Moderate Snow', icon: 'snowflake' },
      75: { desc: 'Heavy Snowfall', icon: 'snowflake' },
      85: { desc: 'Snow Showers', icon: 'snowflake' }
    };

    const destCards = weatherCardsGrid.querySelectorAll('[data-dest]');
    destCards.forEach(async (card) => {
      const dest = card.getAttribute('data-dest');
      const lat = card.getAttribute('data-lat');
      const lon = card.getAttribute('data-lon');
      if (!lat || !lon) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.current) {
            const curr = data.current;
            const tempEl = document.getElementById(`weatherTemp-${dest}`);
            const feelsEl = document.getElementById(`weatherFeels-${dest}`);
            const humEl = document.getElementById(`weatherHumidity-${dest}`);
            const windEl = document.getElementById(`weatherWind-${dest}`);
            const descEl = document.getElementById(`weatherDesc-${dest}`);

            if (tempEl && curr.temperature_2m !== undefined) {
              tempEl.textContent = `${Math.round(curr.temperature_2m)}°C`;
            }
            if (feelsEl && curr.apparent_temperature !== undefined) {
              feelsEl.textContent = `${Math.round(curr.apparent_temperature)}°C`;
            }
            if (humEl && curr.relative_humidity_2m !== undefined) {
              humEl.textContent = `${Math.round(curr.relative_humidity_2m)}%`;
            }
            if (windEl && curr.wind_speed_10m !== undefined) {
              windEl.textContent = `${Math.round(curr.wind_speed_10m)} km/h`;
            }
            if (descEl && curr.weather_code !== undefined && weatherCodes[curr.weather_code]) {
              descEl.textContent = weatherCodes[curr.weather_code].desc;
            }

            const statusBadge = card.querySelector('.weather-status-badge');
            if (statusBadge) {
              statusBadge.textContent = 'Live Feed';
              statusBadge.className = 'weather-status-badge text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200';
            }

            const updatedEl = document.getElementById('weatherLastUpdated');
            if (updatedEl) {
              updatedEl.dataset.updated = 'true';
              const now = new Date();
              updatedEl.textContent = `Live Satellite Feed (Open-Meteo) • Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
          }
        } else {
          const statusBadge = card.querySelector('.weather-status-badge');
          if (statusBadge) statusBadge.textContent = 'Seasonal Norm';
        }
      } catch (e) {
        const statusBadge = card.querySelector('.weather-status-badge');
        if (statusBadge) statusBadge.textContent = 'Seasonal Norm';
        const updatedEl = document.getElementById('weatherLastUpdated');
        if (updatedEl && !updatedEl.dataset.updated) {
          updatedEl.textContent = 'Seasonal Weather Estimates • Live Feed Reconnecting';
        }
      }
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



