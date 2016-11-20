/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

'use strict';

var textHelper = require('./textHelper'),
    footballAPI = require('./footballAPI'),
    storage = require('./storage');

var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.AddTeamIntent = function (intent, session, response) {
        var newTeamName = intent.slots.Team.value;
        if (!newTeamName) {
            response.ask('OK. Who do you want to add?', 'Who do you want to add?');
            return;
        }
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput,
                reprompt;
            footballAPI.getTeam(newTeamName, function (error, teams) {
                if (error) {
                    response.tell("Sorry, Your News service is experiencing a problem. Please try again later");
                }
                else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name");
                }
                else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified");
                }
                else {
                    if (currentTeams.data.teamID[teams[0].name] !== undefined) {
                        speechOutput = newTeamName + ' has already joined the list.';
                        if (skillContext.needMoreHelp) {
                            response.ask(speechOutput + ' What else?', 'What else?');
                        } else {
                            response.tell(speechOutput);
                        }
                        return;
                    }
                    speechOutput = teams[0].name + ' has joined your list of favourite teams. ';
                    currentTeams.data.teams.push(teams[0].name);
                    currentTeams.data.teamID[teams[0].name] = teams[0].id;
                    if (skillContext.needMoreHelp) {
                        if (currentTeams.data.teams.length == 1) {
                            speechOutput += 'You can say, I am Done Adding Teams. Now who\'s your next Team?';
                            reprompt = textHelper.nextHelp;
                        } else {
                            speechOutput += 'Who is your next team?';
                            reprompt = textHelper.nextHelp;
                        }
                    }
                    currentTeams.save(function () {
                        if (reprompt) {
                            response.ask(speechOutput, reprompt);
                        } else {
                            response.tell(speechOutput);
                        }
                    });
                }
            });
        });
    };

    intentHandlers.DeleteTeamsIntent = function (intent, session, response) {
        storage.resetTeams(session).save(function () {
            response.ask('All your favourite teams have been removed, what team do you want to add first?', 'Who do you want to add first?');
        });
    };

    intentHandlers.DeleteTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value;
        if (!teamName) {
            response.ask('OK. Who do you want to delete?', 'Who do you want to delete?');
            return;
        }
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput;
            footballAPI.getTeam(teamName, function (error, teams) {
                if (error) {
                    response.tell("Sorry, Your News service is experiencing a problem. Please try again later");
                }
                else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name");
                }
                else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified");
                }
                else {
                    if (currentTeams.data.teamID[teams[0].name] !== undefined) {
                        var index = currentTeams.data.teams.indexOf(teams[0].name);
                        currentTeams.data.teams.splice(index, 1);
                        delete currentTeams.data.teamID[teams[0].name];

                        speechOutput = teams[0].name + ' has been removed from your favourite\'s teams list.';

                        currentTeams.save(function () {
                            response.tell(speechOutput);
                        });
                    }
                    else {
                        speechOutput = teams[0].name + ' isn\'t on your list of favourite teams.';
                        response.tell(speechOutput);
                    }
                }
            });
        });
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
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
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