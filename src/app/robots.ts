import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://paniund.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/login", "/register"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/complete-profile", "/setup-password", "/reset-password"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
