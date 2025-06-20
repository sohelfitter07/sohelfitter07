import os
import re

# === Customize your business info here ===
business_schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Canadian Fitness Repair",
    "url": "https://www.canadianfitnessrepair.com",
    "logo": "https://www.canadianfitnessrepair.com/images/logo.png",
    "image": [
        "https://www.canadianfitnessrepair.com/images/service-van.jpg",
        "https://www.canadianfitnessrepair.com/images/technician-working.jpg"
    ],
    "description": "Expert fitness equipment repair and maintenance services in Hamilton, Toronto, Oakville, and surrounding areas.",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hamilton",
        "addressRegion": "ON",
        "addressCountry": "CA"
    },
    "telephone": "+1-289-925-7239",
    "areaServed": ["Hamilton", "Toronto", "Oakville", "Burlington", "Mississauga"],
    "sameAs": [
        "https://www.facebook.com/CanadianFitnessRepair",
        "https://www.instagram.com/canadianfitnessrepair"
    ]
}

schema_block = (
    '<script type="application/ld+json">\n'
    + re.sub(r'(?<!\\)"', '"', str(business_schema)).replace("'", '"')
    + '\n</script>\n'
)

# === Directory to scan ===
TARGET_DIR = "C:/Users/fitsohel/Desktop/VSCode/New folder/sohelfitter07"
  # update to your actual directory

# === Helper function to determine if a file is a backup ===
def is_backup(filename):
    return any(s in filename.lower() for s in ['~', '.bak', 'backup', '.old'])

# === Main injection logic ===
def inject_schema_to_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "LocalBusiness" in content:
        print(f"Skipped (already contains schema): {filepath}")
        return

    injection_point = "</head>" if "</head>" in content.lower() else "</body>"
    pattern = re.compile(re.escape(injection_point), re.IGNORECASE)

    new_content, count = pattern.subn(schema_block + injection_point, content, count=1)
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Injected schema into: {filepath}")
    else:
        print(f"⚠️  No suitable injection point in: {filepath}")

# === Process files ===
def process_directory(path):
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".html") and not is_backup(file):
                inject_schema_to_file(os.path.join(root, file))

# === Run ===
if __name__ == "__main__":
    process_directory(TARGET_DIR)
