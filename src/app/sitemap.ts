import { MetadataRoute } from "next";
import { PRESET_LIBRARY } from "@/data/presets";

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

  const templateRoutes = PRESET_LIBRARY.map((preset) => `/templates/${preset.slug}`);

  return [...routes, ...templateRoutes].map((route) => ({
    url: `https://promptforge.app${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
