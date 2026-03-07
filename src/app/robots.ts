import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://usepromptify.org/sitemap.xml",
    host: "https://usepromptify.org",
  };
}
