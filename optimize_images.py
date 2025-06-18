from PIL import Image
import os
from pathlib import Path
import shutil

# Define folders
image_dir = Path("images")
backup_dir = Path("backup_images")
backup_dir.mkdir(exist_ok=True)

# File types to compress/convert
extensions = [".jpg", ".jpeg", ".png"]

def optimize_image(image_path):
    try:
        # Create backup
        shutil.copy(image_path, backup_dir / image_path.name)

        # Open and convert image
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            webp_path = image_path.with_suffix(".webp")
            img.save(webp_path, "webp", quality=80, optimize=True)

        print(f"🗜️ Optimized and converted: {image_path.name}")
    except Exception as e:
        print(f"❌ Failed: {image_path.name} — {e}")

# Process all images
for file in image_dir.iterdir():
    if file.suffix.lower() in extensions:
        optimize_image(file)
