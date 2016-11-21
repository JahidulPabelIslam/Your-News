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
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "", count = 0;
            currentTeams.data.teams.forEach(function (team) {
                footballAPI.getLastFixture(currentTeams.data.teamID[team], function (error, fixtures) {
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + team + ". Please try again later";
                    }
                    else if (fixtures.length < 1) {
                        speechOutput += "No fixture found for your " + team + ".";
                    }
                    else {
                        var lastFixture = fixtures[fixtures.length - 1];
                        if (lastFixture.homeTeamName.toLowerCase() == team.toLowerCase()) {
                            speechOutput += lastFixture.homeTeamName;
                            if (lastFixture.result.goalsHomeTeam > lastFixture.result.goalsAwayTeam) {
                                speechOutput += " won against " + lastFixture.awayTeamName + ".";
                            }
                            else if (lastFixture.result.goalsHomeTeam < lastFixture.result.goalsAwayTeam) {
                                speechOutput += " lost against " + lastFixture.awayTeamName + ".";
                            }
                            else {
                                speechOutput += " drew against " + lastFixture.awayTeamName + ".";
                            }
                        }
                        else {
                            speechOutput += lastFixture.awayTeamName;
                            if (lastFixture.result.goalsAwayTeam > lastFixture.result.goalsHomeTeam) {
                                speechOutput += " won against " + lastFixture.homeTeamName + ".";
                            }
                            else if (lastFixture.result.goalsAwayTeam < lastFixture.result.goalsHomeTeam) {
                                speechOutput += " lost against " + lastFixture.homeTeamName + ".";
                            }
                            else {
                                speechOutput += " drew against " + lastFixture.homeTeamName + ".";
                            }
                        }
                    }

                    count++;

                    if (count >= currentTeams.data.teams.length) response.tell(speechOutput);
                });
            });

        });
    };

    intentHandlers.LatestScoreForTeamIntent = function (intent, session, response) {
        var teamNameSlot = intent.slots.Team.value;
        if (!teamNameSlot) {
            response.ask('OK. what team do you want the score for?', 'what team do you want the score for?');
            return;
        }
        footballAPI.getTeam(teamNameSlot, function (error, teams) {
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
                footballAPI.getLastFixture(teams[0].id, function (error, fixtures) {
                    var speechOutput = "";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + teams[0].name + ". Please try again later";
                    }
                    else if (fixtures.length < 1) {
                        speechOutput += "No fixture found for your " + teams[0].name + ".";
                    }
                    else {
                        var lastFixture = fixtures[fixtures.length - 1];
                        if (lastFixture.homeTeamName.toLowerCase() == teams[0].name.toLowerCase()) {
                            speechOutput += lastFixture.homeTeamName;
                            if (lastFixture.result.goalsHomeTeam > lastFixture.result.goalsAwayTeam) {
                                speechOutput += " won against " + lastFixture.awayTeamName + ".";
                            }
                            else if (lastFixture.result.goalsHomeTeam < lastFixture.result.goalsAwayTeam) {
                                speechOutput += " lost against " + lastFixture.awayTeamName + ".";
                            }
                            else {
                                speechOutput += " drew against " + lastFixture.awayTeamName + ".";
                            }
                        }
                        else {
                            speechOutput += lastFixture.awayTeamName;
                            if (lastFixture.result.goalsAwayTeam > lastFixture.result.goalsHomeTeam) {
                                speechOutput += " won against " + lastFixture.homeTeamName + ".";
                            }
                            else if (lastFixture.result.goalsAwayTeam < lastFixture.result.goalsHomeTeam) {
                                speechOutput += " lost against " + lastFixture.homeTeamName + ".";
                            }
                            else {
                                speechOutput += " drew against " + lastFixture.homeTeamName + ".";
                            }
                        }
                    }
                    response.tell(speechOutput);
                });
            }
        });
    };

    intentHandlers.NextFixtureForUserTeamsIntent = function (intent, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "", count = 0;
            currentTeams.data.teams.forEach(function (team) {
                footballAPI.getNextFixture(currentTeams.data.teamID[team], function (error, fixtures) {
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + team + ". Please try again later";
                    }
                    else if (fixtures.length < 1) {
                        speechOutput += "No fixture found for your " + team + ".";
                    }
                    else {
                        var nextFixture = fixtures[0];
                        if (nextFixture.homeTeamName.toLowerCase() == team.toLowerCase()) {
                            speechOutput += nextFixture.homeTeamName + " play " + nextFixture.awayTeamName + " next.";
                        }
                        else {
                            speechOutput += nextFixture.awayTeamName + " play " + nextFixture.homeTeamName + " next.";
                        }
                    }

                    count++;

                    if (count >= currentTeams.data.teams.length) response.tell(speechOutput);
                });
            });
        });
    };

    intentHandlers.NextFixtureForTeamIntent = function (intent, session, response) {
        var teamNameSlot = intent.slots.Team.value;
        if (!teamNameSlot) {
            response.ask('OK. what team do you want the score for?', 'what team do you want the score for?');
            return;
        }
        footballAPI.getTeam(teamNameSlot, function (error, teams) {
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
                footballAPI.getNextFixture(teams[0].id, function (error, fixtures) {
                    var speechOutput = "";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + teams[0].name + ". Please try again later";
                    }
                    else if (fixtures.length < 1) {
                        speechOutput += "No fixture found for your " + teams[0].name + ".";
                    }
                    else {
                        var nextFixture = fixtures[0];
                        if (nextFixture.homeTeamName.toLowerCase() == teams[0].name.toLowerCase()) {
                            speechOutput += nextFixture.homeTeamName + " play " + nextFixture.awayTeamName + " next.";
                        }
                        else {
                            speechOutput += nextFixture.awayTeamName + " play " + nextFixture.homeTeamName + " next.";
                        }
                    }
                    response.tell(speechOutput);
                });
            }
        });
    };

    intentHandlers.LatestNewsForUserTeamsIntent = function (intent, session, response) {
        var speechOutput = "Latest News for user Team.";
        response.tell(speechOutput);
    };

    intentHandlers.LatestNewsForTeamIntent = function (intent, session, response) {
        var speechOutput = "Latest News for " + intent.slots.Team.value;
        response.tell(speechOutput);
    };

    intentHandlers['AMAZON.RepeatIntent'] = function (intent, session, response) {
        response.tell('Repeating');
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.ask(textHelper.completeHelp + ' So, how can I help?', 'How can I help?');
        } else {
            response.tell(textHelper.completeHelp);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        response.tell('Bye.');
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        response.tell('Bye.');
    };

};
exports.register = registerIntentHandlers;