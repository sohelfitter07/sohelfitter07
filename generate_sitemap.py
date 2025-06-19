import os
from datetime import datetime

domain = "https://www.canadianfitnessrepair.com"
output_file = "sitemap.xml"
html_pages = []

# Scan for HTML files
for root, _, files in os.walk("."):
    for file in files:
        if file.endswith(".html"):
            filepath = os.path.join(root, file)
            url_path = os.path.relpath(filepath, ".").replace("\\", "/")
            url = f"{domain}/{url_path}"
            if "404" in url_path or "backup" in url_path:
                continue
            html_pages.append(url)

# Generate sitemap content
now = datetime.now().strftime("%Y-%m-%d")
sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

for url in html_pages:
    sitemap.append("  <url>")
    sitemap.append(f"    <loc>{url}</loc>")
    sitemap.append(f"    <lastmod>{now}</lastmod>")
    sitemap.append("    <changefreq>monthly</changefreq>")
    sitemap.append("    <priority>0.8</priority>")
    sitemap.append("  </url>")

sitemap.append("</urlset>")

with open(output_file, "w", encoding="utf-8") as f:
    f.write("\n".join(sitemap))

print(f"✅ Sitemap created: {output_file}")
