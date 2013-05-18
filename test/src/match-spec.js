var match = require(SRC + '/match.js');
var bridge = require(SRC + '/bridge.js');

var lobby = {
  state: function() {
    return {
      players: [{id: '1'}, {id: '2'}]
    };
  }
};

describe('Match', function() {
  
  beforeEach(function() {
    sinon.stub(bridge, 'send', function() { /* noop */ });
  });
  
  afterEach(function() {
    bridge.send.restore();
  });
  
  it("starts with 2 players from the lobby", function() {
    var m = match.create(lobby);
    sinon.assert.calledWith(bridge.send, 'match-start', [{id: '1'}, {id: '2'}]);
  });
  
  it("can tell if a player is in the match", function() {
    var m = match.create(lobby);
    m.hasPlayer({id: '1'}).should.eql(true);
    m.hasPlayer({id: '3'}).should.eql(false);
  });
  
  it("can send actions to the game engine", function() {
    var m = match.create(lobby);
    bridge.send.reset();
    m.send({id: '1'}, 'up');
    sinon.assert.called(bridge.send);
    bridge.send.lastCall.args[0].should.eql('match-move');
  });
  
  it("ignores actions from invalid players", function() {
    var m = match.create(lobby);
    bridge.send.reset();
    m.send({id: '3'}, 'up');
    sinon.assert.notCalled(bridge.send);
  });
  
});
