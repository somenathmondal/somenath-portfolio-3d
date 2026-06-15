export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  image?: string;
}

export const projects: Project[] = [
  {
    id: "feed-panda",
    title: "Feed Panda",
    description: "Interactive 3D game demo where users feed dumplings to a Kung Fu Panda character. Built to demonstrate character animation and physics in the browser.",
    tech: ["Three.js", "Vanilla JS", "GLSL"],
    link: "https://feed-panda.vercel.app/",
    image: "/Feed_Panda_Demo.png",
  },
  {
    id: "jersey-configurator",
    title: "Jersey Configurator",
    description: "An advanced 3D garment customization platform. Users can visualize various jersey designs, apply custom logos, and experiment with materials in a real-time 3D environment with high-fidelity textures.",
    tech: ["React", "Three.js", "R3F", "Tailwind CSS"],
    link: "https://gf-sports.fr/",
    image: "/Jersey_Configurator.png",
  },
  {
    id: "3d-kinematic-visualizer",
    title: "3D Kinematic Music Visualizer",
    description: "A real-time 3D audio-reactive experience featuring a radial kinematic spoke column and a 61-key piano. Synthesizes MIDI sequences in the browser with Tone.js, triggering custom physics-based ball drops, key depressions, and glowing particle spark VFX in Three.js.",
    tech: ["Three.js", "Tone.js", "Vanilla JS", "Post-processing"],
    link: "https://3d-kinematic-visualizer.vercel.app",
    image: "/3D_Kinematic_Visualizer.png"
  },
  {
    id: "messi-albiceleste",
    title: "Messi & The Albiceleste",
    description: "An interactive, editorial 3D visual journey celebrating Lionel Messi's iconic World Cup jerseys with Argentina. Built with WebGL, WebGL textures generated using Fabric.js dynamic canvas pipelines, and smooth scroll-driven animations from 2006 to 2026.",
    tech: ["Three.js", "Fabric.js", "Vanilla JS", "WebGL"],
    link: "https://messi-in-world-cups-3d.vercel.app/",
    image: "/Messi_Albiceleste.png"
  }
];
