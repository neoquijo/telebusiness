import express from 'express';
import cors from 'cors';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { TData } from './tdata';

const app = express();
app.use(cors());

// Инициализация клиента
const client = new TelegramClient(
  new StringSession(TData), // Используйте вашу сессию
  19177732, // API ID
  'b100d80721045777438318e47409ecae', // API HASH
  { connectionRetries: 5 }
);

// Обработчик новых сообщений
async function handleNewMessage(event: NewMessage) {
  //@ts-ignore
  const message = event.message;
  console.log(event)
  const sender = await message.getSender();

  console.log("\n--- Новое сообщение ---");
  console.log(`Текст: ${message.text}`);
  console.log(`Чат ID: ${message.chatId}`);
  console.log(`Отправитель: ${sender?.className} (ID: ${sender?.id})`);
  console.log(`Дата: ${new Date(message.date * 1000).toLocaleString()}\n`);
}


// Запуск сервера и подключение клиента
app.listen(5000, async () => {
  console.log('Сервер запущен на порту 5000');

  try {
    await client.connect();
    console.log('Подключено к Telegram API');

    // Добавляем обработчик для всех входящих сообщений
    client.addEventHandler(handleNewMessage, new NewMessage({}));

  } catch (error) {
    console.error('Ошибка подключения:', error);
  }
});

// Эндпоинт для получения списка чатов
app.get('/chats', async (req, res) => {
  const dialogs = await client.getDialogs();
  const simplifiedDialogs = dialogs.map(dialog => ({
    id: dialog.id,
    title: dialog.title,
  }));
  res.json({ dialogs: simplifiedDialogs });
});