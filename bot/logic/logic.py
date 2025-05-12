from datetime import datetime

from utils.data_store import user_schedules, user_work_hours


def parse_dates(raw_input: str) -> tuple[list, list]:
    raw_dates = raw_input.replace('\n', ' ').split()
    valid = []
    invalid = []

    for date_str in raw_dates:
        try:
            valid.append(datetime.strptime(date_str, "%Y-%m-%d").date())
        except ValueError:
            invalid.append(date_str)

    return valid, invalid


def add_day_off(user_id: int, dates: list) -> list:
    user_schedules.setdefault(user_id, [])
    user_schedules[user_id] = sorted(set(user_schedules[user_id] + dates))
    return user_schedules[user_id]


def remove_day_off(user_id: int, dates: list) -> list:
    user_schedules.setdefault(user_id, [])
    user_schedules[user_id] = sorted(set(user_schedules[user_id]) - set(dates))
    return user_schedules[user_id]


def parse_times(raw_input: str) -> tuple[list, list]:
    raw_times = raw_input.replace('\n', ' ').split()
    valid = []
    invalid = []

    for time_str in raw_times:
        try:
            valid.append(datetime.strptime(time_str, "%H:%M").time())
        except ValueError:
            invalid.append(time_str)

    return valid, invalid


def set_work_hours(user_id: int, times: list) -> list:
    user_work_hours[user_id] = sorted(times)
    return user_work_hours[user_id]
