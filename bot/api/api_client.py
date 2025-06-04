import aiohttp
from typing import Optional, Dict, Any, List

class StrawberryAPIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.session: Optional[aiohttp.ClientSession] = None

    async def start(self):
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()

    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()

    def _headers(self, token: Optional[str] = None, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'
        if extra_headers:
            headers.update(extra_headers)
        return headers

    async def login(self, username: str, password: str) -> str:
        await self.start()
        url = f"{self.base_url}/login"
        payload = {"username": username, "password": password}
        async with self.session.post(url, json=payload, headers=self._headers()) as resp:
            resp.raise_for_status()
            data = await resp.json()
            return data['token']

    async def set_day_off_by_date(self, date: str, is_day_off: bool, token: str) -> bool:
        await self.start()
        url = f"{self.base_url}/schedule/dayoff"
        payload = {
            "date": date, 
            "is_day_off": is_day_off
        }
        async with self.session.put(url, json=payload, headers=self._headers(token)) as resp:
            resp.raise_for_status()
            return resp.status == 200

    async def set_working_slots_by_weekday(self, day_of_week: str, slots: List[str], token: str) -> bool:
        await self.start()
        url = f"{self.base_url}/schedule/hours/weekday"
        payload = {
            "day_of_week": day_of_week,
            "slots": slots
        }
        async with self.session.put(url, json=payload, headers=self._headers(token)) as resp:
            resp.raise_for_status()
            return resp.status == 200

    async def get_schedule(self, user_id: int, date: str, token: str) -> Optional[Dict[str, Any]]:
        await self.start()
        url = f"{self.base_url}/schedule/{user_id}"
        headers = self._headers(token)
        params = {"date": date}

        async with self.session.get(url, headers=headers, params=params) as resp:
            if resp.status == 200:
                return await resp.json()
    
    async def set_working_slots_by_date(self, date: str, slots: List[str], token: str) -> bool:
        await self.start()
        url = f"{self.base_url}/schedule/hours/date"
        payload = {
            "date": date,
            "slots": slots
        }
        async with self.session.put(url, json=payload, headers=self._headers(token)) as resp:
            if resp.status == 200:
                return True
            elif resp.status == 400:
                raise ValueError(f"Invalid input or bad date: {await resp.text()}")
            else:
                resp.raise_for_status()
                
    async def delete_working_slots_by_date(self, date: str, token: str) -> bool:
        await self.start()
        url = f"{self.base_url}/schedule/hours/date"
        params = {"date": date}
        async with self.session.delete(url, headers=self._headers(token), params=params) as resp:
            if resp.status == 204:
                return True
            elif resp.status == 400:
                raise ValueError(f"Invalid or missing date: {await resp.text()}")
            elif resp.status == 401:
                raise PermissionError(f"Unauthorized: {await resp.text()}")
            else:
                resp.raise_for_status()


