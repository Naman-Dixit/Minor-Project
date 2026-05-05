"""
stego/encoder.py
RL-guided adaptive LSB steganography encoder.
Supports both text and file payloads (binary-safe).
"""

import cv2
import json
import numpy as np
import torch
import os

from core.rl_agent import RLAgent
from core.env import get_state, reward
from stego.crypto import encrypt, derive_key
from stego.document import file_to_payload, check_capacity
from monitoring.hash_utils import compute_hash
from monitoring.logger import log
from monitoring.metrics import Metrics

agent = RLAgent()
metrics = Metrics()


# ==============================
# 🔥 BYTE SAFE CONVERSION
# ==============================
def bytes_to_bits(data: bytes) -> str:
    return ''.join(format(byte, '08b') for byte in data)


def _select_indices(flat_size: int, n_bits: int, positions: np.ndarray) -> np.ndarray:
    if n_bits <= len(positions):
        scaled = (positions * (flat_size - 1)).astype(int)
        return scaled[:n_bits]
    else:
        return np.linspace(0, flat_size - 1, n_bits, dtype=int)


# ==============================
# TEXT ENCODING
# ==============================
def encode_text(image_path: str, message: str,
                password: str = "fedrl2024",
                output_path: str = "stego.png") -> str:

    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Cover image not found: {image_path}")

    key = derive_key(password)

    msg_hash = compute_hash(message)
    payload = f"TEXT:{message}|{msg_hash}"

    encrypted = encrypt(payload, key)

    # 🔥 FIX: BYTE SAFE
    bits = bytes_to_bits(encrypted)
    n_bits = len(bits)

    log("ENCODER", f"Mode: TEXT | Bits: {n_bits}")
    return _embed(img, bits, n_bits, output_path)


# ==============================
# FILE ENCODING
# ==============================
def encode_file(cover_image_path: str, secret_file_path: str,
                password: str = "fedrl2024",
                output_path: str = "stego.png") -> str:

    if not os.path.exists(secret_file_path):
        raise FileNotFoundError(f"Secret file not found: {secret_file_path}")

    img = cv2.imread(cover_image_path)
    if img is None:
        raise FileNotFoundError(f"Cover image not found: {cover_image_path}")

    state = torch.FloatTensor(get_state(img))
    _, depth = agent.act(state)

    cap = check_capacity(cover_image_path, secret_file_path, lsb_depth=depth)

    log("ENCODER", f"Mode: FILE | Size: {cap['file_size_bytes']} bytes | Fits: {cap['fits']}")

    if not cap["fits"]:
        raise ValueError("❌ File too large for cover image")

    key = derive_key(password)

    file_payload = file_to_payload(secret_file_path)
    payload_hash = compute_hash(file_payload)

    full_payload = f"FILE:{file_payload}|{payload_hash}"

    encrypted = encrypt(full_payload, key)

    # 🔥 FIX: BYTE SAFE
    bits = bytes_to_bits(encrypted)
    n_bits = len(bits)

    log("ENCODER", f"Encrypted bits: {n_bits}")

    return _embed(img, bits, n_bits, output_path)


# ==============================
# EMBEDDING CORE
# ==============================
def _embed(img: np.ndarray, bits: str, n_bits: int, output_path: str) -> str:

    state = torch.FloatTensor(get_state(img))
    positions, depth = agent.act(state)

    flat = img.flatten().copy().astype(np.int32)

    if n_bits > len(flat):
        raise ValueError("❌ Payload too large")

    idx = _select_indices(len(flat), n_bits, positions)

    mask = 0xFF & ~((1 << depth) - 1)

    for i, b in zip(idx, bits):
        flat[i] = (flat[i] & mask) | int(b)

    stego = flat.reshape(img.shape).astype(np.uint8)
    cv2.imwrite(output_path, stego)

    # Save metadata
    with open("indices.json", "w") as f:
        json.dump({
            "idx": idx.tolist(),
            "depth": depth,
            "n_bits": n_bits
        }, f)

    r = reward(img, stego)
    loss = agent.train_step(state, r)

    metrics.log_reward(r)
    metrics.log_loss(loss)

    log("ENCODER", f"Stego saved: {output_path}")

    return output_path