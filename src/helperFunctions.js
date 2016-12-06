'use strict';

var textHelper = (function () {
    //store months for later use
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    //sets up the days to be used later
    var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    var getDateEnding = function (date) {
        var j = date % 10,
            k = date % 100;
        if (j == 1 && k != 11) {
            return date + "st";
        }
        if (j == 2 && k != 12) {
            return date + "nd";
        }
        if (j == 3 && k != 13) {
            return date + "rd";
        }
        return date + "th";

    };

    return {

        getDate: function (fixture) {
            var gameDate = new Date(fixture.date),
                currentDate = new Date(),
                outputSpeech = " ";

            var dateDifference;

            //if game is today
            if (gameDate.getDate() == currentDate.getDate() && gameDate.getMonth() == currentDate.getMonth() && gameDate.getFullYear() == currentDate.getFullYear()) {

                if (fixture.status == "FINISHED") {
                    if (fixture.result.penaltyShootout !== undefined) {
                        gameDate.setHours(gameDate.getHours() + 2, gameDate.getMinutes() + 45);
                    }
                    else if (fixture.result.extraTime !== undefined) {
                        gameDate.setHours(gameDate.getHours() + 2, gameDate.getMinutes() + 25);
                    }
                    else {
                        gameDate.setHours(gameDate.getHours() + 1, gameDate.getMinutes() + 45);
                    }
                }

                dateDifference = gameDate - currentDate;

                var hoursDifference = parseInt((dateDifference / (1000 * 60 * 60)) % 24);
                var minutesDifference = parseInt((dateDifference / 1000 / 60) % 60);

                if (hoursDifference == 0) {

                    if (minutesDifference > 1) {
                        outputSpeech += "in " + minutesDifference + " minutes at" + gameDate.toTimeString();
                    }
                    else if (minutesDifference < -1) {
                        outputSpeech += Math.abs(minutesDifference) + " minutes ago";
                    }
                    else if (minutesDifference == -1) {
                        outputSpeech += "one minute ago";
                    }
                    else if (minutesDifference == 1) {
                        outputSpeech += "in one minute";
                    }
                    else if (fixture.status == "FINISHED") {
                        outputSpeech += "just now";
                    }
                    else {
                        outputSpeech += "right now";
                    }
                }
                else if (hoursDifference > 0) {
                    outputSpeech += "in " + hoursDifference + " hour";
                    if (hoursDifference > 1) {
                        outputSpeech += "s";
                    }

                    if (minutesDifference == 1) outputSpeech += " one minutes";
                    if (minutesDifference > 1) outputSpeech += " " + minutesDifference + " minutes";

                    outputSpeech += " at " + gameDate.toTimeString();
                }
                else {
                    var gameStart = new Date(fixture.date);

                    outputSpeech += Math.abs(hoursDifference) + " hour";
                    if (Math.abs(hoursDifference) > 1) {
                        outputSpeech += "s";
                    }

                    if (Math.abs(minutesDifference) == 1) outputSpeech += " one minute";
                    if (Math.abs(minutesDifference) > 1) outputSpeech += " " + Math.abs(minutesDifference) + " minutes";

                    outputSpeech += " ago for the game at " + gameStart.toTimeString();
                }
            }
            else {
                //set the date to same time to get accurate days difference
                currentDate.setHours(0, 0, 0);
                dateDifference = gameDate - currentDate;

                var daysDifference = Math.floor(dateDifference / (1000 * 60 * 60 * 24));

                if (daysDifference > 1) {
                    outputSpeech += "in " + daysDifference + " days on " + days[gameDate.getDay()] + " the " + getDateEnding(gameDate.getDate()) + " of " + months[gameDate.getMonth()] + " at " + gameDate.toTimeString();
                }
                else if (daysDifference == 1) {
                    outputSpeech += "tomorrow at " + gameDate.toTimeString();
                }
                else if (daysDifference == -1) {
                    outputSpeech += "yesterday";
                }
                else {
                    outputSpeech += Math.abs(daysDifference) + " days ago on " + days[gameDate.getDay()] + " the " + getDateEnding(gameDate.getDate()) + " of " + months[gameDate.getMonth()];
                }
            }
            return outputSpeech;
        },

        completeHelp: 'Here\'s some things you can say, add chelsea fc.'
        + ' delete chelsea fc. latest score for my teams.'
        + ' latest score for chelsea fc. latest news for my teams.'
        + ' latest news for chelsea fc. next fixture for my teams.'
        + ' next fixtures for chelsea fc. reset my teams.'
        + ' stop. What would you like?',

        nextHelp: "You can add a team or delete a team from your favourites list. Or get the score, "
        + "latest news, or next fixture for a team, or get help. What would you like to do or know?"
    };

})();
module.exports = textHelper;