"""
main_receive.py — Receiver node entry point.

Usage:
    python main_receive.py
    python main_receive.py --password mypass
    python main_receive.py --output-dir my_received_files
"""
import argparse
import sys
import os
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from network.p2p_node import start_receiver
from stego.decoder import decode
from network.gossip_rl import start_gossip_server, gossip_loop
from network.discovery import start_discovery, get_peers
from monitoring.logger import log


def main():
    parser = argparse.ArgumentParser(description="FedRL Stego Receiver")
    parser.add_argument("--password",   default="fedrl2024", help="AES password")
    parser.add_argument("--output-dir", default="received_files",
                        help="Directory to save received files")
    args = parser.parse_args()

    log("RECEIVER", "=== FedRL Steganography Receiver ===")

    os.makedirs(args.output_dir, exist_ok=True)

    # Start peer discovery and gossip
    start_discovery()
    start_gossip_server()

    # Wait for incoming stego image + indices
    log("RECEIVER", "Waiting for incoming transfer...")
    ok = start_receiver(
        output_stego="received_stego.png",
        output_indices="indices.json"
    )

    if not ok:
        print("ERROR: Transfer failed integrity check. Aborting.")
        sys.exit(1)

    log("RECEIVER", "Files received successfully")

    # Decode
    try:
        result = decode("received_stego.png",
                        password=args.password,
                        output_dir=args.output_dir)

        print(f"\n{'='*50}")

        if os.path.isfile(str(result)):
            print(f"  FILE RECEIVED: {result}")
            size = os.path.getsize(result)
            print(f"  Size: {size:,} bytes")
        else:
            print(f"  MESSAGE RECEIVED: {result}")

        print(f"{'='*50}\n")

    except Exception as e:
        print(f"\nERROR during decode: {e}\n")
        sys.exit(1)

    # Start gossip
    time.sleep(1)
    peers = get_peers()
    if peers:
        t = threading.Thread(target=gossip_loop, args=(peers, 5), daemon=True)
        t.start()
        log("RECEIVER", f"FedRL gossip active. Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            log("RECEIVER", "Stopped.")


if __name__ == "__main__":
    main()
