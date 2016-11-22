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
                repromptText = "";
            if (currentTeams.data.teams.length === 0) {
                speechOutput = "Hello, Let\'s start. " + textHelper.nextHelp;
                repromptText = textHelper.completeHelp;
            } else {
                speechOutput = "Your News, What can I do for you?";
                repromptText = textHelper.nextHelp;
            }
            session.attributes.speechOutput = speechOutput;
            session.attributes.repromptText = repromptText;
            response.ask(speechOutput, repromptText);
        });
    };
};

exports.register = registerEventHandlers;