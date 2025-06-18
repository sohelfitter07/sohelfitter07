from PIL import Image, ImageOps
import os

# Define input and output directories
input_folder = "backup_images"
output_folder = "images"

# Create output folder if it doesn't exist
os.makedirs(output_folder, exist_ok=True)

# Allowed image extensions
image_extensions = ('.jpg', '.jpeg', '.png')

# Loop through all files in the input folder
for filename in os.listdir(input_folder):
    if filename.lower().endswith(image_extensions):
        source_path = os.path.join(input_folder, filename)

        # Open and auto-orient the image
        with Image.open(source_path) as img:
            img = ImageOps.exif_transpose(img)  # Fix orientation

            # Convert and save as .webp
            output_filename = os.path.splitext(filename)[0] + ".webp"
            output_path = os.path.join(output_folder, output_filename)
            img.save(output_path, "WEBP", quality=85)

            print(f"Optimized and saved: {output_filename}")
