import os
import re

# File extensions to process (ONLY html and css)
file_exts = ['.html', '.css']

# Folder to store original unminified backups
backup_folder = 'backup_originals'

# Files you may want to skip (optional)
exclude_files = []

# Make backup folder if not exist
os.makedirs(backup_folder, exist_ok=True)

def minify_html(content):
    # Remove HTML comments (except conditional IE comments)
    content = re.sub(r'<!--(?!\[if).*?-->', '', content, flags=re.DOTALL)

    # Remove extra whitespace between tags
    content = re.sub(r'>\s+<', '><', content)

    # Collapse multiple spaces
    content = re.sub(r'\s{2,}', ' ', content)

    return content.strip()

def minify_css(content):
    # Remove CSS comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

    # Collapse whitespace
    content = re.sub(r'\s+', ' ', content)

    return content.strip()

# Walk through all project files
for root, _, files in os.walk('.'):
    if backup_folder in root:
        continue  # Skip already backed-up files

    for fn in files:
        ext = os.path.splitext(fn)[1]
        if ext not in file_exts:
            continue  # Skip non-target extensions

        if fn in exclude_files:
            print(f'Skipping: {fn}')
            continue

        path = os.path.join(root, fn)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            original = f.read()

        # Minify based on file type
        if ext == '.html':
            minified = minify_html(original)
        elif ext == '.css':
            minified = minify_css(original)
        else:
            continue

        # Save only if changes occurred
        if minified != original:
            rel_path = os.path.relpath(path, '.')
            backup_path = os.path.join(backup_folder, rel_path)

            # Make sure backup folder path exists
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)

            # Save original once
            if not os.path.exists(backup_path):
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original)

            # Save minified version
            with open(path, 'w', encoding='utf-8') as f:
                f.write(minified)

            print(f'Minified: {rel_path}')
