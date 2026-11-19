# Aqua Dynamics · Next.js

A separate Aqua Dynamics landing page, with minimal wording and a scroll-led product story inspired by [Seasats](https://www.seasats.com/#quickfish). Visible copy is limited to main headings, product and feature controls, actions and contact details.

## Run

Requires Node.js 20.9 or newer.

```sh
cd aqua-next
npm install
npm run dev
```

Open **http://localhost:3001**. Use `npm run build` and `npm start` for production. Set `SITE_URL` to your public origin before a hosted build.

## Landing page flow

Ocean opening → pinned product reveal → Materials / Stitching / Construction → product selector → factory → people → contact.

The single sticky product stage contains three scroll chapters: Sailing, Wing Foil and Paragliding. The objects enter, grow and rotate with scroll. Three.js draws actual curved textile geometry, seam details, wing struts and canopy lines. Desktop visitors can drag to rotate; the Reset view control restores the camera angle. Labels track points on the rotating model. The floating selector updates the product, palette, detail copy and URL; deep links such as `/#wingfoil` work directly.

These procedural 3D objects are **illustrative textile forms**, not CAD models or representations of particular manufactured products. Replace the geometry in `lib/product-models.js` when approved product assets become available. Existing Aqua Dynamics photographs can be opened from the product inset.

On phones, shorter scroll chapters keep the selector and feature controls visible. Reduced-motion mode uses a stationary stage with manual product and feature selection. When WebGL is unavailable, local SVG illustrations preserve the experience. Rendering stops when the object is settled or offscreen; the renderer, textures and meshes are disposed on unmount.

The factory section uses three supplied AI-generated MP4 films: material unrolling, stitching and the finished sail-panel reveal. A pinned pale stage starts with three small video previews along the bottom and reveals stacked headlines above. The centre preview rises over the type into a large card, then expands to fill the screen. A masked title slides into view at the upper left only after expansion, and the remaining films crossfade within the full-screen stage before releasing into the people section. Scrolling upward reverses the expansion. Dot controls select chapters; a pause button appears on hover, focus or touch. Videos load near the section, play muted and inline, and pause offscreen or when the browser tab is hidden. Reduced-motion mode provides manual chapter selection and starts paused. Local poster images are extracted from the supplied clips. The people section uses a wide real workshop photograph from the official People page, with a left-aligned headline, one supporting sentence and an in-page “Meet our people” disclosure. The three fact buttons open People, Expertise and Long-serving Team stories in an inline panel with crossfading real photographs; no People control navigates to another website. The panel can be closed and supports keyboard interaction. Three facts below show 2,100+ people, 35+ years of manufacturing expertise and 10+ years of tenure for most employees, as stated on the official People page. The photograph moves gently with scroll, respecting reduced motion. On phones, text and photograph stack vertically. Photo provenance is retained in `public/images/people/SOURCES.md`. The generated wingfoil rider artwork keeps the upper contact background pale and clear, with the rider and teal water below and a large wordmark at the bottom. A gentle zoom respects reduced-motion preferences. An optimized WebP is used on the page; the original PNG and generation prompt are retained in `public/images/`. Native dialogs provide keyboard focus handling and Escape-to-close. Enquiries validate fields and open a prefilled email draft for the visitor to review and send. The site does not send or store messages.

## Opening video

The supplied `public/202611191126 (1).mp4` (47.547 seconds) plays in full as the opening through an optimized 1080p, 30fps H.264 copy at `public/videos/aqua-dynamics-hero.mp4`. Audio is omitted from the background version. A matching still extracted at 1.2 seconds is configured as the poster and reduced-motion fallback in `lib/site-config.js`. The original upload is retained.

The video plays muted and inline, loops and includes a play/pause control. Playback events keep the control in sync with the browser. To replace it, update `heroVideo` and `heroPoster` in the config. Set `heroVideo` to `null` to show only the poster.

## Living footer

`components/LivingFooter.jsx` animates the existing wingfoil photograph with a WebGL shader: moving ocean ripples, subtle underwater sunlight and a gentle bob of the wing, rider and foil together. Pointer movement adds a small water drift. The sky and overlaid contact text remain clear, and the complete wordmark remains visible.

The circular pause/play control stops and resumes the motion. Rendering is capped at 30fps and pauses offscreen and in hidden tabs. Reduced-motion preferences, unavailable WebGL and context loss use the original still image. The photo and animation both respect the GitHub Pages base path.

## Main files

- `components/FactoryFilms.jsx`: three factory video chapters, playback and scroll transitions.
- `components/ProductExperience.jsx`: scroll chapters, feature controls and product selector.
- `components/ProductCanvas.jsx`: Three.js lifecycle and pointer interaction.
- `lib/product-models.js`: procedural sail, wing and canopy geometry.
- `lib/journey.mjs`: scroll-to-chapter and model-pose calculations.
- `lib/product-details.js`: product titles and palettes.
- `app/globals.css`: layout and responsive styles.

Photography and company context are reused from the existing redesign, originally sourced from [Aqua Dynamics](https://www.aquadynamics.lk/). Fonts are local with licenses included. The existing `aqua-redesign/` remains independent.

## GitHub Pages

Deployment address: **https://tradex-innovations.github.io/Aqua-dynamics/**. The repository is public and the Pages source is configured as **GitHub Actions**.

The repository workflow `.github/workflows/deploy-pages.yml` builds and publishes `aqua-next/`, runs the seven regression checks, and deploys its static `out/` directory. Select **GitHub Actions** under the repository’s **Settings → Pages → Build and deployment → Source**. GitHub requires a public repository or an eligible paid plan for Pages hosting.

After Pages is enabled, pushes to `main` that change this app trigger deployment. The workflow can also be started manually from Actions. It obtains the correct site URL and base path from GitHub, including support for a repository URL such as `https://tradex-innovations.github.io/Aqua-dynamics/`.

To check the Pages export locally:

```sh
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/Aqua-dynamics SITE_URL=https://tradex-innovations.github.io/Aqua-dynamics npm run build
```

Images and videos use `lib/asset-path.js` so they load beneath the repository path. Static export disables the server-only image optimizer; normal local development retains image optimization.
