'use strict';

var textHelper = (function () {
    //store months for later use
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    //sets up the days to be used later
    var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    return {

        getDate: function (fixture) {
            var gameDate = new Date(fixture.date),
                currentDate = new Date(),
                timeString = " ";

            //if game is today
            if (gameDate.getDate() == currentDate.getDate() && gameDate.getMonth() == currentDate.getMonth() && gameDate.getFullYear() == currentDate.getFullYear()) {
                if (fixture.status == "FINISHED") {
                    if (fixture.result.penaltyShootout !== undefined) {
                        gameDate.setHours(gameDate.getHours() + 2, gameDate.getMinutes() + 45);
                    } else if (fixture.result.extraTime !== undefined) {
                        gameDate.setHours(gameDate.getHours() + 2, gameDate.getMinutes() + 25);
                    } else {
                        gameDate.setHours(gameDate.getHours() + 1, gameDate.getMinutes() + 45);
                    }
                }

                var hoursDifference = gameDate.getHours() - currentDate.getHours();

                if (hoursDifference < 0) {
                    hoursDifference += 2;
                }

                if (hoursDifference == 0) {

                    timeString = " today ";
                    var minuteDifference = gameDate.getMinutes() - currentDate.getMinutes();

                    if (minuteDifference > 1) timeString += "in " + minuteDifference + " minutes";
                    else if (minuteDifference < 1) {
                        minuteDifference = currentDate.getMinutes() - gameDate.getMinutes();
                        timeString += minuteDifference + " minutes ago";
                    }
                    else timeString += minuteDifference + " minute ago";

                    return timeString;

                } else if (hoursDifference > 0) {
                    timeString = " today in " + hoursDifference + " hour";
                    if (hoursDifference > 1) timeString += "s";
                    return timeString;
                } else {
                    timeString = " today " + Math.abs(hoursDifference) + " hour";
                    if (Math.abs(hoursDifference) > 1) timeString += "s";
                    return timeString + " ago";

                }
            }
            //if its this month
            else if (gameDate.getMonth() == currentDate.getMonth() && gameDate.getFullYear() == currentDate.getFullYear()) {

                var daysDifference = gameDate.getDate() - currentDate.getDate();

                if (daysDifference > 1) timeString += "in " + daysDifference + " days on " + days[gameDate.getDay()] + " the " + gameDate.getDate() + " of " + months[gameDate.getMonth()];
                else if (daysDifference == 1) timeString += "tommorrow";
                else if (daysDifference == -1) timeString += "yesterday";
                else timeString += Math.abs(daysDifference) + " days ago on " + days[gameDate.getDay()] + " the " + gameDate.getDate() + " of " + months[gameDate.getMonth()];

                return timeString;
            } else {
                return " on " + days[gameDate.getDay()] + " the " + gameDate.getDate() + " of " + months[gameDate.getMonth()];
            }
        },

        completeHelp: 'Here\'s some things you can say,'
        + ' add chelsea fc.'
        + ' delete chelsea fc.'
        + ' latest score for my teams.'
        + ' latest score for chelsea fc.'
        + ' latest news for my teams.'
        + ' latest news for chelsea fc.'
        + ' next fixture for my teams.'
        + ' next fixtures for chelsea fc.'
        + ' reset my teams.'
        + ' repeat.'
        + ' and exit. What would you like?',

        nextHelp: 'You can add a team, delete a team, get the score for your team\'s or a team, get the latest news for your team\'s or a team, get the next fixture for your team\'s or a team, or say help. What would you like?'

    };

})();
module.exports = textHelper;