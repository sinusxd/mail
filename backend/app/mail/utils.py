from bs4 import BeautifulSoup
from email.header import decode_header, make_header

def decode_mime_header(header_value: str) -> str:
    if not header_value:
        return ""
    return str(make_header(decode_header(header_value)))

def extract_plain_text_from_html(html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    return soup.get_text(separator=' ', strip=True) # type: ignore

def add_target_blank(html: str) -> str:
    return html.replace("<a ", "<a target=\"_blank\" ")
