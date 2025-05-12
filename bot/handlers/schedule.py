from aiogram import Router, F
from aiogram.types import Message
from datetime import date
from utils.data_store import user_schedules, user_work_hours
from keyboards.main_menu import main_menu

schedule_router = Router()

@schedule_router.message(F.text == "Показать расписание")
async def cmd_show_schedule(message: Message):
    user_id = message.from_user.id
    today = date.today()

    weekends = user_schedules.get(user_id, [])
    work_hours = user_work_hours.get(user_id, [])

    upcoming = sorted(d for d in weekends if d >= today)
    weekend_text = "\n".join(map(str, upcoming)) if upcoming else "— нет будущих выходных"
    hours_text = "\n".join(t.strftime("%H:%M") for t in work_hours) if work_hours else "— не указаны"

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
