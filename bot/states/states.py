from aiogram.fsm.state import StatesGroup, State

class States(StatesGroup):
    choose_weekend_days = State()
    remove_weekend_days = State()
    set_work_hours = State()
