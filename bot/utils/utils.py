from datetime import datetime, date, timedelta
from typing import Tuple, List
import jwt  

def parse_date(s: str) -> date:
    dt = datetime.strptime(s, "%Y-%m-%d")
    return dt.date()

def adjust_date_for_utc(date_str: str, tz_offset: int = 3) -> str:
    local_dt = datetime.strptime(date_str, "%Y-%m-%d")
    utc_dt = local_dt - timedelta(hours=tz_offset)
    return utc_dt.strftime("%Y-%m-%d")

def parse_dates(raw_input: str) -> tuple[list, list]:
    raw_dates = raw_input.replace('\n', ' ').split()
    valid = []
    invalid = []

    for date_str in raw_dates:
        try:
            valid.append(datetime.strptime(date_str, "%Y-%m-%d").date())
        except ValueError:
            invalid.append(date_str)

    return valid, invalid

def format_time(time_str: str) -> str:
    try:
        dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
        return dt.strftime("%d.%m.%Y в %H:%M")
    except Exception as e:
        return time_str

def parse_times(raw_input: str) -> tuple[list, list]:
    raw_times = raw_input.replace('\n', ' ').split()
    valid = []
    invalid = []

    for time_str in raw_times:
        try:
            valid.append(datetime.strptime(time_str, "%H:%M").time())
        except ValueError:
            invalid.append(time_str)

    return valid, invalid

import jwt
from typing import Optional

class JWTDecoder:
    def __init__(self, secret: Optional[str] = None, algorithms: Optional[list] = None):
        self.secret = secret
        self.algorithms = algorithms or ["HS256"]

    def set_secret(self, secret: str):
        self.secret = secret

    def decode(self, token: str) -> dict:
        if self.secret is None:
            raise RuntimeError("JWT secret is not set")
        try:
            payload = jwt.decode(token, self.secret, algorithms=self.algorithms)
            return payload
        except jwt.PyJWTError as e:
            raise RuntimeError(f"JWT decode error: {e}")

    def get_user_id(self, token: str, user_id_field: str = "id") -> int:
        payload = self.decode(token)
        user_id = payload.get(user_id_field) or payload.get("sub")
        if user_id is None:
            raise RuntimeError(f"user_id not found in token payload")
        return int(user_id)
