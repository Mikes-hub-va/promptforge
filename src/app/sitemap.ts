import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/workspace",
    "/templates",
    "/pricing",
    "/about",
    "/faq",
    "/saved",
    "/history",
    "/privacy",
    "/terms",
    "/changelog",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `https://promptforge.app${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
