import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 200); // Slower, more "elegant" loading

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: '#e5e5e5' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 
            className="text-6xl font-serif italic text-black mb-4"
          >
            Somenath Mondal.
          </h1>
          <motion.p 
            className="text-zinc-500 text-[10px] font-medium tracking-[0.3em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Portfolio Showcase
          </motion.p>
        </motion.div>

        <motion.div
          className="w-64 h-px bg-zinc-300 mx-auto mb-6 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div
            className="h-full bg-black"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>

        <motion.div
          className="text-zinc-400 font-light text-[10px] tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          {progress}%
        </motion.div>
      </div>
    </motion.div>
  );
}
