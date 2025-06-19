import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
os.makedirs(backup_folder, exist_ok=True)

def minify_html(content):
    # Remove comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    # Minify HTML outside <script>...</script> blocks
    parts = re.split(r'(<script.*?>.*?</script>)', content, flags=re.DOTALL | re.IGNORECASE)
    for i in range(len(parts)):
        if not parts[i].strip().lower().startswith('<script'):
            parts[i] = re.sub(r'>\s+<', '><', parts[i])  # remove space between tags
            parts[i] = re.sub(r'\s+', ' ', parts[i])     # collapse whitespace
    return ''.join(parts).strip()

def minify_css(content):
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

def minify_js(content):
    # Remove single-line and multi-line comments
    content = re.sub(r'//.*?$|/\*.*?\*/', '', content, flags=re.MULTILINE | re.DOTALL)
    return content.strip()

for root, _, files in os.walk('.'):
    if backup_folder in root:
        continue

    for fn in files:
        ext = os.path.splitext(fn)[1]
        if ext in file_exts:
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

                print(f'🛠️ Minified: {rel_path}')
