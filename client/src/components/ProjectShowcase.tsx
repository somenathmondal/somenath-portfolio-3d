import { useState, useRef, useCallback, memo, MouseEvent } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, MotionValue } from "framer-motion";
import { projects, Project } from "../data/projects";
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
  "seashore-house": "#F1FAF8",
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
  "seashore-house": "#021115",
};

interface StackCardProps {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  isLight: boolean;
  isEmbedActive: boolean;
  isHovered: boolean;
  onSetEmbedId: (id: string | null) => void;
  onHoverChange: (id: string | null) => void;
  onCardClick: (project: Project) => void;
}

const StackCard = memo(function StackCard({
  project,
  index,
  total,
  progress,
  isLight,
  isEmbedActive,
  isHovered,
  onSetEmbedId,
  onHoverChange,
  onCardClick,
}: StackCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Spring Physics (GPU transform only)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { stiffness: 240, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { stiffness: 240, damping: 24 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    mouseX.set(rx);
    mouseY.set(ry);
    // Update cursor spotlight position directly via CSS vars (zero React re-renders)
    el.style.setProperty("--mx", `${(rx * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(ry * 100).toFixed(1)}%`);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    onHoverChange(null);
  };

  const targetScale = 1 - (total - index) * 0.04;
  const rangeStart = index * (1 / total);
  const rangeEnd = 1;
  const scale = useTransform(progress, [rangeStart, rangeEnd], [1, targetScale]);

  const cardNumber = String(index + 1).padStart(2, "0");

  // Multi-layered contact + ambient color-tinted shadows
  const restingShadow = isLight
    ? `0 2px 6px rgba(0, 0, 0, 0.04), 0 18px 38px -12px rgba(15, 15, 20, 0.11), 0 34px 72px -22px ${project.backgroundColor}33, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
    : `0 2px 10px rgba(0, 0, 0, 0.55), 0 24px 48px -12px rgba(0, 0, 0, 0.72), 0 32px 76px -20px ${project.backgroundColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.09)`;

  const hoveredShadow = isLight
    ? `0 6px 16px rgba(0, 0, 0, 0.07), 0 28px 56px -14px rgba(15, 15, 20, 0.16), 0 42px 96px -16px ${project.backgroundColor}5c, inset 0 1px 0 rgba(255, 255, 255, 1)`
    : `0 8px 20px rgba(0, 0, 0, 0.65), 0 32px 64px -12px rgba(0, 0, 0, 0.85), 0 44px 100px -14px ${project.backgroundColor}7a, inset 0 1px 0 rgba(255, 255, 255, 0.16)`;

  return (
    <div
      className="sticky top-28 w-full flex justify-center mb-24 last:mb-0"
      style={{ zIndex: index + 1 }}
    >
      <div className="relative w-full max-w-5xl" style={{ perspective: "1400px" }}>
        {/* Editorial Oversized Index Watermark floating beside each card */}
        <div
          aria-hidden="true"
          className={`hidden xl:block pointer-events-none select-none absolute -top-12 font-serif italic text-[110px] leading-none tracking-tighter transition-opacity duration-500 ${
            index % 2 === 0 ? "-left-24" : "-right-24"
          }`}
          style={{
            color: project.backgroundColor,
            opacity: isHovered ? (isLight ? 0.22 : 0.28) : (isLight ? 0.08 : 0.1),
          }}
        >
          {cardNumber}
        </div>

        {/* Soft floor contact shadow pad underneath the card (pure radial-gradient, zero blur filter) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-7 left-[6%] right-[6%] h-12 rounded-full transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${project.backgroundColor}${isHovered ? "44" : "24"} 0%, rgba(0,0,0,${isLight ? "0.10" : "0.45"}) 38%, transparent 72%)`,
            opacity: isHovered ? 1 : 0.78,
          }}
        />

        <motion.div
          ref={cardRef}
          style={{
            scale,
            rotateX: isHovered ? rotateX : 0,
            rotateY: isHovered ? rotateY : 0,
            y: isHovered ? -6 : 0,
            willChange: isHovered ? "transform" : "auto",
            contain: "layout style paint",
            borderColor: isHovered ? `${project.backgroundColor}88` : undefined,
            boxShadow: isHovered ? hoveredShadow : restingShadow,
          }}
          transition={{ y: { type: "spring", stiffness: 280, damping: 24 } }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => onHoverChange(project.id)}
          onMouseLeave={handleMouseLeave}
          onClick={() => onCardClick(project)}
          className={`group relative w-full rounded-3xl overflow-hidden cursor-pointer border transition-[border-color,box-shadow] duration-300 ${
            isLight
              ? "bg-white/95 border-zinc-200/90"
              : "bg-zinc-900/95 border-zinc-800/80"
          }`}
        >
          {/* Cursor-tracking Specular Spotlight & Accent Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: isLight
                ? `radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), ${project.backgroundColor}1c, rgba(255,255,255,0.28) 30%, transparent 65%)`
                : `radial-gradient(520px circle at var(--mx, 50%) var(--my, 50%), ${project.backgroundColor}2e, rgba(255,255,255,0.06) 32%, transparent 65%)`,
            }}
          />

          {/* Subtle colored bottom accent rim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] z-30 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.95 : 0.35,
              background: `linear-gradient(90deg, transparent 5%, ${project.backgroundColor} 50%, transparent 95%)`,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[460px]">
            {/* Visual Showcase (Media Container) */}
            <div className="lg:col-span-7 relative overflow-hidden bg-zinc-950 border-b lg:border-b-0 lg:border-r border-inherit h-[260px] sm:h-[320px] lg:h-full">
              {isEmbedActive ? (
                <div className="absolute inset-0 w-full h-full z-20 pointer-events-auto flex flex-col">
                  <div className={`w-full px-4 py-2 flex justify-between items-center z-30 ${
                    isLight ? "bg-zinc-100/95 text-black border-b border-zinc-200" : "bg-black/80 text-white border-b border-stone-800"
                  }`}>
                    <span className="text-[9px] font-mono tracking-widest uppercase">PLAYING LIVE DEMO</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetEmbedId(null);
                        posthog.capture("playable_demo_closed", { project_id: project.id });
                      }}
                      className={`text-[8px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded transition-colors duration-200 ${
                        isLight
                          ? "border-zinc-300 hover:border-black text-zinc-600 hover:text-black"
                          : "border-stone-700 hover:border-white text-stone-300 hover:text-white bg-white/5"
                      }`}
                    >
                      ✕ Close
                    </button>
                  </div>
                  <iframe
                    src={project.link}
                    title={project.title}
                    className="w-full flex-grow border-0 bg-black"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                  />
                </div>
              ) : (
                <>
                  {project.id === "feed-panda" && (
                    <span className={`absolute top-4 left-4 text-[9px] tracking-[0.2em] font-mono uppercase px-3 py-1 border rounded-full z-20 ${
                      isLight ? "border-zinc-300 text-zinc-700 bg-white/95 shadow-sm" : "border-zinc-700 text-orange-200 bg-[#09090b]/95"
                    }`}>
                      Playable Demo
                    </span>
                  )}

                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                      style={{ objectPosition: project.imagePosition ?? "center" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}

                  {/* Subtle inner vignette on preview media for depth */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                      boxShadow: "inset 0 0 42px rgba(0, 0, 0, 0.22)",
                    }}
                  />

                  <AnimatePresence>
                    {project.video && isHovered && (
                      <motion.video
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={project.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                  </AnimatePresence>

                  {project.id === "feed-panda" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetEmbedId(project.id);
                          posthog.capture("playable_demo_started", { project_id: project.id });
                        }}
                        className={`px-5 py-2.5 border rounded-full text-[10px] tracking-widest font-mono uppercase transition-transform duration-200 hover:scale-105 active:scale-95 shadow-lg ${
                          isLight
                            ? "border-zinc-300 text-zinc-800 hover:text-black hover:border-black bg-white/95 hover:bg-white"
                            : "border-zinc-700 text-stone-200 hover:text-white hover:border-white bg-[#09090b]/95 hover:bg-[#09090b]"
                        }`}
                      >
                        ▶ Play Live Demo
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Description & Technical Metadata */}
            <div className="lg:col-span-5 flex flex-col justify-between p-7 md:p-10">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`text-[10px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                      isHovered ? "" : (isLight ? "text-zinc-400" : "text-orange-200/50")
                    }`}
                    style={{ color: isHovered ? project.backgroundColor : undefined }}
                  >
                    PROJECT {cardNumber} / {String(total).padStart(2, "0")}
                  </span>
                </div>

                <h3
                  className="text-3xl md:text-4xl font-serif leading-tight mb-4 transition-colors duration-300"
                  style={{ color: isHovered ? project.backgroundColor : undefined }}
                >
                  {project.title}
                </h3>

                <p className={`text-xs md:text-sm leading-relaxed mb-6 ${
                  isLight ? "text-zinc-600" : "text-stone-300"
                }`}>
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className={`text-[9px] tracking-widest uppercase border px-3 py-1 rounded-full transition-colors duration-300 ${
                        isLight
                          ? "border-zinc-200 text-zinc-600 bg-zinc-50"
                          : "border-stone-800 text-stone-400 bg-white/5"
                      }`}
                      style={{
                        borderColor: isHovered ? `${project.backgroundColor}50` : undefined,
                        color: isHovered ? project.backgroundColor : undefined,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div
                  className="flex items-center space-x-2 text-[10px] tracking-[0.3em] uppercase font-bold border-b w-fit pb-1 transition-colors duration-300"
                  style={{
                    color: isHovered ? project.backgroundColor : (isLight ? "#000000" : "#ffffff"),
                    borderColor: isHovered ? project.backgroundColor : (isLight ? "#000000" : "#ffffff"),
                  }}
                >
                  <span>Launch Artifact</span>
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default function ProjectShowcase() {
  const { theme } = usePortfolio();
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleCardClick = useCallback((project: Project) => {
    setActiveEmbedId((curr) => {
      if (curr === project.id) return curr;
      posthog.capture("project_card_clicked", { project_id: project.id, link: project.link });
      window.open(project.link, "_blank", "noopener,noreferrer");
      return curr;
    });
  }, []);

  const isLight = theme === "light";
  const activeProject = projects.find((p) => p.id === hoveredProjectId);

  const defaultBg = isLight ? "#FAF6F0" : "#09090b";
  const sectionBgColor = activeProject
    ? (isLight ? (lightBgTints[activeProject.id] || defaultBg) : (darkBgTints[activeProject.id] || defaultBg))
    : defaultBg;

  const accentColor = activeProject ? activeProject.backgroundColor : (isLight ? "#0d9488" : "#14b8a6");
  const strokeColor = isLight ? "rgba(24, 24, 27, 0.11)" : "rgba(255, 255, 255, 0.10)";
  const accentStroke = isLight ? `${accentColor}38` : `${accentColor}45`;

  return (
    <section
      style={{ backgroundColor: sectionBgColor }}
      className={`w-full pointer-events-auto relative overflow-x-clip transition-colors duration-700 ${
        isLight ? "text-black" : "text-white border-t border-zinc-900"
      }`}
    >
      {/* 1. Architectural spatial dot-grid backdrop (pure CSS, zero blur cost) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: isLight
            ? "radial-gradient(rgba(24, 24, 27, 0.13) 1px, transparent 1px)"
            : "radial-gradient(rgba(255, 255, 255, 0.11) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)",
        }}
      />

      {/* 2. Drifting zero-blur ambient radial color washes (GPU transform only) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-ambient-slow absolute top-[6%] -left-[10%] w-[680px] h-[680px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor}${isLight ? "22" : "2b"} 0%, transparent 68%)`,
          }}
        />
        <div
          className="animate-ambient-reverse absolute top-[32%] -right-[12%] w-[760px] h-[760px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${isLight ? "#c28b5924" : "#7c2d1230"} 0%, transparent 68%)`,
          }}
        />
        <div
          className="animate-ambient-slow absolute top-[62%] -left-[8%] w-[720px] h-[720px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${accentColor}${isLight ? "1e" : "26"} 0%, transparent 68%)`,
          }}
        />
        <div
          className="animate-ambient-reverse absolute bottom-[6%] -right-[8%] w-[640px] h-[640px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${isLight ? "#0284c71a" : "#0e749028"} 0%, transparent 68%)`,
          }}
        />

        {/* 3. Spatial Editorial Geometric Wireframes & Coordinate Rails (GPU transform only) */}
        {/* Left & Right subtle vertical guide rails */}
        <div
          className="hidden md:block absolute top-16 bottom-16 left-8 lg:left-14 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, ${strokeColor} 10%, ${strokeColor} 90%, transparent)`,
          }}
        />
        <div
          className="hidden md:block absolute top-16 bottom-16 right-8 lg:right-14 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, ${strokeColor} 10%, ${strokeColor} 90%, transparent)`,
          }}
        />

        {/* Rotating Orbital Ring 1 (upper right) */}
        <svg
          viewBox="0 0 320 320"
          className="animate-spin-very-slow hidden md:block absolute top-[4%] right-[4%] w-64 h-64 lg:w-80 lg:h-80"
          fill="none"
        >
          <circle cx="160" cy="160" r="140" stroke={strokeColor} strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="160" cy="160" r="102" stroke={accentStroke} strokeWidth="1" />
          <ellipse cx="160" cy="160" rx="140" ry="52" stroke={strokeColor} strokeWidth="1" />
          <circle cx="300" cy="160" r="3.5" fill={accentColor} opacity="0.55" />
        </svg>

        {/* Rotating Spatial Wireframe Cube/Octagon (mid left) */}
        <svg
          viewBox="0 0 260 260"
          className="animate-spin-very-slow-reverse hidden md:block absolute top-[26%] left-[2%] w-56 h-56 lg:w-64 lg:h-64"
          fill="none"
        >
          <rect x="52" y="52" width="156" height="156" stroke={strokeColor} strokeWidth="1" />
          <rect x="52" y="52" width="156" height="156" stroke={accentStroke} strokeWidth="1" transform="rotate(45 130 130)" />
          <circle cx="130" cy="130" r="44" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="130" cy="52" r="3" fill={accentColor} opacity="0.5" />
        </svg>

        {/* Rotating Orbital Ring 2 (lower right) */}
        <svg
          viewBox="0 0 300 300"
          className="animate-spin-very-slow hidden md:block absolute top-[54%] right-[3%] w-64 h-64 lg:w-72 lg:h-72"
          fill="none"
        >
          <circle cx="150" cy="150" r="126" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 10" />
          <ellipse cx="150" cy="150" rx="126" ry="44" stroke={accentStroke} strokeWidth="1" transform="rotate(-25 150 150)" />
          <ellipse cx="150" cy="150" rx="126" ry="44" stroke={strokeColor} strokeWidth="1" transform="rotate(35 150 150)" />
          <circle cx="276" cy="150" r="3" fill={accentColor} opacity="0.5" />
        </svg>

        {/* Rotating Compass / Reticle (bottom left) */}
        <svg
          viewBox="0 0 240 240"
          className="animate-spin-very-slow-reverse hidden md:block absolute top-[80%] left-[3%] w-52 h-52 lg:w-60 lg:h-60"
          fill="none"
        >
          <circle cx="120" cy="120" r="98" stroke={strokeColor} strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="120" cy="120" r="64" stroke={accentStroke} strokeWidth="1" />
          <line x1="120" y1="8" x2="120" y2="232" stroke={strokeColor} strokeWidth="1" />
          <line x1="8" y1="120" x2="232" y2="120" stroke={strokeColor} strokeWidth="1" />
        </svg>

        {/* Editorial Spatial Coordinate Micro-Labels along the side rails */}
        <div
          className={`hidden lg:flex flex-col gap-2 absolute top-[18%] left-5 text-[9px] font-mono tracking-[0.35em] uppercase select-none ${
            isLight ? "text-zinc-400/70" : "text-stone-500/70"
          }`}
          style={{ writingMode: "vertical-rl" }}
        >
          <span>SPATIAL ARCHIVE // 3D WEBGL</span>
        </div>
        <div
          className={`hidden lg:flex flex-col gap-2 absolute top-[48%] right-5 text-[9px] font-mono tracking-[0.35em] uppercase select-none ${
            isLight ? "text-zinc-400/70" : "text-stone-500/70"
          }`}
          style={{ writingMode: "vertical-rl" }}
        >
          <span>INTERACTIVE ARTIFACTS // 2024–2026</span>
        </div>
        <div
          className={`hidden lg:flex flex-col gap-2 absolute top-[74%] left-5 text-[9px] font-mono tracking-[0.35em] uppercase select-none ${
            isLight ? "text-zinc-400/70" : "text-stone-500/70"
          }`}
          style={{ writingMode: "vertical-rl" }}
        >
          <span>REALTIME SHADERS · R3F · XR</span>
        </div>
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative z-10">
        <header className="mb-20 text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-[11px] tracking-[0.4em] uppercase font-bold mb-3 block ${
              isLight ? "text-zinc-400" : "text-orange-200/50"
            }`}
          >
            Curated Work Showcase
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-6xl font-serif italic mb-4 ${
              isLight ? "text-black" : "text-white"
            }`}
          >
            Digital Artifacts & Experiences
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`text-xs md:text-sm font-mono uppercase tracking-widest ${
              isLight ? "text-zinc-500" : "text-stone-400"
            }`}
          >
            ↓ Scroll down to unstack the deck
          </motion.p>
        </header>

        {/* Stacked Cards Container */}
        <div className="relative pb-32">
          {projects.map((project, index) => (
            <StackCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              progress={scrollYProgress}
              isLight={isLight}
              isEmbedActive={activeEmbedId === project.id}
              isHovered={hoveredProjectId === project.id}
              onSetEmbedId={setActiveEmbedId}
              onHoverChange={setHoveredProjectId}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
