"use strict";

var Twit = require('twit');

var T = new Twit({
    consumer_key:         '',
    consumer_secret:      '',
    access_token:         '',
    access_token_secret:  ''
});

    var twitterAPI = (function () {

        return {
            getTweet: function (search, callback) {
                T.get('search/tweets', { q: search,  count: 1,  lang: "en",  result_type: "popular", filter: "safe" }, function (err, data, response) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, data.statuses);
                    }
                });
            }
        };
    })();

module.exports = twitterAPI;
