"use strict";

var helperFunctions = require("./helperFunctions"),
    footballAPI = require("./footballAPI"),
    twitterAPI = require("./twitterAPI"),
    storage = require("./storage");

var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.TeamIntent = function (intent, session, response) {
        var speechOutput, repromptSpeech,
            teamName = intent.slots.Team.value;
        if (!teamName) {
            repromptSpeech = session.attributes.repromptSpeech = "What is the team name?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            response.ask(speechOutput, repromptSpeech);
        }
        var action = session.attributes.action;
        if (!action) {
            repromptSpeech = session.attributes.repromptSpeech = "What did you want done with " + teamName + "?";
            speechOutput = session.attributes.speechOutput = "Sorry, " + repromptSpeech;
            session.attributes.teamName = teamName;
            response.ask(speechOutput, repromptSpeech);
        } else if (action == "add") {
            addTeam(session, response, skillContext, teamName);
        } else if (action == "delete") {
            deleteTeam(session, response, skillContext, teamName);
        } else if (action == "score") {
            latestScoreForTeamHandler(session, response, skillContext, teamName);
        } else if (action == "news") {
            latestNewsForTeamHandler(session, response, skillContext, teamName);
        } else if (action == "fixture") {
            nextFixtureForTeamHandler(session, response, skillContext, teamName);
        } else {
            response.tell("Sorry, got a problem handling your request for " + teamName + ".");
        }
    };

    intentHandlers.UsersTeamsIntent = function (intent, session, response) {
        var speechOutput, repromptSpeech;
        var action = session.attributes.action;
        if (!action) {
            repromptSpeech = session.attributes.repromptSpeech = "What did you want done with your favourite teams?";
            speechOutput = session.attributes.speechOutput = "Sorry, " + repromptSpeech;
            session.attributes.usersTeams = true;
            session.attributes.teamName = "";
            response.ask(speechOutput, repromptSpeech);
        } else if (action == "score") {
            latestScoreForUsersTeamHandler(session, response, skillContext);
        } else if (action == "news") {
            latestNewsForUsersTeamHandler(session, response, skillContext);
        } else if (action == "fixture") {
            nextFixtureForUsersTeamsHandler(session, response, skillContext);
        } else {
            response.tell("Sorry, got a problem handling your request for favourite teams.");
        }
    };

    intentHandlers.AddTeamIntent = function (intent, session, response) {
        var newTeamName = intent.slots.Team.value || session.attributes.teamName;
        session.attributes.usersTeams = false;
        if (!newTeamName) {
            var repromptSpeech, speechOutput;
            repromptSpeech  = session.attributes.repromptSpeech = "what team do you want to add?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            session.attributes.action = "add";
            response.ask(speechOutput, repromptSpeech);
        }
        addTeam(session, response, skillContext, newTeamName);
    };

    intentHandlers.ResetTeamsIntent = function (intent, session, response) {
        session.attributes.usersTeams = false;
        var repromptSpeech, speechOutput;
        storage.resetTeams(session).save(function () {
            speechOutput = "All your favourite teams have been removed.";
            if (skillContext.needMoreHelp) {
                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                response.ask(speechOutput, repromptSpeech);
            }
            response.tell(speechOutput);
        });
    };

    intentHandlers.DeleteTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName,
            repromptSpeech, speechOutput;
        session.attributes.usersTeams = false;
        if (!teamName) {
            repromptSpeech = session.attributes.repromptSpeech = "what team do you want to delete?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            session.attributes.action = "delete";
            response.ask(speechOutput, repromptSpeech);
        }
        deleteTeam(session, response, skillContext, teamName);
    };

    intentHandlers.LatestScoreForUserTeamsIntent = function (intent, session, response) {
        latestScoreForUsersTeamHandler(session, response, skillContext);
    };

    intentHandlers.LatestScoreForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName,
            repromptSpeech, speechOutput;
        if (!teamName && !session.attributes.usersTeams) {
            repromptSpeech = session.attributes.repromptSpeech = "What team do you want the score for?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            session.attributes.action = "score";
            response.ask(speechOutput, repromptSpeech);
        } else if (teamName){
            latestScoreForTeamHandler(session, response, skillContext, teamName);
        } else {
            latestScoreForUsersTeamHandler(session, response, skillContext);
        }
    };

    intentHandlers.NextFixtureForUserTeamsIntent = function (intent, session, response) {
        nextFixtureForUsersTeamsHandler(session, response, skillContext);
    };

    intentHandlers.NextFixtureForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName,
            speechOutput, repromptSpeech;
        if (!teamName && !session.attributes.usersTeams) {
            repromptSpeech = session.attributes.repromptSpeech = "What team do you want the next fixture for?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            session.attributes.action = "fixture";
            response.ask(speechOutput, repromptSpeech);
        } else if (teamName) {
            nextFixtureForTeamHandler(session, response, skillContext, teamName);
        } else {
            nextFixtureForUsersTeamsHandler(session, response, skillContext);
        }
    };

    intentHandlers.LatestNewsForUserTeamsIntent = function (intent, session, response) {
        latestNewsForUsersTeamHandler(session, response, skillContext);
    };

    intentHandlers.LatestNewsForTeamIntent = function (intent, session, response) {
        var teamName = intent.slots.Team.value || session.attributes.teamName,
            repromptSpeech, speechOutput;
        if (!teamName && !session.attributes.usersTeams) {
            repromptSpeech = session.attributes.repromptSpeech = "What team do you want the latest news for?";
            speechOutput = session.attributes.speechOutput = "Sorry, didn\'t catch the team name. " + repromptSpeech;
            session.attributes.action = "news";
            response.ask(speechOutput, repromptSpeech);
        } else if (teamName) {
            latestNewsForTeamHandler(session, response, skillContext, teamName);
        } else {
            latestNewsForUsersTeamHandler(session, response, skillContext);
        }
    };

    intentHandlers["AMAZON.RepeatIntent"] = function (intent, session, response) {
        if (session.attributes.speechOutput && session.attributes.repromptSpeech) {
            response.ask(session.attributes.speechOutput, session.attributes.repromptSpeech);
        }
        response.ask("Sorry, There is nothing to repeat. But what else do you want to know or do?", "What else do you want to know or do?");
    };

    intentHandlers["AMAZON.HelpIntent"] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            session.attributes.speechOutput = helperFunctions.completeHelp;
            session.attributes.repromptSpeech = "How can I help?";
            response.ask(helperFunctions.completeHelp, "How can I help?");
        }
        response.tell(helperFunctions.completeHelp);
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
            var speechOutput, repromptSpeech;
            footballAPI.getTeam(teamName, function (error, data) {
                if (error) {
                    repromptSpeech = session.attributes.repromptSpeech = "What else do you want to know or do?";
                    speechOutput = session.attributes.speechOutput = "Sorry, Your News service is experiencing a problem. Please try again later. But " + repromptSpeech;
                    session.attributes.action = "";
                    session.attributes.teamName = "";
                    response.ask(speechOutput, repromptSpeech);
                } else if (data.teams.length > 1) {
                    repromptSpeech = session.attributes.repromptSpeech = "What is the team name?";
                    speechOutput = session.attributes.speechOutput = "Sorry, too many teams found called " + teamName + ", please be more specific with the team name. " + repromptSpeech;
                    session.attributes.action = "add";
                    response.ask(speechOutput, repromptSpeech);
                } else if (data.teams.length < 1) {
                    repromptSpeech = session.attributes.repromptSpeech = "What is the team name?";
                    speechOutput = session.attributes.speechOutput = "Sorry, couldn't find a team called " + teamName + ", try a different name. " + repromptSpeech;
                    session.attributes.action = "add";
                    response.ask(speechOutput, repromptSpeech);
                } else {
                    session.attributes.action = "";
                    session.attributes.teamName = "";
                    if (currentTeams.data.teamID[data.teams[0].name] !== undefined) {
                        speechOutput = data.teams[0].name + " has already joined the list. ";
                        if (skillContext.needMoreHelp) {
                            repromptSpeech = session.attributes.repromptSpeech = "What else do you want to know or do?";
                            speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                            response.ask(speechOutput, repromptSpeech);
                        }
                        response.tell(speechOutput);
                    } else {
                        speechOutput = data.teams[0].name + " has joined your list of favourite teams. ";
                        currentTeams.data.teams.push(data.teams[0].name);
                        currentTeams.data.teamID[data.teams[0].name] = data.teams[0].id;
                        session.attributes.action = "";
                        session.attributes.teamName = "";
                        currentTeams.save(function () {
                            if (skillContext.needMoreHelp) {
                                repromptSpeech = session.attributes.repromptSpeech = "What else do you want to know or do?";
                                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                                response.ask(speechOutput, repromptSpeech);
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
            var speechOutput, repromptSpeech;
            footballAPI.getTeam(teamName, function (error, data) {
                if (error) {
                    repromptSpeech = session.attributes.repromptSpeech = "What else do you want to know or do?";
                    speechOutput = session.attributes.speechOutput = "Sorry, Your News service is experiencing a problem. Please try again later. but " + repromptSpeech;
                    session.attributes.action = "";
                    session.attributes.teamName = "";
                    response.ask(speechOutput, repromptSpeech);
                } else if (data.teams.length > 1) {
                    repromptSpeech = session.attributes.repromptSpeech = "What is the team name?";
                    speechOutput = session.attributes.speechOutput = "Sorry, too many teams found called " + teamName + ", please be more specific with the team name. " + repromptSpeech;
                    session.attributes.action = "delete";
                    response.ask(speechOutput, repromptSpeech);
                } else if (data.teams.length < 1) {
                    repromptSpeech = session.attributes.repromptSpeech = "What is the team name?";
                    speechOutput = session.attributes.speechOutput = "Sorry, couldn't find a team called " + teamName + ", try a different name. " + repromptSpeech;
                    session.attributes.action = "delete";
                    response.ask(speechOutput, repromptSpeech);
                } else {
                    if (currentTeams.data.teamID[data.teams[0].name] !== undefined) {
                        var index = currentTeams.data.teams.indexOf(data.teams[0].name);
                        currentTeams.data.teams.splice(index, 1);
                        delete currentTeams.data.teamID[data.teams[0].name];
                        session.attributes.action = "";
                        session.attributes.teamName = "";

                        speechOutput = data.teams[0].name + " has been removed from your favourite\'s teams list.";

                        currentTeams.save(function () {
                            if (skillContext.needMoreHelp) {
                                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                                response.ask(speechOutput, repromptSpeech);
                            }
                            response.tell(speechOutput);
                        });
                    } else {
                        speechOutput = data.teams[0].name + " isn\'t on your list of favourite teams.";
                        if (skillContext.needMoreHelp) {
                            repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                            speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                            response.ask(speechOutput, repromptSpeech);
                        }
                        response.tell(speechOutput);
                    }
                }
            });
        });
    },

    latestScoreForUsersTeamHandler = function (session, response, skillContext) {
        var speechOutput = "" , repromptSpeech;
        storage.loadTeams(session, function (currentTeams) {
            if (currentTeams.data.teams.length > 0) {
                var count = 0;
                currentTeams.data.teams.forEach(function (team) {
                    getScore(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count == currentTeams.data.teams.length) {
                            var lastWordIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastWordIndex);
                            if (skillContext.needMoreHelp) {
                                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                                session.attributes.action = "";
                                session.attributes.usersTeams = false;
                                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                                response.ask(speechOutput, repromptSpeech);
                            }
                            response.tell(speechOutput);
                        }
                    });
                });
            } else {
                repromptSpeech = session.attributes.repromptSpeech = "what team do you want to add first?";
                speechOutput = session.attributes.speechOutput = "Sorry, you have no teams in your favourites list. " + repromptSpeech;
                session.attributes.action = "add";
                session.attributes.usersTeams = false;
                response.ask(speechOutput, repromptSpeech);
            }
        });
    },

    latestScoreForTeamHandler = function (session, response, skillContext, teamName) {
        getScore(session, response, skillContext, teamName, function (speechOutput) {
            var repromptSpeech;
            session.attributes.action = "";
            session.attributes.teamName = "";
            session.attributes.usersTeams = false;
            if (skillContext.needMoreHelp) {
                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                response.ask(speechOutput, repromptSpeech);
            }
            response.tell(speechOutput);
        });
    },

    getScore = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (teamsError, teamsData) {
            if (teamsError) {
                callback(" Sorry, Your News service is experiencing a problem getting fixture for " + teamName + ". Please try again later.");
            } else if (teamsData.teams.length > 1) {
                callback(" Sorry, too many teams found called " + teamName + ", please say your specific team name.");
            } else if (teamsData.teams.length < 1) {
                callback(" Sorry, couldn't find the team called " + teamName + " try a different name.");
            } else {
                var speechOutput = " ";
                footballAPI.getNextFixtures(teamsData.teams[0].id, function (nextFixturesError, nextFixturesData) {
                    if (nextFixturesData.fixtures.length > 0) {
                        var nextFixture = nextFixturesData.fixtures[0],
                            gameDate = new Date(nextFixture.date),
                            currentDate = new Date();
                        if (gameDate.getDate() == currentDate.getDate() && gameDate.getMonth() == currentDate.getMonth() && gameDate.getFullYear() == currentDate.getFullYear() && (nextFixture.status == "IN_PLAY" || nextFixture.status == "FINISHED" || nextFixture.status == "CANCELED" || nextFixture.status == "POSTPONED")) {
                            if (nextFixture.status == "FINISHED") {
                                speechOutput += getFinalScoreString(nextFixture, teamsData.teams[0].name);
                            } else if (nextFixture.status == "IN_PLAY") {
                                speechOutput += getCurrentScoreString(nextFixture, teamsData.teams[0].name);
                            } else if (nextFixture.status == "CANCELED") {
                                speechOutput += getCanceledScoreString(nextFixture, teamsData.teams[0].name);
                            } else if (nextFixture.status == "POSTPONED") {
                                speechOutput += getPostponedScoreString(nextFixture, teamsData.teams[0].name);
                            }
                            callback(speechOutput);
                            return;
                        }
                    }
                    footballAPI.getPreviousFixtures(teamsData.teams[0].id, function (previousFixturesError, previousFixturesData) {
                        if (previousFixturesError) {
                            speechOutput += "Your News service is experiencing a problem getting fixture for " + teamsData.teams[0].name + ". Please try again later.";
                        } else {
                            speechOutput = " No fixtures found for " + teamsData.teams[0].name + ".";
                            for (var i = (previousFixturesData.fixtures.length - 1); i > 0; i--) {
                                var lastFixture = previousFixturesData.fixtures[i];
                                if (lastFixture.status == "FINISHED") {
                                    speechOutput = getFinalScoreString(lastFixture, teamsData.teams[0].name);
                                    break;
                                } else if (lastFixture.status == "IN_PLAY") {
                                    speechOutput = getCurrentScoreString(lastFixture, teamsData.teams[0].name);
                                    break;
                                } else if (lastFixture.status == "CANCELED") {
                                    speechOutput = getCanceledScoreString(lastFixture, teamsData.teams[0].name);
                                    break;
                                } else if (lastFixture.status == "POSTPONED") {
                                    speechOutput = getPostponedScoreString(lastFixture, teamsData.teams[0].name);
                                    break;
                                }
                            }
                        }
                        callback(speechOutput);
                    });
                });
            }
        });
    },

    nextFixtureForUsersTeamsHandler = function (session, response, skillContext) {
        var speechOutput = "", repromptSpeech;
        storage.loadTeams(session, function (currentTeams) {
            var count = 0;
            if (currentTeams.data.teams.length > 0) {
                currentTeams.data.teams.forEach(function (team) {
                    getNextFixture(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count >= currentTeams.data.teams.length) {
                            var lastIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastIndex);
                            if (skillContext.needMoreHelp) {
                                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                                response.ask(speechOutput, repromptSpeech);
                            }
                            response.tell(speechOutput);
                        }
                    });
                });
            } else {
                repromptSpeech = session.attributes.repromptSpeech = "what team do you want to add first?";
                speechOutput = session.attributes.speechOutput = "Sorry, you have no teams in your favourites list. " + repromptSpeech;
                session.attributes.action = "add";
                session.attributes.usersTeams = false;
                response.ask(speechOutput, repromptSpeech);
            }
        });
    },

    nextFixtureForTeamHandler = function (session, response, skillContext, teamName) {
        getNextFixture(session, response, skillContext, teamName, function (speechOutput) {
            var repromptSpeech;
            session.attributes.action = "";
            session.attributes.teamName = "";
            session.attributes.usersTeams = false;
            if (skillContext.needMoreHelp) {
                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                response.ask(speechOutput, repromptSpeech);
            }
            response.tell(speechOutput);
        });
    },

    getNextFixture = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (teamsError, teamsData) {
            if (teamsError) {
                callback(" Sorry, Your News service is experiencing a problem getting next fixture for " + teamName + ". Please try again later.");
            } else if (teamsData.teams.length > 1) {
                callback(" Sorry, too many teams found called " + teamName + ", please say a more specific team name.");
            } else if (teamsData.teams.length < 1) {
                callback(" Sorry, couldn't find the team called " + teamName + ", try a different name.");
            } else {
                footballAPI.getNextFixtures(teamsData.teams[0].id, function (nextFixturesError, nextFixturesData) {
                    var speechOutput = " ";
                    if (nextFixturesError) {
                        speechOutput += "Sorry, Your News service is experiencing a problem getting next fixture for " + teamsData.teams[0].name + ". Please try again later.";
                    } else if (nextFixturesData.fixtures.length < 1) {
                        speechOutput += "No fixtures found for " + teamsData.teams[0].name + ".";
                    } else {
                        for (var i = 0; i < nextFixturesData.fixtures.length; i++) {
                            var nextFixture = nextFixturesData.fixtures[i];
                            if (nextFixture.status == "IN_PLAY") {
                                speechOutput += getCurrentScoreString(nextFixture, teamsData.teams[0].name);
                                break;
                            } else if (nextFixture.status == "CANCELED") {
                                speechOutput += getCanceledScoreString(nextFixture, teamsData.teams[0].name);
                                break;
                            } else if (nextFixture.status == "POSTPONED") {
                                speechOutput += getPostponedScoreString(nextFixture, teamsData.teams[0].name);
                                break;
                            } else if (nextFixture.status == "TIMED" || nextFixture.status == "SCHEDULED") {
                                if (nextFixture.homeTeamName.toLowerCase() == teamsData.teams[0].name.toLowerCase()) {
                                    speechOutput += "Next game for " + nextFixture.homeTeamName + " is versus " + nextFixture.awayTeamName + helperFunctions.getDate(nextFixture) + ".";
                                } else {
                                    speechOutput += "Next game for " + nextFixture.awayTeamName + " is versus " + nextFixture.homeTeamName + helperFunctions.getDate(nextFixture) + ".";
                                }
                                break;
                            }
                        }
                    }
                    callback(speechOutput);
                });
            }
        });
    },

    latestNewsForUsersTeamHandler = function (session, response, skillContext) {
        storage.loadTeams(session, function (currentTeams) {
            var speechOutput = " ", repromptSpeech, count = 0;
            if (currentTeams.data.teams.length > 0) {
                currentTeams.data.teams.forEach(function (team) {
                    getLatestNews(session, response, skillContext, team, function (speechOutput2) {
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count >= currentTeams.data.teams.length) {
                            var lastIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastIndex);
                            if (skillContext.needMoreHelp) {
                                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                                response.ask(speechOutput, repromptSpeech);
                            }
                            response.tell(speechOutput);
                        }
                    });
                });
            } else {
                repromptSpeech = session.attributes.repromptSpeech = "what team do you want to add first?";
                speechOutput = session.attributes.speechOutput = "Sorry, you have no teams in your favourites list. " + repromptSpeech;
                session.attributes.action = "add";
                session.attributes.usersTeams = false;
                response.ask(speechOutput, repromptSpeech);
            }
        });
    },

    latestNewsForTeamHandler = function (session, response, skillContext, teamName) {
        getLatestNews(session, response, skillContext, teamName, function (speechOutput) {
            var repromptSpeech;
            session.attributes.action = "";
            session.attributes.teamName = "";
            session.attributes.usersTeams = false;
            if (skillContext.needMoreHelp) {
                repromptSpeech = session.attributes.repromptSpeech = " What else do you want to know or do?";
                speechOutput = session.attributes.speechOutput = speechOutput + repromptSpeech;
                response.ask(speechOutput, repromptSpeech);
            }
            response.tell(speechOutput);
        });
    },

    getLatestNews = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (teamsError, teamsData) {
            if (teamsError) {
                callback(" Sorry, Your News service is experiencing a problem getting latest news for " +
                    teamName + ". Please try again later.");
            } else if (teamsData.teams.length > 1) {
                callback(" Sorry, too many teams found called " + teamName + ", please say your specific team name.");
            } else if (teamsData.teams.length < 1) {
                callback(" Sorry, couldn't find the team called " + teamName + " which you specified.");
            } else {
                footballAPI.getNextFixtures(teamsData.teams[0].id, function (nextFixturesError, nextFixturesData) {
                    if (nextFixturesData.fixtures.length > 0) {
                        var nextFixture = nextFixturesData.fixtures[0], query = "";
                        if (nextFixture.status == "IN_PLAY" || nextFixture.status == "FINISHED") {
                            query = nextFixture.homeTeamName + " " + nextFixture.result.goalsHomeTeam +
                                " " + nextFixture.result.goalsAwayTeam + " " + nextFixture.awayTeamName;
                        } else {
                            query = nextFixture.homeTeamName + " " + nextFixture.awayTeamName;
                        }
                        getTweet(teamsData.teams[0].name, query, callback);
                    } else {
                        footballAPI.getPreviousFixtures(teamsData.teams[0].id, function (previousFixturesError, previousFixturesFixtures) {
                            var speechOutput = " ";
                            if (previousFixturesError) {
                                speechOutput += "Your News service is experiencing a problem getting latest news for " +
                                    teamsData.teams[0].name + ". Please try again later.";
                                callback(speechOutput);
                            }
                            else if (previousFixturesFixtures.fixtures.length > 0) {
                                var lastFixture = previousFixturesFixtures.fixtures[previousFixturesFixtures.fixtures.length - 1];
                                var query = lastFixture.homeTeamName + " " + lastFixture.result.goalsHomeTeam + " " +
                                    lastFixture.result.goalsAwayTeam + " " + lastFixture.awayTeamName;
                                getTweet(teamsData.teams[0].name, query, callback);
                            } else {
                                getTweet(teamsData.teams[0].name, teamsData.teams[0].name, callback);
                            }
                        });
                    }
                });
            }
        });
    },

    getTweet = function (teamName, query, callback) {
        twitterAPI.getTweet(query, function (error, tweets) {
            var speechOutput = " ";
            if (error) {
                speechOutput += "Your News service is experiencing a problem getting the latest news for " +
                    teamName + ". Please try again later.";
            } else {
                speechOutput += "No news found for " + teamName + ".";
                for (var i = 0; i < tweets.length; i++) {
                    var urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                    if (!urlExpression.test(tweets[i].text)) {
                        var tweetDate = new Date(tweets[i].created_at);
                        speechOutput = " Latest News for " + teamName + " from " + tweetDate.toDateString() + " at " + tweetDate.toTimeString() + ": " + tweets[i].text + ".";
                        break;
                    }
                }
            }
            callback(speechOutput);
        });
    },

    getCurrentScoreString = function (fixture, teamName) {
        var speechOutput = " Currently ";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " are winning " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName;
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " are losing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName;
            } else {
                speechOutput += " are drawing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName;
            }

        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " are winning " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName;
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " are losing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName;
            } else {
                speechOutput += " are drawing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName;
            }

        }
        return speechOutput + ".";
    },

    getCanceledScoreString = function (fixture, teamName) {
        var speechOutput = " ";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " were winning " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName;
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " were losing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName;
            } else {
                speechOutput += " were drawing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName;
            }
        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " were winning " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName;
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " were losing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName;
            } else {
                speechOutput += " were drawing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName;
            }
        }
        return speechOutput + helperFunctions.getDate(fixture) + " but is canceled.";
    },

    getPostponedScoreString = function (fixture, teamName) {
        var speechOutput = " ";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName + " were supposed to play " + fixture.awayTeamName + helperFunctions.getDate(fixture) + " but is postponed.";
        } else {
            speechOutput += fixture.awayTeamName + " were supposed to play " + fixture.homeTeamName + helperFunctions.getDate(fixture) + " but is postponed.";
        }
        return speechOutput;
    },

    getFinalScoreString = function (fixture, teamName) {
        var speechOutput = " ";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " won " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture) + ".";
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " lost " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture) + ".";
            } else {
                speechOutput += " drew " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName + helperFunctions.getDate(fixture) + ".";
            }
        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " won " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture) + ".";
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " lost " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture) + ".";
            } else {
                speechOutput += " drew " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName + helperFunctions.getDate(fixture) + ".";
            }
        }
        return speechOutput;
    };

exports.register = registerIntentHandlers;