"use strict";

var helperFunctions = require("./helperFunctions"),
    footballAPI = require("./footballAPI"),
    twitterAPI = require("./twitterAPI"),
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
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count >= currentTeams.data.teams.length) {
                            var lastIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastIndex);
                            response.tell(speechOutput);
                        }
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
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count >= currentTeams.data.teams.length) {
                            var lastIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastIndex);
                            response.tell(speechOutput);
                        }
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
                        speechOutput += speechOutput2 + " And";
                        count++;
                        if (count >= currentTeams.data.teams.length) {
                            var lastIndex = speechOutput.lastIndexOf(" ");
                            speechOutput = speechOutput.slice(0, lastIndex);
                            response.tell(speechOutput);
                        }
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
            session.attributes.speechOutput = helperFunctions.completeHelp + " So, how can I help?";
            session.attributes.repromptText = "How can I help?";
            response.ask(helperFunctions.completeHelp + " So, how can I help?", "How can I help?");
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
            var speechOutput, repromptText;
            footballAPI.getTeam(teamName, function (error, teams) {
                if (error) {
                    response.tell("Sorry, Your News service is experiencing a problem. Please try again later.");
                } else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name.");
                } else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified.");
                } else {
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
                            repromptText = helperFunctions.nextHelp;
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
                } else if (teams.length > 1) {
                    response.tell("Sorry, too many teams found, please say your specific team name.");
                } else if (teams.length < 1) {
                    response.tell("Sorry, couldn't find the team you specified.");
                } else {
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
                callback(" Sorry, Your News service is experiencing a problem. Please try again later.");
            } else if (teams.length > 1) {
                callback(" Sorry, too many teams found, please say your specific team name.");
            } else if (teams.length < 1) {
                callback(" Sorry, couldn't find the team you specified.");
            } else {
                footballAPI.getNextFixture(teams[0].id, function (error, fixtures) {
                    if (fixtures.length > 1) {
                        var nextFixture = fixtures[0], speechOutput = "",
                            gameDate = new Date(nextFixture.date),
                            currentDate = new Date();
                        if (gameDate.getDate() == currentDate.getDate() && gameDate.getMonth() == currentDate.getMonth() && gameDate.getFullYear() == currentDate.getFullYear() && (nextFixture.status == "IN_PLAY" || nextFixture.status == "FINISHED" || nextFixture.status == "CANCELED" || nextFixture.status == "POSTPONED")) {
                            if (nextFixture.status == "FINISHED") {
                                speechOutput += getLatestScoreString(nextFixture, teams[0].name);
                            } else if (nextFixture.status == "IN_PLAY") {
                                speechOutput += getCurrentScoreString(nextFixture, teams[0].name);
                            } else if (nextFixture.status == "CANCELED") {
                                speechOutput += getCanceledScoreString(nextFixture, teams[0].name);
                            } else if (nextFixture.status == "POSTPONED") {
                                speechOutput += getPostponedScoreString(nextFixture, teams[0].name);
                            }
                            callback(speechOutput);
                            return;
                        }
                    }
                    footballAPI.getLastFixture(teams[0].id, function (error, fixtures) {
                        var speechOutput = " ";
                        if (error) {
                            speechOutput += "Your News service is experiencing a problem getting fixture for " + teams[0].name + ". Please try again later.";
                        }
                        else if (fixtures.length < 1) {
                            speechOutput += "No fixture found for " + teams[0].name + ".";
                        } else {
                            var lastFixture = fixtures[fixtures.length - 1];
                            if (lastFixture.status == "FINISHED") {
                                speechOutput += getLatestScoreString(lastFixture, teams[0].name);
                            } else if (lastFixture.status == "IN_PLAY") {
                                speechOutput += getCurrentScoreString(lastFixture, teams[0].name);
                            } else if (lastFixture.status == "CANCELED") {
                                speechOutput += getCanceledScoreString(lastFixture, teams[0].name);
                            } else if (lastFixture.status == "POSTPONED") {
                                speechOutput += getPostponedScoreString(lastFixture, teams[0].name);
                            } else {
                                if (lastFixture.homeTeamName.toLowerCase() == teams[0].name.toLowerCase()) {
                                    speechOutput += lastFixture.homeTeamName + " play " + lastFixture.awayTeamName + " next." + helperFunctions.getDate(lastFixture.date) + ".";
                                } else {
                                    speechOutput += lastFixture.awayTeamName + " play " + lastFixture.homeTeamName + " next." + helperFunctions.getDate(lastFixture.date) + ".";
                                }
                            }
                        }
                        callback(speechOutput);
                    });
                });
            }
        });
    },

    getNextFixture = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (error, teams) {
            if (error) {
                callback(" Sorry, Your News service is experiencing a problem. Please try again later.");
            } else if (teams.length > 1) {
                callback(" Sorry, too many teams found, please say your specific team name.");
            } else if (teams.length < 1) {
                callback(" Sorry, couldn't find the team you specified.");
            } else {
                footballAPI.getNextFixture(teams[0].id, function (error, fixtures) {
                    var speechOutput = " ";
                    if (error) {
                        speechOutput += "Your News service is experiencing a problem getting next fixture for " + teams[0].name + ". Please try again later.";
                    } else if (fixtures.length < 1) {
                        speechOutput += "No fixtures found for " + teams[0].name + ".";
                    } else {
                        for (var i = 0; i < fixtures.length; i++) {
                            var nextFixture = fixtures[i];
                            if (nextFixture.status == "IN_PLAY") {
                                speechOutput += getCurrentScoreString(nextFixture, teams[0].name);
                                break;
                            } else if (nextFixture.status == "CANCELED") {
                                speechOutput += getCanceledScoreString(nextFixture, teams[0].name);
                                break;
                            } else if (nextFixture.status == "POSTPONED") {
                                speechOutput += getPostponedScoreString(nextFixture, teams[0].name);
                                break;
                            } else if (nextFixture.status == "TIMED" || nextFixture.status == "SCHEDULED" ){
                                if (nextFixture.homeTeamName.toLowerCase() == teams[0].name.toLowerCase()) {
                                    speechOutput += "Next game for " + nextFixture.homeTeamName + " is versus " + nextFixture.awayTeamName + helperFunctions.getDate(nextFixture.date) + ".";
                                } else {
                                    speechOutput += "Next game for " + nextFixture.awayTeamName + " is versus " + nextFixture.homeTeamName + helperFunctions.getDate(nextFixture.date) + ".";
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

    getLatestNews = function (session, response, skillContext, teamName, callback) {
        footballAPI.getTeam(teamName, function (error, teams) {
            if (error) {
                callback(" Sorry, Your News service is experiencing a problem. Please try again later.");
            } else if (teams.length > 1) {
                callback(" Sorry, too many teams found, please say your specific team name.");
            } else if (teams.length < 1) {
                callback(" Sorry, couldn't find the team you specified.");
            } else {
                footballAPI.getNextFixture(teams[0].id, function (error, fixtures) {
                    if (fixtures.length > 1) {
                        var nextFixture = fixtures[0], query = "";
                        if (nextFixture.status == "IN_PLAY" || nextFixture.status == "FINISHED") {
                            query = nextFixture.homeTeamName + " " + nextFixture.result.goalsHomeTeam
                                + " " + nextFixture.result.goalsAwayTeam + " " + nextFixture.awayTeamName;
                        } else {
                            query = nextFixture.homeTeamName + " " + nextFixture.awayTeamName;
                        }
                        getTweet(teams[0].name, query, function (speechOutput2) {
                            callback(speechOutput2);
                        });
                    } else {
                        footballAPI.getLastFixture(teams[0].id, function (error, fixtures) {
                            var speechOutput = " ";
                            if (error) {
                                speechOutput += "Your News service is experiencing a problem getting latest score for "
                                    + teams[0].name + ". Please try again later.";
                                callback(speechOutput);
                            }
                            else if (fixtures.length > 1) {
                                var lastFixture = fixtures[fixtures.length - 1];
                                var query = lastFixture.homeTeamName + " " + lastFixture.result.goalsHomeTeam + " "
                                    + lastFixture.result.goalsAwayTeam + " " + lastFixture.awayTeamName;
                                getTweet(teams[0].name, query, function (speechOutput2) {
                                    callback(speechOutput2);
                                });
                            } else {
                                getTweet(teams[0].name, teams[0].name, function (speechOutput2) {
                                    callback(speechOutput2);
                                });
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
                speechOutput += "Your News service is experiencing a problem getting the latest news for "
                    + teamName + ". Please try again later.";
            } else if (tweets.length < 1) {
                speechOutput += "No news found for " + teamName + ".";
            } else {
                speechOutput += "Latest News for " + teamName + ": " + tweets[0].text + ".";
                var urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
                speechOutput = speechOutput.replace(urlExpression, "");
            }
            callback(speechOutput);
        });
    },

    getCurrentScoreString = function (fixture, teamName) {
        var speechOutput = "Currently ";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " are winning " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName + ".";
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " are losing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName + ".";
            } else {
                speechOutput += " are drawing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName + ".";
            }

        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " are wining " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName + ".";
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " are losing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName + ".";
            } else {
                speechOutput += " are drawing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName + ".";
            }

        }
        return speechOutput;
    },

    getCanceledScoreString = function (fixture, teamName) {
        var speechOutput = "";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " were winning " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " were losing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            } else {
                speechOutput += " were drawing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            }
        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " were wining " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " were losing " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            } else {
                speechOutput += " were drawing " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + " but is canceled.";
            }
        }
        return speechOutput;
    },

    getPostponedScoreString = function (fixture, teamName) {
        var speechOutput = "";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName + " were supposed to play " + fixture.awayTeamName + helperFunctions.getDate(nextFixture.date) + " but is postponed.";
        } else {
            speechOutput += fixture.awayTeamName + " were supposed to play " + fixture.homeTeamName + helperFunctions.getDate(nextFixture.date) + " but is postponed.";
        }
        return speechOutput;
    },

    getLatestScoreString = function (fixture, teamName) {
        var speechOutput = "";
        if (fixture.homeTeamName.toLowerCase() == teamName.toLowerCase()) {
            speechOutput += fixture.homeTeamName;
            if (fixture.result.goalsHomeTeam > fixture.result.goalsAwayTeam) {
                speechOutput += " won " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + ".";
            }
            else if (fixture.result.goalsHomeTeam < fixture.result.goalsAwayTeam) {
                speechOutput += " lost " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + ".";
            } else {
                speechOutput += " drew " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " with " + fixture.awayTeamName + helperFunctions.getDate(fixture.date) + ".";
            }
        } else {
            speechOutput += fixture.awayTeamName;
            if (fixture.result.goalsAwayTeam > fixture.result.goalsHomeTeam) {
                speechOutput += " won " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + ".";
            } else if (fixture.result.goalsAwayTeam < fixture.result.goalsHomeTeam) {
                speechOutput += " lost " + fixture.result.goalsHomeTeam + " " + fixture.result.goalsAwayTeam + " against " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + ".";
            } else {
                speechOutput += " drew " + fixture.result.goalsAwayTeam + " " + fixture.result.goalsHomeTeam + " with " + fixture.homeTeamName + helperFunctions.getDate(fixture.date) + ".";
            }
        }
        return speechOutput;
    };

exports.register = registerIntentHandlers;