from aiogram import Router, F
from aiogram.types import Message
from api.api_client import StrawberryAPIClient
from db.db import store  
from keyboards.main_menu import main_menu
from datetime import date

def create_schedule_router(api_client: StrawberryAPIClient) -> Router:
    router = Router()

    @router.message(F.text == "Показать расписание")
    async def cmd_show_schedule(message: Message):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)
        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        schedule = await api_client.get_today_schedule(token)
        if schedule is None:
            await message.answer("❌ Не удалось получить расписание на сегодня. Попробуйте позже.", reply_markup=main_menu)
            return

        today_str = date.today().isoformat()

        appointments = schedule.get("appointments") or []
        slots = schedule.get("slots") or []
        days_off = schedule.get("days_off") or []

        if today_str in days_off:
            status = "📛 Сегодня выходной — приёма нет."
        elif not slots:
            status = "⚠️ Слоты приёма не указаны — приёмы не запланированы."
        else:
            status = f"📆 Сегодня запланировано слотов приёма: {len(slots)}\n" \
                     f"📝 Записей на сегодня: {len(appointments)}"

        slots_text = "\n".join(slots) if slots else "—"
        appointments_text = "\n".join(appointments) if appointments else "—"

        await message.answer(
            f"📅 Ваше расписание на сегодня:\n\n"
            f"🕒 Доступные слоты:\n{slots_text}\n\n"
            f"📋 Записи на сегодня:\n{appointments_text}\n\n"
            f"{status}",
            reply_markup=main_menu
        )

    return router
