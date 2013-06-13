var GF          = require('../../engine/graphics-factory');
var Entity      = require('../../engine/entity');
var world       = require('../../engine/world');
var gameWorld   = require('../world');

function Background(image) {
  this.id = 'background';
  this.sprite = GF.animation([
    '/game/images/stadium.png',
    '/game/images/stadium-shake-right.png',
    '/game/images/stadium-shake-left.png'
  ], gameWorld.width, gameWorld.height);
}

Background.prototype = new Entity();

Background.prototype.shake = function(playerIndex) {
  this.sprite.gotoAndStop(playerIndex === 0 ? 1 : 2);
  setTimeout(function() {
    this.sprite.gotoAndStop(playerIndex === 0 ? 2 : 1);
  }.bind(this), 50);
  setTimeout(function() {
    this.sprite.gotoAndStop(0);
  }.bind(this), 100);
};

module.exports = Background;
