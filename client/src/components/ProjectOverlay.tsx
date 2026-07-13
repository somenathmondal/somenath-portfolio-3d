import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import { trackEvent } from "../lib/analytics";

export default function ProjectOverlay() {
  const { theme, activeProject, wheelVisible, scrollToProject } = usePortfolio();
  const [demoId, setDemoId] = useState<string | null>(null);
  const isLight = theme === "light";
  const project = projects[activeProject];

  // Count a "view" once a project has held the front slot for a moment
  useEffect(() => {
    if (!wheelVisible) return;
    const timer = setTimeout(() => {
      trackEvent("project_viewed", { project_id: projects[activeProject].id });
    }, 800);
    return () => clearTimeout(timer);
  }, [activeProject, wheelVisible]);

  const linkStyle = isLight
    ? "text-black border-black hover:text-zinc-500 hover:border-zinc-500"
    : "text-white border-white hover:text-orange-200 hover:border-orange-200";
  const eyebrowStyle = isLight ? "text-zinc-400" : "text-orange-200/50";

  return (
    <>
      <AnimatePresence>
        {wheelVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 pointer-events-none"
          >
            {/* Project info — pinned lower-left, crossfades between projects */}
            <div className="absolute left-8 md:left-12 bottom-8 md:bottom-12 max-w-[calc(100vw-4rem)] md:max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className={`block text-[9px] md:text-[10px] tracking-[0.4em] uppercase font-bold mb-3 ${eyebrowStyle}`}>
                    Selected Works · {String(activeProject + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </span>
                  <h2 className={`font-serif italic leading-[1.05] text-4xl md:text-6xl lg:text-7xl mb-4 ${isLight ? "text-black" : "text-white"}`}>
                    {project.title}
                  </h2>
                  <p className={`text-xs md:text-sm leading-relaxed mb-5 max-w-md ${isLight ? "text-zinc-600" : "text-stone-300"}`}>
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className={`text-[8px] md:text-[9px] tracking-widest uppercase border px-2.5 py-0.5 rounded-sm ${
                          isLight ? "border-zinc-200 text-zinc-500 bg-zinc-50/50" : "border-stone-800 text-stone-400 bg-white/5"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 pointer-events-auto">
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("project_card_clicked", { project_id: project.id, link: project.link })}
                      className={`text-[10px] tracking-[0.3em] uppercase font-bold border-b pb-1 transition-all duration-300 ${linkStyle}`}
                    >
                      Visit project →
                    </a>
                    {project.playable && (
                      <button
                        onClick={() => {
                          setDemoId(project.id);
                          trackEvent("playable_demo_started", { project_id: project.id });
                        }}
                        className={`text-[10px] tracking-[0.3em] uppercase font-bold border-b pb-1 transition-all duration-300 ${linkStyle}`}
                      >
                        ▶ Play demo
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Minimap rail — one tick per project */}
            <nav
              aria-label="Projects"
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 pointer-events-auto"
            >
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  aria-label={p.title}
                  aria-current={i === activeProject}
                  onClick={() => scrollToProject?.(i)}
                  className="group flex items-center justify-end py-0.5"
                >
                  <span
                    className={`block h-[2px] rounded-full transition-all duration-300 ${
                      i === activeProject
                        ? "w-8"
                        : `w-4 group-hover:w-6 ${isLight ? "bg-zinc-300" : "bg-stone-700"}`
                    }`}
                    style={i === activeProject ? { backgroundColor: p.accent } : undefined}
                  />
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playable demo modal */}
      <AnimatePresence>
        {demoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10"
          >
            <div className="w-full h-full max-w-6xl flex flex-col rounded-xl overflow-hidden border border-stone-800">
              <div className="w-full px-4 py-2 flex justify-between items-center bg-black/90 text-white border-b border-stone-800">
                <span className="text-[8px] font-mono tracking-widest uppercase">Playing live demo</span>
                <button
                  onClick={() => {
                    trackEvent("playable_demo_closed", { project_id: demoId });
                    setDemoId(null);
                  }}
                  className="text-[8px] font-mono tracking-widest uppercase border border-stone-700 hover:border-white text-stone-300 hover:text-white bg-white/5 px-2 py-0.5 rounded transition-all duration-300"
                >
                  ✕ Close
                </button>
              </div>
              <iframe
                src={projects.find((p) => p.id === demoId)?.link}
                title={projects.find((p) => p.id === demoId)?.title}
                className="w-full flex-grow border-0 bg-black"
                allow="autoplay; fullscreen; xr-spatial-tracking"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
