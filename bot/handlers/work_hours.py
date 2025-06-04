from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from api.api_client import StrawberryAPIClient
from states.states import States
from utils.utils import parse_times, parse_date
from db.db import store

def create_work_hours_router(api_client: StrawberryAPIClient) -> Router:
    router = Router()

    @router.message(F.text == "Установить часы приёма на день недели")
    async def cmd_set_work_hours(message: Message, state: FSMContext):
        await message.answer("📆 Введите день недели и часы приёма (например: Понедельник 10:00 14:30 16:00):")
        await state.set_state(States.set_work_hours)

    @router.message(States.set_work_hours)
    async def process_set_work_hours(message: Message, state: FSMContext):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)

        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        parts = message.text.strip().split()
        if len(parts) < 2:
            await message.answer("⚠️ Укажите день недели и хотя бы одно время.")
            return

        weekday_rus = parts[0].lower()
        weekdays_map = {
            "понедельник": "monday", "вторник": "tuesday", "среда": "wednesday",
            "четверг": "thursday", "пятница": "friday", "суббота": "saturday", "воскресенье": "sunday"
        }
        weekday_eng = weekdays_map.get(weekday_rus)
        if not weekday_eng:
            await message.answer(f"⚠️ Неизвестный день недели: {weekday_rus}")
            return

        times = parts[1:]
        valid, invalid = parse_times(" ".join(times))
        if invalid:
            await message.answer(f"⚠️ Неверный формат времени: {', '.join(invalid)}")
            return

        if not valid:
            await message.answer("⚠️ Укажите хотя бы одно корректное время.")
            return

        slots = sorted(t.strftime("%H:%M") for t in valid)

        ok = await api_client.set_working_slots_by_weekday(weekday_eng, slots, token)
        await message.answer(
            f"✅ Часы приёма на {weekday_rus} установлены:\n" + "\n".join(slots)
            if ok else "❌ Не удалось установить часы приёма."
        )
        await state.clear()

    @router.message(F.text == "Установить часы приёма на дату")
    async def cmd_set_work_hours_by_date(message: Message, state: FSMContext):
        await message.answer("📅 Введите дату и часы приёма (например: 2024-12-25 10:00 14:30 16:00):")
        await state.set_state(States.set_work_hours_by_date)

    @router.message(States.set_work_hours_by_date)
    async def process_set_work_hours_by_date(message: Message, state: FSMContext):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)

        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        parts = message.text.strip().split()
        if len(parts) < 2:
            await message.answer("⚠️ Укажите дату и хотя бы одно время.")
            return

        date_str = parts[0]
        try:
            parse_date(date_str)  
        except ValueError:
            await message.answer("⚠️ Некорректная дата. Используйте формат YYYY-MM-DD.")
            return

        times = parts[1:]
        valid, invalid = parse_times(" ".join(times))
        if invalid:
            await message.answer(f"⚠️ Неверный формат времени: {', '.join(invalid)}")
            return

        slots = sorted(t.strftime("%H:%M") for t in valid)
        ok = await api_client.set_working_slots_by_date(date=date_str, slots=slots, token=token)

        await message.answer(
            f"✅ Часы приёма на {date_str} установлены:\n" + "\n".join(slots)
            if ok else "❌ Не удалось установить часы приёма."
        )
        await state.clear()

    @router.message(F.text == "Удалить часы приёма на дату")
    async def cmd_delete_work_hours_by_date(message: Message, state: FSMContext):
        await message.answer("🗑 Введите дату, для которой нужно удалить часы приёма (например: 2024-12-25):")
        await state.set_state(States.delete_work_hours_by_date)

    @router.message(States.delete_work_hours_by_date)
    async def process_delete_work_hours_by_date(message: Message, state: FSMContext):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)
    
    return router
