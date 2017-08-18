const poll = require('./polling.js');
const math = require('mathjs');
const _ = require('lodash');

var checkOptions = _.keys(poll);
var commands = {
  'timeout_0': {
    description: 'Check current request timeout',
    action: function(bot, msg) {
      msg.channel.send('timeout=' + bot.settings.delay + 'ms');
      return true;
    }
  },
  'timeout_1': {
    description: 'Set new request timeout in ms (min=5000)',
    args: ['new_timeout'],
    action: function(bot, msg, time) {
      try {
        bot.settings.delay = parseInt(time);

        if(bot.settings.delay < 5000) {
          bot.settings.delay = 5000;
        }
        bot.polling.stop();
        bot.polling._delay = bot.settings.delay;
        bot.polling.run();
        
        msg.channel.send('timeout=' + bot.settings.delay + 'ms');
        return true;
      }
      catch(e) {
        return false;
      }
    }
  },
  'check': {
    description: 'Check latest content from site',
    args: [checkOptions.join('|')],
    action: function(bot, msg, name) {
      if(!_.has(poll, name)) {
        name = checkOptions[0];
      }
      let content = poll[name].render(bot);
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
  'calc': {
    description: "Let Hong'er do some math?",
    action: function(bot, msg, ...args) {
      let ans = null;
      try {
        ans = math.eval(args.join(' '));
      }
      catch(e) {
        
      }

      if(ans === null) {
        msg.channel.send("Ahh... Umm... Ehh...!??");
      } else {
        msg.channel.send('The answer is... __**' + math.eval(args.join(' ')) + '**__ !!!!');
      }
      return true;
    }
  }
};

module.exports = commands;