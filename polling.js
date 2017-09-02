const _ = require('lodash');
const Discord = require('discord.js');
const moment = require('moment-timezone');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

moment.tz.setDefault('Asia/Shanghai');

// get span object for checking between hour-time
function span(now) {
  today = moment(now).startOf('day');
  tmrow = moment(today).add(1, 'd');

  return function(from, to) {
    let f = moment(today);
    let t = moment(today);
    if(from > to) {
      t = moment(tmrow);
    }

    // prevent overlapping
    f.add(1, 'ms');

    f.hour(from);
    t.hour(to);

    return now.isBetween(f, t);
  }
}

// diff between two time as hour with decimals
function diff(a, b) {
  return moment.duration(a.diff(b)).asHours;
}

let pollings = {
  'raw': {
    alias: ['r'],
    url: 'https://m.zongheng.com/h5/ajax/chapter/list?h5=1&bookId=408586&pageNum=1&pageSize=1&chapterId=0&asc=1',
    parseData: function(bot, data) {
      // now is zongheng format
      return {
        title: data.chapterlist.chapters[0].chapterName,
        url: `http://book.zongheng.com/chapter/408586/${data.chapterlist.chapters[0].chapterId}.html`
      }
    },
    onNewChapter: function(bot) {
      bot.runPoll('free');
      return '@everyone, New Chapter from RAW!!!\n' + this.latestChapter.url;
    },
    delay: function() {
      // spanning object
      let s = span(moment());
      
      // span of time in hour (0-24)
      if(s(20, 22)) {
        return 8000;
      }
      if(s(22, 6)) {
        return 6000;
      }

      return 10000;
    }
  },
  'free': {
    alias: ['f'],
    url: ['http://m.zwda.com/nitianxieshen/', 'http://m.piaotian.com/book/6760.html'],
    parseData: [function(bot, data) {
      let $ = cheerio.load(data);
      let tag = $('.block_txt2 > p').last().find('a');
      return {
        title: tag.text().trim(),
        url: 'http://www.zwda.com' + tag.attr('href')
      };
    }, function(bot, data) {
      let $ = cheerio.load(data);
      let tag = $('.block_txt2 > p').last().find('a');
      return {
        title: tag.text().trim(),
        url: 'http://www.piaotian.com' + tag.attr('href')
      };
    }],
    onLoadChapter: function(bot) {
      bot.stopPoll('free');
    },
    onNewChapter: function(bot) {
      bot.stopPoll('free');
      bot.runPoll('lnmtl');
      return '<@244072217623658506>, Free RAW is Up!!!\n' + this.latestChapter.url;
    },
    delay: 5000,
    axiosOptions: {
      responseType: 'arraybuffer',
      transformResponse: function(data) {
        return iconv.decode(data, 'gbk');
      }
    }
  },
  'lnmtl': {
    alias: ['m', 'mtl'],
    url: 'https://lnmtl.com/novel/against-the-gods',
    parseData: function(bot, data) {
      let $ = cheerio.load(data);
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
      let url = latest.url;
      let title = latest.title;
      return {url, title};
    },
    onLoadChapter: function(bot) {
      bot.stopPoll('lnmtl');
    },
    onNewChapter: function(bot) {
      bot.stopPoll('lnmtl');
      return '@everyone, LNMTL is up!!!\n' + this.latestChapter.url;
    },
    delay: 5000
  },
  'htl': {
    alias: ['h', 'ww', 'alyschu'],
    url: 'http://www.wuxiaworld.com/category/atg-chapter-release/',
    parseData: function(bot, data) {
      let $ = cheerio.load(data);
      let sel = $('article.category-atg-chapter-release').first();
      let url = sel.find('.entry-content a[href^="http://www.wuxiaworld.com/atg-index/"]').attr('href');
      let title = sel.find('.entry-title').text().trim();

      return {url, title};
    },
    onNewChapter: function(bot) {
      return 'New Chapter from HTL!!!\n' + this.latestChapter.url;
    },
    delay: 60000 * 5 //every 5 min
  }
};


// defaults
_.forOwn(pollings, (v,k) => {
  _.defaults(v, {
    onLoadChapter: function() {},
    onNewChapter: function(bot) {
      return '@everyone, New Chapter from ' + obj.name + '!!!\n' + this.latestChapter.url;
    },
    asyncPolling: null,
    lastChapterTime: null,
  });
});
module.exports = pollings;