def minify_html(content):
    # Replace old GA script with the optimized one
    content = re.sub(
        r'<script[^>]*?gtag/js\?id=G-E1WR6TZG01.*?</script>\s*<script>.*?gtag\(.*?\).*?</script>',
        optimized_ga_script.strip(),
        content,
        flags=re.DOTALL
    )

    # Extract and preserve all <script type="application/ld+json"> blocks
    jsonld_pattern = re.compile(r'<script[^>]*type="application/ld\+json"[^>]*>.*?</script>', re.DOTALL | re.IGNORECASE)
    jsonld_blocks = jsonld_pattern.findall(content)

    for i, block in enumerate(jsonld_blocks):
        content = content.replace(block, f"__JSONLD_BLOCK_{i}__")

    # Split remaining content to exclude <script> blocks from aggressive minifying
    parts = re.split(r'(<script.*?>.*?</script>)', content, flags=re.DOTALL | re.IGNORECASE)
    for i in range(len(parts)):
        if not parts[i].startswith('<script'):
            parts[i] = re.sub(r'<!--(?!\[if).*?-->', '', parts[i], flags=re.DOTALL)
            parts[i] = re.sub(r'>\s+<', '><', parts[i])
            parts[i] = re.sub(r'\s{2,}', ' ', parts[i])

    content = ''.join(parts).strip()

    # Restore preserved JSON-LD blocks
    for i, block in enumerate(jsonld_blocks):
        content = content.replace(f"__JSONLD_BLOCK_{i}__", block)

    return content
