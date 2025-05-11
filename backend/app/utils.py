from datetime import datetime
from email.utils import parsedate_to_datetime

def parse_email_date(date_raw: str | None) -> datetime | None:
    if not date_raw:
        return None
    try:
        # Попытка распарсить как ISO 8601
        return datetime.fromisoformat(date_raw)
    except ValueError:
        pass
    try:
        # Попытка распарсить как RFC 2822
        return parsedate_to_datetime(date_raw)
    except Exception:
        return None
