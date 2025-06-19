import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
exclude_files = ['whatsapp.js']
os.makedirs(backup_folder, exist_ok=True)

# Lazy-loaded Google Analytics (using requestIdleCallback)
optimized_ga_script = """
<!-- Google Tag Manager (lazy-loaded) -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.addEventListener('load', function() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGTag);
    } else {
      setTimeout(loadGTag, 500);
    }
  });
  function loadGTag() {
    var script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E1WR6TZG01';
    script.async = true;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', 'G-E1WR6TZG01');
  }
</script>
""".strip()

# Pages where robots noindex should be added
noindex_keywords = ['privacy', 'terms', 'policy', 'disclaimer']

def ensure_alt_tags(html):
    return re.sub(
        r'(<img\b(?![^>]*\balt=)[^>]*)(>)',
        r'\1 alt="Fitness Equipment Repair"\2',
        html
    )

def inject_schema(filename, html):
    schema = ''
    if 'about' in filename:
        schema = {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Canadian Fitness Repair",
            "url": f"https://www.canadianfitnessrepair.com/{filename}"
        }
    elif 'contact' in filename:
        schema = {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Canadian Fitness Repair",
            "url": f"https://www.canadianfitnessrepair.com/{filename}"
        }
    elif 'faq' in filename:
        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "name": "Fitness Repair FAQ",
            "url": f"https://www.canadianfitnessrepair.com/{filename}"
        }
    elif '<img' in html:
        matches = re.findall(r'<img[^>]+src="([^"]+)"[^>]*>', html)
        if matches:
            schema = {
                "@context": "https://schema.org",
                "@type": "WebPage",
                "name": "Canadian Fitness Repair",
                "image": [f"https://www.canadianfitnessrepair.com/{src.lstrip('/')}" for src in matches[:5]],
                "url": f"https://www.canadianfitnessrepair.com/{filename}"
            }

    if schema:
        jsonld = f'<script type="application/ld+json">{str(schema).replace("'", '"')}</script>'
        if '</head>' in html:
            html = html.replace('</head>', f'{jsonld}\n</head>')
    return html

def inject_robots_meta(html, filename):
    if any(k in filename.lower() for k in noindex_keywords):
        if 'name="robots"' not in html:
            tag = '<meta name="robots" content="noindex, nofollow">'
            html = html.replace('</head>', f'{tag}\n</head>')
    return html

def inject_canonical(html, filename):
    if '<link rel="canonical"' not in html:
        canonical = f'<link rel="canonical" href="https://www.canadianfitnessrepair.com/{filename}">'
        html = html.replace('</head>', f'{canonical}\n</head>')
    return html

def minify_html(content, filename):
    # Replace GA script with lazy-loaded version
    content = re.sub(
        r'<script[^>]*?gtag/js\?id=G-E1WR6TZG01.*?</script>\s*<script>.*?gtag\(.*?</script>',
        optimized_ga_script,
        content,
        flags=re.DOTALL
    )

    # Preserve JSON-LD blocks
    jsonld_pattern = re.compile(r'<script[^>]*type="application/ld\+json"[^>]*>.*?</script>', re.DOTALL | re.IGNORECASE)
    jsonld_blocks = jsonld_pattern.findall(content)
    for i, block in enumerate(jsonld_blocks):
        content = content.replace(block, f"__JSONLD_BLOCK_{i}__")

    # Fix missing alt tags on images
    content = ensure_alt_tags(content)

    # SEO injection
    content = inject_schema(filename, content)
    content = inject_canonical(content, filename)
    content = inject_robots_meta(content, filename)

    # Minify HTML outside of script blocks
    parts = re.split(r'(<script.*?>.*?</script>)', content, flags=re.DOTALL | re.IGNORECASE)
    for i in range(len(parts)):
        if not parts[i].startswith('<script'):
            parts[i] = re.sub(r'<!--(?!\[if).*?-->', '', parts[i], flags=re.DOTALL)
            parts[i] = re.sub(r'>\s+<', '><', parts[i])
            parts[i] = re.sub(r'\s{2,}', ' ', parts[i])

    content = ''.join(parts).strip()

    # Restore JSON-LD blocks
    for i, block in enumerate(jsonld_blocks):
        content = content.replace(f"__JSONLD_BLOCK_{i}__", block)

    return content

def minify_css(content):
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def minify_js(content):
    content = re.sub(r'//.*?$|/\*.*?\*/', '', content, flags=re.MULTILINE | re.DOTALL)
    return content.strip()

for root, _, files in os.walk('.'):
    if backup_folder in root:
        continue

    for fn in files:
        ext = os.path.splitext(fn)[1]
        if ext in file_exts:
            if fn in exclude_files:
                print(f'Skipping: {fn}')
                continue

            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                original = f.read()

            if ext == '.html':
                minified = minify_html(original, fn)
            elif ext == '.css':
                minified = minify_css(original)
            elif ext == '.js':
                minified = minify_js(original)
            else:
                continue

            if minified != original:
                rel_path = os.path.relpath(path, '.')
                backup_path = os.path.join(backup_folder, rel_path)
                os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                if not os.path.exists(backup_path):
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(original)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(minified)
                print(f'Minified & SEO-enhanced: {rel_path}')
