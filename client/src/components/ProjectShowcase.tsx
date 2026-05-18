import { motion } from "framer-motion";
import { projects } from "../data/projects";

export default function ProjectShowcase() {
  return (
    <section className="w-full min-h-screen py-24 px-8 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] tracking-[0.4em] uppercase text-zinc-400 font-bold mb-4 block"
          >
            Selected Works
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif italic text-black"
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
              <div className="w-full md:w-3/5 aspect-[16/10] bg-zinc-100 overflow-hidden relative group">
                {/* Placeholder for project image */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-serif italic text-3xl group-hover:scale-105 transition-transform duration-1000">
                  {project.title}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>

              <div className="w-full md:w-2/5 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl md:text-4xl font-serif text-black leading-tight">{project.title}</h3>
                  <span className="text-[10px] tracking-widest text-zinc-400 uppercase mt-3">
                    0{index + 1}
                  </span>
                </div>

                <p className="text-zinc-600 text-sm md:text-base leading-relaxed mb-8">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-10">
                  {project.tech.map((t) => (
                    <span key={t} className="text-[9px] tracking-widest uppercase border border-zinc-200 px-3 py-1 text-zinc-500">
                      {t}
                    </span>
                  ))}
                </div>

                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] tracking-[0.3em] uppercase text-black font-bold border-b border-black w-fit pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
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
