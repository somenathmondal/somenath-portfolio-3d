# Portfolio Project Roadmap & Tasks

Here is our current roadmap of tasks to improve the portfolio site.

## Task List

- [x] **Task 1: Optimize SVG Loader Animation**
  - *Status*: Completed & Pushed in commit `a2d0038`
  - *Description*: Optimized the initial loader SVG tracing, fluid levels, and numerical progress text to update directly via DOM refs within the requestAnimationFrame loop, completely avoiding high-frequency React component re-renders and CSS stylesheet invalidations.
- [x] **Task 3: Asset & Bundle Quick Wins (from SWOT audit)**
  - *Status*: Completed (uncommitted)
  - *Description*: Converted the 4 large project PNGs to webp (~3.5 MB saved), replaced the 219 KB favicon with an 8 KB 64px version plus a 180px apple-touch-icon, deleted unreferenced public assets (textures/, sounds/, geometries/, fonts/inter.json, Portfolio_Image.png), lazy-loaded Tweakpane and r3f-perf behind the `#debug` hash (~113 KB gzip off the initial bundle), and added an Email contact link to the hero footer with PostHog/GA tracking.
- [x] **Task 2: Expand Project Showcases**
  - *Status*: Completed & Pushed
  - *Source Reference*: [NexReality](https://nexreality.io/index.html)
  - *Description*: Reviewed the individual projects showcased on the NexReality website, downloaded their high-quality preview webp images, and successfully integrated them into our project card showcases database (`client/src/data/projects.ts`).
