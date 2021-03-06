/**
 * GSM_Base
 * --------
 * A base class for state in the game state machine (GSM).
 *
 * Game states often interact with the AIs by sending them updates
 * about the current game state and expecting a response from them.
 *
 * This base class manages the mechanics of some of the common
 * interactions, including timing how long the response takes.
 *
 * Responses
 * ---------
 * We hold responses from AIs in the _aiResponses object. This acts
 * like a map of AI->AIResponse, and helps us determine when we have
 * received responses from both AIs.
 *
 * Events
 * ------
 * This function should be implemented in the derived GSM classes to handle
 * updates from AIs:
 * - onAIResponsesReceived
 * This function should return the new state (which can be 'this' to
 * remain in the current state).
 */
var AIUtilsLib = require('../ai_utils');
var AIResponse = AIUtilsLib.AIResponse;
var UtilsLib = require('../utils');
var Utils = UtilsLib.Utils;
var Logger = UtilsLib.Logger;
var MessageUtils = AIUtilsLib.MessageUtils;
var util = require('util');

/**
 * @constructor
 */
function GSM_Base(game) {
    // The game...
    this._game = game;

    // The teams...
    this._team1 = game.getTeam1();
    this._team2 = game.getTeam2();

    // The two AIs...
    this._AI1 = game.getTeam1().getAI();
    this._AI2 = game.getTeam2().getAI();

    // Responses from AIs...
    this._aiResponses = {};
}

/**
 * onTurn
 * ------
 * Virtual function, usually handled by a derived class.
 */
GSM_Base.prototype.onTurn = function() {
};

/**
 * checkState
 * ----------
 * Virtual function, usually handled by a derived class.
 */
GSM_Base.prototype.checkState = function() {
    return this;
};

/**
 * sendRequestToBothAIs
 * --------------------
 * Sends the request to both AIs and waits for a response.
 */
GSM_Base.prototype.sendRequestToBothAIs = function(request) {
    // We clear any previous responses...
    this._aiResponses = {};

    // We note the time before sending the update, so that we
    // can time how long the AIs take to process it...
    this._updateSentTime = process.hrtime();

    // We send the request...
    var jsonRequest = MessageUtils.getRequestJSON(request);
    this._AI1.sendData(jsonRequest);
    this._AI2.sendData(jsonRequest);

    Logger.log('SENT REQUEST: ' + jsonRequest, Logger.LogLevel.DEBUG);
};

/**
 * onResponse_AI1
 * --------------
 * Called when we get a response from AI1.
 */
GSM_Base.prototype.onResponse_AI1 = function(jsonData) {
    var message = util.format('GOT RESPONSE (AI1): %s', jsonData);
    Logger.log(message, Logger.LogLevel.DEBUG);

    // We store the data and check whether we have received both updates...
    this._aiResponses.AI1 = this._getAIResponse(jsonData);
    this._checkResponses();
};

/**
 * onResponse_AI2
 * --------------
 * Called when we get a response from AI2.
 */
GSM_Base.prototype.onResponse_AI2 = function(jsonData) {
    var message = util.format('GOT RESPONSE (AI2): %s', jsonData);
    Logger.log(message, Logger.LogLevel.DEBUG);

    // We store the data and check whether we have received both updates...
    this._aiResponses.AI2 = this._getAIResponse(jsonData);
    this._checkResponses();
};

/**
 * _checkResponses
 * ---------------
 * Checks whether we have received responses from both AIs.
 */
GSM_Base.prototype._checkResponses = function() {
    // We check if we have data from both AIs in our
    // collection of responses...
    if(!('AI1' in this._aiResponses)) return;
    if(!('AI2' in this._aiResponses)) return;

    // We've got updates from both AIs.
    var response1 = this._aiResponses.AI1;
    var response2 = this._aiResponses.AI2;

    // We convert the JSON data to objects...
    response1.data = JSON.parse(response1.jsonData);
    response2.data = JSON.parse(response2.jsonData);

    // We update the processing time for each AI...
    this._AI1.processingTimeSeconds += response1.processingTimeSeconds;
    this._AI2.processingTimeSeconds += response2.processingTimeSeconds;

    // We call into the derived class to handle the responses...
    this.onAIResponsesReceived();
};

/**
 * _getAIResponse
 * --------------
 * Creates an AIResponse object to hold the data passed in by an AI,
 * along with other associated info.
 */
GSM_Base.prototype._getAIResponse = function(jsonData) {
    var response = new AIResponse();
    response.jsonData = jsonData;
    response.processingTimeSeconds = this._getProcessingTimeSeconds();
    return response;
};

/**
 * _getProcessingTimeSeconds
 * -------------------------
 * Returns the time in seconds between the update-sent-time
 * and now.
 */
GSM_Base.prototype._getProcessingTimeSeconds = function() {
    var diff = process.hrtime(this._updateSentTime);
    var diffSeconds = diff[0] + diff[1] / 1000000000.0;
    return diffSeconds;
};


// Exports...
module.exports = GSM_Base;


