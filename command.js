const poll = require('./polling.js');
const Discord = require('discord.js');
const math = require('mathjs');
const moment = require('moment');
const _ = require('lodash');

var checkOptions = _.keys(poll);
var commands = {
  'timeout_1': {
    description: 'Set new polling timeout in second (min=5)',
    args: ['NEW_TIMEOUT'],
    action: function(bot, msg, time) {
      try {
        let delay = parseInt(time) * 1000;
        
        if(delay < 5000) {
           delay = 5000;
        }
        bot.polling.stop();
        bot.polling._delay = delay;
        bot.polling.run();
        
        msg.channel.send('timeout=' + (delay/1000) + 's');
        return true;
      }
      catch(e) {
        console.log(e);
        return false;
      }
    }
  },
  'poll_1': {
    description: 'Set polling operation',
    args: ['ON|OFF'],
    action: function(bot, msg, op) {
      op = op.toLowerCase();

      if(op === 'off') {
        bot.polling.stop();
      } else if(op === 'on') {
        bot.polling.stop();
        bot.polling.run();
      }

      msg.channel.send('polling=' + (bot.polling._mustSchedule ? 'ON' : 'OFF'));
      return true;
    }
  },
  'status_0' : {
    description: 'Check bot status',
    action: function(bot, msg) {
      let content = '';
      let duration = moment.duration(moment().diff(bot.startTime));
      content += `Polling: **${bot.polling._mustSchedule ? 'ON' : 'OFF'}**\n`;
      content += `Timeout: **${bot.polling._delay / 1000}** seconds\n`;
      content += `Running time: **${duration.hours()}**h **${duration.minutes()}**m **${duration.seconds()}**s\n`;
      msg.channel.send(content);
      return true;
    }
  },
  'check': {
    description: 'Check latest content from site',
    args: [checkOptions.join('|')],
    action: function(bot, msg, name) {
      let content = null;
      let o = null;
      
      // check all 
      if(_.has(poll, name)) {
        // normal render
        content = poll[name].render(bot);
      }
      else if(o = _.find(poll, e => _.indexOf(e.alias, name) >= 0 )) {
        // aliasing
        content = o.render(bot);
      }  
      else {
        let embed = new Discord.RichEmbed()
          .setTitle('Current Chapters')
          .setColor(0xc70000);
        checkOptions.forEach(name => {
          poll[name].render(bot, embed);
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
  }
};

module.exports = commands;