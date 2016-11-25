"use strict";

var http = require('http'),

    apibase = 'http://api.football-data.org/v1/teams/',

    footballAPI = (function () {

        var getData = function (url, callback) {
            http.get(url, function (res) {
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
                        callback(null, apiResponseObject);
                    }
                });
            }).on('error', function (e) {
                console.log("Communications error: " + e.message);
                callback(e.message);
            });
        };

        return {
            getTeam: function (teamName, callback) {
                teamName = encodeURI(teamName);
                var queryString = '?name=' + teamName;

                getData(apibase + queryString, function (error, data) {
                   callback(error, data.teams);
                });
            },
            getLastFixtures: function (teamID, callback) {
                var queryString = "/" + teamID + "fixtures?timeFrame=p20";

                getData(apibase + queryString, function (error, data) {
                    callback(error, data.fixtures);
                });
            },
            getNextFixtures: function (teamID, callback) {
                var queryString = "/" + teamID + "fixtures?timeFrame=n20";

                getData(apibase + queryString, function (error, data) {
                    callback(error, data.fixtures);
                });
            }
        };
    })();
module.exports = footballAPI;
