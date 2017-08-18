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
          bot.broadcast('Ohhhh!!!\nMaster @here, new chapter is out!!\nChapter is uhh... oh...\n' + title  + '\nHehe')
        }
      } else {
        bot.store.raw = {
          title: title,
          url: url
        };
      }
    }
  },
  'lnmtl': {
    url: 'https://lnmtl.com/novel/against-the-gods',
    check: function(bot, $) {
      $('a.chapter-link').each(function() {
        let url = $(this).attr('href');
        let title = $(this).text().trim();
        
      });

    },
    render: function(bot) {
      
    }
  },
  
};