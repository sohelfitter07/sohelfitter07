# tools/

Maintenance scripts. **Run all of them from the repository root**, not from inside
this folder, because they use paths relative to the project root:

```bash
python tools/generate_sitemap.py
python tools/minify_assets.py
node   tools/add-chatbot-to-all-pages.js
```

| Script | Purpose | Writes to |
|---|---|---|
| `generate_sitemap.py` | Rebuilds `sitemap.xml` from live HTML pages | `sitemap.xml` (repo root) |
| `minify_assets.py` | Minifies root `*.html` and `*.css` in place | root pages + `archive/backup_originals/` |
| `optimize_images.py` | Converts source images to WebP | `images/` |
| `insert_ga_tag.py` | Adds the GA4 tag to root HTML files | root pages |
| `full_site_crawler.py` | Mirrors the live site for offline comparison | `archive/site_download/` |
| `update_schema.py` | Injects LocalBusiness JSON-LD | `archive/site_download/` |
| `add-chatbot-to-all-pages.js` | Adds `headerfooter.js` to pages missing it | root pages |
| `minify_then_push.bat` | Windows: minify then `git push` | — |

> `archive/` is git-ignored and is never deployed. Keep it that way.
