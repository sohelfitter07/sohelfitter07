import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
exclude_files = ['whatsapp.js']
os.makedirs(backup_folder, exist_ok=True)

def minify_html(content):
    # Remove comments (except conditional IE comments)
    content = re.sub(r'<!--(?!\[if).*?-->', '', content, flags=re.DOTALL)
    
    # Remove extra whitespace between tags
    content = re.sub(r'>\s+<', '><', content)
    
    # Collapse multiple spaces
    content = re.sub(r'\s{2,}', ' ', content)

    return content.strip()

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
                print(f'Minified: {rel_path}')
