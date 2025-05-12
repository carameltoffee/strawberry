import logging
import os
import asyncio
from aiogram import Bot, Dispatcher
from dotenv import load_dotenv
from handlers import all_routers

async def main():
    logging.basicConfig(level=logging.INFO)
    load_dotenv()

    bot = Bot(token=os.getenv("BOT_TOKEN"))
    dp = Dispatcher()

    for router in all_routers:
        dp.include_router(router)

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
