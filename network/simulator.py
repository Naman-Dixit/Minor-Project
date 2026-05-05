"""
Multi-process node simulator.
Spawns each node as a real OS process — true federation, not coroutines.
Each node encodes a message, shares weights via gossip, and runs independently.
"""
import multiprocessing
import time
import os
import cv2
import numpy as np
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def create_dummy_image(path: str):
    """Create a simple test image if none exists."""
    img = np.random.randint(100, 200, (256, 256, 3), dtype=np.uint8)
    cv2.imwrite(path, img)


def run_node(node_id: int, peers: list, message: str, image_path: str):
    """
    Single node process:
    - Encodes a message into the image
    - Starts gossip server to receive weight updates
    - Sends its weights to peers periodically
    """
    # Each node gets its own working directory
    node_dir = f"node_{node_id}"
    os.makedirs(node_dir, exist_ok=True)
    os.chdir(node_dir)

    # Copy image into node workspace
    import shutil
    if not os.path.exists("input.png"):
        shutil.copy(f"../{image_path}", "input.png")

    print(f"\n[NODE {node_id}] Starting...")

    from core.rl_agent import RLAgent
    from stego.encoder import encode
    from network.gossip_rl import start_gossip_server, gossip_loop
    import threading

    # Start gossip server (receive weights from peers)
    start_gossip_server()
    time.sleep(0.5)

    # Encode a message (trains RL agent locally)
    try:
        encode("input.png", f"{message} from node {node_id}", password="fedrl2024")
        print(f"[NODE {node_id}] Encoding done")
    except Exception as e:
        print(f"[NODE {node_id}] Encode error: {e}")

    # Run gossip loop in background
    if peers:
        t = threading.Thread(
            target=gossip_loop,
            args=(peers, 4),
            daemon=True
        )
        t.start()

    print(f"[NODE {node_id}] Running gossip with peers: {peers}")

    # Keep node alive for 30 seconds (demo duration)
    time.sleep(30)
    print(f"[NODE {node_id}] Shutting down")


def simulate(n_nodes: int = 3, message: str = "FEDRL_SECRET"):
    """
    Simulate n_nodes as real separate OS processes.
    Each node knows about the others via localhost IPs.
    """
    # For local simulation all nodes run on localhost with different ports
    # In real deployment each would be a separate machine IP

    image_path = "data/input.png"
    if not os.path.exists(image_path):
        os.makedirs("data", exist_ok=True)
        create_dummy_image(image_path)
        print(f"Created dummy image at {image_path}")

    # Peer list = localhost (in real deployment these would be actual IPs)
    peers = ["127.0.0.1"] * n_nodes

    processes = []
    for i in range(n_nodes):
        # Each node's peers = all other nodes (localhost for simulation)
        node_peers = ["127.0.0.1"] * (n_nodes - 1)

        p = multiprocessing.Process(
            target=run_node,
            args=(i + 1, node_peers, message, image_path),
            name=f"Node-{i+1}"
        )
        processes.append(p)

    print(f"\n[SIMULATOR] Launching {n_nodes} independent node processes...")

    for p in processes:
        p.start()
        time.sleep(0.5)  # stagger startup

    print(f"[SIMULATOR] All nodes running. PIDs: {[p.pid for p in processes]}")

    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        print("\n[SIMULATOR] Shutting down all nodes...")
        for p in processes:
            p.terminate()


if __name__ == "__main__":
    simulate(n_nodes=3, message="HELLO_FEDRL")
