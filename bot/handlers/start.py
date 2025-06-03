from aiogram import Router, F
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from api.api_client import StrawberryAPIClient
from keyboards.main_menu import main_menu  
from db.db import store
from aiogram.fsm.state import State, StatesGroup
from utils.utils import JWTDecoder

class LoginStates(StatesGroup):
    waiting_for_username = State()
    waiting_for_password = State()

def create_start_router(api_client: StrawberryAPIClient, jwt_manager: JWTDecoder) -> Router:
    start_router = Router()

    @start_router.message(F.text.in_({"/start", "/login"}))
    async def login_start(message: Message, state: FSMContext):
        await state.set_state(LoginStates.waiting_for_username)
        await message.answer("Введите ваш логин:")

    @start_router.message(LoginStates.waiting_for_username)
    async def process_username(message: Message, state: FSMContext):
        await state.update_data(username=message.text)
        await state.set_state(LoginStates.waiting_for_password)
        await message.answer("Введите ваш пароль:")

    @start_router.message(LoginStates.waiting_for_password)
    async def process_password(message: Message, state: FSMContext):
        data = await state.get_data()
        username = data.get("username")
        password = message.text
        try:
            token = await api_client.login(username=username, password=password)  
            user_id = jwt_manager.get_user_id(token=token)
            store.save_user_token(user_id, token, message.from_user.id)
            await state.update_data(token=token)
            await state.clear()
            await message.answer("✅ Вы успешно авторизовались!", reply_markup=main_menu)
        except Exception as e:
            await message.answer(f"❌ Ошибка входа: {str(e)}")
            await state.clear()

    return start_router
