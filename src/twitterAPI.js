"use strict";

var Twit = require('twit');

var T = new Twit({
    consumer_key: '',
    consumer_secret: '',
    access_token: '',
    access_token_secret: ''
});

var twitterAPI = (function () {

    return {
        getTweet: function (search, callback) {
            search = encodeURI(search);
            T.get('search/tweets', {q: search, lang: "en", result_type: "mixed", filter: "safe"}, function (err, data) {
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
