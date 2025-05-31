import aiohttp
from typing import Optional, Dict, Any, List

class StrawberryAPIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.token: Optional[str] = None

    def _headers(self, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        if extra_headers:
            headers.update(extra_headers)
        return headers

    async def login(self, username: str, password: str) -> str:
        url = f"{self.base_url}/login"
        payload = {"username": username, "password": password}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self._headers()) as resp:
                resp.raise_for_status()
                data = await resp.json()
                self.token = data['token']
                return self.token

    async def register(self, full_name: str, username: str, password: str, specialization: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.base_url}/register"
        payload = {
            "full_name": full_name,
            "username": username,
            "password": password,
        }
        if specialization:
            payload["specialization"] = specialization
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self._headers()) as resp:
                resp.raise_for_status()
                return await resp.json()

    async def get_masters(self, specialization: Optional[str] = None, min_rating: Optional[float] = None) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/masters"
        params = {}
        if specialization:
            params['specialization'] = specialization
        if min_rating is not None:
            params['min_rating'] = min_rating
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self._headers(), params=params) as resp:
                resp.raise_for_status()
                return await resp.json()

    async def get_master_by_username(self, username: str) -> Dict[str, Any]:
        url = f"{self.base_url}/masters/{username}"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self._headers()) as resp:
                resp.raise_for_status()
                return await resp.json()

    async def create_appointment(self, master_id: int, time: str) -> Dict[str, Any]:
        url = f"{self.base_url}/appointments"
        payload = {
            "master_id": master_id,
            "time": time
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self._headers()) as resp:
                resp.raise_for_status()
                return await resp.json()

    async def delete_appointment(self, appointment_id: int) -> bool:
        url = f"{self.base_url}/appointments/{appointment_id}"
        async with aiohttp.ClientSession() as session:
            async with session.delete(url, headers=self._headers()) as resp:
                resp.raise_for_status()
                return resp.status == 204

    async def set_day_off(self, day_of_week: str, is_day_off: bool) -> bool:
        url = f"{self.base_url}/schedule/dayoff"
        payload = {
            "day_of_week": day_of_week,
            "is_day_off": is_day_off
        }
        async with aiohttp.ClientSession() as session:
            async with session.put(url, json=payload, headers=self._headers()) as resp:
                resp.raise_for_status()
                return resp.status == 200

    async def set_work_hours(self, start: str, end: str) -> bool:
        url = f"{self.base_url}/schedule/workhours"
        payload = {
            "start_time": start,
            "end_time": end
        }
        async with aiohttp.ClientSession() as session:
            async with session.patch(url, json=payload, headers=self._headers()) as resp:
                resp.raise_for_status()
                return resp.status == 200
