import secrets
import hashlib
from typing import Optional

# Adjectives for readable slugs
ADJECTIVES = [
    "swift", "bright", "cool", "fast", "quick", "smart", "bold", "calm",
    "crisp", "fresh", "keen", "neat", "pure", "safe", "warm", "wise",
    "agile", "brave", "clear", "eager", "fair", "glad", "happy", "jolly",
    "lucky", "merry", "noble", "proud", "royal", "sunny", "vivid", "witty",
    "azure", "coral", "golden", "ivory", "jade", "lunar", "misty", "ocean",
    "polar", "ruby", "silver", "terra", "ultra", "violet", "zen", "cosmic"
]

# Nouns for readable slugs
NOUNS = [
    "link", "clip", "byte", "node", "path", "wave", "spark", "pulse",
    "beam", "flash", "glow", "peak", "star", "moon", "sun", "sky",
    "cloud", "storm", "wind", "fire", "ice", "rock", "leaf", "tree",
    "bird", "wolf", "fox", "hawk", "lion", "bear", "fish", "owl",
    "river", "ocean", "shore", "coast", "hill", "vale", "mesa", "cove",
    "pixel", "nexus", "prism", "orbit", "comet", "nova", "quark", "flux"
]

# URL-safe characters for random suffix
URL_SAFE_CHARS = "23456789abcdefghjkmnpqrstuvwxyz"  # Removed confusing chars: 0, 1, i, l, o


def _random_suffix(length: int = 4) -> str:
    """Generate a random URL-safe suffix."""
    return "".join(secrets.choice(URL_SAFE_CHARS) for _ in range(length))


def _hash_based_selection(url_id: int, items: list) -> str:
    """Select an item from list based on ID hash for consistency."""
    hash_val = int(hashlib.md5(str(url_id).encode()).hexdigest()[:8], 16)
    return items[hash_val % len(items)]


def generate_slug(url_id: int, style: str = "readable") -> str:
    """
    Generate a unique, memorable slug for a URL.
    
    Styles:
    - 'readable': adjective-noun-suffix (e.g., swift-link-x7k9)
    - 'short': Just random characters (e.g., x7k9m2p4)
    - 'mixed': noun-suffix (e.g., spark-7k9m)
    """
    suffix = _random_suffix(4)
    
    if style == "readable":
        # Use ID to deterministically pick words + random suffix for uniqueness
        adj = _hash_based_selection(url_id, ADJECTIVES)
        noun = _hash_based_selection(url_id * 31, NOUNS)  # Different hash for variety
        return f"{adj}-{noun}-{suffix}"
    
    elif style == "mixed":
        noun = _hash_based_selection(url_id, NOUNS)
        return f"{noun}-{suffix}"
    
    else:  # short
        return _random_suffix(8)


def generate_random_slug(length: int = 8) -> str:
    """Generate a purely random slug."""
    return _random_suffix(length)
