import { createRoot } from "react-dom/client";
import App from "./App";
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

createRoot(document.getElementById("root")!).render(<App />);
