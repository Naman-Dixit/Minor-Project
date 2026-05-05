import numpy as np


def get_state(img):
    """Flatten mean pixel values to 64-dim state vector."""
    return np.mean(img, axis=2).flatten()[:64].astype(np.float32)


def chi_square_detect(image):
    """
    Chi-square LSB steganalysis.
    Compares observed vs expected LSB frequency distribution.
    Returns score 0.0 (undetectable) to 1.0 (highly detectable).
    """
    flat = image.flatten().astype(np.int32)
    lsbs = flat & 1

    # Expected: roughly 50/50 split of 0s and 1s in natural images
    n = len(lsbs)
    observed_ones = np.sum(lsbs)
    observed_zeros = n - observed_ones

    expected = n / 2.0

    # Chi-square statistic
    chi_sq = ((observed_ones - expected) ** 2 + (observed_zeros - expected) ** 2) / expected

    # Normalize to [0, 1] — higher = more detectable
    score = min(chi_sq / (n * 0.01 + 1e-6), 1.0)
    return float(score)


def reward(original, stego):
    """
    Combined reward:
    - Invisibility: how visually similar stego is to original (MSE based)
    - Stealth: how undetectable it is to chi-square steganalysis
    Higher = better embedding.
    """
    mse = np.mean((original.astype(np.float32) - stego.astype(np.float32)) ** 2)
    invisibility = 1.0 / (1.0 + mse)

    detect_score = chi_square_detect(stego)
    stealth = 1.0 - detect_score

    return float(0.5 * invisibility + 0.5 * stealth)
