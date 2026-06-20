import { useState } from "react";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import posthog from "posthog-js";

export default function ProjectShowcase() {
  const { theme } = usePortfolio();
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  return (
    <section className={`w-full min-h-screen py-24 px-8 md:px-12 transition-colors duration-500 pointer-events-auto ${
      theme === 'light' ? 'bg-[#FAF6F0] text-black' : 'bg-[#3B1E1E] text-white border-t border-stone-800'
    }`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className={`text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block ${
              theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'
            }`}
          >
            Selected Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-6xl font-serif italic ${
              theme === 'light' ? 'text-black' : 'text-white'
            }`}
          >
            Digital Artifacts
          </motion.h2>
        </header>

        <div className="flex flex-col gap-32">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={`w-full md:w-3/5 aspect-[16/10] overflow-hidden relative group transition-all duration-500 border ${
                theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-[#2D1616] border-stone-800'
              }`}>
                {activeEmbedId === project.id ? (
                  <div className="absolute inset-0 w-full h-full z-20 pointer-events-auto flex flex-col">
                    {/* Control Bar to Exit */}
                    <div className={`w-full px-4 py-2 flex justify-between items-center z-30 ${
                      theme === 'light' ? 'bg-zinc-100/95 text-black border-b border-zinc-200' : 'bg-black/80 text-white border-b border-stone-800'
                    }`}>
                      <span className="text-[8px] font-mono tracking-widest uppercase">PLAYING LIVE DEMO</span>
                      <button 
                        onClick={() => {
                          setActiveEmbedId(null);
                          posthog.capture("playable_demo_closed", { project_id: project.id });
                        }}
                        className={`text-[8px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded transition-all duration-300 ${
                          theme === 'light' 
                            ? 'border-zinc-300 hover:border-black text-zinc-600 hover:text-black' 
                            : 'border-stone-700 hover:border-white text-stone-300 hover:text-white bg-white/5'
                        }`}
                      >
                        ✕ Close
                      </button>
                    </div>
                    {/* The Live Game Iframe */}
                    <iframe 
                      src={project.link} 
                      title={project.title}
                      className="w-full flex-grow border-0 bg-black"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                    />
                  </div>
                ) : (
                  <>
                    {/* Static Preview & Hover Controls - Elevated to z-20 */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 z-20 pointer-events-auto ${
                      theme === 'light' ? 'text-zinc-800' : 'text-stone-100'
                    }`}>
                      {/* Playable Badge */}
                      {project.id === 'feed-panda' && (
                        <span className={`absolute top-4 left-4 text-[8px] tracking-[0.2em] font-mono uppercase px-2.5 py-0.5 border rounded-full transition-colors duration-500 ${
                          theme === 'light' ? 'border-zinc-300 text-zinc-600 bg-white/90' : 'border-stone-850 text-orange-200 bg-[#3B1E1E]/90'
                        }`}>
                          Playable Demo
                        </span>
                      )}

                      <span className={`font-serif italic text-3xl group-hover:scale-105 transition-transform duration-1000 ${
                        project.image ? 'text-white drop-shadow-md' : ''
                      }`}>
                        {project.title}
                      </span>
                      {project.id === 'feed-panda' && (
                        <button 
                          onClick={() => {
                            setActiveEmbedId(project.id);
                            posthog.capture("playable_demo_started", { project_id: project.id });
                          }}
                          className={`mt-4 px-4 py-2 border rounded-full text-[9px] tracking-widest font-mono uppercase transition-all duration-300 pointer-events-auto hover:scale-105 active:scale-95 ${
                            theme === 'light' 
                              ? 'border-zinc-300 text-zinc-600 hover:text-black hover:border-black bg-white/80 hover:bg-white' 
                              : 'border-stone-700 text-stone-300 hover:text-white hover:border-white bg-[#3B1E1E]/80 hover:bg-[#3B1E1E]'
                          }`}
                        >
                          ▶ Play Live Demo
                        </button>
                      )}
                    </div>
                    {/* Project Cover Image Layer */}
                    {project.image && (
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000 z-0 filter brightness-75 contrast-90"
                      />
                    )}
                    {/* Background Overlay - Pushed to z-10 and set to pointer-events-none */}
                    <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none z-10 ${
                      project.image 
                        ? 'bg-black/30 group-hover:bg-black/45' 
                        : 'bg-black/0 group-hover:bg-black/5'
                    }`} />
                  </>
                )}
              </div>

              <div className="w-full md:w-2/5 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h3 className={`text-3xl md:text-4xl font-serif leading-tight ${
                    theme === 'light' ? 'text-black' : 'text-white'
                  }`}>{project.title}</h3>
                  <span className={`text-[10px] tracking-widest uppercase mt-3 ${
                    theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'
                  }`}>
                    0{index + 1}
                  </span>
                </div>

                <p className={`text-sm md:text-base leading-relaxed mb-8 transition-colors duration-500 ${
                  theme === 'light' ? 'text-zinc-600' : 'text-stone-300'
                }`}>
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  {project.tech.map((t) => (
                    <span 
                      key={t} 
                      className={`text-[9px] tracking-widest uppercase border px-3 py-1 transition-colors duration-500 ${
                        theme === 'light' 
                          ? 'border-zinc-200 text-zinc-500 bg-zinc-50/50' 
                          : 'border-stone-800 text-stone-400 bg-white/5'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    posthog.capture("explore_demo_clicked", { project_id: project.id, link: project.link });
                  }}
                  className={`text-[10px] tracking-[0.3em] uppercase font-bold border-b w-fit pb-1 transition-all duration-300 ${
                    theme === 'light' 
                      ? 'text-black border-black hover:text-zinc-500 hover:border-zinc-500' 
                      : 'text-white border-white hover:text-orange-200 hover:border-orange-200'
                  }`}
                >
                  Explore Demo
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
