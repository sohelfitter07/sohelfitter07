import os
import re

WHATSAPP_HTML_SNIPPET = '''<section>
  <div class="whatsapp-widget" id="whatsappWidget">
    <div class="widget-header">
      <div class="whatsapp-icon"><i class="fab fa-whatsapp"></i></div>
      <div class="header-text">
        <h3>Canadian Fitness Repair</h3>
        <p>Typically replies instantly</p>
      </div>
      <button class="close-btn" id="closeBtn">×</button>
    </div>
    <div class="chat-content" id="chatContent">
      <div class="message received">
        Hi there! 👋 Thanks for visiting Canadian Fitness Repair. How can we help you with your fitness equipment today?
      </div>
      <div class="message received">
        We specialize in repairing treadmills, ellipticals, exercise bikes, and strength training equipment. Let us know what you need help with!
      </div>
      <div class="message sent">Great!.</div>
    </div>
    <div class="action-area">
      <button class="whatsapp-btn" id="whatsappBtn">
        <i class="fab fa-whatsapp"></i> Chat on WhatsApp
      </button>
    </div>
  </div>
  <div class="floating-btn pulse" id="floatingBtn">
    <i class="fab fa-whatsapp"></i>
  </div>
</section>'''

WHATSAPP_CSS_TAG = '<link rel="stylesheet" href="whatsapp.css">'
WHATSAPP_JS_TAG = '<script src="whatsapp.js"></script>'

html_pattern = re.compile(r'id=["\']whatsappWidget["\']', re.IGNORECASE)
css_pattern = re.compile(r'href=["\'].*whatsapp\\.css["\']', re.IGNORECASE)
js_pattern = re.compile(r'src=["\'].*whatsapp\\.js["\']', re.IGNORECASE)
inline_css_pattern = re.compile(r'<style[^>]*>.*?whatsapp[^<]*?</style>', re.DOTALL | re.IGNORECASE)

print("\n🔧 Injecting WhatsApp widget if missing...\n")

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                html = f.read()

            original = html
            updated = False

            # Remove inline whatsapp CSS
            html, css_subs = inline_css_pattern.subn('', html)
            if css_subs > 0:
                updated = True

            # Inject WhatsApp HTML section if missing
            if not html_pattern.search(html):
                if '</body>' in html:
                    html = html.replace('</body>', f'{WHATSAPP_HTML_SNIPPET}\n</body>')
                    updated = True

            # Inject whatsapp.css if not present
            if not css_pattern.search(html):
                if '</head>' in html:
                    html = html.replace('</head>', f'{WHATSAPP_CSS_TAG}\n</head>')
                    updated = True

            # Inject whatsapp.js if not present
            if not js_pattern.search(html):
                if '</body>' in html:
                    html = html.replace('</body>', f'{WHATSAPP_JS_TAG}\n</body>')
                    updated = True

            if updated and html != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"✅ Updated: {filepath}")

print("\n🎉 Injection complete.")
