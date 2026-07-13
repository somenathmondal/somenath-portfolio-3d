import { createRoot } from "react-dom/client";
import App from "./App";
import EffectsLab from "./components/lab/EffectsLab";
import "./index.css";
import posthog from "posthog-js";

// Initialize PostHog before rendering
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey && typeof window !== "undefined") {
  posthog.init(posthogKey, {
    api_host: "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
  });
}

// #lab renders the effects playground instead of the portfolio (same pattern as #debug)
const isLab = window.location.hash === "#lab";
window.addEventListener("hashchange", () => window.location.reload());

createRoot(document.getElementById("root")!).render(isLab ? <EffectsLab /> : <App />);
