"""
main_simulate.py — Launch multiple nodes as real OS processes.

Usage:
    python main_simulate.py
    python main_simulate.py --nodes 3 --message "SECRET"
"""
import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from network.simulator import simulate


def main():
    parser = argparse.ArgumentParser(description="FedRL Multi-Node Simulator")
    parser.add_argument("--nodes",   type=int, default=3,       help="Number of nodes to simulate")
    parser.add_argument("--message", default="FEDRL_TEST",      help="Message to encode")
    args = parser.parse_args()

    print(f"\nLaunching {args.nodes}-node federated simulation...")
    simulate(n_nodes=args.nodes, message=args.message)


if __name__ == "__main__":
    main()
