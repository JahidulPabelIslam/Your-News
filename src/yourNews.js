'use strict';

var AlexaSkill = require('./AlexaSkill'),
    eventHandlers = require('./eventHandlers'),
    intentHandlers = require('./intentHandlers');

var APP_ID = "amzn1.ask.skill.2093fbff-77b5-4c3f-bdcd-e32aae49bcab";
var skillContext = {};

/**
 * YourNews is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var YourNews = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
YourNews.prototype = Object.create(AlexaSkill.prototype);
YourNews.prototype.constructor = YourNews;

eventHandlers.register(YourNews.prototype.eventHandlers, skillContext);
intentHandlers.register(YourNews.prototype.intentHandlers, skillContext);

module.exports = YourNews;

