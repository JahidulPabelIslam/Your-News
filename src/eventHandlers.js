/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

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
