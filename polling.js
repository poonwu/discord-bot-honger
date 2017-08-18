const _ = require('lodash');
module.exports = {
  'raw': {
    url: 'http://book.zongheng.com/book/408586.html',
    check: function(bot, $) {
      let title = $('a.chap').clone().children().remove().end().text().trim();
      let url = $('a.chap').attr('href');
      if(bot.store.raw) {
        if(bot.store.raw.url != url) {
          bot.store.raw.title = title;
          bot.store.raw.url = url;

          // broadcast to all
          bot.broadcast('Ohhhh!!!\nMaster @everyone, new chapter is out!!\nChapter is uhh... oh...\n' + title  + '\nHehe');
          return true;
        }
      } else {
        bot.store.raw = {
          title: title,
          url: url
        };
      }
      return false;
    },
    render: function(bot) {
      if(bot.store.raw) {
        return bot.store.raw.title + '\n' + bot.store.raw.url;
      }
      return null;
    }
  },
  'lnmtl': {
    url: 'https://lnmtl.com/novel/against-the-gods',
    check: function(bot, $) {
      let newArray = [];
      $('a.chapter-link').each(function() {
        let url = $(this).attr('href');
        let title = $(this).text().trim();
        let date = $(this).parent().next().find('span.label-default').text();
        newArray.push({url, title, date});
      });

      if(bot.store.lnmtl) {
        let newOnes = _.differenceBy(newArray, bot.store.lnmtl, 'url');
        
        if(newOnes.length > 0) {
          bot.store.lnmtl = newArray;
          
          let r = newOnes.map(e => e.url).join('\n');
          bot.broadcast('Ohhh!!! Also...new lnmtl chapter!!!\n' + r);

          return true;
        }
      } else {
        bot.store.lnmtl = newArray;
      }
      return false;
    },
    render: function(bot) {
      if(bot.store.lnmtl) {
        let top =  _.reverse(_.sortBy(bot.store.lnmtl, 'date'))[0];
        return top.title + '\n' + top.url;
      }
      return null;
    }
  },
  
};