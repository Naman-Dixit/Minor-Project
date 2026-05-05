import hashlib


def compute_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def verify_hash(data: str, expected_hash: str) -> bool:
    return compute_hash(data) == expected_hash
