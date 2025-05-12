from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from states.states import States
from logic.logic import parse_times, set_work_hours

work_hours_router = Router()

@work_hours_router.message(F.text == "Установить часы приёма")
async def cmd_set_work_hours(message: Message, state: FSMContext):
    await message.answer("Введите часы приёма (например: 10:00 14:30):")
    await state.set_state(States.set_work_hours)

@work_hours_router.message(States.set_work_hours)
async def process_set_work_hours(message: Message, state: FSMContext):
    user_id = message.from_user.id
    valid, invalid = parse_times(message.text)

    if invalid:
        await message.answer(f"⚠️ Неверный формат времени: {', '.join(invalid)}")
        return

    updated = set_work_hours(user_id, valid)
    await message.answer("✅ Часы приёма:\n" + "\n".join(t.strftime("%H:%M") for t in updated))
    await state.clear()
