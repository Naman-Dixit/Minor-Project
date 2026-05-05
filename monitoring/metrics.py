import time
from monitoring.logger import log


class Metrics:
    def __init__(self):
        self._start = time.time()

    def reset(self):
        self._start = time.time()

    def log_latency(self, label="transfer"):
        elapsed = round(time.time() - self._start, 3)
        log("METRICS", f"{label} latency: {elapsed}s")

    def log_reward(self, r: float):
        log("METRICS", f"RL reward: {round(r, 4)}")

    def log_loss(self, l: float):
        log("METRICS", f"RL loss: {round(l, 6)}")
