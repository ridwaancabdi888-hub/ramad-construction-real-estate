# Ramad Construction and Real Estate

A premium, cinematic single-page website for **Ramad Construction and Real Estate**, built for construction, property sales, rentals, architectural services, and property management in Somaliland.

## Live website

[https://ramad-construction-real-estate.vercel.app](https://ramad-construction-real-estate.vercel.app)

## Highlights

- Full-screen cinematic hero and four-scene architectural story
- Lightweight Three.js depth treatment with desktop-only performance safeguards
- GSAP and ScrollTrigger reveals, parallax, sticky scenes, and statistics
- Eight construction and real-estate service cards
- Six searchable and filterable property listings
- Favorites stored in the browser
- Full-screen property details dialog with gallery, specifications, amenities, agent details, WhatsApp inquiry, and viewing workflow
- Filterable completed and ongoing project portfolio
- Interactive before/after construction comparison
- Validated consultation form with an in-browser success state
- Working mobile navigation, map preview controls, contact links, and back-to-top action
- Keyboard navigation, reduced-motion support, semantic HTML, and visible focus states
- Responsive layouts for desktop, laptop, tablet, and mobile

## Technology

- HTML5
- CSS3
- Vanilla JavaScript (ES modules)
- Three.js
- GSAP with ScrollTrigger

The project has no framework, database, backend, or build step. Three.js and GSAP are vendored locally in `assets/vendor` so the production experience does not depend on third-party CDNs.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
├── vercel.json
└── assets
    ├── icons
    │   ├── favicon.svg
    │   └── sprite.svg
    ├── images
    │   ├── commercial-complex.webp
    │   ├── construction-site.webp
    │   ├── hero-villa.webp
    │   └── luxury-interior.webp
    └── vendor
        ├── ScrollTrigger.min.js
        ├── gsap.min.js
        ├── three.core.min.js
        └── three.module.min.js
```

## Run locally

ES modules require the site to be opened through a local HTTP server rather than directly from the file system.

Using Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Using Node.js:

```bash
npx serve .
```

## Deployment

This repository is configured as a static Vercel project:

- Framework preset: Other
- Build command: none
- Output directory: project root (`.`)
- Root directory: repository root

## Image and content note

The architectural visuals were created specifically for this concept and optimized as WebP assets. Property availability, prices, agent details, phone number, and email address are demonstration content and should be replaced with verified company information before commercial use.

## License

© 2026 Ramad Construction and Real Estate. All rights reserved.
