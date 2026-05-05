from Crypto.Cipher import AES
import base64
import hashlib


def derive_key(password: str) -> bytes:
    """Derive a 16-byte AES key from a password string."""
    return hashlib.sha256(password.encode()).digest()[:16]


def pad(data: bytes) -> bytes:
    pad_len = 16 - (len(data) % 16)
    return data + bytes([pad_len] * pad_len)


def unpad(data: bytes) -> bytes:
    pad_len = data[-1]
    return data[:-pad_len]


def encrypt(message: str, key: bytes) -> str:
    cipher = AES.new(key, AES.MODE_ECB)
    encrypted = cipher.encrypt(pad(message.encode()))
    return base64.b64encode(encrypted).decode()


def decrypt(ciphertext: str, key: bytes) -> str:
    cipher = AES.new(key, AES.MODE_ECB)
    decoded = base64.b64decode(ciphertext)
    return unpad(cipher.decrypt(decoded)).decode()
