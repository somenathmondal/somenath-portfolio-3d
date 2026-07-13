import { projects } from "../data/projects";

const SITE_URL = "https://somenath-portfolio-3d.vercel.app";

// Crawlable mirror of the project wheel. The wheel renders one project's text at a
// time and only after WebGL boots, so search engines get this static, visually-hidden
// index instead (same content, semantic HTML). Doubles as the screen-reader path.
export default function SeoIndex() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Selected Works — Somenath Mondal",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: p.title,
        description: p.description,
        url: p.link,
        image: `${SITE_URL}${p.image}`,
        keywords: p.tech.join(", "),
        author: { "@type": "Person", name: "Somenath Mondal" },
      },
    })),
  };

  return (
    <section aria-label="Selected works" className="sr-only">
      <h2>Selected Works</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <h3>
              <a href={p.link}>{p.title}</a>
            </h3>
            <p>{p.description}</p>
            <p>{p.tech.join(", ")}</p>
          </li>
        ))}
      </ul>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </section>
  );
}
