import * as THREE from "./assets/vendor/three.module.min.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const images = {
  hero: "assets/images/hero-villa.webp",
  interior: "assets/images/luxury-interior.webp",
  construction: "assets/images/construction-site.webp",
  commercial: "assets/images/commercial-complex.webp"
};

const properties = [];
const projects = [];

let favorites = new Set();
try {
  favorites = new Set(JSON.parse(localStorage.getItem("ramad-favorites") || "[]"));
} catch {
  favorites = new Set();
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

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

function populatePropertyFilters() {
  const locations = [...new Set(properties.map(property => property.locationFilter))];
  const types = [...new Set(properties.map(property => property.type))];
  $("#filter-location").insertAdjacentHTML("beforeend", locations.map(location => `<option value="${escapeAttribute(location)}">${location}</option>`).join(""));
  $("#filter-type").insertAdjacentHTML("beforeend", types.map(type => `<option value="${escapeAttribute(type)}">${type}</option>`).join(""));
}

function propertyCardTemplate(property) {
  const favorite = favorites.has(property.id);
  return `
    <article class="property-card" data-property-id="${property.id}">
      <div class="property-card-inner">
        <div class="property-image" data-cursor="view">
          <img src="${property.image}" alt="${escapeAttribute(property.name)} exterior or interior" width="1672" height="941" loading="lazy">
          <span class="property-badge">${property.status.toUpperCase()}</span>
          <button class="favorite-button ${favorite ? "active" : ""}" type="button" aria-label="${favorite ? "Remove" : "Add"} ${escapeAttribute(property.name)} ${favorite ? "from" : "to"} favorites" aria-pressed="${favorite}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z" ${favorite ? 'fill="currentColor"' : ""}/></svg>
          </button>
          <button class="quick-view" type="button">Quick View</button>
        </div>
        <div class="property-info">
          <div class="property-meta-top"><div><h3>${property.name}</h3><p class="property-location">${property.location}</p></div><strong class="property-price">${formatPrice(property.price)}</strong></div>
          <dl class="property-specs"><div><dt>Beds</dt><dd>${property.bedrooms}</dd></div><div><dt>Baths</dt><dd>${property.bathrooms}</dd></div><div><dt>Area</dt><dd>${property.area} m²</dd></div><div><dt>Type</dt><dd>${property.type.replace("Luxury ", "")}</dd></div></dl>
          <div class="property-actions"><span class="property-type">${property.type}</span><button class="view-property" type="button">View Property <span>↗</span></button></div>
        </div>
      </div>
    </article>`;
}

function getFilteredProperties() {
  const location = $("#filter-location").value;
  const type = $("#filter-type").value;
  const min = Number($("#filter-min").value);
  const max = Number($("#filter-max").value);
  const bedrooms = Number($("#filter-bedrooms").value);
  return properties.filter(property =>
    (location === "all" || property.locationFilter === location) &&
    (type === "all" || property.type === type) &&
    property.price >= min && property.price <= max && property.bedrooms >= bedrooms
  );
}

function renderProperties() {
  const filtered = getFilteredProperties();
  const grid = $("#properties-grid");
  grid.innerHTML = filtered.map(propertyCardTemplate).join("");
  $("#property-count").textContent = filtered.length;
  $("#property-empty").hidden = filtered.length > 0;
  grid.hidden = filtered.length === 0;
  bindPropertyInteractions();
  initTiltCards();
}

function bindPropertyInteractions() {
  $$(".property-card").forEach(card => {
    const id = Number(card.dataset.propertyId);
    const property = properties.find(item => item.id === id);
    $(".favorite-button", card).addEventListener("click", event => {
      event.stopPropagation();
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      try { localStorage.setItem("ramad-favorites", JSON.stringify([...favorites])); } catch { /* Storage can be unavailable in private contexts. */ }
      const button = event.currentTarget;
      const active = favorites.has(id);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", `${active ? "Remove" : "Add"} ${property.name} ${active ? "from" : "to"} favorites`);
      $("path", button).toggleAttribute("fill", active);
      if (active) $("path", button).setAttribute("fill", "currentColor");
      showToast(active ? `${property.name} saved to favorites.` : `${property.name} removed from favorites.`);
    });
    $$(".quick-view, .view-property", card).forEach(button => button.addEventListener("click", () => openPropertyModal(property)));
  });
}

function initPropertyFilters() {
  const form = $("#property-filters");
  $$('select', form).forEach(select => select.addEventListener("change", renderProperties));
  form.addEventListener("submit", event => { event.preventDefault(); renderProperties(); });
  form.addEventListener("reset", () => window.setTimeout(renderProperties, 0));
  $("#empty-reset").addEventListener("click", () => {
    form.reset();
    renderProperties();
  });
}

function initTiltCards() {
  if (reducedMotion || coarsePointer || window.innerWidth < 900) return;
  $$(".property-card").forEach(card => {
    const inner = $(".property-card-inner", card);
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 7;
      const rotateX = -((event.clientY - rect.top) / rect.height - .5) * 6;
      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener("pointerleave", () => { inner.style.transform = "rotateX(0) rotateY(0)"; });
  });
}

let activeProperty = null;
let galleryIndex = 0;

function openPropertyModal(property) {
  activeProperty = property;
  galleryIndex = 0;
  $("#modal-property-title").textContent = property.name;
  $("#modal-location").textContent = property.location;
  $("#modal-price").textContent = formatPrice(property.price);
  $("#modal-status").textContent = property.status.toUpperCase();
  $("#modal-description").textContent = property.description;
  $("#modal-bedrooms").textContent = property.bedrooms;
  $("#modal-bathrooms").textContent = property.bathrooms;
  $("#modal-garage").textContent = property.garage;
  $("#modal-area").textContent = `${property.area} m²`;
  $("#modal-amenities").innerHTML = property.amenities.map(item => `<li>${item}</li>`).join("");
  $("#modal-whatsapp").href = "#";
  $("#gallery-dots").innerHTML = property.gallery.map((_, index) => `<button type="button" data-gallery-index="${index}" aria-label="View image ${index + 1}" class="${index === 0 ? "active" : ""}"></button>`).join("");
  $$("[data-gallery-index]", $("#gallery-dots")).forEach(button => button.addEventListener("click", () => updateGallery(Number(button.dataset.galleryIndex))));
  updateGallery(0);
  const modal = $("#property-modal");
  modal.showModal();
  document.body.classList.add("modal-open");
}

function updateGallery(nextIndex) {
  if (!activeProperty) return;
  galleryIndex = (nextIndex + activeProperty.gallery.length) % activeProperty.gallery.length;
  const modalImage = $("#modal-image");
  if (gsap && !reducedMotion) {
    gsap.to(modalImage, { autoAlpha: 0, duration: .18, onComplete: () => {
      modalImage.src = activeProperty.gallery[galleryIndex];
      modalImage.alt = `${activeProperty.name}, gallery image ${galleryIndex + 1}`;
      gsap.to(modalImage, { autoAlpha: 1, duration: .35 });
    }});
  } else {
    modalImage.src = activeProperty.gallery[galleryIndex];
    modalImage.alt = `${activeProperty.name}, gallery image ${galleryIndex + 1}`;
  }
  $("#gallery-count").textContent = `${String(galleryIndex + 1).padStart(2, "0")} / ${String(activeProperty.gallery.length).padStart(2, "0")}`;
  $$("[data-gallery-index]", $("#gallery-dots")).forEach((button, index) => button.classList.toggle("active", index === galleryIndex));
}

function closePropertyModal() {
  const modal = $("#property-modal");
  if (modal.open) modal.close();
  document.body.classList.remove("modal-open");
}

function initPropertyModal() {
  const modal = $("#property-modal");
  $("#modal-close").addEventListener("click", closePropertyModal);
  $(".gallery-prev").addEventListener("click", () => updateGallery(galleryIndex - 1));
  $(".gallery-next").addEventListener("click", () => updateGallery(galleryIndex + 1));
  modal.addEventListener("click", event => { if (event.target === modal) closePropertyModal(); });
  modal.addEventListener("close", () => document.body.classList.remove("modal-open"));
  document.addEventListener("keydown", event => {
    if (!modal.open) return;
    if (event.key === "ArrowLeft") updateGallery(galleryIndex - 1);
    if (event.key === "ArrowRight") updateGallery(galleryIndex + 1);
  });
  $("#schedule-viewing").addEventListener("click", () => {
    const name = activeProperty?.name || "the selected property";
    closePropertyModal();
    $("#service").value = "Property Viewing";
    $("#message").value = `I would like to schedule a viewing for ${name}.`;
    $("#contact").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    window.setTimeout(() => $("#full-name").focus({ preventScroll: true }), 700);
  });
}

function projectTemplate(project, index) {
  return `
    <article class="project-row" data-type="${project.type.toLowerCase()}" data-status="${project.status.toLowerCase()}">
      <div class="project-image" data-cursor="view"><img src="${project.image}" alt="${escapeAttribute(project.title)}" width="1672" height="941" loading="lazy"><span class="project-number">${String(index + 1).padStart(2, "0")}</span></div>
      <div class="project-copy"><span>${project.type} · ${project.status} · ${project.date}</span><h3>${project.title}</h3><p>${project.location} — ${project.description}</p><a class="text-link" href="#contact" data-project="${escapeAttribute(project.title)}">View Project <i>↗</i></a></div>
    </article>`;
}

function initProjects() {
  $("#projects-list").innerHTML = projects.map(projectTemplate).join("");
  const buttons = $$("[data-project-filter]");
  buttons.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;
    buttons.forEach(item => item.classList.toggle("active", item === button));
    $$(".project-row").forEach(row => {
      const match = filter === "all" || row.dataset.type === filter || row.dataset.status === filter;
      row.hidden = !match;
    });
  }));
  $$('[data-project]').forEach(link => link.addEventListener("click", () => {
    $("#service").value = "Commercial Construction";
    $("#message").value = `I would like to discuss a project similar to ${link.dataset.project}.`;
  }));
}

function initComparison() {
  const comparison = $("#comparison");
  const range = $("#comparison-range");
  const before = $("#comparison-before");
  const handle = $("#comparison-handle");
  const image = $("img", before);
  const update = () => {
    const value = Number(range.value);
    before.style.width = `${value}%`;
    handle.style.left = `${value}%`;
    image.style.width = `${comparison.clientWidth}px`;
  };
  range.addEventListener("input", update);
  window.addEventListener("resize", update, { passive: true });
  update();
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
    field.classList.toggle("invalid", Boolean(message));
    $(".field-error", field).textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  $$('input, select, textarea', form).forEach(input => {
    input.addEventListener("blur", () => validate(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validate(input);
      $("#form-success").classList.remove("show");
    });
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const fields = $$('input, select, textarea', form);
    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      fields.find(input => input.getAttribute("aria-invalid") === "true")?.focus();
      showToast("Please review the highlighted form fields.");
      return;
    }
    const button = $(".submit-button", form);
    button.disabled = true;
    $("span", button).textContent = "Previewing details…";
    window.setTimeout(() => {
      form.reset();
      fields.forEach(input => {
        input.setAttribute("aria-invalid", "false");
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

function initMap() {
  const grid = $(".map-grid");
  let zoom = 1;
  $$("[data-map-zoom]").forEach(button => button.addEventListener("click", () => {
    zoom += button.dataset.mapZoom === "in" ? .15 : -.15;
    zoom = Math.min(1.6, Math.max(.8, zoom));
    grid.style.transform = `scale(${zoom})`;
    showToast(`Map preview ${Math.round(zoom * 100)}%`);
  }));
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
