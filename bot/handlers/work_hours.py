from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from bot.db.db import store 
from states.states import States
from logic.logic import parse_times
from api.api_client import StrawberryAPIClient 

work_hours_router = Router()
api = StrawberryAPIClient(base_url="http://localhost:8000/api") 

@work_hours_router.message(F.text == "Установить часы приёма")
async def cmd_set_work_hours(message: Message, state: FSMContext):
    await message.answer("Введите часы приёма (например: 10:00 14:30):")
    await state.set_state(States.set_work_hours)

@work_hours_router.message(States.set_work_hours)
async def process_set_work_hours(message: Message, state: FSMContext):
    user_id = message.from_user.id
    token = store.get_user_token(user_id)  

    if not token:
        await message.answer("❌ Вы не авторизованы. Введите /login.")
        return

    valid, invalid = parse_times(message.text)

    if invalid:
        await message.answer(f"⚠️ Неверный формат времени: {', '.join(invalid)}")
        return

    if len(valid) != 2:
        await message.answer("⚠️ Укажите два времени: начало и конец приёма.")
        return

    start_time, end_time = sorted(valid)

    ok = await api.set_work_hours(start_time.strftime("%H:%M"), end_time.strftime("%H:%M"), token)
    if ok:
        await message.answer(f"✅ Часы приёма установлены:\n{start_time.strftime('%H:%M')} — {end_time.strftime('%H:%M')}")
    else:
        await message.answer("❌ Не удалось установить часы приёма.")

    await state.clear()
