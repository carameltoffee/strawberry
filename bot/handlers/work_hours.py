from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from api.api_client import StrawberryAPIClient
from states.states import States
from logic.logic import parse_times
from db.db import store

def create_work_hours_router(api_client: StrawberryAPIClient) -> Router:
    router = Router()

    @router.message(F.text == "Установить часы приёма")
    async def cmd_set_work_hours(message: Message, state: FSMContext):
        await message.answer("Введите часы приёма (например: 10:00 14:30):")
        await state.set_state(States.set_work_hours)

    @router.message(States.set_work_hours)
    async def process_set_work_hours(message: Message, state: FSMContext):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)

        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        parts = message.text.strip().split()
        if len(parts) < 3:
            await message.answer("⚠️ Укажите день недели и два времени: начало и конец приёма. Пример:\nПонедельник 10:00 14:30")
            return

        weekday_rus = parts[0].lower()
        weekdays_map = {
            "понедельник": "monday",
            "вторник": "tuesday",
            "среда": "wednesday",
            "четверг": "thursday",
            "пятница": "friday",
            "суббота": "saturday",
            "воскресенье": "sunday"
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

        if len(valid) != 2:
            await message.answer("⚠️ Укажите два времени: начало и конец приёма.")
            return

        start_time, end_time = sorted(valid)
        ok = await api_client.set_work_hours(
            start=start_time.strftime("%H:%M"),
            end=end_time.strftime("%H:%M"),
            week=weekday_eng,
            token=token
        )

        if ok:
            await message.answer(f"✅ Часы приёма на {weekday_rus} установлены:\n{start_time.strftime('%H:%M')} — {end_time.strftime('%H:%M')}")
        else:
            await message.answer("❌ Не удалось установить часы приёма.")

        await state.clear()


    return router
