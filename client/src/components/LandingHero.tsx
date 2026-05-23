import { motion } from "framer-motion";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { usePortfolio } from "../lib/stores/usePortfolio";

export default function LandingHero() {
  const { theme, toggleTheme } = usePortfolio();

  return (
    <div className="w-full h-screen relative overflow-hidden select-none flex flex-col justify-between">
      {/* Top Header Section */}
      <header className="w-full p-8 md:p-12 flex justify-between items-start z-30 pointer-events-none">
        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2 }} 
          className="flex flex-col pointer-events-auto"
        >
          <h1 className={`text-3xl md:text-5xl font-serif italic leading-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Somenath Mondal
          </h1>
          <span className={`text-[8px] md:text-[9px] tracking-[0.3em] uppercase font-mono mt-1 text-left ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/60'}`}>
            CREATIVE TECHNOLOGIST & SPATIAL DEV
          </span>
        </motion.div>

        {/* Status Pill & Theme Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.4 }} 
          className="flex items-center gap-4 pointer-events-auto"
        >
          {/* Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-bold text-[8px] tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AVAILABLE</span>
          </div>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-full border ${
              theme === 'light' 
                ? 'border-zinc-300 hover:border-black text-zinc-600 hover:text-black bg-white/50' 
                : 'border-stone-800 hover:border-white text-stone-300 hover:text-white bg-white/5'
            } transition-all duration-300`}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      </header>

      {/* Main Content Area: Zero-Overlap Edge-Positioned Text Panels */}
      <main className="w-full flex-grow relative h-full flex items-center pointer-events-none">
        <div className="w-full px-8 md:px-12 flex justify-between items-center relative z-20">
          
          {/* Left Panel: Philosophy Statement (Desktop Only) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1, delay: 0.6 }}
            className="hidden md:flex flex-col gap-4 max-w-[200px] lg:max-w-[280px] text-left pointer-events-auto"
          >
            <span className={`text-[8px] font-mono tracking-[0.3em] uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'}`}>
              01 / PHILOSOPHY
            </span>
            <p className={`text-xs font-serif italic leading-relaxed ${theme === 'light' ? 'text-zinc-800' : 'text-stone-200'}`}>
              "Designing at the threshold of physical interaction and spatial computing. I forge high-fidelity WebGL environments, custom computer vision systems, and immersive XR interfaces that feel alive."
            </p>
            <span className={`text-[9px] font-mono tracking-wider ${theme === 'light' ? 'text-zinc-500' : 'text-stone-400'}`}>
              Focused on real-time rendering, physics simulations, and tactile browser-native experiences.
            </span>
          </motion.div>

          {/* Mobile Philosophy Statement (Centered & Stacks Below Initials) */}
          <div className="md:hidden absolute top-[18vh] left-1/2 -translate-x-1/2 w-[85%] text-center flex flex-col gap-3 pointer-events-auto">
            <p className={`text-[11px] font-serif italic leading-relaxed ${theme === 'light' ? 'text-zinc-800' : 'text-stone-200'}`}>
              "Designing at the threshold of physical interaction and spatial computing."
            </p>
            <span className={`text-[8px] font-mono tracking-[0.2em] uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/60'}`}>
              WebGL / XR / Computer Vision
            </span>
          </div>

          {/* Right Panel: Selected Project Directory (Desktop Only) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1, delay: 0.8 }}
            className="hidden md:flex flex-col gap-5 w-full max-w-[180px] lg:max-w-[240px] text-right pointer-events-auto"
          >
            <span className={`text-[8px] font-mono tracking-[0.3em] uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'}`}>
              02 / SELECTED DIRECTORY
            </span>
            <div className="flex flex-col gap-4">
              <div className={`group cursor-pointer pb-2 border-b ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
                <span className={`text-[11px] lg:text-[13px] font-serif italic block ${
                  theme === 'light' ? 'text-zinc-800 group-hover:text-zinc-500' : 'text-white group-hover:text-orange-200'
                } transition-colors duration-300`}>
                  NESTINGALE
                </span>
                <span className={`text-[7px] lg:text-[8px] font-mono tracking-widest block mt-0.5 uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-stone-400/80'}`}>
                  3D Capture & Stitching Pipeline
                </span>
              </div>
              <div className={`group cursor-pointer pb-2 border-b ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
                <span className={`text-[11px] lg:text-[13px] font-serif italic block ${
                  theme === 'light' ? 'text-zinc-800 group-hover:text-zinc-500' : 'text-white group-hover:text-orange-200'
                } transition-colors duration-300`}>
                  JERSEY CONFIGURATOR
                </span>
                <span className={`text-[7px] lg:text-[8px] font-mono tracking-widest block mt-0.5 uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-stone-400/80'}`}>
                  Garment Customization Platform
                </span>
              </div>
              <div className={`group cursor-pointer pb-2 border-b ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
                <span className={`text-[11px] lg:text-[13px] font-serif italic block ${
                  theme === 'light' ? 'text-zinc-800 group-hover:text-zinc-500' : 'text-white group-hover:text-orange-200'
                } transition-colors duration-300`}>
                  FEED PANDA
                </span>
                <span className={`text-[7px] lg:text-[8px] font-mono tracking-widest block mt-0.5 uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-stone-400/80'}`}>
                  3D Browser Physics Game
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Footer Section */}
      <footer className="w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-center md:items-end z-30 pointer-events-none gap-6 md:gap-0">
        {/* Metadata */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 1 }} 
          className="flex gap-8 md:gap-12 pointer-events-auto"
        >
          <div className="flex flex-col text-left">
            <span className={`text-[8px] md:text-[9px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'}`}>
              Location
            </span>
            <span className={`text-[10px] md:text-xs font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>
              Bangalore, India
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className={`text-[8px] md:text-[9px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-zinc-400' : 'text-orange-200/50'}`}>
              Expertise
            </span>
            <span className={`text-[10px] md:text-xs font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>
              WebGL / XR / Computer Vision
            </span>
          </div>
        </motion.div>

        {/* Direct Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 1.4 }} 
          className="flex flex-col items-center md:items-end gap-3 md:gap-4 pointer-events-auto"
        >
          <div className="flex gap-4 md:gap-8 flex-wrap justify-center md:justify-end">
            <a 
              href="https://www.linkedin.com/in/somenath-mondal-xr-tech/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-[8px] md:text-[10px] tracking-widest uppercase font-bold border-b transition-colors ${
                theme === 'light' 
                  ? 'text-black border-black hover:text-zinc-500 hover:border-zinc-500' 
                  : 'text-white border-white hover:text-orange-200 hover:border-orange-200'
              }`}
            >
              LinkedIn
            </a>
            <a 
              href="https://github.com/somenathmondal" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-[8px] md:text-[10px] tracking-widest uppercase font-bold border-b transition-colors ${
                theme === 'light' 
                  ? 'text-black border-black hover:text-zinc-500 hover:border-zinc-500' 
                  : 'text-white border-white hover:text-orange-200 hover:border-orange-200'
              }`}
            >
              GitHub
            </a>
            <a 
              href="https://www.youtube.com/@IITPodcastwithSomenath" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-[8px] md:text-[10px] tracking-widest uppercase font-bold border-b transition-colors ${
                theme === 'light' 
                  ? 'text-black border-black hover:text-zinc-500 hover:border-zinc-500' 
                  : 'text-white border-white hover:text-orange-200 hover:border-orange-200'
              }`}
            >
              YouTube
            </a>
            <a 
              href="https://open.spotify.com/show/2OkRCNNTbwaAB2CElTDdYH?si=9_ikF-n-RBexQXMuwvxr9g" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-[8px] md:text-[10px] tracking-widest uppercase font-bold border-b transition-colors ${
                theme === 'light' 
                  ? 'text-black border-black hover:text-zinc-500 hover:border-zinc-500' 
                  : 'text-white border-white hover:text-orange-200 hover:border-orange-200'
              }`}
            >
              Spotify
            </a>
          </div>
          <span className={`text-[8px] md:text-[9px] tracking-[0.5em] uppercase ${theme === 'light' ? 'text-zinc-400' : 'text-stone-500'}`}>
            © 2026 Edition
          </span>
        </motion.div>
      </footer>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
        <motion.div 
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className={`text-[8px] tracking-[0.3em] font-mono uppercase ${
            theme === 'light' ? 'text-zinc-400' : 'text-orange-200/40'
          }`}>
            Scroll Down
          </span>
          <ChevronDown className={`w-3.5 h-3.5 ${
            theme === 'light' ? 'text-zinc-300' : 'text-orange-200/30'
          }`} />
        </motion.div>
      </div>
    </div>
  );
}
