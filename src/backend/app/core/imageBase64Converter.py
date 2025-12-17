import base64
import io
import os
import time
from PIL import Image  # Requires: pip install Pillow

class ImageBase64Converter:
    def image_to_base64(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(file_path, "rb") as image_file:
            encoded_bytes = base64.b64encode(image_file.read())
            return encoded_bytes.decode('utf-8')

    def base64_to_image(self, base64_string: str, output_path: str = None) -> str:
        """
        Decodes Base64 (JPEG/PNG/etc) and SAVES it as a valid PNG.
        """
        # 1. Clean header if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        # 2. Decode bytes
        image_data = base64.b64decode(base64_string)

        # 3. Handle Output Path
        if output_path is None:
            output_path = f"output_{int(time.time())}.png"
        
        if not output_path.lower().endswith('.png'):
            output_path += '.png'

        try:
            # 4. Load bytes into Pillow to convert format
            # io.BytesIO makes the bytes look like a file in memory
            with Image.open(io.BytesIO(image_data)) as img:
                # This actually converts JPEG/WEBP/etc pixels to PNG format
                img.save(output_path, format="PNG")
            
            return output_path
        except Exception as e:
            raise ValueError(f"Failed to convert/save image: {e}")

# --- Usage ---
if __name__ == "__main__":
    converter = ImageBase64Converter()
    
    # A tiny JPEG Base64 string
    jpeg_b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    
    # This will save as a VALID PNG, not a mislabeled JPEG
    path = converter.base64_to_image(jpeg_b64, "converted_image")
    print(f"Saved to: {path}")