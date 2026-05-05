import socket
import json
import time
import random
import threading
import torch

from core.rl_agent import RLAgent
from monitoring.logger import log

GOSSIP_PORT = 6000
CHUNK = 4096

# Shared agent instance — this is what gets federated
agent = RLAgent()


def _get_weights() -> dict:
    return {k: v.tolist() for k, v in agent.state_dict().items()}


def _apply_fedavg(incoming: dict):
    """Average incoming weights with local weights (FedAvg)."""
    local = agent.state_dict()
    for k in local:
        local_tensor = local[k].float()
        remote_tensor = torch.tensor(incoming[k]).float()
        local[k] = (local_tensor + remote_tensor) / 2.0
    agent.load_state_dict(local)
    agent.save()
    log("GOSSIP", "FedAvg applied — RLAgent updated and saved")


def send_weights(peer_ip: str):
    """Send local RLAgent weights to a peer."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect((peer_ip, GOSSIP_PORT))

        data = json.dumps(_get_weights()).encode()
        size = len(data)

        sock.sendall(size.to_bytes(8, 'big'))

        sent = 0
        while sent < size:
            chunk = data[sent:sent + CHUNK]
            sock.sendall(chunk)
            sent += len(chunk)

        sock.close()
        log("GOSSIP", f"Weights sent to {peer_ip}")
    except Exception as e:
        log("GOSSIP", f"Failed to send to {peer_ip}: {e}")


def _recv_exact(sock, n: int) -> bytes:
    data = b''
    while len(data) < n:
        chunk = sock.recv(n - len(data))
        if not chunk:
            raise ConnectionError("Socket closed")
        data += chunk
    return data


def handle_incoming(conn, addr):
    """Handle incoming weight from a peer and apply FedAvg."""
    try:
        size = int.from_bytes(_recv_exact(conn, 8), 'big')

        data = b''
        while len(data) < size:
            chunk = conn.recv(min(CHUNK, size - len(data)))
            if not chunk:
                break
            data += chunk

        incoming = json.loads(data.decode())
        log("GOSSIP", f"Received weights from {addr[0]}")
        _apply_fedavg(incoming)
    except Exception as e:
        log("GOSSIP", f"Error handling peer {addr}: {e}")
    finally:
        conn.close()


def start_gossip_server():
    """Start gossip server to receive weight updates from peers."""
    def _serve():
        # Use SO_REUSEADDR to avoid port conflict on restart
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(("0.0.0.0", GOSSIP_PORT))
        server.listen(5)
        log("GOSSIP", f"Gossip server listening on port {GOSSIP_PORT}")

        while True:
            try:
                conn, addr = server.accept()
                t = threading.Thread(target=handle_incoming, args=(conn, addr), daemon=True)
                t.start()
            except Exception as e:
                log("GOSSIP", f"Server error: {e}")

    t = threading.Thread(target=_serve, daemon=True)
    t.start()


def gossip_loop(peers: list, interval: int = 5):
    """Periodically send weights to a random peer (gossip protocol)."""
    while True:
        if peers:
            peer = random.choice(peers)
            send_weights(peer)
        time.sleep(interval)
