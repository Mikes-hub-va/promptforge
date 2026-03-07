import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Promptify",
    short_name: "Promptify",
    description:
      "Promptify turns rough ideas into structured prompt packs with synced accounts, managed runs, and clean prompt operations.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f1",
    theme_color: "#ff6b35",
    categories: ["productivity", "business", "developer tools"],
    icons: [
      {
        src: "/promptify-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
