import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://www.canadianfitnessrepair.com/"
SAVE_DIR = "site_download"
visited = set()

def save_page(url):
    if url in visited:
        return
    visited.add(url)

    try:
        r = requests.get(url, timeout=10)
        if "text/html" not in r.headers.get("Content-Type", ""):
            return

        soup = BeautifulSoup(r.text, "html.parser")

        path = urlparse(url).path
        if path == "" or path == "/":
            path = "/index.html"
        elif path.endswith("/"):
            path += "index.html"

        file_path = SAVE_DIR + path
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(str(soup))

        print("Saved:", url)

        for link in soup.find_all("a", href=True):
            next_url = urljoin(url, link["href"])
            if BASE_URL in next_url:
                save_page(next_url)

    except Exception as e:
        print("Error:", url, e)

os.makedirs(SAVE_DIR, exist_ok=True)
save_page(BASE_URL)