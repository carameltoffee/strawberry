from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message
from keyboards.main_menu import main_menu

start_router = Router()

@start_router.message(Command("start"))
async def cmd_start(message: Message):
    await message.answer(
        "👋 Привет! Я помогу тебе управлять расписанием.\n\n"
        "🟢 /add_day_off — Добавить выходные дни\n"
        "🔴 /remove_day_off — Удалить выходные\n"
        "🕒 /set_work_hours — Установить часы приёма\n"
        "📅 /show_schedule — Показать текущее расписание",
        reply_markup=main_menu
    )
