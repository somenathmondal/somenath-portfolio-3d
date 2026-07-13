export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link: string;
  image?: string;
  /** Muted accent the scene background tints toward while this project is front of the wheel */
  accent: string;
  /** Whether the project can be played inline in an iframe */
  playable?: boolean;
}

export const projects: Project[] = [
  {
    id: "feed-panda",
    accent: "#3f6b4f", playable: true,
    title: "Feed Panda",
    description: "Interactive 3D game demo where users feed dumplings to a Kung Fu Panda character. Built to demonstrate character animation and physics in the browser.",
    tech: ["Three.js", "Vanilla JS", "GLSL"],
    link: "https://feed-panda.vercel.app/",
    image: "/Feed_Panda_Demo.webp",
  },
  {
    id: "messi-albiceleste",
    accent: "#4f7fb5",
    title: "Messi & The Albiceleste",
    description: "An interactive, editorial 3D visual journey celebrating Lionel Messi's iconic World Cup jerseys with Argentina. Built with WebGL, WebGL textures generated using Fabric.js dynamic canvas pipelines, and smooth scroll-driven animations from 2006 to 2026.",
    tech: ["Three.js", "Fabric.js", "Vanilla JS", "WebGL"],
    link: "https://messi-in-world-cups-3d.vercel.app/",
    image: "/Messi_Albiceleste.webp"
  },
  {
    id: "3d-kinematic-visualizer",
    accent: "#5b4b8a",
    title: "3D Kinematic Music Visualizer",
    description: "A real-time 3D audio-reactive experience featuring a radial kinematic spoke column and a 61-key piano. Synthesizes MIDI sequences in the browser with Tone.js, triggering custom physics-based ball drops, key depressions, and glowing particle spark VFX in Three.js.",
    tech: ["Three.js", "Tone.js", "Vanilla JS", "Post-processing"],
    link: "https://3d-kinematic-visualizer.vercel.app",
    image: "/3D_Kinematic_Visualizer.webp"
  },
  {
    id: "jersey-configurator",
    accent: "#8a2f3c",
    title: "Jersey Configurator",
    description: "An advanced 3D garment customization platform. Users can visualize various jersey designs, apply custom logos, and experiment with materials in a real-time 3D environment with high-fidelity textures.",
    tech: ["React", "Three.js", "R3F", "Tailwind CSS"],
    link: "https://gf-sports.fr/",
    image: "/Jersey_Configurator.webp",
  },
  {
    id: "lounge-chair-configurator",
    accent: "#8a5a2f",
    title: "3D Lounge Chair Configurator",
    description: "A high-fidelity 3D product customization tool for furniture e-commerce. Enables customers to customize the materials, leather colors, and wood veneers of the classic Eames Lounge Chair, with full WebXR and AR preview features.",
    tech: ["Three.js", "Vanilla JS", "WebGL", "AR/XR"],
    link: "https://nexreality.io/projects/lounge-chair/index.html",
    image: "/Lounge_Chair_Configurator.webp"
  },
  {
    id: "watch-configurator",
    accent: "#2f6b6b",
    title: "Christopher Ward 3D Customizer",
    description: "An intricate WebGL product customizer for premium automatic watches. Showcases high-precision micro-modeling of dials, gear assemblies, hands, and strap configurations with real-time dynamic shadows and close-up zoom states.",
    tech: ["Three.js", "WebGL", "GSAP", "3D Modeling"],
    link: "https://nexreality.io/projects/watch/index.html",
    image: "/Watch_Configurator.webp"
  },
  {
    id: "scientific-exploration",
    accent: "#a0522d",
    title: "NASA Ingenuity 3D Simulator",
    description: "An educational physics-based 3D simulator demonstrating the flight dynamics and rotor mechanics of the NASA Mars Ingenuity Helicopter. Features flight path animation controls and interactive instrumentation overlays.",
    tech: ["Three.js", "WebGL", "GSAP", "Animation"],
    link: "https://nexreality.io/projects/scientific-exploration/index.html",
    image: "/Scientific_Exploration.webp"
  },
  {
    id: "medical-education",
    accent: "#7a2e2e",
    title: "Interactive Anatomical Heart",
    description: "A high-fidelity 3D medical visualization tool designed for surgical training and anatomy education. Features interactive cross-section cutting planes, real-time beat synchronization, and detailed vascular label tracking.",
    tech: ["Three.js", "WebGL", "Custom Shaders", "3D Rendering"],
    link: "https://nexreality.io/projects/medical-education/index.html",
    image: "/Medical_Education.webp"
  },
  {
    id: "product-discovery-ar",
    accent: "#3d4a8a",
    title: "Samsung Galaxy Z Flip3 AR Showcase",
    description: "An interactive 3D WebGL product explorer demonstrating the folding hinge mechanics, screen animations, and AR-ready camera placement of the Samsung Galaxy Z Flip3.",
    tech: ["Three.js", "WebGL", "GSAP", "AR/XR"],
    link: "https://nexreality.io/projects/product-discovery/index.html",
    image: "/Product_Discovery_AR.webp"
  },
  {
    id: "comfort-chair-configurator",
    accent: "#6b7d5f",
    title: "Comfort Chair 3D Configurator",
    description: "An interactive 3D chair configurator showcasing custom upholstery options, legs, and room settings for a personalized furniture shopping customer journey.",
    tech: ["Three.js", "WebGL", "GSAP", "3D Configurator"],
    link: "https://nexreality.io/projects/comfort-chair/index.html",
    image: "/Comfort_Chair_Configurator.webp"
  }
];
