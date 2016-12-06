'use strict';

var storage = require('./storage'),
    textHelper = require('./helperFunctions');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput, repromptSpeech;
            if (currentTeams.data.teams.length === 0) {
                speechOutput = session.attributes.speechOutput = "Your News, Let\'s start. " + textHelper.nextHelp;
                repromptSpeech = session.attributes.repromptSpeech = textHelper.completeHelp;
            } else {
                speechOutput = session.attributes.speechOutput = "Your News, What can I do for you today?";
                repromptSpeech = session.attributes.repromptSpeech = textHelper.nextHelp;
            }
            response.ask(speechOutput, repromptSpeech);
        });
    };
};

exports.register = registerEventHandlers;