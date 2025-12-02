import string

# Base62 characters: 0-9, a-z, A-Z
BASE62_CHARS = string.digits + string.ascii_lowercase + string.ascii_uppercase


def id_to_base62(num: int) -> str:
    """Convert a numeric ID to a Base62 string."""
    if num == 0:
        return BASE62_CHARS[0]
    
    result = []
    base = len(BASE62_CHARS)
    
    while num > 0:
        result.append(BASE62_CHARS[num % base])
        num //= base
    
    return "".join(reversed(result))


def base62_to_id(slug: str) -> int:
    """Convert a Base62 string back to a numeric ID."""
    num = 0
    base = len(BASE62_CHARS)
    
    for char in slug:
        num = num * base + BASE62_CHARS.index(char)
    
    return num


def generate_slug(url_id: int, min_length: int = 6) -> str:
    """
    Generate a unique slug from a URL ID.
    
    The slug is padded to ensure a minimum length for consistency.
    Adding a large offset ensures shorter IDs still produce reasonably long slugs.
    """
    # Add offset to ensure minimum length slugs
    offset = 62 ** (min_length - 1)  # Ensures at least min_length characters
    return id_to_base62(url_id + offset)
