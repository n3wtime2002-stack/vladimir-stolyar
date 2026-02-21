/* ============================================================
   СТОЛЯРНАЯ МАСТЕРСКАЯ ВЛАДИМИРА
   script.js — чистый JS, без зависимостей
   ============================================================ */

(function () {
  "use strict";

  /* -----------------------------------------------------------
     1. НАВИГАЦИЯ: смена фона при скролле
     ----------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var navBurger = document.getElementById("navBurger");
  var navMobile = document.getElementById("navMobile");

  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 60);
  }
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();

  /* Мобильное меню — бургер */
  if (navBurger && navMobile) {
    navBurger.addEventListener("click", function () {
      var isOpen = navBurger.classList.toggle("open");
      navMobile.classList.toggle("open", isOpen);
      navBurger.setAttribute("aria-expanded", isOpen);
      navMobile.setAttribute("aria-hidden", !isOpen);
    });

    /* Закрыть при клике на ссылку */
    var mobileLinks = navMobile.querySelectorAll("a");
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener("click", function () {
        navBurger.classList.remove("open");
        navMobile.classList.remove("open");
        navBurger.setAttribute("aria-expanded", "false");
        navMobile.setAttribute("aria-hidden", "true");
      });
    }
  }

  /* -----------------------------------------------------------
     2. REVEAL ON SCROLL (Intersection Observer)
     Элементы с классом .reveal появляются плавно
     ----------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reveals.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) {
            entries[j].target.classList.add("visible");
            revealObserver.unobserve(entries[j].target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    for (var k = 0; k < reveals.length; k++) {
      revealObserver.observe(reveals[k]);
    }
  } else {
    /* Fallback: показать сразу */
    for (var l = 0; l < reveals.length; l++) {
      reveals[l].classList.add("visible");
    }
  }

  /* -----------------------------------------------------------
     3. LIGHTBOX (галерея)
     Автоматически собирает data-src из кнопок .gallery-zoom
     Поддерживает стрелки, Escape, клик по фону
     ----------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var zoomButtons = document.querySelectorAll(".gallery-zoom");
  var galleryItems = document.querySelectorAll(".gallery-item");
  var lightboxSources = [];
  var lightboxCurrent = 0;

  /* Собираем все src */
  for (var m = 0; m < zoomButtons.length; m++) {
    lightboxSources.push(zoomButtons[m].getAttribute("data-src"));
  }

  /* Открытие по кнопке лупы */
  for (var n = 0; n < zoomButtons.length; n++) {
    (function (idx) {
      zoomButtons[idx].addEventListener("click", function (e) {
        e.stopPropagation();
        openLightbox(idx);
      });
    })(n);
  }

  /* Открытие по клику на карточку */
  for (var p = 0; p < galleryItems.length; p++) {
    (function (idx) {
      galleryItems[idx].addEventListener("click", function () {
        openLightbox(idx);
      });
    })(p);
  }

  function openLightbox(index) {
    if (!lightbox || !lightboxSources.length) return;
    lightboxCurrent = index;
    lightboxImg.src = lightboxSources[index];
    lightbox.removeAttribute("hidden");
    lightbox.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      lightbox.classList.add("active");
    });
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    setTimeout(function () {
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.src = "";
    }, 350);
    document.body.style.overflow = "";
  }

  function navigateLightbox(dir) {
    lightboxCurrent =
      (lightboxCurrent + dir + lightboxSources.length) %
      lightboxSources.length;
    lightboxImg.src = lightboxSources[lightboxCurrent];
  }

  if (lightboxClose)
    lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev)
    lightboxPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      navigateLightbox(-1);
    });
  if (lightboxNext)
    lightboxNext.addEventListener("click", function (e) {
      e.stopPropagation();
      navigateLightbox(1);
    });
  if (lightbox)
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

  /* Клавиатура: стрелки + Escape */
  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigateLightbox(-1);
    if (e.key === "ArrowRight") navigateLightbox(1);
  });

  /* -----------------------------------------------------------
     4. ТЕЛЕФОН: POPOVER
     При клике на иконку телефона — показываем popover с номером,
     кнопкой «Скопировать» и кнопкой «Позвонить».
     НЕ запускает звонок автоматически.

     КАК ПОМЕНЯТЬ НОМЕР:
     1. В index.html: #phoneNumber (отображение), .phone-call href
     2. Здесь: переменная phoneRaw (для копирования)
     ----------------------------------------------------------- */
  var phoneBtn = document.getElementById("phoneBtn");
  var phonePopover = document.getElementById("phonePopover");
  var phoneCopyBtn = document.getElementById("phoneCopy");
  var phoneCopyText = document.getElementById("phoneCopyText");
  var phoneRaw = "+79303902923"; /* номер для копирования */
  var phoneIsOpen = false;

  function togglePhone() {
    phoneIsOpen = !phoneIsOpen;
    phonePopover.classList.toggle("active", phoneIsOpen);
    phoneBtn.setAttribute("aria-expanded", phoneIsOpen);
  }

  function closePhone() {
    if (!phoneIsOpen) return;
    phoneIsOpen = false;
    phonePopover.classList.remove("active");
    phoneBtn.setAttribute("aria-expanded", "false");
  }

  if (phoneBtn) {
    phoneBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      togglePhone();
    });
  }

  /* Закрыть по клику вне popover */
  document.addEventListener("click", function (e) {
    if (
      phoneIsOpen &&
      phonePopover &&
      !phonePopover.contains(e.target) &&
      !phoneBtn.contains(e.target)
    ) {
      closePhone();
    }
  });

  /* Кнопка «Скопировать» */
  if (phoneCopyBtn) {
    phoneCopyBtn.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(phoneRaw)
          .then(showCopyOk)
          .catch(function () {
            fallbackCopy(phoneRaw);
          });
      } else {
        fallbackCopy(phoneRaw);
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;left:-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      showCopyOk();
    } catch (_) {
      /* silent */
    }
    document.body.removeChild(ta);
  }

  function showCopyOk() {
    if (!phoneCopyText) return;
    var orig = phoneCopyText.textContent;
    phoneCopyText.textContent = "Скопировано ✓";
    setTimeout(function () {
      phoneCopyText.textContent = orig;
    }, 1600);
  }

  /* -----------------------------------------------------------
     5. SMOOTH SCROLL (якоря с учётом высоты навбара)
     ----------------------------------------------------------- */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var q = 0; q < anchors.length; q++) {
    anchors[q].addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#") return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var navH = nav ? nav.offsetHeight : 0;
        var top =
          target.getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  }
})();