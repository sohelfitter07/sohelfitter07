import os
import re

backup_dir = "backup_jsonld"
os.makedirs(backup_dir, exist_ok=True)

def remove_jsonld_blocks(html):
    return re.sub(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>',
        '',
        html,
        flags=re.DOTALL | re.IGNORECASE
    )

count = 0

for root, _, files in os.walk("."):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)

            with open(path, 'r', encoding='utf-8') as f:
                original = f.read()

            cleaned = remove_jsonld_blocks(original)

            if cleaned != original:
                # Backup
                rel_path = os.path.relpath(path, '.')
                backup_path = os.path.join(backup_dir, rel_path)
                os.makedirs(os.path.dirname(backup_path), exist_ok=True)
                with open(backup_path, 'w', encoding='utf-8') as f:
                    f.write(original)

                # Save cleaned file
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(cleaned)

                print(f"✅ Removed JSON-LD from: {rel_path}")
                count += 1

print(f"\n🏁 Completed. {count} file(s) updated.")
