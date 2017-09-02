const poll = require('./polling.js');
const Discord = require('discord.js');
const math = require('mathjs');
const moment = require('moment-timezone');
const _ = require('lodash');

moment.tz.setDefault('Asia/Shanghai');

var checkOptions = _.keys(poll);
var commands = {
  'reset': {
    description: 'Reset current chapter data, in case data are missing.',
    action: function(bot, msg) {
      bot.stopPoll();
      _.forOwn(bot.pollingList, v => {
        v.latestChapter = undefined;
      });
      bot.runPoll();
      msg.channel.send('reset completed');
    }
  },
  'status_0' : {
    description: 'Check bot status',
    action: function(bot, msg) {
      let content = '';
      let duration = moment.duration(moment().diff(bot.startTime));
      let pollDuration = moment.duration(moment().diff(bot.lastPollingTime));
      content += `Last Poll: **${Math.round(pollDuration.asSeconds())}** seconds ago\n`;
      content += `Running time: **${duration.hours()}**h **${duration.minutes()}**m **${duration.seconds()}**s\n`;
      _.forOwn(bot.pollingList, (v,k) => {
        content += k.toUpperCase() + ': **' + (v.asyncPolling._mustSchedule ? (v.asyncPolling._delay/1000 + '**s') : 'OFF**') + '\n';
      });
      msg.channel.send(content);
      return true;
    }
  },
  'check': {
    description: 'Check latest content from site',
    args: [checkOptions.join('|')],
    render: function(bot, obj) {
      return obj.title + '\n' + obj.url;
    },
    action: function(bot, msg, name) {
      let content = null;
      let o = null;
      
      // check all 
      if(_.has(poll, name)) {
        // normal render
        content = this.render(bot, bot.pollingList[name]);
      }
      else if((o = _.findIndex(checkOptions, e => e.startsWith(name)) ) >= 0) {
        // aliasing
        content = this.render(bot, bot.pollingList[checkOptions[o]]);
      }  
      else {
        // render everything
        let embed = new Discord.RichEmbed()
          .setTitle('Current Chapters')
          .setColor(0xc70000);
        checkOptions.forEach(name => {
          embed.addField(name.toUpperCase() + ' ' + (bot.pollingList[name].latestChapter || {}).title, (bot.pollingList[name].latestChapter || {}).url);
        });
        
        // render rich text
        content = {embed};
      }

      // no data?
      if(!content) {
        content = 'Error: cannot find data';
      }
      msg.channel.send(content);
      return true;
    }
  },
  'help': {
    description: 'List of all commands',
    action: function(bot, msg) {
      let cmdKeys = _.keys(commands).sort();
      let len = 0;
      let contents = _.map(cmdKeys, k => {
        let c = `**!${k.split('_')[0]}** ` + (commands[k].args ? _.map(commands[k].args, e => `<${e}>`).join(' ') : '');
        if(c.length > len) {
          len = c.length;
        }

        return c;
      });
      
      // formatting spaces
      let content = _.map(contents, (c, i) => {
        for(let i=0; i < len - c.length; i++) {
          c += '\t';
        }
        c += `\t\t\t${commands[cmdKeys[i]].description}`;
        return c;
      }).join('\n');
      msg.channel.send(content);
      return true;
    }
  },
  'test': {
    action: function(bot, msg, name) {
      bot.pollingList[name].latestChapter.url = 'something else';
    }
  }
};

module.exports = commands;