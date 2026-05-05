import socket
import threading
import time

DISCOVERY_PORT = 5050
DISCOVERY_MSG = b"STEGO_FEDRL_DISCOVER"

# Thread-safe peer storage
discovered_peers = set()
lock = threading.Lock()


# ==============================
# GET LOCAL IP (IMPORTANT)
# ==============================
def get_local_ip():
    """
    Get the actual LAN IP of this device
    (not 127.0.0.1)
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))  # external dummy connection
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


# ==============================
# BROADCAST PRESENCE
# ==============================
def broadcast_presence(interval=3):
    """
    Send broadcast packets so other devices can detect this node
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

    while True:
        try:
            sock.sendto(DISCOVERY_MSG, ("255.255.255.255", DISCOVERY_PORT))
        except Exception:
            pass
        time.sleep(interval)


# ==============================
# LISTEN FOR PEERS
# ==============================
def listen_for_peers():
    """
    Listen for incoming broadcast packets
    """
    local_ip = get_local_ip()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("", DISCOVERY_PORT))

    print(f"[DISCOVERY] Listening on port {DISCOVERY_PORT} (IP: {local_ip})")

    while True:
        try:
            data, addr = sock.recvfrom(1024)
            ip = addr[0]

            # 🚫 Ignore self
            if ip == local_ip:
                continue

            # ✅ Valid discovery message
            if data == DISCOVERY_MSG:
                with lock:
                    if ip not in discovered_peers:
                        discovered_peers.add(ip)
                        print(f"[DISCOVERY] Found peer: {ip}")

        except Exception:
            pass


# ==============================
# START DISCOVERY SYSTEM
# ==============================
def start_discovery():
    """
    Start both broadcast + listener threads
    """
    t1 = threading.Thread(target=broadcast_presence, daemon=True)
    t2 = threading.Thread(target=listen_for_peers, daemon=True)

    t1.start()
    t2.start()

    print("[DISCOVERY] Service started")


# ==============================
# GET PEERS (API USE)
# ==============================
def get_peers():
    """
    Return list of discovered peers
    """
    with lock:
        return list(discovered_peers)