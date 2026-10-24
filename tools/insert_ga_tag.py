import os

google_tag = '''
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E1WR6TZG01"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-E1WR6TZG01');
</script>
'''

for filename in os.listdir('.'):
    if filename.endswith('.html'):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'G-E1WR6TZG01' not in content:
            updated = content.replace('<head>', f'<head>\n{google_tag}')
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f'✅ Inserted tag into: {filename}')
        else:
            print(f'⚠️ Already contains tag: {filename}')
