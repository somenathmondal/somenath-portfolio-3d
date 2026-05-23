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
  }
];
