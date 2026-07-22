# Ramad Construction and Real Estate

A premium, cinematic single-page website for **Ramad Construction and Real Estate**, built for construction, property sales, rentals, architectural services, and property management in Somaliland.

## Live website

[https://ramad-construction-real-estate.vercel.app](https://ramad-construction-real-estate.vercel.app)

## Highlights

- Full-screen cinematic hero and four-scene architectural story
- Lightweight Three.js depth treatment with desktop-only performance safeguards
- GSAP and ScrollTrigger reveals, parallax, sticky scenes, and statistics
- Eight construction and real-estate service cards
- Honest placeholders for property inventory, project case studies, company statistics, and contact details until verified data is supplied
- Validated consultation-preview form that clearly states no request is transmitted or stored
- Working mobile navigation and back-to-top action
- Canonical, Open Graph, Twitter, WebSite, and Organization metadata
- Robots, sitemap, and custom 404 files
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
├── 404.html
├── robots.txt
├── sitemap.xml
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

The architectural visuals were created specifically for this concept and optimized as WebP assets. They are labelled as concept visuals and are not presented as completed client projects. Property inventory, prices, statistics, agents, testimonials, phone, WhatsApp, email, address, opening hours, project history, and social profiles must remain unpublished until the owner supplies verifiable information.

## Search visibility setup

Canonical website: `https://ramad-construction-real-estate.vercel.app/`

- Sitemap: `https://ramad-construction-real-estate.vercel.app/sitemap.xml`
- Robots file: `https://ramad-construction-real-estate.vercel.app/robots.txt`

To connect Google Search Console:

1. Add the canonical production URL as a URL-prefix property.
2. Verify ownership. For the HTML-tag method, place Google's verification `<meta>` tag inside the `<head>` of `index.html`, deploy it, and then click **Verify**.
3. Submit `sitemap.xml` in the **Sitemaps** report.
4. Inspect the homepage, run the live test, and request indexing only after the production deployment is verified.
5. Monitor Page Indexing and Core Web Vitals after Google crawls the site.

Search Console access remains a manual owner action. Do not add `LocalBusiness` or `RealEstateAgent` structured data until the operating name, address, phone, service area, and opening hours are verified. After that, create or verify a Google Business Profile, use the same name/address/phone everywhere, add the website and services, upload real project photos, and request only genuine customer reviews.

## License

© 2026 Ramad Construction and Real Estate. All rights reserved.
