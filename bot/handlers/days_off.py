from aiogram import Router, F
from aiogram.fsm.context import FSMContext
from aiogram.types import Message
from api.api_client import StrawberryAPIClient
from states.states import States
from logic.logic import parse_dates
from db.db import store

def create_days_off_router(api_client: StrawberryAPIClient) -> Router:
    router = Router()

    @router.message(F.text == "Добавить выходной")
    async def cmd_add_day_off(message: Message, state: FSMContext):
        await message.answer("📆 Введите дни выходных (ГГГГ-ММ-ДД через пробел или с новой строки):")
        await state.set_state(States.choose_weekend_days)

    @router.message(States.choose_weekend_days)
    async def process_add_day_off(message: Message, state: FSMContext):
        user_id = message.from_user.id
        token = store.get_user_token(user_id)
        if not token:
            await message.answer("❌ Вы не авторизованы. Введите /login.")
            return

        valid, invalid = parse_dates(message.text)
        if invalid:
            await message.answer(f"⚠️ Неверный формат: {', '.join(invalid)}")
            return

        success_dates = []
        for date in valid:
            ok = await api_client.set_day_off(date.strftime("%A"), True, token)
            if ok:
                success_dates.append(str(date))

        if success_dates:
            await message.answer("✅ Добавлены выходные:\n" + "\n".join(success_dates))
        else:
            await message.answer("❌ Не удалось обновить выходные.")

        await state.clear()

    return router
