import asyncio
import json
import logging
from aiogram import Bot
from aio_pika import connect_robust, ExchangeType, IncomingMessage
from db.db import store  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def send_telegram_message(bot: Bot, chat_id: int, text: str):
    try:
        await bot.send_message(chat_id=chat_id, text=text)
        logger.info(f"Message sent to {chat_id}")
    except Exception as e:
        logger.exception(f"Failed to send message to {chat_id}: {e}")

async def on_message(message: IncomingMessage, bot: Bot):
    async with message.process():
        try:
            payload = json.loads(message.body)
            user_id = payload.get("master_id") or payload.get("user_id")
            telegram_id = store.get_telegram_id(user_id)

            if telegram_id is None:
                logger.warning(f"Telegram ID not found for user_id={user_id}")
                return

            routing_key = message.routing_key

            if routing_key == "appointments.created":
                text = (f"Новая запись:\n"
                        f"ID: {payload.get('appointment_id')}\n"
                        f"Время: {payload.get('time')}")
            elif routing_key == "appointments.deleted":
                text = (f"Запись отменена:\n"
                        f"ID: {payload.get('appointment_id')}\n"
                        f"Время: {payload.get('time')}")
            else:
                text = payload.get("text", "Новое уведомление о записи")

            logger.info(f"Sending message to telegram_id={telegram_id}: {text}")
            await send_telegram_message(bot, telegram_id, text)

        except Exception:
            logger.exception("Ошибка при обработке сообщения")

async def run_consumer(url: str, ex_name: str, routing_keys: list[str], bot: Bot):
    logger.info("Connecting to RabbitMQ")
    connection = await connect_robust(url)
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=10)

    exchange = await channel.declare_exchange(ex_name, ExchangeType.TOPIC, durable=True)
    queue = await channel.declare_queue("appointment_notifications", durable=True)

    for rk in routing_keys:
        await queue.bind(exchange, rk)

    logger.info("Start consuming messages")
    await queue.consume(lambda msg: on_message(msg, bot))

def run_bot_consumer(bot: Bot, url: str, ex_name: str, routing_keys: list[str]):
    asyncio.create_task(run_consumer(url, ex_name, routing_keys, bot))
