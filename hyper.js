const hyperquest = require('hyperquest');
const _ = require('lodash');
const Promise = require('bluebird');
const url = 'https://m.zongheng.com/h5/ajax/chapter/list?h5=1&bookId=408586&pageNum=1&pageSize=1&chapterId=0&asc=1';
const iconv = require('iconv-lite');


var hyper = {

    get: function(url, opts) {
        opts = _.extend({
            encoding: 'utf8'
        }, opts);
        
        return new Promise(function(resolve, reject) {
            hyperquest(url, {}, function(err, res) {
                if(err) {
                    reject(err);
                    return;
                }
                var data = [];
                res.on('data', function(chunk) {
                    data.push(chunk);
                });

                res.on('end', function() {
                    let buffer = Buffer.concat(data);
                    let parse = buffer;

                    if(opts.encoding) {
                        parse = iconv.decode(parse, opts.encoding);
                    }
                    if(res.headers['content-type'].includes('application/json')) {
                        parse = JSON.parse(parse);
                    }

                    resolve({data: parse});
                });

                res.on('error', function(e) {
                    reject(e);
                });
            });
        });
    },

    all: function(arr) {
        return Promise.all(arr);
    }
}
module.exports = hyper;
