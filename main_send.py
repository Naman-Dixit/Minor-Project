"""
main_send.py — Sender node entry point.

Send a TEXT message:
    python main_send.py --mode text --message "Hello" --cover data/cover.png --peer 192.168.1.5

Send a FILE (any format):
    python main_send.py --mode file --secret data/secret.png --cover data/cover.png --peer 192.168.1.5

With custom password:
    python main_send.py --mode file --secret doc.pdf --cover cover.png --peer 192.168.1.5 --password mypass

Auto-discover peers (no --peer needed on same LAN):
    python main_send.py --mode file --secret doc.pdf --cover cover.png
"""
import argparse
import sys
import os
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from stego.encoder import encode_text, encode_file
from stego.document import check_capacity
from network.p2p_node import send_stego
from network.gossip_rl import start_gossip_server, gossip_loop
from network.discovery import start_discovery, get_peers
from monitoring.logger import log


def main():
    parser = argparse.ArgumentParser(description="FedRL Stego Sender")
    parser.add_argument("--mode",     choices=["text", "file"], default="text",
                        help="Send a text message or a file")
    parser.add_argument("--message",  default=None, help="Text message to hide (mode=text)")
    parser.add_argument("--secret",   default=None, help="Path to secret file (mode=file)")
    parser.add_argument("--cover",    required=True, help="Path to cover image (PNG)")
    parser.add_argument("--peer",     default=None,  help="Receiver IP address")
    parser.add_argument("--password", default="fedrl2024", help="AES password")
    parser.add_argument("--output",   default="stego.png", help="Output stego image path")
    args = parser.parse_args()

    log("SENDER", "=== FedRL Steganography Sender ===")

    # Validate inputs
    if args.mode == "text" and not args.message:
        print("ERROR: --message required for text mode")
        sys.exit(1)
    if args.mode == "file" and not args.secret:
        print("ERROR: --secret required for file mode")
        sys.exit(1)
    if not os.path.exists(args.cover):
        print(f"ERROR: Cover image not found: {args.cover}")
        sys.exit(1)

    # Start peer discovery
    start_discovery()
    time.sleep(2)

    # Start gossip server
    start_gossip_server()

    # Capacity check for file mode
    if args.mode == "file":
        try:
            cap = check_capacity(args.cover, args.secret)
            log("SENDER", f"Capacity check: needs {cap['file_size_bytes']:,}B, "
                          f"cover has {cap['capacity_bytes']:,}B, fits={cap['fits']}")
            if not cap["fits"]:
                print(f"\nERROR: File is too large for cover image.")
                print(f"  File size:       {cap['file_size_bytes']:,} bytes")
                print(f"  Cover capacity:  {cap['capacity_bytes']:,} bytes")
                print(f"  Use a larger cover image.\n")
                sys.exit(1)
        except Exception as e:
            print(f"ERROR during capacity check: {e}")
            sys.exit(1)

    # Encode
    try:
        if args.mode == "text":
            log("SENDER", f"Encoding text message...")
            stego = encode_text(args.cover, args.message, args.password, args.output)
        else:
            log("SENDER", f"Encoding file: {args.secret}")
            stego = encode_file(args.cover, args.secret, args.password, args.output)
    except ValueError as e:
        print(f"\nERROR: {e}\n")
        sys.exit(1)

    # Resolve peer
    peer_ip = args.peer
    if not peer_ip:
        peers = get_peers()
        if peers:
            peer_ip = peers[0]
            log("SENDER", f"Auto-discovered peer: {peer_ip}")
        else:
            log("SENDER", "No peer found. Waiting 5s for discovery...")
            time.sleep(5)
            peers = get_peers()
            if peers:
                peer_ip = peers[0]
            else:
                print("ERROR: No peer specified and none discovered on LAN.")
                sys.exit(1)

    # Transfer stego image + indices to receiver
    log("SENDER", f"Sending to {peer_ip}...")
    success = send_stego(peer_ip, stego, "indices.json")

    if not success:
        print("ERROR: File transfer failed after all retries.")
        sys.exit(1)

    log("SENDER", "Transfer complete")

    # Start gossip federated learning loop
    peers = get_peers() or [peer_ip]
    t = threading.Thread(target=gossip_loop, args=(peers, 5), daemon=True)
    t.start()
    log("SENDER", f"FedRL gossip active with {len(peers)} peer(s). Ctrl+C to stop.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        log("SENDER", "Stopped.")


if __name__ == "__main__":
    main()
