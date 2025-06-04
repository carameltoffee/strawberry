from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

main_menu = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text="Добавить выходной")],
        [KeyboardButton(text="Удалить выходной")],
        [KeyboardButton(text="Установить часы приёма на день недели")],
        [KeyboardButton(text="Установить часы приёма на дату")],
        [KeyboardButton(text="Удалить часы приёма на дату")],
        [KeyboardButton(text="Показать расписание")],
    ],
    resize_keyboard=True,
    input_field_placeholder="Выберите действие ⤵️"
)
