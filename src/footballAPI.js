"use strict";

var http = require('http'),

apibase = 'http://api.football-data.org/v1/teams',

footballAPI = (function () {

    return {
        getTeam: function (teamName, callback) {
            var queryString = '?name=' + teamName;

            http.get(apibase + queryString, function (res) {
                var apiResponseString = '';
                console.log('Status Code: ' + res.statusCode);

                if (res.statusCode != 200) {
                    console.log("Non 200 Response");
                }

                res.on('data', function (data) {
                    apiResponseString += data;
                });

                res.on('end', function () {
                    var apiResponseObject = JSON.parse(apiResponseString);

                    if (apiResponseObject.error) {
                        console.log("API error: " + apiResponseObject.error.message);
                        callback(apiResponseObject.error.message);
                    } else {
                        callback(null, apiResponseObject.teams);
                    }
                });
            }).on('error', function (e) {
                console.log("Communications error: " + e.message);
                callback(e.message);
            });
        },
        getLastFixture: function (teamID, currentTeam, callback) {
            var queryString = "/" + teamID + "/fixtures/?timeFrame=p20";

            return http.get(apibase + queryString, function (res) {
                var apiResponseString = '';
                console.log('Status Code: ' + res.statusCode);

                if (res.statusCode != 200) {
                    console.log("Non 200 Response");
                }

                res.on('data', function (data) {
                    apiResponseString += data;
                });

                res.on('end', function () {
                    var apiResponseObject = JSON.parse(apiResponseString);

                    if (apiResponseObject.error) {
                        console.log("API error: " + apiResponseObject.error.message);
                        var test = callback(apiResponseObject.error.message, currentTeam);
                        return test;
                    } else {
                        return callback(null, currentTeam, apiResponseObject.fixtures);
                    }
                });
            }).on('error', function (e) {
                console.log("Communications error: " + e.message);
                return callback(e.message, currentTeam);
            });
        },
        getNextFixture: function (teamID, currentTeam, callback) {
            var queryString = "/" + teamID + "/fixtures/?timeFrame=n20";

            http.get(apibase + queryString, function (res) {
                var apiResponseString = '';
                console.log('Status Code: ' + res.statusCode);

                if (res.statusCode != 200) {
                    console.log("Non 200 Response");
                }

                res.on('data', function (data) {
                    apiResponseString += data;
                });

                res.on('end', function () {
                    var apiResponseObject = JSON.parse(apiResponseString);

                    if (apiResponseObject.error) {
                        console.log("API error: " + apiResponseObject.error.message);
                        callback(apiResponseObject.error.message, currentTeam);
                    } else {
                        callback(null, currentTeam, apiResponseObject.fixtures);
                    }
                });
            }).on('error', function (e) {
                console.log("Communications error: " + e.message);
                callback(e.message, currentTeam);
            });
        }
    };

})();

module.exports = footballAPI;
