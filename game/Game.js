/**
 * Game
 * ----
 * Manages a game, including the two teams, their AIs and players.
 *
 * Calculation and AI-update intervals
 * -----------------------------------
 * These intervals are stored in seconds, though these are really
 * 'virtual' intervals in game-time, and may be run much faster than
 * real time.
 *
 * Calculations may be done more frequently than player-AI updates, to
 * make sure that no events are missed.
 */
var Team = require('./Team');
var Player = require('./Player');
var PlayerState_Static = require('./PlayerState_Static');

/**
 * @constructor
 */
function Game() {
    // We create the teams and the players...
    this.createTeams();

    // The interval in seconds between calculation updates.
    // This includes the 'physics' of player and ball movement
    // as well as player interactions (such as tackling) and other
    // game events...
    this.calculationIntervalSeconds = 0.1;

    // The interval in seconds between updates / requests being
    // sent to the AIs...
    this.aiUpdateIntervalSeconds = 1.0;

    // The length of the game in seconds...
    this.gameLengthSeconds = 90.0 * 60.0;
}

/**
 * Creates the teams and the players.
 */
Game.prototype.createTeams = function() {
    // We create the two teams...
    this.team1 = new Team();
    this.team2 = new Team();

    // We create the players and assign them to the teams...
    this.players = [];
    var playerNumber = {value: 0};
    this.addPlayersToTeam(this.team1, playerNumber);
    this.addPlayersToTeam(this.team2, playerNumber);
};

/**
 * Adds players and the goalkeeper to the team passed in.
 */
Game.prototype.addPlayersToTeam = function(team, playerNumber) {
    // We add the players...
    for(var i=0; i<Team.NUMBER_OF_PLAYERS; ++i) {
        var player = new Player(playerNumber.value, PlayerState_Static.PlayerType.PLAYER);
        this.players.push(player);
        team.addPlayer(player);
        playerNumber.value++;
    }

    // And the goalkeeper...
    var player = new Player(playerNumber.value, PlayerState_Static.PlayerType.GOALKEEPER);
    this.players.push(player);
    team.addPlayer(player);
    playerNumber.value++;
};

/**
 * calculate
 * ---------
 * Calculates new positions of players and takes actions, based
 * on the current game time.
 */
Game.prototype.calculate = function() {
    // To calculate the next game state, we:
    // 1. Move players to their new positions.
    // 2. Perform actions (turning, tacking, kicking).

    // 1. We move the players...
    this.updatePositions();
};

/**
 * updatePositions
 * ---------------
 * Updates the positions of the players, based on current game time
 * and the directions, speed and intentions of the players.
 */
Game.prototype.updatePositions = function() {
    // We update the positions of the players in the two teams...
    this.team1.updatePositions(this);
    this.team2.updatePositions(this);
};

// Exports...
module.exports = Game;
