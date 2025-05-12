from .days_off import days_off_router
from .work_hours import work_hours_router
from .schedule import schedule_router
from .start import start_router

all_routers = [
    start_router,
    days_off_router,
    work_hours_router,
    schedule_router,
]
