import sqlite3
from typing import Optional

DB_PATH = "auth.db"

class TokenStore:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._ensure_table()

    def _ensure_table(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_tokens (
                user_id INTEGER PRIMARY KEY,
                token TEXT,
                telegram_id INTEGER
            )
        """)
        conn.commit()
        conn.close()

    def save_user_token(self, user_id: int, token: str, telegram_id: int):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO user_tokens (user_id, token, telegram_id)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                token=excluded.token,
                telegram_id=excluded.telegram_id
        """, (user_id, token, telegram_id))
        conn.commit()
        conn.close()

    def get_user_token(self, telegram_id: int) -> Optional[str]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT token FROM user_tokens WHERE telegram_id = ?", (telegram_id,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

    def get_telegram_id(self, user_id: int) -> Optional[int]:
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        cur.execute("SELECT telegram_id FROM user_tokens WHERE user_id = ?", (user_id,))
        row = cur.fetchone()
        conn.close()
        return row[0] if row else None

store = TokenStore(DB_PATH)
