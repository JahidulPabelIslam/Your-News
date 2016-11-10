/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.AddTeamIntent = function (intent, session, response) {
        var speechOutput = "Adding " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers.DeleteTeamIntent = function (intent, session, response) {
        var speechOutput = "Deleting " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers.LatestScoreForUserTeamsIntent = function (intent, session, response) {
        var speechOutput = "Latest Score for User Teams.";
        response.tell(speechOutput);
    };

    intentHandlers.LatestScoreForTeamIntent = function (intent, session, response) {
        var speechOutput = "Latest Score for " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers.LatestNewsForUserTeamsIntent = function (intent, session, response) {
        var speechOutput = "Latest News for user Teams.";
        response.tell(speechOutput);
    };

    intentHandlers.LatestNewsForTeamIntent = function (intent, session, response) {
        var speechOutput = "Latest News for " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers.NextFixtureForUserTeamsIntent = function (intent, session, response) {
        var speechOutput = "Next Fixture for user Team.";
        response.tell(speechOutput);
    };

    intentHandlers.NextFixtureForTeamIntent = function (intent, session, response) {
        var speechOutput = "Next Fixture for " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        response.ask("Here you can get the latest score and news for a football team. You can add a team to your favorites or delete a team. For example: add chelsea fc. delete chelsea fc. what's the latest score for my teams. what's the latest score for chelsea fc. what's the latest news for my teams. what's the latest news for chelsea fc. What would you like to do?");
    };

    intentHandlers['AMAZON.RepeatIntent'] = function (intent, session, response) {
        response.tell('Repeating');
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        response.tell('Bye.');
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        response.tell('Bye.');
    };

};
exports.register = registerIntentHandlers;
