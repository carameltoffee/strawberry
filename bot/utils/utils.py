from datetime import datetime, time
from typing import Tuple, List


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