'use strict';

var YourNews = require('./yourNews');

exports.handler = function (event, context) {
    var yourNews = new YourNews();
    yourNews.execute(event, context);
};