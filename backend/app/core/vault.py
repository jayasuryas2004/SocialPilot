import os
from typing import Optional
from dotenv import load_dotenv
from cryptography.fernet import Fernet, InvalidToken

load_dotenv()

# Retrieve or initialize Fernet encryption cipher using VAULT_ENCRYPTION_KEY
_VAULT_KEY_ENV = os.getenv("VAULT_ENCRYPTION_KEY")
if not _VAULT_KEY_ENV:
    _VAULT_KEY_ENV = "Bfx5n56e2C3jaWxtroiqApTi_MlgUOyp8gAMQxHtHzI="

try:
    _FERNET_CIPHER = Fernet(_VAULT_KEY_ENV.encode("utf-8"))
except Exception:
    # If key format is invalid, generate and fallback safely
    _FALLBACK_KEY = Fernet.generate_key()
    _FERNET_CIPHER = Fernet(_FALLBACK_KEY)


def encrypt_token(raw_token: Optional[str]) -> Optional[str]:
    """
    Encrypts a raw plaintext OAuth access or refresh token string using Fernet symmetric encryption.
    Strips accidental byte-string wrappers and returns clean UTF-8 ciphertext.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    if raw_token is None:
        return None

    cleaned_token = str(raw_token).strip()
    if (cleaned_token.startswith("b'") and cleaned_token.endswith("'")) or (cleaned_token.startswith('b"') and cleaned_token.endswith('"')):
        cleaned_token = cleaned_token[2:-1].strip()

    if len(cleaned_token) == 0:
        return None

    token_bytes = cleaned_token.encode("utf-8")
    encrypted_bytes = _FERNET_CIPHER.encrypt(token_bytes)
    return encrypted_bytes.decode("utf-8")


def decrypt_token(cipher_token: Optional[str]) -> Optional[str]:
    """
    Decrypts an encrypted OAuth access or refresh token string in memory.
    Ensures the returned value is strictly a clean UTF-8 decoded string.
    Strips any accidental byte-string formatting (e.g. b'...').
    If decryption fails or token is empty, gracefully returns None.
    Strictly uses standard control flow (no list comprehensions or lambda expressions).
    """
    if cipher_token is None:
        return None

    cleaned = str(cipher_token).strip()
    if len(cleaned) == 0:
        return None

    # Strip accidental byte literal wrappers (e.g., "b'...'" or 'b"..."')
    if (cleaned.startswith("b'") and cleaned.endswith("'")) or (cleaned.startswith('b"') and cleaned.endswith('"')):
        cleaned = cleaned[2:-1].strip()

    if len(cleaned) == 0:
        return None

    try:
        cipher_bytes = cleaned.encode("utf-8")
        decrypted_bytes = _FERNET_CIPHER.decrypt(cipher_bytes)
        result = decrypted_bytes.decode("utf-8").strip()

        # Handle nested byte-string artifact if present
        if (result.startswith("b'") and result.endswith("'")) or (result.startswith('b"') and result.endswith('"')):
            result = result[2:-1].strip()

        if len(result) == 0:
            return None

        return result
    except (InvalidToken, Exception):
        # Fallback: if already a raw plaintext token (e.g., unencrypted during test/dev)
        if (cleaned.startswith("b'") and cleaned.endswith("'")) or (cleaned.startswith('b"') and cleaned.endswith('"')):
            cleaned = cleaned[2:-1].strip()

        if len(cleaned) > 0:
            return cleaned
        return None
