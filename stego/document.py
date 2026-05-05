"""
stego/document.py
Handles encoding any file (PNG, PDF, TXT, DOCX, etc.) into a base64 string
for embedding, and reconstructing it on the receiver side.
"""
import base64
import os
import mimetypes


def file_to_payload(file_path: str) -> str:
    """
    Convert any file to a base64-encoded payload string.
    Format: FILENAME:MIMETYPE:BASE64DATA
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    filename = os.path.basename(file_path)
    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "application/octet-stream"

    with open(file_path, "rb") as f:
        raw = f.read()

    b64 = base64.b64encode(raw).decode("utf-8")
    payload = f"{filename}:{mime_type}:{b64}"
    return payload


def payload_to_file(payload: str, output_dir: str = "received_files") -> str:
    """
    Reconstruct a file from a base64-encoded payload string.
    Returns the path to the saved file.
    """
    os.makedirs(output_dir, exist_ok=True)

    parts = payload.split(":", 2)
    if len(parts) != 3:
        raise ValueError("Invalid payload format — expected FILENAME:MIMETYPE:BASE64DATA")

    filename, mime_type, b64 = parts

    raw = base64.b64decode(b64)

    out_path = os.path.join(output_dir, filename)
    with open(out_path, "wb") as f:
        f.write(raw)

    return out_path


def get_payload_capacity(cover_image_path: str, lsb_depth: int = 1) -> int:
    """
    Calculate how many bytes can be hidden in a cover image.
    capacity_bytes = (total_pixels * depth) / 8
    """
    import cv2
    img = cv2.imread(cover_image_path)
    if img is None:
        raise FileNotFoundError(f"Cover image not found: {cover_image_path}")

    total_pixels = img.flatten().shape[0]
    capacity_bits = total_pixels * lsb_depth
    capacity_bytes = capacity_bits // 8
    return capacity_bytes


def check_capacity(cover_image_path: str, file_path: str, lsb_depth: int = 1) -> dict:
    """
    Check if a file fits inside the cover image.
    Returns a dict with capacity info.
    """
    import cv2

    img = cv2.imread(cover_image_path)
    if img is None:
        raise FileNotFoundError(f"Cover image not found: {cover_image_path}")

    total_pixels = img.flatten().shape[0]
    capacity_bits = total_pixels * lsb_depth

    # Estimate payload size after base64 encoding (~1.37x raw size) + overhead
    raw_size = os.path.getsize(file_path)
    estimated_payload_bits = int(raw_size * 1.37 * 8) + 1000  # +1000 for metadata

    fits = capacity_bits >= estimated_payload_bits

    return {
        "cover_image": cover_image_path,
        "cover_pixels": total_pixels,
        "capacity_bits": capacity_bits,
        "capacity_bytes": capacity_bits // 8,
        "file_size_bytes": raw_size,
        "estimated_bits_needed": estimated_payload_bits,
        "fits": fits
    }
