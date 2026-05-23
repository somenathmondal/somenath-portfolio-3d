# Somenath Portfolio — Developer Blueprint & Agent Guide

This document defines the high-fidelity client architecture, developer workflows, and system constraints for Somenath Mondal's 3D Portfolio.

---

## 🛠 Tech Stack

*   **Framework & Tools**: React 18 (Client-side), TypeScript, Vite (frontend bundler), PostCSS.
*   **3D WebGL Layer**: Three.js, React Three Fiber (R3F), `@react-three/drei` (Scroll controls, texturing).
*   **Animations & Style**: Framer Motion (micro-actions, fading overlays), Vanilla CSS + Tailwind CSS (dynamic thematic styles).
*   **State & Store**: Zustand (light/dark theme toggles & loading sequences).
*   **Dual-Layer Analytics**: Vercel Web Analytics (traffic aggregates, CWV speed) + PostHog-js (session replay, custom event funnels).

---

## 🏛 System Architecture Overview

The portfolio uses a high-performance **dual-layered rendering architecture** designed to isolate intensive 3D operations from standard HTML interfaces:

1.  **WebGL Layer (`z-10`)**: Standard R3F canvas executing the spring-back reactive initials, custom GLSL transmission shaders, and ambient sunset lights. DPR is strictly bounded to `[1, 1.5]` to preserve frame rate on high-DPI and ultra-wide devices.
2.  **HTML Editorial Layer (`z-20`)**: Renders on top of the 3D scene inside Drei's scrolling system. Utilizes precise z-indexing (`pointer-events-none` on background layers, `pointer-events-auto` on headers/buttons) to resolve click blockage vectors.
3.  **Playable Embed Showcase**: Renders browser-native simulations (like *Feed Panda*) inside interactive borderless iframes with immediate close triggers and safe `onError` thumbnail image handlers.

---

## 📊 Telemetry & Instrumented Event Hooks

Key interactive nodes are instrumented with **PostHog Client telemetry**:

*   `"theme_toggled"`: Captured when the Sun/Moon button is clicked. Sends `{ new_theme: 'light' | 'dark' }`.
*   `"playable_demo_started"`: Captured when `▶ Play Live Demo` is loaded. Sends `{ project_id: string }`.
*   `"playable_demo_closed"`: Captured when the player is closed. Sends `{ project_id: string }`.
*   `"explore_demo_clicked"`: Captured on external outbound links. Sends `{ project_id: string, link: string }`.
*   `"social_link_clicked"`: Captured on footer links. Sends `{ platform: "linkedin" | "github" | "youtube" | "spotify" }`.

---

## 🔄 Developer & Agent Workflows

### Dev Servers & Compilations
*   **Start Local Dev Server**: `npm run dev` (starts the local Vite server).
*   **Production Build**: `npm run build` (compiles production files under `/dist` with tsc checks).
*   **Key Isolation**: All environment tokens (e.g. PostHog client keys) must be resolved via `import.meta.env.VITE_POSTHOG_KEY` to degrade gracefully if undefined.

### ⚠️ CRITICAL ARCHITECTURE RULE
Before executing **ANY** git commit or push to the repository, you **MUST** explicitly ask Somenath whether to update the architectural diagrams inside `DESIGN.md` and `GEMINI.md`. Keep this sync process strict.

