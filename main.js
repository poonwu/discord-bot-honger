const _ = require('lodash');
const Discord = require('discord.js');
const AsyncPolling = require('async-polling');
const cheerio = require('cheerio');
const axios = require('axios');
const http = require('http');
const math = require('mathjs');
const moment = require('moment');
const command = require('./command.js');
const pollingList = require('./polling.js');
const pkg = require('./package.json');
const config = require('./config.json');


class Bot {
    constructor() {
        this.store = {};
        this.client = new Discord.Client();
        this.polling = AsyncPolling(end => {
           axios.all(_.map(pollingList, o => this.getPollingHandler(o)))
            .then((res) => {
                res.forEach(e => {
                    if(_.isObject(e)) {
                        this.broadcast('Ohhh!!!\nNew Chapter from ' + e.name.toUpperCase() + '!!!\n' + this.store[e.name].url + '\nHehe...');
                    }
                });
                end();
            })
            .catch((e) => {
                console.error(e);
                end();
            });
        }, 5000);

        // on ready
        this.client.on('ready', () => {
            console.log('Bot is ready');
            console.log(`https://discordapp.com/api/oauth2/authorize?client_id=${config.client_id}&scope=bot&permissions=${config.permissions}`);
    
            this.startTime = moment();
            this.polling.run();
            this.broadcast('Hong\'er v' + pkg.version + ' is ready!!\nOhhh!!!');
        });
        
        // msg listener
        this.client.on('message', message => {
            // only this channel
            if(message.channel.name !== 'talk-to-honger') {
                return;
            }

            // only if Hong'er is mentioned
            if(!message.mentions.everyone && message.mentions.users.find('id', this.client.user.id)) {
                message.channel.send(':sleeping:');
            }
        
            // command start with !
            if(message.content.startsWith('!')) {
                let token = message.content.split(' '); //match(/(?:[^\s"]+|"[^"]*")+/g) 
                let cmd = token[0].substr(1).toLowerCase();
                let args = token.slice(1);                
                let result = _.pickBy(command, (v, k) => _.startsWith(k, cmd));
                let resultKeys = _.keys(result);
                let done = null;

                if(cmd.length === 0) {
                }
                else if(resultKeys.length === 1) {
                    done = result[resultKeys[0]].action(this, message, ...args);
                } else if(resultKeys.length > 1) {
                    let exact = _.find(resultKeys, (k) => parseInt(k.split('_')[1]) === args.length);
                    
                    // exactly arg len
                    if(exact) {
                        done = result[exact].action(this, message, ...args);
                    } else {
                        // more than arg len
                        let more = _.reduce(resultKeys, (candidate, k) => {
                            let n = parseInt(k.split('_')[1]);
                            let c = parseInt(candidate.split('_')[1]);
                            if(c < n) {
                                return k;
                            }
                            return candidate;
                        }, resultKeys[0]);
                        
                        done = result[more].action(this, message, ...args);
                    }
                }

                // error handling
                if(done === false) {
                    message.channel.send('Error: wrong conditions or arguments');
                }
                if(done === null) {
                    //message.channel.send('Error: cannot find command');
                }
            }
        });
    }

    getPollingHandler(pollingObject) {
        return axios.get(pollingObject.url)
            .then((res) => {
                return pollingObject.check(this, cheerio.load(res.data)) ? pollingObject : null;
            })
            .catch(() => {
                return null;
            });
    }
    broadcast(content) {
        this.client.guilds.array().forEach(g => {
            let channel = g.channels.find('name', 'talk-to-honger');
            if(channel) {
                channel.send(content);
            }
        });
    }
    connect() {
        // dummy http server
        http.createServer(function(req,res) {
            res.writeHead(200);
            res.write('Launched!');
            res.end();
        }).listen(process.env.PORT || 3000);

        // connect to discord
        this.client.login(config.token);
    }
}

new Bot().connect();