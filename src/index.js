const Discord = require('discord.js');
const Bot = require('./bot');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Bot online');
});

new Bot(client);

client.login(process.env.TOKEN);
