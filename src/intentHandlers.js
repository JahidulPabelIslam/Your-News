"use strict";

var textHelper = require("./textHelper"),
    footballAPI = require("./footballAPI"),
    storage = require("./storage");

var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.TeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value;
        if (!teamName) {
            session.attributes.speechOutput = "Sorry, didn\'t catch the team name?";
            session.attributes.repromptText = "What was the team name?";
            response.ask("Sorry, didn\'t catch the team name?", "What was the team name?");
        }
        var action = session.attributes.action;
        if (!action) {
            session.attributes.speechOutput = "Sorry, what did you want done with " + teamName + "?";
            session.attributes.repromptText = "What did you want done with " + teamName + "?";
            session.attributes.teamName = teamName;
            response.ask("Sorry, what did you want done with " + teamName + "?", "What did you want done with " + teamName + "?");
        } else if (action == "add") {
            addTeam(session, response, skillContext, teamName);
        } else if (action == "delete") {
            deleteTeam(session, response, skillContext, teamName);
        } else if (action == "score") {
            getScore(session, response, skillContext, teamName);
        } else if (action == "news") {
            getLatestNews(session, response, skillContext, teamName);
        } else if (action == "next fixture") {
            getNextFixture(session, response, skillContext, teamName);
        } else {
            session.attributes.speechOutput = "Sorry, got a problem handling your request for " + teamName + ".";
            session.attributes.repromptText = "";
            response.tell("Sorry, got a problem handling your request for " + teamName + ".");
        }
    };

    intentHandlers.AddTeamIntent = function (intent, session, response) {
        var newTeamName = intent.slots.Team.value || session.attributes.teamName;
        if (!newTeamName) {
            session.attributes.speechOutput = "Who do you want to add?";
            session.attributes.repromptText = "Who do you want to add?";
            session.attributes.action = "add";
            response.ask("Who do you want to add?", "Who do you want to add?");
        }
        addTeam(session, response, skillContext, newTeamName);
    };

    intentHandlers.ResetTeamsIntent = function (intent, session, response) {
        storage.resetTeams(session).save(function () {
            session.attributes.speechOutput = "All your favourite teams have been removed. what team do you want to add first?";
            session.attributes.repromptText = "Who do you want to add first?";
            session.attributes.action = "add";
            response.ask("All your favourite teams have been removed. what team do you want to add first?", "Who do you want to add first?");
        });
    };

    intentHandlers.DeleteTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName;
        if (!teamName) {
            session.attributes.speechOutput = "Who do you want to delete?";
            session.attributes.repromptText = "Who do you want to delete?";
            session.attributes.action = "delete";
            response.ask("Who do you want to delete?", "Who do you want to delete?");
        }
        deleteTeam(session, response, skillContext, teamName);
    };

    intentHandlers.LatestScoreForUserTeamsIntent = function (intent, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "", count = 0;
            if (currentTeams.data.teams.length > 0) {
                currentTeams.data.teams.forEach(function (team) {
                    getScore(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2;
                        count++;
                        if (count >= currentTeams.data.teams.length) response.tell(speechOutput);
                    });
                });
            } else {
                response.tell("Sorry, you have no teams in your favourites list.");
            }
        });
    };

    intentHandlers.LatestScoreForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName;
        if (!teamName) {
            session.attributes.speechOutput = "What team do you want the score for?";
            session.attributes.repromptText = "what team do you want the score for?";
            session.attributes.action = "score";
            response.ask("What team do you want the score for?", "what team do you want the score for?");
        }
        getScore(session, response, skillContext, teamName, function (speechOutput) {
            response.tell(speechOutput);
        });
    };

    intentHandlers.NextFixtureForUserTeamsIntent = function (intent, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "", count = 0;
            if (currentTeams.data.teams.length > 0) {
                currentTeams.data.teams.forEach(function (team) {
                    getNextFixture(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2;
                        count++;
                        if (count >= currentTeams.data.teams.length) response.tell(speechOutput);
                    });
                });
            } else {
                response.tell("Sorry, you have no teams in your favourites list.");
            }
        });
    };

    intentHandlers.NextFixtureForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName;
        if (!teamName) {
            session.attributes.speechOutput = "What team do you want the next fixture for?";
            session.attributes.repromptText = "What team do you want the next fixture for?";
            session.attributes.action = "next fixture";
            response.ask("What team do you want the next fixture for?", "What team do you want the next fixture for?");
        }
        getNextFixture(session, response, skillContext, teamName, function (speechOutput) {
            response.tell(speechOutput);
        });
    };

    intentHandlers.LatestNewsForUserTeamsIntent = function (intent, session, response) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = "", count = 0;
            if (currentTeams.data.teams.length > 0) {
                currentTeams.data.teams.forEach(function (team) {
                    getLatestNews(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2;
                        count++;
                        if (count >= currentTeams.data.teams.length) response.tell(speechOutput);
                    });
                });
            } else {
                response.tell("Sorry, you have no teams in your favourites list.");
            }
        });
    };

    intentHandlers.LatestNewsForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName;
        if (!teamName) {
            session.attributes.speechOutput = "What team do you want the latest news for?";
            session.attributes.repromptText = "What team do you want the latest news for?";
            session.attributes.action = "next fixture";
            response.ask("What team do you want the latest news for?", "What team do you want the latest news for?");
        }
        getLatestNews(session, response, skillContext, teamName, function (speechOutput) {
            response.tell(speechOutput);
        });
    };

    intentHandlers["AMAZON.RepeatIntent"] = function (intent, session, response) {
        if (session.attributes && session.attributes.speechOutput && session.attributes.repromptText) {
            response.ask(session.attributes.speechOutput, session.attributes.repromptText);
        } else if (session.attributes && session.attributes.speechOutput) {
            response.tell(session.attributes.speechOutput);
        }
        response.tell("Sorry, Your News is experiencing a problem getting last statement.");
    };

    intentHandlers["AMAZON.HelpIntent"] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            session.attributes.speechOutput = textHelper.completeHelp + " So, how can I help?";
            session.attributes.repromptText = "How can I help?";
            response.ask(textHelper.completeHelp + " So, how can I help?", "How can I help?");
        }
        response.tell(textHelper.completeHelp);
    };

    intentHandlers["AMAZON.CancelIntent"] = function (intent, session, response) {
        response.tell("Bye.");
    };

    intentHandlers["AMAZON.StopIntent"] = function (intent, session, response) {
        response.tell("Bye.");
    };
};

var addTeam = function (session, response, skillContext, teamName) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput, repromptText;
            footballAPI.getTeam(teamName, function (error, teams) {
                if (error) {
                    response.tell("Sorry, Your News service is experiencing a problem. Please try again later.");
                }
                else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name.");
                }
                else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified.");
                }
                else {
                    if (currentTeams.data.teamID[teams[0].name] !== undefined) {
                        speechOutput = teamName + " has already joined the list.";
                        if (skillContext.needMoreHelp) {
                            response.ask(speechOutput + " What else?", "What else?");
                        }
                        response.tell(speechOutput);
                    } else {
                        speechOutput = teams[0].name + " has joined your list of favourite teams.";
                        currentTeams.data.teams.push(teams[0].name);
                        currentTeams.data.teamID[teams[0].name] = teams[0].id;
                        if (skillContext.needMoreHelp) {
                            speechOutput += " What else?";
                            repromptText = textHelper.nextHelp;
                        }
                        currentTeams.save(function () {
                            if (repromptText) {
                                response.ask(speechOutput, repromptText);
                            }
                            response.tell(speechOutput);
                        });
                    }
                }
            });
        });
    },

    deleteTeam = function (session, response, skillContext, teamName) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput;
            footballAPI.getTeam(teamName, function (error, teams) {
                if (error) {
                    response.tell("Sorry, Your News service is experiencing a problem. Please try again later.");
                }
                else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name.");
                }
                else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified.");
                }
                else {
                    if (currentTeams.data.teamID[teams[0].name] !== undefined) {
                        var index = currentTeams.data.teams.indexOf(teams[0].name);
                        currentTeams.data.teams.splice(index, 1);
                        delete currentTeams.data.teamID[teams[0].name];

                        speechOutput = teams[0].name + " has been removed from your favourite\'s teams list.";

                        currentTeams.save(function () {
                            response.tell(speechOutput);
                        });
                    } else {
                        speechOutput = teams[0].name + " isn\'t on your list of favourite teams.";
                        response.tell(speechOutput);
                    }
                }
            });
        });
    },

    getScore = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (error, teams) {
            if (error) {
                callback("Sorry, Your News service is experiencing a problem. Please try again later.");
            }
            else if (teams.length > 1) {
                callback("Sorry, too many teams found, please say your specific team name.");
            }
            else if (teams.length < 1) {
                callback("Sorry, couldn't find the team you specified.");
            }
            else {
                footballAPI.getLastFixture(teams[0].id, function (error, fixtures) {
                    var speechOutput = "";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + teams[0].name + ". Please try again later.";
                    }
                    else if (fixtures.length < 1) {
                        speechOutput += "No fixture found for your " + teams[0].name + ".";
                    }
                    else {
                        var lastFixture = fixtures[fixtures.length - 1];
                        if (lastFixture.homeTeamName.toLowerCase() == teams[0].name.toLowerCase()) {
                            speechOutput += lastFixture.homeTeamName;
                            if (lastFixture.result.goalsHomeTeam > lastFixture.result.goalsAwayTeam) {
                                speechOutput += " won " + lastFixture.result.goalsHomeTeam + " "  + lastFixture.result.goalsAwayTeam + " against " + lastFixture.awayTeamName + ".";
                            }
                            else if (lastFixture.result.goalsHomeTeam < lastFixture.result.goalsAwayTeam) {
                                speechOutput += " lost " + lastFixture.result.goalsHomeTeam + " " + lastFixture.result.goalsAwayTeam + " against " + lastFixture.awayTeamName + ".";
                            }
                            else {
                                speechOutput += " drew " + lastFixture.result.goalsHomeTeam + " " + lastFixture.result.goalsAwayTeam + " with " + lastFixture.awayTeamName + ".";
                            }
                        }
                        else {
                            speechOutput += lastFixture.awayTeamName;
                            if (lastFixture.result.goalsAwayTeam > lastFixture.result.goalsHomeTeam) {
                                speechOutput += " won " + lastFixture.result.goalsAwayTeam +" " + lastFixture.result.goalsHomeTeam + " against " + lastFixture.homeTeamName + ".";
                            }
                            else if (lastFixture.result.goalsAwayTeam < lastFixture.result.goalsHomeTeam) {
                                speechOutput += " lost " + lastFixture.result.goalsAwayTeam + " " + lastFixture.result.goalsHomeTeam + " against " + lastFixture.homeTeamName + ".";
                            }
                            else {
                                speechOutput += " drew " + lastFixture.result.goalsAwayTeam + " " + lastFixture.result.goalsHomeTeam + "with " + lastFixture.homeTeamName + ".";
                            }
                        }
                    }
                    callback(speechOutput);
                });
            }
        });
    },

    getNextFixture = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (error, teams) {
            if (error) {
                callback("Sorry, Your News service is experiencing a problem. Please try again later.");
            }
            else if (teams.length > 1) {
                callback("Sorry, too many teams found, please say your specific team name.");
            }
            else if (teams.length < 1) {
                callback("Sorry, couldn't find the team you specified.");
            }
            else {
                footballAPI.getNextFixture(teams[0].id, function (error, fixtures) {
                    var speechOutput = "";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting fixture for " + teams[0].name + ". Please try again later.";
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
                    callback(speechOutput);
                });
            }
        });
    },

    getLatestNews = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (error, teams) {
            if (error) {
                callback("Sorry, Your News service is experiencing a problem. Please try again later.");
            }
            else if (teams.length > 1) {
                callback("Sorry, too many teams found, please say your specific team name.");
            }
            else if (teams.length < 1) {
                callback("Sorry, couldn't find the team you specified.");
            }
            else {
                twitterAPI.getTweet(teams[0].name, function (error, tweets) {
                    var speechOutput = "";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting the latest news for " + teams[0].name + ". Please try again later.";
                    }
                    else if (tweets.length < 1) {
                        speechOutput += "No news found for your " + teams[0].name + ".";
                    }
                    else {
                        speechOutput += tweets[0].text + ".";
                    }
                    callback(speechOutput);
                });
            }
        });
    };

exports.register = registerIntentHandlers;