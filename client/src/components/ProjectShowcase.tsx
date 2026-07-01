import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "../data/projects";
import { usePortfolio } from "../lib/stores/usePortfolio";
import posthog from "posthog-js";

const lightBgTints: Record<string, string> = {
  "feed-panda": "#FCFAF2",
  "messi-albiceleste": "#F1FAF8",
  "3d-kinematic-visualizer": "#FAF5FC",
  "jersey-configurator": "#F2F7FA",
  "lounge-chair-configurator": "#F6FAF2",
  "watch-configurator": "#FAF2F4",
  "scientific-exploration": "#FAF2F0",
  "medical-education": "#FAF2F2",
  "product-discovery-ar": "#F4FAF2",
  "comfort-chair-configurator": "#FAF8F6",
};

const darkBgTints: Record<string, string> = {
  "feed-panda": "#110E07",
  "messi-albiceleste": "#021115",
  "3d-kinematic-visualizer": "#0A050F",
  "jersey-configurator": "#050F15",
  "lounge-chair-configurator": "#0B1008",
  "watch-configurator": "#130E0F",
  "scientific-exploration": "#100908",
  "medical-education": "#130607",
  "product-discovery-ar": "#050A02",
  "comfort-chair-configurator": "#0F0E0D",
};

export default function ProjectShowcase() {
  const { theme } = usePortfolio();
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const handleCardClick = (project: any) => {
    if (activeEmbedId === project.id) return;
    posthog.capture("project_card_clicked", { project_id: project.id, link: project.link });
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "project_card_clicked", {
        project_id: project.id,
        link: project.link
      });
    }
    window.open(project.link, "_blank", "noopener,noreferrer");
  };

  const isLight = theme === "light";

  const activeProject = projects.find(p => p.id === hoveredProjectId);
  
  // Immersive full-screen background tint transition
  const defaultBg = isLight ? "#FAF6F0" : "#09090b";
  const sectionBgColor = activeProject 
    ? (isLight ? (lightBgTints[activeProject.id] || defaultBg) : (darkBgTints[activeProject.id] || defaultBg))
    : defaultBg;

  // Ambient organic glow colors
  const blobColor = activeProject 
    ? activeProject.backgroundColor 
    : (isLight ? "#14b8a6" : "#115e59");
  const blobOpacity = activeProject ? 0.22 : 0.06;

  const blobColorAlt = activeProject
    ? activeProject.backgroundColor 
    : (isLight ? "#f97316" : "#c2410c");
  const blobOpacityAlt = activeProject ? 0.15 : 0.04;

  return (
    <motion.section 
      animate={{ backgroundColor: sectionBgColor }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`w-full min-h-screen py-24 px-8 md:px-12 pointer-events-auto relative overflow-hidden ${
        isLight ? 'text-black' : 'text-white border-t border-zinc-900'
      }`}
    >
      
      {/* Mancini-inspired Dynamic Background Ambient Glows */}
      <motion.div 
        animate={{ backgroundColor: blobColor, opacity: blobOpacity }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/4 left-[5%] w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none" 
      />
      <motion.div 
        animate={{ backgroundColor: blobColorAlt, opacity: blobOpacityAlt }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-1/4 right-[5%] w-[800px] h-[800px] rounded-full blur-[150px] pointer-events-none" 
      />

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
          {projects.map((project, index) => {
            const isHovered = hoveredProjectId === project.id;
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => handleCardClick(project)}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
                className={`group flex flex-col h-full rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 relative ${
                  isLight 
                    ? 'bg-white/75 border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/90' 
                    : 'bg-zinc-900/60 border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:bg-zinc-900/85'
                } backdrop-blur-xl`}
                style={{
                  borderColor: isHovered ? project.backgroundColor : undefined,
                  boxShadow: isHovered 
                    ? (isLight 
                        ? `0 20px 50px -12px ${project.backgroundColor}33` 
                        : `0 20px 50px -12px ${project.backgroundColor}59`) 
                    : undefined,
                  transform: isHovered ? 'translateY(-8px)' : undefined
                }}
              >
                {/* Image & Video Section */}
                <div className="relative aspect-[16/10] overflow-hidden w-full border-b border-inherit bg-zinc-950">
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
                            if (typeof window !== "undefined" && (window as any).gtag) {
                              (window as any).gtag("event", "playable_demo_closed", {
                                project_id: project.id
                              });
                            }
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
                        <span className={`absolute top-4 left-4 text-[8px] tracking-[0.2em] font-mono uppercase px-2.5 py-0.5 border rounded-full z-20 transition-colors duration-500 ${
                          isLight ? 'border-zinc-300 text-zinc-600 bg-white/90' : 'border-zinc-800 text-orange-200 bg-[#09090b]/90'
                        }`}>
                          Playable Demo
                        </span>
                      )}

                      {/* Static Placeholder Image */}
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

                      {/* Mancini Video Loop Overlay on Hover */}
                      <AnimatePresence>
                        {project.video && isHovered && (
                          <motion.video
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            src={project.video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* Hover Playable Button Overlay for Feed Panda */}
                      {project.id === 'feed-panda' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEmbedId(project.id);
                              posthog.capture("playable_demo_started", { project_id: project.id });
                              if (typeof window !== "undefined" && (window as any).gtag) {
                                (window as any).gtag("event", "playable_demo_started", {
                                  project_id: project.id
                                });
                              }
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
                    <h3 className="text-2xl md:text-3xl font-serif leading-tight transition-colors duration-300"
                        style={{ color: isHovered ? project.backgroundColor : undefined }}
                    >
                      {project.title}
                    </h3>
                    <span className={`text-[10px] tracking-widest uppercase mt-2.5 transition-colors duration-300 ${
                      isHovered
                        ? ''
                        : (isLight ? 'text-zinc-400' : 'text-orange-200/50')
                    }`}
                    style={{ color: isHovered ? project.backgroundColor : undefined }}
                    >
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
                        style={{
                          borderColor: isHovered ? `${project.backgroundColor}40` : undefined,
                          color: isHovered ? project.backgroundColor : undefined
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] tracking-[0.3em] uppercase font-bold border-b w-fit pb-1 transition-all duration-300"
                       style={{
                         color: isHovered ? project.backgroundColor : (isLight ? '#000000' : '#ffffff'),
                         borderColor: isHovered ? project.backgroundColor : (isLight ? '#000000' : '#ffffff')
                       }}
                  >
                    Explore Demo
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
