'use strict';

var storage = require('./storage'),
    textHelper = require('./textHelper');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "",
                reprompt = "";
            if (currentTeams.data.teams.length === 0) {
                speechOutput = "Hello, Let\'s start. Who\'s your first Team?";
                reprompt = "Please tell me who is your first Team?";
            } else {
                speechOutput = "Your News, What can I do for you?";
                reprompt = textHelper.nextHelp;
            }
            response.ask(speechOutput, reprompt);
        });
    };
};

exports.register = registerEventHandlers;