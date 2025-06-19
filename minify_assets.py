import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
exclude_files = ['whatsapp.js']

os.makedirs(backup_folder, exist_ok=True)

# Define the Google Analytics script block to inject
optimized_ga_script = """
<!-- Google Tag Manager (optimized) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E1WR6TZG01"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-E1WR6TZG01');
</script>
"""

def minify_html(content):
    # Replace old GA script with the optimized one
    content = re.sub(
        r'<script[^>]*?gtag/js\?id=G-E1WR6TZG01.*?</script>\s*<script>.*?gtag\(.*?\).*?</script>',
        optimized_ga_script.strip(),
        content,
        flags=re.DOTALL
    )

    # Remove HTML comments except for IE conditions or schema
    parts = re.split(r'(<script.*?>.*?</script>)', content, flags=re.DOTALL | re.IGNORECASE)
    for i in range(len(parts)):
        if not parts[i].startswith('<script'):
            parts[i] = re.sub(r'<!--(?!\[if).*?-->', '', parts[i], flags=re.DOTALL)
            parts[i] = re.sub(r'>\s+<', '><', parts[i])
            parts[i] = re.sub(r'\s{2,}', ' ', parts[i])
    return ''.join(parts).strip()

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
                print(f'⏭️ Skipping minification for: {fn}')
                continue

            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                original = f.read()

            if ext == '.html':
                minified = minify_html(original)
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

                print(f'🛠️ Minified & Updated GA: {rel_path}')
