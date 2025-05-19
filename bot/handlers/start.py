from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from keyboards.main_menu import main_menu

start_router = Router()

@start_router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я пришлю уведомления о новых записях и помогу настроить запись не посещая сайт\n\n",
        reply_markup=main_menu
    )
