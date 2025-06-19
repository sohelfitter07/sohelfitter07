import re

# Load the HTML file
with open('aboutus.html', 'r', encoding='utf-8') as f:
    html = f.read()

original_html = html  # Keep backup in case we want to diff later

# === 1. Deduplicate JSON-LD Blocks ===
jsonld_pattern = re.compile(
    r'(<script[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',
    re.DOTALL | re.IGNORECASE
)
jsonld_blocks = jsonld_pattern.findall(html)
seen_jsonld = set()
unique_jsonld = []

for open_tag, content, close_tag in jsonld_blocks:
    normalized = re.sub(r'\s+', '', content.strip())
    if normalized not in seen_jsonld:
        seen_jsonld.add(normalized)
        unique_jsonld.append(f"{open_tag}{content}{close_tag}")

# Remove all and reinsert unique ones
html = jsonld_pattern.sub('', html)
if unique_jsonld:
    insertion = '\n'.join(unique_jsonld)
    html = html.replace('</head>', f'{insertion}\n</head>')

# === 2. Remove Duplicate <script src="whatsapp.js"> ===
script_pattern = re.compile(r'<script\s+src=["\']whatsapp\.js["\']></script>', re.IGNORECASE)
scripts = script_pattern.findall(html)
if len(scripts) > 1:
    html = script_pattern.sub('', html)
    html = html.replace('</body>', f'<script src="whatsapp.js"></script>\n</body>')

# === 3. (Optional) Minify and clean whitespace ===
html = re.sub(r'>\s+<', '><', html)
html = re.sub(r'\s{2,}', ' ', html)

# Save cleaned version
with open('aboutus.cleaned.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✅ aboutus.html cleaned and saved as aboutus.cleaned.html")
