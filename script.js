import * as THREE from "./assets/vendor/three.module.min.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function initLoader() {
  const loader = $("#page-loader");
  const count = $(".loader-count", loader);
  const startedAt = performance.now();
  let current = 0;
  const timer = window.setInterval(() => {
    current = Math.min(current + Math.ceil(Math.random() * 9), 94);
    count.textContent = String(current).padStart(2, "0");
  }, 70);

  const finish = () => {
    clearInterval(timer);
    count.textContent = "100";
    const delay = Math.max(0, 900 - (performance.now() - startedAt));
    window.setTimeout(() => {
      if (gsap && !reducedMotion) {
        gsap.to(loader, { yPercent: -100, duration: .85, ease: "power4.inOut", onComplete: () => loader.remove() });
      } else {
        loader.remove();
      }
      animateHero();
    }, delay);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });
}

function splitHeroWords() {
  const title = $(".split-words");
  const words = title.textContent.trim().split(/\s+/);
  title.innerHTML = words.map(word => `<span class="split-word"><span>${word}</span></span>`).join(" ");
}

function animateHero() {
  if (!gsap || reducedMotion) return;
  const timeline = gsap.timeline();
  timeline
    .from(".hero-kicker", { y: 22, autoAlpha: 0, duration: .65 })
    .from(".split-word > span", { yPercent: 120, duration: 1.05, stagger: .07, ease: "power4.out" }, "-=.35")
    .from(".hero-bottom > *", { y: 28, autoAlpha: 0, duration: .7, stagger: .12 }, "-=.55")
    .from(".scroll-cue", { autoAlpha: 0, duration: .5 }, "-=.2");
}

function initHeaderAndNavigation() {
  const header = $("#site-header");
  const progress = $("#scroll-progress-bar");
  const update = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? window.scrollY / available : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });

  const toggle = $("#menu-toggle");
  const closeButton = $("#menu-close");
  const menu = $("#mobile-menu");
  const setMenu = open => {
    menu.classList.toggle("open", open);
    menu.inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (open) $("nav a", menu)?.focus();
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  closeButton.addEventListener("click", () => setMenu(false));
  $$("a[href^='#']", menu).forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.classList.contains("open")) setMenu(false);
  });

  const navLinks = $$(".desktop-nav a");
  const trackedSections = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-30% 0px -60%", threshold: [0, .2, .5] });
  trackedSections.forEach(section => observer.observe(section));
}

function initThreeScene() {
  if (reducedMotion || coarsePointer || window.innerWidth < 900) return;
  const canvas = $("#hero-canvas");
  if (!canvas) return;
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .1, 100);
    camera.position.z = 6;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new THREE.IcosahedronGeometry(1.55, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xc8a96a, wireframe: true, transparent: true, opacity: .16 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(3.2, -.2, -1.2);
    scene.add(mesh);

    const pointGeometry = new THREE.BufferGeometry();
    const positions = [];
    for (let index = 0; index < 80; index += 1) {
      positions.push((Math.random() - .5) * 12, (Math.random() - .5) * 7, (Math.random() - .5) * 4);
    }
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0xe1c995, size: .012, transparent: true, opacity: .45 }));
    scene.add(points);

    let mouseX = 0;
    let mouseY = 0;
    let frame;
    window.addEventListener("pointermove", event => {
      mouseX = (event.clientX / window.innerWidth - .5) * .45;
      mouseY = (event.clientY / window.innerHeight - .5) * .28;
    }, { passive: true });

    const render = () => {
      mesh.rotation.x += .0007;
      mesh.rotation.y += .0012;
      mesh.position.x += (3.2 + mouseX - mesh.position.x) * .035;
      mesh.position.y += (-.2 - mouseY - mesh.position.y) * .035;
      points.rotation.y -= .00013;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(frame);
      else render();
    });
  } catch {
    canvas.remove();
  }
}

function initHeroDepth() {
  if (reducedMotion || coarsePointer) return;
  const hero = $(".hero");
  const media = $(".hero-media img");
  hero.addEventListener("pointermove", event => {
    const x = (event.clientX / window.innerWidth - .5) * 10;
    const y = (event.clientY / window.innerHeight - .5) * 7;
    if (gsap) gsap.to(media, { x, y, duration: 1.25, ease: "power2.out", overwrite: "auto" });
  });
  hero.addEventListener("pointerleave", () => {
    if (gsap) gsap.to(media, { x: 0, y: 0, duration: 1.25, ease: "power2.out" });
  });
}

function initScrollAnimations() {
  if (!gsap || !ScrollTrigger || reducedMotion) return;
  $$(".reveal-up").forEach(element => {
    gsap.from(element, {
      y: 42,
      autoAlpha: 0,
      duration: .9,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true }
    });
  });
  $$(".reveal-mask").forEach(element => {
    gsap.from(element, {
      clipPath: "inset(0 0 100% 0)",
      duration: 1.2,
      ease: "power4.inOut",
      scrollTrigger: { trigger: element, start: "top 85%", once: true }
    });
  });
}

function updateStoryProgress(scene) {
  $(".story-count").textContent = String(scene).padStart(2, "0");
  $("#story-progress-line").style.transform = `scaleY(${scene / 4})`;
}

function initStoryMorph() {
  if (!gsap || !ScrollTrigger || reducedMotion) return;
  const story = $("#story");
  const pin = $(".story-pin", story);
  const scenes = $$(".story-scene", story);
  const mobile = coarsePointer || window.innerWidth < 820;

  scenes.forEach((scene, index) => {
    gsap.set(scene, {
      autoAlpha: index === 0 ? 1 : 0,
      scale: index === 0 ? 1 : 1.18,
      rotateX: 0,
      rotateY: 0,
      clipPath: index === 0 ? "inset(0% 0% 0% 0% round 0px)" : "inset(46% 7% 46% 7% round 28px)",
      zIndex: index + 1
    });
    if (index > 0) gsap.set($(".story-copy", scene), { y: 85, autoAlpha: 0 });
  });

  const timeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: story,
      start: "top top",
      end: () => `+=${window.innerHeight * (scenes.length - .2)}`,
      pin: story,
      scrub: mobile ? .65 : 1.15,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => updateStoryProgress(Math.min(scenes.length, Math.floor(self.progress * scenes.length) + 1))
    }
  });

  for (let index = 1; index < scenes.length; index += 1) {
    const previous = scenes[index - 1];
    const current = scenes[index];
    const direction = index % 2 === 0 ? 1 : -1;
    const label = `scene-${index}`;
    timeline.addLabel(label)
      .to(previous, {
        autoAlpha: 0,
        scale: mobile ? .92 : .78,
        rotateX: mobile ? 0 : -7,
        rotateY: mobile ? 0 : direction * 5,
        clipPath: mobile ? "inset(8% 5% 8% 5% round 22px)" : "inset(13% 10% 13% 10% round 38px)",
        filter: mobile ? "blur(2px)" : "blur(8px)",
        duration: .62
      }, label)
      .fromTo(current, {
        autoAlpha: 0,
        scale: mobile ? 1.08 : 1.25,
        rotateX: mobile ? 0 : 9,
        rotateY: mobile ? 0 : direction * -6,
        clipPath: "inset(46% 7% 46% 7% round 28px)",
        filter: mobile ? "blur(2px)" : "blur(8px)"
      }, {
        autoAlpha: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        clipPath: "inset(0% 0% 0% 0% round 0px)",
        filter: "blur(0px)",
        duration: .72
      }, `${label}+=.12`)
      .to($(".story-copy", current), { y: 0, autoAlpha: 1, duration: .48 }, `${label}+=.38`)
      .to({}, { duration: .34 });
  }
}

function initStats() {
  const stats = $(".stats");
  let animated = false;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || animated) return;
    animated = true;
    $$('[data-count]', stats).forEach(element => {
      const target = Number(element.dataset.count);
      const suffix = element.dataset.suffix || "";
      if (gsap && !reducedMotion) {
        const state = { value: 0 };
        gsap.to(state, { value: target, duration: 1.7, ease: "power2.out", onUpdate: () => { element.textContent = `${Math.round(state.value)}${suffix}`; } });
      } else {
        element.textContent = `${target}${suffix}`;
      }
    });
    observer.disconnect();
  }, { threshold: .28 });
  observer.observe(stats);
}

function initForm() {
  const form = $("#consultation-form");
  const date = $("#preferred-date");
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  date.min = localDate;
  const errorSummary = $("#form-errors");

  const validationMessage = input => {
    const value = input.value.trim();
    if (!value) return "This field is required.";
    if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    if (input.type === "tel" && value.replace(/\D/g, "").length < 7) return "Enter a valid phone number.";
    if (input.type === "date" && value < date.min) return "Choose today or a future date.";
    if (input.tagName === "TEXTAREA" && value.length < 12) return "Please add at least 12 characters.";
    return "";
  };

  const validate = input => {
    const message = validationMessage(input);
    const field = input.closest(".field");
    const error = $(".field-error", field);
    field.classList.toggle("invalid", Boolean(message));
    error.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    if (message) input.setAttribute("aria-errormessage", error.id);
    else input.removeAttribute("aria-errormessage");
    return !message;
  };

  const showErrorSummary = invalidFields => {
    errorSummary.replaceChildren();
    errorSummary.hidden = invalidFields.length === 0;
    if (!invalidFields.length) return;

    const heading = document.createElement("strong");
    heading.textContent = "Please correct the following fields:";
    const list = document.createElement("ul");

    invalidFields.forEach(input => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const label = $(".field > span", input.closest(".field"))?.textContent.replace(/\s*\*$/, "") || input.name;
      link.href = `#${input.id}`;
      link.textContent = `${label}: ${validationMessage(input)}`;
      link.addEventListener("click", event => {
        event.preventDefault();
        input.focus();
      });
      item.append(link);
      list.append(item);
    });

    errorSummary.append(heading, list);
  };

  $('input, select, textarea', form).forEach(input => {
    input.addEventListener("blur", () => validate(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validate(input);
      errorSummary.hidden = true;
      $("#form-success").classList.remove("show");
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const fields = $('input, select, textarea', form);
    fields.forEach(validate);
    const invalidFields = fields.filter(input => input.getAttribute("aria-invalid") === "true");
    showErrorSummary(invalidFields);
    if (invalidFields.length) {
      errorSummary.focus();
      showToast("Please review the highlighted form fields.");
      return;
    }
    const button = $(".submit-button", form);
    button.disabled = true;
    $("span", button).textContent = "Previewing details…";
    window.setTimeout(() => {
      form.reset();
      showErrorSummary([]);
      fields.forEach(input => {
        input.setAttribute("aria-invalid", "false");
        input.removeAttribute("aria-errormessage");
        input.closest(".field").classList.remove("invalid");
        $(".field-error", input.closest(".field")).textContent = "";
      });
      button.disabled = false;
      $("span", button).textContent = "Preview Consultation Request";
      $("#form-success").classList.add("show");
      showToast("Demo preview completed; no request was sent.");
    }, 700);
  });

  $$("[data-service]").forEach(link => link.addEventListener("click", () => { $("#service").value = link.dataset.service; }));
}

function initMagneticButtons() {
  if (coarsePointer || reducedMotion || !gsap) return;
  $$(".magnetic").forEach(element => {
    element.addEventListener("pointermove", event => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .22;
      const y = (event.clientY - rect.top - rect.height / 2) * .22;
      gsap.to(element, { x, y, duration: .35, ease: "power2.out" });
    });
    element.addEventListener("pointerleave", () => gsap.to(element, { x: 0, y: 0, duration: .55, ease: "elastic.out(1,.45)" }));
  });
}

function initCursor() {
  if (coarsePointer || window.innerWidth < 900) return;
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");
  let pointerX = -100;
  let pointerY = -100;
  let ringX = -100;
  let ringY = -100;
  window.addEventListener("pointermove", event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    dot.style.transform = `translate(${pointerX}px, ${pointerY}px) translate(-50%,-50%)`;
  }, { passive: true });
  const follow = () => {
    ringX += (pointerX - ringX) * .14;
    ringY += (pointerY - ringY) * .14;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.addEventListener("pointerover", event => { ring.classList.toggle("viewing", Boolean(event.target.closest("[data-cursor='view']"))); });
}

function initGlobalActions() {
  $("#current-year").textContent = new Date().getFullYear();
  $("#back-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
}

splitHeroWords();
initLoader();
initHeaderAndNavigation();
initThreeScene();
initHeroDepth();
initScrollAnimations();
initStoryMorph();
initStats();
initForm();
initMagneticButtons();
initCursor();
initGlobalActions();
