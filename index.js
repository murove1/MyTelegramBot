import TelegramBot from 'node-telegram-bot-api';
import config from 'config';
import fetch from 'node-fetch';
import birthday from './birthday.json'; // Birthday your friends or others

const TELEGRAM_TOKEN = config.get('telegramToken');
const WEATHER_API_KEY = config.get('weatherApiKey');
const CITY = config.get('city');
const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';
const WEATHER_QUERY = '&units=metric&lang=en&appid=';
const PRIVATBANK_COURS =
  'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/flip/, msg => {
  const chatId = msg.chat.id;
  const result = Math.random() >= 0.5 ? 'Eagle' : 'Tails';

  bot.sendMessage(chatId, result);
});

bot.onText(/\/birthday/, msg => {
  const chatId = msg.chat.id;

  const birthdayList = birthday.map(
    person => `${person.name} - ${person.date}`
  );
  bot.sendMessage(chatId, ['📆 Birthday:', ...birthdayList].join('\n'));
});

bot.onText(/\/course/, msg => {
  const chatId = msg.chat.id;

  fetch(PRIVATBANK_COURS)
    .then(res => res.json())
    .then(data => {
      const courses = data.map(
        currency =>
          `${currency.ccy}: ${parseFloat(currency.buy).toFixed(2)}/${parseFloat(
            currency.sale
          ).toFixed(2)}`
      );
      bot.sendMessage(chatId, ['💰 Exchange course:', ...courses].join('\n'));
    });
});

bot.onText(/\/weather/, msg => {
  const chatId = msg.chat.id;

  fetch(`${WEATHER_URL}?q=${CITY}&${WEATHER_QUERY}${WEATHER_API_KEY}`)
    .then(res => res.json())
    .then(data =>
      bot.sendMessage(
        chatId,
        `Weather in ${data.name}: ${Math.round(data.main.temp)}*C, ${
          data.weather[0].description
        }.`
      )
    );
});

bot.on('location', msg => {
  const chatId = msg.chat.id;
  const latitude = msg.location.latitude;
  const longitude = msg.location.longitude;

  fetch(
    `${WEATHER_URL}?lat=${latitude}&lon=${longitude}${WEATHER_QUERY}${WEATHER_API_KEY}`
  )
    .then(res => res.json())
    .then(data =>
      bot.sendMessage(
        chatId,
        `Weather in ${data.name}: ${Math.round(data.main.temp)}*C, ${
          data.weather[0].description
        }.`
      )
    );
});
