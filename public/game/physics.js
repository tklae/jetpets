;(function(global) {
  global.Physics = function() {
    var physicsWorld = new Box2D.Dynamics.b2World(
      new Box2D.Common.Math.b2Vec2(0, 0),
      true
    )

    var physics2world = function(val) {
      return val * 30.0
    }

    var world2physics = function(val) {
      return val / 30.0
    }

    var SCALE = 2.0

    var createStaticBody = function(options) {
      options = $.extend({
        density: 1.0,
        friction: 0.5,
        restitution: 0.2
      }, options)

      ;['width', 'height', 'x', 'y'].forEach(function(opt) {
        if (typeof options[opt] === 'undefined') {
         throw 'No ' + opt + ' specified for static body'
        }
      })

      var fixDef = new Box2D.Dynamics.b2FixtureDef
      fixDef.density = options.density
      fixDef.friction = options.friction
      fixDef.restitution = options.restitution
      fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape
      fixDef.shape.SetAsBox(world2physics(options.width / SCALE), world2physics(options.height / SCALE))
      
      var bodyDef = new Box2D.Dynamics.b2BodyDef
      bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody
      bodyDef.position.x = world2physics(options.x + (options.width / SCALE))
      bodyDef.position.y = world2physics(options.y + (options.height / SCALE))

      var physicsBody = physicsWorld.CreateBody(bodyDef)
      physicsBody.CreateFixture(fixDef)
      return physicsBody
    }

    var createDynamicBody = function(options) {
      options = $.extend({
        density: 1.0,
        friction: 0.5,
        restitution: 0.2
      }, options)

      ;['width', 'height', 'x', 'y'].forEach(function(opt) {
        if (typeof options[opt] === 'undefined') {
         throw 'No ' + opt + ' specified for static body'
        }
      })

      var fixDef = new Box2D.Dynamics.b2FixtureDef
      fixDef.density = options.density
      fixDef.friction = options.friction
      fixDef.restitution = options.restitution
      fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape
      fixDef.shape.SetAsBox(world2physics(options.width / SCALE), world2physics(options.height / SCALE))

      var bodyDef = new Box2D.Dynamics.b2BodyDef
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody
      bodyDef.position.x = world2physics(options.x)
      bodyDef.position.y = world2physics(options.y)
      
      var physicsBody = physicsWorld.CreateBody(bodyDef)
      physicsBody.CreateFixture(fixDef)
      return physicsBody
    }

    return {
      createDynamicBody: createDynamicBody,
      createStaticBody: createStaticBody,
      physics2world: physics2world,
      debugDraw: function() {
        var debugDraw = new Box2D.Dynamics.b2DebugDraw()
        debugDraw.SetSprite($('#canvas2')[0].getContext("2d"))
        debugDraw.SetDrawScale(30.0)
        debugDraw.SetFillAlpha(0.3)
        debugDraw.SetLineThickness(1.0)
        debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit)
        physicsWorld.SetDebugDraw(debugDraw)
      },
      update: function() {
        physicsWorld.Step(
          1 / 60, // frame-rate
          10,     // velocity iterations
          10      // position iterations
        )
        physicsWorld.DrawDebugData()
        physicsWorld.ClearForces()
      }
    }
  }
})(window)