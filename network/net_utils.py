import hashlib

CHUNK = 4096


def send_file(sock, filepath: str):
    """Send a file with size header + SHA-256 hash for integrity."""
    with open(filepath, "rb") as f:
        data = f.read()

    file_hash = hashlib.sha256(data).hexdigest().encode()
    size = len(data)

    # Send: 8-byte size + 64-byte hash + data
    sock.sendall(size.to_bytes(8, 'big'))
    sock.sendall(file_hash)

    sent = 0
    while sent < size:
        chunk = data[sent:sent + CHUNK]
        sock.sendall(chunk)
        sent += len(chunk)


def recv_file(sock, filepath: str) -> bool:
    """
    Receive a file with size header + SHA-256 integrity check.
    FIXED: loops until all bytes are received.
    Returns True if integrity check passes.
    """
    size_bytes = _recv_exact(sock, 8)
    size = int.from_bytes(size_bytes, 'big')

    expected_hash = _recv_exact(sock, 64).decode()

    # FIXED recv loop — guaranteed to get all bytes
    data = b''
    while len(data) < size:
        remaining = size - len(data)
        chunk = sock.recv(min(CHUNK, remaining))
        if not chunk:
            raise ConnectionError("Connection closed before all data received")
        data += chunk

    actual_hash = hashlib.sha256(data).hexdigest()

    if actual_hash != expected_hash:
        return False

    with open(filepath, "wb") as f:
        f.write(data)

    return True


def _recv_exact(sock, n: int) -> bytes:
    """Receive exactly n bytes."""
    data = b''
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError("Socket closed unexpectedly")
        data += chunk
    return data
