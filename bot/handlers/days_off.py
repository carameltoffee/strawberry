from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from states.states import States
from logic.logic import parse_dates, add_day_off, remove_day_off

days_off_router = Router()

@days_off_router.message(F.text == "Добавить выходной")
async def cmd_add_day_off(message: Message, state: FSMContext):
    await message.answer("Введите дни выходных (ГГГГ-ММ-ДД через пробел или с новой строки):")
    await state.set_state(States.choose_weekend_days)

@days_off_router.message(States.choose_weekend_days)
async def process_add_day_off(message: Message, state: FSMContext):
    user_id = message.from_user.id
    valid, invalid = parse_dates(message.text)

    if invalid:
        await message.answer(f"⚠️ Неверный формат: {', '.join(invalid)}")
        return

    updated = add_day_off(user_id, valid)
    await message.answer("✅ Добавлены выходные:\n" + "\n".join(map(str, updated)))
    await state.clear()

@days_off_router.message(F.text == "Удалить выходной")
async def cmd_remove_day_off(message: Message, state: FSMContext):
    await message.answer("Введите даты для удаления (ГГГГ-ММ-ДД):")
    await state.set_state(States.remove_weekend_days)

@days_off_router.message(States.remove_weekend_days)
async def process_remove_day_off(message: Message, state: FSMContext):
    user_id = message.from_user.id
    valid, invalid = parse_dates(message.text)

    if invalid:
        await message.answer(f"⚠️ Неверный формат: {', '.join(invalid)}")
        return

    updated = remove_day_off(user_id, valid)
    formatted = "\n".join(str(d) for d in updated) if updated else "Нет выходных"
    await message.answer(f"❌ Обновлённый список выходных:\n{formatted}")
    await state.clear()
