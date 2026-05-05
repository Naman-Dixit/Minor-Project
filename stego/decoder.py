"""
stego/decoder.py
Binary-safe decoder for both TEXT and FILE payloads.
"""

import cv2
import json
import numpy as np
import os

from stego.crypto import decrypt, derive_key
from stego.document import payload_to_file
from monitoring.hash_utils import verify_hash
from monitoring.logger import log


# ==============================
# 🔥 BYTE SAFE CONVERSION
# ==============================
def bits_to_bytes(bits: str) -> bytes:
    return bytes(
        int(bits[i:i+8], 2)
        for i in range(0, len(bits), 8)
        if len(bits[i:i+8]) == 8
    )


# ==============================
# MAIN DECODE FUNCTION
# ==============================
def decode(image_path: str,
           password: str = "fedrl2024",
           output_dir: str = "received_files"):

    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError("Image not found")

    if not os.path.exists("indices.json"):
        raise FileNotFoundError("indices.json missing")

    with open("indices.json") as f:
        meta = json.load(f)

    idx = np.array(meta["idx"], dtype=int)
    n_bits = meta["n_bits"]

    log("DECODER", f"Extracting {n_bits} bits")

    flat = img.flatten().astype(np.int32)
    bits = ''.join(str(flat[i] & 1) for i in idx[:n_bits])

    key = derive_key(password)

    # 🔥 FIX: bits → bytes
    encrypted_bytes = bits_to_bytes(bits)

    try:
        decrypted_bytes = decrypt(encrypted_bytes, key)
        decrypted = decrypted_bytes.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Decryption failed: {e}")

    if "|" not in decrypted:
        raise ValueError("Invalid payload format")

    payload_body, received_hash = decrypted.rsplit("|", 1)

    # ==============================
    # TEXT
    # ==============================
    if payload_body.startswith("TEXT:"):
        message = payload_body[5:]

        if not verify_hash(message, received_hash):
            raise ValueError("Integrity check FAILED")

        log("DECODER", f"Message: {message}")
        return message

    # ==============================
    # FILE
    # ==============================
    elif payload_body.startswith("FILE:"):
        file_payload = payload_body[5:]

        if not verify_hash(file_payload, received_hash):
            raise ValueError("Integrity check FAILED")

        os.makedirs(output_dir, exist_ok=True)

        out_path = payload_to_file(file_payload, output_dir)

        log("DECODER", f"File reconstructed: {out_path}")

        return out_path

    else:
        raise ValueError("Unknown payload type")