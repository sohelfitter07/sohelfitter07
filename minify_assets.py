import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
os.makedirs(backup_folder, exist_ok=True)

google_tag = ''  # (Not needed here)

def minify(content, ext):
    if ext == '.html':
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    elif ext == '.css':
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    elif ext == '.js':
        content = re.sub(r'//.*?$|/\*.*?\*/', '', content, flags=re.MULTILINE|re.DOTALL)
    content = re.sub(r'>\s+<', '><', content)
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

for root, _, files in os.walk('.'):
    for fn in files:
        ext = os.path.splitext(fn)[1]
        if ext in file_exts:
            path = os.path.join(root, fn)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                original = f.read()
            minified = minify(original, ext)
            if minified != original:
                rel = os.path.relpath(path, '.')
                backup = os.path.join(backup_folder, rel)
                os.makedirs(os.path.dirname(backup), exist_ok=True)
                with open(backup, 'w', encoding='utf-8') as f:
                    f.write(original)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(minified)
                print(f'🛠️ Minified: {rel}')
