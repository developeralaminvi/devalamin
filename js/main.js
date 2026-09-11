/**
 * Developer Alamin - Alture Template Logic
 * Integrated with Lenis Smooth Scroll, GSAP 3, and Webflow-style Interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Dismiss Preloader / Brand Wrap after page loads
  const brandWrap = document.querySelector(".brand_wrap");
  if (brandWrap) {
    setTimeout(() => {
      brandWrap.classList.add("loaded");
      setTimeout(() => {
        brandWrap.style.display = "none";
      }, 800);
    }, 600);
  }

  // 2. Initialize Lenis Smooth Scroll & GSAP ScrollTrigger
  let lenisInstance = null;
  if (typeof Lenis !== "undefined") {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      lenisInstance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId && targetId !== "#") {
          if (targetId === "#top" || targetId === "#hero") {
            e.preventDefault();
            lenisInstance.scrollTo(0, {
              duration: 1.4,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return;
          }
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenisInstance.scrollTo(targetEl, { offset: -60 });
          }
        }
      });
    });
  }

  // 3. CTA Section - Mouse Trail Image Clone Effect (Powered by GSAP)
  const ctaSection = document.querySelector(".section_cta");
  if (ctaSection && typeof gsap !== "undefined") {
    const visualWrap = ctaSection.querySelector(".interaction_visual_wrap");
    const template = ctaSection.querySelector(".interaction_img_wrap");
    const sampleImages = [
      "assets/images/project-wordpress.png",
      "assets/images/project-elementor.png",
      "assets/images/project-landing.png",
      "assets/images/project-woocommerce.png",
      "assets/images/project-speed.png",
      "assets/images/project-plugin.png"
    ];

    let imgIndex = 0;
    function getNextUrl() {
      const url = sampleImages[imgIndex];
      imgIndex = (imgIndex + 1) % sampleImages.length;
      return url;
    }

    let lastX = 0;
    let lastY = 0;

    ctaSection.addEventListener("mousemove", (e) => {
      const rect = ctaSection.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Update dot matrix spotlight coordinates
      const xPercent = (currentX / rect.width) * 100;
      const yPercent = (currentY / rect.height) * 100;
      ctaSection.style.setProperty("--mouse-x", `${xPercent.toFixed(1)}%`);
      ctaSection.style.setProperty("--mouse-y", `${yPercent.toFixed(1)}%`);

      const dist = Math.hypot(currentX - lastX, currentY - lastY);

      if (dist > 80) {
        const prevX = lastX;
        const prevY = lastY;
        lastX = currentX;
        lastY = currentY;

        if (template && visualWrap) {
          const clone = template.cloneNode(true);
          const img = clone.querySelector("img");
          if (img) img.src = getNextUrl();

          clone.style.display = "block";
          clone.style.left = `${currentX}px`;
          clone.style.top = `${currentY}px`;
          visualWrap.appendChild(clone);

          const randomAngle = (Math.random() - 0.5) * 20;

          const tl = gsap.timeline({
            onComplete: () => {
              clone.remove();
            },
          });

          tl.fromTo(
            clone,
            { opacity: 0, scale: 0.6, rotation: 0 },
            { opacity: 1, scale: 1, rotation: randomAngle, duration: 0.25, ease: "power2.out" }
          );

          tl.to(
            clone,
            {
              x: (currentX - prevX) * 0.4,
              y: (currentY - prevY) * 0.4,
              opacity: 0,
              scale: 0.4,
              duration: 0.4,
              ease: "power2.in",
            },
            "+=0.1"
          );
        }
      }
    });
  }

  // 4. Selected Work - Scroll-Driven Entrance ("scrol korle ekta ekta kore opore uthbe")
  const workBlocks = document.querySelectorAll(".work-list_block");
  if (workBlocks.length > 0 && typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      workBlocks.forEach((block) => {
        gsap.fromTo(block,
          {
            y: 90,
            opacity: 0.25,
            scale: 0.94,
            rotateX: 8
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 90%",
              end: "top 48%",
              scrub: 1.2
            }
          }
        );
      });
    } else {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0) scale(1)";
          }
        });
      }, { threshold: 0.15 });

      workBlocks.forEach((b) => {
        b.style.transition = "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
        b.style.opacity = "0.2";
        b.style.transform = "translateY(60px) scale(0.95)";
        cardObserver.observe(b);
      });
    }
  }

  // 5. Selected Work - Magnetic Hover Follower Title ("mouse narale title raw sathe norbe")
  const hoverWrap = document.getElementById("workHoverWrap");
  const hoverText = document.getElementById("workHoverText");
  const workLinks = document.querySelectorAll(".work-list_link");

  if (hoverWrap && workLinks.length > 0) {
    let isHovering = false;

    let setX, setY;
    if (typeof gsap !== "undefined") {
      setX = gsap.quickTo(hoverWrap, "left", { duration: 0.22, ease: "power3.out" });
      setY = gsap.quickTo(hoverWrap, "top", { duration: 0.22, ease: "power3.out" });
    }

    workLinks.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        isHovering = true;
        const title = link.getAttribute("data-title") || "VIEW WORK";
        if (hoverText) hoverText.textContent = title;

        if (typeof gsap !== "undefined") {
          gsap.set(hoverWrap, { left: e.clientX, top: e.clientY });
        } else {
          hoverWrap.style.left = `${e.clientX}px`;
          hoverWrap.style.top = `${e.clientY}px`;
        }
        hoverWrap.classList.add("active");
      });

      link.addEventListener("mousemove", (e) => {
        if (isHovering) {
          if (setX && setY) {
            setX(e.clientX);
            setY(e.clientY);
          } else {
            hoverWrap.style.left = `${e.clientX}px`;
            hoverWrap.style.top = `${e.clientY}px`;
          }
        }
      });

      link.addEventListener("mouseleave", () => {
        isHovering = false;
        hoverWrap.classList.remove("active");
      });
    });

    window.addEventListener("blur", () => {
      isHovering = false;
      hoverWrap.classList.remove("active");
    });
  }

  // 4. Services Accordion Interaction
  const serviceItems = document.querySelectorAll(".home-services_item");
  if (serviceItems.length > 0) {
    // Open first item by default
    serviceItems[0].classList.add("active");

    serviceItems.forEach((item) => {
      item.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        serviceItems.forEach((s) => s.classList.remove("active"));
        if (!isActive) {
          item.classList.add("active");
        }
      });
    });
  }

  // 5. FAQ Accordion Interaction
  const faqAccordionItems = document.querySelectorAll(".faq_item, .faq_accordion");
  faqAccordionItems.forEach((item) => {
    const trigger = item.querySelector(".faq_trigger, .faq_question-wrap");
    if (trigger) {
      trigger.addEventListener("click", () => {
        const isActive = item.classList.contains("active");

        // Close other items for a clean single-open accordion feel
        faqAccordionItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove("active");
            const otherTrigger = other.querySelector(".faq_trigger");
            if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          }
        });

        if (isActive) {
          item.classList.remove("active");
          trigger.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("active");
          trigger.setAttribute("aria-expanded", "true");
        }
      });
    }
  });

  // 6. Video / Showreel Lightbox Modal
  const playButton = document.querySelector(".showreel_lightbox, .open-showreel");
  const videoModal = document.querySelector(".video-modal_wrap");
  const modalClose = document.querySelector(".video-modal_close");

  if (playButton && videoModal) {
    playButton.addEventListener("click", (e) => {
      e.preventDefault();
      videoModal.classList.add("active");
    });

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        videoModal.classList.remove("active");
      });
    }

    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) {
        videoModal.classList.remove("active");
      }
    });
  }

  // 7. Mobile Menu Toggle
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".navbar_links-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
    // Close on link click
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }

  // 8. Stats Animated Numbers on Scroll
  const statElements = document.querySelectorAll(".stat_number");
  if ("IntersectionObserver" in window && statElements.length > 0) {
    const statObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const finalVal = parseInt(el.getAttribute("data-count") || "0", 10);
            const prefix = el.getAttribute("data-prefix") || "";
            const suffix = el.getAttribute("data-suffix") || "";
            let startVal = 0;
            const duration = 1500;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const currentVal = Math.floor(progress * finalVal);
              el.textContent = `${prefix}${currentVal}${suffix}`;
              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = `${prefix}${finalVal}${suffix}`;
              }
            }

            requestAnimationFrame(updateCount);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    statElements.forEach((el) => statObserver.observe(el));
  }

  // 9. Hero Rotating Words (Strategic -> Unforgettable -> High-Performing)
  const heroWordsWrap = document.querySelector(".home-header_words");
  if (heroWordsWrap) {
    const words = heroWordsWrap.querySelectorAll(".home-header_word");
    if (words.length > 1) {
      let activeWord = 0;
      setInterval(() => {
        activeWord = (activeWord + 1) % words.length;
        heroWordsWrap.style.transform = `translate3d(0, -${activeWord * 3.2}rem, 0)`;
      }, 2600);
    }
  }

  // 10. Hero Floating Contact Card Interactive Expand/Collapse
  const heroContact = document.querySelector(".home-header_contact");
  if (heroContact) {
    heroContact.addEventListener("click", (e) => {
      // Don't prevent default if clicking on links
      if (e.target.closest("a")) return;
      heroContact.classList.toggle("active");
    });

    // Hover state is handled via CSS, click toggle handles mobile/sticky
    document.addEventListener("click", (e) => {
      if (!heroContact.contains(e.target)) {
        heroContact.classList.remove("active");
      }
    });
  }

  // 11. Real-time Live Chat Simulation (Client Help Request -> Solo Developer Response)
  const chatCard = document.querySelector(".home-grid_chat");
  if (chatCard) {
    const clientTyping = chatCard.querySelector("#clientTyping");
    const authorTyping = chatCard.querySelector("#authorTyping");
    const authorGroup = chatCard.querySelector(".home-grid_chat-group._2");
    const bubbles = Array.from(chatCard.querySelectorAll("[data-chat-bubble]"));

    let isPlaying = false;
    let loopTimeout = null;
    let stepTimeouts = [];
    let isHovered = false;

    function clearAllChatTimers() {
      stepTimeouts.forEach((t) => clearTimeout(t));
      stepTimeouts = [];
      if (loopTimeout) {
        clearTimeout(loopTimeout);
        loopTimeout = null;
      }
    }

    function resetChat() {
      clearAllChatTimers();
      chatCard.classList.remove("is-resetting");
      chatCard.classList.add("is-animating");
      bubbles.forEach((b) => b.classList.remove("is-visible"));
      if (clientTyping) clientTyping.classList.remove("is-active");
      if (authorTyping) authorTyping.classList.remove("is-active");
      if (authorGroup) authorGroup.classList.remove("is-active");
    }

    function runChatSequence() {
      // Respect accessibility preferences
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        chatCard.classList.remove("is-animating");
        chatCard.classList.remove("is-resetting");
        bubbles.forEach((b) => b.classList.add("is-visible"));
        if (authorGroup) authorGroup.classList.add("is-active");
        return;
      }

      resetChat();
      isPlaying = true;

      // 1. Client starts typing (Profile photo & typing indicator together at the top)
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.add("is-active");
        }, 350)
      );

      // 2. Client Bubble 1 arrives ("Hey Alamin! Need urgent help with my site.")
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.remove("is-active");
          const b1 = bubbles.find((b) => b.getAttribute("data-chat-bubble") === "1");
          if (b1) b1.classList.add("is-visible");
        }, 1300)
      );

      // 3. Client continues typing problem description
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.add("is-active");
        }, 1750)
      );

      // 4. Client Bubble 2 arrives ("Checkout is broken & mobile speed is slow 😭")
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.remove("is-active");
          const b2 = bubbles.find((b) => b.getAttribute("data-chat-bubble") === "2");
          if (b2) b2.classList.add("is-visible");
        }, 2850)
      );

      // 5. Client types urgency question
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.add("is-active");
        }, 3300)
      );

      // 6. Client Bubble 3 arrives ("Can you help me fix this today?")
      stepTimeouts.push(
        setTimeout(() => {
          if (clientTyping) clientTyping.classList.remove("is-active");
          const b3 = bubbles.find((b) => b.getAttribute("data-chat-bubble") === "3");
          if (b3) b3.classList.add("is-visible");
        }, 4300)
      );

      // 7. Alamin starts typing his personal reassurance (Profile photo & typing indicator appear together at the top right)
      stepTimeouts.push(
        setTimeout(() => {
          if (authorGroup) authorGroup.classList.add("is-active");
          if (authorTyping) authorTyping.classList.add("is-active");
        }, 5050)
      );

      // 8. Alamin Bubble 4 arrives ("Hey Philip! Don’t worry at all.")
      stepTimeouts.push(
        setTimeout(() => {
          if (authorTyping) authorTyping.classList.remove("is-active");
          const b4 = bubbles.find((b) => b.getAttribute("data-chat-bubble") === "4");
          if (b4) b4.classList.add("is-visible");
        }, 6250)
      );

      // 9. Alamin types his direct action plan
      stepTimeouts.push(
        setTimeout(() => {
          if (authorTyping) authorTyping.classList.add("is-active");
        }, 6750)
      );

      // 10. Alamin Bubble 5 arrives ("I'm on it right now. Fixing it personally for you! ⚡")
      stepTimeouts.push(
        setTimeout(() => {
          if (authorTyping) authorTyping.classList.remove("is-active");
          const b5 = bubbles.find((b) => b.getAttribute("data-chat-bubble") === "5");
          if (b5) b5.classList.add("is-visible");
        }, 8050)
      );

      // 11. Reading delay and graceful looping
      stepTimeouts.push(
        setTimeout(() => {
          if (!isHovered && isPlaying) {
            scheduleNextLoop(7500);
          }
        }, 8450)
      );
    }

    function scheduleNextLoop(delay) {
      if (loopTimeout) clearTimeout(loopTimeout);
      loopTimeout = setTimeout(() => {
        if (!isHovered && isPlaying) {
          // Fade out smoothly before restart
          chatCard.classList.add("is-resetting");
          setTimeout(() => {
            runChatSequence();
          }, 380);
        }
      }, delay);
    }

    // Trigger on scroll when visible in viewport
    if ("IntersectionObserver" in window) {
      const chatObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!isPlaying) {
                runChatSequence();
              }
            } else {
              isPlaying = false;
              clearAllChatTimers();
            }
          });
        },
        { threshold: 0.3 }
      );
      chatObserver.observe(chatCard);
    } else {
      runChatSequence();
    }

    // Hover detection: pause loop while user is reading
    chatCard.addEventListener("mouseenter", () => {
      isHovered = true;
      if (loopTimeout) {
        clearTimeout(loopTimeout);
        loopTimeout = null;
      }
    });

    chatCard.addEventListener("mouseleave", () => {
      isHovered = false;
      const allShown = bubbles.every((b) => b.classList.contains("is-visible"));
      if (allShown && isPlaying) {
        scheduleNextLoop(5000);
      }
    });

    // Optional click-to-replay
    chatCard.addEventListener("click", () => {
      clearAllChatTimers();
      runChatSequence();
    });
  }

  // 10. Alture Showreel - Scroll-Driven Video Expansion via GSAP ScrollTrigger
  const showreelSection = document.getElementById("showreelSection");
  const showreelCard = document.getElementById("showreelCard");
  const showreelPlayBtn = document.getElementById("showreelPlayBtn");
  const showreelModal = document.getElementById("showreelModal");
  const modalYoutubeIframe = document.getElementById("modalYoutubeIframe");
  const closeShowreelModal = document.getElementById("closeShowreelModal");
  const closeShowreelBtn = document.getElementById("closeShowreelBtn");
  const showreelYear = document.querySelector(".showreel_year");
  const showreelLabel = document.querySelector(".showreel_label");

  if (showreelSection && showreelCard) {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      const mm = gsap.matchMedia();

      // ==================== DESKTOP (>= 769px) ====================
      // Restores original side-by-side layout: [ ©2026 ] [ video capsule ] [ Showreel ]
      mm.add("(min-width: 769px)", () => {
        // Clear any leftover inline layout properties
        if (showreelYear) gsap.set(showreelYear, { clearProps: "all" });
        if (showreelLabel) gsap.set(showreelLabel, { clearProps: "all" });

        // Initial card setup for desktop
        gsap.set(showreelCard, {
          width: 160,
          height: 58,
          borderRadius: 100,
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          position: "absolute"
        });

        if (showreelPlayBtn) {
          gsap.set(showreelPlayBtn, {
            opacity: 0,
            scale: 0.85,
            pointerEvents: "none"
          });
        }

        // GSAP ScrollTrigger Timeline - Pins section when it fills the viewport (centered row)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: showreelSection,
            start: "top top",
            end: "+=1200",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // 1. Text labels slide horizontally outward and fade out
        if (showreelYear) {
          tl.to(showreelYear, {
            x: -70,
            y: 0,
            opacity: 0,
            ease: "power2.out"
          }, 0);
        }
        if (showreelLabel) {
          tl.to(showreelLabel, {
            x: 70,
            y: 0,
            opacity: 0,
            ease: "power2.out"
          }, 0);
        }

        // 2. Video card smoothly expands from pill shape to 100% full screen
        tl.to(showreelCard, {
          width: () => `${document.documentElement.clientWidth || window.innerWidth}px`,
          height: () => `${showreelSection.offsetHeight || window.innerHeight}px`,
          borderRadius: 0,
          ease: "power1.inOut"
        }, 0);

        // 3. Play button reveals smoothly as card expands
        if (showreelPlayBtn) {
          tl.to(showreelPlayBtn, {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
            ease: "power2.out"
          }, 0.2);
        }
      });

      // ==================== MOBILE (<= 768px) ====================
      // Vertical stack: ©2026 above, capsule middle, Showreel below
      mm.add("(max-width: 768px)", () => {
        // Clear any horizontal x offsets
        if (showreelYear) gsap.set(showreelYear, { clearProps: "x" });
        if (showreelLabel) gsap.set(showreelLabel, { clearProps: "x" });

        // Initial card setup for mobile
        gsap.set(showreelCard, {
          width: 134,
          height: 50,
          borderRadius: 100,
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          position: "absolute"
        });

        if (showreelPlayBtn) {
          gsap.set(showreelPlayBtn, {
            opacity: 0,
            scale: 0.85,
            pointerEvents: "none"
          });
        }

        // GSAP ScrollTrigger Timeline for Mobile
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: showreelSection,
            start: "top top",
            end: "+=750",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        // 1. Text labels drift vertically away from the capsule and fade out
        if (showreelYear) {
          tl.to(showreelYear, {
            y: -45,
            opacity: 0,
            ease: "power2.out"
          }, 0);
        }
        if (showreelLabel) {
          tl.to(showreelLabel, {
            y: 45,
            opacity: 0,
            ease: "power2.out"
          }, 0);
        }

        // 2. Video card expands to full viewport
        tl.to(showreelCard, {
          width: () => `${document.documentElement.clientWidth || window.innerWidth}px`,
          height: () => `${showreelSection.offsetHeight || window.innerHeight}px`,
          borderRadius: 0,
          ease: "power1.inOut"
        }, 0);

        // 3. Play button reveals smoothly
        if (showreelPlayBtn) {
          tl.to(showreelPlayBtn, {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
            ease: "power2.out"
          }, 0.2);
        }
      });
    }

    // Modal Video Trigger for YouTube qHMjTMW1go4
    const youtubeVideoUrl = "https://www.youtube.com/embed/qHMjTMW1go4?autoplay=1&rel=0";

    function openModal(e) {
      if (e) e.preventDefault();
      if (modalYoutubeIframe) {
        modalYoutubeIframe.src = youtubeVideoUrl;
      }
      if (showreelModal) {
        showreelModal.classList.add("open");
      }
      if (typeof lenisInstance !== "undefined" && lenisInstance) {
        lenisInstance.stop();
      }
    }

    function closeModal() {
      if (showreelModal) {
        showreelModal.classList.remove("open");
      }
      if (modalYoutubeIframe) {
        modalYoutubeIframe.src = "";
      }
      if (typeof lenisInstance !== "undefined" && lenisInstance) {
        lenisInstance.start();
      }
    }

    if (showreelPlayBtn) {
      showreelPlayBtn.addEventListener("click", openModal);
    }
    if (closeShowreelModal) {
      closeShowreelModal.addEventListener("click", closeModal);
    }
    if (closeShowreelBtn) {
      closeShowreelBtn.addEventListener("click", closeModal);
    }
  }

  // 11. Testimonials Client Data Progress Bar Animation
  const testSection = document.querySelector(".section_testimonials-redesign");
  if (testSection && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const bars = testSection.querySelectorAll(".testimonials_bar-fill");
    bars.forEach((bar) => {
      const targetWidth = bar.style.width || "90%";
      gsap.fromTo(bar,
        { width: "0%" },
        {
          width: targetWidth,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: testSection,
            start: "top 75%",
            once: true
          }
        }
      );
    });
  }

  // 12. Dynamic Current Year Auto-Updater
  const currentYear = new Date().getFullYear();
  document.querySelectorAll(".current-year").forEach((el) => {
    el.textContent = currentYear;
  });

  // 13. Interactive Aurora Mouse-Move Effect for Pricing Buttons
  const pricingButtons = document.querySelectorAll(".pricing_btn-learn");
  pricingButtons.forEach((btn) => {
    let rafId = null;

    btn.addEventListener("mousemove", (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPercent = (mouseX / rect.width) * 100;
        const yPercent = (mouseY / rect.height) * 100;

        // Dynamic 3D micro-tilt and magnetic displacement
        const moveX = ((mouseX / rect.width) - 0.5) * 8; // -4px to +4px
        const moveY = ((mouseY / rect.height) - 0.5) * 6; // -3px to +3px
        const rotY = ((mouseX / rect.width) - 0.5) * 12; // -6deg to +6deg
        const rotX = -((mouseY / rect.height) - 0.5) * 12; // -6deg to +6deg

        btn.style.setProperty("--x", `${xPercent.toFixed(1)}%`);
        btn.style.setProperty("--y", `${yPercent.toFixed(1)}%`);
        btn.style.setProperty("--move-x", `${moveX.toFixed(1)}px`);
        btn.style.setProperty("--move-y", `${moveY.toFixed(1)}px`);
        btn.style.setProperty("--rot-x", `${rotX.toFixed(1)}deg`);
        btn.style.setProperty("--rot-y", `${rotY.toFixed(1)}deg`);
      });
    });

    btn.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      btn.style.setProperty("--x", "50%");
      btn.style.setProperty("--y", "50%");
      btn.style.setProperty("--move-x", "0px");
      btn.style.setProperty("--move-y", "0px");
      btn.style.setProperty("--rot-x", "0deg");
      btn.style.setProperty("--rot-y", "0deg");
    });
  });

  // 14. Smooth Back-to-Top Button Handler (Lenis + Native Smooth Scroll Fallback)
  const backToTopBtns = document.querySelectorAll(".footer_btn-top, a[href='#top'], a[href='#hero']");
  backToTopBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (lenisInstance) {
        lenisInstance.scrollTo(0, {
          duration: 1.4,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  });

  // 15. Contact Page Form Submission & State Handling
  const contactPageForm = document.getElementById("contactPageForm");
  const contactSuccessState = document.getElementById("contactSuccessState");
  const resetContactBtn = document.getElementById("resetContactBtn");
  const contactSubmitBtn = document.getElementById("contactSubmitBtn");

  if (contactPageForm && contactSuccessState) {
    contactPageForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = `<span>Sending message...</span>`;
      }

      setTimeout(() => {
        contactPageForm.style.display = "none";
        contactSuccessState.classList.add("is-active");

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerHTML = `<span>Send message</span>`;
        }
      }, 600);
    });

    if (resetContactBtn) {
      resetContactBtn.addEventListener("click", () => {
        contactPageForm.reset();
        contactPageForm.style.display = "flex";
        contactSuccessState.classList.remove("is-active");
      });
    }
  }

  // 16. Single Blog Post - Table of Contents Scroll-Spy & Copy Link
  const tocLinks = document.querySelectorAll(".blog-single_toc-link");
  const tocHeadings = document.querySelectorAll(".blog-article_body h2[id]");

  if (tocLinks.length > 0 && tocHeadings.length > 0) {
    function updateTocActive() {
      const scrollPos = window.scrollY + 140;
      let currentId = "";

      tocHeadings.forEach((heading) => {
        if (heading.offsetTop <= scrollPos) {
          currentId = heading.id;
        }
      });

      if (!currentId && tocHeadings.length > 0) {
        currentId = tocHeadings[0].id;
      }

      tocLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${currentId}`) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });
    }

    window.addEventListener("scroll", updateTocActive, { passive: true });
    updateTocActive();

    tocLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (targetId && targetId.startsWith("#")) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            if (typeof lenisInstance !== "undefined" && lenisInstance) {
              lenisInstance.scrollTo(targetEl, { offset: -90, duration: 1 });
            } else {
              const elTop = targetEl.getBoundingClientRect().top + window.scrollY - 90;
              window.scrollTo({ top: elTop, behavior: "smooth" });
            }
          }
        }
      });
    });
  }

  // Copy Article Link to Clipboard
  const copyArticleLinkBtn = document.getElementById("copyArticleLinkBtn");
  const copyLinkText = document.getElementById("copyLinkText");
  if (copyArticleLinkBtn && copyLinkText) {
    copyArticleLinkBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = copyLinkText.innerText;
        copyLinkText.innerText = "Copied!";
        copyArticleLinkBtn.style.background = "#000000";
        copyArticleLinkBtn.style.color = "#ffffff";
        setTimeout(() => {
          copyLinkText.innerText = originalText;
          copyArticleLinkBtn.style.background = "";
          copyArticleLinkBtn.style.color = "";
        }, 2000);
      }).catch(() => {
        copyLinkText.innerText = "Copied!";
        setTimeout(() => { copyLinkText.innerText = "Copy Link"; }, 2000);
      });
    });
  }
});



