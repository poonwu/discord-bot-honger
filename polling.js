const _ = require('lodash');
const Discord = require('discord.js');
let pollings = {
  'raw': {
    name: 'raw',
    alias: ['r'],
    url: 'http://book.zongheng.com/book/408586.html',
    check: function(bot, $) {
      let title = $('a.chap').clone().children().remove().end().text().split('：')[1].trim();
      let url = $('a.chap').attr('href');
      if(bot.store[this.name]) {
        if(bot.store[this.name].url != url) {
          bot.store[this.name].title = title;
          bot.store[this.name].url =   url;
          return true;
        }
      } else {
        bot.store[this.name] = {
          title: title,
          url: url
        };
      }
      return false;
    },
    render: function(bot, richEmbed) {
      if(bot.store[this.name]) {
        let o = bot.store[this.name];

        if(richEmbed) {
          richEmbed.addField('Raw Chapter ' + o.title, o.url, true);
        }

        return o.title + '\n' + o.url;
      }
      return null;
    }
  },
  'lnmtl': {
    name: 'lnmtl',
    alias: ['m', 'mtl'],
    url: 'https://lnmtl.com/novel/against-the-gods',
    check: function(bot, $) {
      let newArray = [];

      // get list of all latest chapters on lnmtl page
      $('a.chapter-link').each(function() {
        let url = $(this).attr('href');
        let title = $(this).text().trim().replace('  ', ' ');
        let date = $(this).parent().next().find('span.label-default').text().trim();

        newArray.push({url, title, date});
      });

      // latest release
      let latest =  _.reverse(_.sortBy(newArray, 'date'))[0];

      
      if(bot.store[this.name]) {
        // is new release
        if(latest.url !== bot.store[this.name]) {
          bot.store[this.name] = latest;
          return true;
        }
      } else {
        bot.store[this.name] = latest;
      }
      return false;
    },
    render: function(bot, richEmbed) {
      if(bot.store.lnmtl) {
        let o = bot.store[this.name];

        if(richEmbed) {
          richEmbed.addField('LNMTL Chapter ' + o.title, o.url, true);
        }
        
        return o.title + '\n' + o.url;
      }
      return null;
    }
  }
};
module.exports = pollings;