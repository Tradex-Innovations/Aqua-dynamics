# Aqua Dynamics — Engineered for the Elements

The current Next.js landing page lives in **[aqua-next](aqua-next/README.md)**. Its GitHub Pages deployment is configured in `.github/workflows/deploy-pages.yml`. The instructions below describe the earlier independent static redesign.

An interactive redesign of [aquadynamics.lk](https://www.aquadynamics.lk/), with ocean tones, oversized editorial typography, lime accents and original brand photography.

## Run locally

Requires Node.js 18 or newer. No dependencies or build step are needed.

```sh
npm run dev
```

Open http://localhost:3000. Set `PORT` to change the port. Run `npm run check` for JavaScript syntax validation.

The website lives in `aqua-redesign/dist/`. It can be served directly by any static host. The development server and publication configuration live in `aqua-redesign/`.

## Interactions

- Three selectable full-screen hero scenes.
- Filterable seven-sector gallery with horizontal drag, touch scrolling and keyboard navigation.
- Sector detail dialogs with project-specific enquiry links.
- Accessible manufacturing tabs and a three-chapter factory photo story.
- Responsibility accordions, scroll reveals, reading progress and mobile navigation.
- Contact form with native validation and a prefilled email draft. It opens the visitor’s email client; it does not send a message or store enquiries.
- Reduced-motion support, visible focus states, dialog focus handling and a skip link.

## Design references

- [Dribbble: marine website inspiration](https://dribbble.com/tags/marine-website) — photographic storytelling and confident maritime layouts.
- [Dribbble: Safe Harbor Marinas](https://dribbble.com/shots/26707704-Safe-Harbor-Marinas-Luxury-Yacht-Services-Website) — restrained ocean palette and clear navigation.
- [Behance: LX Sailing, Rebrand + Website](https://www.behance.net/gallery/153356557/LX-Sailing-%28Rebrand-Website%29) — movement-led nautical identity.

This is an original implementation inspired by those visual directions. Photography and company information come from Aqua Dynamics’ public website. No customer testimonials, production statistics or partnerships have been invented. The footer identifies the site as a redesign concept.
