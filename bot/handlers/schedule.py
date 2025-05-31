from aiogram import Router, F
from aiogram.types import Message
from datetime import date
from api.api_client import StrawberryAPIClient
from db.db import store  
from keyboards.main_menu import main_menu

def create_schedule_router(api_client: StrawberryAPIClient) -> Router:
    router = Router()

    @router.message(F.text == "Показать расписание")
    async def cmd_show_schedule(message: Message):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)
        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        today = date.today()
        schedule = await api_client.get_schedule(token)
        if schedule is None:
            await message.answer("❌ Не удалось получить расписание. Попробуйте позже.", reply_markup=main_menu)
            return

        weekends = [date.fromisoformat(d) for d in schedule.get("weekends", [])]
        work_hours = schedule.get("work_hours", [])

        upcoming = sorted(d for d in weekends if d >= today)
        weekend_text = "\n".join(map(str, upcoming)) if upcoming else "— нет будущих выходных"
        hours_text = "\n".join(work_hours) if work_hours else "— не указаны"

        if today in weekends:
            status = "📛 Сегодня выходной — приёма нет."
        elif not work_hours:
            status = "⚠️ Часы приёма не указаны — приёмы не запланированы."
        else:
            status = f"📆 Сегодня запланировано приёмов: {len(work_hours)}"

        await message.answer(
            f"📅 Ваше текущее расписание:\n\n"
            f"🔻 Выходные:\n{weekend_text}\n\n"
            f"🕒 Время приёма:\n{hours_text}\n\n"
            f"{status}",
            reply_markup=main_menu
        )

    return router