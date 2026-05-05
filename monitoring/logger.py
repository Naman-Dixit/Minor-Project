import time


def log(tag: str, msg: str):
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}][{tag}] {msg}")
