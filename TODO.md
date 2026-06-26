# Portfolio Project Roadmap & Tasks

Here is our current roadmap of tasks to improve the portfolio site.

## Task List

- [x] **Task 1: Optimize SVG Loader Animation**
  - *Status*: Completed & Pushed in commit `a2d0038`
  - *Description*: Optimized the initial loader SVG tracing, fluid levels, and numerical progress text to update directly via DOM refs within the requestAnimationFrame loop, completely avoiding high-frequency React component re-renders and CSS stylesheet invalidations.
- [ ] **Task 2: Expand Project Showcases**
  - *Status*: Pending
  - *Source Reference*: [NexReality](https://nexreality.io/index.html)
  - *Description*: Review individual projects showcased on the NexReality portfolio and copy/integrate selected project items into our own project card showcases database (`client/src/data/projects.ts`).
