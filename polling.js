const _ = require('lodash');
const gbk = require('gbk');
const Discord = require('discord.js');
let pollings = {
  'raw': {
    name: 'raw',
    alias: ['r'],
    url: 'http://book.zongheng.com/book/408586.html',
    parseData: function(bot, $) {
      let title = $('a.chap').clone().children().remove().end().text().split('：')[1].trim();
      let url = $('a.chap').attr('href');
      return {title, url};
    }
  },
  'lnmtl': {
    name: 'lnmtl',
    alias: ['m', 'mtl'],
    url: 'https://lnmtl.com/novel/against-the-gods',
    parseData: function(bot, $) {
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
    }
  },
  'htl': {
    name: 'htl',
    alias: ['h', 'ww', 'alyschu'],
    url: 'http://www.wuxiaworld.com/category/atg-chapter-release/',
    parseData: function(bot, $) {
      let sel = $('article.category-atg-chapter-release').first();
      let url = sel.find('.entry-content a[href^="http://www.wuxiaworld.com/atg-index/"]').attr('href');
      let title = sel.find('.entry-title').text().trim();

      return {url, title};
    },
    onSuccess: function(bot, store) {
      return 'New chapter from htl!!!\n' + store.url;
    }
  },
  // 'piaotian': {
  //   name: 'piaotian',
  //   alias: ['p', 'pi', 'pt'],
  //   url: 'http://www.piaotian.com/bookinfo/6/6760.html',
  //   parseData: function(bot, $) {
  //     let sel = $('li>a[href^="http://www.piaotian.com/html/"]').first();
  //     let url = sel.attr('href');
  //     let title = sel.text();

  //     console.log(title);

  //     return {url, title};
  //   },
  //   charset: 'gbk'
  // }
};


_.forOwn(pollings, (v,k) => {
  _.defaults(v, {
    onSuccess: function(bot, store, obj) {
      return '@everyone, New Chapter from ' + obj.name + '!!!\n' + store.url;
    }
  });
});
module.exports = pollings;