import os
import asyncio
from handlers.start import create_start_router
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher
from api.api_client import StrawberryAPIClient
from utils.utils import JWTDecoder
from utils.notifications import run_bot_consumer

load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080/api")

async def main():
    from handlers.days_off import create_days_off_router
    from handlers.schedule import create_schedule_router
    from handlers.work_hours import create_work_hours_router

    api_client = StrawberryAPIClient(API_BASE_URL)
    await api_client.start()
    jwt_decoder = JWTDecoder()
    jwt_decoder.set_secret(os.getenv("JWT_SECRET"))

    token = os.getenv("BOT_TOKEN")
    if not token:
        raise RuntimeError("BOT_TOKEN environment variable is not set")

    bot = Bot(token=token)
    dp = Dispatcher()
    
    run_bot_consumer(bot, os.getenv("RABBITMQ_URL"), os.getenv("EXCHANGE_NAME"), 
                    routing_keys=["appointments.created", "appointments.deleted"])
    
    run_bot_consumer(bot, os.getenv("RABBITMQ_URL"), os.getenv("EXCHANGE_NAME_2"),
                    routing_keys=["reviews.created"])

    days_off_router = create_days_off_router(api_client)
    schedule_router = create_schedule_router(api_client, jwt_decoder)
    work_hours_router = create_work_hours_router(api_client)
    start_router = create_start_router(api_client, jwt_decoder)

    dp.include_router(days_off_router)
    dp.include_router(schedule_router)
    dp.include_router(work_hours_router)
    dp.include_router(start_router)

    try:
        await dp.start_polling(bot)
    finally:
        await api_client.close()
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
