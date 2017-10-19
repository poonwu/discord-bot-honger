const _ = require('lodash');
const Discord = require('discord.js');
const AsyncPolling = require('async-polling');
const cheerio = require('cheerio');
const axios = require('./hyper.js');
const ax = require('axios');
const http = require('http');
const math = require('mathjs');
const moment = require('moment-timezone');
const command = require('./command.js');
const pollingList = require('./polling.js');
const pkg = require('./package.json');
const config = require('./config.json');

require('v8-profiler');

moment.tz.setDefault('Asia/Shanghai');

class Bot {
    constructor() {
        this.client = new Discord.Client();
        this.pollingList = pollingList;

        let f = function() {
            //ax.get("https://discord-bot-honger.herokuapp.com/");
            console.log('pingging heroku');
        };
        setInterval(f, 300000); // every 5 minutes (300000)
        f();

        // create pollings
        _.forOwn(this.pollingList, (o, k) => {
            let delay = _.isNumber(o.delay) ? o.delay : _.isFunction(o.delay) ? o.delay() : null;
            let promise = null;
            o.asyncPolling = AsyncPolling(end => {
                // save current time
                this.lastPollingTime = moment();
                promise = axios.get(o.url, o.axiosOptions)
                    .then(res => {
                        // return null if you don't want it to reports.
                        let newData = o.parseData(this, res.data);
                        if(!o.latestChapter) {
                            // first time
                            o.latestChapter = newData;
                            o.onLoadChapter(this);
                            return null;
                        } else {
                            if(o.latestChapter.url !== newData.url) {
                                o.latestChapter = newData;
                                return o;
                            }
                            return null;
                        }
                    }, e => {
                        //timeout constantly...
                        
                        console.error(e);
                        end();
                    }).then(o => {
                        if(_.isObject(o)) {
                            let str = o.onNewChapter(this);
                            this.broadcast(str, 'notices');
                        }
                    end();
                }, e => {
                    end();
                })
                .catch(e => {
                    end();
                });
                
           },  60000);
        });

        // this.changeDelayInterval = AsyncPolling(end => {
        //     _.forOwn(this.pollingList, o => {
        //         if(_.isFunction(o.delay)) {
        //             let newDelay = o.delay();
        //             if(newDelay !== o.asyncPolling._delay) {
        //                 o.asyncPolling._delay = newDelay;
        //             }
        //         }
        //     });
        //     end();
        // }, 60000 * 10);

        // on ready
        this.client.on('ready', () => {
            console.log('Bot is ready');
            console.log(`https://discordapp.com/api/oauth2/authorize?client_id=${config.client_id}&scope=bot&permissions=${config.permissions}`);
    
            this.startTime = moment();
            this.lastPollingTime = moment();
            //this.changeDelayInterval.run();
            this.runPoll();
            //this.broadcast('Hong\'er v' + pkg.version + ' is ready!!\nOhhh!!!');
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
    broadcast(content, name) {
        this.client.guilds.array().forEach(g => {
            let channel = g.channels.find('name', name || 'talk-to-honger');
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
    runPoll(name) {
        if(name) {
            this.pollingList[name].asyncPolling.run()
        }
        else {
            _.forOwn(this.pollingList, e => e.asyncPolling ? e.asyncPolling.run() : null);
        }
    }
    stopPoll(name) {
        if(name) {
            this.pollingList[name].asyncPolling.stop();
        }
        else {
            _.forOwn(this.pollingList, e => e.asyncPolling ? e.asyncPolling.stop() : null);
        }
    }
}

new Bot().connect();