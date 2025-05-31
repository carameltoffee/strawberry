import sqlite3
from typing import Optional

DB_PATH = "auth.db"

class TokenStore:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def save_user_token(self, user_id: int, token: str):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO user_tokens (user_id, token)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET token=excluded.token
        """, (user_id, token))
        conn.commit()
        conn.close()

    def get_user_token(self, user_id: int) -> Optional[str]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT token FROM user_tokens WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

store = TokenStore("auth.db")