from email.header import decode_header
import re


def decode_mime_header(value: str) -> str:
    if not value:
        return ""
    decoded_parts = decode_header(value)
    result = ""
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            result += part.decode(encoding or 'utf-8', errors='ignore')
        else:
            result += part
    return result


def add_target_blank(html):
    return re.sub(r'(<a\s+(?![^>]*target=))', r'\1target="_blank" ', html)
