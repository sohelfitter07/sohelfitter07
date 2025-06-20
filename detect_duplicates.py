import os
import re

# Define the correct font-family value
EXPECTED_FONT = "'Segoe UI', Roboto, sans-serif"

# Compile regex to find font-family definitions
font_regex = re.compile(r'(font-family\s*:\s*)([^;"\n]+)', re.IGNORECASE)

# Root CSS var fallback pattern
css_var_regex = re.compile(r'var\(--font-family\)')

# File extensions and target directory
html_extensions = ['.html']
root_dir = '.'

print("\n🛠️ Fixing font-family issues in HTML files...\n")

for subdir, _, files in os.walk(root_dir):
    for file in files:
        if any(file.endswith(ext) for ext in html_extensions):
            path = os.path.join(subdir, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            original_content = content

            # Replace var(--font-family) with actual font
            content = css_var_regex.sub(EXPECTED_FONT, content)

            # Fix empty or malformed font-family values
            def fix_font(match):
                prop, value = match.groups()
                value = value.strip()
                if not value or value in [',', ', ,', ' , serif', ', , serif']:
                    return f"{prop}{EXPECTED_FONT}"
                return match.group()

            content = font_regex.sub(fix_font, content)

            if content != original_content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed: {path}")

print("\n🎉 Font-family normalization complete.")
