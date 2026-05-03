import os
import json
from bs4 import BeautifulSoup

SITE_DIR = "site_download"
DRY_RUN = False

SCHEMA = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Canadian Fitness Repair",
    "url": "https://www.canadianfitnessrepair.com/",
    "telephone": "+1-289-925-7239",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hamilton",
        "addressRegion": "ON",
        "addressCountry": "CA"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 43.2557,
        "longitude": -79.8711
    },
    "areaServed": "Hamilton + 150km GTA",
    "makesOffer": [
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Treadmill Repair"}},
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Elliptical Repair"}},
        {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Bike Repair"}}
    ]
}

def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    # remove old schema
    for tag in soup.find_all("script", type="application/ld+json"):
        if tag.string and "LocalBusiness" in tag.string:
            tag.decompose()

    # add new schema
    script = soup.new_tag("script", type="application/ld+json")
    script.string = json.dumps(SCHEMA, indent=2)

    if soup.head:
        soup.head.append(script)

    if not DRY_RUN:
        with open(path, "w", encoding="utf-8") as f:
            f.write(str(soup))

    print("Updated:", path)

for root, dirs, files in os.walk(SITE_DIR):
    for file in files:
        if file.endswith(".html"):
            process_file(os.path.join(root, file))

print("DONE 🚀")