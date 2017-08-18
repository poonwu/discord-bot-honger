const Discord = require('discord.js');
const AsyncPolling = require('async-polling');
const cheerio = require('cheerio');
const axios = require('axios');
const http = require('http');
const config = require('./config.json');
const command = require('./command.js');
const polling = require('./polling.js');

function broadcast(content) {
    client.guilds.array().forEach(g => {
        let channel = g.channels.find('name', 'general');
        channel.send(content);
    });
}

class Bot {
    constructor() {
        this.settings = {
            delay: 20000
        };
        this.store = {
        };
        this.client = new Discord.Client();
        this.poller = AsyncPolling(function(end) {
            
            
            axios.get(novelLink).then((res) => {
                $ = cheerio.load(res.data);
                let newChapterTitle = $('a.chap').clone().children().remove().end().text().trim();
                let newChapterLink = $('a.chap').attr('href');
        
                if(newChapterLink != chapterLink) {
                    chapterLink = newChapterLink;
                    chapterTitle = newChapterTitle;
        
                    broadcast('Ohhhh. master @here, new chapter is out!!\nChapter name is uhh... oh...\n' + chapterTitle + '\nHehe');
                }
                end();
            })
            .catch((err) => {
                end();
            });
        }, this.settings.delay);

        // ready
        this.client.on('ready', () => {
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
        
        // msg listener
        client.on('message', message => {
            // only if Hong'er is mentioned
            if(!message.mentions.everyone && message.mentions.users.find('id', client.user.id)) {
                message.channel.send(':sleeping:');
            }
        
            // command base !
            if(message.content.startsWith('!')) {
                let token = message.content.split(' ');
                let cmd = token[0].substr(1);
                let args = token.slice(1);
                
                if(command[cmd]) {
                    command[cmd].fn(client, store, msg, args);
                }
            }
        });
    }
    broadcast(content) {
        this.client.guilds.array().forEach(g => {
            let channel = g.channels.find('name', 'general');
            channel.send(content);
        });
    }
    connect() {
        // dummy http server
        http.createServer(function(req,res) {
            res.writeHead(200);
            res.write('Launched!');
            res.end();
        }).listen(process.env.PORT || 3000);

        // connect to 
        client.login(config.token);
    }
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

new Bot().connect();