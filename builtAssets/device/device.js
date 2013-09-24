;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
var routie = require('../../3rdparty/routie');
var tappable = require('../../3rdparty/tappable');
var player = require('./player');

window.Device = function() {
  
  routie({
      '':            require('./controllers/register'),
      '/register':   require('./controllers/register'),
      '/wait':       require('./controllers/wait'),
      '/join':       require('./controllers/join'),
      '/lobby':      require('./controllers/lobby'),
      '/gamepad':    require('./controllers/gamepad'),
      '/thanks':     require('./controllers/thanks')
  });
  
  $('#menu').on('click', function() {
    if (window.confirm('disconnect player?')) {
      player.reset();
      routie.navigate('/');
    }
  });
  
};

},{"../../3rdparty/routie":2,"../../3rdparty/tappable":3,"./player":4,"./controllers/register":5,"./controllers/wait":6,"./controllers/join":7,"./controllers/lobby":8,"./controllers/gamepad":9,"./controllers/thanks":10}],3:[function(require,module,exports){
(function(){(function(root, factory){
  // Set up Tappable appropriately for the environment.
  if (typeof define === 'function' && define.amd){
    // AMD
    define('tappable', [], function(){
      factory(root, window.document);
      return root.tappable;
    });
  } else {
    // Browser global scope
    factory(root, window.document);
  }
}(this, function(w, d){

  var abs = Math.abs,
    noop = function(){},
    defaults = {
      noScroll: false,
      activeClass: 'tappable-active',
      onTap: noop,
      onStart: noop,
      onMove: noop,
      onMoveOut: noop,
      onMoveIn: noop,
      onEnd: noop,
      onCancel: noop,
      allowClick: false,
      boundMargin: 50,
      noScrollDelay: 0,
      activeClassDelay: 0,
      inactiveClassDelay: 0
    },
    supportTouch = 'ontouchend' in document,
    events = {
      start: supportTouch ? 'touchstart' : 'mousedown',
      move: supportTouch ? 'touchmove' : 'mousemove',
      end: supportTouch ? 'touchend' : 'mouseup'
    },
    getTargetByCoords = function(x, y){
      var el = d.elementFromPoint(x, y);
      if (el.nodeType == 3) el = el.parentNode;
      return el;
    },
    getTarget = function(e){
      var el = e.target;
      if (el) {
        if (el.nodeType == 3) el = el.parentNode;
        return el;
      }
      var touch = e.targetTouches[0];
      return getTargetByCoords(touch.clientX, touch.clientY);
    },
    clean = function(str){
      return str.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    },
    addClass = function(el, className){
      if (!className) return;
      if (el.classList){
        el.classList.add(className);
        return;
      }
      if (clean(el.className).indexOf(className) > -1) return;
      el.className = clean(el.className + ' ' + className);
    },
    removeClass = function(el, className){
      if (!className) return;
      if (el.classList){
        el.classList.remove(className);
        return;
      }
      el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
    },
    matchesSelector = function(node, selector){
      var root = d.documentElement,
        matches = root.matchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector || root.oMatchesSelector || root.msMatchesSelector;
      return matches.call(node, selector);
    },
    closest = function(node, selector){
      var matches = false;
      do {
        matches = matchesSelector(node, selector);
      } while (!matches && (node = node.parentNode) && node.ownerDocument);
      return matches ? node : false;
    };

  w.tappable = function(selector, opts){
    if (typeof opts == 'function') opts = { onTap: opts };
    var options = {};
    for (var key in defaults) options[key] = opts[key] || defaults[key];

    var el = options.containerElement || d.body,
      startTarget,
      prevTarget,
      startX,
      startY,
      elBound,
      cancel = false,
      moveOut = false,
      activeClass = options.activeClass,
      activeClassDelay = options.activeClassDelay,
      activeClassTimeout,
      inactiveClassDelay = options.inactiveClassDelay,
      inactiveClassTimeout,
      noScroll = options.noScroll,
      noScrollDelay = options.noScrollDelay,
      noScrollTimeout,
      boundMargin = options.boundMargin;

    var onStart = function(e){
      var target = closest(getTarget(e), selector);
      if (!target) return;

      if (activeClassDelay){
        clearTimeout(activeClassTimeout);
        activeClassTimeout = setTimeout(function(){
          addClass(target, activeClass);
        }, activeClassDelay);
      } else {
        addClass(target, activeClass);
      }
      if (inactiveClassDelay && target == prevTarget) clearTimeout(inactiveClassTimeout);

      startX = e.clientX;
      startY = e.clientY;
      if (!startX || !startY){
        var touch = e.targetTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      }
      startTarget = target;
      cancel = false;
      moveOut = false;
      elBound = noScroll ? target.getBoundingClientRect() : null;

      if (noScrollDelay){
        clearTimeout(noScrollTimeout);
        noScroll = false; // set false first, then true after a delay
        noScrollTimeout = setTimeout(function(){
          noScroll = true;
        }, noScrollDelay);
      }
      options.onStart.call(el, e, target);
    };

    var onMove = function(e){
      if (!startTarget) return;

      if (noScroll){
        e.preventDefault();
      } else {
        clearTimeout(activeClassTimeout);
      }

      var target = e.target,
        x = e.clientX,
        y = e.clientY;
      if (!target || !x || !y){ // The event might have a target but no clientX/Y
        var touch = e.changedTouches[0];
        if (!x) x = touch.clientX;
        if (!y) y = touch.clientY;
        if (!target) target = getTargetByCoords(x, y);
      }

      if (noScroll){
        if (x>elBound.left-boundMargin && x<elBound.right+boundMargin && y>elBound.top-boundMargin && y<elBound.bottom+boundMargin){ // within element's boundary
          moveOut = false;
          addClass(startTarget, activeClass);
          options.onMoveIn.call(el, e, target);
        } else {
          moveOut = true;
          removeClass(startTarget, activeClass);
          options.onMoveOut.call(el, e, target);
        }
      } else if (!cancel && abs(y - startY) > 10){
        cancel = true;
        removeClass(startTarget, activeClass);
        options.onCancel.call(target, e);
      }

      options.onMove.call(el, e, target);
    };

    var onEnd = function(e){
      if (!startTarget) return;

      clearTimeout(activeClassTimeout);
      if (inactiveClassDelay){
        if (activeClassDelay && !cancel) addClass(startTarget, activeClass);
        var activeTarget = startTarget;
        inactiveClassTimeout = setTimeout(function(){
          removeClass(activeTarget, activeClass);
        }, inactiveClassDelay);
      } else {
        removeClass(startTarget, activeClass);
      }

      options.onEnd.call(el, e, startTarget);

      var rightClick = e.which == 3 || e.button == 2;
      if (!cancel && !moveOut && !rightClick){
        options.onTap.call(el, e, startTarget);
      }

      prevTarget = startTarget;
      startTarget = null;
      setTimeout(function(){
        startX = startY = null;
      }, 400);
    };

    var onCancel = function(e){
      if (!startTarget) return;
      removeClass(startTarget, activeClass);
      startTarget = startX = startY = null;
      options.onCancel.call(el, e);
    };

    var onClick = function(e){
      var target = closest(e.target, selector);
      if (target){
        e.preventDefault();
      } else if (startX && startY && abs(e.clientX - startX) < 25 && abs(e.clientY - startY) < 25){
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener(events.start, onStart, false);

    el.addEventListener(events.move, onMove, false);

    el.addEventListener(events.end, onEnd, false);

    el.addEventListener('touchcancel', onCancel, false);

    if (!options.allowClick) el.addEventListener('click', onClick, false);

    return {
      el : el,
      destroy : function () {
        el.removeEventListener(events.start, onStart, false);
        el.removeEventListener(events.move, onMove, false);
        el.removeEventListener(events.end, onEnd, false);
        el.removeEventListener('touchcancel', onCancel, false);
        if (!options.allowClick) el.removeEventListener('click', onClick, false);

        return this;
      }
    };

  };

}));
})()
},{}],2:[function(require,module,exports){
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(window);
  } else if (typeof define === 'function' && define.amd) {
    define([], function () {
      return (root.routie = factory(window));
    });
  } else {
    root.routie = factory(window);
  }
}(this, function (w) {

  var routes = [];
  var map = {};
  var reference = "routie";
  var oldReference = w[reference];

  var Route = function(path, name) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
    this.regex = pathToRegexp(this.path, this.keys, false, false);

  };

  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };

  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

  Route.prototype.run = function(params) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      this.fns[i].apply(this, params);
    }
  };

  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);

    if (!m) return false;


    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  };

  Route.prototype.toURL = function(params) {
    var path = this.path;
    for (var param in params) {
      path = path.replace('/:'+param, '/'+params[param]);
    }
    path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
    if (path.indexOf(':') != -1) {
      throw new Error('missing parameters for url: '+path);
    }
    return path;
  };

  var pathToRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/\+/g, '__plus__')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name);
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  var routie = function(path, fn) {
    if (typeof fn == 'function') {
      addHandler(path, fn);
      routie.reload();
    } else if (typeof path == 'object') {
      for (var p in path) {
        addHandler(p, path[p]);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

  routie.removeAll = function() {
    map = {};
    routes = [];
  };

  routie.navigate = function(path, options) {
    options = options || {};
    var silent = options.silent || false;

    if (silent) {
      removeListener();
    }
    setTimeout(function() {
      window.location.hash = path;

      if (silent) {
        setTimeout(function() { 
          addListener();
        }, 1);
      }

    }, 1);
  };

  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      route.run(params);
      return true;
    }
    return false;
  };

  var hashChanged = routie.reload = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (checkRoute(hash, route)) {
        return;
      }
    }
  };

  var addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false);
    } else {
      w.attachEvent('onhashchange', hashChanged);
    }
  };

  var removeListener = function() {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged);
    } else {
      w.detachEvent('onhashchange', hashChanged);
    }
  };
  addListener();

  return routie;
}));

},{}],5:[function(require,module,exports){
var routie = require('../../../3rdparty/routie');
var player = require('../player');
var view = require('../../views/register-advanced.hbs');

module.exports = function() {
  
  if (player.get().id) {
    return routie.navigate('/wait');
  }
  
  $('#page').attr('class', 'register');
  $('#page').html(view());
  
  $('button').on('click', register);
  
};

function register(e) {
  var data = {
    firstName:    $('#firstName').val(),
    lastName:     $('#lastName').val(),
    company:      $('#company').val(),
    country:      $('#country').val(),
    role:         $('#role').val(),
    email:        $('#email').val()
  };
  console.log("FIELDS", data);
  $.ajax({
    type: 'POST',
    url: '/player',
    data: JSON.stringify(data),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8'
  }).then(go).fail(error);
  
  // $.post('/player', data).then(go).fail(error);
  return false
}

function go(data) {
  player.set({
    id: data.id,
    name: data.name
  });
  routie.navigate('/wait');
}

function error(res) {
  alert('Error: ' + res);
}

},{"../../views/register-advanced.hbs":11,"../../../3rdparty/routie":2,"../player":4}],7:[function(require,module,exports){
var routie = require('../../../3rdparty/routie');
var player = require('../player');
var view = require('../../views/join.hbs');

module.exports = function() {
  
  if (player.get().id == undefined) {
    routie.navigate('/connect');
  }
  
  $('#page').attr('class', 'join');
  $('#page').html(view());
  $('button').on('click', joinLobby);

};

function joinLobby(e) {
  e.preventDefault();
  var data = { playerId: player.get().id };
  $.post('/game/players', data).then(joined).fail(backToWait);
}

function joined(data) {
  routie.navigate('/lobby');
}

function backToWait() {
  routie.navigate('/wait');
}

},{"../../views/join.hbs":12,"../../../3rdparty/routie":2,"../player":4}],10:[function(require,module,exports){
var routie = require('../../../3rdparty/routie');
var view = require('../../views/thanks.hbs');

module.exports = function() {
  
  $('#page').attr('class', 'thanks');
  $('#page').html(view());
  
  setTimeout(function() {
    routie.navigate('/connect');
  }, 4000);
  
};

},{"../../views/thanks.hbs":13,"../../../3rdparty/routie":2}],4:[function(require,module,exports){
var _ = require('underscore');
var player = null;

var KEY = 'player';

exports.get = function() {
  if (!player) {
    load();
  }
  return player;
};

exports.set = function(attrs) {
  player = _.extend(player || {}, attrs);
  save();
};

exports.reset = function() {
  player = null;
  window.localStorage.removeItem(KEY);
};

function load() {
  player = JSON.parse(window.localStorage.getItem(KEY) || '{}');
}

function save() {
  window.localStorage.setItem(KEY, JSON.stringify(player));
}

},{"underscore":14}],14:[function(require,module,exports){
(function(){//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

})()
},{}],6:[function(require,module,exports){
var rx = require('rxjs');
var routie = require('../../../3rdparty/routie');
var player = require('../player');
var view = require('../../views/wait.hbs');
require('../../../3rdparty/rx.zepto');

module.exports = function() {
  
  if (player.get().id == undefined) {
    routie.navigate('/connect');
  }
  
  $('#page').attr('class', 'wait');
  $('#page').html(view());

  var observable = rx.Observable
    .interval(3000)
    .startWith(-1)
    .selectMany(observableLobby)
    .skipWhile(gameInProgress)
    .take(1)
    .subscribe(switchState, onError);

};

function observableLobby() {
  return $.getJSONAsObservable('/game/status');
}

function gameInProgress(res) {
  return res.data.inProgress === true;
}

function switchState() {
  routie.navigate('/join');
}

function onError() {
  console.log('Game not responding');
}

},{"../../views/wait.hbs":15,"../../../3rdparty/routie":2,"../player":4,"../../../3rdparty/rx.zepto":16,"rxjs":17}],8:[function(require,module,exports){
var rx = require('rxjs');
var routie = require('../../../3rdparty/routie');
var player = require('../player');
var view = require('../../views/lobby.hbs');
require('../../../3rdparty/rx.zepto');

module.exports = function() {
  
  if (player.get().id == undefined) {
    routie.navigate('/connect');
  }
  
  $('#page').attr('class', 'lobby');
  $('#page').html(view());
  $('#cancel').on('click', exitLobby);

  var observable = rx.Observable
    .interval(1000)
    .startWith(-1)
    .selectMany(observableLobby)
    .skipWhile(waitingForOtherPlayer)
    .take(1)
    .subscribe(startMatch, onError);

};

function observableLobby() {
  return $.getJSONAsObservable('/game/status');
}

function waitingForOtherPlayer(res) {
  return res.data.inProgress === false;
}

function startMatch() {
  routie.navigate('/gamepad');
}

function onError() {
  console.log('Game not responding');
}

function exitLobby() {
  $.ajax({
    type: 'DELETE',
    url: '/game/players/' + player.get().id
  }).then(backToWait);
}

function backToWait() {
  routie.navigate('/wait');
}

},{"../../views/lobby.hbs":18,"../../../3rdparty/routie":2,"../player":4,"../../../3rdparty/rx.zepto":16,"rxjs":17}],9:[function(require,module,exports){
var rx = require('rxjs');
var routie = require('../../../3rdparty/routie');
var player = require('../player');
var view = require('../../views/gamepad.hbs');
var observable = null;
var socket = null

module.exports = function() {

  if (player.get().id == undefined) {
    routie.navigate('/connect');
  }

  socket = io.connect('/')
  
  $('#page').attr('class', 'gamepad');
  $('#page').html(view());

  observable = rx.Observable
    .interval(2000)
    .startWith(-1)
    .selectMany(observableGame)
    .subscribe(checkGameStatus, onError);

  if ('ontouchstart' in window) {
    $('.button.up').on('touchstart', goUp);
    $('.button.up').on('touchend', stop);
    $('.button.down').on('touchstart', goDown);
    $('.button.down').on('touchend', stop);
  } else {
    $('.button.up').on('mousedown', goUp);
    $('.button.up').on('mouseup', stop);
    $('.button.down').on('mousedown', goDown);
    $('.button.down').on('mouseup', stop);
  }
  
};

function goUp(e) {
  e.preventDefault();
  $(e.currentTarget).addClass('pressed');
  sendAction('up');
}

function goDown(e) {
  e.preventDefault();
  $(e.currentTarget).addClass('pressed');
  sendAction('down');
}

function stop(e) {
  e.preventDefault();
  $(e.currentTarget).removeClass('pressed');
}

function sendAction(actionName) {
  socket.emit('move', { player: player.get().id, action: actionName })
}

function observableGame() {
  return $.getJSONAsObservable('/game/status');
}

function checkGameStatus(res) {
  if (res.data.inProgress) {
    var idx = currentPlayerIndex(res.data.players);
    if (idx === null) {
      observable.dispose();
      routie.navigate('/wait');
    } else {
      $('#page .player').addClass('p' + (idx+1));
    }
  } else {
    observable.dispose();
    routie.navigate('/join');
  }
}

function currentPlayerIndex(players) {
  if (players[0].id === player.get().id) return 0;
  if (players[1].id === player.get().id) return 1;
  return null;
}

function onError() {
  console.log('Game not responding');
}

},{"../../views/gamepad.hbs":19,"../../../3rdparty/routie":2,"../player":4,"rxjs":17}],16:[function(require,module,exports){
(function(){// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.
(function (root, factory) {
    module.exports = factory(root, module.exports, require('rxjs'), $);
}(this, function (global, exp, root, $, undefined) {
        // Headers
    var root = global.Rx,
        observable = root.Observable,
        observableProto = observable.prototype,
        AsyncSubject = root.AsyncSubject,
        observableCreate = observable.create,
        observableCreateWithDisposable = observable.createWithDisposable,
        disposableEmpty = root.Disposable.empty,
        slice = Array.prototype.slice,
        proto = $.fn;
        
    $.Deferred.prototype.toObservable = function () {
        var subject = new AsyncSubject();
        this.done(function () {
            subject.onNext(slice.call(arguments));
            subject.onCompleted();
        }).fail(function () {
            subject.onError(slice.call(arguments));
        });
        return subject;
    };

    observableProto.toDeferred = function () {
        var deferred = $.Deferred();
        this.subscribe(function (value) {
            deferred.resolve(value);
        }, function (e) { 
            deferred.reject(e);
        });
        return deferred;
    };

    var ajaxAsObservable = $.ajaxAsObservable = function(settings) {
        var subject = new AsyncSubject();

        var internalSettings = {
            success: function(data, textStatus, jqXHR) {
                subject.onNext({ data: data, textStatus: textStatus, jqXHR: jqXHR });
                subject.onCompleted();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                subject.onError({ jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown });
            }
        };
        
        $.extend(true, internalSettings, settings);

        $.ajax(internalSettings);

        return subject;
    };

    $.getAsObservable = function(url, data, dataType) {
        return ajaxAsObservable({ url: url, dataType: dataType, data: data });
    };

    $.getJSONAsObservable = function(url, data) {
        return ajaxAsObservable({ url: url, dataType: 'json', data: data });
    };


    $.postAsObservable = function(url, data, dataType) {
        return ajaxAsObservable({ url: url, dataType: dataType, data: data, type: 'POST'});	
    };

    return root;

}));

})()
},{"rxjs":17}],11:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<h1>Register To Play</h1>\n\n<form>\n  \n  <div class=\"field\">\n    <label>First name</label>\n    <input id=\"firstName\" type=\"text\" value=\"\" autocorrect=\"off\" />\n  </div>\n  \n  <div class=\"field\">\n    <label>Last name</label>\n    <input id=\"lastName\" type=\"text\" value=\"\" autocorrect=\"off\" />\n  </div>\n\n  <div class=\"field\">\n    <label>Email</label>\n    <input id=\"email\" type=\"email\" value=\"\" autocorrect=\"off\" />\n  </div>\n  \n  <div class=\"field\">\n    <label>Company</label>\n    <input id=\"company\" type=\"text\" value=\"\" autocorrect=\"off\" />\n  </div>\n  \n  <div class=\"field\">\n    <label>Role</label>\n	<select required id=\"role\">\n	<option value=\"Select Role\" selected>Select Role</option>\n	<option value=\"C-Level Executive\">C-Level Executive</option>\n	<option value=\"VP or Director\">VP or Director</option>\n	<option value=\"Manager\">Manager</option>\n	<option value=\"Project Manager\">Project Manager</option>\n	<option value=\"Team Lead\">Team Lead</option>\n	<option value=\"Architect\">Architect</option>\n	<option value=\"Developer\">Developer</option>\n	<option value=\"Consultant\">Consultant</option>\n	<option value=\"Student\">Student</option>\n	<option value=\"Press/Analyst\">Press/Analyst</option>\n	</select>\n  </div>\n\n  <div class=\"field\">\n    <label>Country</label>\n	<select required id=\"country\">\n	<option value=\"Select Country\" selected>Select Country</option>\n	<option value=\"DK\">Denmark</option>\n	<option value=\"GB\">United Kingdom</option>\n	<option value=\"AL\">Albania</option>\n	<option value=\"AD\">Andorra</option>\n	<option value=\"AT\">Austria</option>\n	<option value=\"BY\">Belarus</option>\n	<option value=\"BE\">Belgium</option>\n	<option value=\"BA\">Bosnia and Herzegovina</option>\n	<option value=\"BG\">Bulgaria</option>\n	<option value=\"HR\">Croatia</option>\n	<option value=\"CY\">Cyprus</option>\n	<option value=\"CZ\">Czech Republic</option>\n	<option value=\"EE\">Estonia</option>\n	<option value=\"FI\">Finland</option>\n	<option value=\"FR\">France</option>\n	<option value=\"DE\">Germany</option>\n	<option value=\"GR\">Greece</option>\n	<option value=\"HU\">Hungary</option>\n	<option value=\"IS\">Iceland</option>\n	<option value=\"IE\">Ireland</option>\n	<option value=\"IT\">Italy</option>\n	<option value=\"LV\">Latvia</option>\n	<option value=\"LI\">Liechtenstein</option>\n	<option value=\"LT\">Lithuania</option>\n	<option value=\"LU\">Luxembourg</option>\n	<option value=\"Macedonia\">Macedonia</option>\n	<option value=\"MT\">Malta</option>\n	<option value=\"Moldova\">Moldova</option>\n	<option value=\"MC\">Monaco</option>\n	<option value=\"ME\">Montenegro</option>\n	<option value=\"NL\">Netherlands</option>\n	<option value=\"NO\">Norway</option>\n	<option value=\"PL\">Poland</option>\n	<option value=\"PT\">Portugal</option>\n	<option value=\"RO\">Romania</option>\n	<option value=\"RS\">Serbia</option>\n	<option value=\"SK\">Slovakia</option>\n	<option value=\"SI\">Slovenia</option>\n	<option value=\"ES\">Spain</option>\n	<option value=\"SE\">Sweden</option>\n	<option value=\"CH\">Switzerland</option>\n	<option value=\"TR\">Turkey</option>\n	<option value=\"UA\">Ukraine</option>\n	<option value=\"AF\">Afghanistan</option>\n	<option value=\"AX\">Åland Islands</option>\n	<option value=\"DZ\">Algeria</option>\n	<option value=\"AS\">American Samoa</option>\n	<option value=\"AO\">Angola</option>\n	<option value=\"AI\">Anguilla</option>\n	<option value=\"AQ\">Antarctica</option>\n	<option value=\"AG\">Antigua and Barbuda</option>\n	<option value=\"AR\">Argentina</option>\n	<option value=\"AM\">Armenia</option>\n	<option value=\"AW\">Aruba</option>\n	<option value=\"AU\">Australia</option>\n	<option value=\"AZ\">Azerbaijan</option>\n	<option value=\"BS\">Bahamas</option>\n	<option value=\"BH\">Bahrain</option>\n	<option value=\"BD\">Bangladesh</option>\n	<option value=\"BB\">Barbados</option>\n	<option value=\"BZ\">Belize</option>\n	<option value=\"BJ\">Benin</option>\n	<option value=\"BM\">Bermuda</option>\n	<option value=\"BT\">Bhutan</option>\n	<option value=\"Bolivia\">Bolivia</option>\n	<option value=\"BW\">Botswana</option>\n	<option value=\"BV\">Bouvet Island</option>\n	<option value=\"BR\">Brazil</option>\n	<option value=\"BN\">Brunei Darussalam</option>\n	<option value=\"CU\">Cuba</option>\n	<option value=\"DJ\">Djibouti</option>\n	<option value=\"DM\">Dominica</option>\n	<option value=\"DO\">Dominican Republic</option>\n	<option value=\"EC\">Ecuador</option>\n	<option value=\"EG\">Egypt</option>\n	<option value=\"SV\">El Salvador</option>\n	<option value=\"GQ\">Equatorial Guinea</option>\n	<option value=\"ER\">Eritrea</option>\n	<option value=\"GF\">French Guiana</option>\n	<option value=\"PF\">French Polynesia</option>\n	<option value=\"GA\">Gabon</option>\n	<option value=\"GM\">Gambia</option>\n	<option value=\"GE\">Georgia</option>\n	<option value=\"GH\">Ghana</option>\n	<option value=\"GI\">Gibraltar</option>\n	<option value=\"GL\">Greenland</option>\n	<option value=\"GD\">Grenada</option>\n	<option value=\"GP\">Guadeloupe</option>\n	<option value=\"GU\">Guam</option>\n	<option value=\"GT\">Guatemala</option>\n	<option value=\"GG\">Guernsey</option>\n	<option value=\"GN\">Guinea</option>\n	<option value=\"GW\">Guinea-Bissau</option>\n	<option value=\"GY\">Guyana</option>\n	<option value=\"HT\">Haiti</option>\n	<option value=\"HN\">Honduras</option>\n	<option value=\"HK\">Hong Kong</option>\n	<option value=\"IN\">India</option>\n	<option value=\"ID\">Indonesia</option>\n	<option value=\"Iran\">Iran</option>\n	<option value=\"IQ\">Iraq</option>\n	<option value=\"IM\">Isle of Man</option>\n	<option value=\"IL\">Israel</option>\n	<option value=\"JM\">Jamaica</option>\n	<option value=\"JP\">Japan</option>\n	<option value=\"JE\">Jersey</option>\n	<option value=\"JO\">Jordan</option>\n	<option value=\"KZ\">Kazakhstan</option>\n	<option value=\"KE\">Kenya</option>\n	<option value=\"KI\">Kiribati</option>\n	<option value=\"Korea\">Republic of Korea</option>\n	<option value=\"Korea\">Democratic People's Republic of Korea</option>\n	<option value=\"KW\">Kuwait</option>\n	<option value=\"KG\">Kyrgyzstan</option>\n	<option value=\"LA\">Laos</option>\n	<option value=\"LB\">Lebanon</option>\n	<option value=\"LS\">Lesotho</option>\n	<option value=\"LR\">Liberia</option>\n	<option value=\"LY\">Libyan Arab Jamahiriya</option>\n	<option value=\"MO\">Macao</option>\n	<option value=\"MG\">Madagascar</option>\n	<option value=\"MW\">Malawi</option>\n	<option value=\"MY\">Malaysia</option>\n	<option value=\"MV\">Maldives</option>\n	<option value=\"ML\">Mali</option>\n	<option value=\"MH\">Marshall Islands</option>\n	<option value=\"MQ\">Martinique</option>\n	<option value=\"MR\">Mauritania</option>\n	<option value=\"MU\">Mauritius</option>\n	<option value=\"YT\">Mayotte</option>\n	<option value=\"MX\">Mexico</option>\n	<option value=\"Micronesia\">Micronesia</option>\n	<option value=\"MN\">Mongolia</option>\n	<option value=\"MS\">Montserrat</option>\n	<option value=\"MA\">Morocco</option>\n	<option value=\"MZ\">Mozambique</option>\n	<option value=\"MM\">Myanmar</option>\n	<option value=\"NA\">Namibia</option>\n	<option value=\"NR\">Nauru</option>\n	<option value=\"NP\">Nepal</option>\n	<option value=\"AN\">Netherlands Antilles</option>\n	<option value=\"NC\">New Caledonia</option>\n	<option value=\"NZ\">New Zealand</option>\n	<option value=\"NI\">Nicaragua</option>\n	<option value=\"NE\">Niger</option>\n	<option value=\"NG\">Nigeria</option>\n	<option value=\"NU\">Niue</option>\n	<option value=\"NF\">Norfolk Island</option>\n	<option value=\"MP\">Northern Mariana Islands</option>\n	<option value=\"OM\">Oman</option>\n	<option value=\"PK\">Pakistan</option>\n	<option value=\"PW\">Palau</option>\n	<option value=\"Palestine\">Palestine</option>\n	<option value=\"PA\">Panama</option>\n	<option value=\"PG\">Papua New Guinea</option>\n	<option value=\"PY\">Paraguay</option>\n	<option value=\"PE\">Peru</option>\n	<option value=\"PH\">Philippines</option>\n	<option value=\"PN\">Pitcairn</option>\n	<option value=\"PR\">Puerto Rico</option>\n	<option value=\"QA\">Qatar</option>\n	<option value=\"RE\">Réunion</option>\n	<option value=\"RU\">Russian Federation</option>\n	<option value=\"RW\">Rwanda</option>\n	<option value=\"BL\">Saint Barthélemy</option>\n	<option value=\"SH\">Saint Helena</option>\n	<option value=\"KN\">Saint Kitts and Nevis</option>\n	<option value=\"LC\">Saint Lucia</option>\n	<option value=\"MF\">Saint Martin</option>\n	<option value=\"PM\">Saint Pierre and Miquelon</option>\n	<option value=\"VC\">Saint Vincent and The Grenadines</option>\n	<option value=\"WS\">Samoa</option>\n	<option value=\"SM\">San Marino</option>\n	<option value=\"ST\">Sao Tome and Principe</option>\n	<option value=\"SA\">Saudi Arabia</option>\n	<option value=\"SN\">Senegal</option>\n	<option value=\"SC\">Seychelles</option>\n	<option value=\"SL\">Sierra Leone</option>\n	<option value=\"SG\">Singapore</option>\n	<option value=\"SB\">Solomon Islands</option>\n	<option value=\"SO\">Somalia</option>\n	<option value=\"ZA\">South Africa</option>\n	<option value=\"LK\">Sri Lanka</option>\n	<option value=\"SD\">Sudan</option>\n	<option value=\"SR\">Suriname</option>\n	<option value=\"SJ\">Svalbard and Jan Mayen</option>\n	<option value=\"SZ\">Swaziland</option>\n	<option value=\"Taiwan\">Taiwan</option>\n	<option value=\"TJ\">Tajikistan</option>\n	<option value=\"Tanzania\">Tanzania</option>\n	<option value=\"TH\">Thailand</option>\n	<option value=\"TL\">Timor-Leste</option>\n	<option value=\"TG\">Togo</option>\n	<option value=\"TK\">Tokelau</option>\n	<option value=\"TO\">Tonga</option>\n	<option value=\"TT\">Trinidad and Tobago</option>\n	<option value=\"TN\">Tunisia</option>\n	<option value=\"TM\">Turkmenistan</option>\n	<option value=\"TC\">Turks and Caicos Islands</option>\n	<option value=\"TV\">Tuvalu</option>\n	<option value=\"UG\">Uganda</option>\n	<option value=\"AE\">United Arab Emirates</option>\n	<option value=\"US\">United States</option>\n	<option value=\"UY\">Uruguay</option>\n	<option value=\"UZ\">Uzbekistan</option>\n	<option value=\"VU\">Vanuatu</option>\n	<option value=\"VA\">Vatican</option>\n	<option value=\"Venezuela\">Venezuela</option>\n	<option value=\"VN\">Viet Nam</option>\n	<option value=\"Virgin Islands\">Virgin Islands</option>\n	<option value=\"Virgin Islands\">Virgin Islands</option>\n	<option value=\"VI\">U.S.</option>\n	<option value=\"WF\">Wallis and Futuna</option>\n	<option value=\"EH\">Western Sahara</option>\n	<option value=\"YE\">Yemen</option>\n	<option value=\"ZM\">Zambia</option>\n	<option value=\"ZW\">Zimbabwe</option></select>\n  </div>\n  \n  <button>Play!</button>\n  \n</form>\n";
  });

},{"handlebars-runtime":20}],12:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<h1>Press start to join the game</h1>\n\n<button id=\"join\" ontouchstart=\"\">Start</button>\n";
  });

},{"handlebars-runtime":20}],15:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<h1>match in progress</h1>\n\n<p>\n  As soon as the current match is finished,\n  you'll be able to join the action!\n</p>\n";
  });

},{"handlebars-runtime":20}],13:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<h1>thanks for playing</h1>\n\n<p>\n  be sure to ask about what we do&hellip; <br />\n  and how we built this game\n</p>\n";
  });

},{"handlebars-runtime":20}],19:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"player\">\n \n  <div class=\"landscape\">\n    <div class=\"row\">\n      <div class=\"button up\"><i>UP</i></div>\n      <div class=\"button down\"><i>DOWN</i></div>\n    </div>\n  </div>\n \n  <div class=\"portrait\">\n    <div class=\"row\">\n      <div class=\"button up\"><i>UP</i></div>\n    </div>\n    <div class=\"row\">\n      <div class=\"button down\"><i>DOWN</i></div>\n    </div>\n  </div>\n\n</div>\n";
  });

},{"handlebars-runtime":20}],18:[function(require,module,exports){
var Handlebars = require('handlebars-runtime');
module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n<h1>waiting for 2nd player</h1>\n\n<button id=\"cancel\" ontouchstart=\"\">cancel</button>\n";
  });

},{"handlebars-runtime":20}],20:[function(require,module,exports){
/*

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

// lib/handlebars/browser-prefix.js
var Handlebars = {};
module.exports = Handlebars;

(function(Handlebars, undefined) {
;
// lib/handlebars/base.js

Handlebars.VERSION = "1.0.0";
Handlebars.COMPILER_REVISION = 4;

Handlebars.REVISION_CHANGES = {
  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
  2: '== 1.0.0-rc.3',
  3: '== 1.0.0-rc.4',
  4: '>= 1.0.0'
};

Handlebars.helpers  = {};
Handlebars.partials = {};

var toString = Object.prototype.toString,
    functionType = '[object Function]',
    objectType = '[object Object]';

Handlebars.registerHelper = function(name, fn, inverse) {
  if (toString.call(name) === objectType) {
    if (inverse || fn) { throw new Handlebars.Exception('Arg not supported with multiple helpers'); }
    Handlebars.Utils.extend(this.helpers, name);
  } else {
    if (inverse) { fn.not = inverse; }
    this.helpers[name] = fn;
  }
};

Handlebars.registerPartial = function(name, str) {
  if (toString.call(name) === objectType) {
    Handlebars.Utils.extend(this.partials,  name);
  } else {
    this.partials[name] = str;
  }
};

Handlebars.registerHelper('helperMissing', function(arg) {
  if(arguments.length === 2) {
    return undefined;
  } else {
    throw new Error("Missing helper: '" + arg + "'");
  }
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
  var inverse = options.inverse || function() {}, fn = options.fn;

  var type = toString.call(context);

  if(type === functionType) { context = context.call(this); }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      return Handlebars.helpers.each(context, options);
    } else {
      return inverse(this);
    }
  } else {
    return fn(context);
  }
});

Handlebars.K = function() {};

Handlebars.createFrame = Object.create || function(object) {
  Handlebars.K.prototype = object;
  var obj = new Handlebars.K();
  Handlebars.K.prototype = null;
  return obj;
};

Handlebars.logger = {
  DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

  methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

  // can be overridden in the host environment
  log: function(level, obj) {
    if (Handlebars.logger.level <= level) {
      var method = Handlebars.logger.methodMap[level];
      if (typeof console !== 'undefined' && console[method]) {
        console[method].call(console, obj);
      }
    }
  }
};

Handlebars.log = function(level, obj) { Handlebars.logger.log(level, obj); };

Handlebars.registerHelper('each', function(context, options) {
  var fn = options.fn, inverse = options.inverse;
  var i = 0, ret = "", data;

  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (options.data) {
    data = Handlebars.createFrame(options.data);
  }

  if(context && typeof context === 'object') {
    if(context instanceof Array){
      for(var j = context.length; i<j; i++) {
        if (data) { data.index = i; }
        ret = ret + fn(context[i], { data: data });
      }
    } else {
      for(var key in context) {
        if(context.hasOwnProperty(key)) {
          if(data) { data.key = key; }
          ret = ret + fn(context[key], {data: data});
          i++;
        }
      }
    }
  }

  if(i === 0){
    ret = inverse(this);
  }

  return ret;
});

Handlebars.registerHelper('if', function(conditional, options) {
  var type = toString.call(conditional);
  if(type === functionType) { conditional = conditional.call(this); }

  if(!conditional || Handlebars.Utils.isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

Handlebars.registerHelper('unless', function(conditional, options) {
  return Handlebars.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn});
});

Handlebars.registerHelper('with', function(context, options) {
  var type = toString.call(context);
  if(type === functionType) { context = context.call(this); }

  if (!Handlebars.Utils.isEmpty(context)) return options.fn(context);
});

Handlebars.registerHelper('log', function(context, options) {
  var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
  Handlebars.log(level, context);
});
;
// lib/handlebars/utils.js

var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

Handlebars.Exception = function(message) {
  var tmp = Error.prototype.constructor.apply(this, arguments);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (var idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }
};
Handlebars.Exception.prototype = new Error();

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

var escape = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "`": "&#x60;"
};

var badChars = /[&<>"'`]/g;
var possible = /[&<>"'`]/;

var escapeChar = function(chr) {
  return escape[chr] || "&amp;";
};

Handlebars.Utils = {
  extend: function(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  },

  escapeExpression: function(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof Handlebars.SafeString) {
      return string.toString();
    } else if (string == null || string === false) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = string.toString();

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  },

  isEmpty: function(value) {
    if (!value && value !== 0) {
      return true;
    } else if(toString.call(value) === "[object Array]" && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
};
;
// lib/handlebars/runtime.js

Handlebars.VM = {
  template: function(templateSpec) {
    // Just add water
    var container = {
      escapeExpression: Handlebars.Utils.escapeExpression,
      invokePartial: Handlebars.VM.invokePartial,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = Handlebars.VM.program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = Handlebars.VM.program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common) {
          ret = {};
          Handlebars.Utils.extend(ret, common);
          Handlebars.Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: Handlebars.VM.programWithDepth,
      noop: Handlebars.VM.noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var result = templateSpec.call(container, Handlebars, context, options.helpers, options.partials, options.data);

      var compilerInfo = container.compilerInfo || [],
          compilerRevision = compilerInfo[0] || 1,
          currentRevision = Handlebars.COMPILER_REVISION;

      if (compilerRevision !== currentRevision) {
        if (compilerRevision < currentRevision) {
          var runtimeVersions = Handlebars.REVISION_CHANGES[currentRevision],
              compilerVersions = Handlebars.REVISION_CHANGES[compilerRevision];
          throw "Template was precompiled with an older version of Handlebars than the current runtime. "+
                "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").";
        } else {
          // Use the embedded version info since the runtime doesn't know about this revision yet
          throw "Template was precompiled with a newer version of Handlebars than the current runtime. "+
                "Please update your runtime to a newer version ("+compilerInfo[1]+").";
        }
      }

      return result;
    };
  },

  programWithDepth: function(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var program = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    program.program = i;
    program.depth = args.length;
    return program;
  },
  program: function(i, fn, data) {
    var program = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    program.program = i;
    program.depth = 0;
    return program;
  },
  noop: function() { return ""; },
  invokePartial: function(partial, name, context, helpers, partials, data) {
    var options = { helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Handlebars.Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    } else if (!Handlebars.compile) {
      throw new Handlebars.Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
    } else {
      partials[name] = Handlebars.compile(partial, {data: data !== undefined});
      return partials[name](context, options);
    }
  }
};

Handlebars.template = Handlebars.VM.template;
;
// lib/handlebars/browser-suffix.js
})(Handlebars);
;

},{}],17:[function(require,module,exports){
(function(global){require("./rx.min.js")(global);
require("./rx.aggregates.min.js")(global);
require("./rx.coincidence.min.js")(global);
require("./rx.joinpatterns.min.js")(global);
require("./rx.time.min.js")(global);

module.exports = Rx

})(window)
},{"./rx.min.js":21,"./rx.aggregates.min.js":22,"./rx.coincidence.min.js":23,"./rx.joinpatterns.min.js":24,"./rx.time.min.js":25}],21:[function(require,module,exports){
/*
 Copyright (c) Microsoft Corporation.  All rights reserved.
 This code is licensed by Microsoft Corporation under the terms
 of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
 See http://go.microsoft.com/fwlink/?LinkID=220762.
*/
module.exports = function(x,n){var m,ia=function(){},J=function(){return(new Date).getTime()},V=function(a,b){return a===b},Q=function(a){return a},W=function(a){return a.toString()},X=Object.prototype.hasOwnProperty,o=function(a,b){function c(){this.constructor=a}for(var d in b)X.call(b,d)&&(a[d]=b[d]);c.prototype=b.prototype;a.prototype=new c;a.base=b.prototype;return a},E=function(a,b){for(var c in b)X.call(b,c)&&(a[c]=b[c])},y=Array.prototype.slice,K="Object has been disposed";m=x.Rx={Internals:{}};m.VERSION="1.0.10621";var ja=function(a,b){return i(function(c){return new p(b.getDisposable(),a.subscribe(c))})},F=function(a,b,c){return i(function(d){var e=new v,g=new v,d=c(d,e,g);e.disposable(a.materialize().select(function(b){return{switchValue:function(a){return a(b)}}}).subscribe(d));g.disposable(b.materialize().select(function(b){return{switchValue:function(a,c){return c(b)}}}).subscribe(d));return new p(e,g)})},u=m.Internals.List=
function(){function a(b){this.comparer=b||V;this.size=0;this.items=[]}a.fromArray=function(b,c){var d,e=b.length,g=new a(c);for(d=0;d<e;d++)g.add(b[d]);return g};a.prototype.count=function(){return this.size};a.prototype.add=function(b){this.items[this.size]=b;this.size++};a.prototype.removeAt=function(b){if(0>b||b>=this.size)throw Error("Argument out of range");0===b?this.items.shift():this.items.splice(b,1);this.size--};a.prototype.indexOf=function(b){var a,d;for(a=0;a<this.items.length;a++)if(d=
this.items[a],this.comparer(b,d))return a;return-1};a.prototype.remove=function(b){b=this.indexOf(b);if(-1===b)return!1;this.removeAt(b);return!0};a.prototype.clear=function(){this.items=[];this.size=0};a.prototype.item=function(b,a){if(0>b||b>=count)throw Error("Argument out of range");if(a===n)return this.items[b];this.items[b]=a};a.prototype.toArray=function(){var b=[],a;for(a=0;a<this.items.length;a++)b.push(this.items[a]);return b};a.prototype.contains=function(b){for(var a=0;a<this.items.length;a++)if(this.comparer(b,
this.items[a]))return!0;return!1};return a}(),ka=function(){function a(b,a){this.id=b;this.value=a}a.prototype.compareTo=function(b){var a=this.value.compareTo(b.value);0===a&&(a=this.id-b.id);return a};return a}(),Y=function(){function a(b){this.items=Array(b);this.size=0}a.prototype.count=function(){return this.size};a.prototype.isHigherPriority=function(b,a){return 0>this.items[b].compareTo(this.items[a])};a.prototype.percolate=function(b){var a,d;if(!(b>=this.size||0>b))if(a=Math.floor((b-1)/
2),!(0>a||a===b)&&this.isHigherPriority(b,a))d=this.items[b],this.items[b]=this.items[a],this.items[a]=d,this.percolate(a)};a.prototype.heapify=function(b){var a,d,e;b===n&&(b=0);b>=this.size||0>b||(d=2*b+1,e=2*b+2,a=b,d<this.size&&this.isHigherPriority(d,a)&&(a=d),e<this.size&&this.isHigherPriority(e,a)&&(a=e),a!==b&&(d=this.items[b],this.items[b]=this.items[a],this.items[a]=d,this.heapify(a)))};a.prototype.peek=function(){return this.items[0].value};a.prototype.removeAt=function(b){this.items[b]=
this.items[--this.size];delete this.items[this.size];this.heapify();if(this.size<this.items.length>>2)for(var b=this.items,a=this.items=Array(this.items.length>>1),d=this.size;0<d;)a[d+0-1]=b[d+0-1],d--};a.prototype.dequeue=function(){var b=this.peek();this.removeAt(0);return b};a.prototype.enqueue=function(b){var c;if(this.size>=this.items.length){c=this.items;for(var d=this.items=Array(2*this.items.length),e=c.length;0<e;)d[e+0-1]=c[e+0-1],e--}c=this.size++;this.items[c]=new ka(a.count++,b);this.percolate(c)};
a.prototype.remove=function(b){var a;for(a=0;a<this.size;a++)if(this.items[a].value===b)return this.removeAt(a),!0;return!1};a.count=0;return a}(),p=m.CompositeDisposable=function(){function a(){var b=!1,a=u.fromArray(y.call(arguments));this.count=function(){return a.count()};this.add=function(d){b?d.dispose():a.add(d)};this.remove=function(d){var e=!1;b||(e=a.remove(d));e&&d.dispose();return e};this.dispose=function(){var d,e;b||(b=!0,d=a.toArray(),a.clear());if(d!==n)for(e=0;e<d.length;e++)d[e].dispose()};
this.clear=function(){var b,e;b=a.toArray();a.clear();for(e=0;e<b.length;e++)b[e].dispose()};this.contains=function(b){return a.contains(b)};this.isDisposed=function(){return b};this.toArray=function(){return a.toArray()}}a.prototype.count=function(){return this.count()};a.prototype.add=function(b){this.add(b)};a.prototype.remove=function(b){this.remove(b)};a.prototype.dispose=function(){this.dispose()};a.prototype.clear=function(){this.clear()};a.prototype.contains=function(b){return this.contains(b)};
a.prototype.isDisposed=function(){return this.isDisposed()};a.prototype.toArray=function(){return this.toArray()};return a}(),L=m.Disposable=function(){function a(b){var a=!1;this.dispose=function(){a||(b(),a=!0)}}a.prototype.dispose=function(){this.dispose()};return a}(),A=L.create=function(a){return new L(a)},w=L.empty=new L(function(){}),v=m.SingleAssignmentDisposable=function(){function a(){var b=!1,a=null;this.isDisposed=function(){return b};this.getDisposable=function(){return a};this.setDisposable=
function(d){if(null!==a)throw Error("Disposable has already been assigned");var e=b;e||(a=d);e&&null!==d&&d.dispose()};this.dispose=function(){var d=null;b||(b=!0,d=a,a=null);null!==d&&d.dispose()}}a.prototype.isDisposed=function(){return this.isDisposed()};a.prototype.disposable=function(b){if(b===n)return this.getDisposable();this.setDisposable(b)};a.prototype.dispose=function(){this.dispose()};return a}(),C=m.SerialDisposable=function(){function a(){var b=!1,a=null;this.isDisposed=function(){return b};
this.getDisposable=function(){return a};this.setDisposable=function(d){var e=b,g=null;e||(g=a,a=d);null!==g&&g.dispose();e&&null!==d&&d.dispose()};this.dispose=function(){var d=null;b||(b=!0,d=a,a=null);null!==d&&d.dispose()}}a.prototype.isDisposed=function(){return this.isDisposed()};a.prototype.disposable=function(a){if(a===n)return this.getDisposable();this.setDisposable(a)};a.prototype.dispose=function(){this.dispose()};a.prototype.dispose=function(){this.dispose()};return a}(),Z=m.RefCountDisposable=
function(){function a(a){var c=!1,d=!1,e=0;this.dispose=function(){var g=!1;!c&&!d&&(d=!0,0===e&&(g=c=!0));g&&a.dispose()};this.getDisposable=function(){if(c)return w;e++;var g=!1;return{dispose:function(){var h=!1;!c&&!g&&(g=!0,e--,0===e&&d&&(h=c=!0));h&&a.dispose()}}};this.isDisposed=function(){return c}}a.prototype.dispose=function(){this.dispose()};a.prototype.getDisposable=function(){return this.getDisposable()};a.prototype.isDisposed=function(){return this.isDisposed()};return a}(),R;R=function(){function a(a,
c,d,e,g){this.scheduler=a;this.state=c;this.action=d;this.dueTime=e;this.comparer=g||function(a,b){return a-b};this.disposable=new v}a.prototype.invoke=function(){return this.disposable.disposable(this.invokeCore())};a.prototype.compareTo=function(a){return this.comparer(this.dueTime,a.dueTime)};a.prototype.isCancelled=function(){return this.disposable.isDisposed()};a.prototype.invokeCore=function(){return this.action(this.scheduler,this.state)};return a}();var s=m.Scheduler=function(){function a(a,
b,c,d){this.now=a;this._schedule=b;this._scheduleRelative=c;this._scheduleAbsolute=d}var b=function(a,b){var c,d,e,k;d=new p;k=b.first;c=b.second;e=null;e=function(b){c(b,function(b){var c,h,l;l=h=!1;c=null;c=a.scheduleWithState(b,function(a,b){h?d.remove(c):l=!0;e(b);return w});l||(d.add(c),h=!0)})};e(k);return d},c=function(a,b){var c,d,e,k;d=new p;k=b.first;c=b.second;e=function(b){c(b,function(b,c){var h,l,k;k=l=!1;h=a.scheduleWithRelativeAndState(b,c,function(a,b){l?d.remove(h):k=!0;e(b);return w});
k||(d.add(h),l=!0)})};e(k);return d},d=function(a,b){var c,d,e,k;d=new p;k=b.first;c=b.second;e=function(b){c(b,function(b,c){var h=!1,l=!1,k=a.scheduleWithAbsoluteAndState(b,c,function(a,b){h?d.remove(k):l=!0;e(b);return w});l||(d.add(k),h=!0)})};e(k);return d},e=function(a,b){b();return w};a.prototype.schedule=function(a){return this._schedule(a,e)};a.prototype.scheduleWithState=function(a,b){return this._schedule(a,b)};a.prototype.scheduleWithRelative=function(a,b){return this._scheduleRelative(b,
a,e)};a.prototype.scheduleWithRelativeAndState=function(a,b,c){return this._scheduleRelative(a,b,c)};a.prototype.scheduleWithAbsolute=function(a,b){return this._scheduleAbsolute(b,a,e)};a.prototype.scheduleWithAbsoluteAndState=function(a,b,c){return this._scheduleAbsolute(a,b,c)};a.prototype.scheduleRecursive=function(a){return this.scheduleRecursiveWithState(a,function(a,b){a(function(){b(a)})})};a.prototype.scheduleRecursiveWithState=function(a,c){return this.scheduleWithState({first:a,second:c},
function(a,c){return b(a,c)})};a.prototype.scheduleRecursiveWithRelative=function(a,b){return this.scheduleRecursiveWithRelativeAndState(b,a,function(a,b){a(function(c){b(a,c)})})};a.prototype.scheduleRecursiveWithRelativeAndState=function(a,b,d){return this._scheduleRelative({first:a,second:d},b,function(a,b){return c(a,b)})};a.prototype.scheduleRecursiveWithAbsolute=function(a,b){return this.scheduleRecursiveWithAbsoluteAndState(b,a,function(a,b){a(function(c){b(a,c)})})};a.prototype.scheduleRecursiveWithAbsoluteAndState=
function(a,b,c){return this._scheduleAbsolute({first:a,second:c},b,function(a,b){return d(a,b)})};a.now=J;a.normalize=function(a){0>a&&(a=0);return a};return a}(),f=function(){function a(){var b=this;a.base.constructor.call(this,J,function(a,d){return d(b,a)},function(a,d,e){for(;0<s.normalize(d););return e(b,a)},function(a,d,e){return b.scheduleWithRelativeAndState(a,d-b.now(),e)})}o(a,s);return a}(),B=s.Immediate=new f,la=function(){function a(){M.queue=new Y(4)}a.prototype.dispose=function(){M.queue=
null};a.prototype.run=function(){for(var a,c=M.queue;0<c.count();)if(a=c.dequeue(),!a.isCancelled()){for(;0<a.dueTime-s.now(););a.isCancelled()||a.invoke()}};return a}(),M=function(){function a(){var b=this;a.base.constructor.call(this,J,function(a,d){return b.scheduleWithRelativeAndState(a,0,d)},function(c,d,e){var g=b.now()+s.normalize(d),d=a.queue,c=new R(b,c,e,g);if(null===d){e=new la;try{a.queue.enqueue(c),e.run()}finally{e.dispose()}}else d.enqueue(c);return c.disposable},function(a,d,e){return b.scheduleWithRelativeAndState(a,
d-b.now(),e)})}o(a,s);a.prototype.scheduleRequired=function(){return null===a.queue};a.prototype.ensureTrampoline=function(a){return this.scheduleRequired()?this.schedule(a):a()};a.queue=null;return a}(),D=s.CurrentThread=new M;m.VirtualTimeScheduler=function(){function a(b,c){var d=this;this.clock=b;this.comparer=c;this.isEnabled=!1;a.base.constructor.call(this,function(){return d.toDateTimeOffset(d.clock)},function(a,b){return d.scheduleAbsolute(a,d.clock,b)},function(a,b,c){return d.scheduleRelative(a,
d.toRelative(b),c)},function(a,b,c){return d.scheduleRelative(a,d.toRelative(b-d.now()),c)});this.queue=new Y(1024)}o(a,s);a.prototype.scheduleRelative=function(a,c,d){c=this.add(this.clock,c);return this.scheduleAbsolute(a,c,d)};a.prototype.start=function(){var a;if(!this.isEnabled){this.isEnabled=!0;do if(a=this.getNext(),null!==a){if(0<this.comparer(a.dueTime,this.clock))this.clock=a.dueTime;a.invoke()}else this.isEnabled=!1;while(this.isEnabled)}};a.prototype.stop=function(){return this.isEnabled=
!1};a.prototype.advanceTo=function(a){var c;if(0<=this.comparer(this.clock,a))throw Error("Argument out of range");if(!this.isEnabled){this.isEnabled=!0;do if(c=this.getNext(),null!==c&&0>=this.comparer(c.dueTime,a)){if(0<this.comparer(c.dueTime,this.clock))this.clock=c.dueTime;c.invoke()}else this.isEnabled=!1;while(this.isEnabled);return this.clock=a}};a.prototype.advanceBy=function(a){a=this.add(this.clock,a);if(0<=this.comparer(this.clock,a))throw Error("Argument out of range");return this.advanceTo(a)};
a.prototype.getNext=function(){for(var a;0<this.queue.count();)if(a=this.queue.peek(),a.isCancelled())this.queue.dequeue();else return a;return null};a.prototype.scheduleAbsolute=function(a,c,d){var e=this,g=new R(e,a,function(a,b){e.queue.remove(g);return d(a,b)},c,e.comparer);e.queue.enqueue(g);return g.disposable};return a}();var f=function(){function a(){var b=this;a.base.constructor.call(this,J,function(a,d){var e=x.setTimeout(function(){d(b,a)},0);return A(function(){x.clearTimeout(e)})},function(a,
d,e){var g,d=s.normalize(d);g=x.setTimeout(function(){e(b,a)},d);return A(function(){x.clearTimeout(g)})},function(a,d,e){return b.scheduleWithRelativeAndState(a,d-b.now(),e)})}o(a,s);return a}(),ma=s.Timeout=new f,t=m.Notification=function(){function a(){}a.prototype.accept=function(a,c,d){return 1<arguments.length||"function"===typeof a?this._accept(a,c,d):this._acceptObservable(a)};a.prototype.toObservable=function(a){var c=this,a=a||s.Immediate;return i(function(d){return a.schedule(function(){c._acceptObservable(d);
if("N"===c.kind)d.onCompleted()})})};a.prototype.hasValue=!1;a.prototype.equals=function(a){return this.toString()===(a===n||null===a?"":a.toString())};return a}();t.createOnNext=function(a){var b=new t;b.value=a;b.hasValue=!0;b.kind="N";b._accept=function(a){return a(this.value)};b._acceptObservable=function(a){return a.onNext(this.value)};b.toString=function(){return"OnNext("+this.value+")"};return b};t.createOnError=function(a){var b=new t;b.exception=a;b.kind="E";b._accept=function(a,b){return b(this.exception)};
b._acceptObservable=function(a){return a.onError(this.exception)};b.toString=function(){return"OnError("+this.exception+")"};return b};t.createOnCompleted=function(){var a=new t;a.kind="C";a._accept=function(a,c,d){return d()};a._acceptObservable=function(a){return a.onCompleted()};a.toString=function(){return"OnCompleted()"};return a};var G=function(){},f=G.prototype;f.concat=function(){var a=this;return i(function(b){var c,d=a.getEnumerator(),e=!1,g=new C;c=B.scheduleRecursive(function(a){var c,
z,q=!1;if(!e){try{if(q=d.moveNext())c=d.current}catch(k){z=k}if(void 0!==z)b.onError(z);else if(q)z=new v,g.disposable(z),z.disposable(c.subscribe(function(a){b.onNext(a)},function(a){b.onError(a)},function(){a()}));else b.onCompleted()}});return new p(g,c,A(function(){e=!0}))})};f.catchException=function(){var a=this;return i(function(b){var c,d=a.getEnumerator(),e=!1,g,h;g=new C;c=B.scheduleRecursive(function(a){var c,q,k;k=!1;if(!e){try{if(k=d.moveNext())c=d.current}catch(f){q=f}if(void 0!==q)b.onError(q);
else if(k)q=new v,g.disposable(q),q.disposable(c.subscribe(function(a){b.onNext(a)},function(b){h=b;a()},function(){b.onCompleted()}));else if(void 0!==h)b.onError(h);else b.onCompleted()}});return new p(g,c,A(function(){e=!0}))})};var $=G.repeat=function(a,b){b===n&&(b=-1);var c=new G;c.getEnumerator=function(){return{left:b,current:null,moveNext:function(){if(0===this.left)return this.current=null,!1;0<this.left&&this.left--;this.current=a;return!0}}};return c},S=G.forEnumerator=function(a){var b=
new G;b.getEnumerator=function(){return{_index:-1,current:null,moveNext:function(){if(++this._index<a.length)return this.current=a[this._index],!0;this._index=-1;this.current=null;return!1}}};return b},r=m.Observer=function(){},T=m.Internals.AbstractObserver=function(){function a(){this.isStopped=!1}o(a,r);a.prototype.onNext=function(a){this.isStopped||this.next(a)};a.prototype.onError=function(a){if(!this.isStopped)this.isStopped=!0,this.error(a)};a.prototype.onCompleted=function(){if(!this.isStopped)this.isStopped=
!0,this.completed()};a.prototype.dispose=function(){this.isStopped=!0};return a}(),N=function(){function a(b,c,d){a.base.constructor.call(this);this._onNext=b;this._onError=c;this._onCompleted=d}o(a,T);a.prototype.next=function(a){this._onNext(a)};a.prototype.error=function(a){this._onError(a)};a.prototype.completed=function(){this._onCompleted()};return a}(),H=m.Internals.BinaryObserver=function(){function a(a,c){"function"===typeof a&&"function"===typeof c?(this.leftObserver=aa(a),this.rightObserver=
aa(c)):(this.leftObserver=a,this.rightObserver=c)}o(a,r);a.prototype.onNext=function(a){var c=this;return a.switchValue(function(a){return a.accept(c.leftObserver)},function(a){return a.accept(c.rightObserver)})};a.prototype.onError=function(){};a.prototype.onCompleted=function(){};return a}(),na=function(){function a(a,c){this.scheduler=a;this.observer=c;this.hasFaulted=this.isAcquired=!1;this.queue=[];this.disposable=new C}o(a,T);a.prototype.ensureActive=function(){var a=!1,c=this;if(!this.hasFaulted&&
0<this.queue.length)a=!this.isAcquired,this.isAcquired=!0;a&&this.disposable.disposable(this.scheduler.scheduleRecursive(function(a){var b;if(0<c.queue.length){b=c.queue.shift();try{b()}catch(g){throw c.queue=[],c.hasFaulted=!0,g;}a()}else c.isAcquired=!1}))};a.prototype.next=function(a){var c=this;this.queue.push(function(){c.observer.onNext(a)})};a.prototype.error=function(a){var c=this;this.queue.push(function(){c.observer.onError(a)})};a.prototype.completed=function(){var a=this;this.queue.push(function(){a.observer.onCompleted()})};
a.prototype.dispose=function(){a.base.dispose.call(this);this.disposable.dispose()};return a}(),I=r.create=function(a,b,c){b||(b=function(a){throw a;});c||(c=function(){});return new N(a,b,c)};r.fromNotifier=function(a){return new N(function(b){return a(t.createOnNext(b))},function(b){return a(t.createOnError(b))},function(){return a(t.createOnCompleted())})};var aa=function(a){return new N(function(b){a(t.createOnNext(b))},function(b){a(t.createOnError(b))},function(){a(t.createOnCompleted())})};
r.prototype.toNotifier=function(){var a=this;return function(b){return b.accept(a)}};r.prototype.asObserver=function(){var a=this;return new N(function(b){return a.onNext(b)},function(b){return a.onError(b)},function(){return a.onCompleted()})};var j=m.Observable=function(){function a(){}a.prototype.subscribe=function(a,c,d){return this._subscribe(0===arguments.length||1<arguments.length||"function"===typeof a?I(a,c,d):a)};return a}(),f=j.prototype,pa=function(){function a(b){a.base.constructor.call(this);
this._subscribe=function(a){var d=new oa(a);D.scheduleRequired()?D.schedule(function(){d.disposable(b(d))}):d.disposable(b(d));return d}}o(a,j);a.prototype._subscribe=function(a){return this._subscribe(a)};return a}(),oa=function(){function a(b){a.base.constructor.call(this);this.observer=b;this.m=new v}o(a,T);a.prototype.disposable=function(a){return this.m.disposable(a)};a.prototype.next=function(a){this.observer.onNext(a)};a.prototype.error=function(a){this.observer.onError(a);this.m.dispose()};
a.prototype.completed=function(){this.observer.onCompleted();this.m.dispose()};a.prototype.dispose=function(){a.base.dispose.call(this);this.m.dispose()};return a}(),ba=function(){function a(b,c,d){a.base.constructor.call(this);this.key=b;this.underlyingObservable=!d?c:i(function(a){return new p(d.getDisposable(),c.subscribe(a))})}o(a,j);a.prototype._subscribe=function(a){return this.underlyingObservable.subscribe(a)};return a}(),qa=m.ConnectableObservable=function(){function a(a,c){var d=a.asObservable(),
e=!1,g=null;this.connect=function(){e||(e=!0,g=new p(d.subscribe(c),A(function(){e=!1})));return g};this._subscribe=function(a){return c.subscribe(a)}}o(a,j);a.prototype.connect=function(){return this.connect()};a.prototype.refCount=function(){var a=null,c=0,d=this;return i(function(e){var g,h;c++;g=1===c;h=d.subscribe(e);g&&(a=d.connect());return A(function(){h.dispose();c--;0===c&&a.dispose()})})};a.prototype._subscribe=function(a){return this._subscribe(a)};return a}(),O=m.Subject=function(){function a(){a.base.constructor.call(this);
var b=!1,c=!1,d=new u,e=n,g=function(){if(b)throw Error(K);};this.onCompleted=function(){var a,b;g();c||(a=d.toArray(),d=new u,c=!0);if(a!==n)for(b=0;b<a.length;b++)a[b].onCompleted()};this.onError=function(a){var b,z;g();c||(b=d.toArray(),d=new u,c=!0,e=a);if(b!==n)for(z=0;z<b.length;z++)b[z].onError(a)};this.onNext=function(a){var b,e;g();c||(b=d.toArray());if(void 0!==b)for(e=0;e<b.length;e++)b[e].onNext(a)};this._subscribe=function(a){g();if(!c)return d.add(a),function(a){return{observer:a,dispose:function(){if(null!==
this.observer&&!b)d.remove(this.observer),this.observer=null}}}(a);if(e!==n)return a.onError(e),w;a.onCompleted();return w};this.dispose=function(){b=!0;d=null}}o(a,j);E(a,r);a.prototype.onCompleted=function(){this.onCompleted()};a.prototype.onError=function(a){this.onError(a)};a.prototype.onNext=function(a){this.onNext(a)};a.prototype._subscribe=function(a){return this._subscribe(a)};a.prototype.dispose=function(){this.dispose()};a.create=function(a,c){return new ra(a,c)};return a}(),U=m.AsyncSubject=
function(){function a(){a.base.constructor.call(this);var b=!1,c=!1,d=null,e=!1,g=new u,h=null,l=function(){if(b)throw Error(K);};this.onCompleted=function(){var a=!1,b,h,f;l();c||(b=g.toArray(),g=new u,c=!0,h=d,a=e);if(b!==n)if(a)for(f=0;f<b.length;f++)a=b[f],a.onNext(h),a.onCompleted();else for(f=0;f<b.length;f++)b[f].onCompleted()};this.onError=function(a){var b,d;l();c||(b=g.toArray(),g=new u,c=!0,h=a);if(b!==n)for(d=0;d<b.length;d++)b[d].onError(a)};this.onNext=function(a){l();c||(d=a,e=!0)};
this._subscribe=function(a){var q,k,f;l();if(!c)return g.add(a),function(a){return{observer:a,dispose:function(){if(null!==this.observer&&!b)g.remove(this.observer),this.observer=null}}}(a);q=h;k=e;f=d;if(null!==q)a.onError(q);else{if(k)a.onNext(f);a.onCompleted()}return w};this.dispose=function(){b=!0;d=h=g=null}}o(a,j);E(a,r);a.prototype.onCompleted=function(){this.onCompleted()};a.prototype.onError=function(a){this.onError(a)};a.prototype.onNext=function(a){this.onNext(a)};a.prototype._subscribe=
function(a){return this._subscribe(a)};a.prototype.dispose=function(){this.dispose()};return a}(),P=m.BehaviorSubject=function(){function a(b){a.base.constructor.call(this);var c=b,d=new u,e=!1,g=!1,h=null,l=function(){if(e)throw Error(K);};this.onCompleted=function(){var a,b;a=null;l();g||(a=d.toArray(),d=new u,g=!0);if(null!==a)for(b=0;b<a.length;b++)a[b].onCompleted()};this.onError=function(a){var b,c;c=null;l();g||(c=d.toArray(),d=new u,g=!0,h=a);if(null!==c)for(b=0;b<c.length;b++)c[b].onError(a)};
this.onNext=function(a){var b,e;b=null;l();g||(c=a,b=d.toArray());if(null!==b)for(e=0;e<b.length;e++)b[e].onNext(a)};this._subscribe=function(a){var b;l();if(!g)return d.add(a),a.onNext(c),function(a){return{observer:a,dispose:function(){if(null!==this.observer&&!e)d.remove(this.observer),this.observer=null}}}(a);b=h;if(null!==b)a.onError(b);else a.onCompleted();return w};this.dispose=function(){e=!0;h=c=d=null}}o(a,j);E(a,r);a.prototype.onCompleted=function(){this.onCompleted()};a.prototype.onError=
function(a){this.onError(a)};a.prototype.onNext=function(a){this.onNext(a)};a.prototype._subscribe=function(a){return this._subscribe(a)};a.prototype.dispose=function(){this.dispose()};return a}();P.prototype.toNotifier=r.prototype.toNotifier;P.prototype.asObserver=r.prototype.AsObserver;var ca=m.ReplaySubject=function(){function a(a,c,d){var e=a===n?Number.MAX_VALUE:a,g=c===n?Number.MAX_VALUE:c,h=d||s.currentThread,l=[],f=new u,q=!1,k=!1,i=function(a){var b=q?1:0,c=b+e;for(c<e&&(c=e);l.length>c;)l.shift();
for(;l.length>b&&a-l[0].timestamp>g;)l.shift()},j=function(a){var b=h.now();l.push({value:a,timestamp:b});i(b)},m=function(){if(k)throw Error(K);};this.onNext=function(a){var b=null,c,d;m();if(!q){b=f.toArray();j(t.createOnNext(a));for(d=0;d<b.length;d++)c=b[d],c.onNext(a)}if(null!==b)for(d=0;d<b.length;d++)c=b[d],c.ensureActive()};this.onError=function(a){var b=null,c;m();if(!q){q=!0;j(t.createOnError(a));b=f.toArray();for(c=0;c<b.length;c++)b[c].onError(a);f=new u}if(null!==b)for(c=0;c<b.length;c++)b[c].ensureActive()};
this.onCompleted=function(){var a=null,b;m();if(!q){q=!0;j(t.createOnCompleted());a=f.toArray();for(b=0;b<a.length;b++)a[b].onCompleted();f=new u}if(null!==a)for(b=0;b<a.length;b++)a[b].ensureActive()};this._subscribe=function(a){var a=new na(h,a),b=function(a){return{observer:a,dispose:function(){this.observer.dispose();null!==this.observer&&!k&&f.remove(this.observer)}}}(a),c;m();i(h.now());f.add(a);for(c=0;c<l.length;c++)l[c].value.accept(a);a.ensureActive();return b};this.dispose=function(){k=
!0;f=null}}o(a,j);E(a,j);a.prototype.onNext=function(a){this.onNext(a)};a.prototype.onError=function(a){this.onError(a)};a.prototype.onCompleted=function(){this.onCompleted()};a.prototype._subscribe=function(a){return this._subscribe(a)};a.prototype.dispose=function(){this.dispose()};return a}(),ra=function(){function a(a,c){this.observer=a;this.observable=c}o(a,j);E(a,r);a.prototype.onCompleted=function(){return this.observer.onCompleted()};a.prototype.onError=function(a){return this.observer.onError(a)};
a.prototype.onNext=function(a){return this.observer.onNext(a)};a.prototype._Subscribe=function(a){return this.observable.Subscribe(a)};return a}();j.start=function(a,b,c,d){c||(c=[]);return sa(a,d).apply(b,c)};var sa=j.toAsync=function(a,b){b||(b=ma);return function(){var c=new U,d=function(){var b;try{b=a.apply(this,arguments)}catch(d){c.onError(d);return}c.onNext(b);c.onCompleted()},e=y.call(arguments),g=this;b.schedule(function(){d.apply(g,e)});return c}};f.multicast=function(a,b){var c=this;return"function"===
typeof a?i(function(d){var e=c.multicast(a());return new p(b(e).subscribe(d),e.connect())}):new qa(c,a)};f.publish=function(a){return!a?this.multicast(new O):this.multicast(function(){return new O},a)};f.publishLast=function(a){return!a?this.multicast(new U):this.multicast(function(){return new U},a)};f.replay=function(a,b,c,d){return!a||null===a?this.multicast(new ca(b,c,d)):this.multicast(function(){return new ca(b,c,d)},a)};f.publishValue=function(a,b){return"function"===typeof a?this.multicast(function(){return new P(b)},
a):this.multicast(new P(a))};var da=j.never=function(){return i(function(){return w})},ta=j.empty=function(a){a||(a=B);return i(function(b){return a.schedule(function(){return b.onCompleted()})})},ua=j.returnValue=function(a,b){b||(b=B);return i(function(c){return b.schedule(function(){c.onNext(a);return c.onCompleted()})})},ea=j.throwException=function(a,b){b||(b=B);return i(function(c){return b.schedule(function(){return c.onError(a)})})},va=j.generate=function(a,b,c,d,e){e||(e=D);return i(function(g){var h=
!0,f=a;return e.scheduleRecursive(function(a){var e,k;try{h?h=!1:f=c(f),(e=b(f))&&(k=d(f))}catch(i){g.onError(i);return}if(e)g.onNext(k),a();else g.onCompleted()})})},fa=j.defer=function(a){return i(function(b){var c;try{c=a()}catch(d){return ea(d).subscribe(b)}return c.subscribe(b)})};j.using=function(a,b){return i(function(c){var d=w,e,g;try{e=a(),null!==e&&(d=e),g=b(e)}catch(h){return new p(ea(h).subscribe(c),d)}return new p(g.subscribe(c),d)})};var ga=j.fromArray=function(a,b){b||(b=D);return i(function(c){var d=
0;return b.scheduleRecursive(function(b){if(d<a.length)c.onNext(a[d++]),b();else c.onCompleted()})})},i=j.createWithDisposable=function(a){return new pa(a)};j.create=function(a){return i(function(b){return A(a(b))})};j.range=function(a,b,c){c||(c=D);var d=a+b-1;return va(a,function(a){return a<=d},function(a){return a+1},function(a){return a},c)};f.repeat=function(a){return $(this,a).concat()};f.retry=function(a){return $(this,a).catchException()};j.repeat=function(a,b,c){c||(c=D);b===n&&(b=-1);return ua(a,
c).repeat(b)};f.select=function(a){var b=this;return i(function(c){var d=0;return b.subscribe(function(b){var g;try{g=a(b,d++)}catch(h){c.onError(h);return}c.onNext(g)},function(a){c.onError(a)},function(){c.onCompleted()})})};f.where=function(a){var b=this;return i(function(c){var d=0;return b.subscribe(function(b){var g;try{g=a(b,d++)}catch(h){c.onError(h);return}if(g)c.onNext(b)},function(a){c.onError(a)},function(){c.onCompleted()})})};f.groupByUntil=function(a,b,c,d){var e=this;b||(b=Q);d||(d=
W);return i(function(g){var h={},f=new p,i=new Z(f);f.add(e.subscribe(function(e){var k,j,m,t,o,p,u,s,r;try{j=a(e),p=d(j)}catch(w){for(r in h)h[r].onError(w);g.onError(w);return}o=!1;try{s=h[p],s||(s=new O,h[p]=s,o=!0)}catch(x){for(r in h)h[r].onError(x);g.onError(x);return}if(o){o=new ba(j,s,i);j=new ba(j,s);try{k=c(j)}catch(y){for(r in h)h[r].onError(y);g.onError(y);return}g.onNext(o);u=new v;f.add(u);t=function(){h[p]!==n&&(delete h[p],s.onCompleted());f.remove(u)};u.disposable(k.take(1).subscribe(function(){},
function(a){for(r in h)h[r].onError(a);g.onError(a)},function(){t()}))}try{m=b(e)}catch(A){for(r in h)h[r].onError(A);g.onError(A);return}s.onNext(m)},function(a){for(var b in h)h[b].onError(a);g.onError(a)},function(){for(var a in h)h[a].onCompleted();g.onCompleted()}));return i})};f.groupBy=function(a,b,c){return this.groupByUntil(a,b,function(){return da()},c)};f.take=function(a,b){if(0>a)throw Error("Argument out of range");if(0==a)return ta(b);var c=this;return i(function(b){var e=a;return c.subscribe(function(a){if(0<
e&&(e--,b.onNext(a),0===e))b.onCompleted()},function(a){return b.onError(a)},function(){return b.onCompleted()})})};f.skip=function(a){if(0>a)throw Error("Argument out of range");var b=this;return i(function(c){var d=a;return b.subscribe(function(a){if(0>=d)c.onNext(a);else d--},function(a){return c.onError(a)},function(){return c.onCompleted()})})};f.takeWhile=function(a){var b=this;return i(function(c){var d=0,e=!0;return b.subscribe(function(b){if(e){try{e=a(b,d++)}catch(h){c.onError(h);return}if(e)c.onNext(b);
else c.onCompleted()}},function(a){return c.onError(a)},function(){return c.onCompleted()})})};f.skipWhile=function(a){var b=this;return i(function(c){var d=0,e=!1;return b.subscribe(function(b){if(!e)try{e=!a(b,d++)}catch(h){c.onError(h);return}if(e)c.onNext(b)},function(a){c.onError(a)},function(){c.onCompleted()})})};f.selectMany=function(a,b){return b!==n?this.selectMany(function(c){return a(c).select(function(a){return b(c,a)})}):"function"===typeof a?this.select(a).mergeObservable():this.select(function(){return a}).mergeObservable()};
f.finalValue=function(){var a=this;return i(function(b){var c=!1,d;return a.subscribe(function(a){c=!0;d=a},function(a){b.onError(a)},function(){if(c)b.onNext(d),b.onCompleted();else b.onError(Error("Sequence contains no elements."))})})};f.toArray=function(){return this.scan([],function(a,b){a.push(b);return a}).startWith([]).finalValue()};f.materialize=function(){var a=this;return i(function(b){return a.subscribe(function(a){b.onNext(t.createOnNext(a))},function(a){b.onNext(t.createOnError(a));
b.onCompleted()},function(){b.onNext(t.createOnCompleted());b.onCompleted()})})};f.dematerialize=function(){var a=this;return i(function(b){return a.subscribe(function(a){return a.accept(b)},function(a){b.onError(a)},function(){b.onCompleted()})})};f.asObservable=function(){var a=this;return i(function(b){return a.subscribe(b)})};f.windowWithCount=function(a,b){var c=this;if(0>=a)throw Error("Argument out of range");b===n&&(b=a);if(0>=b)throw Error("Argument out of range");return i(function(d){var e=
new v,g=new Z(e),h=0,f=[],i=function(){var a=new O;f.push(a);d.onNext(ja(a,g))};i();e.disposable(c.subscribe(function(c){var d;for(d=0;d<f.length;d++)f[d].onNext(c);c=h-a+1;0<=c&&0===c%b&&(c=f.shift(),c.onCompleted());h++;0===h%b&&i()},function(a){for(;0<f.length;)f.shift().onError(a);d.onError(a)},function(){for(;0<f.length;)f.shift().onCompleted();d.onCompleted()}));return g})};f.bufferWithCount=function(a,b){b===n&&(b=a);return this.windowWithCount(a,b).selectMany(function(a){return a.toArray()}).where(function(a){return 0<
a.length})};f.startWith=function(){var a,b;a=0;0<arguments.length&&void 0!==arguments[0].now?(b=arguments[0],a=1):b=B;a=y.call(arguments,a);return S([ga(a,b),this]).concat()};f.scan=function(a,b){var c=this;return fa(function(){var d=!1,e;return c.select(function(c){d?e=b(e,c):(e=b(a,c),d=!0);return e})})};f.scan1=function(a){var b=this;return fa(function(){var c=!1,d;return b.select(function(b){c?d=a(d,b):(d=b,c=!0);return d})})};f.distinctUntilChanged=function(a,b){var c=this;a||(a=Q);b||(b=V);
return i(function(d){var e=!1,g;return c.subscribe(function(c){var f=!1,i;try{i=a(c)}catch(j){d.onError(j);return}if(e)try{f=b(g,i)}catch(k){d.onError(k);return}if(!e||!f)e=!0,g=i,d.onNext(c)},function(a){d.onError(a)},function(){d.onCompleted()})})};f.finallyAction=function(a){var b=this;return i(function(c){var d=b.subscribe(c);return A(function(){try{d.dispose()}finally{a()}})})};f.doAction=function(a,b,c){var d=this,e;0==arguments.length||1<arguments.length||"function"==typeof a?e=a:(e=function(b){a.onNext(b)},
b=function(b){a.onError(b)},c=function(){a.onCompleted()});return i(function(a){return d.subscribe(function(b){try{e(b)}catch(c){a.onError(c)}a.onNext(b)},function(c){if(b)try{b(c)}catch(d){a.onError(d)}a.onError(c)},function(){if(c)try{c()}catch(b){a.onError(b)}a.onCompleted()})})};f.skipLast=function(a){var b=this;return i(function(c){var d=[];return b.subscribe(function(b){d.push(b);if(d.length>a)c.onNext(d.shift())},function(a){c.onError(a)},function(){c.onCompleted()})})};f.takeLast=function(a){var b=
this;return i(function(c){var d=[];return b.subscribe(function(b){d.push(b);d.length>a&&d.shift()},function(a){c.onError(a)},function(){for(;0<d.length;)c.onNext(d.shift());c.onCompleted()})})};f.ignoreElements=function(){var a=this;return i(function(b){return a.subscribe(ia,function(a){b.onError(a)},function(){b.onCompleted()})})};f.elementAt=function(a){if(0>a)throw Error("Argument out of range");var b=this;return i(function(c){var d=a;return b.subscribe(function(a){0===d&&(c.onNext(a),c.onCompleted());
d--},function(a){c.onError(a)},function(){c.onError(Error("Argument out of range"))})})};f.elementAtOrDefault=function(a,b){var c=this;if(0>a)throw Error("Argument out of range");b===n&&(b=null);return i(function(d){var e=a;return c.subscribe(function(a){0===e&&(d.onNext(a),d.onCompleted());e--},function(a){d.onError(a)},function(){d.onNext(b);d.onCompleted()})})};f.defaultIfEmpty=function(a){var b=this;a===n&&(a=null);return i(function(c){var d=!1;return b.subscribe(function(a){d=!0;c.onNext(a)},
function(a){c.onError(a)},function(){if(!d)c.onNext(a);c.onCompleted()})})};f.distinct=function(a,b){var c=this;a||(a=Q);b||(b=W);return i(function(d){var e={};return c.subscribe(function(c){var f,i,j,q=!1;try{f=a(c),i=b(f)}catch(k){d.onError(k);return}for(j in e)if(i===j){q=!0;break}q||(e[i]=null,d.onNext(c))},function(a){d.onError(a)},function(){d.onCompleted()})})};f.mergeObservable=function(){var a=this;return i(function(b){var c=new p,d=!1,e=new v;c.add(e);e.disposable(a.subscribe(function(a){var e=
new v;c.add(e);e.disposable(a.subscribe(function(a){b.onNext(a)},function(a){b.onError(a)},function(){c.remove(e);if(d&&1===c.count())b.onCompleted()}))},function(a){b.onError(a)},function(){d=!0;if(1===c.count())b.onCompleted()}));return c})};f.merge=function(a){var b=this;return i(function(c){var d=0,e=new p,g=!1,f=[],i=function(a){var b=new v;e.add(b);b.disposable(a.subscribe(function(a){c.onNext(a)},function(a){c.onError(a)},function(){var a;e.remove(b);if(0<f.length)a=f.shift(),i(a);else if(d--,
g&&0===d)c.onCompleted()}))};e.add(b.subscribe(function(b){d<a?(d++,i(b)):f.push(b)},function(a){c.onError(a)},function(){g=!0;if(0===d)c.onCompleted()}));return e})};f.switchLatest=function(){var a=this;return i(function(b){var c=!1,d=new C,e=!1,g=0,f=a.subscribe(function(a){var f=new v,h=++g;c=!0;d.disposable(f);return f.disposable(a.subscribe(function(a){if(g===h)b.onNext(a)},function(a){if(g===h)b.onError(a)},function(){if(g===h&&(c=!1,e))b.onCompleted()}))},function(a){b.onError(a)},function(){e=
!0;if(!c)b.onCompleted()});return new p(f,d)})};j.merge=function(a){a||(a=B);var b=1<arguments.length&&arguments[1]instanceof Array?arguments[1]:y.call(arguments,1);return ga(b,a).mergeObservable()};f.concat=function(){var a=wa,b;b=arguments;var c,d;c=[];for(d=0;d<b.length;d++)c.push(b[d]);b=c;b.unshift(this);return a.apply(this,b)};f.concatObservable=function(){return this.merge(1)};var wa=j.concat=function(){var a=1===arguments.length&&arguments[0]instanceof Array?arguments[0]:y.call(arguments);
return S(a).concat()};f.catchException=function(a){return"function"===typeof a?xa(this,a):ya([this,a])};var xa=function(a,b){return i(function(c){var d=new v,e=new C;d.disposable(a.subscribe(function(a){c.onNext(a)},function(a){var d;try{d=b(a)}catch(f){c.onError(f);return}a=new v;e.disposable(a);a.disposable(d.subscribe(c))},function(){c.onCompleted()}));return e})},ya=j.catchException=function(){var a=1===arguments.length&&arguments[0]instanceof Array?arguments[0]:y.call(arguments);return S(a).catchException()};
f.onErrorResumeNext=function(a){return za([this,a])};var za=j.onErrorResumeNext=function(){var a=1===arguments.length&&arguments[0]instanceof Array?arguments[0]:y.call(arguments);return i(function(b){var c=0,d=new C,e=B.scheduleRecursive(function(e){var f,i;if(c<a.length)f=a[c++],i=new v,d.disposable(i),i.disposable(f.subscribe(function(a){b.onNext(a)},function(){e()},function(){e()}));else b.onCompleted()});return new p(d,e)})},Aa=function(){function a(a,c){var d=this;this.selector=a;this.observer=
c;this.leftQ=[];this.rightQ=[];this.left=I(function(a){if("E"===a.kind)d.observer.onError(a.exception);else if(0===d.rightQ.length)d.leftQ.push(a);else d.onNext(a,d.rightQ.shift())});this.right=I(function(a){if("E"===a.kind)d.observer.onError(a.exception);else if(0===d.leftQ.length)d.rightQ.push(a);else d.onNext(d.leftQ.shift(),a)})}a.prototype.onNext=function(a,c){var d;if("C"===a.kind||"C"===c.kind)this.observer.onCompleted();else{try{d=this.selector(a.value,c.value)}catch(e){this.observer.onError(e);
return}this.observer.onNext(d)}};return a}();f.zip=function(a,b){return F(this,a,function(a){var d=new Aa(b,a);return new H(function(a){return d.left.onNext(a)},function(a){return d.right.onNext(a)})})};var ha;ha=function(){function a(a,c){var d=this;this.selector=a;this.observer=c;this.rightStopped=this.leftStopped=!1;this.left=I(function(a){if("N"===a.kind)if(d.leftValue=a,d.rightValue!==n)d.onNext();else{if(d.rightStopped)d.observer.onCompleted()}else if("E"===a.kind)d.observer.onError(a.exception);
else if(d.leftStopped=!0,d.rightStopped)d.observer.onCompleted()});this.right=I(function(a){if("N"===a.kind)if(d.rightValue=a,d.leftValue!==n)d.onNext();else{if(d.leftStopped)d.observer.onCompleted()}else if("E"===a.kind)d.observer.onError(a.exception);else if(d.rightStopped=!0,d.leftStopped)d.observer.onCompleted()})}a.prototype.onNext=function(){var a;try{a=this.selector(this.leftValue.value,this.rightValue.value)}catch(c){this.observer.onError(c);return}this.observer.onNext(a)};return a}();f.combineLatest=
function(a,b){return F(this,a,function(a){var d=new ha(b,a);return new H(function(a){return d.left.onNext(a)},function(a){return d.right.onNext(a)})})};f.takeUntil=function(a){return F(a,this,function(a,c){var d=!1,e=!1;return new H(function(c){!e&&!d&&("C"===c.kind?d=!0:"E"===c.kind?(e=d=!0,a.onError(c.exception)):(e=!0,a.onCompleted()))},function(d){e||(d.accept(a),(e="N"!==d.kind)&&c.dispose())})})};f.skipUntil=function(a){return F(this,a,function(a,c,d){var e=!1,f=!1;return new H(function(c){if("E"==
c.kind)a.onError(c.exception);else e&&c.accept(a)},function(c){if(!f){if("N"===c.kind)e=!0;else if("E"===c.kind)a.onError(c.exception);f=!0;d.dispose()}})})};j.amb=function(){var a=da(),b,c=1===arguments.length&&arguments[0]instanceof Array?arguments[0]:y.call(arguments);for(b=0;b<c.length;b++)a=a.amb(c[b]);return a};f.amb=function(a){return F(this,a,function(a,c,d){var e="N";return new H(function(c){"N"===e&&(e="L",d.dispose());"L"===e&&c.accept(a)},function(d){"N"===e&&(e="R",c.dispose());"R"===
e&&d.accept(a)})})}};

},{}],22:[function(require,module,exports){
/*
 Copyright (c) Microsoft Corporation.  All rights reserved.
 This code is licensed by Microsoft Corporation under the terms
 of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
 See http://go.microsoft.com/fwlink/?LinkID=220762.
*/
module.exports = function(k,t){var l;l=k.Rx;var n=l.Observable,d=n.prototype,m=n.createWithDisposable,u=l.CompositeDisposable,o=function(a,b){return a===b},p=function(a){return a},q=function(a,b){return a>b?1:a===b?0:-1},r=function(a,b,d){return m(function(c){var f=!1,g=null,h=[];return a.subscribe(function(a){var e,i;try{i=b(a)}catch(v){c.onError(v);return}e=0;if(f)try{e=d(i,g)}catch(w){c.onError(w);return}else f=!0,g=
i;0<e&&(g=i,h=[]);0<=e&&h.push(a)},function(a){c.onError(a)},function(){c.onNext(h);c.onCompleted()})})};d.aggregate=function(a,b){return this.scan(a,b).startWith(a).finalValue()};d.aggregate1=function(a){return this.scan1(a).finalValue()};d.any=function(a){var b=this;return a!==t?b.where(a).any():m(function(a){return b.subscribe(function(){a.onNext(!0);a.onCompleted()},function(b){a.onError(b)},function(){a.onNext(!1);a.onCompleted()})})};d.all=function(a){return this.where(function(b){return!a(b)}).any().select(function(a){return!a})};
d.contains=function(a,b){b||(b=o);return this.where(function(d){return b(d,a)}).any()};d.count=function(){return this.aggregate(0,function(a){return a+1})};d.sum=function(){return this.aggregate(0,function(a,b){return a+b})};d.minBy=function(a,b){b||(b=q);return r(this,a,function(a,c){return-1*b(a,c)})};var s=function(a){if(0==a.length)throw Error("Sequence contains no elements.");return a[0]};d.min=function(a){return this.minBy(p,a).select(function(a){return s(a)})};d.maxBy=function(a,b){b||(b=q);
return r(this,a,b)};d.max=function(a){return this.maxBy(p,a).select(function(a){return s(a)})};d.average=function(){return this.scan({sum:0,count:0},function(a,b){return{sum:a.sum+b,count:a.count+1}}).finalValue().select(function(a){return a.sum/a.count})};d.sequenceEqual=function(a,b){var d=this;b||(b=o);return m(function(c){var f=!1,g=!1,h=[],j=[],e=d.subscribe(function(a){var d,f;if(0<j.length){f=j.shift();try{d=b(f,a)}catch(e){c.onError(e);return}d||(c.onNext(!1),c.onCompleted())}else g?(c.onNext(!1),
c.onCompleted()):h.push(a)},function(a){c.onError(a)},function(){f=!0;0===h.length&&(0<j.length?(c.onNext(!1),c.onCompleted()):g&&(c.onNext(!0),c.onCompleted()))}),i=a.subscribe(function(a){var d,e;if(0<h.length){e=h.shift();try{d=b(e,a)}catch(g){c.onError(g);return}d||(c.onNext(!1),c.onCompleted())}else f?(c.onNext(!1),c.onCompleted()):j.push(a)},function(a){c.onError(a)},function(){g=!0;0===j.length&&(0<h.length?(c.onNext(!1),c.onCompleted()):f&&(c.onNext(!0),c.onCompleted()))});return new u(e,
i)})}};

},{}],23:[function(require,module,exports){
/*
 Copyright (c) Microsoft Corporation.  All rights reserved.
 This code is licensed by Microsoft Corporation under the terms
 of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
 See http://go.microsoft.com/fwlink/?LinkID=220762.
*/
module.exports = function(q,h){var f;f=q.Rx;var z=f.Observable,u=f.CompositeDisposable,E=f.RefCountDisposable,s=f.SingleAssignmentDisposable,K=f.SerialDisposable,A=f.Subject;f=z.prototype;var L=z.empty,v=z.createWithDisposable,M=function(b,a){return b===a},N=function(){},B=function(b,a){return v(function(c){return new u(a.getDisposable(),b.subscribe(c))})},C,F,o,G,w,x;o=[1,3,7,13,31,61,127,251,509,1021,2039,4093,8191,16381,
32749,65521,131071,262139,524287,1048573,2097143,4194301,8388593,16777213,33554393,67108859,134217689,268435399,536870909,1073741789,2147483647];F=function(b){var a,c;if(b&0)return 2===b;a=Math.sqrt(b);for(c=3;c<=a;){if(0===b%c)return!1;c+=2}return!0};C=function(b){var a,c;for(a=0;a<o.length;++a)if(c=o[a],c>=b)return c;for(a=b|1;a<o[o.length-1];){if(F(a))return a;a+=2}return b};G=0;w=function(b){var a;if(b===h)throw"no such key";if(b.getHashCode!==h)return b.getHashCode();a=17*G++;b.getHashCode=function(){return a};
return a};x=function(){return{key:null,value:null,next:0,hashCode:0}};var y=function(){function b(a,c){this._initialize(a);this.comparer=c||M;this.size=this.freeCount=0;this.freeList=-1}b.prototype._initialize=function(a){var a=C(a),c;this.buckets=Array(a);this.entries=Array(a);for(c=0;c<a;c++)this.buckets[c]=-1,this.entries[c]=x();this.freeList=-1};b.prototype.count=function(){return this.size};b.prototype.add=function(a,c){return this._insert(a,c,!0)};b.prototype._insert=function(a,c,b){var e,d,
g;this.buckets===h&&this._initialize(0);g=w(a)&2147483647;e=g%this.buckets.length;for(d=this.buckets[e];0<=d;d=this.entries[d].next)if(this.entries[d].hashCode===g&&this.comparer(this.entries[d].key,a)){if(b)throw"duplicate key";this.entries[d].value=c;return}0<this.freeCount?(b=this.freeList,this.freeList=this.entries[b].next,--this.freeCount):(this.size===this.entries.length&&(this._resize(),e=g%this.buckets.length),b=this.size,++this.size);this.entries[b].hashCode=g;this.entries[b].next=this.buckets[e];
this.entries[b].key=a;this.entries[b].value=c;this.buckets[e]=b};b.prototype._resize=function(){var a,c,b,e,d;d=C(2*this.size);b=Array(d);for(a=0;a<b.length;++a)b[a]=-1;e=Array(d);for(a=0;a<this.size;++a)e[a]=this.entries[a];for(a=this.size;a<d;++a)e[a]=x();for(a=0;a<this.size;++a)c=e[a].hashCode%d,e[a].next=b[c],b[c]=a;this.buckets=b;this.entries=e};b.prototype.remove=function(a){var b,k,e,d;if(this.buckets!==h){d=w(a)&2147483647;b=d%this.buckets.length;k=-1;for(e=this.buckets[b];0<=e;e=this.entries[e].next){if(this.entries[e].hashCode===
d&&this.comparer(this.entries[e].key,a))return 0>k?this.buckets[b]=this.entries[e].next:this.entries[k].next=this.entries[e].next,this.entries[e].hashCode=-1,this.entries[e].next=this.freeList,this.entries[e].key=null,this.entries[e].value=null,this.freeList=e,++this.freeCount,!0;k=e}}return!1};b.prototype.clear=function(){var a;if(!(0>=this.size)){for(a=0;a<this.buckets.length;++a)this.buckets[a]=-1;for(a=0;a<this.size;++a)this.entries[a]=x();this.freeList=-1;this.size=0}};b.prototype._findEntry=
function(a){var b,k;if(this.buckets!==h){k=w(a)&2147483647;for(b=this.buckets[k%this.buckets.length];0<=b;b=this.entries[b].next)if(this.entries[b].hashCode===k&&this.comparer(this.entries[b].key,a))return b}return-1};b.prototype.count=function(){return this.size-this.freeCount};b.prototype.tryGetEntry=function(a){a=this._findEntry(a);return 0<=a?{key:this.entries[a].key,value:this.entries[a].value}:h};b.prototype.getValues=function(){var a=0,b,k=[];if(this.entries!==h)for(b=0;b<this.size;b++)if(0<=
this.entries[b].hashCode)k[a++]=this.entries[b].value;return k};b.prototype.get=function(a){a=this._findEntry(a);if(0<=a)return this.entries[a].value;throw Error("no such key");};b.prototype.set=function(a,b){this._insert(a,b,!1)};b.prototype.containskey=function(a){return 0<=this._findEntry(a)};return b}();f.join=function(b,a,c,k){var e=this;return v(function(d){var g=new u,j=!1,f=0,l=new y,h=!1,r=0,t=new y;g.add(e.subscribe(function(b){var c,e,p=f++,i=new s,H;l.add(p,b);g.add(i);e=function(){if(l.remove(p)&&
0===l.count()&&j)d.onCompleted();return g.remove(i)};try{c=a(b)}catch(h){d.onError(h);return}i.disposable(c.take(1).subscribe(function(){},function(a){d.onError(a)},function(){e()}));c=t.getValues();for(var n=0;n<c.length;n++){try{H=k(b,c[n])}catch(r){d.onError(r);break}d.onNext(H)}},function(a){d.onError(a)},function(){j=!0;if(h||0===l.count())d.onCompleted()}));g.add(b.subscribe(function(a){var b,e,p=r++,i=new s,j;t.add(p,a);g.add(i);e=function(){if(t.remove(p)&&0===t.count()&&h)d.onCompleted();
return g.remove(i)};try{b=c(a)}catch(f){d.onError(f);return}i.disposable(b.take(1).subscribe(function(){},function(a){d.onError(a)},function(){e()}));b=l.getValues();for(var n=0;n<b.length;n++){try{j=k(b[n],a)}catch(O){d.onError(O);break}d.onNext(j)}},function(a){d.onError(a)},function(){h=!0;if(j||0===t.count())d.onCompleted()}));return g})};f.groupJoin=function(b,a,c,k){var e=this;return v(function(d){var g=new u,j=new E(g),f=0,l=new y,h=0,r=new y;g.add(e.subscribe(function(b){var c,e,m,p=f++,i,
h,D,n=new A;l.add(p,n);try{m=k(b,B(n,j))}catch(o){i=l.getValues();for(m=0;m<i.length;m++)i[m].onError(o);d.onError(o);return}d.onNext(m);D=r.getValues();for(m=0;m<D.length;m++)n.onNext(D[m]);h=new s;g.add(h);e=function(){if(l.remove(p))n.onCompleted();g.remove(h)};try{c=a(b)}catch(q){i=l.getValues();for(m=0;m<i.length;m++)i[m].onError(q);d.onError(q);return}h.disposable(c.take(1).subscribe(function(){},function(a){var b;i=l.getValues();for(b=0;b<i.length;b++)i[b].onError(a);d.onError(a)},function(){e()}))},
function(a){var b,c;c=l.getValues();for(b=0;b<c.length;b++)c[b].onError(a);d.onError(a)},function(){d.onCompleted()}));g.add(b.subscribe(function(a){var b,e,k,f,i;k=h++;r.add(k,a);i=new s;g.add(i);e=function(){r.remove(k);g.remove(i)};try{b=c(a)}catch(j){f=l.getValues();for(b=0;b<f.length;b++)f[b].onError(j);d.onError(j);return}i.disposable(b.take(1).subscribe(function(){},function(a){var b;f=l.getValues();for(b=0;b<f.length;b++)f[b].onError(a);d.onError(a)},function(){e()}));f=l.getValues();for(b=
0;b<f.length;b++)f[b].onNext(a)},function(b){var a,c;c=l.getValues();for(a=0;a<c.length;a++)c[a].onError(b);d.onError(b)}));return j})};f.buffer=function(b,a){return"function"===typeof b?I(b).selectMany(function(a){return observableToArray(a)}):J(this,b,a).selectMany(function(a){return observableToArray(a)})};f.window=function(b,a){return"function"===typeof b?I.call(this,b):J.call(this,b,a)};var J=function(b,a){return b.groupJoin(this,a,function(){return L()},function(a,b){return b})},I=function(b){var a=
this;return v(function(c){var f,e=new K,d=new u(e),g=new E(d),j=new A;c.onNext(B(j,g));d.add(a.subscribe(function(a){j.onNext(a)},function(a){j.onError(a);c.onError(a)},function(){j.onCompleted();c.onCompleted()}));f=function(){var a,d;try{d=b()}catch(h){c.onError(h);return}a=new s;e.disposable(a);a.disposable(d.take(1).subscribe(N,function(a){j.onError(a);c.onError(a)},function(){j.onCompleted();j=new A;c.onNext(B(j,g));f()}))};f();return g})}};

},{}],24:[function(require,module,exports){
/*
 Copyright (c) Microsoft Corporation.  All rights reserved.
 This code is licensed by Microsoft Corporation under the terms
 of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
 See http://go.microsoft.com/fwlink/?LinkID=220762.
*/
module.exports = function(k,h){var i;i=k.Rx;var w=Array.prototype.slice,x=Object.prototype.hasOwnProperty,y=function(b,a){function c(){this.constructor=b}for(var f in a)x.call(a,f)&&(b[f]=a[f]);c.prototype=a.prototype;b.prototype=new c;b.base=a.prototype;return b},l=i.Observable,p=l.prototype,z=l.createWithDisposable,A=l.throwException,B=i.Observer.create,q=i.Internals.List,C=i.SingleAssignmentDisposable,D=i.CompositeDisposable,
E=i.Internals.AbstractObserver,F=function(b,a){return b===a},o,r,j,s,m,n;j=[1,3,7,13,31,61,127,251,509,1021,2039,4093,8191,16381,32749,65521,131071,262139,524287,1048573,2097143,4194301,8388593,16777213,33554393,67108859,134217689,268435399,536870909,1073741789,2147483647];r=function(b){var a,c;if(b&0)return 2===b;a=Math.sqrt(b);for(c=3;c<=a;){if(0===b%c)return!1;c+=2}return!0};o=function(b){var a,c;for(a=0;a<j.length;++a)if(c=j[a],c>=b)return c;for(a=b|1;a<j[j.length-1];){if(r(a))return a;a+=2}return b};
s=0;m=function(b){var a;if(b===h)throw"no such key";if(b.getHashCode!==h)return b.getHashCode();a=17*s++;b.getHashCode=function(){return a};return a};n=function(){return{key:null,value:null,next:0,hashCode:0}};var t=function(){function b(a,c){this._initialize(a);this.comparer=c||F;this.size=this.freeCount=0;this.freeList=-1}b.prototype._initialize=function(a){var a=o(a),c;this.buckets=Array(a);this.entries=Array(a);for(c=0;c<a;c++)this.buckets[c]=-1,this.entries[c]=n();this.freeList=-1};b.prototype.count=
function(){return this.size};b.prototype.add=function(a,c){return this._insert(a,c,!0)};b.prototype._insert=function(a,c,b){var d,e,g;this.buckets===h&&this._initialize(0);g=m(a)&2147483647;d=g%this.buckets.length;for(e=this.buckets[d];0<=e;e=this.entries[e].next)if(this.entries[e].hashCode===g&&this.comparer(this.entries[e].key,a)){if(b)throw"duplicate key";this.entries[e].value=c;return}0<this.freeCount?(b=this.freeList,this.freeList=this.entries[b].next,--this.freeCount):(this.size===this.entries.length&&
(this._resize(),d=g%this.buckets.length),b=this.size,++this.size);this.entries[b].hashCode=g;this.entries[b].next=this.buckets[d];this.entries[b].key=a;this.entries[b].value=c;this.buckets[d]=b};b.prototype._resize=function(){var a,c,b,d,e;e=o(2*this.size);b=Array(e);for(a=0;a<b.length;++a)b[a]=-1;d=Array(e);for(a=0;a<this.size;++a)d[a]=this.entries[a];for(a=this.size;a<e;++a)d[a]=n();for(a=0;a<this.size;++a)c=d[a].hashCode%e,d[a].next=b[c],b[c]=a;this.buckets=b;this.entries=d};b.prototype.remove=
function(a){var c,b,d,e;if(this.buckets!==h){e=m(a)&2147483647;c=e%this.buckets.length;b=-1;for(d=this.buckets[c];0<=d;d=this.entries[d].next){if(this.entries[d].hashCode===e&&this.comparer(this.entries[d].key,a))return 0>b?this.buckets[c]=this.entries[d].next:this.entries[b].next=this.entries[d].next,this.entries[d].hashCode=-1,this.entries[d].next=this.freeList,this.entries[d].key=null,this.entries[d].value=null,this.freeList=d,++this.freeCount,!0;b=d}}return!1};b.prototype.clear=function(){var a;
if(!(0>=this.size)){for(a=0;a<this.buckets.length;++a)this.buckets[a]=-1;for(a=0;a<this.size;++a)this.entries[a]=n();this.freeList=-1;this.size=0}};b.prototype._findEntry=function(a){var c,b;if(this.buckets!==h){b=m(a)&2147483647;for(c=this.buckets[b%this.buckets.length];0<=c;c=this.entries[c].next)if(this.entries[c].hashCode===b&&this.comparer(this.entries[c].key,a))return c}return-1};b.prototype.count=function(){return this.size-this.freeCount};b.prototype.tryGetEntry=function(a){a=this._findEntry(a);
return 0<=a?{key:this.entries[a].key,value:this.entries[a].value}:h};b.prototype.getValues=function(){var a=0,c,b=[];if(this.entries!==h)for(c=0;c<this.size;c++)if(0<=this.entries[c].hashCode)b[a++]=this.entries[c].value;return b};b.prototype.get=function(a){a=this._findEntry(a);if(0<=a)return this.entries[a].value;throw Error("no such key");};b.prototype.set=function(a,b){this._insert(a,b,!1)};b.prototype.containskey=function(a){return 0<=this._findEntry(a)};return b}(),u=function(){function b(a){this.patterns=
a}b.prototype.and=function(a){var c=this.patterns,f,d;d=[];for(f=0;f<c.length;f++)d.push(c[f]);d.push(a);return new b(d)};b.prototype.then=function(a){return new G(this,a)};return b}(),G=function(){function b(a,b){this.expression=a;this.selector=b}b.prototype.activate=function(a,b,f){var d,e,g,h;h=this;g=[];for(e=0;e<this.expression.patterns.length;e++)g.push(H(a,this.expression.patterns[e],function(a){b.onError(a)}));d=new v(g,function(){var a;try{a=h.selector.apply(h,arguments)}catch(d){b.onError(d);
return}b.onNext(a)},function(){var a;for(a=0;a<g.length;a++)g[a].removeActivePlan(d);f(d)});for(e=0;e<g.length;e++)g[e].addActivePlan(d);return d};return b}(),H=function(b,a,c){var f;f=b.tryGetEntry(a);return f===h?(c=new I(a,c),b.add(a,c),c):f.value},v;v=function(){function b(a,b,f){this.joinObserverArray=a;this.onNext=b;this.onCompleted=f;this.joinObservers=new t;for(a=0;a<this.joinObserverArray.length;a++)b=this.joinObserverArray[a],this.joinObservers.add(b,b)}b.prototype.dequeue=function(){var a,
b;b=this.joinObservers.getValues();for(a=0;a<b.length;a++)b[a].queue.shift()};b.prototype.match=function(){var a,b,f;a=!0;for(b=0;b<this.joinObserverArray.length;b++)if(0===this.joinObserverArray[b].queue.length){a=!1;break}if(a){a=[];f=!1;for(b=0;b<this.joinObserverArray.length;b++)a.push(this.joinObserverArray[b].queue[0]),"C"===this.joinObserverArray[b].queue[0].kind&&(f=!0);if(f)this.onCompleted();else{this.dequeue();f=[];for(b=0;b<a.length;b++)f.push(a[b].value);this.onNext.apply(this,f)}}};
return b}();var I=function(){function b(a,b){this.source=a;this.onError=b;this.queue=[];this.activePlans=new q;this.subscription=new C;this.isDisposed=!1}y(b,E);b.prototype.addActivePlan=function(a){this.activePlans.add(a)};b.prototype.subscribe=function(){this.subscription.disposable(this.source.materialize().subscribe(this))};b.prototype.next=function(a){var b;if(!this.isDisposed)if("E"===a.kind)this.onError(a.exception);else{this.queue.push(a);a=this.activePlans.toArray();for(b=0;b<a.length;b++)a[b].match()}};
b.prototype.error=function(){};b.prototype.completed=function(){};b.prototype.removeActivePlan=function(a){this.activePlans.remove(a);0===this.activePlans.count()&&this.dispose()};b.prototype.dispose=function(){b.base.dispose.call(this);if(!this.isDisposed)this.isDisposed=!0,this.subscription.dispose()};return b}();p.and=function(b){return new u([this,b])};p.then=function(b){return(new u([this])).then(b)};l.when=function(){var b=1===arguments.length&&arguments[0]instanceof Array?arguments[0]:w.call(arguments);
return z(function(a){var c=new q,f=new t,d,e,g,h,i;i=B(function(b){a.onNext(b)},function(b){for(var c=f.getValues(),d=0;d<c.length;d++)c[d].onError(b);a.onError(b)},function(){a.onCompleted()});try{for(e=0;e<b.length;e++)c.add(b[e].activate(f,i,function(a){c.remove(a);if(0===c.count())i.onCompleted()}))}catch(j){A(j).subscribe(a)}d=new D;h=f.getValues();for(e=0;e<h.length;e++)g=h[e],g.subscribe(),d.add(g);return d})}};

},{}],25:[function(require,module,exports){
/*
 Copyright (c) Microsoft Corporation.  All rights reserved.
 This code is licensed by Microsoft Corporation under the terms
 of the MICROSOFT REACTIVE EXTENSIONS FOR JAVASCRIPT AND .NET LIBRARIES License.
 See http://go.microsoft.com/fwlink/?LinkID=220762.
*/
module.exports = function(w,n){var p;p=w.Rx;var q=p.Observable,o=q.prototype,m=q.createWithDisposable,y=q.defer,F=q.throwException,l=p.Scheduler.Timeout,r=p.SingleAssignmentDisposable,t=p.SerialDisposable,s=p.CompositeDisposable,z=p.RefCountDisposable,u=p.Subject,G=p.Internals.BinaryObserver,v=function(a,b){return m(function(c){return new s(b.getDisposable(),a.subscribe(c))})},H=function(a,b,c){return m(function(d){var f=
new r,e=new r,d=c(d,f,e);f.disposable(a.materialize().select(function(b){return{switchValue:function(c){return c(b)}}}).subscribe(d));e.disposable(b.materialize().select(function(b){return{switchValue:function(c,a){return a(b)}}}).subscribe(d));return new s(f,e)})},I=function(a,b){return m(function(c){return b.scheduleWithAbsolute(a,function(){c.onNext(0);c.onCompleted()})})},A=function(a,b,c){var d=0>b?0:b;return m(function(b){var e=0,g=a;return c.scheduleRecursiveWithAbsolute(g,function(a){var i;
0<d&&(i=c.now(),g+=d,g<=i&&(g=i+d));b.onNext(e++);a(g)})})},J=function(a,b){var c=0>a?0:a;return m(function(a){return b.scheduleWithRelative(c,function(){a.onNext(0);a.onCompleted()})})},B=function(a,b,c){return y(function(){return A(c.now()+a,b,c)})},K=q.interval=function(a,b){b||(b=l);return B(a,a,b)};q.timer=function(a,b,c){var d;c||(c=l);b!==n&&"number"===typeof b?d=b:b!==n&&"object"===typeof b&&(c=b);return a instanceof Date&&d===n?I(a.getTime(),c):a instanceof Date&&d!==n?A(a.getTime(),b,c):
d===n?J(a,c):B(a,d,c)};var D=function(a,b,c){return m(function(d){var f=!1,e=new t,g=null,h=[],i=!1,j;j=a.materialize().timestamp(c).subscribe(function(a){"E"===a.value.kind?(h=[],h.push(a),g=a.value.exception,a=!i):(h.push({value:a.value,timestamp:a.timestamp+b}),a=!f,f=!0);if(a)if(null!==g)d.onError(g);else a=new r,e.disposable(a),a.disposable(c.scheduleRecursiveWithRelative(b,function(a){var b,e,j;if(null===g){i=!0;do{b=null;if(0<h.length&&0>=h[0].timestamp-c.now())b=h.shift().value;null!==b&&
b.accept(d)}while(null!==b);j=!1;e=0;0<h.length?(j=!0,e=Math.max(0,h[0].timestamp-c.now())):f=!1;b=g;i=!1;if(null!==b)d.onError(b);else j&&a(e)}}))});return new s(j,e)})},L=function(a,b,c){return y(function(){var a=b-c.now();return D(a,c)})};o.delay=function(a,b){b||(b=l);return a instanceof Date?L(this,a.getTime(),b):D(this,a,b)};o.throttle=function(a,b){b||(b=l);var c=this;return m(function(d){var f=new t,e=!1,g=0,h,i=null;h=c.subscribe(function(c){var k;e=!0;i=c;g++;k=g;c=new r;f.disposable(c);
c.disposable(b.scheduleWithRelative(a,function(){if(e&&g===k)d.onNext(i);e=!1}))},function(a){f.dispose();d.onError(a);e=!1;g++},function(){f.dispose();if(e)d.onNext(i);d.onCompleted();e=!1;g++});return new s(h,f)})};o.windowWithTime=function(a,b,c){var d=this,f;b===n&&(f=a);c===n&&(c=l);"number"===typeof b?f=b:"object"===typeof b&&(f=a,c=b);return m(function(b){var g,h,i=f,j=a,k=[],x,C=new t,l=0;h=new s(C);x=new z(h);g=function(){var a,d,h,m,n;h=new r;C.disposable(h);a=d=!1;j===i?a=d=!0:j<i?d=!0:
a=!0;m=d?j:i;n=m-l;l=m;d&&(j+=f);a&&(i+=f);h.disposable(c.scheduleWithRelative(n,function(){var c;a&&(c=new u,k.push(c),b.onNext(v(c,x)));d&&(c=k.shift(),c.onCompleted());g()}))};k.push(new u);b.onNext(v(k[0],x));g();h.add(d.subscribe(function(a){var b,c;for(b=0;b<k.length;b++)c=k[b],c.onNext(a)},function(a){var c,d;for(c=0;c<k.length;c++)d=k[c],d.onError(a);b.onError(a)},function(){var a,c;for(a=0;a<k.length;a++)c=k[a],c.onCompleted();b.onCompleted()}));return x})};o.windowWithTimeOrCount=function(a,
b,c){var d=this;c||(c=l);return m(function(f){var e,g,h=0,i,j,k=new t,l=0;g=new s(k);i=new z(g);e=function(b){var d=new r;k.disposable(d);d.disposable(c.scheduleWithRelative(a,function(){var a;b===l&&(h=0,a=++l,j.onCompleted(),j=new u,f.onNext(v(j,i)),e(a))}))};j=new u;f.onNext(v(j,i));e(0);g.add(d.subscribe(function(a){var c=0,d=!1;j.onNext(a);h++;h===b&&(d=!0,h=0,c=++l,j.onCompleted(),j=new u,f.onNext(v(j,i)));d&&e(c)},function(a){j.onError(a);f.onError(a)},function(){j.onCompleted();f.onCompleted()}));
return i})};o.bufferWithTime=function(a,b,c){var d;b===n&&(d=a);c||(c=l);"number"===typeof b?d=b:"object"===typeof b&&(d=a,c=b);return this.windowWithTime(a,d,c).selectMany(function(a){return a.toArray()})};o.bufferWithTimeOrCount=function(a,b,c){c||(c=l);return this.windowWithTimeOrCount(a,b,c).selectMany(function(a){return a.toArray()})};o.timeInterval=function(a){var b=this;a||(a=l);return y(function(){var c=a.now();return b.select(function(b){var f=a.now(),e=f-c;c=f;return{value:b,interval:e}})})};
o.timestamp=function(a){a||(a=l);return this.select(function(b){return{value:b,timestamp:a.now()}})};var E=function(a,b){return H(a,b,function(a){var b=!1,f;return new G(function(e){"N"===e.kind&&(f=e);"E"===e.kind&&e.accept(a);"C"===e.kind&&(b=!0)},function(){var e=f;f=n;e!==n&&e.accept(a);if(b)a.onCompleted()})})};o.sample=function(a,b){b||(b=l);return"number"===typeof a?E(this,K(a,b)):E(this,a)};o.timeout=function(a,b,c){var d,f=this;b===n&&(b=F(Error("Timeout")));c||(c=l);d=a instanceof Date?
function(a,b){c.scheduleWithAbsolute(a,b)}:function(a,b){c.scheduleWithRelative(a,b)};return m(function(c){var g,h=0,i=new r,j=new t,k=!1,l=new t;j.disposable(i);g=function(){var f=h;l.disposable(d(a,function(){(k=h===f)&&j.disposable(b.subscribe(c))}))};g();i.disposable(f.subscribe(function(a){k||(h++,c.onNext(a),g())},function(a){k||(h++,c.onError(a))},function(){k||(h++,c.onCompleted())}));return new s(j,l)})};q.generateWithAbsoluteTime=function(a,b,c,d,f,e){e||(e=l);return m(function(g){var h=
!0,i=!1,j,k=a,l;return e.scheduleRecursiveWithAbsolute(e.now(),function(a){if(i)g.onNext(j);try{if(h?h=!1:k=c(k),i=b(k))j=d(k),l=f(k)}catch(e){g.onError(e);return}if(i)a(l);else g.onCompleted()})})};q.generateWithRelativeTime=function(a,b,c,d,f,e){e||(e=l);return m(function(g){var h=!0,i=!1,j,k=a,l;return e.scheduleRecursiveWithRelative(0,function(a){if(i)g.onNext(j);try{if(h?h=!1:k=c(k),i=b(k))j=d(k),l=f(k)}catch(e){g.onError(e);return}if(i)a(l);else g.onCompleted()})})}};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS9qcy9kZXZpY2UuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzLzNyZHBhcnR5L3RhcHBhYmxlLmpzIiwiL1VzZXJzL3Rhamltb2JpL1dvcmsvVUlkZXYvamV0cGV0cy9qZXRwZXRzL2Fzc2V0cy8zcmRwYXJ0eS9yb3V0aWUuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS9qcy9jb250cm9sbGVycy9yZWdpc3Rlci5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9hc3NldHMvZGV2aWNlL2pzL2NvbnRyb2xsZXJzL2pvaW4uanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS9qcy9jb250cm9sbGVycy90aGFua3MuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS9qcy9wbGF5ZXIuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9hc3NldHMvZGV2aWNlL2pzL2NvbnRyb2xsZXJzL3dhaXQuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS9qcy9jb250cm9sbGVycy9sb2JieS5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9hc3NldHMvZGV2aWNlL2pzL2NvbnRyb2xsZXJzL2dhbWVwYWQuanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzLzNyZHBhcnR5L3J4LnplcHRvLmpzIiwiL1VzZXJzL3Rhamltb2JpL1dvcmsvVUlkZXYvamV0cGV0cy9qZXRwZXRzL2Fzc2V0cy9kZXZpY2Uvdmlld3MvcmVnaXN0ZXItYWR2YW5jZWQuaGJzIiwiL1VzZXJzL3Rhamltb2JpL1dvcmsvVUlkZXYvamV0cGV0cy9qZXRwZXRzL2Fzc2V0cy9kZXZpY2Uvdmlld3Mvam9pbi5oYnMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS92aWV3cy93YWl0LmhicyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9hc3NldHMvZGV2aWNlL3ZpZXdzL3RoYW5rcy5oYnMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvYXNzZXRzL2RldmljZS92aWV3cy9nYW1lcGFkLmhicyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9hc3NldHMvZGV2aWNlL3ZpZXdzL2xvYmJ5LmhicyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9ub2RlX21vZHVsZXMvaGFuZGxlYmFycy1ydW50aW1lL2hhbmRsZWJhcnMucnVudGltZS5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9ub2RlX21vZHVsZXMvcnhqcy9saWIvcnguanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvbm9kZV9tb2R1bGVzL3J4anMvbGliL3J4Lm1pbi5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9ub2RlX21vZHVsZXMvcnhqcy9saWIvcnguYWdncmVnYXRlcy5taW4uanMiLCIvVXNlcnMvdGFqaW1vYmkvV29yay9VSWRldi9qZXRwZXRzL2pldHBldHMvbm9kZV9tb2R1bGVzL3J4anMvbGliL3J4LmNvaW5jaWRlbmNlLm1pbi5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9ub2RlX21vZHVsZXMvcnhqcy9saWIvcnguam9pbnBhdHRlcm5zLm1pbi5qcyIsIi9Vc2Vycy90YWppbW9iaS9Xb3JrL1VJZGV2L2pldHBldHMvamV0cGV0cy9ub2RlX21vZHVsZXMvcnhqcy9saWIvcngudGltZS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzc0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsidmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHRhcHBhYmxlID0gcmVxdWlyZSgnLi4vLi4vM3JkcGFydHkvdGFwcGFibGUnKTtcbnZhciBwbGF5ZXIgPSByZXF1aXJlKCcuL3BsYXllcicpO1xuXG53aW5kb3cuRGV2aWNlID0gZnVuY3Rpb24oKSB7XG4gIFxuICByb3V0aWUoe1xuICAgICAgJyc6ICAgICAgICAgICAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9yZWdpc3RlcicpLFxuICAgICAgJy9yZWdpc3Rlcic6ICAgcmVxdWlyZSgnLi9jb250cm9sbGVycy9yZWdpc3RlcicpLFxuICAgICAgJy93YWl0JzogICAgICAgcmVxdWlyZSgnLi9jb250cm9sbGVycy93YWl0JyksXG4gICAgICAnL2pvaW4nOiAgICAgICByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL2pvaW4nKSxcbiAgICAgICcvbG9iYnknOiAgICAgIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvbG9iYnknKSxcbiAgICAgICcvZ2FtZXBhZCc6ICAgIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvZ2FtZXBhZCcpLFxuICAgICAgJy90aGFua3MnOiAgICAgcmVxdWlyZSgnLi9jb250cm9sbGVycy90aGFua3MnKVxuICB9KTtcbiAgXG4gICQoJyNtZW51Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKHdpbmRvdy5jb25maXJtKCdkaXNjb25uZWN0IHBsYXllcj8nKSkge1xuICAgICAgcGxheWVyLnJlc2V0KCk7XG4gICAgICByb3V0aWUubmF2aWdhdGUoJy8nKTtcbiAgICB9XG4gIH0pO1xuICBcbn07XG4iLCIoZnVuY3Rpb24oKXsoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSl7XG4gIC8vIFNldCB1cCBUYXBwYWJsZSBhcHByb3ByaWF0ZWx5IGZvciB0aGUgZW52aXJvbm1lbnQuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpe1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSgndGFwcGFibGUnLCBbXSwgZnVuY3Rpb24oKXtcbiAgICAgIGZhY3Rvcnkocm9vdCwgd2luZG93LmRvY3VtZW50KTtcbiAgICAgIHJldHVybiByb290LnRhcHBhYmxlO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsIHNjb3BlXG4gICAgZmFjdG9yeShyb290LCB3aW5kb3cuZG9jdW1lbnQpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uKHcsIGQpe1xuXG4gIHZhciBhYnMgPSBNYXRoLmFicyxcbiAgICBub29wID0gZnVuY3Rpb24oKXt9LFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgbm9TY3JvbGw6IGZhbHNlLFxuICAgICAgYWN0aXZlQ2xhc3M6ICd0YXBwYWJsZS1hY3RpdmUnLFxuICAgICAgb25UYXA6IG5vb3AsXG4gICAgICBvblN0YXJ0OiBub29wLFxuICAgICAgb25Nb3ZlOiBub29wLFxuICAgICAgb25Nb3ZlT3V0OiBub29wLFxuICAgICAgb25Nb3ZlSW46IG5vb3AsXG4gICAgICBvbkVuZDogbm9vcCxcbiAgICAgIG9uQ2FuY2VsOiBub29wLFxuICAgICAgYWxsb3dDbGljazogZmFsc2UsXG4gICAgICBib3VuZE1hcmdpbjogNTAsXG4gICAgICBub1Njcm9sbERlbGF5OiAwLFxuICAgICAgYWN0aXZlQ2xhc3NEZWxheTogMCxcbiAgICAgIGluYWN0aXZlQ2xhc3NEZWxheTogMFxuICAgIH0sXG4gICAgc3VwcG9ydFRvdWNoID0gJ29udG91Y2hlbmQnIGluIGRvY3VtZW50LFxuICAgIGV2ZW50cyA9IHtcbiAgICAgIHN0YXJ0OiBzdXBwb3J0VG91Y2ggPyAndG91Y2hzdGFydCcgOiAnbW91c2Vkb3duJyxcbiAgICAgIG1vdmU6IHN1cHBvcnRUb3VjaCA/ICd0b3VjaG1vdmUnIDogJ21vdXNlbW92ZScsXG4gICAgICBlbmQ6IHN1cHBvcnRUb3VjaCA/ICd0b3VjaGVuZCcgOiAnbW91c2V1cCdcbiAgICB9LFxuICAgIGdldFRhcmdldEJ5Q29vcmRzID0gZnVuY3Rpb24oeCwgeSl7XG4gICAgICB2YXIgZWwgPSBkLmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgICBpZiAoZWwubm9kZVR5cGUgPT0gMykgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgcmV0dXJuIGVsO1xuICAgIH0sXG4gICAgZ2V0VGFyZ2V0ID0gZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBpZiAoZWwubm9kZVR5cGUgPT0gMykgZWwgPSBlbC5wYXJlbnROb2RlO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9XG4gICAgICB2YXIgdG91Y2ggPSBlLnRhcmdldFRvdWNoZXNbMF07XG4gICAgICByZXR1cm4gZ2V0VGFyZ2V0QnlDb29yZHModG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSk7XG4gICAgfSxcbiAgICBjbGVhbiA9IGZ1bmN0aW9uKHN0cil7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccysvZywgJyAnKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgfSxcbiAgICBhZGRDbGFzcyA9IGZ1bmN0aW9uKGVsLCBjbGFzc05hbWUpe1xuICAgICAgaWYgKCFjbGFzc05hbWUpIHJldHVybjtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3Qpe1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChjbGVhbihlbC5jbGFzc05hbWUpLmluZGV4T2YoY2xhc3NOYW1lKSA+IC0xKSByZXR1cm47XG4gICAgICBlbC5jbGFzc05hbWUgPSBjbGVhbihlbC5jbGFzc05hbWUgKyAnICcgKyBjbGFzc05hbWUpO1xuICAgIH0sXG4gICAgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbihlbCwgY2xhc3NOYW1lKXtcbiAgICAgIGlmICghY2xhc3NOYW1lKSByZXR1cm47XG4gICAgICBpZiAoZWwuY2xhc3NMaXN0KXtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKCcoXnxcXFxccyknICsgY2xhc3NOYW1lICsgJyg/OlxcXFxzfCQpJyksICckMScpO1xuICAgIH0sXG4gICAgbWF0Y2hlc1NlbGVjdG9yID0gZnVuY3Rpb24obm9kZSwgc2VsZWN0b3Ipe1xuICAgICAgdmFyIHJvb3QgPSBkLmRvY3VtZW50RWxlbWVudCxcbiAgICAgICAgbWF0Y2hlcyA9IHJvb3QubWF0Y2hlc1NlbGVjdG9yIHx8IHJvb3QubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHJvb3Qud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IHJvb3Qub01hdGNoZXNTZWxlY3RvciB8fCByb290Lm1zTWF0Y2hlc1NlbGVjdG9yO1xuICAgICAgcmV0dXJuIG1hdGNoZXMuY2FsbChub2RlLCBzZWxlY3Rvcik7XG4gICAgfSxcbiAgICBjbG9zZXN0ID0gZnVuY3Rpb24obm9kZSwgc2VsZWN0b3Ipe1xuICAgICAgdmFyIG1hdGNoZXMgPSBmYWxzZTtcbiAgICAgIGRvIHtcbiAgICAgICAgbWF0Y2hlcyA9IG1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZWxlY3Rvcik7XG4gICAgICB9IHdoaWxlICghbWF0Y2hlcyAmJiAobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkgJiYgbm9kZS5vd25lckRvY3VtZW50KTtcbiAgICAgIHJldHVybiBtYXRjaGVzID8gbm9kZSA6IGZhbHNlO1xuICAgIH07XG5cbiAgdy50YXBwYWJsZSA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBvcHRzKXtcbiAgICBpZiAodHlwZW9mIG9wdHMgPT0gJ2Z1bmN0aW9uJykgb3B0cyA9IHsgb25UYXA6IG9wdHMgfTtcbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0cykgb3B0aW9uc1trZXldID0gb3B0c1trZXldIHx8IGRlZmF1bHRzW2tleV07XG5cbiAgICB2YXIgZWwgPSBvcHRpb25zLmNvbnRhaW5lckVsZW1lbnQgfHwgZC5ib2R5LFxuICAgICAgc3RhcnRUYXJnZXQsXG4gICAgICBwcmV2VGFyZ2V0LFxuICAgICAgc3RhcnRYLFxuICAgICAgc3RhcnRZLFxuICAgICAgZWxCb3VuZCxcbiAgICAgIGNhbmNlbCA9IGZhbHNlLFxuICAgICAgbW92ZU91dCA9IGZhbHNlLFxuICAgICAgYWN0aXZlQ2xhc3MgPSBvcHRpb25zLmFjdGl2ZUNsYXNzLFxuICAgICAgYWN0aXZlQ2xhc3NEZWxheSA9IG9wdGlvbnMuYWN0aXZlQ2xhc3NEZWxheSxcbiAgICAgIGFjdGl2ZUNsYXNzVGltZW91dCxcbiAgICAgIGluYWN0aXZlQ2xhc3NEZWxheSA9IG9wdGlvbnMuaW5hY3RpdmVDbGFzc0RlbGF5LFxuICAgICAgaW5hY3RpdmVDbGFzc1RpbWVvdXQsXG4gICAgICBub1Njcm9sbCA9IG9wdGlvbnMubm9TY3JvbGwsXG4gICAgICBub1Njcm9sbERlbGF5ID0gb3B0aW9ucy5ub1Njcm9sbERlbGF5LFxuICAgICAgbm9TY3JvbGxUaW1lb3V0LFxuICAgICAgYm91bmRNYXJnaW4gPSBvcHRpb25zLmJvdW5kTWFyZ2luO1xuXG4gICAgdmFyIG9uU3RhcnQgPSBmdW5jdGlvbihlKXtcbiAgICAgIHZhciB0YXJnZXQgPSBjbG9zZXN0KGdldFRhcmdldChlKSwgc2VsZWN0b3IpO1xuICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcblxuICAgICAgaWYgKGFjdGl2ZUNsYXNzRGVsYXkpe1xuICAgICAgICBjbGVhclRpbWVvdXQoYWN0aXZlQ2xhc3NUaW1lb3V0KTtcbiAgICAgICAgYWN0aXZlQ2xhc3NUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgIGFkZENsYXNzKHRhcmdldCwgYWN0aXZlQ2xhc3MpO1xuICAgICAgICB9LCBhY3RpdmVDbGFzc0RlbGF5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKHRhcmdldCwgYWN0aXZlQ2xhc3MpO1xuICAgICAgfVxuICAgICAgaWYgKGluYWN0aXZlQ2xhc3NEZWxheSAmJiB0YXJnZXQgPT0gcHJldlRhcmdldCkgY2xlYXJUaW1lb3V0KGluYWN0aXZlQ2xhc3NUaW1lb3V0KTtcblxuICAgICAgc3RhcnRYID0gZS5jbGllbnRYO1xuICAgICAgc3RhcnRZID0gZS5jbGllbnRZO1xuICAgICAgaWYgKCFzdGFydFggfHwgIXN0YXJ0WSl7XG4gICAgICAgIHZhciB0b3VjaCA9IGUudGFyZ2V0VG91Y2hlc1swXTtcbiAgICAgICAgc3RhcnRYID0gdG91Y2guY2xpZW50WDtcbiAgICAgICAgc3RhcnRZID0gdG91Y2guY2xpZW50WTtcbiAgICAgIH1cbiAgICAgIHN0YXJ0VGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgY2FuY2VsID0gZmFsc2U7XG4gICAgICBtb3ZlT3V0ID0gZmFsc2U7XG4gICAgICBlbEJvdW5kID0gbm9TY3JvbGwgPyB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgOiBudWxsO1xuXG4gICAgICBpZiAobm9TY3JvbGxEZWxheSl7XG4gICAgICAgIGNsZWFyVGltZW91dChub1Njcm9sbFRpbWVvdXQpO1xuICAgICAgICBub1Njcm9sbCA9IGZhbHNlOyAvLyBzZXQgZmFsc2UgZmlyc3QsIHRoZW4gdHJ1ZSBhZnRlciBhIGRlbGF5XG4gICAgICAgIG5vU2Nyb2xsVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICBub1Njcm9sbCA9IHRydWU7XG4gICAgICAgIH0sIG5vU2Nyb2xsRGVsYXkpO1xuICAgICAgfVxuICAgICAgb3B0aW9ucy5vblN0YXJ0LmNhbGwoZWwsIGUsIHRhcmdldCk7XG4gICAgfTtcblxuICAgIHZhciBvbk1vdmUgPSBmdW5jdGlvbihlKXtcbiAgICAgIGlmICghc3RhcnRUYXJnZXQpIHJldHVybjtcblxuICAgICAgaWYgKG5vU2Nyb2xsKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGFjdGl2ZUNsYXNzVGltZW91dCk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldCxcbiAgICAgICAgeCA9IGUuY2xpZW50WCxcbiAgICAgICAgeSA9IGUuY2xpZW50WTtcbiAgICAgIGlmICghdGFyZ2V0IHx8ICF4IHx8ICF5KXsgLy8gVGhlIGV2ZW50IG1pZ2h0IGhhdmUgYSB0YXJnZXQgYnV0IG5vIGNsaWVudFgvWVxuICAgICAgICB2YXIgdG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgICAgICBpZiAoIXgpIHggPSB0b3VjaC5jbGllbnRYO1xuICAgICAgICBpZiAoIXkpIHkgPSB0b3VjaC5jbGllbnRZO1xuICAgICAgICBpZiAoIXRhcmdldCkgdGFyZ2V0ID0gZ2V0VGFyZ2V0QnlDb29yZHMoeCwgeSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChub1Njcm9sbCl7XG4gICAgICAgIGlmICh4PmVsQm91bmQubGVmdC1ib3VuZE1hcmdpbiAmJiB4PGVsQm91bmQucmlnaHQrYm91bmRNYXJnaW4gJiYgeT5lbEJvdW5kLnRvcC1ib3VuZE1hcmdpbiAmJiB5PGVsQm91bmQuYm90dG9tK2JvdW5kTWFyZ2luKXsgLy8gd2l0aGluIGVsZW1lbnQncyBib3VuZGFyeVxuICAgICAgICAgIG1vdmVPdXQgPSBmYWxzZTtcbiAgICAgICAgICBhZGRDbGFzcyhzdGFydFRhcmdldCwgYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgIG9wdGlvbnMub25Nb3ZlSW4uY2FsbChlbCwgZSwgdGFyZ2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3ZlT3V0ID0gdHJ1ZTtcbiAgICAgICAgICByZW1vdmVDbGFzcyhzdGFydFRhcmdldCwgYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgIG9wdGlvbnMub25Nb3ZlT3V0LmNhbGwoZWwsIGUsIHRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIWNhbmNlbCAmJiBhYnMoeSAtIHN0YXJ0WSkgPiAxMCl7XG4gICAgICAgIGNhbmNlbCA9IHRydWU7XG4gICAgICAgIHJlbW92ZUNsYXNzKHN0YXJ0VGFyZ2V0LCBhY3RpdmVDbGFzcyk7XG4gICAgICAgIG9wdGlvbnMub25DYW5jZWwuY2FsbCh0YXJnZXQsIGUpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zLm9uTW92ZS5jYWxsKGVsLCBlLCB0YXJnZXQpO1xuICAgIH07XG5cbiAgICB2YXIgb25FbmQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGlmICghc3RhcnRUYXJnZXQpIHJldHVybjtcblxuICAgICAgY2xlYXJUaW1lb3V0KGFjdGl2ZUNsYXNzVGltZW91dCk7XG4gICAgICBpZiAoaW5hY3RpdmVDbGFzc0RlbGF5KXtcbiAgICAgICAgaWYgKGFjdGl2ZUNsYXNzRGVsYXkgJiYgIWNhbmNlbCkgYWRkQ2xhc3Moc3RhcnRUYXJnZXQsIGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgdmFyIGFjdGl2ZVRhcmdldCA9IHN0YXJ0VGFyZ2V0O1xuICAgICAgICBpbmFjdGl2ZUNsYXNzVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICByZW1vdmVDbGFzcyhhY3RpdmVUYXJnZXQsIGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSwgaW5hY3RpdmVDbGFzc0RlbGF5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbW92ZUNsYXNzKHN0YXJ0VGFyZ2V0LCBhY3RpdmVDbGFzcyk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbnMub25FbmQuY2FsbChlbCwgZSwgc3RhcnRUYXJnZXQpO1xuXG4gICAgICB2YXIgcmlnaHRDbGljayA9IGUud2hpY2ggPT0gMyB8fCBlLmJ1dHRvbiA9PSAyO1xuICAgICAgaWYgKCFjYW5jZWwgJiYgIW1vdmVPdXQgJiYgIXJpZ2h0Q2xpY2spe1xuICAgICAgICBvcHRpb25zLm9uVGFwLmNhbGwoZWwsIGUsIHN0YXJ0VGFyZ2V0KTtcbiAgICAgIH1cblxuICAgICAgcHJldlRhcmdldCA9IHN0YXJ0VGFyZ2V0O1xuICAgICAgc3RhcnRUYXJnZXQgPSBudWxsO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBzdGFydFggPSBzdGFydFkgPSBudWxsO1xuICAgICAgfSwgNDAwKTtcbiAgICB9O1xuXG4gICAgdmFyIG9uQ2FuY2VsID0gZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoIXN0YXJ0VGFyZ2V0KSByZXR1cm47XG4gICAgICByZW1vdmVDbGFzcyhzdGFydFRhcmdldCwgYWN0aXZlQ2xhc3MpO1xuICAgICAgc3RhcnRUYXJnZXQgPSBzdGFydFggPSBzdGFydFkgPSBudWxsO1xuICAgICAgb3B0aW9ucy5vbkNhbmNlbC5jYWxsKGVsLCBlKTtcbiAgICB9O1xuXG4gICAgdmFyIG9uQ2xpY2sgPSBmdW5jdGlvbihlKXtcbiAgICAgIHZhciB0YXJnZXQgPSBjbG9zZXN0KGUudGFyZ2V0LCBzZWxlY3Rvcik7XG4gICAgICBpZiAodGFyZ2V0KXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSBlbHNlIGlmIChzdGFydFggJiYgc3RhcnRZICYmIGFicyhlLmNsaWVudFggLSBzdGFydFgpIDwgMjUgJiYgYWJzKGUuY2xpZW50WSAtIHN0YXJ0WSkgPCAyNSl7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudHMuc3RhcnQsIG9uU3RhcnQsIGZhbHNlKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzLm1vdmUsIG9uTW92ZSwgZmFsc2UpO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudHMuZW5kLCBvbkVuZCwgZmFsc2UpO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCBvbkNhbmNlbCwgZmFsc2UpO1xuXG4gICAgaWYgKCFvcHRpb25zLmFsbG93Q2xpY2spIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaywgZmFsc2UpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVsIDogZWwsXG4gICAgICBkZXN0cm95IDogZnVuY3Rpb24gKCkge1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50cy5zdGFydCwgb25TdGFydCwgZmFsc2UpO1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50cy5tb3ZlLCBvbk1vdmUsIGZhbHNlKTtcbiAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudHMuZW5kLCBvbkVuZCwgZmFsc2UpO1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIG9uQ2FuY2VsLCBmYWxzZSk7XG4gICAgICAgIGlmICghb3B0aW9ucy5hbGxvd0NsaWNrKSBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2ssIGZhbHNlKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuXG4gIH07XG5cbn0pKTtcbn0pKCkiLCIoZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSh3aW5kb3cpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChyb290LnJvdXRpZSA9IGZhY3Rvcnkod2luZG93KSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5yb3V0aWUgPSBmYWN0b3J5KHdpbmRvdyk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKHcpIHtcblxuICB2YXIgcm91dGVzID0gW107XG4gIHZhciBtYXAgPSB7fTtcbiAgdmFyIHJlZmVyZW5jZSA9IFwicm91dGllXCI7XG4gIHZhciBvbGRSZWZlcmVuY2UgPSB3W3JlZmVyZW5jZV07XG5cbiAgdmFyIFJvdXRlID0gZnVuY3Rpb24ocGF0aCwgbmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICB0aGlzLmtleXMgPSBbXTtcbiAgICB0aGlzLmZucyA9IFtdO1xuICAgIHRoaXMucGFyYW1zID0ge307XG4gICAgdGhpcy5yZWdleCA9IHBhdGhUb1JlZ2V4cCh0aGlzLnBhdGgsIHRoaXMua2V5cywgZmFsc2UsIGZhbHNlKTtcblxuICB9O1xuXG4gIFJvdXRlLnByb3RvdHlwZS5hZGRIYW5kbGVyID0gZnVuY3Rpb24oZm4pIHtcbiAgICB0aGlzLmZucy5wdXNoKGZuKTtcbiAgfTtcblxuICBSb3V0ZS5wcm90b3R5cGUucmVtb3ZlSGFuZGxlciA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSB0aGlzLmZucy5sZW5ndGg7IGkgPCBjOyBpKyspIHtcbiAgICAgIHZhciBmID0gdGhpcy5mbnNbaV07XG4gICAgICBpZiAoZm4gPT0gZikge1xuICAgICAgICB0aGlzLmZucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgUm91dGUucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgIGZvciAodmFyIGkgPSAwLCBjID0gdGhpcy5mbnMubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICB0aGlzLmZuc1tpXS5hcHBseSh0aGlzLCBwYXJhbXMpO1xuICAgIH1cbiAgfTtcblxuICBSb3V0ZS5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMpe1xuICAgIHZhciBtID0gdGhpcy5yZWdleC5leGVjKHBhdGgpO1xuXG4gICAgaWYgKCFtKSByZXR1cm4gZmFsc2U7XG5cblxuICAgIGZvciAodmFyIGkgPSAxLCBsZW4gPSBtLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB2YXIga2V5ID0gdGhpcy5rZXlzW2kgLSAxXTtcblxuICAgICAgdmFyIHZhbCA9ICgnc3RyaW5nJyA9PSB0eXBlb2YgbVtpXSkgPyBkZWNvZGVVUklDb21wb25lbnQobVtpXSkgOiBtW2ldO1xuXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHRoaXMucGFyYW1zW2tleS5uYW1lXSA9IHZhbDtcbiAgICAgIH1cbiAgICAgIHBhcmFtcy5wdXNoKHZhbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgUm91dGUucHJvdG90eXBlLnRvVVJMID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgdmFyIHBhdGggPSB0aGlzLnBhdGg7XG4gICAgZm9yICh2YXIgcGFyYW0gaW4gcGFyYW1zKSB7XG4gICAgICBwYXRoID0gcGF0aC5yZXBsYWNlKCcvOicrcGFyYW0sICcvJytwYXJhbXNbcGFyYW1dKTtcbiAgICB9XG4gICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXFwvOi4qXFw/L2csICcvJykucmVwbGFjZSgvXFw/L2csICcnKTtcbiAgICBpZiAocGF0aC5pbmRleE9mKCc6JykgIT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbWlzc2luZyBwYXJhbWV0ZXJzIGZvciB1cmw6ICcrcGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xuICB9O1xuXG4gIHZhciBwYXRoVG9SZWdleHAgPSBmdW5jdGlvbihwYXRoLCBrZXlzLCBzZW5zaXRpdmUsIHN0cmljdCkge1xuICAgIGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSByZXR1cm4gcGF0aDtcbiAgICBpZiAocGF0aCBpbnN0YW5jZW9mIEFycmF5KSBwYXRoID0gJygnICsgcGF0aC5qb2luKCd8JykgKyAnKSc7XG4gICAgcGF0aCA9IHBhdGhcbiAgICAgIC5jb25jYXQoc3RyaWN0ID8gJycgOiAnLz8nKVxuICAgICAgLnJlcGxhY2UoL1xcL1xcKC9nLCAnKD86LycpXG4gICAgICAucmVwbGFjZSgvXFwrL2csICdfX3BsdXNfXycpXG4gICAgICAucmVwbGFjZSgvKFxcLyk/KFxcLik/OihcXHcrKSg/OihcXCguKj9cXCkpKT8oXFw/KT8vZywgZnVuY3Rpb24oXywgc2xhc2gsIGZvcm1hdCwga2V5LCBjYXB0dXJlLCBvcHRpb25hbCl7XG4gICAgICAgIGtleXMucHVzaCh7IG5hbWU6IGtleSwgb3B0aW9uYWw6ICEhIG9wdGlvbmFsIH0pO1xuICAgICAgICBzbGFzaCA9IHNsYXNoIHx8ICcnO1xuICAgICAgICByZXR1cm4gJycgKyAob3B0aW9uYWwgPyAnJyA6IHNsYXNoKSArICcoPzonICsgKG9wdGlvbmFsID8gc2xhc2ggOiAnJykgKyAoZm9ybWF0IHx8ICcnKSArIChjYXB0dXJlIHx8IChmb3JtYXQgJiYgJyhbXi8uXSs/KScgfHwgJyhbXi9dKz8pJykpICsgJyknICsgKG9wdGlvbmFsIHx8ICcnKTtcbiAgICAgIH0pXG4gICAgICAucmVwbGFjZSgvKFtcXC8uXSkvZywgJ1xcXFwkMScpXG4gICAgICAucmVwbGFjZSgvX19wbHVzX18vZywgJyguKyknKVxuICAgICAgLnJlcGxhY2UoL1xcKi9nLCAnKC4qKScpO1xuICAgIHJldHVybiBuZXcgUmVnRXhwKCdeJyArIHBhdGggKyAnJCcsIHNlbnNpdGl2ZSA/ICcnIDogJ2knKTtcbiAgfTtcblxuICB2YXIgYWRkSGFuZGxlciA9IGZ1bmN0aW9uKHBhdGgsIGZuKSB7XG4gICAgdmFyIHMgPSBwYXRoLnNwbGl0KCcgJyk7XG4gICAgdmFyIG5hbWUgPSAocy5sZW5ndGggPT0gMikgPyBzWzBdIDogbnVsbDtcbiAgICBwYXRoID0gKHMubGVuZ3RoID09IDIpID8gc1sxXSA6IHNbMF07XG5cbiAgICBpZiAoIW1hcFtwYXRoXSkge1xuICAgICAgbWFwW3BhdGhdID0gbmV3IFJvdXRlKHBhdGgsIG5hbWUpO1xuICAgICAgcm91dGVzLnB1c2gobWFwW3BhdGhdKTtcbiAgICB9XG4gICAgbWFwW3BhdGhdLmFkZEhhbmRsZXIoZm4pO1xuICB9O1xuXG4gIHZhciByb3V0aWUgPSBmdW5jdGlvbihwYXRoLCBmbikge1xuICAgIGlmICh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWRkSGFuZGxlcihwYXRoLCBmbik7XG4gICAgICByb3V0aWUucmVsb2FkKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGF0aCA9PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgcCBpbiBwYXRoKSB7XG4gICAgICAgIGFkZEhhbmRsZXIocCwgcGF0aFtwXSk7XG4gICAgICB9XG4gICAgICByb3V0aWUucmVsb2FkKCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZm4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByb3V0aWUubmF2aWdhdGUocGF0aCk7XG4gICAgfVxuICB9O1xuXG4gIHJvdXRpZS5sb29rdXAgPSBmdW5jdGlvbihuYW1lLCBvYmopIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYyA9IHJvdXRlcy5sZW5ndGg7IGkgPCBjOyBpKyspIHtcbiAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tpXTtcbiAgICAgIGlmIChyb3V0ZS5uYW1lID09IG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHJvdXRlLnRvVVJMKG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJvdXRpZS5yZW1vdmUgPSBmdW5jdGlvbihwYXRoLCBmbikge1xuICAgIHZhciByb3V0ZSA9IG1hcFtwYXRoXTtcbiAgICBpZiAoIXJvdXRlKVxuICAgICAgcmV0dXJuO1xuICAgIHJvdXRlLnJlbW92ZUhhbmRsZXIoZm4pO1xuICB9O1xuXG4gIHJvdXRpZS5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICBtYXAgPSB7fTtcbiAgICByb3V0ZXMgPSBbXTtcbiAgfTtcblxuICByb3V0aWUubmF2aWdhdGUgPSBmdW5jdGlvbihwYXRoLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIHNpbGVudCA9IG9wdGlvbnMuc2lsZW50IHx8IGZhbHNlO1xuXG4gICAgaWYgKHNpbGVudCkge1xuICAgICAgcmVtb3ZlTGlzdGVuZXIoKTtcbiAgICB9XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gcGF0aDtcblxuICAgICAgaWYgKHNpbGVudCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBcbiAgICAgICAgICBhZGRMaXN0ZW5lcigpO1xuICAgICAgICB9LCAxKTtcbiAgICAgIH1cblxuICAgIH0sIDEpO1xuICB9O1xuXG4gIHJvdXRpZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgd1tyZWZlcmVuY2VdID0gb2xkUmVmZXJlbmNlO1xuICAgIHJldHVybiByb3V0aWU7XG4gIH07XG5cbiAgdmFyIGdldEhhc2ggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyaW5nKDEpO1xuICB9O1xuXG4gIHZhciBjaGVja1JvdXRlID0gZnVuY3Rpb24oaGFzaCwgcm91dGUpIHtcbiAgICB2YXIgcGFyYW1zID0gW107XG4gICAgaWYgKHJvdXRlLm1hdGNoKGhhc2gsIHBhcmFtcykpIHtcbiAgICAgIHJvdXRlLnJ1bihwYXJhbXMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICB2YXIgaGFzaENoYW5nZWQgPSByb3V0aWUucmVsb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhhc2ggPSBnZXRIYXNoKCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGMgPSByb3V0ZXMubGVuZ3RoOyBpIDwgYzsgaSsrKSB7XG4gICAgICB2YXIgcm91dGUgPSByb3V0ZXNbaV07XG4gICAgICBpZiAoY2hlY2tSb3V0ZShoYXNoLCByb3V0ZSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB2YXIgYWRkTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAody5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICB3LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBoYXNoQ2hhbmdlZCwgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3LmF0dGFjaEV2ZW50KCdvbmhhc2hjaGFuZ2UnLCBoYXNoQ2hhbmdlZCk7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh3LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHcucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGhhc2hDaGFuZ2VkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdy5kZXRhY2hFdmVudCgnb25oYXNoY2hhbmdlJywgaGFzaENoYW5nZWQpO1xuICAgIH1cbiAgfTtcbiAgYWRkTGlzdGVuZXIoKTtcblxuICByZXR1cm4gcm91dGllO1xufSkpO1xuIiwidmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHBsYXllciA9IHJlcXVpcmUoJy4uL3BsYXllcicpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi8uLi92aWV3cy9yZWdpc3Rlci1hZHZhbmNlZC5oYnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgXG4gIGlmIChwbGF5ZXIuZ2V0KCkuaWQpIHtcbiAgICByZXR1cm4gcm91dGllLm5hdmlnYXRlKCcvd2FpdCcpO1xuICB9XG4gIFxuICAkKCcjcGFnZScpLmF0dHIoJ2NsYXNzJywgJ3JlZ2lzdGVyJyk7XG4gICQoJyNwYWdlJykuaHRtbCh2aWV3KCkpO1xuICBcbiAgJCgnYnV0dG9uJykub24oJ2NsaWNrJywgcmVnaXN0ZXIpO1xuICBcbn07XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyKGUpIHtcbiAgdmFyIGRhdGEgPSB7XG4gICAgZmlyc3ROYW1lOiAgICAkKCcjZmlyc3ROYW1lJykudmFsKCksXG4gICAgbGFzdE5hbWU6ICAgICAkKCcjbGFzdE5hbWUnKS52YWwoKSxcbiAgICBjb21wYW55OiAgICAgICQoJyNjb21wYW55JykudmFsKCksXG4gICAgY291bnRyeTogICAgICAkKCcjY291bnRyeScpLnZhbCgpLFxuICAgIHJvbGU6ICAgICAgICAgJCgnI3JvbGUnKS52YWwoKSxcbiAgICBlbWFpbDogICAgICAgICQoJyNlbWFpbCcpLnZhbCgpXG4gIH07XG4gIGNvbnNvbGUubG9nKFwiRklFTERTXCIsIGRhdGEpO1xuICAkLmFqYXgoe1xuICAgIHR5cGU6ICdQT1NUJyxcbiAgICB1cmw6ICcvcGxheWVyJyxcbiAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCdcbiAgfSkudGhlbihnbykuZmFpbChlcnJvcik7XG4gIFxuICAvLyAkLnBvc3QoJy9wbGF5ZXInLCBkYXRhKS50aGVuKGdvKS5mYWlsKGVycm9yKTtcbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGdvKGRhdGEpIHtcbiAgcGxheWVyLnNldCh7XG4gICAgaWQ6IGRhdGEuaWQsXG4gICAgbmFtZTogZGF0YS5uYW1lXG4gIH0pO1xuICByb3V0aWUubmF2aWdhdGUoJy93YWl0Jyk7XG59XG5cbmZ1bmN0aW9uIGVycm9yKHJlcykge1xuICBhbGVydCgnRXJyb3I6ICcgKyByZXMpO1xufVxuIiwidmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHBsYXllciA9IHJlcXVpcmUoJy4uL3BsYXllcicpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi8uLi92aWV3cy9qb2luLmhicycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICBcbiAgaWYgKHBsYXllci5nZXQoKS5pZCA9PSB1bmRlZmluZWQpIHtcbiAgICByb3V0aWUubmF2aWdhdGUoJy9jb25uZWN0Jyk7XG4gIH1cbiAgXG4gICQoJyNwYWdlJykuYXR0cignY2xhc3MnLCAnam9pbicpO1xuICAkKCcjcGFnZScpLmh0bWwodmlldygpKTtcbiAgJCgnYnV0dG9uJykub24oJ2NsaWNrJywgam9pbkxvYmJ5KTtcblxufTtcblxuZnVuY3Rpb24gam9pbkxvYmJ5KGUpIHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgZGF0YSA9IHsgcGxheWVySWQ6IHBsYXllci5nZXQoKS5pZCB9O1xuICAkLnBvc3QoJy9nYW1lL3BsYXllcnMnLCBkYXRhKS50aGVuKGpvaW5lZCkuZmFpbChiYWNrVG9XYWl0KTtcbn1cblxuZnVuY3Rpb24gam9pbmVkKGRhdGEpIHtcbiAgcm91dGllLm5hdmlnYXRlKCcvbG9iYnknKTtcbn1cblxuZnVuY3Rpb24gYmFja1RvV2FpdCgpIHtcbiAgcm91dGllLm5hdmlnYXRlKCcvd2FpdCcpO1xufVxuIiwidmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi8uLi92aWV3cy90aGFua3MuaGJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIFxuICAkKCcjcGFnZScpLmF0dHIoJ2NsYXNzJywgJ3RoYW5rcycpO1xuICAkKCcjcGFnZScpLmh0bWwodmlldygpKTtcbiAgXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgcm91dGllLm5hdmlnYXRlKCcvY29ubmVjdCcpO1xuICB9LCA0MDAwKTtcbiAgXG59O1xuIiwidmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG52YXIgcGxheWVyID0gbnVsbDtcblxudmFyIEtFWSA9ICdwbGF5ZXInO1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIXBsYXllcikge1xuICAgIGxvYWQoKTtcbiAgfVxuICByZXR1cm4gcGxheWVyO1xufTtcblxuZXhwb3J0cy5zZXQgPSBmdW5jdGlvbihhdHRycykge1xuICBwbGF5ZXIgPSBfLmV4dGVuZChwbGF5ZXIgfHwge30sIGF0dHJzKTtcbiAgc2F2ZSgpO1xufTtcblxuZXhwb3J0cy5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICBwbGF5ZXIgPSBudWxsO1xuICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oS0VZKTtcbn07XG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHBsYXllciA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKEtFWSkgfHwgJ3t9Jyk7XG59XG5cbmZ1bmN0aW9uIHNhdmUoKSB7XG4gIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShLRVksIEpTT04uc3RyaW5naWZ5KHBsYXllcikpO1xufVxuIiwiKGZ1bmN0aW9uKCl7Ly8gICAgIFVuZGVyc2NvcmUuanMgMS40LjRcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIEluYy5cbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGdsb2JhbGAgb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSBvYmplY3QgdGhhdCBnZXRzIHJldHVybmVkIHRvIGJyZWFrIG91dCBvZiBhIGxvb3AgaXRlcmF0aW9uLlxuICB2YXIgYnJlYWtlciA9IHt9O1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUZvckVhY2ggICAgICA9IEFycmF5UHJvdG8uZm9yRWFjaCxcbiAgICBuYXRpdmVNYXAgICAgICAgICAgPSBBcnJheVByb3RvLm1hcCxcbiAgICBuYXRpdmVSZWR1Y2UgICAgICAgPSBBcnJheVByb3RvLnJlZHVjZSxcbiAgICBuYXRpdmVSZWR1Y2VSaWdodCAgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0LFxuICAgIG5hdGl2ZUZpbHRlciAgICAgICA9IEFycmF5UHJvdG8uZmlsdGVyLFxuICAgIG5hdGl2ZUV2ZXJ5ICAgICAgICA9IEFycmF5UHJvdG8uZXZlcnksXG4gICAgbmF0aXZlU29tZSAgICAgICAgID0gQXJyYXlQcm90by5zb21lLFxuICAgIG5hdGl2ZUluZGV4T2YgICAgICA9IEFycmF5UHJvdG8uaW5kZXhPZixcbiAgICBuYXRpdmVMYXN0SW5kZXhPZiAgPSBBcnJheVByb3RvLmxhc3RJbmRleE9mLFxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0IHZpYSBhIHN0cmluZyBpZGVudGlmaWVyLFxuICAvLyBmb3IgQ2xvc3VyZSBDb21waWxlciBcImFkdmFuY2VkXCIgbW9kZS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS40LjQnO1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgb2JqZWN0cyB3aXRoIHRoZSBidWlsdC1pbiBgZm9yRWFjaGAsIGFycmF5cywgYW5kIHJhdyBvYmplY3RzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZm9yRWFjaGAgaWYgYXZhaWxhYmxlLlxuICB2YXIgZWFjaCA9IF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybjtcbiAgICBpZiAobmF0aXZlRm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gbmF0aXZlRm9yRWFjaCkge1xuICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoXy5oYXMob2JqLCBrZXkpKSB7XG4gICAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleV0sIGtleSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0b3IgdG8gZWFjaCBlbGVtZW50LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbWFwYCBpZiBhdmFpbGFibGUuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlTWFwICYmIG9iai5tYXAgPT09IG5hdGl2ZU1hcCkgcmV0dXJuIG9iai5tYXAoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGhdID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIHZhciByZWR1Y2VFcnJvciA9ICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJztcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2UgJiYgb2JqLnJlZHVjZSA9PT0gbmF0aXZlUmVkdWNlKSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IHZhbHVlO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZVJpZ2h0YCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlUmlnaHQgJiYgb2JqLnJlZHVjZVJpZ2h0ID09PSBuYXRpdmVSZWR1Y2VSaWdodCkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvcik7XG4gICAgfVxuICAgIHZhciBsZW5ndGggPSBvYmoubGVuZ3RoO1xuICAgIGlmIChsZW5ndGggIT09ICtsZW5ndGgpIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaW5kZXggPSBrZXlzID8ga2V5c1stLWxlbmd0aF0gOiAtLWxlbmd0aDtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gb2JqW2luZGV4XTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCBvYmpbaW5kZXhdLCBpbmRleCwgbGlzdCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFpbml0aWFsKSB0aHJvdyBuZXcgVHlwZUVycm9yKHJlZHVjZUVycm9yKTtcbiAgICByZXR1cm4gbWVtbztcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmaWx0ZXJgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZUZpbHRlciAmJiBvYmouZmlsdGVyID09PSBuYXRpdmVGaWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoXSA9IHZhbHVlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuICFpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIShyZXN1bHQgPSByZXN1bHQgJiYgaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgc29tZWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICB2YXIgYW55ID0gXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgfHwgKGl0ZXJhdG9yID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAobmF0aXZlU29tZSAmJiBvYmouc29tZSA9PT0gbmF0aXZlU29tZSkgcmV0dXJuIG9iai5zb21lKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiB2YWx1ZSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgb2JqLmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBvYmouaW5kZXhPZih0YXJnZXQpICE9IC0xO1xuICAgIHJldHVybiBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSB0YXJnZXQ7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAoaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuIHZhbHVlW2tleV07IH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMsIGZpcnN0KSB7XG4gICAgaWYgKF8uaXNFbXB0eShhdHRycykpIHJldHVybiBmaXJzdCA/IG51bGwgOiBbXTtcbiAgICByZXR1cm4gX1tmaXJzdCA/ICdmaW5kJyA6ICdmaWx0ZXInXShvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgaWYgKGF0dHJzW2tleV0gIT09IHZhbHVlW2tleV0pIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8ud2hlcmUob2JqLCBhdHRycywgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgb3IgKGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICAvLyBDYW4ndCBvcHRpbWl6ZSBhcnJheXMgb2YgaW50ZWdlcnMgbG9uZ2VyIHRoYW4gNjUsNTM1IGVsZW1lbnRzLlxuICAvLyBTZWU6IGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD04MDc5N1xuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNFbXB0eShvYmopKSByZXR1cm4gLUluZmluaXR5O1xuICAgIHZhciByZXN1bHQgPSB7Y29tcHV0ZWQgOiAtSW5maW5pdHksIHZhbHVlOiAtSW5maW5pdHl9O1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHZhciBjb21wdXRlZCA9IGl0ZXJhdG9yID8gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpIDogdmFsdWU7XG4gICAgICBjb21wdXRlZCA+PSByZXN1bHQuY29tcHV0ZWQgJiYgKHJlc3VsdCA9IHt2YWx1ZSA6IHZhbHVlLCBjb21wdXRlZCA6IGNvbXB1dGVkfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdC52YWx1ZTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0VtcHR5KG9iaikpIHJldHVybiBJbmZpbml0eTtcbiAgICB2YXIgcmVzdWx0ID0ge2NvbXB1dGVkIDogSW5maW5pdHksIHZhbHVlOiBJbmZpbml0eX07XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGNvbXB1dGVkIDwgcmVzdWx0LmNvbXB1dGVkICYmIChyZXN1bHQgPSB7dmFsdWUgOiB2YWx1ZSwgY29tcHV0ZWQgOiBjb21wdXRlZH0pO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQudmFsdWU7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhbiBhcnJheS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbShpbmRleCsrKTtcbiAgICAgIHNodWZmbGVkW2luZGV4IC0gMV0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGxvb2t1cCBpdGVyYXRvcnMuXG4gIHZhciBsb29rdXBJdGVyYXRvciA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZSA6IGZ1bmN0aW9uKG9iail7IHJldHVybiBvYmpbdmFsdWVdOyB9O1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRvci5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IodmFsdWUpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZSA6IHZhbHVlLFxuICAgICAgICBpbmRleCA6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYSA6IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IDwgcmlnaHQuaW5kZXggPyAtMSA6IDE7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24ob2JqLCB2YWx1ZSwgY29udGV4dCwgYmVoYXZpb3IpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IodmFsdWUgfHwgXy5pZGVudGl0eSk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgdmFyIGtleSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgYmVoYXZpb3IocmVzdWx0LCBrZXksIHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGZ1bmN0aW9uKG9iaiwgdmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gZ3JvdXAob2JqLCB2YWx1ZSwgY29udGV4dCwgZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgICAoXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0gOiAocmVzdWx0W2tleV0gPSBbXSkpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBmdW5jdGlvbihvYmosIHZhbHVlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGdyb3VwKG9iaiwgdmFsdWUsIGNvbnRleHQsIGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgICBpZiAoIV8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0gPSAwO1xuICAgICAgcmVzdWx0W2tleV0rKztcbiAgICB9KTtcbiAgfTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0b3IgPSBpdGVyYXRvciA9PSBudWxsID8gXy5pZGVudGl0eSA6IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W21pZF0pIDwgdmFsdWUgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY29udmVydCBhbnl0aGluZyBpdGVyYWJsZSBpbnRvIGEgcmVhbCwgbGl2ZSBhcnJheS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICByZXR1cm4gKG4gIT0gbnVsbCkgJiYgIWd1YXJkID8gc2xpY2UuY2FsbChhcnJheSwgMCwgbikgOiBhcnJheVswXTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiAhPSBudWxsKSAmJiAhZ3VhcmQpIHtcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBvdXRwdXQpIHtcbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgc2hhbGxvdyA/IHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSkgOiBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBvdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29tcGxldGVseSBmbGF0dGVuZWQgdmVyc2lvbiBvZiBhbiBhcnJheS5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgW10pO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5pbmRleE9mKG90aGVyLCBpdGVtKSA+PSAwO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7IHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7IH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgdmFyIGxlbmd0aCA9IF8ubWF4KF8ucGx1Y2soYXJncywgJ2xlbmd0aCcpKTtcbiAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdHNbaV0gPSBfLnBsdWNrKGFyZ3MsIFwiXCIgKyBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIGlmIChsaXN0ID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7XG4gICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICBpZiAodHlwZW9mIGlzU29ydGVkID09ICdudW1iZXInKSB7XG4gICAgICAgIGkgPSAoaXNTb3J0ZWQgPCAwID8gTWF0aC5tYXgoMCwgbCArIGlzU29ydGVkKSA6IGlzU29ydGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBhcnJheS5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtLCBpc1NvcnRlZCk7XG4gICAgZm9yICg7IGkgPCBsOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW4gPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbik7XG5cbiAgICB3aGlsZShpZHggPCBsZW4pIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAoZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kICYmIG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBCaW5kIGFsbCBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXRcbiAgLy8gYWxsIGNhbGxiYWNrcyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBmdW5jcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSBmdW5jcyA9IF8uZnVuY3Rpb25zKG9iaik7XG4gICAgZWFjaChmdW5jcywgZnVuY3Rpb24oZikgeyBvYmpbZl0gPSBfLmJpbmQob2JqW2ZdLCBvYmopOyB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vID0ge307XG4gICAgaGFzaGVyIHx8IChoYXNoZXIgPSBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gXy5oYXMobWVtbywga2V5KSA/IG1lbW9ba2V5XSA6IChtZW1vW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7IH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCB0aW1lb3V0LCByZXN1bHQ7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gbmV3IERhdGU7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGU7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCByZXN1bHQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH07XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIHJhbiA9IGZhbHNlLCBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyYW4pIHJldHVybiBtZW1vO1xuICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzID0gW2Z1bmNdO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHdyYXBwZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgaWYgKHRpbWVzIDw9IDApIHJldHVybiBmdW5jKCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBuYXRpdmVLZXlzIHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogIT09IE9iamVjdChvYmopKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9iamVjdCcpO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5c1trZXlzLmxlbmd0aF0gPSBrZXk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSB2YWx1ZXMucHVzaChvYmpba2V5XSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBwYWlycyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHBhaXJzLnB1c2goW2tleSwgb2JqW2tleV1dKTtcbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXN1bHRbb2JqW2tleV1dID0ga2V5O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT0gbnVsbCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBIYXJtb255IGBlZ2FsYCBwcm9wb3NhbDogaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuIGEgPT0gU3RyaW5nKGIpO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS4gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvclxuICAgICAgICAvLyBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuIGEgIT0gK2EgPyBiICE9ICtiIDogKGEgPT0gMCA/IDEgLyBhID09IDEgLyBiIDogYSA9PSArYik7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT0gK2I7XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb21wYXJlZCBieSB0aGVpciBzb3VyY2UgcGF0dGVybnMgYW5kIGZsYWdzLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgICAgcmV0dXJuIGEuc291cmNlID09IGIuc291cmNlICYmXG4gICAgICAgICAgICAgICBhLmdsb2JhbCA9PSBiLmdsb2JhbCAmJlxuICAgICAgICAgICAgICAgYS5tdWx0aWxpbmUgPT0gYi5tdWx0aWxpbmUgJiZcbiAgICAgICAgICAgICAgIGEuaWdub3JlQ2FzZSA9PSBiLmlnbm9yZUNhc2U7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PSBiO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUgPSAwLCByZXN1bHQgPSB0cnVlO1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgKGFDdG9yIGluc3RhbmNlb2YgYUN0b3IpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiAoYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcikpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICAgICAgaWYgKF8uaGFzKGEsIGtleSkpIHtcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZXhwZWN0ZWQgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICAgICAgc2l6ZSsrO1xuICAgICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlci5cbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIGZvciAoa2V5IGluIGIpIHtcbiAgICAgICAgICBpZiAoXy5oYXMoYiwga2V5KSAmJiAhKHNpemUtLSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9ICFzaXplO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYiwgW10sIFtdKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLlxuICBlYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiAhIShvYmogJiYgXy5oYXMob2JqLCAnY2FsbGVlJykpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuXG4gIGlmICh0eXBlb2YgKC8uLykgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdG9ycy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIGVzY2FwZToge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICAgJy8nOiAnJiN4MkY7J1xuICAgIH1cbiAgfTtcbiAgZW50aXR5TWFwLnVuZXNjYXBlID0gXy5pbnZlcnQoZW50aXR5TWFwLmVzY2FwZSk7XG5cbiAgLy8gUmVnZXhlcyBjb250YWluaW5nIHRoZSBrZXlzIGFuZCB2YWx1ZXMgbGlzdGVkIGltbWVkaWF0ZWx5IGFib3ZlLlxuICB2YXIgZW50aXR5UmVnZXhlcyA9IHtcbiAgICBlc2NhcGU6ICAgbmV3IFJlZ0V4cCgnWycgKyBfLmtleXMoZW50aXR5TWFwLmVzY2FwZSkuam9pbignJykgKyAnXScsICdnJyksXG4gICAgdW5lc2NhcGU6IG5ldyBSZWdFeHAoJygnICsgXy5rZXlzKGVudGl0eU1hcC51bmVzY2FwZSkuam9pbignfCcpICsgJyknLCAnZycpXG4gIH07XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICBfLmVhY2goWydlc2NhcGUnLCAndW5lc2NhcGUnXSwgZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgX1ttZXRob2RdID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nID09IG51bGwpIHJldHVybiAnJztcbiAgICAgIHJldHVybiAoJycgKyBzdHJpbmcpLnJlcGxhY2UoZW50aXR5UmVnZXhlc1ttZXRob2RdLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICByZXR1cm4gZW50aXR5TWFwW21ldGhvZF1bbWF0Y2hdO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBwcm9wZXJ0eSBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0O1xuICAvLyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3RbcHJvcGVydHldO1xuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKXtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHQnOiAgICAgJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHR8XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIGRhdGEsIHNldHRpbmdzKSB7XG4gICAgdmFyIHJlbmRlcjtcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgICAgICAucmVwbGFjZShlc2NhcGVyLCBmdW5jdGlvbihtYXRjaCkgeyByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07IH0pO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgXCJyZXR1cm4gX19wO1xcblwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkgcmV0dXJuIHJlbmRlcihkYXRhLCBfKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIChzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJykgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbiwgd2hpY2ggd2lsbCBkZWxlZ2F0ZSB0byB0aGUgd3JhcHBlci5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfKG9iaikuY2hhaW4oKTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT0gJ3NoaWZ0JyB8fCBuYW1lID09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgXy5leHRlbmQoXy5wcm90b3R5cGUsIHtcblxuICAgIC8vIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgICBjaGFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jaGFpbiA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gICAgfVxuXG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuXG59KSgpIiwidmFyIHJ4ID0gcmVxdWlyZSgncnhqcycpO1xudmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHBsYXllciA9IHJlcXVpcmUoJy4uL3BsYXllcicpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi8uLi92aWV3cy93YWl0LmhicycpO1xucmVxdWlyZSgnLi4vLi4vLi4vM3JkcGFydHkvcnguemVwdG8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgXG4gIGlmIChwbGF5ZXIuZ2V0KCkuaWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgcm91dGllLm5hdmlnYXRlKCcvY29ubmVjdCcpO1xuICB9XG4gIFxuICAkKCcjcGFnZScpLmF0dHIoJ2NsYXNzJywgJ3dhaXQnKTtcbiAgJCgnI3BhZ2UnKS5odG1sKHZpZXcoKSk7XG5cbiAgdmFyIG9ic2VydmFibGUgPSByeC5PYnNlcnZhYmxlXG4gICAgLmludGVydmFsKDMwMDApXG4gICAgLnN0YXJ0V2l0aCgtMSlcbiAgICAuc2VsZWN0TWFueShvYnNlcnZhYmxlTG9iYnkpXG4gICAgLnNraXBXaGlsZShnYW1lSW5Qcm9ncmVzcylcbiAgICAudGFrZSgxKVxuICAgIC5zdWJzY3JpYmUoc3dpdGNoU3RhdGUsIG9uRXJyb3IpO1xuXG59O1xuXG5mdW5jdGlvbiBvYnNlcnZhYmxlTG9iYnkoKSB7XG4gIHJldHVybiAkLmdldEpTT05Bc09ic2VydmFibGUoJy9nYW1lL3N0YXR1cycpO1xufVxuXG5mdW5jdGlvbiBnYW1lSW5Qcm9ncmVzcyhyZXMpIHtcbiAgcmV0dXJuIHJlcy5kYXRhLmluUHJvZ3Jlc3MgPT09IHRydWU7XG59XG5cbmZ1bmN0aW9uIHN3aXRjaFN0YXRlKCkge1xuICByb3V0aWUubmF2aWdhdGUoJy9qb2luJyk7XG59XG5cbmZ1bmN0aW9uIG9uRXJyb3IoKSB7XG4gIGNvbnNvbGUubG9nKCdHYW1lIG5vdCByZXNwb25kaW5nJyk7XG59XG4iLCJ2YXIgcnggPSByZXF1aXJlKCdyeGpzJyk7XG52YXIgcm91dGllID0gcmVxdWlyZSgnLi4vLi4vLi4vM3JkcGFydHkvcm91dGllJyk7XG52YXIgcGxheWVyID0gcmVxdWlyZSgnLi4vcGxheWVyJyk7XG52YXIgdmlldyA9IHJlcXVpcmUoJy4uLy4uL3ZpZXdzL2xvYmJ5LmhicycpO1xucmVxdWlyZSgnLi4vLi4vLi4vM3JkcGFydHkvcnguemVwdG8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgXG4gIGlmIChwbGF5ZXIuZ2V0KCkuaWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgcm91dGllLm5hdmlnYXRlKCcvY29ubmVjdCcpO1xuICB9XG4gIFxuICAkKCcjcGFnZScpLmF0dHIoJ2NsYXNzJywgJ2xvYmJ5Jyk7XG4gICQoJyNwYWdlJykuaHRtbCh2aWV3KCkpO1xuICAkKCcjY2FuY2VsJykub24oJ2NsaWNrJywgZXhpdExvYmJ5KTtcblxuICB2YXIgb2JzZXJ2YWJsZSA9IHJ4Lk9ic2VydmFibGVcbiAgICAuaW50ZXJ2YWwoMTAwMClcbiAgICAuc3RhcnRXaXRoKC0xKVxuICAgIC5zZWxlY3RNYW55KG9ic2VydmFibGVMb2JieSlcbiAgICAuc2tpcFdoaWxlKHdhaXRpbmdGb3JPdGhlclBsYXllcilcbiAgICAudGFrZSgxKVxuICAgIC5zdWJzY3JpYmUoc3RhcnRNYXRjaCwgb25FcnJvcik7XG5cbn07XG5cbmZ1bmN0aW9uIG9ic2VydmFibGVMb2JieSgpIHtcbiAgcmV0dXJuICQuZ2V0SlNPTkFzT2JzZXJ2YWJsZSgnL2dhbWUvc3RhdHVzJyk7XG59XG5cbmZ1bmN0aW9uIHdhaXRpbmdGb3JPdGhlclBsYXllcihyZXMpIHtcbiAgcmV0dXJuIHJlcy5kYXRhLmluUHJvZ3Jlc3MgPT09IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzdGFydE1hdGNoKCkge1xuICByb3V0aWUubmF2aWdhdGUoJy9nYW1lcGFkJyk7XG59XG5cbmZ1bmN0aW9uIG9uRXJyb3IoKSB7XG4gIGNvbnNvbGUubG9nKCdHYW1lIG5vdCByZXNwb25kaW5nJyk7XG59XG5cbmZ1bmN0aW9uIGV4aXRMb2JieSgpIHtcbiAgJC5hamF4KHtcbiAgICB0eXBlOiAnREVMRVRFJyxcbiAgICB1cmw6ICcvZ2FtZS9wbGF5ZXJzLycgKyBwbGF5ZXIuZ2V0KCkuaWRcbiAgfSkudGhlbihiYWNrVG9XYWl0KTtcbn1cblxuZnVuY3Rpb24gYmFja1RvV2FpdCgpIHtcbiAgcm91dGllLm5hdmlnYXRlKCcvd2FpdCcpO1xufVxuIiwidmFyIHJ4ID0gcmVxdWlyZSgncnhqcycpO1xudmFyIHJvdXRpZSA9IHJlcXVpcmUoJy4uLy4uLy4uLzNyZHBhcnR5L3JvdXRpZScpO1xudmFyIHBsYXllciA9IHJlcXVpcmUoJy4uL3BsYXllcicpO1xudmFyIHZpZXcgPSByZXF1aXJlKCcuLi8uLi92aWV3cy9nYW1lcGFkLmhicycpO1xudmFyIG9ic2VydmFibGUgPSBudWxsO1xudmFyIHNvY2tldCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICBpZiAocGxheWVyLmdldCgpLmlkID09IHVuZGVmaW5lZCkge1xuICAgIHJvdXRpZS5uYXZpZ2F0ZSgnL2Nvbm5lY3QnKTtcbiAgfVxuXG4gIHNvY2tldCA9IGlvLmNvbm5lY3QoJy8nKVxuICBcbiAgJCgnI3BhZ2UnKS5hdHRyKCdjbGFzcycsICdnYW1lcGFkJyk7XG4gICQoJyNwYWdlJykuaHRtbCh2aWV3KCkpO1xuXG4gIG9ic2VydmFibGUgPSByeC5PYnNlcnZhYmxlXG4gICAgLmludGVydmFsKDIwMDApXG4gICAgLnN0YXJ0V2l0aCgtMSlcbiAgICAuc2VsZWN0TWFueShvYnNlcnZhYmxlR2FtZSlcbiAgICAuc3Vic2NyaWJlKGNoZWNrR2FtZVN0YXR1cywgb25FcnJvcik7XG5cbiAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuICAgICQoJy5idXR0b24udXAnKS5vbigndG91Y2hzdGFydCcsIGdvVXApO1xuICAgICQoJy5idXR0b24udXAnKS5vbigndG91Y2hlbmQnLCBzdG9wKTtcbiAgICAkKCcuYnV0dG9uLmRvd24nKS5vbigndG91Y2hzdGFydCcsIGdvRG93bik7XG4gICAgJCgnLmJ1dHRvbi5kb3duJykub24oJ3RvdWNoZW5kJywgc3RvcCk7XG4gIH0gZWxzZSB7XG4gICAgJCgnLmJ1dHRvbi51cCcpLm9uKCdtb3VzZWRvd24nLCBnb1VwKTtcbiAgICAkKCcuYnV0dG9uLnVwJykub24oJ21vdXNldXAnLCBzdG9wKTtcbiAgICAkKCcuYnV0dG9uLmRvd24nKS5vbignbW91c2Vkb3duJywgZ29Eb3duKTtcbiAgICAkKCcuYnV0dG9uLmRvd24nKS5vbignbW91c2V1cCcsIHN0b3ApO1xuICB9XG4gIFxufTtcblxuZnVuY3Rpb24gZ29VcChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdwcmVzc2VkJyk7XG4gIHNlbmRBY3Rpb24oJ3VwJyk7XG59XG5cbmZ1bmN0aW9uIGdvRG93bihlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLmFkZENsYXNzKCdwcmVzc2VkJyk7XG4gIHNlbmRBY3Rpb24oJ2Rvd24nKTtcbn1cblxuZnVuY3Rpb24gc3RvcChlKSB7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgJChlLmN1cnJlbnRUYXJnZXQpLnJlbW92ZUNsYXNzKCdwcmVzc2VkJyk7XG59XG5cbmZ1bmN0aW9uIHNlbmRBY3Rpb24oYWN0aW9uTmFtZSkge1xuICBzb2NrZXQuZW1pdCgnbW92ZScsIHsgcGxheWVyOiBwbGF5ZXIuZ2V0KCkuaWQsIGFjdGlvbjogYWN0aW9uTmFtZSB9KVxufVxuXG5mdW5jdGlvbiBvYnNlcnZhYmxlR2FtZSgpIHtcbiAgcmV0dXJuICQuZ2V0SlNPTkFzT2JzZXJ2YWJsZSgnL2dhbWUvc3RhdHVzJyk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrR2FtZVN0YXR1cyhyZXMpIHtcbiAgaWYgKHJlcy5kYXRhLmluUHJvZ3Jlc3MpIHtcbiAgICB2YXIgaWR4ID0gY3VycmVudFBsYXllckluZGV4KHJlcy5kYXRhLnBsYXllcnMpO1xuICAgIGlmIChpZHggPT09IG51bGwpIHtcbiAgICAgIG9ic2VydmFibGUuZGlzcG9zZSgpO1xuICAgICAgcm91dGllLm5hdmlnYXRlKCcvd2FpdCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKCcjcGFnZSAucGxheWVyJykuYWRkQ2xhc3MoJ3AnICsgKGlkeCsxKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG9ic2VydmFibGUuZGlzcG9zZSgpO1xuICAgIHJvdXRpZS5uYXZpZ2F0ZSgnL2pvaW4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjdXJyZW50UGxheWVySW5kZXgocGxheWVycykge1xuICBpZiAocGxheWVyc1swXS5pZCA9PT0gcGxheWVyLmdldCgpLmlkKSByZXR1cm4gMDtcbiAgaWYgKHBsYXllcnNbMV0uaWQgPT09IHBsYXllci5nZXQoKS5pZCkgcmV0dXJuIDE7XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBvbkVycm9yKCkge1xuICBjb25zb2xlLmxvZygnR2FtZSBub3QgcmVzcG9uZGluZycpO1xufVxuIiwiKGZ1bmN0aW9uKCl7Ly8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgT3BlbiBUZWNobm9sb2dpZXMsIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdCwgbW9kdWxlLmV4cG9ydHMsIHJlcXVpcmUoJ3J4anMnKSwgJCk7XG59KHRoaXMsIGZ1bmN0aW9uIChnbG9iYWwsIGV4cCwgcm9vdCwgJCwgdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIEhlYWRlcnNcbiAgICB2YXIgcm9vdCA9IGdsb2JhbC5SeCxcbiAgICAgICAgb2JzZXJ2YWJsZSA9IHJvb3QuT2JzZXJ2YWJsZSxcbiAgICAgICAgb2JzZXJ2YWJsZVByb3RvID0gb2JzZXJ2YWJsZS5wcm90b3R5cGUsXG4gICAgICAgIEFzeW5jU3ViamVjdCA9IHJvb3QuQXN5bmNTdWJqZWN0LFxuICAgICAgICBvYnNlcnZhYmxlQ3JlYXRlID0gb2JzZXJ2YWJsZS5jcmVhdGUsXG4gICAgICAgIG9ic2VydmFibGVDcmVhdGVXaXRoRGlzcG9zYWJsZSA9IG9ic2VydmFibGUuY3JlYXRlV2l0aERpc3Bvc2FibGUsXG4gICAgICAgIGRpc3Bvc2FibGVFbXB0eSA9IHJvb3QuRGlzcG9zYWJsZS5lbXB0eSxcbiAgICAgICAgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgICAgIHByb3RvID0gJC5mbjtcbiAgICAgICAgXG4gICAgJC5EZWZlcnJlZC5wcm90b3R5cGUudG9PYnNlcnZhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3ViamVjdCA9IG5ldyBBc3luY1N1YmplY3QoKTtcbiAgICAgICAgdGhpcy5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHN1YmplY3Qub25OZXh0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICBzdWJqZWN0Lm9uQ29tcGxldGVkKCk7XG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc3ViamVjdC5vbkVycm9yKHNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3ViamVjdDtcbiAgICB9O1xuXG4gICAgb2JzZXJ2YWJsZVByb3RvLnRvRGVmZXJyZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHsgXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQ7XG4gICAgfTtcblxuICAgIHZhciBhamF4QXNPYnNlcnZhYmxlID0gJC5hamF4QXNPYnNlcnZhYmxlID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIHN1YmplY3QgPSBuZXcgQXN5bmNTdWJqZWN0KCk7XG5cbiAgICAgICAgdmFyIGludGVybmFsU2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgICAgICAgICAgIHN1YmplY3Qub25OZXh0KHsgZGF0YTogZGF0YSwgdGV4dFN0YXR1czogdGV4dFN0YXR1cywganFYSFI6IGpxWEhSIH0pO1xuICAgICAgICAgICAgICAgIHN1YmplY3Qub25Db21wbGV0ZWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgc3ViamVjdC5vbkVycm9yKHsganFYSFI6IGpxWEhSLCB0ZXh0U3RhdHVzOiB0ZXh0U3RhdHVzLCBlcnJvclRocm93bjogZXJyb3JUaHJvd24gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAkLmV4dGVuZCh0cnVlLCBpbnRlcm5hbFNldHRpbmdzLCBzZXR0aW5ncyk7XG5cbiAgICAgICAgJC5hamF4KGludGVybmFsU2V0dGluZ3MpO1xuXG4gICAgICAgIHJldHVybiBzdWJqZWN0O1xuICAgIH07XG5cbiAgICAkLmdldEFzT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgZGF0YVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIGFqYXhBc09ic2VydmFibGUoeyB1cmw6IHVybCwgZGF0YVR5cGU6IGRhdGFUeXBlLCBkYXRhOiBkYXRhIH0pO1xuICAgIH07XG5cbiAgICAkLmdldEpTT05Bc09ic2VydmFibGUgPSBmdW5jdGlvbih1cmwsIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGFqYXhBc09ic2VydmFibGUoeyB1cmw6IHVybCwgZGF0YVR5cGU6ICdqc29uJywgZGF0YTogZGF0YSB9KTtcbiAgICB9O1xuXG5cbiAgICAkLnBvc3RBc09ic2VydmFibGUgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGRhdGFUeXBlKSB7XG4gICAgICAgIHJldHVybiBhamF4QXNPYnNlcnZhYmxlKHsgdXJsOiB1cmwsIGRhdGFUeXBlOiBkYXRhVHlwZSwgZGF0YTogZGF0YSwgdHlwZTogJ1BPU1QnfSk7XHRcbiAgICB9O1xuXG4gICAgcmV0dXJuIHJvb3Q7XG5cbn0pKTtcblxufSkoKSIsInZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlYmFycy1ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiXFxuPGgxPlJlZ2lzdGVyIFRvIFBsYXk8L2gxPlxcblxcbjxmb3JtPlxcbiAgXFxuICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxuICAgIDxsYWJlbD5GaXJzdCBuYW1lPC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJmaXJzdE5hbWVcXFwiIHR5cGU9XFxcInRleHRcXFwiIHZhbHVlPVxcXCJcXFwiIGF1dG9jb3JyZWN0PVxcXCJvZmZcXFwiIC8+XFxuICA8L2Rpdj5cXG4gIFxcbiAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcbiAgICA8bGFiZWw+TGFzdCBuYW1lPC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJsYXN0TmFtZVxcXCIgdHlwZT1cXFwidGV4dFxcXCIgdmFsdWU9XFxcIlxcXCIgYXV0b2NvcnJlY3Q9XFxcIm9mZlxcXCIgLz5cXG4gIDwvZGl2PlxcblxcbiAgPGRpdiBjbGFzcz1cXFwiZmllbGRcXFwiPlxcbiAgICA8bGFiZWw+RW1haWw8L2xhYmVsPlxcbiAgICA8aW5wdXQgaWQ9XFxcImVtYWlsXFxcIiB0eXBlPVxcXCJlbWFpbFxcXCIgdmFsdWU9XFxcIlxcXCIgYXV0b2NvcnJlY3Q9XFxcIm9mZlxcXCIgLz5cXG4gIDwvZGl2PlxcbiAgXFxuICA8ZGl2IGNsYXNzPVxcXCJmaWVsZFxcXCI+XFxuICAgIDxsYWJlbD5Db21wYW55PC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJjb21wYW55XFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiB2YWx1ZT1cXFwiXFxcIiBhdXRvY29ycmVjdD1cXFwib2ZmXFxcIiAvPlxcbiAgPC9kaXY+XFxuICBcXG4gIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXG4gICAgPGxhYmVsPlJvbGU8L2xhYmVsPlxcblx0PHNlbGVjdCByZXF1aXJlZCBpZD1cXFwicm9sZVxcXCI+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJTZWxlY3QgUm9sZVxcXCIgc2VsZWN0ZWQ+U2VsZWN0IFJvbGU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkMtTGV2ZWwgRXhlY3V0aXZlXFxcIj5DLUxldmVsIEV4ZWN1dGl2ZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVlAgb3IgRGlyZWN0b3JcXFwiPlZQIG9yIERpcmVjdG9yPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNYW5hZ2VyXFxcIj5NYW5hZ2VyPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJQcm9qZWN0IE1hbmFnZXJcXFwiPlByb2plY3QgTWFuYWdlcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVGVhbSBMZWFkXFxcIj5UZWFtIExlYWQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkFyY2hpdGVjdFxcXCI+QXJjaGl0ZWN0PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJEZXZlbG9wZXJcXFwiPkRldmVsb3Blcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQ29uc3VsdGFudFxcXCI+Q29uc3VsdGFudDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU3R1ZGVudFxcXCI+U3R1ZGVudDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUHJlc3MvQW5hbHlzdFxcXCI+UHJlc3MvQW5hbHlzdDwvb3B0aW9uPlxcblx0PC9zZWxlY3Q+XFxuICA8L2Rpdj5cXG5cXG4gIDxkaXYgY2xhc3M9XFxcImZpZWxkXFxcIj5cXG4gICAgPGxhYmVsPkNvdW50cnk8L2xhYmVsPlxcblx0PHNlbGVjdCByZXF1aXJlZCBpZD1cXFwiY291bnRyeVxcXCI+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJTZWxlY3QgQ291bnRyeVxcXCIgc2VsZWN0ZWQ+U2VsZWN0IENvdW50cnk8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkRLXFxcIj5EZW5tYXJrPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJHQlxcXCI+VW5pdGVkIEtpbmdkb208L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkFMXFxcIj5BbGJhbmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBRFxcXCI+QW5kb3JyYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVRcXFwiPkF1c3RyaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkJZXFxcIj5CZWxhcnVzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJCRVxcXCI+QmVsZ2l1bTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQkFcXFwiPkJvc25pYSBhbmQgSGVyemVnb3ZpbmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkJHXFxcIj5CdWxnYXJpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiSFJcXFwiPkNyb2F0aWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkNZXFxcIj5DeXBydXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkNaXFxcIj5DemVjaCBSZXB1YmxpYzwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiRUVcXFwiPkVzdG9uaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkZJXFxcIj5GaW5sYW5kPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJGUlxcXCI+RnJhbmNlPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJERVxcXCI+R2VybWFueTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR1JcXFwiPkdyZWVjZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiSFVcXFwiPkh1bmdhcnk8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIklTXFxcIj5JY2VsYW5kPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJJRVxcXCI+SXJlbGFuZDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiSVRcXFwiPkl0YWx5PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJMVlxcXCI+TGF0dmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJMSVxcXCI+TGllY2h0ZW5zdGVpbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTFRcXFwiPkxpdGh1YW5pYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTFVcXFwiPkx1eGVtYm91cmc8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1hY2Vkb25pYVxcXCI+TWFjZWRvbmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNVFxcXCI+TWFsdGE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1vbGRvdmFcXFwiPk1vbGRvdmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1DXFxcIj5Nb25hY288L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1FXFxcIj5Nb250ZW5lZ3JvPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJOTFxcXCI+TmV0aGVybGFuZHM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5PXFxcIj5Ob3J3YXk8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBMXFxcIj5Qb2xhbmQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBUXFxcIj5Qb3J0dWdhbDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUk9cXFwiPlJvbWFuaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlJTXFxcIj5TZXJiaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNLXFxcIj5TbG92YWtpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU0lcXFwiPlNsb3ZlbmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJFU1xcXCI+U3BhaW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNFXFxcIj5Td2VkZW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkNIXFxcIj5Td2l0emVybGFuZDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVFJcXFwiPlR1cmtleTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVUFcXFwiPlVrcmFpbmU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkFGXFxcIj5BZmdoYW5pc3Rhbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVhcXFwiPsOFbGFuZCBJc2xhbmRzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJEWlxcXCI+QWxnZXJpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVNcXFwiPkFtZXJpY2FuIFNhbW9hPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBT1xcXCI+QW5nb2xhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBSVxcXCI+QW5ndWlsbGE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkFRXFxcIj5BbnRhcmN0aWNhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBR1xcXCI+QW50aWd1YSBhbmQgQmFyYnVkYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVJcXFwiPkFyZ2VudGluYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQU1cXFwiPkFybWVuaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkFXXFxcIj5BcnViYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVVcXFwiPkF1c3RyYWxpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQVpcXFwiPkF6ZXJiYWlqYW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkJTXFxcIj5CYWhhbWFzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJCSFxcXCI+QmFocmFpbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQkRcXFwiPkJhbmdsYWRlc2g8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkJCXFxcIj5CYXJiYWRvczwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQlpcXFwiPkJlbGl6ZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQkpcXFwiPkJlbmluPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJCTVxcXCI+QmVybXVkYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQlRcXFwiPkJodXRhbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQm9saXZpYVxcXCI+Qm9saXZpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQldcXFwiPkJvdHN3YW5hPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJCVlxcXCI+Qm91dmV0IElzbGFuZDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQlJcXFwiPkJyYXppbDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQk5cXFwiPkJydW5laSBEYXJ1c3NhbGFtPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJDVVxcXCI+Q3ViYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiREpcXFwiPkRqaWJvdXRpPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJETVxcXCI+RG9taW5pY2E8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkRPXFxcIj5Eb21pbmljYW4gUmVwdWJsaWM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkVDXFxcIj5FY3VhZG9yPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJFR1xcXCI+RWd5cHQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNWXFxcIj5FbCBTYWx2YWRvcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR1FcXFwiPkVxdWF0b3JpYWwgR3VpbmVhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJFUlxcXCI+RXJpdHJlYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR0ZcXFwiPkZyZW5jaCBHdWlhbmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBGXFxcIj5GcmVuY2ggUG9seW5lc2lhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJHQVxcXCI+R2Fib248L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdNXFxcIj5HYW1iaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdFXFxcIj5HZW9yZ2lhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJHSFxcXCI+R2hhbmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdJXFxcIj5HaWJyYWx0YXI8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdMXFxcIj5HcmVlbmxhbmQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdEXFxcIj5HcmVuYWRhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJHUFxcXCI+R3VhZGVsb3VwZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR1VcXFwiPkd1YW08L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdUXFxcIj5HdWF0ZW1hbGE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdHXFxcIj5HdWVybnNleTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR05cXFwiPkd1aW5lYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiR1dcXFwiPkd1aW5lYS1CaXNzYXU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkdZXFxcIj5HdXlhbmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkhUXFxcIj5IYWl0aTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiSE5cXFwiPkhvbmR1cmFzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJIS1xcXCI+SG9uZyBLb25nPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJJTlxcXCI+SW5kaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIklEXFxcIj5JbmRvbmVzaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIklyYW5cXFwiPklyYW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIklRXFxcIj5JcmFxPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJJTVxcXCI+SXNsZSBvZiBNYW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIklMXFxcIj5Jc3JhZWw8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkpNXFxcIj5KYW1haWNhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJKUFxcXCI+SmFwYW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkpFXFxcIj5KZXJzZXk8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkpPXFxcIj5Kb3JkYW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIktaXFxcIj5LYXpha2hzdGFuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJLRVxcXCI+S2VueWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIktJXFxcIj5LaXJpYmF0aTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiS29yZWFcXFwiPlJlcHVibGljIG9mIEtvcmVhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJLb3JlYVxcXCI+RGVtb2NyYXRpYyBQZW9wbGUncyBSZXB1YmxpYyBvZiBLb3JlYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiS1dcXFwiPkt1d2FpdDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiS0dcXFwiPkt5cmd5enN0YW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkxBXFxcIj5MYW9zPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJMQlxcXCI+TGViYW5vbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTFNcXFwiPkxlc290aG88L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkxSXFxcIj5MaWJlcmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJMWVxcXCI+TGlieWFuIEFyYWIgSmFtYWhpcml5YTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTU9cXFwiPk1hY2FvPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNR1xcXCI+TWFkYWdhc2Nhcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTVdcXFwiPk1hbGF3aTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTVlcXFwiPk1hbGF5c2lhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNVlxcXCI+TWFsZGl2ZXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1MXFxcIj5NYWxpPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNSFxcXCI+TWFyc2hhbGwgSXNsYW5kczwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTVFcXFwiPk1hcnRpbmlxdWU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1SXFxcIj5NYXVyaXRhbmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNVVxcXCI+TWF1cml0aXVzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJZVFxcXCI+TWF5b3R0ZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTVhcXFwiPk1leGljbzwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTWljcm9uZXNpYVxcXCI+TWljcm9uZXNpYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTU5cXFwiPk1vbmdvbGlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNU1xcXCI+TW9udHNlcnJhdDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTUFcXFwiPk1vcm9jY288L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1aXFxcIj5Nb3phbWJpcXVlPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJNTVxcXCI+TXlhbm1hcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTkFcXFwiPk5hbWliaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5SXFxcIj5OYXVydTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTlBcXFwiPk5lcGFsPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBTlxcXCI+TmV0aGVybGFuZHMgQW50aWxsZXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5DXFxcIj5OZXcgQ2FsZWRvbmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJOWlxcXCI+TmV3IFplYWxhbmQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5JXFxcIj5OaWNhcmFndWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5FXFxcIj5OaWdlcjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiTkdcXFwiPk5pZ2VyaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk5VXFxcIj5OaXVlPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJORlxcXCI+Tm9yZm9sayBJc2xhbmQ8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1QXFxcIj5Ob3J0aGVybiBNYXJpYW5hIElzbGFuZHM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk9NXFxcIj5PbWFuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJQS1xcXCI+UGFraXN0YW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBXXFxcIj5QYWxhdTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUGFsZXN0aW5lXFxcIj5QYWxlc3RpbmU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBBXFxcIj5QYW5hbWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBHXFxcIj5QYXB1YSBOZXcgR3VpbmVhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJQWVxcXCI+UGFyYWd1YXk8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBFXFxcIj5QZXJ1PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJQSFxcXCI+UGhpbGlwcGluZXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBOXFxcIj5QaXRjYWlybjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUFJcXFwiPlB1ZXJ0byBSaWNvPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJRQVxcXCI+UWF0YXI8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlJFXFxcIj5Sw6l1bmlvbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUlVcXFwiPlJ1c3NpYW4gRmVkZXJhdGlvbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiUldcXFwiPlJ3YW5kYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiQkxcXFwiPlNhaW50IEJhcnRow6lsZW15PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJTSFxcXCI+U2FpbnQgSGVsZW5hPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJLTlxcXCI+U2FpbnQgS2l0dHMgYW5kIE5ldmlzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJMQ1xcXCI+U2FpbnQgTHVjaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIk1GXFxcIj5TYWludCBNYXJ0aW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlBNXFxcIj5TYWludCBQaWVycmUgYW5kIE1pcXVlbG9uPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJWQ1xcXCI+U2FpbnQgVmluY2VudCBhbmQgVGhlIEdyZW5hZGluZXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIldTXFxcIj5TYW1vYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU01cXFwiPlNhbiBNYXJpbm88L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNUXFxcIj5TYW8gVG9tZSBhbmQgUHJpbmNpcGU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNBXFxcIj5TYXVkaSBBcmFiaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNOXFxcIj5TZW5lZ2FsPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJTQ1xcXCI+U2V5Y2hlbGxlczwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU0xcXFwiPlNpZXJyYSBMZW9uZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU0dcXFwiPlNpbmdhcG9yZTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU0JcXFwiPlNvbG9tb24gSXNsYW5kczwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU09cXFwiPlNvbWFsaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlpBXFxcIj5Tb3V0aCBBZnJpY2E8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkxLXFxcIj5TcmkgTGFua2E8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlNEXFxcIj5TdWRhbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU1JcXFwiPlN1cmluYW1lPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJTSlxcXCI+U3ZhbGJhcmQgYW5kIEphbiBNYXllbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiU1pcXFwiPlN3YXppbGFuZDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVGFpd2FuXFxcIj5UYWl3YW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlRKXFxcIj5UYWppa2lzdGFuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJUYW56YW5pYVxcXCI+VGFuemFuaWE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlRIXFxcIj5UaGFpbGFuZDwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVExcXFwiPlRpbW9yLUxlc3RlPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJUR1xcXCI+VG9nbzwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVEtcXFwiPlRva2VsYXU8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlRPXFxcIj5Ub25nYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVFRcXFwiPlRyaW5pZGFkIGFuZCBUb2JhZ288L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlROXFxcIj5UdW5pc2lhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJUTVxcXCI+VHVya21lbmlzdGFuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJUQ1xcXCI+VHVya3MgYW5kIENhaWNvcyBJc2xhbmRzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJUVlxcXCI+VHV2YWx1PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJVR1xcXCI+VWdhbmRhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJBRVxcXCI+VW5pdGVkIEFyYWIgRW1pcmF0ZXM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlVTXFxcIj5Vbml0ZWQgU3RhdGVzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJVWVxcXCI+VXJ1Z3VheTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVVpcXFwiPlV6YmVraXN0YW48L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlZVXFxcIj5WYW51YXR1PC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJWQVxcXCI+VmF0aWNhbjwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVmVuZXp1ZWxhXFxcIj5WZW5lenVlbGE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlZOXFxcIj5WaWV0IE5hbTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiVmlyZ2luIElzbGFuZHNcXFwiPlZpcmdpbiBJc2xhbmRzPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJWaXJnaW4gSXNsYW5kc1xcXCI+VmlyZ2luIElzbGFuZHM8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIlZJXFxcIj5VLlMuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJXRlxcXCI+V2FsbGlzIGFuZCBGdXR1bmE8L29wdGlvbj5cXG5cdDxvcHRpb24gdmFsdWU9XFxcIkVIXFxcIj5XZXN0ZXJuIFNhaGFyYTwvb3B0aW9uPlxcblx0PG9wdGlvbiB2YWx1ZT1cXFwiWUVcXFwiPlllbWVuPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJaTVxcXCI+WmFtYmlhPC9vcHRpb24+XFxuXHQ8b3B0aW9uIHZhbHVlPVxcXCJaV1xcXCI+WmltYmFid2U8L29wdGlvbj48L3NlbGVjdD5cXG4gIDwvZGl2PlxcbiAgXFxuICA8YnV0dG9uPlBsYXkhPC9idXR0b24+XFxuICBcXG48L2Zvcm0+XFxuXCI7XG4gIH0pO1xuIiwidmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGViYXJzLXJ1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJcXG48aDE+UHJlc3Mgc3RhcnQgdG8gam9pbiB0aGUgZ2FtZTwvaDE+XFxuXFxuPGJ1dHRvbiBpZD1cXFwiam9pblxcXCIgb250b3VjaHN0YXJ0PVxcXCJcXFwiPlN0YXJ0PC9idXR0b24+XFxuXCI7XG4gIH0pO1xuIiwidmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGViYXJzLXJ1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJcXG48aDE+bWF0Y2ggaW4gcHJvZ3Jlc3M8L2gxPlxcblxcbjxwPlxcbiAgQXMgc29vbiBhcyB0aGUgY3VycmVudCBtYXRjaCBpcyBmaW5pc2hlZCxcXG4gIHlvdSdsbCBiZSBhYmxlIHRvIGpvaW4gdGhlIGFjdGlvbiFcXG48L3A+XFxuXCI7XG4gIH0pO1xuIiwidmFyIEhhbmRsZWJhcnMgPSByZXF1aXJlKCdoYW5kbGViYXJzLXJ1bnRpbWUnKTtcbm1vZHVsZS5leHBvcnRzID0gSGFuZGxlYmFycy50ZW1wbGF0ZShmdW5jdGlvbiAoSGFuZGxlYmFycyxkZXB0aDAsaGVscGVycyxwYXJ0aWFscyxkYXRhKSB7XG4gIHRoaXMuY29tcGlsZXJJbmZvID0gWzQsJz49IDEuMC4wJ107XG5oZWxwZXJzID0gdGhpcy5tZXJnZShoZWxwZXJzLCBIYW5kbGViYXJzLmhlbHBlcnMpOyBkYXRhID0gZGF0YSB8fCB7fTtcbiAgXG5cblxuICByZXR1cm4gXCJcXG48aDE+dGhhbmtzIGZvciBwbGF5aW5nPC9oMT5cXG5cXG48cD5cXG4gIGJlIHN1cmUgdG8gYXNrIGFib3V0IHdoYXQgd2UgZG8maGVsbGlwOyA8YnIgLz5cXG4gIGFuZCBob3cgd2UgYnVpbHQgdGhpcyBnYW1lXFxuPC9wPlxcblwiO1xuICB9KTtcbiIsInZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlYmFycy1ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwicGxheWVyXFxcIj5cXG4gXFxuICA8ZGl2IGNsYXNzPVxcXCJsYW5kc2NhcGVcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImJ1dHRvbiB1cFxcXCI+PGk+VVA8L2k+PC9kaXY+XFxuICAgICAgPGRpdiBjbGFzcz1cXFwiYnV0dG9uIGRvd25cXFwiPjxpPkRPV048L2k+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuIFxcbiAgPGRpdiBjbGFzcz1cXFwicG9ydHJhaXRcXFwiPlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImJ1dHRvbiB1cFxcXCI+PGk+VVA8L2k+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcbiAgICAgIDxkaXYgY2xhc3M9XFxcImJ1dHRvbiBkb3duXFxcIj48aT5ET1dOPC9pPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcblxcbjwvZGl2PlxcblwiO1xuICB9KTtcbiIsInZhciBIYW5kbGViYXJzID0gcmVxdWlyZSgnaGFuZGxlYmFycy1ydW50aW1lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZWJhcnMudGVtcGxhdGUoZnVuY3Rpb24gKEhhbmRsZWJhcnMsZGVwdGgwLGhlbHBlcnMscGFydGlhbHMsZGF0YSkge1xuICB0aGlzLmNvbXBpbGVySW5mbyA9IFs0LCc+PSAxLjAuMCddO1xuaGVscGVycyA9IHRoaXMubWVyZ2UoaGVscGVycywgSGFuZGxlYmFycy5oZWxwZXJzKTsgZGF0YSA9IGRhdGEgfHwge307XG4gIFxuXG5cbiAgcmV0dXJuIFwiXFxuPGgxPndhaXRpbmcgZm9yIDJuZCBwbGF5ZXI8L2gxPlxcblxcbjxidXR0b24gaWQ9XFxcImNhbmNlbFxcXCIgb250b3VjaHN0YXJ0PVxcXCJcXFwiPmNhbmNlbDwvYnV0dG9uPlxcblwiO1xuICB9KTtcbiIsIi8qXG5cbkNvcHlyaWdodCAoQykgMjAxMSBieSBZZWh1ZGEgS2F0elxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbi8vIGxpYi9oYW5kbGViYXJzL2Jyb3dzZXItcHJlZml4LmpzXG52YXIgSGFuZGxlYmFycyA9IHt9O1xubW9kdWxlLmV4cG9ydHMgPSBIYW5kbGViYXJzO1xuXG4oZnVuY3Rpb24oSGFuZGxlYmFycywgdW5kZWZpbmVkKSB7XG47XG4vLyBsaWIvaGFuZGxlYmFycy9iYXNlLmpzXG5cbkhhbmRsZWJhcnMuVkVSU0lPTiA9IFwiMS4wLjBcIjtcbkhhbmRsZWJhcnMuQ09NUElMRVJfUkVWSVNJT04gPSA0O1xuXG5IYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVMgPSB7XG4gIDE6ICc8PSAxLjAucmMuMicsIC8vIDEuMC5yYy4yIGlzIGFjdHVhbGx5IHJldjIgYnV0IGRvZXNuJ3QgcmVwb3J0IGl0XG4gIDI6ICc9PSAxLjAuMC1yYy4zJyxcbiAgMzogJz09IDEuMC4wLXJjLjQnLFxuICA0OiAnPj0gMS4wLjAnXG59O1xuXG5IYW5kbGViYXJzLmhlbHBlcnMgID0ge307XG5IYW5kbGViYXJzLnBhcnRpYWxzID0ge307XG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcsXG4gICAgZnVuY3Rpb25UeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBvYmplY3RUeXBlID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIgPSBmdW5jdGlvbihuYW1lLCBmbiwgaW52ZXJzZSkge1xuICBpZiAodG9TdHJpbmcuY2FsbChuYW1lKSA9PT0gb2JqZWN0VHlwZSkge1xuICAgIGlmIChpbnZlcnNlIHx8IGZuKSB7IHRocm93IG5ldyBIYW5kbGViYXJzLkV4Y2VwdGlvbignQXJnIG5vdCBzdXBwb3J0ZWQgd2l0aCBtdWx0aXBsZSBoZWxwZXJzJyk7IH1cbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLmhlbHBlcnMsIG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnZlcnNlKSB7IGZuLm5vdCA9IGludmVyc2U7IH1cbiAgICB0aGlzLmhlbHBlcnNbbmFtZV0gPSBmbjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlclBhcnRpYWwgPSBmdW5jdGlvbihuYW1lLCBzdHIpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwobmFtZSkgPT09IG9iamVjdFR5cGUpIHtcbiAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZCh0aGlzLnBhcnRpYWxzLCAgbmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXJ0aWFsc1tuYW1lXSA9IHN0cjtcbiAgfVxufTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignaGVscGVyTWlzc2luZycsIGZ1bmN0aW9uKGFyZykge1xuICBpZihhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGhlbHBlcjogJ1wiICsgYXJnICsgXCInXCIpO1xuICB9XG59KTtcblxuSGFuZGxlYmFycy5yZWdpc3RlckhlbHBlcignYmxvY2tIZWxwZXJNaXNzaW5nJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgaW52ZXJzZSA9IG9wdGlvbnMuaW52ZXJzZSB8fCBmdW5jdGlvbigpIHt9LCBmbiA9IG9wdGlvbnMuZm47XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuXG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYoY29udGV4dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSBlbHNlIGlmKGNvbnRleHQgPT09IGZhbHNlIHx8IGNvbnRleHQgPT0gbnVsbCkge1xuICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICB9IGVsc2UgaWYodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgaWYoY29udGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gSGFuZGxlYmFycy5oZWxwZXJzLmVhY2goY29udGV4dCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBpbnZlcnNlKHRoaXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4oY29udGV4dCk7XG4gIH1cbn0pO1xuXG5IYW5kbGViYXJzLksgPSBmdW5jdGlvbigpIHt9O1xuXG5IYW5kbGViYXJzLmNyZWF0ZUZyYW1lID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbihvYmplY3QpIHtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG9iamVjdDtcbiAgdmFyIG9iaiA9IG5ldyBIYW5kbGViYXJzLksoKTtcbiAgSGFuZGxlYmFycy5LLnByb3RvdHlwZSA9IG51bGw7XG4gIHJldHVybiBvYmo7XG59O1xuXG5IYW5kbGViYXJzLmxvZ2dlciA9IHtcbiAgREVCVUc6IDAsIElORk86IDEsIFdBUk46IDIsIEVSUk9SOiAzLCBsZXZlbDogMyxcblxuICBtZXRob2RNYXA6IHswOiAnZGVidWcnLCAxOiAnaW5mbycsIDI6ICd3YXJuJywgMzogJ2Vycm9yJ30sXG5cbiAgLy8gY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGhlIGhvc3QgZW52aXJvbm1lbnRcbiAgbG9nOiBmdW5jdGlvbihsZXZlbCwgb2JqKSB7XG4gICAgaWYgKEhhbmRsZWJhcnMubG9nZ2VyLmxldmVsIDw9IGxldmVsKSB7XG4gICAgICB2YXIgbWV0aG9kID0gSGFuZGxlYmFycy5sb2dnZXIubWV0aG9kTWFwW2xldmVsXTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZVttZXRob2RdKSB7XG4gICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsIG9iaik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5IYW5kbGViYXJzLmxvZyA9IGZ1bmN0aW9uKGxldmVsLCBvYmopIHsgSGFuZGxlYmFycy5sb2dnZXIubG9nKGxldmVsLCBvYmopOyB9O1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCdlYWNoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgZm4gPSBvcHRpb25zLmZuLCBpbnZlcnNlID0gb3B0aW9ucy5pbnZlcnNlO1xuICB2YXIgaSA9IDAsIHJldCA9IFwiXCIsIGRhdGE7XG5cbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbnRleHQpO1xuICBpZih0eXBlID09PSBmdW5jdGlvblR5cGUpIHsgY29udGV4dCA9IGNvbnRleHQuY2FsbCh0aGlzKTsgfVxuXG4gIGlmIChvcHRpb25zLmRhdGEpIHtcbiAgICBkYXRhID0gSGFuZGxlYmFycy5jcmVhdGVGcmFtZShvcHRpb25zLmRhdGEpO1xuICB9XG5cbiAgaWYoY29udGV4dCAmJiB0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICBpZihjb250ZXh0IGluc3RhbmNlb2YgQXJyYXkpe1xuICAgICAgZm9yKHZhciBqID0gY29udGV4dC5sZW5ndGg7IGk8ajsgaSsrKSB7XG4gICAgICAgIGlmIChkYXRhKSB7IGRhdGEuaW5kZXggPSBpOyB9XG4gICAgICAgIHJldCA9IHJldCArIGZuKGNvbnRleHRbaV0sIHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yKHZhciBrZXkgaW4gY29udGV4dCkge1xuICAgICAgICBpZihjb250ZXh0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBpZihkYXRhKSB7IGRhdGEua2V5ID0ga2V5OyB9XG4gICAgICAgICAgcmV0ID0gcmV0ICsgZm4oY29udGV4dFtrZXldLCB7ZGF0YTogZGF0YX0pO1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKGkgPT09IDApe1xuICAgIHJldCA9IGludmVyc2UodGhpcyk7XG4gIH1cblxuICByZXR1cm4gcmV0O1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2lmJywgZnVuY3Rpb24oY29uZGl0aW9uYWwsIG9wdGlvbnMpIHtcbiAgdmFyIHR5cGUgPSB0b1N0cmluZy5jYWxsKGNvbmRpdGlvbmFsKTtcbiAgaWYodHlwZSA9PT0gZnVuY3Rpb25UeXBlKSB7IGNvbmRpdGlvbmFsID0gY29uZGl0aW9uYWwuY2FsbCh0aGlzKTsgfVxuXG4gIGlmKCFjb25kaXRpb25hbCB8fCBIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29uZGl0aW9uYWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuaW52ZXJzZSh0aGlzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb3B0aW9ucy5mbih0aGlzKTtcbiAgfVxufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ3VubGVzcycsIGZ1bmN0aW9uKGNvbmRpdGlvbmFsLCBvcHRpb25zKSB7XG4gIHJldHVybiBIYW5kbGViYXJzLmhlbHBlcnNbJ2lmJ10uY2FsbCh0aGlzLCBjb25kaXRpb25hbCwge2ZuOiBvcHRpb25zLmludmVyc2UsIGludmVyc2U6IG9wdGlvbnMuZm59KTtcbn0pO1xuXG5IYW5kbGViYXJzLnJlZ2lzdGVySGVscGVyKCd3aXRoJywgZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICB2YXIgdHlwZSA9IHRvU3RyaW5nLmNhbGwoY29udGV4dCk7XG4gIGlmKHR5cGUgPT09IGZ1bmN0aW9uVHlwZSkgeyBjb250ZXh0ID0gY29udGV4dC5jYWxsKHRoaXMpOyB9XG5cbiAgaWYgKCFIYW5kbGViYXJzLlV0aWxzLmlzRW1wdHkoY29udGV4dCkpIHJldHVybiBvcHRpb25zLmZuKGNvbnRleHQpO1xufSk7XG5cbkhhbmRsZWJhcnMucmVnaXN0ZXJIZWxwZXIoJ2xvZycsIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgdmFyIGxldmVsID0gb3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5sZXZlbCAhPSBudWxsID8gcGFyc2VJbnQob3B0aW9ucy5kYXRhLmxldmVsLCAxMCkgOiAxO1xuICBIYW5kbGViYXJzLmxvZyhsZXZlbCwgY29udGV4dCk7XG59KTtcbjtcbi8vIGxpYi9oYW5kbGViYXJzL3V0aWxzLmpzXG5cbnZhciBlcnJvclByb3BzID0gWydkZXNjcmlwdGlvbicsICdmaWxlTmFtZScsICdsaW5lTnVtYmVyJywgJ21lc3NhZ2UnLCAnbmFtZScsICdudW1iZXInLCAnc3RhY2snXTtcblxuSGFuZGxlYmFycy5FeGNlcHRpb24gPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gIHZhciB0bXAgPSBFcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAvLyBVbmZvcnR1bmF0ZWx5IGVycm9ycyBhcmUgbm90IGVudW1lcmFibGUgaW4gQ2hyb21lIChhdCBsZWFzdCksIHNvIGBmb3IgcHJvcCBpbiB0bXBgIGRvZXNuJ3Qgd29yay5cbiAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZXJyb3JQcm9wcy5sZW5ndGg7IGlkeCsrKSB7XG4gICAgdGhpc1tlcnJvclByb3BzW2lkeF1dID0gdG1wW2Vycm9yUHJvcHNbaWR4XV07XG4gIH1cbn07XG5IYW5kbGViYXJzLkV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTtcblxuLy8gQnVpbGQgb3V0IG91ciBiYXNpYyBTYWZlU3RyaW5nIHR5cGVcbkhhbmRsZWJhcnMuU2FmZVN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZykge1xuICB0aGlzLnN0cmluZyA9IHN0cmluZztcbn07XG5IYW5kbGViYXJzLlNhZmVTdHJpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnN0cmluZy50b1N0cmluZygpO1xufTtcblxudmFyIGVzY2FwZSA9IHtcbiAgXCImXCI6IFwiJmFtcDtcIixcbiAgXCI8XCI6IFwiJmx0O1wiLFxuICBcIj5cIjogXCImZ3Q7XCIsXG4gICdcIic6IFwiJnF1b3Q7XCIsXG4gIFwiJ1wiOiBcIiYjeDI3O1wiLFxuICBcImBcIjogXCImI3g2MDtcIlxufTtcblxudmFyIGJhZENoYXJzID0gL1smPD5cIidgXS9nO1xudmFyIHBvc3NpYmxlID0gL1smPD5cIidgXS87XG5cbnZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24oY2hyKSB7XG4gIHJldHVybiBlc2NhcGVbY2hyXSB8fCBcIiZhbXA7XCI7XG59O1xuXG5IYW5kbGViYXJzLlV0aWxzID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKG9iaiwgdmFsdWUpIHtcbiAgICBmb3IodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYodmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGVzY2FwZUV4cHJlc3Npb246IGZ1bmN0aW9uKHN0cmluZykge1xuICAgIC8vIGRvbid0IGVzY2FwZSBTYWZlU3RyaW5ncywgc2luY2UgdGhleSdyZSBhbHJlYWR5IHNhZmVcbiAgICBpZiAoc3RyaW5nIGluc3RhbmNlb2YgSGFuZGxlYmFycy5TYWZlU3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcgPT0gbnVsbCB8fCBzdHJpbmcgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBGb3JjZSBhIHN0cmluZyBjb252ZXJzaW9uIGFzIHRoaXMgd2lsbCBiZSBkb25lIGJ5IHRoZSBhcHBlbmQgcmVnYXJkbGVzcyBhbmRcbiAgICAvLyB0aGUgcmVnZXggdGVzdCB3aWxsIGRvIHRoaXMgdHJhbnNwYXJlbnRseSBiZWhpbmQgdGhlIHNjZW5lcywgY2F1c2luZyBpc3N1ZXMgaWZcbiAgICAvLyBhbiBvYmplY3QncyB0byBzdHJpbmcgaGFzIGVzY2FwZWQgY2hhcmFjdGVycyBpbiBpdC5cbiAgICBzdHJpbmcgPSBzdHJpbmcudG9TdHJpbmcoKTtcblxuICAgIGlmKCFwb3NzaWJsZS50ZXN0KHN0cmluZykpIHsgcmV0dXJuIHN0cmluZzsgfVxuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShiYWRDaGFycywgZXNjYXBlQ2hhcik7XG4gIH0sXG5cbiAgaXNFbXB0eTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYodG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09IFwiW29iamVjdCBBcnJheV1cIiAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuO1xuLy8gbGliL2hhbmRsZWJhcnMvcnVudGltZS5qc1xuXG5IYW5kbGViYXJzLlZNID0ge1xuICB0ZW1wbGF0ZTogZnVuY3Rpb24odGVtcGxhdGVTcGVjKSB7XG4gICAgLy8gSnVzdCBhZGQgd2F0ZXJcbiAgICB2YXIgY29udGFpbmVyID0ge1xuICAgICAgZXNjYXBlRXhwcmVzc2lvbjogSGFuZGxlYmFycy5VdGlscy5lc2NhcGVFeHByZXNzaW9uLFxuICAgICAgaW52b2tlUGFydGlhbDogSGFuZGxlYmFycy5WTS5pbnZva2VQYXJ0aWFsLFxuICAgICAgcHJvZ3JhbXM6IFtdLFxuICAgICAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHByb2dyYW1XcmFwcGVyID0gdGhpcy5wcm9ncmFtc1tpXTtcbiAgICAgICAgaWYoZGF0YSkge1xuICAgICAgICAgIHByb2dyYW1XcmFwcGVyID0gSGFuZGxlYmFycy5WTS5wcm9ncmFtKGksIGZuLCBkYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmICghcHJvZ3JhbVdyYXBwZXIpIHtcbiAgICAgICAgICBwcm9ncmFtV3JhcHBlciA9IHRoaXMucHJvZ3JhbXNbaV0gPSBIYW5kbGViYXJzLlZNLnByb2dyYW0oaSwgZm4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9ncmFtV3JhcHBlcjtcbiAgICAgIH0sXG4gICAgICBtZXJnZTogZnVuY3Rpb24ocGFyYW0sIGNvbW1vbikge1xuICAgICAgICB2YXIgcmV0ID0gcGFyYW0gfHwgY29tbW9uO1xuXG4gICAgICAgIGlmIChwYXJhbSAmJiBjb21tb24pIHtcbiAgICAgICAgICByZXQgPSB7fTtcbiAgICAgICAgICBIYW5kbGViYXJzLlV0aWxzLmV4dGVuZChyZXQsIGNvbW1vbik7XG4gICAgICAgICAgSGFuZGxlYmFycy5VdGlscy5leHRlbmQocmV0LCBwYXJhbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0sXG4gICAgICBwcm9ncmFtV2l0aERlcHRoOiBIYW5kbGViYXJzLlZNLnByb2dyYW1XaXRoRGVwdGgsXG4gICAgICBub29wOiBIYW5kbGViYXJzLlZNLm5vb3AsXG4gICAgICBjb21waWxlckluZm86IG51bGxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIHJlc3VsdCA9IHRlbXBsYXRlU3BlYy5jYWxsKGNvbnRhaW5lciwgSGFuZGxlYmFycywgY29udGV4dCwgb3B0aW9ucy5oZWxwZXJzLCBvcHRpb25zLnBhcnRpYWxzLCBvcHRpb25zLmRhdGEpO1xuXG4gICAgICB2YXIgY29tcGlsZXJJbmZvID0gY29udGFpbmVyLmNvbXBpbGVySW5mbyB8fCBbXSxcbiAgICAgICAgICBjb21waWxlclJldmlzaW9uID0gY29tcGlsZXJJbmZvWzBdIHx8IDEsXG4gICAgICAgICAgY3VycmVudFJldmlzaW9uID0gSGFuZGxlYmFycy5DT01QSUxFUl9SRVZJU0lPTjtcblxuICAgICAgaWYgKGNvbXBpbGVyUmV2aXNpb24gIT09IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICBpZiAoY29tcGlsZXJSZXZpc2lvbiA8IGN1cnJlbnRSZXZpc2lvbikge1xuICAgICAgICAgIHZhciBydW50aW1lVmVyc2lvbnMgPSBIYW5kbGViYXJzLlJFVklTSU9OX0NIQU5HRVNbY3VycmVudFJldmlzaW9uXSxcbiAgICAgICAgICAgICAgY29tcGlsZXJWZXJzaW9ucyA9IEhhbmRsZWJhcnMuUkVWSVNJT05fQ0hBTkdFU1tjb21waWxlclJldmlzaW9uXTtcbiAgICAgICAgICB0aHJvdyBcIlRlbXBsYXRlIHdhcyBwcmVjb21waWxlZCB3aXRoIGFuIG9sZGVyIHZlcnNpb24gb2YgSGFuZGxlYmFycyB0aGFuIHRoZSBjdXJyZW50IHJ1bnRpbWUuIFwiK1xuICAgICAgICAgICAgICAgIFwiUGxlYXNlIHVwZGF0ZSB5b3VyIHByZWNvbXBpbGVyIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrcnVudGltZVZlcnNpb25zK1wiKSBvciBkb3duZ3JhZGUgeW91ciBydW50aW1lIHRvIGFuIG9sZGVyIHZlcnNpb24gKFwiK2NvbXBpbGVyVmVyc2lvbnMrXCIpLlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFVzZSB0aGUgZW1iZWRkZWQgdmVyc2lvbiBpbmZvIHNpbmNlIHRoZSBydW50aW1lIGRvZXNuJ3Qga25vdyBhYm91dCB0aGlzIHJldmlzaW9uIHlldFxuICAgICAgICAgIHRocm93IFwiVGVtcGxhdGUgd2FzIHByZWNvbXBpbGVkIHdpdGggYSBuZXdlciB2ZXJzaW9uIG9mIEhhbmRsZWJhcnMgdGhhbiB0aGUgY3VycmVudCBydW50aW1lLiBcIitcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSB1cGRhdGUgeW91ciBydW50aW1lIHRvIGEgbmV3ZXIgdmVyc2lvbiAoXCIrY29tcGlsZXJJbmZvWzFdK1wiKS5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH0sXG5cbiAgcHJvZ3JhbVdpdGhEZXB0aDogZnVuY3Rpb24oaSwgZm4sIGRhdGEgLyosICRkZXB0aCAqLykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcblxuICAgIHZhciBwcm9ncmFtID0gZnVuY3Rpb24oY29udGV4dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBbY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGFdLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgICBwcm9ncmFtLnByb2dyYW0gPSBpO1xuICAgIHByb2dyYW0uZGVwdGggPSBhcmdzLmxlbmd0aDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgcHJvZ3JhbTogZnVuY3Rpb24oaSwgZm4sIGRhdGEpIHtcbiAgICB2YXIgcHJvZ3JhbSA9IGZ1bmN0aW9uKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICByZXR1cm4gZm4oY29udGV4dCwgb3B0aW9ucy5kYXRhIHx8IGRhdGEpO1xuICAgIH07XG4gICAgcHJvZ3JhbS5wcm9ncmFtID0gaTtcbiAgICBwcm9ncmFtLmRlcHRoID0gMDtcbiAgICByZXR1cm4gcHJvZ3JhbTtcbiAgfSxcbiAgbm9vcDogZnVuY3Rpb24oKSB7IHJldHVybiBcIlwiOyB9LFxuICBpbnZva2VQYXJ0aWFsOiBmdW5jdGlvbihwYXJ0aWFsLCBuYW1lLCBjb250ZXh0LCBoZWxwZXJzLCBwYXJ0aWFscywgZGF0YSkge1xuICAgIHZhciBvcHRpb25zID0geyBoZWxwZXJzOiBoZWxwZXJzLCBwYXJ0aWFsczogcGFydGlhbHMsIGRhdGE6IGRhdGEgfTtcblxuICAgIGlmKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGZvdW5kXCIpO1xuICAgIH0gZWxzZSBpZihwYXJ0aWFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBwYXJ0aWFsKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSBpZiAoIUhhbmRsZWJhcnMuY29tcGlsZSkge1xuICAgICAgdGhyb3cgbmV3IEhhbmRsZWJhcnMuRXhjZXB0aW9uKFwiVGhlIHBhcnRpYWwgXCIgKyBuYW1lICsgXCIgY291bGQgbm90IGJlIGNvbXBpbGVkIHdoZW4gcnVubmluZyBpbiBydW50aW1lLW9ubHkgbW9kZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydGlhbHNbbmFtZV0gPSBIYW5kbGViYXJzLmNvbXBpbGUocGFydGlhbCwge2RhdGE6IGRhdGEgIT09IHVuZGVmaW5lZH0pO1xuICAgICAgcmV0dXJuIHBhcnRpYWxzW25hbWVdKGNvbnRleHQsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxufTtcblxuSGFuZGxlYmFycy50ZW1wbGF0ZSA9IEhhbmRsZWJhcnMuVk0udGVtcGxhdGU7XG47XG4vLyBsaWIvaGFuZGxlYmFycy9icm93c2VyLXN1ZmZpeC5qc1xufSkoSGFuZGxlYmFycyk7XG47XG4iLCIoZnVuY3Rpb24oZ2xvYmFsKXtyZXF1aXJlKFwiLi9yeC5taW4uanNcIikoZ2xvYmFsKTtcclxucmVxdWlyZShcIi4vcnguYWdncmVnYXRlcy5taW4uanNcIikoZ2xvYmFsKTtcclxucmVxdWlyZShcIi4vcnguY29pbmNpZGVuY2UubWluLmpzXCIpKGdsb2JhbCk7XHJcbnJlcXVpcmUoXCIuL3J4LmpvaW5wYXR0ZXJucy5taW4uanNcIikoZ2xvYmFsKTtcclxucmVxdWlyZShcIi4vcngudGltZS5taW4uanNcIikoZ2xvYmFsKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUnhcclxuXG59KSh3aW5kb3cpIiwiLypcbiBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gVGhpcyBjb2RlIGlzIGxpY2Vuc2VkIGJ5IE1pY3Jvc29mdCBDb3Jwb3JhdGlvbiB1bmRlciB0aGUgdGVybXNcbiBvZiB0aGUgTUlDUk9TT0ZUIFJFQUNUSVZFIEVYVEVOU0lPTlMgRk9SIEpBVkFTQ1JJUFQgQU5EIC5ORVQgTElCUkFSSUVTIExpY2Vuc2UuXG4gU2VlIGh0dHA6Ly9nby5taWNyb3NvZnQuY29tL2Z3bGluay8/TGlua0lEPTIyMDc2Mi5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHgsbil7dmFyIG0saWE9ZnVuY3Rpb24oKXt9LEo9ZnVuY3Rpb24oKXtyZXR1cm4obmV3IERhdGUpLmdldFRpbWUoKX0sVj1mdW5jdGlvbihhLGIpe3JldHVybiBhPT09Yn0sUT1mdW5jdGlvbihhKXtyZXR1cm4gYX0sVz1mdW5jdGlvbihhKXtyZXR1cm4gYS50b1N0cmluZygpfSxYPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksbz1mdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoKXt0aGlzLmNvbnN0cnVjdG9yPWF9Zm9yKHZhciBkIGluIGIpWC5jYWxsKGIsZCkmJihhW2RdPWJbZF0pO2MucHJvdG90eXBlPWIucHJvdG90eXBlO2EucHJvdG90eXBlPW5ldyBjO2EuYmFzZT1iLnByb3RvdHlwZTtyZXR1cm4gYX0sRT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYyBpbiBiKVguY2FsbChiLGMpJiYoYVtjXT1iW2NdKX0seT1BcnJheS5wcm90b3R5cGUuc2xpY2UsSz1cIk9iamVjdCBoYXMgYmVlbiBkaXNwb3NlZFwiO209eC5SeD17SW50ZXJuYWxzOnt9fTttLlZFUlNJT049XCIxLjAuMTA2MjFcIjt2YXIgamE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gaShmdW5jdGlvbihjKXtyZXR1cm4gbmV3IHAoYi5nZXREaXNwb3NhYmxlKCksYS5zdWJzY3JpYmUoYykpfSl9LEY9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBpKGZ1bmN0aW9uKGQpe3ZhciBlPW5ldyB2LGc9bmV3IHYsZD1jKGQsZSxnKTtlLmRpc3Bvc2FibGUoYS5tYXRlcmlhbGl6ZSgpLnNlbGVjdChmdW5jdGlvbihiKXtyZXR1cm57c3dpdGNoVmFsdWU6ZnVuY3Rpb24oYSl7cmV0dXJuIGEoYil9fX0pLnN1YnNjcmliZShkKSk7Zy5kaXNwb3NhYmxlKGIubWF0ZXJpYWxpemUoKS5zZWxlY3QoZnVuY3Rpb24oYil7cmV0dXJue3N3aXRjaFZhbHVlOmZ1bmN0aW9uKGEsYyl7cmV0dXJuIGMoYil9fX0pLnN1YnNjcmliZShkKSk7cmV0dXJuIG5ldyBwKGUsZyl9KX0sdT1tLkludGVybmFscy5MaXN0PVxuZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIpe3RoaXMuY29tcGFyZXI9Ynx8Vjt0aGlzLnNpemU9MDt0aGlzLml0ZW1zPVtdfWEuZnJvbUFycmF5PWZ1bmN0aW9uKGIsYyl7dmFyIGQsZT1iLmxlbmd0aCxnPW5ldyBhKGMpO2ZvcihkPTA7ZDxlO2QrKylnLmFkZChiW2RdKTtyZXR1cm4gZ307YS5wcm90b3R5cGUuY291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaXplfTthLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24oYil7dGhpcy5pdGVtc1t0aGlzLnNpemVdPWI7dGhpcy5zaXplKyt9O2EucHJvdG90eXBlLnJlbW92ZUF0PWZ1bmN0aW9uKGIpe2lmKDA+Ynx8Yj49dGhpcy5zaXplKXRocm93IEVycm9yKFwiQXJndW1lbnQgb3V0IG9mIHJhbmdlXCIpOzA9PT1iP3RoaXMuaXRlbXMuc2hpZnQoKTp0aGlzLml0ZW1zLnNwbGljZShiLDEpO3RoaXMuc2l6ZS0tfTthLnByb3RvdHlwZS5pbmRleE9mPWZ1bmN0aW9uKGIpe3ZhciBhLGQ7Zm9yKGE9MDthPHRoaXMuaXRlbXMubGVuZ3RoO2ErKylpZihkPVxudGhpcy5pdGVtc1thXSx0aGlzLmNvbXBhcmVyKGIsZCkpcmV0dXJuIGE7cmV0dXJuLTF9O2EucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbihiKXtiPXRoaXMuaW5kZXhPZihiKTtpZigtMT09PWIpcmV0dXJuITE7dGhpcy5yZW1vdmVBdChiKTtyZXR1cm4hMH07YS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLml0ZW1zPVtdO3RoaXMuc2l6ZT0wfTthLnByb3RvdHlwZS5pdGVtPWZ1bmN0aW9uKGIsYSl7aWYoMD5ifHxiPj1jb3VudCl0aHJvdyBFcnJvcihcIkFyZ3VtZW50IG91dCBvZiByYW5nZVwiKTtpZihhPT09bilyZXR1cm4gdGhpcy5pdGVtc1tiXTt0aGlzLml0ZW1zW2JdPWF9O2EucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24oKXt2YXIgYj1bXSxhO2ZvcihhPTA7YTx0aGlzLml0ZW1zLmxlbmd0aDthKyspYi5wdXNoKHRoaXMuaXRlbXNbYV0pO3JldHVybiBifTthLnByb3RvdHlwZS5jb250YWlucz1mdW5jdGlvbihiKXtmb3IodmFyIGE9MDthPHRoaXMuaXRlbXMubGVuZ3RoO2ErKylpZih0aGlzLmNvbXBhcmVyKGIsXG50aGlzLml0ZW1zW2FdKSlyZXR1cm4hMDtyZXR1cm4hMX07cmV0dXJuIGF9KCksa2E9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIsYSl7dGhpcy5pZD1iO3RoaXMudmFsdWU9YX1hLnByb3RvdHlwZS5jb21wYXJlVG89ZnVuY3Rpb24oYil7dmFyIGE9dGhpcy52YWx1ZS5jb21wYXJlVG8oYi52YWx1ZSk7MD09PWEmJihhPXRoaXMuaWQtYi5pZCk7cmV0dXJuIGF9O3JldHVybiBhfSgpLFk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIpe3RoaXMuaXRlbXM9QXJyYXkoYik7dGhpcy5zaXplPTB9YS5wcm90b3R5cGUuY291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaXplfTthLnByb3RvdHlwZS5pc0hpZ2hlclByaW9yaXR5PWZ1bmN0aW9uKGIsYSl7cmV0dXJuIDA+dGhpcy5pdGVtc1tiXS5jb21wYXJlVG8odGhpcy5pdGVtc1thXSl9O2EucHJvdG90eXBlLnBlcmNvbGF0ZT1mdW5jdGlvbihiKXt2YXIgYSxkO2lmKCEoYj49dGhpcy5zaXplfHwwPmIpKWlmKGE9TWF0aC5mbG9vcigoYi0xKS9cbjIpLCEoMD5hfHxhPT09YikmJnRoaXMuaXNIaWdoZXJQcmlvcml0eShiLGEpKWQ9dGhpcy5pdGVtc1tiXSx0aGlzLml0ZW1zW2JdPXRoaXMuaXRlbXNbYV0sdGhpcy5pdGVtc1thXT1kLHRoaXMucGVyY29sYXRlKGEpfTthLnByb3RvdHlwZS5oZWFwaWZ5PWZ1bmN0aW9uKGIpe3ZhciBhLGQsZTtiPT09biYmKGI9MCk7Yj49dGhpcy5zaXplfHwwPmJ8fChkPTIqYisxLGU9MipiKzIsYT1iLGQ8dGhpcy5zaXplJiZ0aGlzLmlzSGlnaGVyUHJpb3JpdHkoZCxhKSYmKGE9ZCksZTx0aGlzLnNpemUmJnRoaXMuaXNIaWdoZXJQcmlvcml0eShlLGEpJiYoYT1lKSxhIT09YiYmKGQ9dGhpcy5pdGVtc1tiXSx0aGlzLml0ZW1zW2JdPXRoaXMuaXRlbXNbYV0sdGhpcy5pdGVtc1thXT1kLHRoaXMuaGVhcGlmeShhKSkpfTthLnByb3RvdHlwZS5wZWVrPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXRlbXNbMF0udmFsdWV9O2EucHJvdG90eXBlLnJlbW92ZUF0PWZ1bmN0aW9uKGIpe3RoaXMuaXRlbXNbYl09XG50aGlzLml0ZW1zWy0tdGhpcy5zaXplXTtkZWxldGUgdGhpcy5pdGVtc1t0aGlzLnNpemVdO3RoaXMuaGVhcGlmeSgpO2lmKHRoaXMuc2l6ZTx0aGlzLml0ZW1zLmxlbmd0aD4+Milmb3IodmFyIGI9dGhpcy5pdGVtcyxhPXRoaXMuaXRlbXM9QXJyYXkodGhpcy5pdGVtcy5sZW5ndGg+PjEpLGQ9dGhpcy5zaXplOzA8ZDspYVtkKzAtMV09YltkKzAtMV0sZC0tfTthLnByb3RvdHlwZS5kZXF1ZXVlPWZ1bmN0aW9uKCl7dmFyIGI9dGhpcy5wZWVrKCk7dGhpcy5yZW1vdmVBdCgwKTtyZXR1cm4gYn07YS5wcm90b3R5cGUuZW5xdWV1ZT1mdW5jdGlvbihiKXt2YXIgYztpZih0aGlzLnNpemU+PXRoaXMuaXRlbXMubGVuZ3RoKXtjPXRoaXMuaXRlbXM7Zm9yKHZhciBkPXRoaXMuaXRlbXM9QXJyYXkoMip0aGlzLml0ZW1zLmxlbmd0aCksZT1jLmxlbmd0aDswPGU7KWRbZSswLTFdPWNbZSswLTFdLGUtLX1jPXRoaXMuc2l6ZSsrO3RoaXMuaXRlbXNbY109bmV3IGthKGEuY291bnQrKyxiKTt0aGlzLnBlcmNvbGF0ZShjKX07XG5hLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oYil7dmFyIGE7Zm9yKGE9MDthPHRoaXMuc2l6ZTthKyspaWYodGhpcy5pdGVtc1thXS52YWx1ZT09PWIpcmV0dXJuIHRoaXMucmVtb3ZlQXQoYSksITA7cmV0dXJuITF9O2EuY291bnQ9MDtyZXR1cm4gYX0oKSxwPW0uQ29tcG9zaXRlRGlzcG9zYWJsZT1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt2YXIgYj0hMSxhPXUuZnJvbUFycmF5KHkuY2FsbChhcmd1bWVudHMpKTt0aGlzLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIGEuY291bnQoKX07dGhpcy5hZGQ9ZnVuY3Rpb24oZCl7Yj9kLmRpc3Bvc2UoKTphLmFkZChkKX07dGhpcy5yZW1vdmU9ZnVuY3Rpb24oZCl7dmFyIGU9ITE7Ynx8KGU9YS5yZW1vdmUoZCkpO2UmJmQuZGlzcG9zZSgpO3JldHVybiBlfTt0aGlzLmRpc3Bvc2U9ZnVuY3Rpb24oKXt2YXIgZCxlO2J8fChiPSEwLGQ9YS50b0FycmF5KCksYS5jbGVhcigpKTtpZihkIT09bilmb3IoZT0wO2U8ZC5sZW5ndGg7ZSsrKWRbZV0uZGlzcG9zZSgpfTtcbnRoaXMuY2xlYXI9ZnVuY3Rpb24oKXt2YXIgYixlO2I9YS50b0FycmF5KCk7YS5jbGVhcigpO2ZvcihlPTA7ZTxiLmxlbmd0aDtlKyspYltlXS5kaXNwb3NlKCl9O3RoaXMuY29udGFpbnM9ZnVuY3Rpb24oYil7cmV0dXJuIGEuY29udGFpbnMoYil9O3RoaXMuaXNEaXNwb3NlZD1mdW5jdGlvbigpe3JldHVybiBifTt0aGlzLnRvQXJyYXk9ZnVuY3Rpb24oKXtyZXR1cm4gYS50b0FycmF5KCl9fWEucHJvdG90eXBlLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY291bnQoKX07YS5wcm90b3R5cGUuYWRkPWZ1bmN0aW9uKGIpe3RoaXMuYWRkKGIpfTthLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oYil7dGhpcy5yZW1vdmUoYil9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07YS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLmNsZWFyKCl9O2EucHJvdG90eXBlLmNvbnRhaW5zPWZ1bmN0aW9uKGIpe3JldHVybiB0aGlzLmNvbnRhaW5zKGIpfTtcbmEucHJvdG90eXBlLmlzRGlzcG9zZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pc0Rpc3Bvc2VkKCl9O2EucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50b0FycmF5KCl9O3JldHVybiBhfSgpLEw9bS5EaXNwb3NhYmxlPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiKXt2YXIgYT0hMTt0aGlzLmRpc3Bvc2U9ZnVuY3Rpb24oKXthfHwoYigpLGE9ITApfX1hLnByb3RvdHlwZS5kaXNwb3NlPWZ1bmN0aW9uKCl7dGhpcy5kaXNwb3NlKCl9O3JldHVybiBhfSgpLEE9TC5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBMKGEpfSx3PUwuZW1wdHk9bmV3IEwoZnVuY3Rpb24oKXt9KSx2PW0uU2luZ2xlQXNzaWdubWVudERpc3Bvc2FibGU9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7dmFyIGI9ITEsYT1udWxsO3RoaXMuaXNEaXNwb3NlZD1mdW5jdGlvbigpe3JldHVybiBifTt0aGlzLmdldERpc3Bvc2FibGU9ZnVuY3Rpb24oKXtyZXR1cm4gYX07dGhpcy5zZXREaXNwb3NhYmxlPVxuZnVuY3Rpb24oZCl7aWYobnVsbCE9PWEpdGhyb3cgRXJyb3IoXCJEaXNwb3NhYmxlIGhhcyBhbHJlYWR5IGJlZW4gYXNzaWduZWRcIik7dmFyIGU9YjtlfHwoYT1kKTtlJiZudWxsIT09ZCYmZC5kaXNwb3NlKCl9O3RoaXMuZGlzcG9zZT1mdW5jdGlvbigpe3ZhciBkPW51bGw7Ynx8KGI9ITAsZD1hLGE9bnVsbCk7bnVsbCE9PWQmJmQuZGlzcG9zZSgpfX1hLnByb3RvdHlwZS5pc0Rpc3Bvc2VkPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXNEaXNwb3NlZCgpfTthLnByb3RvdHlwZS5kaXNwb3NhYmxlPWZ1bmN0aW9uKGIpe2lmKGI9PT1uKXJldHVybiB0aGlzLmdldERpc3Bvc2FibGUoKTt0aGlzLnNldERpc3Bvc2FibGUoYil9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07cmV0dXJuIGF9KCksQz1tLlNlcmlhbERpc3Bvc2FibGU9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7dmFyIGI9ITEsYT1udWxsO3RoaXMuaXNEaXNwb3NlZD1mdW5jdGlvbigpe3JldHVybiBifTtcbnRoaXMuZ2V0RGlzcG9zYWJsZT1mdW5jdGlvbigpe3JldHVybiBhfTt0aGlzLnNldERpc3Bvc2FibGU9ZnVuY3Rpb24oZCl7dmFyIGU9YixnPW51bGw7ZXx8KGc9YSxhPWQpO251bGwhPT1nJiZnLmRpc3Bvc2UoKTtlJiZudWxsIT09ZCYmZC5kaXNwb3NlKCl9O3RoaXMuZGlzcG9zZT1mdW5jdGlvbigpe3ZhciBkPW51bGw7Ynx8KGI9ITAsZD1hLGE9bnVsbCk7bnVsbCE9PWQmJmQuZGlzcG9zZSgpfX1hLnByb3RvdHlwZS5pc0Rpc3Bvc2VkPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXNEaXNwb3NlZCgpfTthLnByb3RvdHlwZS5kaXNwb3NhYmxlPWZ1bmN0aW9uKGEpe2lmKGE9PT1uKXJldHVybiB0aGlzLmdldERpc3Bvc2FibGUoKTt0aGlzLnNldERpc3Bvc2FibGUoYSl9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07YS5wcm90b3R5cGUuZGlzcG9zZT1mdW5jdGlvbigpe3RoaXMuZGlzcG9zZSgpfTtyZXR1cm4gYX0oKSxaPW0uUmVmQ291bnREaXNwb3NhYmxlPVxuZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEpe3ZhciBjPSExLGQ9ITEsZT0wO3RoaXMuZGlzcG9zZT1mdW5jdGlvbigpe3ZhciBnPSExOyFjJiYhZCYmKGQ9ITAsMD09PWUmJihnPWM9ITApKTtnJiZhLmRpc3Bvc2UoKX07dGhpcy5nZXREaXNwb3NhYmxlPWZ1bmN0aW9uKCl7aWYoYylyZXR1cm4gdztlKys7dmFyIGc9ITE7cmV0dXJue2Rpc3Bvc2U6ZnVuY3Rpb24oKXt2YXIgaD0hMTshYyYmIWcmJihnPSEwLGUtLSwwPT09ZSYmZCYmKGg9Yz0hMCkpO2gmJmEuZGlzcG9zZSgpfX19O3RoaXMuaXNEaXNwb3NlZD1mdW5jdGlvbigpe3JldHVybiBjfX1hLnByb3RvdHlwZS5kaXNwb3NlPWZ1bmN0aW9uKCl7dGhpcy5kaXNwb3NlKCl9O2EucHJvdG90eXBlLmdldERpc3Bvc2FibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5nZXREaXNwb3NhYmxlKCl9O2EucHJvdG90eXBlLmlzRGlzcG9zZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pc0Rpc3Bvc2VkKCl9O3JldHVybiBhfSgpLFI7Uj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxcbmMsZCxlLGcpe3RoaXMuc2NoZWR1bGVyPWE7dGhpcy5zdGF0ZT1jO3RoaXMuYWN0aW9uPWQ7dGhpcy5kdWVUaW1lPWU7dGhpcy5jb21wYXJlcj1nfHxmdW5jdGlvbihhLGIpe3JldHVybiBhLWJ9O3RoaXMuZGlzcG9zYWJsZT1uZXcgdn1hLnByb3RvdHlwZS5pbnZva2U9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5kaXNwb3NhYmxlLmRpc3Bvc2FibGUodGhpcy5pbnZva2VDb3JlKCkpfTthLnByb3RvdHlwZS5jb21wYXJlVG89ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuY29tcGFyZXIodGhpcy5kdWVUaW1lLGEuZHVlVGltZSl9O2EucHJvdG90eXBlLmlzQ2FuY2VsbGVkPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGlzcG9zYWJsZS5pc0Rpc3Bvc2VkKCl9O2EucHJvdG90eXBlLmludm9rZUNvcmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hY3Rpb24odGhpcy5zY2hlZHVsZXIsdGhpcy5zdGF0ZSl9O3JldHVybiBhfSgpO3ZhciBzPW0uU2NoZWR1bGVyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLFxuYixjLGQpe3RoaXMubm93PWE7dGhpcy5fc2NoZWR1bGU9Yjt0aGlzLl9zY2hlZHVsZVJlbGF0aXZlPWM7dGhpcy5fc2NoZWR1bGVBYnNvbHV0ZT1kfXZhciBiPWZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlLGs7ZD1uZXcgcDtrPWIuZmlyc3Q7Yz1iLnNlY29uZDtlPW51bGw7ZT1mdW5jdGlvbihiKXtjKGIsZnVuY3Rpb24oYil7dmFyIGMsaCxsO2w9aD0hMTtjPW51bGw7Yz1hLnNjaGVkdWxlV2l0aFN0YXRlKGIsZnVuY3Rpb24oYSxiKXtoP2QucmVtb3ZlKGMpOmw9ITA7ZShiKTtyZXR1cm4gd30pO2x8fChkLmFkZChjKSxoPSEwKX0pfTtlKGspO3JldHVybiBkfSxjPWZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlLGs7ZD1uZXcgcDtrPWIuZmlyc3Q7Yz1iLnNlY29uZDtlPWZ1bmN0aW9uKGIpe2MoYixmdW5jdGlvbihiLGMpe3ZhciBoLGwsaztrPWw9ITE7aD1hLnNjaGVkdWxlV2l0aFJlbGF0aXZlQW5kU3RhdGUoYixjLGZ1bmN0aW9uKGEsYil7bD9kLnJlbW92ZShoKTprPSEwO2UoYik7cmV0dXJuIHd9KTtcbmt8fChkLmFkZChoKSxsPSEwKX0pfTtlKGspO3JldHVybiBkfSxkPWZ1bmN0aW9uKGEsYil7dmFyIGMsZCxlLGs7ZD1uZXcgcDtrPWIuZmlyc3Q7Yz1iLnNlY29uZDtlPWZ1bmN0aW9uKGIpe2MoYixmdW5jdGlvbihiLGMpe3ZhciBoPSExLGw9ITEsaz1hLnNjaGVkdWxlV2l0aEFic29sdXRlQW5kU3RhdGUoYixjLGZ1bmN0aW9uKGEsYil7aD9kLnJlbW92ZShrKTpsPSEwO2UoYik7cmV0dXJuIHd9KTtsfHwoZC5hZGQoayksaD0hMCl9KX07ZShrKTtyZXR1cm4gZH0sZT1mdW5jdGlvbihhLGIpe2IoKTtyZXR1cm4gd307YS5wcm90b3R5cGUuc2NoZWR1bGU9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3NjaGVkdWxlKGEsZSl9O2EucHJvdG90eXBlLnNjaGVkdWxlV2l0aFN0YXRlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuX3NjaGVkdWxlKGEsYil9O2EucHJvdG90eXBlLnNjaGVkdWxlV2l0aFJlbGF0aXZlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuX3NjaGVkdWxlUmVsYXRpdmUoYixcbmEsZSl9O2EucHJvdG90eXBlLnNjaGVkdWxlV2l0aFJlbGF0aXZlQW5kU3RhdGU9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0aGlzLl9zY2hlZHVsZVJlbGF0aXZlKGEsYixjKX07YS5wcm90b3R5cGUuc2NoZWR1bGVXaXRoQWJzb2x1dGU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5fc2NoZWR1bGVBYnNvbHV0ZShiLGEsZSl9O2EucHJvdG90eXBlLnNjaGVkdWxlV2l0aEFic29sdXRlQW5kU3RhdGU9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0aGlzLl9zY2hlZHVsZUFic29sdXRlKGEsYixjKX07YS5wcm90b3R5cGUuc2NoZWR1bGVSZWN1cnNpdmU9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuc2NoZWR1bGVSZWN1cnNpdmVXaXRoU3RhdGUoYSxmdW5jdGlvbihhLGIpe2EoZnVuY3Rpb24oKXtiKGEpfSl9KX07YS5wcm90b3R5cGUuc2NoZWR1bGVSZWN1cnNpdmVXaXRoU3RhdGU9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gdGhpcy5zY2hlZHVsZVdpdGhTdGF0ZSh7Zmlyc3Q6YSxzZWNvbmQ6Y30sXG5mdW5jdGlvbihhLGMpe3JldHVybiBiKGEsYyl9KX07YS5wcm90b3R5cGUuc2NoZWR1bGVSZWN1cnNpdmVXaXRoUmVsYXRpdmU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5zY2hlZHVsZVJlY3Vyc2l2ZVdpdGhSZWxhdGl2ZUFuZFN0YXRlKGIsYSxmdW5jdGlvbihhLGIpe2EoZnVuY3Rpb24oYyl7YihhLGMpfSl9KX07YS5wcm90b3R5cGUuc2NoZWR1bGVSZWN1cnNpdmVXaXRoUmVsYXRpdmVBbmRTdGF0ZT1mdW5jdGlvbihhLGIsZCl7cmV0dXJuIHRoaXMuX3NjaGVkdWxlUmVsYXRpdmUoe2ZpcnN0OmEsc2Vjb25kOmR9LGIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYyhhLGIpfSl9O2EucHJvdG90eXBlLnNjaGVkdWxlUmVjdXJzaXZlV2l0aEFic29sdXRlPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMuc2NoZWR1bGVSZWN1cnNpdmVXaXRoQWJzb2x1dGVBbmRTdGF0ZShiLGEsZnVuY3Rpb24oYSxiKXthKGZ1bmN0aW9uKGMpe2IoYSxjKX0pfSl9O2EucHJvdG90eXBlLnNjaGVkdWxlUmVjdXJzaXZlV2l0aEFic29sdXRlQW5kU3RhdGU9XG5mdW5jdGlvbihhLGIsYyl7cmV0dXJuIHRoaXMuX3NjaGVkdWxlQWJzb2x1dGUoe2ZpcnN0OmEsc2Vjb25kOmN9LGIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gZChhLGIpfSl9O2Eubm93PUo7YS5ub3JtYWxpemU9ZnVuY3Rpb24oYSl7MD5hJiYoYT0wKTtyZXR1cm4gYX07cmV0dXJuIGF9KCksZj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt2YXIgYj10aGlzO2EuYmFzZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsSixmdW5jdGlvbihhLGQpe3JldHVybiBkKGIsYSl9LGZ1bmN0aW9uKGEsZCxlKXtmb3IoOzA8cy5ub3JtYWxpemUoZCk7KTtyZXR1cm4gZShiLGEpfSxmdW5jdGlvbihhLGQsZSl7cmV0dXJuIGIuc2NoZWR1bGVXaXRoUmVsYXRpdmVBbmRTdGF0ZShhLGQtYi5ub3coKSxlKX0pfW8oYSxzKTtyZXR1cm4gYX0oKSxCPXMuSW1tZWRpYXRlPW5ldyBmLGxhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe00ucXVldWU9bmV3IFkoNCl9YS5wcm90b3R5cGUuZGlzcG9zZT1mdW5jdGlvbigpe00ucXVldWU9XG5udWxsfTthLnByb3RvdHlwZS5ydW49ZnVuY3Rpb24oKXtmb3IodmFyIGEsYz1NLnF1ZXVlOzA8Yy5jb3VudCgpOylpZihhPWMuZGVxdWV1ZSgpLCFhLmlzQ2FuY2VsbGVkKCkpe2Zvcig7MDxhLmR1ZVRpbWUtcy5ub3coKTspO2EuaXNDYW5jZWxsZWQoKXx8YS5pbnZva2UoKX19O3JldHVybiBhfSgpLE09ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7dmFyIGI9dGhpczthLmJhc2UuY29uc3RydWN0b3IuY2FsbCh0aGlzLEosZnVuY3Rpb24oYSxkKXtyZXR1cm4gYi5zY2hlZHVsZVdpdGhSZWxhdGl2ZUFuZFN0YXRlKGEsMCxkKX0sZnVuY3Rpb24oYyxkLGUpe3ZhciBnPWIubm93KCkrcy5ub3JtYWxpemUoZCksZD1hLnF1ZXVlLGM9bmV3IFIoYixjLGUsZyk7aWYobnVsbD09PWQpe2U9bmV3IGxhO3RyeXthLnF1ZXVlLmVucXVldWUoYyksZS5ydW4oKX1maW5hbGx5e2UuZGlzcG9zZSgpfX1lbHNlIGQuZW5xdWV1ZShjKTtyZXR1cm4gYy5kaXNwb3NhYmxlfSxmdW5jdGlvbihhLGQsZSl7cmV0dXJuIGIuc2NoZWR1bGVXaXRoUmVsYXRpdmVBbmRTdGF0ZShhLFxuZC1iLm5vdygpLGUpfSl9byhhLHMpO2EucHJvdG90eXBlLnNjaGVkdWxlUmVxdWlyZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbD09PWEucXVldWV9O2EucHJvdG90eXBlLmVuc3VyZVRyYW1wb2xpbmU9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuc2NoZWR1bGVSZXF1aXJlZCgpP3RoaXMuc2NoZWR1bGUoYSk6YSgpfTthLnF1ZXVlPW51bGw7cmV0dXJuIGF9KCksRD1zLkN1cnJlbnRUaHJlYWQ9bmV3IE07bS5WaXJ0dWFsVGltZVNjaGVkdWxlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYixjKXt2YXIgZD10aGlzO3RoaXMuY2xvY2s9Yjt0aGlzLmNvbXBhcmVyPWM7dGhpcy5pc0VuYWJsZWQ9ITE7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxmdW5jdGlvbigpe3JldHVybiBkLnRvRGF0ZVRpbWVPZmZzZXQoZC5jbG9jayl9LGZ1bmN0aW9uKGEsYil7cmV0dXJuIGQuc2NoZWR1bGVBYnNvbHV0ZShhLGQuY2xvY2ssYil9LGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gZC5zY2hlZHVsZVJlbGF0aXZlKGEsXG5kLnRvUmVsYXRpdmUoYiksYyl9LGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gZC5zY2hlZHVsZVJlbGF0aXZlKGEsZC50b1JlbGF0aXZlKGItZC5ub3coKSksYyl9KTt0aGlzLnF1ZXVlPW5ldyBZKDEwMjQpfW8oYSxzKTthLnByb3RvdHlwZS5zY2hlZHVsZVJlbGF0aXZlPWZ1bmN0aW9uKGEsYyxkKXtjPXRoaXMuYWRkKHRoaXMuY2xvY2ssYyk7cmV0dXJuIHRoaXMuc2NoZWR1bGVBYnNvbHV0ZShhLGMsZCl9O2EucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKCl7dmFyIGE7aWYoIXRoaXMuaXNFbmFibGVkKXt0aGlzLmlzRW5hYmxlZD0hMDtkbyBpZihhPXRoaXMuZ2V0TmV4dCgpLG51bGwhPT1hKXtpZigwPHRoaXMuY29tcGFyZXIoYS5kdWVUaW1lLHRoaXMuY2xvY2spKXRoaXMuY2xvY2s9YS5kdWVUaW1lO2EuaW52b2tlKCl9ZWxzZSB0aGlzLmlzRW5hYmxlZD0hMTt3aGlsZSh0aGlzLmlzRW5hYmxlZCl9fTthLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXNFbmFibGVkPVxuITF9O2EucHJvdG90eXBlLmFkdmFuY2VUbz1mdW5jdGlvbihhKXt2YXIgYztpZigwPD10aGlzLmNvbXBhcmVyKHRoaXMuY2xvY2ssYSkpdGhyb3cgRXJyb3IoXCJBcmd1bWVudCBvdXQgb2YgcmFuZ2VcIik7aWYoIXRoaXMuaXNFbmFibGVkKXt0aGlzLmlzRW5hYmxlZD0hMDtkbyBpZihjPXRoaXMuZ2V0TmV4dCgpLG51bGwhPT1jJiYwPj10aGlzLmNvbXBhcmVyKGMuZHVlVGltZSxhKSl7aWYoMDx0aGlzLmNvbXBhcmVyKGMuZHVlVGltZSx0aGlzLmNsb2NrKSl0aGlzLmNsb2NrPWMuZHVlVGltZTtjLmludm9rZSgpfWVsc2UgdGhpcy5pc0VuYWJsZWQ9ITE7d2hpbGUodGhpcy5pc0VuYWJsZWQpO3JldHVybiB0aGlzLmNsb2NrPWF9fTthLnByb3RvdHlwZS5hZHZhbmNlQnk9ZnVuY3Rpb24oYSl7YT10aGlzLmFkZCh0aGlzLmNsb2NrLGEpO2lmKDA8PXRoaXMuY29tcGFyZXIodGhpcy5jbG9jayxhKSl0aHJvdyBFcnJvcihcIkFyZ3VtZW50IG91dCBvZiByYW5nZVwiKTtyZXR1cm4gdGhpcy5hZHZhbmNlVG8oYSl9O1xuYS5wcm90b3R5cGUuZ2V0TmV4dD1mdW5jdGlvbigpe2Zvcih2YXIgYTswPHRoaXMucXVldWUuY291bnQoKTspaWYoYT10aGlzLnF1ZXVlLnBlZWsoKSxhLmlzQ2FuY2VsbGVkKCkpdGhpcy5xdWV1ZS5kZXF1ZXVlKCk7ZWxzZSByZXR1cm4gYTtyZXR1cm4gbnVsbH07YS5wcm90b3R5cGUuc2NoZWR1bGVBYnNvbHV0ZT1mdW5jdGlvbihhLGMsZCl7dmFyIGU9dGhpcyxnPW5ldyBSKGUsYSxmdW5jdGlvbihhLGIpe2UucXVldWUucmVtb3ZlKGcpO3JldHVybiBkKGEsYil9LGMsZS5jb21wYXJlcik7ZS5xdWV1ZS5lbnF1ZXVlKGcpO3JldHVybiBnLmRpc3Bvc2FibGV9O3JldHVybiBhfSgpO3ZhciBmPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYSgpe3ZhciBiPXRoaXM7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyxKLGZ1bmN0aW9uKGEsZCl7dmFyIGU9eC5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZChiLGEpfSwwKTtyZXR1cm4gQShmdW5jdGlvbigpe3guY2xlYXJUaW1lb3V0KGUpfSl9LGZ1bmN0aW9uKGEsXG5kLGUpe3ZhciBnLGQ9cy5ub3JtYWxpemUoZCk7Zz14LnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlKGIsYSl9LGQpO3JldHVybiBBKGZ1bmN0aW9uKCl7eC5jbGVhclRpbWVvdXQoZyl9KX0sZnVuY3Rpb24oYSxkLGUpe3JldHVybiBiLnNjaGVkdWxlV2l0aFJlbGF0aXZlQW5kU3RhdGUoYSxkLWIubm93KCksZSl9KX1vKGEscyk7cmV0dXJuIGF9KCksbWE9cy5UaW1lb3V0PW5ldyBmLHQ9bS5Ob3RpZmljYXRpb249ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fWEucHJvdG90eXBlLmFjY2VwdD1mdW5jdGlvbihhLGMsZCl7cmV0dXJuIDE8YXJndW1lbnRzLmxlbmd0aHx8XCJmdW5jdGlvblwiPT09dHlwZW9mIGE/dGhpcy5fYWNjZXB0KGEsYyxkKTp0aGlzLl9hY2NlcHRPYnNlcnZhYmxlKGEpfTthLnByb3RvdHlwZS50b09ic2VydmFibGU9ZnVuY3Rpb24oYSl7dmFyIGM9dGhpcyxhPWF8fHMuSW1tZWRpYXRlO3JldHVybiBpKGZ1bmN0aW9uKGQpe3JldHVybiBhLnNjaGVkdWxlKGZ1bmN0aW9uKCl7Yy5fYWNjZXB0T2JzZXJ2YWJsZShkKTtcbmlmKFwiTlwiPT09Yy5raW5kKWQub25Db21wbGV0ZWQoKX0pfSl9O2EucHJvdG90eXBlLmhhc1ZhbHVlPSExO2EucHJvdG90eXBlLmVxdWFscz1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy50b1N0cmluZygpPT09KGE9PT1ufHxudWxsPT09YT9cIlwiOmEudG9TdHJpbmcoKSl9O3JldHVybiBhfSgpO3QuY3JlYXRlT25OZXh0PWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyB0O2IudmFsdWU9YTtiLmhhc1ZhbHVlPSEwO2Iua2luZD1cIk5cIjtiLl9hY2NlcHQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEodGhpcy52YWx1ZSl9O2IuX2FjY2VwdE9ic2VydmFibGU9ZnVuY3Rpb24oYSl7cmV0dXJuIGEub25OZXh0KHRoaXMudmFsdWUpfTtiLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJPbk5leHQoXCIrdGhpcy52YWx1ZStcIilcIn07cmV0dXJuIGJ9O3QuY3JlYXRlT25FcnJvcj1mdW5jdGlvbihhKXt2YXIgYj1uZXcgdDtiLmV4Y2VwdGlvbj1hO2Iua2luZD1cIkVcIjtiLl9hY2NlcHQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYih0aGlzLmV4Y2VwdGlvbil9O1xuYi5fYWNjZXB0T2JzZXJ2YWJsZT1mdW5jdGlvbihhKXtyZXR1cm4gYS5vbkVycm9yKHRoaXMuZXhjZXB0aW9uKX07Yi50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiT25FcnJvcihcIit0aGlzLmV4Y2VwdGlvbitcIilcIn07cmV0dXJuIGJ9O3QuY3JlYXRlT25Db21wbGV0ZWQ9ZnVuY3Rpb24oKXt2YXIgYT1uZXcgdDthLmtpbmQ9XCJDXCI7YS5fYWNjZXB0PWZ1bmN0aW9uKGEsYyxkKXtyZXR1cm4gZCgpfTthLl9hY2NlcHRPYnNlcnZhYmxlPWZ1bmN0aW9uKGEpe3JldHVybiBhLm9uQ29tcGxldGVkKCl9O2EudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIk9uQ29tcGxldGVkKClcIn07cmV0dXJuIGF9O3ZhciBHPWZ1bmN0aW9uKCl7fSxmPUcucHJvdG90eXBlO2YuY29uY2F0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcztyZXR1cm4gaShmdW5jdGlvbihiKXt2YXIgYyxkPWEuZ2V0RW51bWVyYXRvcigpLGU9ITEsZz1uZXcgQztjPUIuc2NoZWR1bGVSZWN1cnNpdmUoZnVuY3Rpb24oYSl7dmFyIGMsXG56LHE9ITE7aWYoIWUpe3RyeXtpZihxPWQubW92ZU5leHQoKSljPWQuY3VycmVudH1jYXRjaChrKXt6PWt9aWYodm9pZCAwIT09eiliLm9uRXJyb3Ioeik7ZWxzZSBpZihxKXo9bmV3IHYsZy5kaXNwb3NhYmxlKHopLHouZGlzcG9zYWJsZShjLnN1YnNjcmliZShmdW5jdGlvbihhKXtiLm9uTmV4dChhKX0sZnVuY3Rpb24oYSl7Yi5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2EoKX0pKTtlbHNlIGIub25Db21wbGV0ZWQoKX19KTtyZXR1cm4gbmV3IHAoZyxjLEEoZnVuY3Rpb24oKXtlPSEwfSkpfSl9O2YuY2F0Y2hFeGNlcHRpb249ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3ZhciBjLGQ9YS5nZXRFbnVtZXJhdG9yKCksZT0hMSxnLGg7Zz1uZXcgQztjPUIuc2NoZWR1bGVSZWN1cnNpdmUoZnVuY3Rpb24oYSl7dmFyIGMscSxrO2s9ITE7aWYoIWUpe3RyeXtpZihrPWQubW92ZU5leHQoKSljPWQuY3VycmVudH1jYXRjaChmKXtxPWZ9aWYodm9pZCAwIT09cSliLm9uRXJyb3IocSk7XG5lbHNlIGlmKGspcT1uZXcgdixnLmRpc3Bvc2FibGUocSkscS5kaXNwb3NhYmxlKGMuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2Iub25OZXh0KGEpfSxmdW5jdGlvbihiKXtoPWI7YSgpfSxmdW5jdGlvbigpe2Iub25Db21wbGV0ZWQoKX0pKTtlbHNlIGlmKHZvaWQgMCE9PWgpYi5vbkVycm9yKGgpO2Vsc2UgYi5vbkNvbXBsZXRlZCgpfX0pO3JldHVybiBuZXcgcChnLGMsQShmdW5jdGlvbigpe2U9ITB9KSl9KX07dmFyICQ9Ry5yZXBlYXQ9ZnVuY3Rpb24oYSxiKXtiPT09biYmKGI9LTEpO3ZhciBjPW5ldyBHO2MuZ2V0RW51bWVyYXRvcj1mdW5jdGlvbigpe3JldHVybntsZWZ0OmIsY3VycmVudDpudWxsLG1vdmVOZXh0OmZ1bmN0aW9uKCl7aWYoMD09PXRoaXMubGVmdClyZXR1cm4gdGhpcy5jdXJyZW50PW51bGwsITE7MDx0aGlzLmxlZnQmJnRoaXMubGVmdC0tO3RoaXMuY3VycmVudD1hO3JldHVybiEwfX19O3JldHVybiBjfSxTPUcuZm9yRW51bWVyYXRvcj1mdW5jdGlvbihhKXt2YXIgYj1cbm5ldyBHO2IuZ2V0RW51bWVyYXRvcj1mdW5jdGlvbigpe3JldHVybntfaW5kZXg6LTEsY3VycmVudDpudWxsLG1vdmVOZXh0OmZ1bmN0aW9uKCl7aWYoKyt0aGlzLl9pbmRleDxhLmxlbmd0aClyZXR1cm4gdGhpcy5jdXJyZW50PWFbdGhpcy5faW5kZXhdLCEwO3RoaXMuX2luZGV4PS0xO3RoaXMuY3VycmVudD1udWxsO3JldHVybiExfX19O3JldHVybiBifSxyPW0uT2JzZXJ2ZXI9ZnVuY3Rpb24oKXt9LFQ9bS5JbnRlcm5hbHMuQWJzdHJhY3RPYnNlcnZlcj1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoKXt0aGlzLmlzU3RvcHBlZD0hMX1vKGEscik7YS5wcm90b3R5cGUub25OZXh0PWZ1bmN0aW9uKGEpe3RoaXMuaXNTdG9wcGVkfHx0aGlzLm5leHQoYSl9O2EucHJvdG90eXBlLm9uRXJyb3I9ZnVuY3Rpb24oYSl7aWYoIXRoaXMuaXNTdG9wcGVkKXRoaXMuaXNTdG9wcGVkPSEwLHRoaXMuZXJyb3IoYSl9O2EucHJvdG90eXBlLm9uQ29tcGxldGVkPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNTdG9wcGVkKXRoaXMuaXNTdG9wcGVkPVxuITAsdGhpcy5jb21wbGV0ZWQoKX07YS5wcm90b3R5cGUuZGlzcG9zZT1mdW5jdGlvbigpe3RoaXMuaXNTdG9wcGVkPSEwfTtyZXR1cm4gYX0oKSxOPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiLGMsZCl7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7dGhpcy5fb25OZXh0PWI7dGhpcy5fb25FcnJvcj1jO3RoaXMuX29uQ29tcGxldGVkPWR9byhhLFQpO2EucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oYSl7dGhpcy5fb25OZXh0KGEpfTthLnByb3RvdHlwZS5lcnJvcj1mdW5jdGlvbihhKXt0aGlzLl9vbkVycm9yKGEpfTthLnByb3RvdHlwZS5jb21wbGV0ZWQ9ZnVuY3Rpb24oKXt0aGlzLl9vbkNvbXBsZXRlZCgpfTtyZXR1cm4gYX0oKSxIPW0uSW50ZXJuYWxzLkJpbmFyeU9ic2VydmVyPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGMpe1wiZnVuY3Rpb25cIj09PXR5cGVvZiBhJiZcImZ1bmN0aW9uXCI9PT10eXBlb2YgYz8odGhpcy5sZWZ0T2JzZXJ2ZXI9YWEoYSksdGhpcy5yaWdodE9ic2VydmVyPVxuYWEoYykpOih0aGlzLmxlZnRPYnNlcnZlcj1hLHRoaXMucmlnaHRPYnNlcnZlcj1jKX1vKGEscik7YS5wcm90b3R5cGUub25OZXh0PWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXM7cmV0dXJuIGEuc3dpdGNoVmFsdWUoZnVuY3Rpb24oYSl7cmV0dXJuIGEuYWNjZXB0KGMubGVmdE9ic2VydmVyKX0sZnVuY3Rpb24oYSl7cmV0dXJuIGEuYWNjZXB0KGMucmlnaHRPYnNlcnZlcil9KX07YS5wcm90b3R5cGUub25FcnJvcj1mdW5jdGlvbigpe307YS5wcm90b3R5cGUub25Db21wbGV0ZWQ9ZnVuY3Rpb24oKXt9O3JldHVybiBhfSgpLG5hPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGMpe3RoaXMuc2NoZWR1bGVyPWE7dGhpcy5vYnNlcnZlcj1jO3RoaXMuaGFzRmF1bHRlZD10aGlzLmlzQWNxdWlyZWQ9ITE7dGhpcy5xdWV1ZT1bXTt0aGlzLmRpc3Bvc2FibGU9bmV3IEN9byhhLFQpO2EucHJvdG90eXBlLmVuc3VyZUFjdGl2ZT1mdW5jdGlvbigpe3ZhciBhPSExLGM9dGhpcztpZighdGhpcy5oYXNGYXVsdGVkJiZcbjA8dGhpcy5xdWV1ZS5sZW5ndGgpYT0hdGhpcy5pc0FjcXVpcmVkLHRoaXMuaXNBY3F1aXJlZD0hMDthJiZ0aGlzLmRpc3Bvc2FibGUuZGlzcG9zYWJsZSh0aGlzLnNjaGVkdWxlci5zY2hlZHVsZVJlY3Vyc2l2ZShmdW5jdGlvbihhKXt2YXIgYjtpZigwPGMucXVldWUubGVuZ3RoKXtiPWMucXVldWUuc2hpZnQoKTt0cnl7YigpfWNhdGNoKGcpe3Rocm93IGMucXVldWU9W10sYy5oYXNGYXVsdGVkPSEwLGc7fWEoKX1lbHNlIGMuaXNBY3F1aXJlZD0hMX0pKX07YS5wcm90b3R5cGUubmV4dD1mdW5jdGlvbihhKXt2YXIgYz10aGlzO3RoaXMucXVldWUucHVzaChmdW5jdGlvbigpe2Mub2JzZXJ2ZXIub25OZXh0KGEpfSl9O2EucHJvdG90eXBlLmVycm9yPWZ1bmN0aW9uKGEpe3ZhciBjPXRoaXM7dGhpcy5xdWV1ZS5wdXNoKGZ1bmN0aW9uKCl7Yy5vYnNlcnZlci5vbkVycm9yKGEpfSl9O2EucHJvdG90eXBlLmNvbXBsZXRlZD1mdW5jdGlvbigpe3ZhciBhPXRoaXM7dGhpcy5xdWV1ZS5wdXNoKGZ1bmN0aW9uKCl7YS5vYnNlcnZlci5vbkNvbXBsZXRlZCgpfSl9O1xuYS5wcm90b3R5cGUuZGlzcG9zZT1mdW5jdGlvbigpe2EuYmFzZS5kaXNwb3NlLmNhbGwodGhpcyk7dGhpcy5kaXNwb3NhYmxlLmRpc3Bvc2UoKX07cmV0dXJuIGF9KCksST1yLmNyZWF0ZT1mdW5jdGlvbihhLGIsYyl7Ynx8KGI9ZnVuY3Rpb24oYSl7dGhyb3cgYTt9KTtjfHwoYz1mdW5jdGlvbigpe30pO3JldHVybiBuZXcgTihhLGIsYyl9O3IuZnJvbU5vdGlmaWVyPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgTihmdW5jdGlvbihiKXtyZXR1cm4gYSh0LmNyZWF0ZU9uTmV4dChiKSl9LGZ1bmN0aW9uKGIpe3JldHVybiBhKHQuY3JlYXRlT25FcnJvcihiKSl9LGZ1bmN0aW9uKCl7cmV0dXJuIGEodC5jcmVhdGVPbkNvbXBsZXRlZCgpKX0pfTt2YXIgYWE9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBOKGZ1bmN0aW9uKGIpe2EodC5jcmVhdGVPbk5leHQoYikpfSxmdW5jdGlvbihiKXthKHQuY3JlYXRlT25FcnJvcihiKSl9LGZ1bmN0aW9uKCl7YSh0LmNyZWF0ZU9uQ29tcGxldGVkKCkpfSl9O1xuci5wcm90b3R5cGUudG9Ob3RpZmllcj1mdW5jdGlvbigpe3ZhciBhPXRoaXM7cmV0dXJuIGZ1bmN0aW9uKGIpe3JldHVybiBiLmFjY2VwdChhKX19O3IucHJvdG90eXBlLmFzT2JzZXJ2ZXI9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBuZXcgTihmdW5jdGlvbihiKXtyZXR1cm4gYS5vbk5leHQoYil9LGZ1bmN0aW9uKGIpe3JldHVybiBhLm9uRXJyb3IoYil9LGZ1bmN0aW9uKCl7cmV0dXJuIGEub25Db21wbGV0ZWQoKX0pfTt2YXIgaj1tLk9ic2VydmFibGU9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7fWEucHJvdG90eXBlLnN1YnNjcmliZT1mdW5jdGlvbihhLGMsZCl7cmV0dXJuIHRoaXMuX3N1YnNjcmliZSgwPT09YXJndW1lbnRzLmxlbmd0aHx8MTxhcmd1bWVudHMubGVuZ3RofHxcImZ1bmN0aW9uXCI9PT10eXBlb2YgYT9JKGEsYyxkKTphKX07cmV0dXJuIGF9KCksZj1qLnByb3RvdHlwZSxwYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYil7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG50aGlzLl9zdWJzY3JpYmU9ZnVuY3Rpb24oYSl7dmFyIGQ9bmV3IG9hKGEpO0Quc2NoZWR1bGVSZXF1aXJlZCgpP0Quc2NoZWR1bGUoZnVuY3Rpb24oKXtkLmRpc3Bvc2FibGUoYihkKSl9KTpkLmRpc3Bvc2FibGUoYihkKSk7cmV0dXJuIGR9fW8oYSxqKTthLnByb3RvdHlwZS5fc3Vic2NyaWJlPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdWJzY3JpYmUoYSl9O3JldHVybiBhfSgpLG9hPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiKXthLmJhc2UuY29uc3RydWN0b3IuY2FsbCh0aGlzKTt0aGlzLm9ic2VydmVyPWI7dGhpcy5tPW5ldyB2fW8oYSxUKTthLnByb3RvdHlwZS5kaXNwb3NhYmxlPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm0uZGlzcG9zYWJsZShhKX07YS5wcm90b3R5cGUubmV4dD1mdW5jdGlvbihhKXt0aGlzLm9ic2VydmVyLm9uTmV4dChhKX07YS5wcm90b3R5cGUuZXJyb3I9ZnVuY3Rpb24oYSl7dGhpcy5vYnNlcnZlci5vbkVycm9yKGEpO3RoaXMubS5kaXNwb3NlKCl9O1xuYS5wcm90b3R5cGUuY29tcGxldGVkPWZ1bmN0aW9uKCl7dGhpcy5vYnNlcnZlci5vbkNvbXBsZXRlZCgpO3RoaXMubS5kaXNwb3NlKCl9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXthLmJhc2UuZGlzcG9zZS5jYWxsKHRoaXMpO3RoaXMubS5kaXNwb3NlKCl9O3JldHVybiBhfSgpLGJhPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiLGMsZCl7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7dGhpcy5rZXk9Yjt0aGlzLnVuZGVybHlpbmdPYnNlcnZhYmxlPSFkP2M6aShmdW5jdGlvbihhKXtyZXR1cm4gbmV3IHAoZC5nZXREaXNwb3NhYmxlKCksYy5zdWJzY3JpYmUoYSkpfSl9byhhLGopO2EucHJvdG90eXBlLl9zdWJzY3JpYmU9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMudW5kZXJseWluZ09ic2VydmFibGUuc3Vic2NyaWJlKGEpfTtyZXR1cm4gYX0oKSxxYT1tLkNvbm5lY3RhYmxlT2JzZXJ2YWJsZT1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxjKXt2YXIgZD1hLmFzT2JzZXJ2YWJsZSgpLFxuZT0hMSxnPW51bGw7dGhpcy5jb25uZWN0PWZ1bmN0aW9uKCl7ZXx8KGU9ITAsZz1uZXcgcChkLnN1YnNjcmliZShjKSxBKGZ1bmN0aW9uKCl7ZT0hMX0pKSk7cmV0dXJuIGd9O3RoaXMuX3N1YnNjcmliZT1mdW5jdGlvbihhKXtyZXR1cm4gYy5zdWJzY3JpYmUoYSl9fW8oYSxqKTthLnByb3RvdHlwZS5jb25uZWN0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY29ubmVjdCgpfTthLnByb3RvdHlwZS5yZWZDb3VudD1mdW5jdGlvbigpe3ZhciBhPW51bGwsYz0wLGQ9dGhpcztyZXR1cm4gaShmdW5jdGlvbihlKXt2YXIgZyxoO2MrKztnPTE9PT1jO2g9ZC5zdWJzY3JpYmUoZSk7ZyYmKGE9ZC5jb25uZWN0KCkpO3JldHVybiBBKGZ1bmN0aW9uKCl7aC5kaXNwb3NlKCk7Yy0tOzA9PT1jJiZhLmRpc3Bvc2UoKX0pfSl9O2EucHJvdG90eXBlLl9zdWJzY3JpYmU9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX3N1YnNjcmliZShhKX07cmV0dXJuIGF9KCksTz1tLlN1YmplY3Q9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG52YXIgYj0hMSxjPSExLGQ9bmV3IHUsZT1uLGc9ZnVuY3Rpb24oKXtpZihiKXRocm93IEVycm9yKEspO307dGhpcy5vbkNvbXBsZXRlZD1mdW5jdGlvbigpe3ZhciBhLGI7ZygpO2N8fChhPWQudG9BcnJheSgpLGQ9bmV3IHUsYz0hMCk7aWYoYSE9PW4pZm9yKGI9MDtiPGEubGVuZ3RoO2IrKylhW2JdLm9uQ29tcGxldGVkKCl9O3RoaXMub25FcnJvcj1mdW5jdGlvbihhKXt2YXIgYix6O2coKTtjfHwoYj1kLnRvQXJyYXkoKSxkPW5ldyB1LGM9ITAsZT1hKTtpZihiIT09bilmb3Ioej0wO3o8Yi5sZW5ndGg7eisrKWJbel0ub25FcnJvcihhKX07dGhpcy5vbk5leHQ9ZnVuY3Rpb24oYSl7dmFyIGIsZTtnKCk7Y3x8KGI9ZC50b0FycmF5KCkpO2lmKHZvaWQgMCE9PWIpZm9yKGU9MDtlPGIubGVuZ3RoO2UrKyliW2VdLm9uTmV4dChhKX07dGhpcy5fc3Vic2NyaWJlPWZ1bmN0aW9uKGEpe2coKTtpZighYylyZXR1cm4gZC5hZGQoYSksZnVuY3Rpb24oYSl7cmV0dXJue29ic2VydmVyOmEsZGlzcG9zZTpmdW5jdGlvbigpe2lmKG51bGwhPT1cbnRoaXMub2JzZXJ2ZXImJiFiKWQucmVtb3ZlKHRoaXMub2JzZXJ2ZXIpLHRoaXMub2JzZXJ2ZXI9bnVsbH19fShhKTtpZihlIT09bilyZXR1cm4gYS5vbkVycm9yKGUpLHc7YS5vbkNvbXBsZXRlZCgpO3JldHVybiB3fTt0aGlzLmRpc3Bvc2U9ZnVuY3Rpb24oKXtiPSEwO2Q9bnVsbH19byhhLGopO0UoYSxyKTthLnByb3RvdHlwZS5vbkNvbXBsZXRlZD1mdW5jdGlvbigpe3RoaXMub25Db21wbGV0ZWQoKX07YS5wcm90b3R5cGUub25FcnJvcj1mdW5jdGlvbihhKXt0aGlzLm9uRXJyb3IoYSl9O2EucHJvdG90eXBlLm9uTmV4dD1mdW5jdGlvbihhKXt0aGlzLm9uTmV4dChhKX07YS5wcm90b3R5cGUuX3N1YnNjcmliZT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Vic2NyaWJlKGEpfTthLnByb3RvdHlwZS5kaXNwb3NlPWZ1bmN0aW9uKCl7dGhpcy5kaXNwb3NlKCl9O2EuY3JlYXRlPWZ1bmN0aW9uKGEsYyl7cmV0dXJuIG5ldyByYShhLGMpfTtyZXR1cm4gYX0oKSxVPW0uQXN5bmNTdWJqZWN0PVxuZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7YS5iYXNlLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7dmFyIGI9ITEsYz0hMSxkPW51bGwsZT0hMSxnPW5ldyB1LGg9bnVsbCxsPWZ1bmN0aW9uKCl7aWYoYil0aHJvdyBFcnJvcihLKTt9O3RoaXMub25Db21wbGV0ZWQ9ZnVuY3Rpb24oKXt2YXIgYT0hMSxiLGgsZjtsKCk7Y3x8KGI9Zy50b0FycmF5KCksZz1uZXcgdSxjPSEwLGg9ZCxhPWUpO2lmKGIhPT1uKWlmKGEpZm9yKGY9MDtmPGIubGVuZ3RoO2YrKylhPWJbZl0sYS5vbk5leHQoaCksYS5vbkNvbXBsZXRlZCgpO2Vsc2UgZm9yKGY9MDtmPGIubGVuZ3RoO2YrKyliW2ZdLm9uQ29tcGxldGVkKCl9O3RoaXMub25FcnJvcj1mdW5jdGlvbihhKXt2YXIgYixkO2woKTtjfHwoYj1nLnRvQXJyYXkoKSxnPW5ldyB1LGM9ITAsaD1hKTtpZihiIT09bilmb3IoZD0wO2Q8Yi5sZW5ndGg7ZCsrKWJbZF0ub25FcnJvcihhKX07dGhpcy5vbk5leHQ9ZnVuY3Rpb24oYSl7bCgpO2N8fChkPWEsZT0hMCl9O1xudGhpcy5fc3Vic2NyaWJlPWZ1bmN0aW9uKGEpe3ZhciBxLGssZjtsKCk7aWYoIWMpcmV0dXJuIGcuYWRkKGEpLGZ1bmN0aW9uKGEpe3JldHVybntvYnNlcnZlcjphLGRpc3Bvc2U6ZnVuY3Rpb24oKXtpZihudWxsIT09dGhpcy5vYnNlcnZlciYmIWIpZy5yZW1vdmUodGhpcy5vYnNlcnZlciksdGhpcy5vYnNlcnZlcj1udWxsfX19KGEpO3E9aDtrPWU7Zj1kO2lmKG51bGwhPT1xKWEub25FcnJvcihxKTtlbHNle2lmKGspYS5vbk5leHQoZik7YS5vbkNvbXBsZXRlZCgpfXJldHVybiB3fTt0aGlzLmRpc3Bvc2U9ZnVuY3Rpb24oKXtiPSEwO2Q9aD1nPW51bGx9fW8oYSxqKTtFKGEscik7YS5wcm90b3R5cGUub25Db21wbGV0ZWQ9ZnVuY3Rpb24oKXt0aGlzLm9uQ29tcGxldGVkKCl9O2EucHJvdG90eXBlLm9uRXJyb3I9ZnVuY3Rpb24oYSl7dGhpcy5vbkVycm9yKGEpfTthLnByb3RvdHlwZS5vbk5leHQ9ZnVuY3Rpb24oYSl7dGhpcy5vbk5leHQoYSl9O2EucHJvdG90eXBlLl9zdWJzY3JpYmU9XG5mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5fc3Vic2NyaWJlKGEpfTthLnByb3RvdHlwZS5kaXNwb3NlPWZ1bmN0aW9uKCl7dGhpcy5kaXNwb3NlKCl9O3JldHVybiBhfSgpLFA9bS5CZWhhdmlvclN1YmplY3Q9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIpe2EuYmFzZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO3ZhciBjPWIsZD1uZXcgdSxlPSExLGc9ITEsaD1udWxsLGw9ZnVuY3Rpb24oKXtpZihlKXRocm93IEVycm9yKEspO307dGhpcy5vbkNvbXBsZXRlZD1mdW5jdGlvbigpe3ZhciBhLGI7YT1udWxsO2woKTtnfHwoYT1kLnRvQXJyYXkoKSxkPW5ldyB1LGc9ITApO2lmKG51bGwhPT1hKWZvcihiPTA7YjxhLmxlbmd0aDtiKyspYVtiXS5vbkNvbXBsZXRlZCgpfTt0aGlzLm9uRXJyb3I9ZnVuY3Rpb24oYSl7dmFyIGIsYztjPW51bGw7bCgpO2d8fChjPWQudG9BcnJheSgpLGQ9bmV3IHUsZz0hMCxoPWEpO2lmKG51bGwhPT1jKWZvcihiPTA7YjxjLmxlbmd0aDtiKyspY1tiXS5vbkVycm9yKGEpfTtcbnRoaXMub25OZXh0PWZ1bmN0aW9uKGEpe3ZhciBiLGU7Yj1udWxsO2woKTtnfHwoYz1hLGI9ZC50b0FycmF5KCkpO2lmKG51bGwhPT1iKWZvcihlPTA7ZTxiLmxlbmd0aDtlKyspYltlXS5vbk5leHQoYSl9O3RoaXMuX3N1YnNjcmliZT1mdW5jdGlvbihhKXt2YXIgYjtsKCk7aWYoIWcpcmV0dXJuIGQuYWRkKGEpLGEub25OZXh0KGMpLGZ1bmN0aW9uKGEpe3JldHVybntvYnNlcnZlcjphLGRpc3Bvc2U6ZnVuY3Rpb24oKXtpZihudWxsIT09dGhpcy5vYnNlcnZlciYmIWUpZC5yZW1vdmUodGhpcy5vYnNlcnZlciksdGhpcy5vYnNlcnZlcj1udWxsfX19KGEpO2I9aDtpZihudWxsIT09YilhLm9uRXJyb3IoYik7ZWxzZSBhLm9uQ29tcGxldGVkKCk7cmV0dXJuIHd9O3RoaXMuZGlzcG9zZT1mdW5jdGlvbigpe2U9ITA7aD1jPWQ9bnVsbH19byhhLGopO0UoYSxyKTthLnByb3RvdHlwZS5vbkNvbXBsZXRlZD1mdW5jdGlvbigpe3RoaXMub25Db21wbGV0ZWQoKX07YS5wcm90b3R5cGUub25FcnJvcj1cbmZ1bmN0aW9uKGEpe3RoaXMub25FcnJvcihhKX07YS5wcm90b3R5cGUub25OZXh0PWZ1bmN0aW9uKGEpe3RoaXMub25OZXh0KGEpfTthLnByb3RvdHlwZS5fc3Vic2NyaWJlPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdWJzY3JpYmUoYSl9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07cmV0dXJuIGF9KCk7UC5wcm90b3R5cGUudG9Ob3RpZmllcj1yLnByb3RvdHlwZS50b05vdGlmaWVyO1AucHJvdG90eXBlLmFzT2JzZXJ2ZXI9ci5wcm90b3R5cGUuQXNPYnNlcnZlcjt2YXIgY2E9bS5SZXBsYXlTdWJqZWN0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhLGMsZCl7dmFyIGU9YT09PW4/TnVtYmVyLk1BWF9WQUxVRTphLGc9Yz09PW4/TnVtYmVyLk1BWF9WQUxVRTpjLGg9ZHx8cy5jdXJyZW50VGhyZWFkLGw9W10sZj1uZXcgdSxxPSExLGs9ITEsaT1mdW5jdGlvbihhKXt2YXIgYj1xPzE6MCxjPWIrZTtmb3IoYzxlJiYoYz1lKTtsLmxlbmd0aD5jOylsLnNoaWZ0KCk7XG5mb3IoO2wubGVuZ3RoPmImJmEtbFswXS50aW1lc3RhbXA+ZzspbC5zaGlmdCgpfSxqPWZ1bmN0aW9uKGEpe3ZhciBiPWgubm93KCk7bC5wdXNoKHt2YWx1ZTphLHRpbWVzdGFtcDpifSk7aShiKX0sbT1mdW5jdGlvbigpe2lmKGspdGhyb3cgRXJyb3IoSyk7fTt0aGlzLm9uTmV4dD1mdW5jdGlvbihhKXt2YXIgYj1udWxsLGMsZDttKCk7aWYoIXEpe2I9Zi50b0FycmF5KCk7aih0LmNyZWF0ZU9uTmV4dChhKSk7Zm9yKGQ9MDtkPGIubGVuZ3RoO2QrKyljPWJbZF0sYy5vbk5leHQoYSl9aWYobnVsbCE9PWIpZm9yKGQ9MDtkPGIubGVuZ3RoO2QrKyljPWJbZF0sYy5lbnN1cmVBY3RpdmUoKX07dGhpcy5vbkVycm9yPWZ1bmN0aW9uKGEpe3ZhciBiPW51bGwsYzttKCk7aWYoIXEpe3E9ITA7aih0LmNyZWF0ZU9uRXJyb3IoYSkpO2I9Zi50b0FycmF5KCk7Zm9yKGM9MDtjPGIubGVuZ3RoO2MrKyliW2NdLm9uRXJyb3IoYSk7Zj1uZXcgdX1pZihudWxsIT09Yilmb3IoYz0wO2M8Yi5sZW5ndGg7YysrKWJbY10uZW5zdXJlQWN0aXZlKCl9O1xudGhpcy5vbkNvbXBsZXRlZD1mdW5jdGlvbigpe3ZhciBhPW51bGwsYjttKCk7aWYoIXEpe3E9ITA7aih0LmNyZWF0ZU9uQ29tcGxldGVkKCkpO2E9Zi50b0FycmF5KCk7Zm9yKGI9MDtiPGEubGVuZ3RoO2IrKylhW2JdLm9uQ29tcGxldGVkKCk7Zj1uZXcgdX1pZihudWxsIT09YSlmb3IoYj0wO2I8YS5sZW5ndGg7YisrKWFbYl0uZW5zdXJlQWN0aXZlKCl9O3RoaXMuX3N1YnNjcmliZT1mdW5jdGlvbihhKXt2YXIgYT1uZXcgbmEoaCxhKSxiPWZ1bmN0aW9uKGEpe3JldHVybntvYnNlcnZlcjphLGRpc3Bvc2U6ZnVuY3Rpb24oKXt0aGlzLm9ic2VydmVyLmRpc3Bvc2UoKTtudWxsIT09dGhpcy5vYnNlcnZlciYmIWsmJmYucmVtb3ZlKHRoaXMub2JzZXJ2ZXIpfX19KGEpLGM7bSgpO2koaC5ub3coKSk7Zi5hZGQoYSk7Zm9yKGM9MDtjPGwubGVuZ3RoO2MrKylsW2NdLnZhbHVlLmFjY2VwdChhKTthLmVuc3VyZUFjdGl2ZSgpO3JldHVybiBifTt0aGlzLmRpc3Bvc2U9ZnVuY3Rpb24oKXtrPVxuITA7Zj1udWxsfX1vKGEsaik7RShhLGopO2EucHJvdG90eXBlLm9uTmV4dD1mdW5jdGlvbihhKXt0aGlzLm9uTmV4dChhKX07YS5wcm90b3R5cGUub25FcnJvcj1mdW5jdGlvbihhKXt0aGlzLm9uRXJyb3IoYSl9O2EucHJvdG90eXBlLm9uQ29tcGxldGVkPWZ1bmN0aW9uKCl7dGhpcy5vbkNvbXBsZXRlZCgpfTthLnByb3RvdHlwZS5fc3Vic2NyaWJlPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9zdWJzY3JpYmUoYSl9O2EucHJvdG90eXBlLmRpc3Bvc2U9ZnVuY3Rpb24oKXt0aGlzLmRpc3Bvc2UoKX07cmV0dXJuIGF9KCkscmE9ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGEsYyl7dGhpcy5vYnNlcnZlcj1hO3RoaXMub2JzZXJ2YWJsZT1jfW8oYSxqKTtFKGEscik7YS5wcm90b3R5cGUub25Db21wbGV0ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5vYnNlcnZlci5vbkNvbXBsZXRlZCgpfTthLnByb3RvdHlwZS5vbkVycm9yPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm9ic2VydmVyLm9uRXJyb3IoYSl9O1xuYS5wcm90b3R5cGUub25OZXh0PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm9ic2VydmVyLm9uTmV4dChhKX07YS5wcm90b3R5cGUuX1N1YnNjcmliZT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5vYnNlcnZhYmxlLlN1YnNjcmliZShhKX07cmV0dXJuIGF9KCk7ai5zdGFydD1mdW5jdGlvbihhLGIsYyxkKXtjfHwoYz1bXSk7cmV0dXJuIHNhKGEsZCkuYXBwbHkoYixjKX07dmFyIHNhPWoudG9Bc3luYz1mdW5jdGlvbihhLGIpe2J8fChiPW1hKTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYz1uZXcgVSxkPWZ1bmN0aW9uKCl7dmFyIGI7dHJ5e2I9YS5hcHBseSh0aGlzLGFyZ3VtZW50cyl9Y2F0Y2goZCl7Yy5vbkVycm9yKGQpO3JldHVybn1jLm9uTmV4dChiKTtjLm9uQ29tcGxldGVkKCl9LGU9eS5jYWxsKGFyZ3VtZW50cyksZz10aGlzO2Iuc2NoZWR1bGUoZnVuY3Rpb24oKXtkLmFwcGx5KGcsZSl9KTtyZXR1cm4gY319O2YubXVsdGljYXN0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztyZXR1cm5cImZ1bmN0aW9uXCI9PT1cbnR5cGVvZiBhP2koZnVuY3Rpb24oZCl7dmFyIGU9Yy5tdWx0aWNhc3QoYSgpKTtyZXR1cm4gbmV3IHAoYihlKS5zdWJzY3JpYmUoZCksZS5jb25uZWN0KCkpfSk6bmV3IHFhKGMsYSl9O2YucHVibGlzaD1mdW5jdGlvbihhKXtyZXR1cm4hYT90aGlzLm11bHRpY2FzdChuZXcgTyk6dGhpcy5tdWx0aWNhc3QoZnVuY3Rpb24oKXtyZXR1cm4gbmV3IE99LGEpfTtmLnB1Ymxpc2hMYXN0PWZ1bmN0aW9uKGEpe3JldHVybiFhP3RoaXMubXVsdGljYXN0KG5ldyBVKTp0aGlzLm11bHRpY2FzdChmdW5jdGlvbigpe3JldHVybiBuZXcgVX0sYSl9O2YucmVwbGF5PWZ1bmN0aW9uKGEsYixjLGQpe3JldHVybiFhfHxudWxsPT09YT90aGlzLm11bHRpY2FzdChuZXcgY2EoYixjLGQpKTp0aGlzLm11bHRpY2FzdChmdW5jdGlvbigpe3JldHVybiBuZXcgY2EoYixjLGQpfSxhKX07Zi5wdWJsaXNoVmFsdWU9ZnVuY3Rpb24oYSxiKXtyZXR1cm5cImZ1bmN0aW9uXCI9PT10eXBlb2YgYT90aGlzLm11bHRpY2FzdChmdW5jdGlvbigpe3JldHVybiBuZXcgUChiKX0sXG5hKTp0aGlzLm11bHRpY2FzdChuZXcgUChhKSl9O3ZhciBkYT1qLm5ldmVyPWZ1bmN0aW9uKCl7cmV0dXJuIGkoZnVuY3Rpb24oKXtyZXR1cm4gd30pfSx0YT1qLmVtcHR5PWZ1bmN0aW9uKGEpe2F8fChhPUIpO3JldHVybiBpKGZ1bmN0aW9uKGIpe3JldHVybiBhLnNjaGVkdWxlKGZ1bmN0aW9uKCl7cmV0dXJuIGIub25Db21wbGV0ZWQoKX0pfSl9LHVhPWoucmV0dXJuVmFsdWU9ZnVuY3Rpb24oYSxiKXtifHwoYj1CKTtyZXR1cm4gaShmdW5jdGlvbihjKXtyZXR1cm4gYi5zY2hlZHVsZShmdW5jdGlvbigpe2Mub25OZXh0KGEpO3JldHVybiBjLm9uQ29tcGxldGVkKCl9KX0pfSxlYT1qLnRocm93RXhjZXB0aW9uPWZ1bmN0aW9uKGEsYil7Ynx8KGI9Qik7cmV0dXJuIGkoZnVuY3Rpb24oYyl7cmV0dXJuIGIuc2NoZWR1bGUoZnVuY3Rpb24oKXtyZXR1cm4gYy5vbkVycm9yKGEpfSl9KX0sdmE9ai5nZW5lcmF0ZT1mdW5jdGlvbihhLGIsYyxkLGUpe2V8fChlPUQpO3JldHVybiBpKGZ1bmN0aW9uKGcpe3ZhciBoPVxuITAsZj1hO3JldHVybiBlLnNjaGVkdWxlUmVjdXJzaXZlKGZ1bmN0aW9uKGEpe3ZhciBlLGs7dHJ5e2g/aD0hMTpmPWMoZiksKGU9YihmKSkmJihrPWQoZikpfWNhdGNoKGkpe2cub25FcnJvcihpKTtyZXR1cm59aWYoZSlnLm9uTmV4dChrKSxhKCk7ZWxzZSBnLm9uQ29tcGxldGVkKCl9KX0pfSxmYT1qLmRlZmVyPWZ1bmN0aW9uKGEpe3JldHVybiBpKGZ1bmN0aW9uKGIpe3ZhciBjO3RyeXtjPWEoKX1jYXRjaChkKXtyZXR1cm4gZWEoZCkuc3Vic2NyaWJlKGIpfXJldHVybiBjLnN1YnNjcmliZShiKX0pfTtqLnVzaW5nPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGkoZnVuY3Rpb24oYyl7dmFyIGQ9dyxlLGc7dHJ5e2U9YSgpLG51bGwhPT1lJiYoZD1lKSxnPWIoZSl9Y2F0Y2goaCl7cmV0dXJuIG5ldyBwKGVhKGgpLnN1YnNjcmliZShjKSxkKX1yZXR1cm4gbmV3IHAoZy5zdWJzY3JpYmUoYyksZCl9KX07dmFyIGdhPWouZnJvbUFycmF5PWZ1bmN0aW9uKGEsYil7Ynx8KGI9RCk7cmV0dXJuIGkoZnVuY3Rpb24oYyl7dmFyIGQ9XG4wO3JldHVybiBiLnNjaGVkdWxlUmVjdXJzaXZlKGZ1bmN0aW9uKGIpe2lmKGQ8YS5sZW5ndGgpYy5vbk5leHQoYVtkKytdKSxiKCk7ZWxzZSBjLm9uQ29tcGxldGVkKCl9KX0pfSxpPWouY3JlYXRlV2l0aERpc3Bvc2FibGU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBwYShhKX07ai5jcmVhdGU9ZnVuY3Rpb24oYSl7cmV0dXJuIGkoZnVuY3Rpb24oYil7cmV0dXJuIEEoYShiKSl9KX07ai5yYW5nZT1mdW5jdGlvbihhLGIsYyl7Y3x8KGM9RCk7dmFyIGQ9YStiLTE7cmV0dXJuIHZhKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGE8PWR9LGZ1bmN0aW9uKGEpe3JldHVybiBhKzF9LGZ1bmN0aW9uKGEpe3JldHVybiBhfSxjKX07Zi5yZXBlYXQ9ZnVuY3Rpb24oYSl7cmV0dXJuICQodGhpcyxhKS5jb25jYXQoKX07Zi5yZXRyeT1mdW5jdGlvbihhKXtyZXR1cm4gJCh0aGlzLGEpLmNhdGNoRXhjZXB0aW9uKCl9O2oucmVwZWF0PWZ1bmN0aW9uKGEsYixjKXtjfHwoYz1EKTtiPT09biYmKGI9LTEpO3JldHVybiB1YShhLFxuYykucmVwZWF0KGIpfTtmLnNlbGVjdD1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPTA7cmV0dXJuIGIuc3Vic2NyaWJlKGZ1bmN0aW9uKGIpe3ZhciBnO3RyeXtnPWEoYixkKyspfWNhdGNoKGgpe2Mub25FcnJvcihoKTtyZXR1cm59Yy5vbk5leHQoZyl9LGZ1bmN0aW9uKGEpe2Mub25FcnJvcihhKX0sZnVuY3Rpb24oKXtjLm9uQ29tcGxldGVkKCl9KX0pfTtmLndoZXJlPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXM7cmV0dXJuIGkoZnVuY3Rpb24oYyl7dmFyIGQ9MDtyZXR1cm4gYi5zdWJzY3JpYmUoZnVuY3Rpb24oYil7dmFyIGc7dHJ5e2c9YShiLGQrKyl9Y2F0Y2goaCl7Yy5vbkVycm9yKGgpO3JldHVybn1pZihnKWMub25OZXh0KGIpfSxmdW5jdGlvbihhKXtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Yy5vbkNvbXBsZXRlZCgpfSl9KX07Zi5ncm91cEJ5VW50aWw9ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9dGhpcztifHwoYj1RKTtkfHwoZD1cblcpO3JldHVybiBpKGZ1bmN0aW9uKGcpe3ZhciBoPXt9LGY9bmV3IHAsaT1uZXcgWihmKTtmLmFkZChlLnN1YnNjcmliZShmdW5jdGlvbihlKXt2YXIgayxqLG0sdCxvLHAsdSxzLHI7dHJ5e2o9YShlKSxwPWQoail9Y2F0Y2godyl7Zm9yKHIgaW4gaCloW3JdLm9uRXJyb3Iodyk7Zy5vbkVycm9yKHcpO3JldHVybn1vPSExO3RyeXtzPWhbcF0sc3x8KHM9bmV3IE8saFtwXT1zLG89ITApfWNhdGNoKHgpe2ZvcihyIGluIGgpaFtyXS5vbkVycm9yKHgpO2cub25FcnJvcih4KTtyZXR1cm59aWYobyl7bz1uZXcgYmEoaixzLGkpO2o9bmV3IGJhKGoscyk7dHJ5e2s9YyhqKX1jYXRjaCh5KXtmb3IociBpbiBoKWhbcl0ub25FcnJvcih5KTtnLm9uRXJyb3IoeSk7cmV0dXJufWcub25OZXh0KG8pO3U9bmV3IHY7Zi5hZGQodSk7dD1mdW5jdGlvbigpe2hbcF0hPT1uJiYoZGVsZXRlIGhbcF0scy5vbkNvbXBsZXRlZCgpKTtmLnJlbW92ZSh1KX07dS5kaXNwb3NhYmxlKGsudGFrZSgxKS5zdWJzY3JpYmUoZnVuY3Rpb24oKXt9LFxuZnVuY3Rpb24oYSl7Zm9yKHIgaW4gaCloW3JdLm9uRXJyb3IoYSk7Zy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe3QoKX0pKX10cnl7bT1iKGUpfWNhdGNoKEEpe2ZvcihyIGluIGgpaFtyXS5vbkVycm9yKEEpO2cub25FcnJvcihBKTtyZXR1cm59cy5vbk5leHQobSl9LGZ1bmN0aW9uKGEpe2Zvcih2YXIgYiBpbiBoKWhbYl0ub25FcnJvcihhKTtnLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Zm9yKHZhciBhIGluIGgpaFthXS5vbkNvbXBsZXRlZCgpO2cub25Db21wbGV0ZWQoKX0pKTtyZXR1cm4gaX0pfTtmLmdyb3VwQnk9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0aGlzLmdyb3VwQnlVbnRpbChhLGIsZnVuY3Rpb24oKXtyZXR1cm4gZGEoKX0sYyl9O2YudGFrZT1mdW5jdGlvbihhLGIpe2lmKDA+YSl0aHJvdyBFcnJvcihcIkFyZ3VtZW50IG91dCBvZiByYW5nZVwiKTtpZigwPT1hKXJldHVybiB0YShiKTt2YXIgYz10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3ZhciBlPWE7cmV0dXJuIGMuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2lmKDA8XG5lJiYoZS0tLGIub25OZXh0KGEpLDA9PT1lKSliLm9uQ29tcGxldGVkKCl9LGZ1bmN0aW9uKGEpe3JldHVybiBiLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7cmV0dXJuIGIub25Db21wbGV0ZWQoKX0pfSl9O2Yuc2tpcD1mdW5jdGlvbihhKXtpZigwPmEpdGhyb3cgRXJyb3IoXCJBcmd1bWVudCBvdXQgb2YgcmFuZ2VcIik7dmFyIGI9dGhpcztyZXR1cm4gaShmdW5jdGlvbihjKXt2YXIgZD1hO3JldHVybiBiLnN1YnNjcmliZShmdW5jdGlvbihhKXtpZigwPj1kKWMub25OZXh0KGEpO2Vsc2UgZC0tfSxmdW5jdGlvbihhKXtyZXR1cm4gYy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe3JldHVybiBjLm9uQ29tcGxldGVkKCl9KX0pfTtmLnRha2VXaGlsZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPTAsZT0hMDtyZXR1cm4gYi5zdWJzY3JpYmUoZnVuY3Rpb24oYil7aWYoZSl7dHJ5e2U9YShiLGQrKyl9Y2F0Y2goaCl7Yy5vbkVycm9yKGgpO3JldHVybn1pZihlKWMub25OZXh0KGIpO1xuZWxzZSBjLm9uQ29tcGxldGVkKCl9fSxmdW5jdGlvbihhKXtyZXR1cm4gYy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe3JldHVybiBjLm9uQ29tcGxldGVkKCl9KX0pfTtmLnNraXBXaGlsZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPTAsZT0hMTtyZXR1cm4gYi5zdWJzY3JpYmUoZnVuY3Rpb24oYil7aWYoIWUpdHJ5e2U9IWEoYixkKyspfWNhdGNoKGgpe2Mub25FcnJvcihoKTtyZXR1cm59aWYoZSljLm9uTmV4dChiKX0sZnVuY3Rpb24oYSl7Yy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2Mub25Db21wbGV0ZWQoKX0pfSl9O2Yuc2VsZWN0TWFueT1mdW5jdGlvbihhLGIpe3JldHVybiBiIT09bj90aGlzLnNlbGVjdE1hbnkoZnVuY3Rpb24oYyl7cmV0dXJuIGEoYykuc2VsZWN0KGZ1bmN0aW9uKGEpe3JldHVybiBiKGMsYSl9KX0pOlwiZnVuY3Rpb25cIj09PXR5cGVvZiBhP3RoaXMuc2VsZWN0KGEpLm1lcmdlT2JzZXJ2YWJsZSgpOnRoaXMuc2VsZWN0KGZ1bmN0aW9uKCl7cmV0dXJuIGF9KS5tZXJnZU9ic2VydmFibGUoKX07XG5mLmZpbmFsVmFsdWU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3ZhciBjPSExLGQ7cmV0dXJuIGEuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2M9ITA7ZD1hfSxmdW5jdGlvbihhKXtiLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7aWYoYyliLm9uTmV4dChkKSxiLm9uQ29tcGxldGVkKCk7ZWxzZSBiLm9uRXJyb3IoRXJyb3IoXCJTZXF1ZW5jZSBjb250YWlucyBubyBlbGVtZW50cy5cIikpfSl9KX07Zi50b0FycmF5PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2NhbihbXSxmdW5jdGlvbihhLGIpe2EucHVzaChiKTtyZXR1cm4gYX0pLnN0YXJ0V2l0aChbXSkuZmluYWxWYWx1ZSgpfTtmLm1hdGVyaWFsaXplPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcztyZXR1cm4gaShmdW5jdGlvbihiKXtyZXR1cm4gYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7Yi5vbk5leHQodC5jcmVhdGVPbk5leHQoYSkpfSxmdW5jdGlvbihhKXtiLm9uTmV4dCh0LmNyZWF0ZU9uRXJyb3IoYSkpO1xuYi5vbkNvbXBsZXRlZCgpfSxmdW5jdGlvbigpe2Iub25OZXh0KHQuY3JlYXRlT25Db21wbGV0ZWQoKSk7Yi5vbkNvbXBsZXRlZCgpfSl9KX07Zi5kZW1hdGVyaWFsaXplPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcztyZXR1cm4gaShmdW5jdGlvbihiKXtyZXR1cm4gYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7cmV0dXJuIGEuYWNjZXB0KGIpfSxmdW5jdGlvbihhKXtiLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Yi5vbkNvbXBsZXRlZCgpfSl9KX07Zi5hc09ic2VydmFibGU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3JldHVybiBhLnN1YnNjcmliZShiKX0pfTtmLndpbmRvd1dpdGhDb3VudD1mdW5jdGlvbihhLGIpe3ZhciBjPXRoaXM7aWYoMD49YSl0aHJvdyBFcnJvcihcIkFyZ3VtZW50IG91dCBvZiByYW5nZVwiKTtiPT09biYmKGI9YSk7aWYoMD49Yil0aHJvdyBFcnJvcihcIkFyZ3VtZW50IG91dCBvZiByYW5nZVwiKTtyZXR1cm4gaShmdW5jdGlvbihkKXt2YXIgZT1cbm5ldyB2LGc9bmV3IFooZSksaD0wLGY9W10saT1mdW5jdGlvbigpe3ZhciBhPW5ldyBPO2YucHVzaChhKTtkLm9uTmV4dChqYShhLGcpKX07aSgpO2UuZGlzcG9zYWJsZShjLnN1YnNjcmliZShmdW5jdGlvbihjKXt2YXIgZDtmb3IoZD0wO2Q8Zi5sZW5ndGg7ZCsrKWZbZF0ub25OZXh0KGMpO2M9aC1hKzE7MDw9YyYmMD09PWMlYiYmKGM9Zi5zaGlmdCgpLGMub25Db21wbGV0ZWQoKSk7aCsrOzA9PT1oJWImJmkoKX0sZnVuY3Rpb24oYSl7Zm9yKDswPGYubGVuZ3RoOylmLnNoaWZ0KCkub25FcnJvcihhKTtkLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Zm9yKDswPGYubGVuZ3RoOylmLnNoaWZ0KCkub25Db21wbGV0ZWQoKTtkLm9uQ29tcGxldGVkKCl9KSk7cmV0dXJuIGd9KX07Zi5idWZmZXJXaXRoQ291bnQ9ZnVuY3Rpb24oYSxiKXtiPT09biYmKGI9YSk7cmV0dXJuIHRoaXMud2luZG93V2l0aENvdW50KGEsYikuc2VsZWN0TWFueShmdW5jdGlvbihhKXtyZXR1cm4gYS50b0FycmF5KCl9KS53aGVyZShmdW5jdGlvbihhKXtyZXR1cm4gMDxcbmEubGVuZ3RofSl9O2Yuc3RhcnRXaXRoPWZ1bmN0aW9uKCl7dmFyIGEsYjthPTA7MDxhcmd1bWVudHMubGVuZ3RoJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0ubm93PyhiPWFyZ3VtZW50c1swXSxhPTEpOmI9QjthPXkuY2FsbChhcmd1bWVudHMsYSk7cmV0dXJuIFMoW2dhKGEsYiksdGhpc10pLmNvbmNhdCgpfTtmLnNjYW49ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO3JldHVybiBmYShmdW5jdGlvbigpe3ZhciBkPSExLGU7cmV0dXJuIGMuc2VsZWN0KGZ1bmN0aW9uKGMpe2Q/ZT1iKGUsYyk6KGU9YihhLGMpLGQ9ITApO3JldHVybiBlfSl9KX07Zi5zY2FuMT1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3JldHVybiBmYShmdW5jdGlvbigpe3ZhciBjPSExLGQ7cmV0dXJuIGIuc2VsZWN0KGZ1bmN0aW9uKGIpe2M/ZD1hKGQsYik6KGQ9YixjPSEwKTtyZXR1cm4gZH0pfSl9O2YuZGlzdGluY3RVbnRpbENoYW5nZWQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzO2F8fChhPVEpO2J8fChiPVYpO1xucmV0dXJuIGkoZnVuY3Rpb24oZCl7dmFyIGU9ITEsZztyZXR1cm4gYy5zdWJzY3JpYmUoZnVuY3Rpb24oYyl7dmFyIGY9ITEsaTt0cnl7aT1hKGMpfWNhdGNoKGope2Qub25FcnJvcihqKTtyZXR1cm59aWYoZSl0cnl7Zj1iKGcsaSl9Y2F0Y2goayl7ZC5vbkVycm9yKGspO3JldHVybn1pZighZXx8IWYpZT0hMCxnPWksZC5vbk5leHQoYyl9LGZ1bmN0aW9uKGEpe2Qub25FcnJvcihhKX0sZnVuY3Rpb24oKXtkLm9uQ29tcGxldGVkKCl9KX0pfTtmLmZpbmFsbHlBY3Rpb249ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztyZXR1cm4gaShmdW5jdGlvbihjKXt2YXIgZD1iLnN1YnNjcmliZShjKTtyZXR1cm4gQShmdW5jdGlvbigpe3RyeXtkLmRpc3Bvc2UoKX1maW5hbGx5e2EoKX19KX0pfTtmLmRvQWN0aW9uPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGU7MD09YXJndW1lbnRzLmxlbmd0aHx8MTxhcmd1bWVudHMubGVuZ3RofHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBhP2U9YTooZT1mdW5jdGlvbihiKXthLm9uTmV4dChiKX0sXG5iPWZ1bmN0aW9uKGIpe2Eub25FcnJvcihiKX0sYz1mdW5jdGlvbigpe2Eub25Db21wbGV0ZWQoKX0pO3JldHVybiBpKGZ1bmN0aW9uKGEpe3JldHVybiBkLnN1YnNjcmliZShmdW5jdGlvbihiKXt0cnl7ZShiKX1jYXRjaChjKXthLm9uRXJyb3IoYyl9YS5vbk5leHQoYil9LGZ1bmN0aW9uKGMpe2lmKGIpdHJ5e2IoYyl9Y2F0Y2goZCl7YS5vbkVycm9yKGQpfWEub25FcnJvcihjKX0sZnVuY3Rpb24oKXtpZihjKXRyeXtjKCl9Y2F0Y2goYil7YS5vbkVycm9yKGIpfWEub25Db21wbGV0ZWQoKX0pfSl9O2Yuc2tpcExhc3Q9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztyZXR1cm4gaShmdW5jdGlvbihjKXt2YXIgZD1bXTtyZXR1cm4gYi5zdWJzY3JpYmUoZnVuY3Rpb24oYil7ZC5wdXNoKGIpO2lmKGQubGVuZ3RoPmEpYy5vbk5leHQoZC5zaGlmdCgpKX0sZnVuY3Rpb24oYSl7Yy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2Mub25Db21wbGV0ZWQoKX0pfSl9O2YudGFrZUxhc3Q9ZnVuY3Rpb24oYSl7dmFyIGI9XG50aGlzO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPVtdO3JldHVybiBiLnN1YnNjcmliZShmdW5jdGlvbihiKXtkLnB1c2goYik7ZC5sZW5ndGg+YSYmZC5zaGlmdCgpfSxmdW5jdGlvbihhKXtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Zm9yKDswPGQubGVuZ3RoOyljLm9uTmV4dChkLnNoaWZ0KCkpO2Mub25Db21wbGV0ZWQoKX0pfSl9O2YuaWdub3JlRWxlbWVudHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3JldHVybiBhLnN1YnNjcmliZShpYSxmdW5jdGlvbihhKXtiLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Yi5vbkNvbXBsZXRlZCgpfSl9KX07Zi5lbGVtZW50QXQ9ZnVuY3Rpb24oYSl7aWYoMD5hKXRocm93IEVycm9yKFwiQXJndW1lbnQgb3V0IG9mIHJhbmdlXCIpO3ZhciBiPXRoaXM7cmV0dXJuIGkoZnVuY3Rpb24oYyl7dmFyIGQ9YTtyZXR1cm4gYi5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7MD09PWQmJihjLm9uTmV4dChhKSxjLm9uQ29tcGxldGVkKCkpO1xuZC0tfSxmdW5jdGlvbihhKXtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Yy5vbkVycm9yKEVycm9yKFwiQXJndW1lbnQgb3V0IG9mIHJhbmdlXCIpKX0pfSl9O2YuZWxlbWVudEF0T3JEZWZhdWx0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztpZigwPmEpdGhyb3cgRXJyb3IoXCJBcmd1bWVudCBvdXQgb2YgcmFuZ2VcIik7Yj09PW4mJihiPW51bGwpO3JldHVybiBpKGZ1bmN0aW9uKGQpe3ZhciBlPWE7cmV0dXJuIGMuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpezA9PT1lJiYoZC5vbk5leHQoYSksZC5vbkNvbXBsZXRlZCgpKTtlLS19LGZ1bmN0aW9uKGEpe2Qub25FcnJvcihhKX0sZnVuY3Rpb24oKXtkLm9uTmV4dChiKTtkLm9uQ29tcGxldGVkKCl9KX0pfTtmLmRlZmF1bHRJZkVtcHR5PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXM7YT09PW4mJihhPW51bGwpO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPSExO3JldHVybiBiLnN1YnNjcmliZShmdW5jdGlvbihhKXtkPSEwO2Mub25OZXh0KGEpfSxcbmZ1bmN0aW9uKGEpe2Mub25FcnJvcihhKX0sZnVuY3Rpb24oKXtpZighZCljLm9uTmV4dChhKTtjLm9uQ29tcGxldGVkKCl9KX0pfTtmLmRpc3RpbmN0PWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpczthfHwoYT1RKTtifHwoYj1XKTtyZXR1cm4gaShmdW5jdGlvbihkKXt2YXIgZT17fTtyZXR1cm4gYy5zdWJzY3JpYmUoZnVuY3Rpb24oYyl7dmFyIGYsaSxqLHE9ITE7dHJ5e2Y9YShjKSxpPWIoZil9Y2F0Y2goayl7ZC5vbkVycm9yKGspO3JldHVybn1mb3IoaiBpbiBlKWlmKGk9PT1qKXtxPSEwO2JyZWFrfXF8fChlW2ldPW51bGwsZC5vbk5leHQoYykpfSxmdW5jdGlvbihhKXtkLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ZC5vbkNvbXBsZXRlZCgpfSl9KX07Zi5tZXJnZU9ic2VydmFibGU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGIpe3ZhciBjPW5ldyBwLGQ9ITEsZT1uZXcgdjtjLmFkZChlKTtlLmRpc3Bvc2FibGUoYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7dmFyIGU9XG5uZXcgdjtjLmFkZChlKTtlLmRpc3Bvc2FibGUoYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7Yi5vbk5leHQoYSl9LGZ1bmN0aW9uKGEpe2Iub25FcnJvcihhKX0sZnVuY3Rpb24oKXtjLnJlbW92ZShlKTtpZihkJiYxPT09Yy5jb3VudCgpKWIub25Db21wbGV0ZWQoKX0pKX0sZnVuY3Rpb24oYSl7Yi5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2Q9ITA7aWYoMT09PWMuY291bnQoKSliLm9uQ29tcGxldGVkKCl9KSk7cmV0dXJuIGN9KX07Zi5tZXJnZT1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPTAsZT1uZXcgcCxnPSExLGY9W10saT1mdW5jdGlvbihhKXt2YXIgYj1uZXcgdjtlLmFkZChiKTtiLmRpc3Bvc2FibGUoYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7Yy5vbk5leHQoYSl9LGZ1bmN0aW9uKGEpe2Mub25FcnJvcihhKX0sZnVuY3Rpb24oKXt2YXIgYTtlLnJlbW92ZShiKTtpZigwPGYubGVuZ3RoKWE9Zi5zaGlmdCgpLGkoYSk7ZWxzZSBpZihkLS0sXG5nJiYwPT09ZCljLm9uQ29tcGxldGVkKCl9KSl9O2UuYWRkKGIuc3Vic2NyaWJlKGZ1bmN0aW9uKGIpe2Q8YT8oZCsrLGkoYikpOmYucHVzaChiKX0sZnVuY3Rpb24oYSl7Yy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2c9ITA7aWYoMD09PWQpYy5vbkNvbXBsZXRlZCgpfSkpO3JldHVybiBlfSl9O2Yuc3dpdGNoTGF0ZXN0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcztyZXR1cm4gaShmdW5jdGlvbihiKXt2YXIgYz0hMSxkPW5ldyBDLGU9ITEsZz0wLGY9YS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7dmFyIGY9bmV3IHYsaD0rK2c7Yz0hMDtkLmRpc3Bvc2FibGUoZik7cmV0dXJuIGYuZGlzcG9zYWJsZShhLnN1YnNjcmliZShmdW5jdGlvbihhKXtpZihnPT09aCliLm9uTmV4dChhKX0sZnVuY3Rpb24oYSl7aWYoZz09PWgpYi5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2lmKGc9PT1oJiYoYz0hMSxlKSliLm9uQ29tcGxldGVkKCl9KSl9LGZ1bmN0aW9uKGEpe2Iub25FcnJvcihhKX0sZnVuY3Rpb24oKXtlPVxuITA7aWYoIWMpYi5vbkNvbXBsZXRlZCgpfSk7cmV0dXJuIG5ldyBwKGYsZCl9KX07ai5tZXJnZT1mdW5jdGlvbihhKXthfHwoYT1CKTt2YXIgYj0xPGFyZ3VtZW50cy5sZW5ndGgmJmFyZ3VtZW50c1sxXWluc3RhbmNlb2YgQXJyYXk/YXJndW1lbnRzWzFdOnkuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGdhKGIsYSkubWVyZ2VPYnNlcnZhYmxlKCl9O2YuY29uY2F0PWZ1bmN0aW9uKCl7dmFyIGE9d2EsYjtiPWFyZ3VtZW50czt2YXIgYyxkO2M9W107Zm9yKGQ9MDtkPGIubGVuZ3RoO2QrKyljLnB1c2goYltkXSk7Yj1jO2IudW5zaGlmdCh0aGlzKTtyZXR1cm4gYS5hcHBseSh0aGlzLGIpfTtmLmNvbmNhdE9ic2VydmFibGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tZXJnZSgxKX07dmFyIHdhPWouY29uY2F0PWZ1bmN0aW9uKCl7dmFyIGE9MT09PWFyZ3VtZW50cy5sZW5ndGgmJmFyZ3VtZW50c1swXWluc3RhbmNlb2YgQXJyYXk/YXJndW1lbnRzWzBdOnkuY2FsbChhcmd1bWVudHMpO1xucmV0dXJuIFMoYSkuY29uY2F0KCl9O2YuY2F0Y2hFeGNlcHRpb249ZnVuY3Rpb24oYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGE/eGEodGhpcyxhKTp5YShbdGhpcyxhXSl9O3ZhciB4YT1mdW5jdGlvbihhLGIpe3JldHVybiBpKGZ1bmN0aW9uKGMpe3ZhciBkPW5ldyB2LGU9bmV3IEM7ZC5kaXNwb3NhYmxlKGEuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2Mub25OZXh0KGEpfSxmdW5jdGlvbihhKXt2YXIgZDt0cnl7ZD1iKGEpfWNhdGNoKGYpe2Mub25FcnJvcihmKTtyZXR1cm59YT1uZXcgdjtlLmRpc3Bvc2FibGUoYSk7YS5kaXNwb3NhYmxlKGQuc3Vic2NyaWJlKGMpKX0sZnVuY3Rpb24oKXtjLm9uQ29tcGxldGVkKCl9KSk7cmV0dXJuIGV9KX0seWE9ai5jYXRjaEV4Y2VwdGlvbj1mdW5jdGlvbigpe3ZhciBhPTE9PT1hcmd1bWVudHMubGVuZ3RoJiZhcmd1bWVudHNbMF1pbnN0YW5jZW9mIEFycmF5P2FyZ3VtZW50c1swXTp5LmNhbGwoYXJndW1lbnRzKTtyZXR1cm4gUyhhKS5jYXRjaEV4Y2VwdGlvbigpfTtcbmYub25FcnJvclJlc3VtZU5leHQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHphKFt0aGlzLGFdKX07dmFyIHphPWoub25FcnJvclJlc3VtZU5leHQ9ZnVuY3Rpb24oKXt2YXIgYT0xPT09YXJndW1lbnRzLmxlbmd0aCYmYXJndW1lbnRzWzBdaW5zdGFuY2VvZiBBcnJheT9hcmd1bWVudHNbMF06eS5jYWxsKGFyZ3VtZW50cyk7cmV0dXJuIGkoZnVuY3Rpb24oYil7dmFyIGM9MCxkPW5ldyBDLGU9Qi5zY2hlZHVsZVJlY3Vyc2l2ZShmdW5jdGlvbihlKXt2YXIgZixpO2lmKGM8YS5sZW5ndGgpZj1hW2MrK10saT1uZXcgdixkLmRpc3Bvc2FibGUoaSksaS5kaXNwb3NhYmxlKGYuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2Iub25OZXh0KGEpfSxmdW5jdGlvbigpe2UoKX0sZnVuY3Rpb24oKXtlKCl9KSk7ZWxzZSBiLm9uQ29tcGxldGVkKCl9KTtyZXR1cm4gbmV3IHAoZCxlKX0pfSxBYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxjKXt2YXIgZD10aGlzO3RoaXMuc2VsZWN0b3I9YTt0aGlzLm9ic2VydmVyPVxuYzt0aGlzLmxlZnRRPVtdO3RoaXMucmlnaHRRPVtdO3RoaXMubGVmdD1JKGZ1bmN0aW9uKGEpe2lmKFwiRVwiPT09YS5raW5kKWQub2JzZXJ2ZXIub25FcnJvcihhLmV4Y2VwdGlvbik7ZWxzZSBpZigwPT09ZC5yaWdodFEubGVuZ3RoKWQubGVmdFEucHVzaChhKTtlbHNlIGQub25OZXh0KGEsZC5yaWdodFEuc2hpZnQoKSl9KTt0aGlzLnJpZ2h0PUkoZnVuY3Rpb24oYSl7aWYoXCJFXCI9PT1hLmtpbmQpZC5vYnNlcnZlci5vbkVycm9yKGEuZXhjZXB0aW9uKTtlbHNlIGlmKDA9PT1kLmxlZnRRLmxlbmd0aClkLnJpZ2h0US5wdXNoKGEpO2Vsc2UgZC5vbk5leHQoZC5sZWZ0US5zaGlmdCgpLGEpfSl9YS5wcm90b3R5cGUub25OZXh0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ7aWYoXCJDXCI9PT1hLmtpbmR8fFwiQ1wiPT09Yy5raW5kKXRoaXMub2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtlbHNle3RyeXtkPXRoaXMuc2VsZWN0b3IoYS52YWx1ZSxjLnZhbHVlKX1jYXRjaChlKXt0aGlzLm9ic2VydmVyLm9uRXJyb3IoZSk7XG5yZXR1cm59dGhpcy5vYnNlcnZlci5vbk5leHQoZCl9fTtyZXR1cm4gYX0oKTtmLnppcD1mdW5jdGlvbihhLGIpe3JldHVybiBGKHRoaXMsYSxmdW5jdGlvbihhKXt2YXIgZD1uZXcgQWEoYixhKTtyZXR1cm4gbmV3IEgoZnVuY3Rpb24oYSl7cmV0dXJuIGQubGVmdC5vbk5leHQoYSl9LGZ1bmN0aW9uKGEpe3JldHVybiBkLnJpZ2h0Lm9uTmV4dChhKX0pfSl9O3ZhciBoYTtoYT1mdW5jdGlvbigpe2Z1bmN0aW9uIGEoYSxjKXt2YXIgZD10aGlzO3RoaXMuc2VsZWN0b3I9YTt0aGlzLm9ic2VydmVyPWM7dGhpcy5yaWdodFN0b3BwZWQ9dGhpcy5sZWZ0U3RvcHBlZD0hMTt0aGlzLmxlZnQ9SShmdW5jdGlvbihhKXtpZihcIk5cIj09PWEua2luZClpZihkLmxlZnRWYWx1ZT1hLGQucmlnaHRWYWx1ZSE9PW4pZC5vbk5leHQoKTtlbHNle2lmKGQucmlnaHRTdG9wcGVkKWQub2JzZXJ2ZXIub25Db21wbGV0ZWQoKX1lbHNlIGlmKFwiRVwiPT09YS5raW5kKWQub2JzZXJ2ZXIub25FcnJvcihhLmV4Y2VwdGlvbik7XG5lbHNlIGlmKGQubGVmdFN0b3BwZWQ9ITAsZC5yaWdodFN0b3BwZWQpZC5vYnNlcnZlci5vbkNvbXBsZXRlZCgpfSk7dGhpcy5yaWdodD1JKGZ1bmN0aW9uKGEpe2lmKFwiTlwiPT09YS5raW5kKWlmKGQucmlnaHRWYWx1ZT1hLGQubGVmdFZhbHVlIT09bilkLm9uTmV4dCgpO2Vsc2V7aWYoZC5sZWZ0U3RvcHBlZClkLm9ic2VydmVyLm9uQ29tcGxldGVkKCl9ZWxzZSBpZihcIkVcIj09PWEua2luZClkLm9ic2VydmVyLm9uRXJyb3IoYS5leGNlcHRpb24pO2Vsc2UgaWYoZC5yaWdodFN0b3BwZWQ9ITAsZC5sZWZ0U3RvcHBlZClkLm9ic2VydmVyLm9uQ29tcGxldGVkKCl9KX1hLnByb3RvdHlwZS5vbk5leHQ9ZnVuY3Rpb24oKXt2YXIgYTt0cnl7YT10aGlzLnNlbGVjdG9yKHRoaXMubGVmdFZhbHVlLnZhbHVlLHRoaXMucmlnaHRWYWx1ZS52YWx1ZSl9Y2F0Y2goYyl7dGhpcy5vYnNlcnZlci5vbkVycm9yKGMpO3JldHVybn10aGlzLm9ic2VydmVyLm9uTmV4dChhKX07cmV0dXJuIGF9KCk7Zi5jb21iaW5lTGF0ZXN0PVxuZnVuY3Rpb24oYSxiKXtyZXR1cm4gRih0aGlzLGEsZnVuY3Rpb24oYSl7dmFyIGQ9bmV3IGhhKGIsYSk7cmV0dXJuIG5ldyBIKGZ1bmN0aW9uKGEpe3JldHVybiBkLmxlZnQub25OZXh0KGEpfSxmdW5jdGlvbihhKXtyZXR1cm4gZC5yaWdodC5vbk5leHQoYSl9KX0pfTtmLnRha2VVbnRpbD1mdW5jdGlvbihhKXtyZXR1cm4gRihhLHRoaXMsZnVuY3Rpb24oYSxjKXt2YXIgZD0hMSxlPSExO3JldHVybiBuZXcgSChmdW5jdGlvbihjKXshZSYmIWQmJihcIkNcIj09PWMua2luZD9kPSEwOlwiRVwiPT09Yy5raW5kPyhlPWQ9ITAsYS5vbkVycm9yKGMuZXhjZXB0aW9uKSk6KGU9ITAsYS5vbkNvbXBsZXRlZCgpKSl9LGZ1bmN0aW9uKGQpe2V8fChkLmFjY2VwdChhKSwoZT1cIk5cIiE9PWQua2luZCkmJmMuZGlzcG9zZSgpKX0pfSl9O2Yuc2tpcFVudGlsPWZ1bmN0aW9uKGEpe3JldHVybiBGKHRoaXMsYSxmdW5jdGlvbihhLGMsZCl7dmFyIGU9ITEsZj0hMTtyZXR1cm4gbmV3IEgoZnVuY3Rpb24oYyl7aWYoXCJFXCI9PVxuYy5raW5kKWEub25FcnJvcihjLmV4Y2VwdGlvbik7ZWxzZSBlJiZjLmFjY2VwdChhKX0sZnVuY3Rpb24oYyl7aWYoIWYpe2lmKFwiTlwiPT09Yy5raW5kKWU9ITA7ZWxzZSBpZihcIkVcIj09PWMua2luZClhLm9uRXJyb3IoYy5leGNlcHRpb24pO2Y9ITA7ZC5kaXNwb3NlKCl9fSl9KX07ai5hbWI9ZnVuY3Rpb24oKXt2YXIgYT1kYSgpLGIsYz0xPT09YXJndW1lbnRzLmxlbmd0aCYmYXJndW1lbnRzWzBdaW5zdGFuY2VvZiBBcnJheT9hcmd1bWVudHNbMF06eS5jYWxsKGFyZ3VtZW50cyk7Zm9yKGI9MDtiPGMubGVuZ3RoO2IrKylhPWEuYW1iKGNbYl0pO3JldHVybiBhfTtmLmFtYj1mdW5jdGlvbihhKXtyZXR1cm4gRih0aGlzLGEsZnVuY3Rpb24oYSxjLGQpe3ZhciBlPVwiTlwiO3JldHVybiBuZXcgSChmdW5jdGlvbihjKXtcIk5cIj09PWUmJihlPVwiTFwiLGQuZGlzcG9zZSgpKTtcIkxcIj09PWUmJmMuYWNjZXB0KGEpfSxmdW5jdGlvbihkKXtcIk5cIj09PWUmJihlPVwiUlwiLGMuZGlzcG9zZSgpKTtcIlJcIj09PVxuZSYmZC5hY2NlcHQoYSl9KX0pfX07XG4iLCIvKlxuIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiBUaGlzIGNvZGUgaXMgbGljZW5zZWQgYnkgTWljcm9zb2Z0IENvcnBvcmF0aW9uIHVuZGVyIHRoZSB0ZXJtc1xuIG9mIHRoZSBNSUNST1NPRlQgUkVBQ1RJVkUgRVhURU5TSU9OUyBGT1IgSkFWQVNDUklQVCBBTkQgLk5FVCBMSUJSQVJJRVMgTGljZW5zZS5cbiBTZWUgaHR0cDovL2dvLm1pY3Jvc29mdC5jb20vZndsaW5rLz9MaW5rSUQ9MjIwNzYyLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oayx0KXt2YXIgbDtsPWsuUng7dmFyIG49bC5PYnNlcnZhYmxlLGQ9bi5wcm90b3R5cGUsbT1uLmNyZWF0ZVdpdGhEaXNwb3NhYmxlLHU9bC5Db21wb3NpdGVEaXNwb3NhYmxlLG89ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PWJ9LHA9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9LHE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT5iPzE6YT09PWI/MDotMX0scj1mdW5jdGlvbihhLGIsZCl7cmV0dXJuIG0oZnVuY3Rpb24oYyl7dmFyIGY9ITEsZz1udWxsLGg9W107cmV0dXJuIGEuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe3ZhciBlLGk7dHJ5e2k9YihhKX1jYXRjaCh2KXtjLm9uRXJyb3Iodik7cmV0dXJufWU9MDtpZihmKXRyeXtlPWQoaSxnKX1jYXRjaCh3KXtjLm9uRXJyb3Iodyk7cmV0dXJufWVsc2UgZj0hMCxnPVxuaTswPGUmJihnPWksaD1bXSk7MDw9ZSYmaC5wdXNoKGEpfSxmdW5jdGlvbihhKXtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Yy5vbk5leHQoaCk7Yy5vbkNvbXBsZXRlZCgpfSl9KX07ZC5hZ2dyZWdhdGU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5zY2FuKGEsYikuc3RhcnRXaXRoKGEpLmZpbmFsVmFsdWUoKX07ZC5hZ2dyZWdhdGUxPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnNjYW4xKGEpLmZpbmFsVmFsdWUoKX07ZC5hbnk9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztyZXR1cm4gYSE9PXQ/Yi53aGVyZShhKS5hbnkoKTptKGZ1bmN0aW9uKGEpe3JldHVybiBiLnN1YnNjcmliZShmdW5jdGlvbigpe2Eub25OZXh0KCEwKTthLm9uQ29tcGxldGVkKCl9LGZ1bmN0aW9uKGIpe2Eub25FcnJvcihiKX0sZnVuY3Rpb24oKXthLm9uTmV4dCghMSk7YS5vbkNvbXBsZXRlZCgpfSl9KX07ZC5hbGw9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMud2hlcmUoZnVuY3Rpb24oYil7cmV0dXJuIWEoYil9KS5hbnkoKS5zZWxlY3QoZnVuY3Rpb24oYSl7cmV0dXJuIWF9KX07XG5kLmNvbnRhaW5zPWZ1bmN0aW9uKGEsYil7Ynx8KGI9byk7cmV0dXJuIHRoaXMud2hlcmUoZnVuY3Rpb24oZCl7cmV0dXJuIGIoZCxhKX0pLmFueSgpfTtkLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYWdncmVnYXRlKDAsZnVuY3Rpb24oYSl7cmV0dXJuIGErMX0pfTtkLnN1bT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFnZ3JlZ2F0ZSgwLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErYn0pfTtkLm1pbkJ5PWZ1bmN0aW9uKGEsYil7Ynx8KGI9cSk7cmV0dXJuIHIodGhpcyxhLGZ1bmN0aW9uKGEsYyl7cmV0dXJuLTEqYihhLGMpfSl9O3ZhciBzPWZ1bmN0aW9uKGEpe2lmKDA9PWEubGVuZ3RoKXRocm93IEVycm9yKFwiU2VxdWVuY2UgY29udGFpbnMgbm8gZWxlbWVudHMuXCIpO3JldHVybiBhWzBdfTtkLm1pbj1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5taW5CeShwLGEpLnNlbGVjdChmdW5jdGlvbihhKXtyZXR1cm4gcyhhKX0pfTtkLm1heEJ5PWZ1bmN0aW9uKGEsYil7Ynx8KGI9cSk7XG5yZXR1cm4gcih0aGlzLGEsYil9O2QubWF4PWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm1heEJ5KHAsYSkuc2VsZWN0KGZ1bmN0aW9uKGEpe3JldHVybiBzKGEpfSl9O2QuYXZlcmFnZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYW4oe3N1bTowLGNvdW50OjB9LGZ1bmN0aW9uKGEsYil7cmV0dXJue3N1bTphLnN1bStiLGNvdW50OmEuY291bnQrMX19KS5maW5hbFZhbHVlKCkuc2VsZWN0KGZ1bmN0aW9uKGEpe3JldHVybiBhLnN1bS9hLmNvdW50fSl9O2Quc2VxdWVuY2VFcXVhbD1mdW5jdGlvbihhLGIpe3ZhciBkPXRoaXM7Ynx8KGI9byk7cmV0dXJuIG0oZnVuY3Rpb24oYyl7dmFyIGY9ITEsZz0hMSxoPVtdLGo9W10sZT1kLnN1YnNjcmliZShmdW5jdGlvbihhKXt2YXIgZCxmO2lmKDA8ai5sZW5ndGgpe2Y9ai5zaGlmdCgpO3RyeXtkPWIoZixhKX1jYXRjaChlKXtjLm9uRXJyb3IoZSk7cmV0dXJufWR8fChjLm9uTmV4dCghMSksYy5vbkNvbXBsZXRlZCgpKX1lbHNlIGc/KGMub25OZXh0KCExKSxcbmMub25Db21wbGV0ZWQoKSk6aC5wdXNoKGEpfSxmdW5jdGlvbihhKXtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7Zj0hMDswPT09aC5sZW5ndGgmJigwPGoubGVuZ3RoPyhjLm9uTmV4dCghMSksYy5vbkNvbXBsZXRlZCgpKTpnJiYoYy5vbk5leHQoITApLGMub25Db21wbGV0ZWQoKSkpfSksaT1hLnN1YnNjcmliZShmdW5jdGlvbihhKXt2YXIgZCxlO2lmKDA8aC5sZW5ndGgpe2U9aC5zaGlmdCgpO3RyeXtkPWIoZSxhKX1jYXRjaChnKXtjLm9uRXJyb3IoZyk7cmV0dXJufWR8fChjLm9uTmV4dCghMSksYy5vbkNvbXBsZXRlZCgpKX1lbHNlIGY/KGMub25OZXh0KCExKSxjLm9uQ29tcGxldGVkKCkpOmoucHVzaChhKX0sZnVuY3Rpb24oYSl7Yy5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2c9ITA7MD09PWoubGVuZ3RoJiYoMDxoLmxlbmd0aD8oYy5vbk5leHQoITEpLGMub25Db21wbGV0ZWQoKSk6ZiYmKGMub25OZXh0KCEwKSxjLm9uQ29tcGxldGVkKCkpKX0pO3JldHVybiBuZXcgdShlLFxuaSl9KX19O1xuIiwiLypcbiBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gVGhpcyBjb2RlIGlzIGxpY2Vuc2VkIGJ5IE1pY3Jvc29mdCBDb3Jwb3JhdGlvbiB1bmRlciB0aGUgdGVybXNcbiBvZiB0aGUgTUlDUk9TT0ZUIFJFQUNUSVZFIEVYVEVOU0lPTlMgRk9SIEpBVkFTQ1JJUFQgQU5EIC5ORVQgTElCUkFSSUVTIExpY2Vuc2UuXG4gU2VlIGh0dHA6Ly9nby5taWNyb3NvZnQuY29tL2Z3bGluay8/TGlua0lEPTIyMDc2Mi5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHEsaCl7dmFyIGY7Zj1xLlJ4O3ZhciB6PWYuT2JzZXJ2YWJsZSx1PWYuQ29tcG9zaXRlRGlzcG9zYWJsZSxFPWYuUmVmQ291bnREaXNwb3NhYmxlLHM9Zi5TaW5nbGVBc3NpZ25tZW50RGlzcG9zYWJsZSxLPWYuU2VyaWFsRGlzcG9zYWJsZSxBPWYuU3ViamVjdDtmPXoucHJvdG90eXBlO3ZhciBMPXouZW1wdHksdj16LmNyZWF0ZVdpdGhEaXNwb3NhYmxlLE09ZnVuY3Rpb24oYixhKXtyZXR1cm4gYj09PWF9LE49ZnVuY3Rpb24oKXt9LEI9ZnVuY3Rpb24oYixhKXtyZXR1cm4gdihmdW5jdGlvbihjKXtyZXR1cm4gbmV3IHUoYS5nZXREaXNwb3NhYmxlKCksYi5zdWJzY3JpYmUoYykpfSl9LEMsRixvLEcsdyx4O289WzEsMyw3LDEzLDMxLDYxLDEyNywyNTEsNTA5LDEwMjEsMjAzOSw0MDkzLDgxOTEsMTYzODEsXG4zMjc0OSw2NTUyMSwxMzEwNzEsMjYyMTM5LDUyNDI4NywxMDQ4NTczLDIwOTcxNDMsNDE5NDMwMSw4Mzg4NTkzLDE2Nzc3MjEzLDMzNTU0MzkzLDY3MTA4ODU5LDEzNDIxNzY4OSwyNjg0MzUzOTksNTM2ODcwOTA5LDEwNzM3NDE3ODksMjE0NzQ4MzY0N107Rj1mdW5jdGlvbihiKXt2YXIgYSxjO2lmKGImMClyZXR1cm4gMj09PWI7YT1NYXRoLnNxcnQoYik7Zm9yKGM9MztjPD1hOyl7aWYoMD09PWIlYylyZXR1cm4hMTtjKz0yfXJldHVybiEwfTtDPWZ1bmN0aW9uKGIpe3ZhciBhLGM7Zm9yKGE9MDthPG8ubGVuZ3RoOysrYSlpZihjPW9bYV0sYz49YilyZXR1cm4gYztmb3IoYT1ifDE7YTxvW28ubGVuZ3RoLTFdOyl7aWYoRihhKSlyZXR1cm4gYTthKz0yfXJldHVybiBifTtHPTA7dz1mdW5jdGlvbihiKXt2YXIgYTtpZihiPT09aCl0aHJvd1wibm8gc3VjaCBrZXlcIjtpZihiLmdldEhhc2hDb2RlIT09aClyZXR1cm4gYi5nZXRIYXNoQ29kZSgpO2E9MTcqRysrO2IuZ2V0SGFzaENvZGU9ZnVuY3Rpb24oKXtyZXR1cm4gYX07XG5yZXR1cm4gYX07eD1mdW5jdGlvbigpe3JldHVybntrZXk6bnVsbCx2YWx1ZTpudWxsLG5leHQ6MCxoYXNoQ29kZTowfX07dmFyIHk9ZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGEsYyl7dGhpcy5faW5pdGlhbGl6ZShhKTt0aGlzLmNvbXBhcmVyPWN8fE07dGhpcy5zaXplPXRoaXMuZnJlZUNvdW50PTA7dGhpcy5mcmVlTGlzdD0tMX1iLnByb3RvdHlwZS5faW5pdGlhbGl6ZT1mdW5jdGlvbihhKXt2YXIgYT1DKGEpLGM7dGhpcy5idWNrZXRzPUFycmF5KGEpO3RoaXMuZW50cmllcz1BcnJheShhKTtmb3IoYz0wO2M8YTtjKyspdGhpcy5idWNrZXRzW2NdPS0xLHRoaXMuZW50cmllc1tjXT14KCk7dGhpcy5mcmVlTGlzdD0tMX07Yi5wcm90b3R5cGUuY291bnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaXplfTtiLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gdGhpcy5faW5zZXJ0KGEsYywhMCl9O2IucHJvdG90eXBlLl9pbnNlcnQ9ZnVuY3Rpb24oYSxjLGIpe3ZhciBlLGQsXG5nO3RoaXMuYnVja2V0cz09PWgmJnRoaXMuX2luaXRpYWxpemUoMCk7Zz13KGEpJjIxNDc0ODM2NDc7ZT1nJXRoaXMuYnVja2V0cy5sZW5ndGg7Zm9yKGQ9dGhpcy5idWNrZXRzW2VdOzA8PWQ7ZD10aGlzLmVudHJpZXNbZF0ubmV4dClpZih0aGlzLmVudHJpZXNbZF0uaGFzaENvZGU9PT1nJiZ0aGlzLmNvbXBhcmVyKHRoaXMuZW50cmllc1tkXS5rZXksYSkpe2lmKGIpdGhyb3dcImR1cGxpY2F0ZSBrZXlcIjt0aGlzLmVudHJpZXNbZF0udmFsdWU9YztyZXR1cm59MDx0aGlzLmZyZWVDb3VudD8oYj10aGlzLmZyZWVMaXN0LHRoaXMuZnJlZUxpc3Q9dGhpcy5lbnRyaWVzW2JdLm5leHQsLS10aGlzLmZyZWVDb3VudCk6KHRoaXMuc2l6ZT09PXRoaXMuZW50cmllcy5sZW5ndGgmJih0aGlzLl9yZXNpemUoKSxlPWcldGhpcy5idWNrZXRzLmxlbmd0aCksYj10aGlzLnNpemUsKyt0aGlzLnNpemUpO3RoaXMuZW50cmllc1tiXS5oYXNoQ29kZT1nO3RoaXMuZW50cmllc1tiXS5uZXh0PXRoaXMuYnVja2V0c1tlXTtcbnRoaXMuZW50cmllc1tiXS5rZXk9YTt0aGlzLmVudHJpZXNbYl0udmFsdWU9Yzt0aGlzLmJ1Y2tldHNbZV09Yn07Yi5wcm90b3R5cGUuX3Jlc2l6ZT1mdW5jdGlvbigpe3ZhciBhLGMsYixlLGQ7ZD1DKDIqdGhpcy5zaXplKTtiPUFycmF5KGQpO2ZvcihhPTA7YTxiLmxlbmd0aDsrK2EpYlthXT0tMTtlPUFycmF5KGQpO2ZvcihhPTA7YTx0aGlzLnNpemU7KythKWVbYV09dGhpcy5lbnRyaWVzW2FdO2ZvcihhPXRoaXMuc2l6ZTthPGQ7KythKWVbYV09eCgpO2ZvcihhPTA7YTx0aGlzLnNpemU7KythKWM9ZVthXS5oYXNoQ29kZSVkLGVbYV0ubmV4dD1iW2NdLGJbY109YTt0aGlzLmJ1Y2tldHM9Yjt0aGlzLmVudHJpZXM9ZX07Yi5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKGEpe3ZhciBiLGssZSxkO2lmKHRoaXMuYnVja2V0cyE9PWgpe2Q9dyhhKSYyMTQ3NDgzNjQ3O2I9ZCV0aGlzLmJ1Y2tldHMubGVuZ3RoO2s9LTE7Zm9yKGU9dGhpcy5idWNrZXRzW2JdOzA8PWU7ZT10aGlzLmVudHJpZXNbZV0ubmV4dCl7aWYodGhpcy5lbnRyaWVzW2VdLmhhc2hDb2RlPT09XG5kJiZ0aGlzLmNvbXBhcmVyKHRoaXMuZW50cmllc1tlXS5rZXksYSkpcmV0dXJuIDA+az90aGlzLmJ1Y2tldHNbYl09dGhpcy5lbnRyaWVzW2VdLm5leHQ6dGhpcy5lbnRyaWVzW2tdLm5leHQ9dGhpcy5lbnRyaWVzW2VdLm5leHQsdGhpcy5lbnRyaWVzW2VdLmhhc2hDb2RlPS0xLHRoaXMuZW50cmllc1tlXS5uZXh0PXRoaXMuZnJlZUxpc3QsdGhpcy5lbnRyaWVzW2VdLmtleT1udWxsLHRoaXMuZW50cmllc1tlXS52YWx1ZT1udWxsLHRoaXMuZnJlZUxpc3Q9ZSwrK3RoaXMuZnJlZUNvdW50LCEwO2s9ZX19cmV0dXJuITF9O2IucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dmFyIGE7aWYoISgwPj10aGlzLnNpemUpKXtmb3IoYT0wO2E8dGhpcy5idWNrZXRzLmxlbmd0aDsrK2EpdGhpcy5idWNrZXRzW2FdPS0xO2ZvcihhPTA7YTx0aGlzLnNpemU7KythKXRoaXMuZW50cmllc1thXT14KCk7dGhpcy5mcmVlTGlzdD0tMTt0aGlzLnNpemU9MH19O2IucHJvdG90eXBlLl9maW5kRW50cnk9XG5mdW5jdGlvbihhKXt2YXIgYixrO2lmKHRoaXMuYnVja2V0cyE9PWgpe2s9dyhhKSYyMTQ3NDgzNjQ3O2ZvcihiPXRoaXMuYnVja2V0c1trJXRoaXMuYnVja2V0cy5sZW5ndGhdOzA8PWI7Yj10aGlzLmVudHJpZXNbYl0ubmV4dClpZih0aGlzLmVudHJpZXNbYl0uaGFzaENvZGU9PT1rJiZ0aGlzLmNvbXBhcmVyKHRoaXMuZW50cmllc1tiXS5rZXksYSkpcmV0dXJuIGJ9cmV0dXJuLTF9O2IucHJvdG90eXBlLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2l6ZS10aGlzLmZyZWVDb3VudH07Yi5wcm90b3R5cGUudHJ5R2V0RW50cnk9ZnVuY3Rpb24oYSl7YT10aGlzLl9maW5kRW50cnkoYSk7cmV0dXJuIDA8PWE/e2tleTp0aGlzLmVudHJpZXNbYV0ua2V5LHZhbHVlOnRoaXMuZW50cmllc1thXS52YWx1ZX06aH07Yi5wcm90b3R5cGUuZ2V0VmFsdWVzPWZ1bmN0aW9uKCl7dmFyIGE9MCxiLGs9W107aWYodGhpcy5lbnRyaWVzIT09aClmb3IoYj0wO2I8dGhpcy5zaXplO2IrKylpZigwPD1cbnRoaXMuZW50cmllc1tiXS5oYXNoQ29kZSlrW2ErK109dGhpcy5lbnRyaWVzW2JdLnZhbHVlO3JldHVybiBrfTtiLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oYSl7YT10aGlzLl9maW5kRW50cnkoYSk7aWYoMDw9YSlyZXR1cm4gdGhpcy5lbnRyaWVzW2FdLnZhbHVlO3Rocm93IEVycm9yKFwibm8gc3VjaCBrZXlcIik7fTtiLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXt0aGlzLl9pbnNlcnQoYSxiLCExKX07Yi5wcm90b3R5cGUuY29udGFpbnNrZXk9ZnVuY3Rpb24oYSl7cmV0dXJuIDA8PXRoaXMuX2ZpbmRFbnRyeShhKX07cmV0dXJuIGJ9KCk7Zi5qb2luPWZ1bmN0aW9uKGIsYSxjLGspe3ZhciBlPXRoaXM7cmV0dXJuIHYoZnVuY3Rpb24oZCl7dmFyIGc9bmV3IHUsaj0hMSxmPTAsbD1uZXcgeSxoPSExLHI9MCx0PW5ldyB5O2cuYWRkKGUuc3Vic2NyaWJlKGZ1bmN0aW9uKGIpe3ZhciBjLGUscD1mKyssaT1uZXcgcyxIO2wuYWRkKHAsYik7Zy5hZGQoaSk7ZT1mdW5jdGlvbigpe2lmKGwucmVtb3ZlKHApJiZcbjA9PT1sLmNvdW50KCkmJmopZC5vbkNvbXBsZXRlZCgpO3JldHVybiBnLnJlbW92ZShpKX07dHJ5e2M9YShiKX1jYXRjaChoKXtkLm9uRXJyb3IoaCk7cmV0dXJufWkuZGlzcG9zYWJsZShjLnRha2UoMSkuc3Vic2NyaWJlKGZ1bmN0aW9uKCl7fSxmdW5jdGlvbihhKXtkLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ZSgpfSkpO2M9dC5nZXRWYWx1ZXMoKTtmb3IodmFyIG49MDtuPGMubGVuZ3RoO24rKyl7dHJ5e0g9ayhiLGNbbl0pfWNhdGNoKHIpe2Qub25FcnJvcihyKTticmVha31kLm9uTmV4dChIKX19LGZ1bmN0aW9uKGEpe2Qub25FcnJvcihhKX0sZnVuY3Rpb24oKXtqPSEwO2lmKGh8fDA9PT1sLmNvdW50KCkpZC5vbkNvbXBsZXRlZCgpfSkpO2cuYWRkKGIuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe3ZhciBiLGUscD1yKyssaT1uZXcgcyxqO3QuYWRkKHAsYSk7Zy5hZGQoaSk7ZT1mdW5jdGlvbigpe2lmKHQucmVtb3ZlKHApJiYwPT09dC5jb3VudCgpJiZoKWQub25Db21wbGV0ZWQoKTtcbnJldHVybiBnLnJlbW92ZShpKX07dHJ5e2I9YyhhKX1jYXRjaChmKXtkLm9uRXJyb3IoZik7cmV0dXJufWkuZGlzcG9zYWJsZShiLnRha2UoMSkuc3Vic2NyaWJlKGZ1bmN0aW9uKCl7fSxmdW5jdGlvbihhKXtkLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ZSgpfSkpO2I9bC5nZXRWYWx1ZXMoKTtmb3IodmFyIG49MDtuPGIubGVuZ3RoO24rKyl7dHJ5e2o9ayhiW25dLGEpfWNhdGNoKE8pe2Qub25FcnJvcihPKTticmVha31kLm9uTmV4dChqKX19LGZ1bmN0aW9uKGEpe2Qub25FcnJvcihhKX0sZnVuY3Rpb24oKXtoPSEwO2lmKGp8fDA9PT10LmNvdW50KCkpZC5vbkNvbXBsZXRlZCgpfSkpO3JldHVybiBnfSl9O2YuZ3JvdXBKb2luPWZ1bmN0aW9uKGIsYSxjLGspe3ZhciBlPXRoaXM7cmV0dXJuIHYoZnVuY3Rpb24oZCl7dmFyIGc9bmV3IHUsaj1uZXcgRShnKSxmPTAsbD1uZXcgeSxoPTAscj1uZXcgeTtnLmFkZChlLnN1YnNjcmliZShmdW5jdGlvbihiKXt2YXIgYyxlLG0scD1mKyssaSxcbmgsRCxuPW5ldyBBO2wuYWRkKHAsbik7dHJ5e209ayhiLEIobixqKSl9Y2F0Y2gobyl7aT1sLmdldFZhbHVlcygpO2ZvcihtPTA7bTxpLmxlbmd0aDttKyspaVttXS5vbkVycm9yKG8pO2Qub25FcnJvcihvKTtyZXR1cm59ZC5vbk5leHQobSk7RD1yLmdldFZhbHVlcygpO2ZvcihtPTA7bTxELmxlbmd0aDttKyspbi5vbk5leHQoRFttXSk7aD1uZXcgcztnLmFkZChoKTtlPWZ1bmN0aW9uKCl7aWYobC5yZW1vdmUocCkpbi5vbkNvbXBsZXRlZCgpO2cucmVtb3ZlKGgpfTt0cnl7Yz1hKGIpfWNhdGNoKHEpe2k9bC5nZXRWYWx1ZXMoKTtmb3IobT0wO208aS5sZW5ndGg7bSsrKWlbbV0ub25FcnJvcihxKTtkLm9uRXJyb3IocSk7cmV0dXJufWguZGlzcG9zYWJsZShjLnRha2UoMSkuc3Vic2NyaWJlKGZ1bmN0aW9uKCl7fSxmdW5jdGlvbihhKXt2YXIgYjtpPWwuZ2V0VmFsdWVzKCk7Zm9yKGI9MDtiPGkubGVuZ3RoO2IrKylpW2JdLm9uRXJyb3IoYSk7ZC5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2UoKX0pKX0sXG5mdW5jdGlvbihhKXt2YXIgYixjO2M9bC5nZXRWYWx1ZXMoKTtmb3IoYj0wO2I8Yy5sZW5ndGg7YisrKWNbYl0ub25FcnJvcihhKTtkLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ZC5vbkNvbXBsZXRlZCgpfSkpO2cuYWRkKGIuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe3ZhciBiLGUsayxmLGk7az1oKys7ci5hZGQoayxhKTtpPW5ldyBzO2cuYWRkKGkpO2U9ZnVuY3Rpb24oKXtyLnJlbW92ZShrKTtnLnJlbW92ZShpKX07dHJ5e2I9YyhhKX1jYXRjaChqKXtmPWwuZ2V0VmFsdWVzKCk7Zm9yKGI9MDtiPGYubGVuZ3RoO2IrKylmW2JdLm9uRXJyb3Ioaik7ZC5vbkVycm9yKGopO3JldHVybn1pLmRpc3Bvc2FibGUoYi50YWtlKDEpLnN1YnNjcmliZShmdW5jdGlvbigpe30sZnVuY3Rpb24oYSl7dmFyIGI7Zj1sLmdldFZhbHVlcygpO2ZvcihiPTA7YjxmLmxlbmd0aDtiKyspZltiXS5vbkVycm9yKGEpO2Qub25FcnJvcihhKX0sZnVuY3Rpb24oKXtlKCl9KSk7Zj1sLmdldFZhbHVlcygpO2ZvcihiPVxuMDtiPGYubGVuZ3RoO2IrKylmW2JdLm9uTmV4dChhKX0sZnVuY3Rpb24oYil7dmFyIGEsYztjPWwuZ2V0VmFsdWVzKCk7Zm9yKGE9MDthPGMubGVuZ3RoO2ErKyljW2FdLm9uRXJyb3IoYik7ZC5vbkVycm9yKGIpfSkpO3JldHVybiBqfSl9O2YuYnVmZmVyPWZ1bmN0aW9uKGIsYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGI/SShiKS5zZWxlY3RNYW55KGZ1bmN0aW9uKGEpe3JldHVybiBvYnNlcnZhYmxlVG9BcnJheShhKX0pOkoodGhpcyxiLGEpLnNlbGVjdE1hbnkoZnVuY3Rpb24oYSl7cmV0dXJuIG9ic2VydmFibGVUb0FycmF5KGEpfSl9O2Yud2luZG93PWZ1bmN0aW9uKGIsYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGI/SS5jYWxsKHRoaXMsYik6Si5jYWxsKHRoaXMsYixhKX07dmFyIEo9ZnVuY3Rpb24oYixhKXtyZXR1cm4gYi5ncm91cEpvaW4odGhpcyxhLGZ1bmN0aW9uKCl7cmV0dXJuIEwoKX0sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYn0pfSxJPWZ1bmN0aW9uKGIpe3ZhciBhPVxudGhpcztyZXR1cm4gdihmdW5jdGlvbihjKXt2YXIgZixlPW5ldyBLLGQ9bmV3IHUoZSksZz1uZXcgRShkKSxqPW5ldyBBO2Mub25OZXh0KEIoaixnKSk7ZC5hZGQoYS5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7ai5vbk5leHQoYSl9LGZ1bmN0aW9uKGEpe2oub25FcnJvcihhKTtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ai5vbkNvbXBsZXRlZCgpO2Mub25Db21wbGV0ZWQoKX0pKTtmPWZ1bmN0aW9uKCl7dmFyIGEsZDt0cnl7ZD1iKCl9Y2F0Y2goaCl7Yy5vbkVycm9yKGgpO3JldHVybn1hPW5ldyBzO2UuZGlzcG9zYWJsZShhKTthLmRpc3Bvc2FibGUoZC50YWtlKDEpLnN1YnNjcmliZShOLGZ1bmN0aW9uKGEpe2oub25FcnJvcihhKTtjLm9uRXJyb3IoYSl9LGZ1bmN0aW9uKCl7ai5vbkNvbXBsZXRlZCgpO2o9bmV3IEE7Yy5vbk5leHQoQihqLGcpKTtmKCl9KSl9O2YoKTtyZXR1cm4gZ30pfX07XG4iLCIvKlxuIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiBUaGlzIGNvZGUgaXMgbGljZW5zZWQgYnkgTWljcm9zb2Z0IENvcnBvcmF0aW9uIHVuZGVyIHRoZSB0ZXJtc1xuIG9mIHRoZSBNSUNST1NPRlQgUkVBQ1RJVkUgRVhURU5TSU9OUyBGT1IgSkFWQVNDUklQVCBBTkQgLk5FVCBMSUJSQVJJRVMgTGljZW5zZS5cbiBTZWUgaHR0cDovL2dvLm1pY3Jvc29mdC5jb20vZndsaW5rLz9MaW5rSUQ9MjIwNzYyLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oayxoKXt2YXIgaTtpPWsuUng7dmFyIHc9QXJyYXkucHJvdG90eXBlLnNsaWNlLHg9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSx5PWZ1bmN0aW9uKGIsYSl7ZnVuY3Rpb24gYygpe3RoaXMuY29uc3RydWN0b3I9Yn1mb3IodmFyIGYgaW4gYSl4LmNhbGwoYSxmKSYmKGJbZl09YVtmXSk7Yy5wcm90b3R5cGU9YS5wcm90b3R5cGU7Yi5wcm90b3R5cGU9bmV3IGM7Yi5iYXNlPWEucHJvdG90eXBlO3JldHVybiBifSxsPWkuT2JzZXJ2YWJsZSxwPWwucHJvdG90eXBlLHo9bC5jcmVhdGVXaXRoRGlzcG9zYWJsZSxBPWwudGhyb3dFeGNlcHRpb24sQj1pLk9ic2VydmVyLmNyZWF0ZSxxPWkuSW50ZXJuYWxzLkxpc3QsQz1pLlNpbmdsZUFzc2lnbm1lbnREaXNwb3NhYmxlLEQ9aS5Db21wb3NpdGVEaXNwb3NhYmxlLFxuRT1pLkludGVybmFscy5BYnN0cmFjdE9ic2VydmVyLEY9ZnVuY3Rpb24oYixhKXtyZXR1cm4gYj09PWF9LG8scixqLHMsbSxuO2o9WzEsMyw3LDEzLDMxLDYxLDEyNywyNTEsNTA5LDEwMjEsMjAzOSw0MDkzLDgxOTEsMTYzODEsMzI3NDksNjU1MjEsMTMxMDcxLDI2MjEzOSw1MjQyODcsMTA0ODU3MywyMDk3MTQzLDQxOTQzMDEsODM4ODU5MywxNjc3NzIxMywzMzU1NDM5Myw2NzEwODg1OSwxMzQyMTc2ODksMjY4NDM1Mzk5LDUzNjg3MDkwOSwxMDczNzQxNzg5LDIxNDc0ODM2NDddO3I9ZnVuY3Rpb24oYil7dmFyIGEsYztpZihiJjApcmV0dXJuIDI9PT1iO2E9TWF0aC5zcXJ0KGIpO2ZvcihjPTM7Yzw9YTspe2lmKDA9PT1iJWMpcmV0dXJuITE7Yys9Mn1yZXR1cm4hMH07bz1mdW5jdGlvbihiKXt2YXIgYSxjO2ZvcihhPTA7YTxqLmxlbmd0aDsrK2EpaWYoYz1qW2FdLGM+PWIpcmV0dXJuIGM7Zm9yKGE9YnwxO2E8altqLmxlbmd0aC0xXTspe2lmKHIoYSkpcmV0dXJuIGE7YSs9Mn1yZXR1cm4gYn07XG5zPTA7bT1mdW5jdGlvbihiKXt2YXIgYTtpZihiPT09aCl0aHJvd1wibm8gc3VjaCBrZXlcIjtpZihiLmdldEhhc2hDb2RlIT09aClyZXR1cm4gYi5nZXRIYXNoQ29kZSgpO2E9MTcqcysrO2IuZ2V0SGFzaENvZGU9ZnVuY3Rpb24oKXtyZXR1cm4gYX07cmV0dXJuIGF9O249ZnVuY3Rpb24oKXtyZXR1cm57a2V5Om51bGwsdmFsdWU6bnVsbCxuZXh0OjAsaGFzaENvZGU6MH19O3ZhciB0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYihhLGMpe3RoaXMuX2luaXRpYWxpemUoYSk7dGhpcy5jb21wYXJlcj1jfHxGO3RoaXMuc2l6ZT10aGlzLmZyZWVDb3VudD0wO3RoaXMuZnJlZUxpc3Q9LTF9Yi5wcm90b3R5cGUuX2luaXRpYWxpemU9ZnVuY3Rpb24oYSl7dmFyIGE9byhhKSxjO3RoaXMuYnVja2V0cz1BcnJheShhKTt0aGlzLmVudHJpZXM9QXJyYXkoYSk7Zm9yKGM9MDtjPGE7YysrKXRoaXMuYnVja2V0c1tjXT0tMSx0aGlzLmVudHJpZXNbY109bigpO3RoaXMuZnJlZUxpc3Q9LTF9O2IucHJvdG90eXBlLmNvdW50PVxuZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaXplfTtiLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gdGhpcy5faW5zZXJ0KGEsYywhMCl9O2IucHJvdG90eXBlLl9pbnNlcnQ9ZnVuY3Rpb24oYSxjLGIpe3ZhciBkLGUsZzt0aGlzLmJ1Y2tldHM9PT1oJiZ0aGlzLl9pbml0aWFsaXplKDApO2c9bShhKSYyMTQ3NDgzNjQ3O2Q9ZyV0aGlzLmJ1Y2tldHMubGVuZ3RoO2ZvcihlPXRoaXMuYnVja2V0c1tkXTswPD1lO2U9dGhpcy5lbnRyaWVzW2VdLm5leHQpaWYodGhpcy5lbnRyaWVzW2VdLmhhc2hDb2RlPT09ZyYmdGhpcy5jb21wYXJlcih0aGlzLmVudHJpZXNbZV0ua2V5LGEpKXtpZihiKXRocm93XCJkdXBsaWNhdGUga2V5XCI7dGhpcy5lbnRyaWVzW2VdLnZhbHVlPWM7cmV0dXJufTA8dGhpcy5mcmVlQ291bnQ/KGI9dGhpcy5mcmVlTGlzdCx0aGlzLmZyZWVMaXN0PXRoaXMuZW50cmllc1tiXS5uZXh0LC0tdGhpcy5mcmVlQ291bnQpOih0aGlzLnNpemU9PT10aGlzLmVudHJpZXMubGVuZ3RoJiZcbih0aGlzLl9yZXNpemUoKSxkPWcldGhpcy5idWNrZXRzLmxlbmd0aCksYj10aGlzLnNpemUsKyt0aGlzLnNpemUpO3RoaXMuZW50cmllc1tiXS5oYXNoQ29kZT1nO3RoaXMuZW50cmllc1tiXS5uZXh0PXRoaXMuYnVja2V0c1tkXTt0aGlzLmVudHJpZXNbYl0ua2V5PWE7dGhpcy5lbnRyaWVzW2JdLnZhbHVlPWM7dGhpcy5idWNrZXRzW2RdPWJ9O2IucHJvdG90eXBlLl9yZXNpemU9ZnVuY3Rpb24oKXt2YXIgYSxjLGIsZCxlO2U9bygyKnRoaXMuc2l6ZSk7Yj1BcnJheShlKTtmb3IoYT0wO2E8Yi5sZW5ndGg7KythKWJbYV09LTE7ZD1BcnJheShlKTtmb3IoYT0wO2E8dGhpcy5zaXplOysrYSlkW2FdPXRoaXMuZW50cmllc1thXTtmb3IoYT10aGlzLnNpemU7YTxlOysrYSlkW2FdPW4oKTtmb3IoYT0wO2E8dGhpcy5zaXplOysrYSljPWRbYV0uaGFzaENvZGUlZSxkW2FdLm5leHQ9YltjXSxiW2NdPWE7dGhpcy5idWNrZXRzPWI7dGhpcy5lbnRyaWVzPWR9O2IucHJvdG90eXBlLnJlbW92ZT1cbmZ1bmN0aW9uKGEpe3ZhciBjLGIsZCxlO2lmKHRoaXMuYnVja2V0cyE9PWgpe2U9bShhKSYyMTQ3NDgzNjQ3O2M9ZSV0aGlzLmJ1Y2tldHMubGVuZ3RoO2I9LTE7Zm9yKGQ9dGhpcy5idWNrZXRzW2NdOzA8PWQ7ZD10aGlzLmVudHJpZXNbZF0ubmV4dCl7aWYodGhpcy5lbnRyaWVzW2RdLmhhc2hDb2RlPT09ZSYmdGhpcy5jb21wYXJlcih0aGlzLmVudHJpZXNbZF0ua2V5LGEpKXJldHVybiAwPmI/dGhpcy5idWNrZXRzW2NdPXRoaXMuZW50cmllc1tkXS5uZXh0OnRoaXMuZW50cmllc1tiXS5uZXh0PXRoaXMuZW50cmllc1tkXS5uZXh0LHRoaXMuZW50cmllc1tkXS5oYXNoQ29kZT0tMSx0aGlzLmVudHJpZXNbZF0ubmV4dD10aGlzLmZyZWVMaXN0LHRoaXMuZW50cmllc1tkXS5rZXk9bnVsbCx0aGlzLmVudHJpZXNbZF0udmFsdWU9bnVsbCx0aGlzLmZyZWVMaXN0PWQsKyt0aGlzLmZyZWVDb3VudCwhMDtiPWR9fXJldHVybiExfTtiLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3ZhciBhO1xuaWYoISgwPj10aGlzLnNpemUpKXtmb3IoYT0wO2E8dGhpcy5idWNrZXRzLmxlbmd0aDsrK2EpdGhpcy5idWNrZXRzW2FdPS0xO2ZvcihhPTA7YTx0aGlzLnNpemU7KythKXRoaXMuZW50cmllc1thXT1uKCk7dGhpcy5mcmVlTGlzdD0tMTt0aGlzLnNpemU9MH19O2IucHJvdG90eXBlLl9maW5kRW50cnk9ZnVuY3Rpb24oYSl7dmFyIGMsYjtpZih0aGlzLmJ1Y2tldHMhPT1oKXtiPW0oYSkmMjE0NzQ4MzY0Nztmb3IoYz10aGlzLmJ1Y2tldHNbYiV0aGlzLmJ1Y2tldHMubGVuZ3RoXTswPD1jO2M9dGhpcy5lbnRyaWVzW2NdLm5leHQpaWYodGhpcy5lbnRyaWVzW2NdLmhhc2hDb2RlPT09YiYmdGhpcy5jb21wYXJlcih0aGlzLmVudHJpZXNbY10ua2V5LGEpKXJldHVybiBjfXJldHVybi0xfTtiLnByb3RvdHlwZS5jb3VudD1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNpemUtdGhpcy5mcmVlQ291bnR9O2IucHJvdG90eXBlLnRyeUdldEVudHJ5PWZ1bmN0aW9uKGEpe2E9dGhpcy5fZmluZEVudHJ5KGEpO1xucmV0dXJuIDA8PWE/e2tleTp0aGlzLmVudHJpZXNbYV0ua2V5LHZhbHVlOnRoaXMuZW50cmllc1thXS52YWx1ZX06aH07Yi5wcm90b3R5cGUuZ2V0VmFsdWVzPWZ1bmN0aW9uKCl7dmFyIGE9MCxjLGI9W107aWYodGhpcy5lbnRyaWVzIT09aClmb3IoYz0wO2M8dGhpcy5zaXplO2MrKylpZigwPD10aGlzLmVudHJpZXNbY10uaGFzaENvZGUpYlthKytdPXRoaXMuZW50cmllc1tjXS52YWx1ZTtyZXR1cm4gYn07Yi5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe2E9dGhpcy5fZmluZEVudHJ5KGEpO2lmKDA8PWEpcmV0dXJuIHRoaXMuZW50cmllc1thXS52YWx1ZTt0aHJvdyBFcnJvcihcIm5vIHN1Y2gga2V5XCIpO307Yi5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYil7dGhpcy5faW5zZXJ0KGEsYiwhMSl9O2IucHJvdG90eXBlLmNvbnRhaW5za2V5PWZ1bmN0aW9uKGEpe3JldHVybiAwPD10aGlzLl9maW5kRW50cnkoYSl9O3JldHVybiBifSgpLHU9ZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGEpe3RoaXMucGF0dGVybnM9XG5hfWIucHJvdG90eXBlLmFuZD1mdW5jdGlvbihhKXt2YXIgYz10aGlzLnBhdHRlcm5zLGYsZDtkPVtdO2ZvcihmPTA7ZjxjLmxlbmd0aDtmKyspZC5wdXNoKGNbZl0pO2QucHVzaChhKTtyZXR1cm4gbmV3IGIoZCl9O2IucHJvdG90eXBlLnRoZW49ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBHKHRoaXMsYSl9O3JldHVybiBifSgpLEc9ZnVuY3Rpb24oKXtmdW5jdGlvbiBiKGEsYil7dGhpcy5leHByZXNzaW9uPWE7dGhpcy5zZWxlY3Rvcj1ifWIucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKGEsYixmKXt2YXIgZCxlLGcsaDtoPXRoaXM7Zz1bXTtmb3IoZT0wO2U8dGhpcy5leHByZXNzaW9uLnBhdHRlcm5zLmxlbmd0aDtlKyspZy5wdXNoKEgoYSx0aGlzLmV4cHJlc3Npb24ucGF0dGVybnNbZV0sZnVuY3Rpb24oYSl7Yi5vbkVycm9yKGEpfSkpO2Q9bmV3IHYoZyxmdW5jdGlvbigpe3ZhciBhO3RyeXthPWguc2VsZWN0b3IuYXBwbHkoaCxhcmd1bWVudHMpfWNhdGNoKGQpe2Iub25FcnJvcihkKTtcbnJldHVybn1iLm9uTmV4dChhKX0sZnVuY3Rpb24oKXt2YXIgYTtmb3IoYT0wO2E8Zy5sZW5ndGg7YSsrKWdbYV0ucmVtb3ZlQWN0aXZlUGxhbihkKTtmKGQpfSk7Zm9yKGU9MDtlPGcubGVuZ3RoO2UrKylnW2VdLmFkZEFjdGl2ZVBsYW4oZCk7cmV0dXJuIGR9O3JldHVybiBifSgpLEg9ZnVuY3Rpb24oYixhLGMpe3ZhciBmO2Y9Yi50cnlHZXRFbnRyeShhKTtyZXR1cm4gZj09PWg/KGM9bmV3IEkoYSxjKSxiLmFkZChhLGMpLGMpOmYudmFsdWV9LHY7dj1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSxiLGYpe3RoaXMuam9pbk9ic2VydmVyQXJyYXk9YTt0aGlzLm9uTmV4dD1iO3RoaXMub25Db21wbGV0ZWQ9Zjt0aGlzLmpvaW5PYnNlcnZlcnM9bmV3IHQ7Zm9yKGE9MDthPHRoaXMuam9pbk9ic2VydmVyQXJyYXkubGVuZ3RoO2ErKyliPXRoaXMuam9pbk9ic2VydmVyQXJyYXlbYV0sdGhpcy5qb2luT2JzZXJ2ZXJzLmFkZChiLGIpfWIucHJvdG90eXBlLmRlcXVldWU9ZnVuY3Rpb24oKXt2YXIgYSxcbmI7Yj10aGlzLmpvaW5PYnNlcnZlcnMuZ2V0VmFsdWVzKCk7Zm9yKGE9MDthPGIubGVuZ3RoO2ErKyliW2FdLnF1ZXVlLnNoaWZ0KCl9O2IucHJvdG90eXBlLm1hdGNoPWZ1bmN0aW9uKCl7dmFyIGEsYixmO2E9ITA7Zm9yKGI9MDtiPHRoaXMuam9pbk9ic2VydmVyQXJyYXkubGVuZ3RoO2IrKylpZigwPT09dGhpcy5qb2luT2JzZXJ2ZXJBcnJheVtiXS5xdWV1ZS5sZW5ndGgpe2E9ITE7YnJlYWt9aWYoYSl7YT1bXTtmPSExO2ZvcihiPTA7Yjx0aGlzLmpvaW5PYnNlcnZlckFycmF5Lmxlbmd0aDtiKyspYS5wdXNoKHRoaXMuam9pbk9ic2VydmVyQXJyYXlbYl0ucXVldWVbMF0pLFwiQ1wiPT09dGhpcy5qb2luT2JzZXJ2ZXJBcnJheVtiXS5xdWV1ZVswXS5raW5kJiYoZj0hMCk7aWYoZil0aGlzLm9uQ29tcGxldGVkKCk7ZWxzZXt0aGlzLmRlcXVldWUoKTtmPVtdO2ZvcihiPTA7YjxhLmxlbmd0aDtiKyspZi5wdXNoKGFbYl0udmFsdWUpO3RoaXMub25OZXh0LmFwcGx5KHRoaXMsZil9fX07XG5yZXR1cm4gYn0oKTt2YXIgST1mdW5jdGlvbigpe2Z1bmN0aW9uIGIoYSxiKXt0aGlzLnNvdXJjZT1hO3RoaXMub25FcnJvcj1iO3RoaXMucXVldWU9W107dGhpcy5hY3RpdmVQbGFucz1uZXcgcTt0aGlzLnN1YnNjcmlwdGlvbj1uZXcgQzt0aGlzLmlzRGlzcG9zZWQ9ITF9eShiLEUpO2IucHJvdG90eXBlLmFkZEFjdGl2ZVBsYW49ZnVuY3Rpb24oYSl7dGhpcy5hY3RpdmVQbGFucy5hZGQoYSl9O2IucHJvdG90eXBlLnN1YnNjcmliZT1mdW5jdGlvbigpe3RoaXMuc3Vic2NyaXB0aW9uLmRpc3Bvc2FibGUodGhpcy5zb3VyY2UubWF0ZXJpYWxpemUoKS5zdWJzY3JpYmUodGhpcykpfTtiLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKGEpe3ZhciBiO2lmKCF0aGlzLmlzRGlzcG9zZWQpaWYoXCJFXCI9PT1hLmtpbmQpdGhpcy5vbkVycm9yKGEuZXhjZXB0aW9uKTtlbHNle3RoaXMucXVldWUucHVzaChhKTthPXRoaXMuYWN0aXZlUGxhbnMudG9BcnJheSgpO2ZvcihiPTA7YjxhLmxlbmd0aDtiKyspYVtiXS5tYXRjaCgpfX07XG5iLnByb3RvdHlwZS5lcnJvcj1mdW5jdGlvbigpe307Yi5wcm90b3R5cGUuY29tcGxldGVkPWZ1bmN0aW9uKCl7fTtiLnByb3RvdHlwZS5yZW1vdmVBY3RpdmVQbGFuPWZ1bmN0aW9uKGEpe3RoaXMuYWN0aXZlUGxhbnMucmVtb3ZlKGEpOzA9PT10aGlzLmFjdGl2ZVBsYW5zLmNvdW50KCkmJnRoaXMuZGlzcG9zZSgpfTtiLnByb3RvdHlwZS5kaXNwb3NlPWZ1bmN0aW9uKCl7Yi5iYXNlLmRpc3Bvc2UuY2FsbCh0aGlzKTtpZighdGhpcy5pc0Rpc3Bvc2VkKXRoaXMuaXNEaXNwb3NlZD0hMCx0aGlzLnN1YnNjcmlwdGlvbi5kaXNwb3NlKCl9O3JldHVybiBifSgpO3AuYW5kPWZ1bmN0aW9uKGIpe3JldHVybiBuZXcgdShbdGhpcyxiXSl9O3AudGhlbj1mdW5jdGlvbihiKXtyZXR1cm4obmV3IHUoW3RoaXNdKSkudGhlbihiKX07bC53aGVuPWZ1bmN0aW9uKCl7dmFyIGI9MT09PWFyZ3VtZW50cy5sZW5ndGgmJmFyZ3VtZW50c1swXWluc3RhbmNlb2YgQXJyYXk/YXJndW1lbnRzWzBdOncuY2FsbChhcmd1bWVudHMpO1xucmV0dXJuIHooZnVuY3Rpb24oYSl7dmFyIGM9bmV3IHEsZj1uZXcgdCxkLGUsZyxoLGk7aT1CKGZ1bmN0aW9uKGIpe2Eub25OZXh0KGIpfSxmdW5jdGlvbihiKXtmb3IodmFyIGM9Zi5nZXRWYWx1ZXMoKSxkPTA7ZDxjLmxlbmd0aDtkKyspY1tkXS5vbkVycm9yKGIpO2Eub25FcnJvcihiKX0sZnVuY3Rpb24oKXthLm9uQ29tcGxldGVkKCl9KTt0cnl7Zm9yKGU9MDtlPGIubGVuZ3RoO2UrKyljLmFkZChiW2VdLmFjdGl2YXRlKGYsaSxmdW5jdGlvbihhKXtjLnJlbW92ZShhKTtpZigwPT09Yy5jb3VudCgpKWkub25Db21wbGV0ZWQoKX0pKX1jYXRjaChqKXtBKGopLnN1YnNjcmliZShhKX1kPW5ldyBEO2g9Zi5nZXRWYWx1ZXMoKTtmb3IoZT0wO2U8aC5sZW5ndGg7ZSsrKWc9aFtlXSxnLnN1YnNjcmliZSgpLGQuYWRkKGcpO3JldHVybiBkfSl9fTtcbiIsIi8qXG4gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuIFRoaXMgY29kZSBpcyBsaWNlbnNlZCBieSBNaWNyb3NvZnQgQ29ycG9yYXRpb24gdW5kZXIgdGhlIHRlcm1zXG4gb2YgdGhlIE1JQ1JPU09GVCBSRUFDVElWRSBFWFRFTlNJT05TIEZPUiBKQVZBU0NSSVBUIEFORCAuTkVUIExJQlJBUklFUyBMaWNlbnNlLlxuIFNlZSBodHRwOi8vZ28ubWljcm9zb2Z0LmNvbS9md2xpbmsvP0xpbmtJRD0yMjA3NjIuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih3LG4pe3ZhciBwO3A9dy5SeDt2YXIgcT1wLk9ic2VydmFibGUsbz1xLnByb3RvdHlwZSxtPXEuY3JlYXRlV2l0aERpc3Bvc2FibGUseT1xLmRlZmVyLEY9cS50aHJvd0V4Y2VwdGlvbixsPXAuU2NoZWR1bGVyLlRpbWVvdXQscj1wLlNpbmdsZUFzc2lnbm1lbnREaXNwb3NhYmxlLHQ9cC5TZXJpYWxEaXNwb3NhYmxlLHM9cC5Db21wb3NpdGVEaXNwb3NhYmxlLHo9cC5SZWZDb3VudERpc3Bvc2FibGUsdT1wLlN1YmplY3QsRz1wLkludGVybmFscy5CaW5hcnlPYnNlcnZlcix2PWZ1bmN0aW9uKGEsYil7cmV0dXJuIG0oZnVuY3Rpb24oYyl7cmV0dXJuIG5ldyBzKGIuZ2V0RGlzcG9zYWJsZSgpLGEuc3Vic2NyaWJlKGMpKX0pfSxIPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gbShmdW5jdGlvbihkKXt2YXIgZj1cbm5ldyByLGU9bmV3IHIsZD1jKGQsZixlKTtmLmRpc3Bvc2FibGUoYS5tYXRlcmlhbGl6ZSgpLnNlbGVjdChmdW5jdGlvbihiKXtyZXR1cm57c3dpdGNoVmFsdWU6ZnVuY3Rpb24oYyl7cmV0dXJuIGMoYil9fX0pLnN1YnNjcmliZShkKSk7ZS5kaXNwb3NhYmxlKGIubWF0ZXJpYWxpemUoKS5zZWxlY3QoZnVuY3Rpb24oYil7cmV0dXJue3N3aXRjaFZhbHVlOmZ1bmN0aW9uKGMsYSl7cmV0dXJuIGEoYil9fX0pLnN1YnNjcmliZShkKSk7cmV0dXJuIG5ldyBzKGYsZSl9KX0sST1mdW5jdGlvbihhLGIpe3JldHVybiBtKGZ1bmN0aW9uKGMpe3JldHVybiBiLnNjaGVkdWxlV2l0aEFic29sdXRlKGEsZnVuY3Rpb24oKXtjLm9uTmV4dCgwKTtjLm9uQ29tcGxldGVkKCl9KX0pfSxBPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD0wPmI/MDpiO3JldHVybiBtKGZ1bmN0aW9uKGIpe3ZhciBlPTAsZz1hO3JldHVybiBjLnNjaGVkdWxlUmVjdXJzaXZlV2l0aEFic29sdXRlKGcsZnVuY3Rpb24oYSl7dmFyIGk7XG4wPGQmJihpPWMubm93KCksZys9ZCxnPD1pJiYoZz1pK2QpKTtiLm9uTmV4dChlKyspO2EoZyl9KX0pfSxKPWZ1bmN0aW9uKGEsYil7dmFyIGM9MD5hPzA6YTtyZXR1cm4gbShmdW5jdGlvbihhKXtyZXR1cm4gYi5zY2hlZHVsZVdpdGhSZWxhdGl2ZShjLGZ1bmN0aW9uKCl7YS5vbk5leHQoMCk7YS5vbkNvbXBsZXRlZCgpfSl9KX0sQj1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIHkoZnVuY3Rpb24oKXtyZXR1cm4gQShjLm5vdygpK2EsYixjKX0pfSxLPXEuaW50ZXJ2YWw9ZnVuY3Rpb24oYSxiKXtifHwoYj1sKTtyZXR1cm4gQihhLGEsYil9O3EudGltZXI9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkO2N8fChjPWwpO2IhPT1uJiZcIm51bWJlclwiPT09dHlwZW9mIGI/ZD1iOmIhPT1uJiZcIm9iamVjdFwiPT09dHlwZW9mIGImJihjPWIpO3JldHVybiBhIGluc3RhbmNlb2YgRGF0ZSYmZD09PW4/SShhLmdldFRpbWUoKSxjKTphIGluc3RhbmNlb2YgRGF0ZSYmZCE9PW4/QShhLmdldFRpbWUoKSxiLGMpOlxuZD09PW4/SihhLGMpOkIoYSxkLGMpfTt2YXIgRD1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIG0oZnVuY3Rpb24oZCl7dmFyIGY9ITEsZT1uZXcgdCxnPW51bGwsaD1bXSxpPSExLGo7aj1hLm1hdGVyaWFsaXplKCkudGltZXN0YW1wKGMpLnN1YnNjcmliZShmdW5jdGlvbihhKXtcIkVcIj09PWEudmFsdWUua2luZD8oaD1bXSxoLnB1c2goYSksZz1hLnZhbHVlLmV4Y2VwdGlvbixhPSFpKTooaC5wdXNoKHt2YWx1ZTphLnZhbHVlLHRpbWVzdGFtcDphLnRpbWVzdGFtcCtifSksYT0hZixmPSEwKTtpZihhKWlmKG51bGwhPT1nKWQub25FcnJvcihnKTtlbHNlIGE9bmV3IHIsZS5kaXNwb3NhYmxlKGEpLGEuZGlzcG9zYWJsZShjLnNjaGVkdWxlUmVjdXJzaXZlV2l0aFJlbGF0aXZlKGIsZnVuY3Rpb24oYSl7dmFyIGIsZSxqO2lmKG51bGw9PT1nKXtpPSEwO2Rve2I9bnVsbDtpZigwPGgubGVuZ3RoJiYwPj1oWzBdLnRpbWVzdGFtcC1jLm5vdygpKWI9aC5zaGlmdCgpLnZhbHVlO251bGwhPT1iJiZcbmIuYWNjZXB0KGQpfXdoaWxlKG51bGwhPT1iKTtqPSExO2U9MDswPGgubGVuZ3RoPyhqPSEwLGU9TWF0aC5tYXgoMCxoWzBdLnRpbWVzdGFtcC1jLm5vdygpKSk6Zj0hMTtiPWc7aT0hMTtpZihudWxsIT09YilkLm9uRXJyb3IoYik7ZWxzZSBqJiZhKGUpfX0pKX0pO3JldHVybiBuZXcgcyhqLGUpfSl9LEw9ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB5KGZ1bmN0aW9uKCl7dmFyIGE9Yi1jLm5vdygpO3JldHVybiBEKGEsYyl9KX07by5kZWxheT1mdW5jdGlvbihhLGIpe2J8fChiPWwpO3JldHVybiBhIGluc3RhbmNlb2YgRGF0ZT9MKHRoaXMsYS5nZXRUaW1lKCksYik6RCh0aGlzLGEsYil9O28udGhyb3R0bGU9ZnVuY3Rpb24oYSxiKXtifHwoYj1sKTt2YXIgYz10aGlzO3JldHVybiBtKGZ1bmN0aW9uKGQpe3ZhciBmPW5ldyB0LGU9ITEsZz0wLGgsaT1udWxsO2g9Yy5zdWJzY3JpYmUoZnVuY3Rpb24oYyl7dmFyIGs7ZT0hMDtpPWM7ZysrO2s9ZztjPW5ldyByO2YuZGlzcG9zYWJsZShjKTtcbmMuZGlzcG9zYWJsZShiLnNjaGVkdWxlV2l0aFJlbGF0aXZlKGEsZnVuY3Rpb24oKXtpZihlJiZnPT09aylkLm9uTmV4dChpKTtlPSExfSkpfSxmdW5jdGlvbihhKXtmLmRpc3Bvc2UoKTtkLm9uRXJyb3IoYSk7ZT0hMTtnKyt9LGZ1bmN0aW9uKCl7Zi5kaXNwb3NlKCk7aWYoZSlkLm9uTmV4dChpKTtkLm9uQ29tcGxldGVkKCk7ZT0hMTtnKyt9KTtyZXR1cm4gbmV3IHMoaCxmKX0pfTtvLndpbmRvd1dpdGhUaW1lPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD10aGlzLGY7Yj09PW4mJihmPWEpO2M9PT1uJiYoYz1sKTtcIm51bWJlclwiPT09dHlwZW9mIGI/Zj1iOlwib2JqZWN0XCI9PT10eXBlb2YgYiYmKGY9YSxjPWIpO3JldHVybiBtKGZ1bmN0aW9uKGIpe3ZhciBnLGgsaT1mLGo9YSxrPVtdLHgsQz1uZXcgdCxsPTA7aD1uZXcgcyhDKTt4PW5ldyB6KGgpO2c9ZnVuY3Rpb24oKXt2YXIgYSxkLGgsbSxuO2g9bmV3IHI7Qy5kaXNwb3NhYmxlKGgpO2E9ZD0hMTtqPT09aT9hPWQ9ITA6ajxpP2Q9ITA6XG5hPSEwO209ZD9qOmk7bj1tLWw7bD1tO2QmJihqKz1mKTthJiYoaSs9Zik7aC5kaXNwb3NhYmxlKGMuc2NoZWR1bGVXaXRoUmVsYXRpdmUobixmdW5jdGlvbigpe3ZhciBjO2EmJihjPW5ldyB1LGsucHVzaChjKSxiLm9uTmV4dCh2KGMseCkpKTtkJiYoYz1rLnNoaWZ0KCksYy5vbkNvbXBsZXRlZCgpKTtnKCl9KSl9O2sucHVzaChuZXcgdSk7Yi5vbk5leHQodihrWzBdLHgpKTtnKCk7aC5hZGQoZC5zdWJzY3JpYmUoZnVuY3Rpb24oYSl7dmFyIGIsYztmb3IoYj0wO2I8ay5sZW5ndGg7YisrKWM9a1tiXSxjLm9uTmV4dChhKX0sZnVuY3Rpb24oYSl7dmFyIGMsZDtmb3IoYz0wO2M8ay5sZW5ndGg7YysrKWQ9a1tjXSxkLm9uRXJyb3IoYSk7Yi5vbkVycm9yKGEpfSxmdW5jdGlvbigpe3ZhciBhLGM7Zm9yKGE9MDthPGsubGVuZ3RoO2ErKyljPWtbYV0sYy5vbkNvbXBsZXRlZCgpO2Iub25Db21wbGV0ZWQoKX0pKTtyZXR1cm4geH0pfTtvLndpbmRvd1dpdGhUaW1lT3JDb3VudD1mdW5jdGlvbihhLFxuYixjKXt2YXIgZD10aGlzO2N8fChjPWwpO3JldHVybiBtKGZ1bmN0aW9uKGYpe3ZhciBlLGcsaD0wLGksaixrPW5ldyB0LGw9MDtnPW5ldyBzKGspO2k9bmV3IHooZyk7ZT1mdW5jdGlvbihiKXt2YXIgZD1uZXcgcjtrLmRpc3Bvc2FibGUoZCk7ZC5kaXNwb3NhYmxlKGMuc2NoZWR1bGVXaXRoUmVsYXRpdmUoYSxmdW5jdGlvbigpe3ZhciBhO2I9PT1sJiYoaD0wLGE9KytsLGoub25Db21wbGV0ZWQoKSxqPW5ldyB1LGYub25OZXh0KHYoaixpKSksZShhKSl9KSl9O2o9bmV3IHU7Zi5vbk5leHQodihqLGkpKTtlKDApO2cuYWRkKGQuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe3ZhciBjPTAsZD0hMTtqLm9uTmV4dChhKTtoKys7aD09PWImJihkPSEwLGg9MCxjPSsrbCxqLm9uQ29tcGxldGVkKCksaj1uZXcgdSxmLm9uTmV4dCh2KGosaSkpKTtkJiZlKGMpfSxmdW5jdGlvbihhKXtqLm9uRXJyb3IoYSk7Zi5vbkVycm9yKGEpfSxmdW5jdGlvbigpe2oub25Db21wbGV0ZWQoKTtmLm9uQ29tcGxldGVkKCl9KSk7XG5yZXR1cm4gaX0pfTtvLmJ1ZmZlcldpdGhUaW1lPWZ1bmN0aW9uKGEsYixjKXt2YXIgZDtiPT09biYmKGQ9YSk7Y3x8KGM9bCk7XCJudW1iZXJcIj09PXR5cGVvZiBiP2Q9YjpcIm9iamVjdFwiPT09dHlwZW9mIGImJihkPWEsYz1iKTtyZXR1cm4gdGhpcy53aW5kb3dXaXRoVGltZShhLGQsYykuc2VsZWN0TWFueShmdW5jdGlvbihhKXtyZXR1cm4gYS50b0FycmF5KCl9KX07by5idWZmZXJXaXRoVGltZU9yQ291bnQ9ZnVuY3Rpb24oYSxiLGMpe2N8fChjPWwpO3JldHVybiB0aGlzLndpbmRvd1dpdGhUaW1lT3JDb3VudChhLGIsYykuc2VsZWN0TWFueShmdW5jdGlvbihhKXtyZXR1cm4gYS50b0FycmF5KCl9KX07by50aW1lSW50ZXJ2YWw9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpczthfHwoYT1sKTtyZXR1cm4geShmdW5jdGlvbigpe3ZhciBjPWEubm93KCk7cmV0dXJuIGIuc2VsZWN0KGZ1bmN0aW9uKGIpe3ZhciBmPWEubm93KCksZT1mLWM7Yz1mO3JldHVybnt2YWx1ZTpiLGludGVydmFsOmV9fSl9KX07XG5vLnRpbWVzdGFtcD1mdW5jdGlvbihhKXthfHwoYT1sKTtyZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oYil7cmV0dXJue3ZhbHVlOmIsdGltZXN0YW1wOmEubm93KCl9fSl9O3ZhciBFPWZ1bmN0aW9uKGEsYil7cmV0dXJuIEgoYSxiLGZ1bmN0aW9uKGEpe3ZhciBiPSExLGY7cmV0dXJuIG5ldyBHKGZ1bmN0aW9uKGUpe1wiTlwiPT09ZS5raW5kJiYoZj1lKTtcIkVcIj09PWUua2luZCYmZS5hY2NlcHQoYSk7XCJDXCI9PT1lLmtpbmQmJihiPSEwKX0sZnVuY3Rpb24oKXt2YXIgZT1mO2Y9bjtlIT09biYmZS5hY2NlcHQoYSk7aWYoYilhLm9uQ29tcGxldGVkKCl9KX0pfTtvLnNhbXBsZT1mdW5jdGlvbihhLGIpe2J8fChiPWwpO3JldHVyblwibnVtYmVyXCI9PT10eXBlb2YgYT9FKHRoaXMsSyhhLGIpKTpFKHRoaXMsYSl9O28udGltZW91dD1mdW5jdGlvbihhLGIsYyl7dmFyIGQsZj10aGlzO2I9PT1uJiYoYj1GKEVycm9yKFwiVGltZW91dFwiKSkpO2N8fChjPWwpO2Q9YSBpbnN0YW5jZW9mIERhdGU/XG5mdW5jdGlvbihhLGIpe2Muc2NoZWR1bGVXaXRoQWJzb2x1dGUoYSxiKX06ZnVuY3Rpb24oYSxiKXtjLnNjaGVkdWxlV2l0aFJlbGF0aXZlKGEsYil9O3JldHVybiBtKGZ1bmN0aW9uKGMpe3ZhciBnLGg9MCxpPW5ldyByLGo9bmV3IHQsaz0hMSxsPW5ldyB0O2ouZGlzcG9zYWJsZShpKTtnPWZ1bmN0aW9uKCl7dmFyIGY9aDtsLmRpc3Bvc2FibGUoZChhLGZ1bmN0aW9uKCl7KGs9aD09PWYpJiZqLmRpc3Bvc2FibGUoYi5zdWJzY3JpYmUoYykpfSkpfTtnKCk7aS5kaXNwb3NhYmxlKGYuc3Vic2NyaWJlKGZ1bmN0aW9uKGEpe2t8fChoKyssYy5vbk5leHQoYSksZygpKX0sZnVuY3Rpb24oYSl7a3x8KGgrKyxjLm9uRXJyb3IoYSkpfSxmdW5jdGlvbigpe2t8fChoKyssYy5vbkNvbXBsZXRlZCgpKX0pKTtyZXR1cm4gbmV3IHMoaixsKX0pfTtxLmdlbmVyYXRlV2l0aEFic29sdXRlVGltZT1mdW5jdGlvbihhLGIsYyxkLGYsZSl7ZXx8KGU9bCk7cmV0dXJuIG0oZnVuY3Rpb24oZyl7dmFyIGg9XG4hMCxpPSExLGosaz1hLGw7cmV0dXJuIGUuc2NoZWR1bGVSZWN1cnNpdmVXaXRoQWJzb2x1dGUoZS5ub3coKSxmdW5jdGlvbihhKXtpZihpKWcub25OZXh0KGopO3RyeXtpZihoP2g9ITE6az1jKGspLGk9YihrKSlqPWQoayksbD1mKGspfWNhdGNoKGUpe2cub25FcnJvcihlKTtyZXR1cm59aWYoaSlhKGwpO2Vsc2UgZy5vbkNvbXBsZXRlZCgpfSl9KX07cS5nZW5lcmF0ZVdpdGhSZWxhdGl2ZVRpbWU9ZnVuY3Rpb24oYSxiLGMsZCxmLGUpe2V8fChlPWwpO3JldHVybiBtKGZ1bmN0aW9uKGcpe3ZhciBoPSEwLGk9ITEsaixrPWEsbDtyZXR1cm4gZS5zY2hlZHVsZVJlY3Vyc2l2ZVdpdGhSZWxhdGl2ZSgwLGZ1bmN0aW9uKGEpe2lmKGkpZy5vbk5leHQoaik7dHJ5e2lmKGg/aD0hMTprPWMoayksaT1iKGspKWo9ZChrKSxsPWYoayl9Y2F0Y2goZSl7Zy5vbkVycm9yKGUpO3JldHVybn1pZihpKWEobCk7ZWxzZSBnLm9uQ29tcGxldGVkKCl9KX0pfX07XG4iXX0=
;