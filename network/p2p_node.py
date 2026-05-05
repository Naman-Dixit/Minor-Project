import socket
import time
from network.net_utils import send_file, recv_file
from monitoring.logger import log
from monitoring.metrics import Metrics

TRANSFER_PORT = 5000
MAX_RETRIES = 3

metrics = Metrics()


def send_stego(peer_ip: str, stego_path: str = "stego.png", indices_path: str = "indices.json"):
    """Send stego image and indices file to peer with retry."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            metrics.reset()
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            sock.connect((peer_ip, TRANSFER_PORT))

            log("SENDER", f"Attempt {attempt}: Connected to {peer_ip}")

            send_file(sock, stego_path)
            log("SENDER", "Stego image sent")

            send_file(sock, indices_path)
            log("SENDER", "Indices sent")

            sock.close()
            metrics.log_latency("file transfer")
            log("SENDER", "Transfer complete")
            return True

        except Exception as e:
            log("SENDER", f"Attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(1)

    log("SENDER", "All retry attempts exhausted")
    return False


def start_receiver(output_stego: str = "received_stego.png", output_indices: str = "indices.json"):
    """
    Start a receiver that listens for one incoming transfer.
    Blocks until files are received and integrity verified.
    """
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", TRANSFER_PORT))
    server.listen(1)

    log("RECEIVER", f"Listening on port {TRANSFER_PORT}...")
    conn, addr = server.accept()
    log("RECEIVER", f"Connection from {addr[0]}")

    metrics.reset()

    ok1 = recv_file(conn, output_stego)
    if ok1:
        log("RECEIVER", "Stego image received — integrity OK")
    else:
        log("RECEIVER", "WARNING: Stego image integrity check FAILED")

    ok2 = recv_file(conn, output_indices)
    if ok2:
        log("RECEIVER", "Indices received — integrity OK")
    else:
        log("RECEIVER", "WARNING: Indices integrity check FAILED")

    conn.close()
    server.close()
    metrics.log_latency("receive")

    return ok1 and ok2
