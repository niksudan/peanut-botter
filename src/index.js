const Discord = require('discord.js');
const Bot = require('./bot');
require('dotenv').config();

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Bot online');
});

client.on('message', (message) => {
  const user = message.author;
  const channel = message.channel;
  const mentions = message.mentions.users;
  const text = message.content;
  if (!user.bot) {
    if ((process.env.ENVIRONMENT !== 'development' && channel.name !== 'peanut-botter') ||
      (process.env.ENVIRONMENT === 'development' && channel.name === 'peanut-botter')) {
      if (mentions.array().length > 0 && mentions.find('username', 'peanut-botter')) {
        new Bot(message);
      }
    }
  }
});

client.login(process.env.TOKEN);
