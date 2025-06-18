import os
import re

file_exts = ['.html', '.css', '.js']
backup_folder = 'backup_originals'
os.makedirs(backup_folder, exist_ok=True)

def minify(content, ext):
    if ext == '.html':
        content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    elif ext == '.css':
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    elif ext == '.js':
        content = re.sub(r'//.*?$|/\*.*?\*/', '', content, flags=re.MULTILINE | re.DOTALL)
    content = re.sub(r'>\s+<', '><', content)
    content = re.sub(r'\s+', ' ', content)
    return content.strip()

for root, _, files in os.walk('.'):
    # Skip backup folder itself
    if backup_folder in root:
        continue

    for fn in files:
        ext = os.path.splitext(fn)[1]
        if ext in file_exts:
            path = os.path.join(root, fn)

            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                original = f.read()

            minified = minify(original, ext)

            if minified != original:
                rel_path = os.path.relpath(path, '.')
                backup_path = os.path.join(backup_folder, rel_path)

                # Create folder if not exist
                os.makedirs(os.path.dirname(backup_path), exist_ok=True)

                # Write backup only once
                if not os.path.exists(backup_path):
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        f.write(original)

                # Overwrite file with minified
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(minified)

                print(f'🛠️ Minified: {rel_path}')
