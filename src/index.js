/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        if (event.session.application.applicationId !== "amzn1.ask.skill.2093fbff-77b5-4c3f-bdcd-e32aae49bcab") {
            context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if ("AddTeamIntent" === intentName) {
        handleAddTeamRequest(intent, session, callback);
    } else if ("DeleteTeamIntent" === intentName) {
        handleDeleteTeamRequest(intent, session, callback);
    } else if ("LatestScoreOnUserTeamsIntent" === intentName) {
        handleLatestScoreOnUserTeamsRequest(intent, session, callback);
    } else if ("LatestScoreOnTeamIntent" === intentName) {
        handleLatestScoreOnTeamRequest(intent, session, callback);
    } else if ("LatestNewsOnUserTeamsIntent" === intentName) {
        handleLatestNewsOnUserTeamsRequest(intent, session, callback);
    } else if ("LatestNewsOnTeamIntent" === intentName) {
        handleLatestNewsOnTeamRequest(intent, session, callback);
    } else if ("NextFixtureOnUserTeamsIntent" === intentName) {
        handleNextFixtureOnUserTeamsRequest(intent, session, callback);
    } else if ("NextFixtureOnTeamIntent" === intentName) {
        handleNextFixtureOnTeamRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------
var CARD_TITLE = "Your News"; // Be sure to change this for your skill.

function getWelcomeResponse(callback) {
    var speechOutput = "Hello, what would you like to do?",
        shouldEndSession = false,

        repromptText = "What would you like to do?.",
        sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
        };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleAddTeamRequest(intent, session, callback) {
    var speechOutput = "Adding " + intent.slots.Team.value + " speechOutput.",
        repromptText = "Adding " + intent.slots.Team.value + " repromptText.",

        sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
        };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function handleDeleteTeamRequest(intent, session, callback) {
    var speechOutput = "Deleting " + intent.slots.Team.value + " speechOutput.",
        repromptText = "Deleting " + intent.slots.Team.value + " repromptText.",

        sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
        };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function handleAnswerRequest(intent, session, callback) {
    var repromptText = "Question .",

        speechOutput = "That answer is .",

        sessionAttributes = {
            "speechOutput": repromptText,
            "repromptText": repromptText
        };

    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.

    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "Here you can get the latest score and news for a football team. You can add a team to your favorites or delete a team. For example: add chelsea fc. delete chelsea fc. what's the latest score for my teams. what's the latest score for chelsea fc. what's the latest news for my teams. what's the latest news for chelsea fc. What would you like to do?",
        repromptText = "What would you like to do?";
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}




// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

