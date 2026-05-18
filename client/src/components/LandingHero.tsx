import { motion } from "framer-motion";

export default function LandingHero() {
  return (
    <div className="w-full h-screen relative overflow-hidden select-none flex flex-col justify-between">
      <header className="w-full p-8 md:p-12 flex justify-between items-start z-30 pointer-events-none">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="flex flex-col pointer-events-auto">
          <h1 className="text-3xl md:text-5xl font-serif italic text-black leading-tight">Somenath Mondal</h1>
          <span className="text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase text-zinc-400 font-medium mt-1 text-left">Portfolio Showcase / Vol. 1</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="text-right flex flex-col items-end pointer-events-auto">
          <span className="text-[8px] md:text-[10px] tracking-[0.4em] uppercase text-zinc-500 font-bold mb-2">Available</span>
          <div className="w-8 md:w-16 h-px bg-black" />
        </motion.div>
      </header>

          <main className="w-full flex-grow flex flex-col items-center justify-center pointer-events-none relative h-full">
             <div className="h-[20vh] md:h-0" />
             <div className="max-w-7xl w-full px-8 md:px-12 grid grid-cols-12 gap-4 md:gap-8 items-center">
              <motion.div className="col-span-12 md:col-span-3 order-2 md:order-1 flex justify-start items-center md:items-start" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.6 }}>
                <p className="text-[10px] md:text-sm font-serif italic text-zinc-600 leading-relaxed max-w-[120px] md:max-w-[180px] text-left">
                  "Crafting immersive 3D experiences that blur the line between reality & imagination."
                </p>
              </motion.div>
              <div className="col-span-12 md:col-span-5 h-[10vh] md:h-0 order-1 md:order-2" />
              <motion.div className="col-span-12 md:col-span-4 text-right flex flex-col items-end order-3 flex justify-end md:justify-center" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.8 }}>
                <h2 className="text-lg md:text-4xl font-serif text-black leading-tight mb-2 md:mb-4">Dreams <span className="italic">in</span> Pixels</h2>
                <p className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-zinc-400 max-w-[100px] md:max-w-[200px]">Refraction & magic</p>
              </motion.div>
            </div>
          </main>

      <footer className="w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-center md:items-end z-30 pointer-events-none gap-6 md:gap-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }} className="flex gap-8 md:gap-12 pointer-events-auto">
          <div className="flex flex-col text-left">
            <span className="text-[8px] md:text-[9px] tracking-widest uppercase text-zinc-400 mb-1">Location</span>
            <span className="text-[10px] md:text-xs text-black font-medium">Bangalore, India</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[8px] md:text-[9px] tracking-widest uppercase text-zinc-400 mb-1">Expertise</span>
            <span className="text-[10px] md:text-xs text-black font-medium">XR / WebGL / iOS</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.4 }} className="flex flex-col items-center md:items-end gap-3 md:gap-4 pointer-events-auto">
          <div className="flex gap-4 md:gap-8 flex-wrap justify-center md:justify-end">
            <a href="https://www.linkedin.com/in/somenath-mondal-xr-tech/" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">LinkedIn</a>
            <a href="https://github.com/somenathmondal" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">GitHub</a>
            <a href="https://www.youtube.com/@IITPodcastwithSomenath" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">YouTube</a>
            <a href="https://open.spotify.com/show/2OkRCNNTbwaAB2CElTDdYH?si=9_ikF-n-RBexQXMuwvxr9g" target="_blank" rel="noopener noreferrer" className="text-[8px] md:text-[10px] tracking-widest uppercase text-black font-bold border-b border-black">Spotify</a>
          </div>
          <span className="text-[8px] md:text-[9px] tracking-[0.5em] uppercase text-zinc-400">© 2026 Edition</span>
        </motion.div>
      </footer>
    </div>
  );
}
