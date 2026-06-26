import { useState } from "react";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import posthog from "posthog-js";

export default function ProjectShowcase() {
  const { theme } = usePortfolio();
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);

  const handleCardClick = (project: any) => {
    if (activeEmbedId === project.id) return;
    posthog.capture("project_card_clicked", { project_id: project.id, link: project.link });
    window.open(project.link, "_blank", "noopener,noreferrer");
  };

  const isLight = theme === "light";

  return (
    <section className={`w-full min-h-screen py-24 px-8 md:px-12 transition-colors duration-500 pointer-events-auto relative overflow-hidden ${
      isLight ? 'bg-[#FAF6F0] text-black' : 'bg-[#09090b] text-white border-t border-zinc-900'
    }`}>
      
      {/* Dynamic Background Blur Blobs */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-900/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-orange-400/10 dark:bg-orange-950/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className={`text-[10px] tracking-[0.4em] uppercase font-bold mb-4 block ${
              isLight ? 'text-zinc-400' : 'text-orange-200/50'
            }`}
          >
            Selected Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-6xl font-serif italic ${
              isLight ? 'text-black' : 'text-white'
            }`}
          >
            Digital Artifacts
          </motion.h2>
        </header>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => handleCardClick(project)}
              className={`group flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 relative ${
                isLight 
                  ? 'bg-white/75 border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/90 hover:border-zinc-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2' 
                  : 'bg-zinc-900/60 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-zinc-900/85 hover:border-zinc-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:-translate-y-2'
              } backdrop-blur-xl`}
            >
              {/* Image Section */}
              <div className="relative aspect-[16/10] overflow-hidden w-full border-b border-inherit">
                {activeEmbedId === project.id ? (
                  <div className="absolute inset-0 w-full h-full z-20 pointer-events-auto flex flex-col">
                    {/* Control Bar to Exit */}
                    <div className={`w-full px-4 py-2 flex justify-between items-center z-30 ${
                      isLight ? 'bg-zinc-100/95 text-black border-b border-zinc-200' : 'bg-black/80 text-white border-b border-stone-800'
                    }`}>
                      <span className="text-[8px] font-mono tracking-widest uppercase">PLAYING LIVE DEMO</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmbedId(null);
                          posthog.capture("playable_demo_closed", { project_id: project.id });
                        }}
                        className={`text-[8px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded transition-all duration-300 ${
                          isLight 
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
                    {/* Playable Badge */}
                    {project.id === 'feed-panda' && (
                      <span className={`absolute top-4 left-4 text-[8px] tracking-[0.2em] font-mono uppercase px-2.5 py-0.5 border rounded-full z-10 transition-colors duration-500 ${
                        isLight ? 'border-zinc-300 text-zinc-600 bg-white/90' : 'border-zinc-800 text-orange-200 bg-[#09090b]/90'
                      }`}>
                        Playable Demo
                      </span>
                    )}

                    {project.image && (
                      <img 
                        src={project.image} 
                        alt={project.title} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-[0.98] dark:brightness-75 contrast-95"
                      />
                    )}
                    
                    {/* Hover Playable Button Overlay for Feed Panda */}
                    {project.id === 'feed-panda' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEmbedId(project.id);
                            posthog.capture("playable_demo_started", { project_id: project.id });
                          }}
                          className={`px-4 py-2 border rounded-full text-[9px] tracking-widest font-mono uppercase transition-all duration-300 hover:scale-105 active:scale-95 ${
                            isLight 
                              ? 'border-zinc-300 text-zinc-600 hover:text-black hover:border-black bg-white/80 hover:bg-white' 
                              : 'border-zinc-800 text-stone-300 hover:text-white hover:border-white bg-[#09090b]/80 hover:bg-[#09090b]'
                          }`}
                        >
                          ▶ Play Live Demo
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Content Details Section */}
              <div className="flex flex-col flex-grow p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-2xl md:text-3xl font-serif leading-tight ${
                    isLight ? 'text-black' : 'text-white'
                  }`}>{project.title}</h3>
                  <span className={`text-[10px] tracking-widest uppercase mt-2.5 ${
                    isLight ? 'text-zinc-400' : 'text-orange-200/50'
                  }`}>
                    0{index + 1}
                  </span>
                </div>

                <p className={`text-xs md:text-sm leading-relaxed mb-6 flex-grow transition-colors duration-500 ${
                  isLight ? 'text-zinc-600' : 'text-stone-300'
                }`}>
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((t) => (
                    <span 
                      key={t} 
                      className={`text-[8px] md:text-[9px] tracking-widest uppercase border px-2.5 py-0.5 rounded-sm transition-colors duration-500 ${
                        isLight 
                          ? 'border-zinc-200 text-zinc-500 bg-zinc-50/50' 
                          : 'border-stone-800 text-stone-400 bg-white/5'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className={`text-[10px] tracking-[0.3em] uppercase font-bold border-b w-fit pb-1 transition-all duration-300 ${
                  isLight 
                    ? 'text-black border-black group-hover:text-zinc-500 group-hover:border-zinc-500' 
                    : 'text-white border-white group-hover:text-orange-200 group-hover:border-orange-200'
                }`}>
                  Explore Demo
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
