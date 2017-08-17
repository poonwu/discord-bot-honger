const Discord = require('discord.js');
const AsyncPolling = require('async-polling');
const cheerio = require('cheerio');
const axios = require('axios');
const config = require('./config.json');
const http = require('http');

var $ = null;
var novelLink = config.novel_url;
var chapterLink = null;
var chapterTitle = null;
var delay = 5000;
var polling = AsyncPolling(function(end) {
    axios.get(novelLink).then((res) => {
        $ = cheerio.load(res.data);
        let newChapterTitle = $('a.chap').clone().children().remove().end().text().trim();
        let newChapterLink = $('a.chap').attr('href');

        if(newChapterLink != chapterLink) {
            chapterLink = newChapterLink;
            chapterTitle = newChapterTitle;

            broadcast('Ohhhh. master @here, new chapter is out!!\n Chapter name is uhh... oh...' + chapterTitle + '\n');
        }
        end();
    })
    .catch((err) => {
        console.error(err);
        end();
    });
}, delay);

function broadcast(content) {
    client.guilds.array().forEach(g => {
        let channel = g.channels.find('name', 'general');
        channel.send(content);
    });
}

client = new Discord.Client();
    
client.on('ready', () => {
    console.log('Bot is ready');
    console.log(`https://discordapp.com/api/oauth2/authorize?client_id=${config.client_id}&scope=bot&permissions=${config.permissions}`);

    // get initial chapter link
    axios.get(novelLink)
    .then((res) => {
        $ = cheerio.load(res.data);
        chapterTitle = $('a.chap').clone().children().remove().end().text().trim().split('：')[1];
        chapterLink = $('a.chap').attr('href');

        polling.run();
    })
    .catch((err) => {
        console.error(err);
    });
});

client.on('message', message => {
    // only if Hong'er is mentioned
    if(!message.mentions.everyone && message.mentions.users.find('id', client.user.id)) {
        message.channel.send('zzzZZZZ');
    }

    if(message.content === '!check') {
        message.channel.send(chapterTitle);
    }
});

http.createServer(function(req,res) {
    res.writeHead(200);
    res.write('Launched!');
    res.end();
}).listen(process.env.PORT || 3000);

client.login(config.token);