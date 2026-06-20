import { motion } from "framer-motion";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { usePortfolio } from "../lib/stores/usePortfolio";
import posthog from "posthog-js";

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
            onClick={() => {
              toggleTheme();
              const nextTheme = theme === 'light' ? 'dark' : 'light';
              posthog.capture("theme_toggled", { new_theme: nextTheme });
            }}
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

      {/* Main Content Area: Centered Tagline Framing the 3D Initials */}
      <main className="w-full flex-grow relative h-full flex items-center justify-center pointer-events-none">
        <div className="absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit px-6 py-3 rounded-full border border-zinc-300/30 dark:border-white/5 bg-zinc-100/30 dark:bg-black/15 backdrop-blur-[12px] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all duration-500 ease-out hover:scale-105 hover:bg-zinc-200/40 dark:hover:bg-black/25 hover:border-zinc-300/50 dark:hover:border-white/10 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-center"
          >
            <h2 
              className={`text-sm md:text-lg lg:text-xl font-medium tracking-wide leading-none whitespace-nowrap ${
                theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'
              }`}
              style={{ fontFamily: "'Ubuntu', sans-serif" }}
            >
              Putting the <span className="font-bold text-black dark:text-white">JOY</span> in 3D <span className="animate-heartbeat ml-1">❤️</span>
            </h2>
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
            <span className={`text-[8px] md:text-[9px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-zinc-500' : 'text-orange-200/50'}`}>
              Location
            </span>
            <span className={`text-[10px] md:text-xs font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>
              Bangalore, India
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className={`text-[8px] md:text-[9px] tracking-widest uppercase mb-1 ${theme === 'light' ? 'text-zinc-500' : 'text-orange-200/50'}`}>
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
              onClick={() => posthog.capture("social_link_clicked", { platform: "linkedin" })}
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
              onClick={() => posthog.capture("social_link_clicked", { platform: "github" })}
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
              onClick={() => posthog.capture("social_link_clicked", { platform: "youtube" })}
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
              onClick={() => posthog.capture("social_link_clicked", { platform: "spotify" })}
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
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
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
