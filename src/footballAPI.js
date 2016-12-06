"use strict";

var footballAPI = (function () {

    var http = require('http'),

        apiBase = 'www.api.football-data.org',

        getData = function (url, callback) {

            var options = {
                hostname: apiBase,
                path: '/v1/teams/' + url,
                headers: {'X-Auth-Token': ''}
            };

            http.request(options, function (res) {
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
                        callback(apiResponseObject.error.message, null);
                    } else {
                        callback(null, apiResponseObject);
                    }
                });
            }).on('error', function (e) {
                console.log("Communications error: " + e.message);
                callback(e.message, null);
            }).end();
        };

    return {
        getTeam: function (teamName, callback) {
            teamName = encodeURI(teamName);
            var queryString = '?name=' + teamName;

            getData(queryString, callback);
        },
        getPreviousFixtures: function (teamID, callback) {
            var queryString = teamID + "/fixtures?timeFrame=p20";

            getData(queryString, callback);
        },
        getNextFixtures: function (teamID, callback) {
            var queryString = teamID + "/fixtures?timeFrame=n20";

            getData(queryString, callback);
        }
    };
})();
module.exports = footballAPI;