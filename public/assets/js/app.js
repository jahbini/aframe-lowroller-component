(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("components/button.coffee", function(exports, require, module) {
var $, B, T, V;

$ = require('jquery');

T = Pylon.Halvalla;

B = require('backbone');


/*
DebugButton = new BV 'debug'
 * initialize with legend and enabled boolean
 * BV sets Pylon with the attribute 'button-name'
 *  NB. BV sets Pylon with event triggers like 'systemEvent:name:legend'
DebugButton.set
  legend: "Show Log"
  enabled: true
 * when DebugButton is pressed, the legend above generates this event
Pylon.on "systemEvent:debug:show-log",() ->
  DebugButton.set legend: "Hide Log"
  $('#footer').show()
  return false

 * when DebugButton is pressed, the legend 'Hide Log' above generates this event
Pylon.on "systemEvent:debug:hide-log", ()->
  DebugButton.set legend: "Show Log"
  $('#footer').hide()
  return false
$('#footer').hide()
assert DebugButton == Pylon.get 'debug-button'
 */

V = B.View.extend({
  tagName: "button",
  initialize: function(model, name, classes1) {
    this.model = model;
    this.name = name;
    this.classes = classes1;
    this.model.on('change:legend', this.render, this);
    this.model.on('change:enabled', this.render, this);
    this.render();
    return this;
  },
  render: function() {
    var m, newVisual, old, visual;
    m = this.model;
    if (m.get('enabled')) {
      visual = T.render((function(_this) {
        return function() {
          return T.button("#" + _this.name + "." + _this.classes + ".button-primary", _this.model.get('legend'));
        };
      })(this));
    } else {
      visual = T.render((function(_this) {
        return function() {
          return T.button("#" + _this.name + "." + _this.classes + ".disabled", {
            disabled: "disabled"
          }, _this.model.get('legend'));
        };
      })(this));
    }
    newVisual = $(visual);
    if ((old = this.$el)) {
      this.setElement(newVisual);
      old.replaceWith(newVisual);
    }
    return this;
  },
  events: {
    click: function() {
      if (this.model.get('enabled')) {
        return Pylon.trigger("systemEvent:" + this.model.get('trigger'));
      }
    }
  }
});

module.exports = B.Model.extend({
  defaults: {
    legend: "disabled",
    enabled: false
  },
  setTrigger: function() {
    var trigger;
    trigger = this.get('legend');
    return this.set('trigger', this.name + ":" + (trigger.replace(/ /g, '-').toLocaleLowerCase()));
  },
  initialize: function(name, classes) {
    this.name = name;
    if (classes == null) {
      classes = "three.columns";
    }
    Pylon.set("button-" + this.name, this);
    this.setTrigger();
    this.on("change:legend", this.setTrigger, this);
    this.view = new V(this, this.name, classes);
    this.view.setElement($("#" + this.name));
    this.on("change:enabled", this.view.render, this.view);
    return this;
  }
});

});

require.register("components/fibonacci.coffee", function(exports, require, module) {
var B, Fibonacci, T, Template, template,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

T = Pylon.Halvalla;

B = require('backbone');

Template = require("payload-/" + siteHandle + ".coffee");

template = new Template(T);

module.exports = T.bless(Fibonacci = (function(superClass) {
  var Lozenge, ratioToPixels, rollSquare;

  extend(Fibonacci, superClass);

  function Fibonacci() {
    this.view = bind(this.view, this);
    return Fibonacci.__super__.constructor.apply(this, arguments);
  }

  Fibonacci.prototype.displayName = 'Fibonacci';

  rollSquare = function(a, b) {
    return (a >> b) & 1;
  };

  ratioToPixels = function(xRaw, yRaw) {
    console.log("Ratio x,y=", xRaw, yRaw);
    console.log("Ratio = ", xRaw / yRaw + yRaw / xRaw);
    if ((xRaw / yRaw + yRaw / xRaw) > 2.4) {
      return null;
    }
    xRaw = Math.floor(xRaw);
    yRaw = Math.floor(yRaw);
    return {
      x: xRaw,
      xpx: xRaw + 'px',
      y: yRaw,
      ypx: yRaw + 'px'
    };
  };

  Lozenge = function(n, x, y) {
    var lx, ly, px, shrink, xpx, ypx;
    shrink = Math.pow(0.618033, n);
    if (!(px = ratioToPixels(x, y))) {
      return T.div("#last.bg-red.n-" + n + ".left", {
        width: x,
        height: y,
        style: {
          minWidth: x + "px",
          minHeight: y + "px"
        }
      });
    }
    x = px.x, y = px.y, xpx = px.xpx, ypx = px.ypx;
    if (x > y) {
      lx = Math.floor(x - y);
      return T.div(".h-lozenge.left", {
        width: xpx,
        height: ypx,
        style: {
          width: xpx,
          height: ypx
        }
      }, function() {
        if (rollSquare(hexagramNumber, n)) {
          Lozenge(n + 1, lx, y);
          return T.div(squareOptions[n].classNames, {
            width: ypx,
            height: ypx,
            style: {
              backgroundColor: squareOptions[n].color,
              width: ypx,
              height: ypx
            }
          }, function() {
            return T.div({
              style: {
                WebkitTransformOrigin: 'top left',
                WebkitTransform: "scale(" + shrink + ")",
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div("#sq-" + n, {
                onclick: "swap(" + n + ")"
              }, function() {
                return squareOptions[n].src;
              });
            });
          });
        } else {
          T.div(squareOptions[n].classNames, {
            width: ypx,
            height: ypx,
            style: {
              backgroundColor: squareOptions[n].color,
              width: ypx,
              height: ypx
            }
          }, function() {
            return T.div({
              style: {
                WebkitTransformOrigin: 'top left',
                WebkitTransform: "scale(" + shrink + ")",
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div("#sq-" + n, {
                onclick: "swap(" + n + ")"
              }, function() {
                return squareOptions[n].src;
              });
            });
          });
          return Lozenge(n + 1, lx, y);
        }
      });
    } else {
      ly = Math.floor(y - x);
      return T.div(".v-lozenge.left", {
        width: xpx,
        height: ypx,
        style: {
          width: xpx,
          height: ypx
        }
      }, function() {
        if (rollSquare(hexagramNumber, n)) {
          T.div(squareOptions[n].classNames, {
            width: xpx,
            height: xpx,
            style: {
              backgroundColor: squareOptions[n].color,
              width: xpx,
              height: xpx
            }
          }, function() {
            return T.div({
              style: {
                WebkitTransformOrigin: 'top left',
                WebkitTransform: "scale(" + shrink + ")",
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div("#sq-" + n, {
                onclick: "swap(" + n + ")"
              }, function() {
                return squareOptions[n].src;
              });
            });
          });
          return Lozenge(n + 1, x, ly);
        } else {
          Lozenge(n + 1, x, ly);
          return T.div(squareOptions[n].classNames, {
            width: xpx,
            height: xpx,
            style: {
              backgroundColor: squareOptions[n].color,
              width: xpx,
              height: xpx
            }
          }, function() {
            return T.div({
              style: {
                WebkitTransformOrigin: 'top left',
                WebkitTransform: "scale(" + shrink + ")",
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div("#sq-" + n, {
                onclick: "swap(" + n + ")"
              }, function() {
                return squareOptions[n].src;
              });
            });
          });
        }
      });
    }
  };

  Fibonacci.prototype.view = function(vnode) {
    var collection, data, filter, intermediate, teacupContent;
    collection = vnode.attrs.collection;
    filter = vnode.attrs.filter || function() {
      return true;
    };
    intermediate = collection.filter(filter, this);
    data = _(intermediate).sortBy(function(s) {
      return s.get('category');
    }).groupBy(function(s) {
      return s.get('category');
    });
    teacupContent = Lozenge(0, x, y);
    return teacupContent;
  };

  return Fibonacci;

})(B.Model));

});

require.register("components/sidebar-view.coffee", function(exports, require, module) {
var B, Sidebar, T, Template, template,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

T = Pylon.Halvalla;

B = require('backbone');

Template = require("payload-/" + siteHandle + ".coffee");

template = new Template(T);

module.exports = T.bless(Sidebar = (function(superClass) {
  extend(Sidebar, superClass);

  function Sidebar() {
    this.view = bind(this.view, this);
    this.clickHandler = bind(this.clickHandler, this);
    return Sidebar.__super__.constructor.apply(this, arguments);
  }

  Sidebar.prototype.displayName = 'Sidebar';

  Sidebar.prototype.clickHandler = function(e) {
    var targ;
    targ = e.currentTarget.parentNode.childNodes[1];
    if ("true" === targ.getAttribute("aria-expanded")) {
      targ.setAttribute('aria-expanded', false);
      targ.setAttribute('hidden', "hidden");
    } else {
      targ.setAttribute('aria-expanded', 'true');
      targ.removeAttribute('hidden');
    }
  };

  Sidebar.prototype.view = function(vnode) {
    var collection, data, filter, intermediate, teacupContent;
    collection = vnode.attrs.collection;
    filter = vnode.attrs.filter || function() {
      return true;
    };
    intermediate = collection.filter(filter, this);
    data = _(intermediate).sortBy(function(s) {
      return s.get('category');
    }).groupBy(function(s) {
      return s.get('category');
    });
    teacupContent = template.widgetWrap({
      title: "Contents"
    }, (function(_this) {
      return function() {
        var result;
        result = data.each(function(allCrap, category, stuff) {
          var catPostfix, catPrefix, headliner, stories;
          if (category === '-') {
            return;
          }
          stories = stuff[category];
          catPostfix = category.match(/\/?[^\/]+$/);
          catPrefix = category.replace(/[^\/]/g, '');
          catPrefix = catPrefix.replace(/\//g, ' -');
          catPostfix = catPostfix.toString().replace(/\//g, '- ');
          return headliner = _(stories).find(function(story) {
            var attrX;
            attrX = {
              'aria-expanded': 'false',
              onclick: _this.clickHandler,
              role: 'heading'
            };
            return T.div('.btn-group.btn-group-vertical', function() {
              if (headliner) {
                T.button(".btn.btn-group.btn-outline-light.btn-block", attrX, function() {
                  return T.h5('', function() {
                    T.text(category + ": ");
                    return T.em(".h6", _.sample(headliner.get('headlines')));
                  });
                });
              } else {
                T.button(".btn.btn-group.btn-outline-light.btn-block", attrX, function() {
                  return T.h6('', catPrefix + " " + catPostfix);
                });
              }
              return T.section(".pr1.btn-group.btn-outline-light", {
                hidden: "hidden",
                "aria-expanded": 'false'
              }, function() {
                return T.ul(".my-2", function() {
                  return _(stuff[category]).each(function(story) {
                    if ('category' === story.get('className')) {
                      return;
                    }
                    return T.li("", function() {
                      return T.a("", {
                        'color': 'white',
                        href: siteHandle === story.get('siteHandle') ? story.href() : story.href(story.get('siteHandle'))
                      }, "" + (story.get('title')));
                    });
                  });
                });
              });
            });
          });
        });
        if (!result) {
          return T.text("No Stories");
        }
      };
    })(this));
    return teacupContent;
  };

  return Sidebar;

})(B.Model));

});

require.register("components/storybar-view.coffee", function(exports, require, module) {
var B, Storybar, T, siteBase, z,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

T = Pylon.Halvalla;

B = require('backbone');

siteBase = topDomain.split('.');

z = siteBase.shift();

module.exports = T.bless(Storybar = (function() {
  function Storybar() {
    this.view = bind(this.view, this);
  }

  Storybar.prototype.displayName = 'Storybar';

  Storybar.prototype.view = function(vnode) {
    var badClass, badHeadline, collection, error, filter, intermediate, story, storyFrom;
    collection = vnode.attrs.collection;
    filter = vnode.attrs.filter || function() {
      return true;
    };
    intermediate = collection.filter(filter, this);
    story = null;
    while (!story) {
      story = _.sample(intermediate);
      if (!story) {
        return null;
      }
      badClass = 'category' === story.get('className');
      badHeadline = (story.get('headlines')) < 1;
      if (badClass || badHeadline) {
        story = null;
      }
    }
    try {
      storyFrom = story.get('site');
    } catch (error1) {
      error = error1;
      console.log("Ailing Story", story);
      return null;
    }
    siteBase = topDomain.split('.');
    siteBase.shift();
    siteBase.unshift(storyFrom);
    return T.div(".c-card", function() {
      return T.div(".c-card__item.bg-silver", function() {
        return T.a(".c-link.c-link--brand", {
          href: story.href('http://' + siteBase.join('.'))
        }, function() {
          return T.div(function() {
            return T.h4(function() {
              T.raw("From Around the Web: ");
              return T.span(".u-text--quiet.u-text--highlight", (story.get('title')) + ": " + ((_.sample(story.get('headlines'))) || ''));
            });
          });
        });
      });
    });
  };

  return Storybar;

})());

});

require.register("config.js", function(exports, require, module) {
'use strict';

var monospace = '"Roboto Mono", Menlo, Consolas, monospace';

var baseColors = {
  black: '#111',
  white: '#fff',
  gray: '#ddd',
  midgray: '#888',
  blue: '#08e',
  red: '#f52',
  orange: '#f70',
  green: '#1c7'
};

var colors = {
  black: '#111',
  white: '#fff',
  gray: '#ddd',
  midgray: '#888',
  blue: '#08e',
  red: '#f52',
  orange: '#f70',
  green: '#1c7' /* ...baseColors*/

  , primary: baseColors.blue,
  secondary: baseColors.midgray,
  default: baseColors.black,
  info: baseColors.blue,
  success: baseColors.green,
  warning: baseColors.orange,
  error: baseColors.red
};

var inverted = colors.white;

var scale = [0, 8, 16, 32, 64];

var fontSizes = [48, 32, 24, 20, 16, 14, 12];

var zIndex = [0, 2, 4, 8, 16];

var bold = 600;
var borderRadius = 2;
var borderColor = 'rgba(0, 0, 0, .25)';

var config = {
  scale: scale,
  fontSizes: fontSizes,
  bold: bold,
  monospace: monospace,
  zIndex: zIndex,
  colors: colors,
  inverted: inverted,
  borderRadius: borderRadius,
  borderColor: borderColor,
  pureRender: true
};

module.exports = config;

});

require.register("configurations/basic.js", function(exports, require, module) {
'use strict';

var init = {
  name: 'Basic',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  color: '#111',
  backgroundColor: '#fff',

  Heading: {
    fontFamily: 'inherit'
  },
  Banner: {
    minHeight: '80vh'
  },
  Label: {
    opacity: .875
  },
  Toolbar: {
    opacity: .875
  }
};

module.exports = init;

});

require.register("configurations/biblio.js", function(exports, require, module) {
'use strict';

var config = require('config');

function augment(original, addition) {
  _(addition).reduce(original, function (key, value, original) {
    original[key] = value;
    return original;
  });
}

var sans = {
  fontFamily: 'Roboto, sans-serif'
};

var caps = {
  textTransform: 'uppercase',
  letterSpacing: '.1em'
};

var colors = {
  red: '#e54',
  blue: '#059',
  green: '#0b7',
  midgray: '#444',
  gray: '#eee'
};

var biblio = {
  name: 'Biblio',
  fontFamily: 'Palatino, Georgia, serif',
  color: '#111',
  backgroundColor: '#fff',

  colors: augment(augment({
    primary: colors.red,
    error: colors.red,
    info: colors.blue,
    success: colors.green,
    secondary: colors.midgray
  }, config.colors), colors),

  borderColor: 'rgba(0, 0, 0, ' + 1 / 8 + ')',

  scale: [0, 12, 24, 48, 96],

  fontSizes: [72, 64, 48, 32, 18, 16, 14],

  bold: 500,

  Heading_alt: augment(augment({
    opacity: 1,
    fontSize: 14,
    color: colors.red
  }, sans), caps),

  Banner: {
    backgroundColor: '#f6fee6',
    // backgroundImage: 'none',
    boxShadow: 'inset 0 0 320px 0 rgba(128, 64, 0, .5), inset 0 0 0 99999px rgba(128, 128, 96, .25)'
  },

  Toolbar: {
    color: 'inherit',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, ' + 1 / 8 + ')'
  },

  Button: augment(augment({
    fontSize: 12
  }, sans), caps),
  ButtonOutline: augment(augment({
    fontSize: 12
  }, sans), caps),
  NavItem: augment(augment({
    fontSize: 12
  }, sans), caps),
  PanelHeader: augment({}, sans),
  Label: augment(augment({
    fontSize: 12,
    opacity: 5 / 8
  }, sans), caps),
  SequenceMap: augment(augment({
    fontSize: 12
  }, sans), caps),
  Donut: augment({}, sans),
  Stat: augment({}, sans),
  Breadcrumbs: augment({
    color: '#e54'
  }, sans),

  PageHeader: {
    borderColor: '#e54'
  },
  SectionHeader: {
    borderColor: '#e54'
  }

};

module.exports = biblio;

});

require.register("controllers/base/controller.coffee", function(exports, require, module) {
'use strict';
var BaseController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = BaseController = (function(superClass) {
  extend(BaseController, superClass);

  function BaseController() {
    return BaseController.__super__.constructor.apply(this, arguments);
  }

  return BaseController;

})(Chaplin.Controller);

});

require.register("controllers/footer.coffee", function(exports, require, module) {
var BaseController, FooterController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = FooterController = (function(superClass) {
  extend(FooterController, superClass);

  function FooterController() {
    return FooterController.__super__.constructor.apply(this, arguments);
  }

  return FooterController;

})(BaseController);

});

require.register("controllers/home.coffee", function(exports, require, module) {
var HomeController, PageController, log,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PageController = require('controllers/page');

log = require('loglevel');

'use strict';

module.exports = HomeController = (function(superClass) {
  extend(HomeController, superClass);

  function HomeController() {
    return HomeController.__super__.constructor.apply(this, arguments);
  }

  HomeController.prototype.showit = function() {
    return false;
  };

  HomeController.prototype.show = function() {
    return log.info('HomeController:show');
  };

  return HomeController;

})(PageController);

});

require.register("controllers/menu.coffee", function(exports, require, module) {
var BaseController, MenuController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = MenuController = (function(superClass) {
  extend(MenuController, superClass);

  function MenuController() {
    return MenuController.__super__.constructor.apply(this, arguments);
  }

  return MenuController;

})(BaseController);

});

require.register("controllers/page.coffee", function(exports, require, module) {
var BaseController, PageController,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = PageController = (function(superClass) {
  extend(PageController, superClass);

  function PageController() {
    return PageController.__super__.constructor.apply(this, arguments);
  }

  PageController.prototype.beforeAction = function(actionParams, controllerOptions) {
    Chaplin.mediator.controllerAction = controllerOptions.action;
    return Chaplin.mediator.actionParams = actionParams;
  };

  return PageController;

})(BaseController);

});

require.register("initialize.coffee", function(exports, require, module) {
var Backbone, Fibonacci, FontFaceObserver, Mithril, Palx, Pylon, PylonTemplate, Sidebar, Storybar, T, allStories, myStories, newColors, ref, routes,
  slice = [].slice;

window.$ = jQuery;

window._ = require('lodash');

Backbone = require('backbone');

PylonTemplate = Backbone.Model.extend({
  Mithril: require('mithril'),
  Mss: require('mss-js'),
  Halvalla: require('halvalla/lib/halvalla-mithril'),
  Palx: require('palx'),
  Utils: require('./lib/utils'),
  Underscore: require('underscore')
});

window.Pylon = Pylon = new PylonTemplate;

Pylon.Button = require('./components/button');

Pylon.on('all', function() {
  var event, mim, rest;
  event = arguments[0], rest = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  mim = event.match(/((.*):.*):/);
  if (!mim || mim[2] !== 'systemEvent') {
    return null;
  }
  applogger("event " + event);
  Pylon.trigger(mim[1], event, rest);
  Pylon.trigger(mim[2], event, rest);
  return null;
});

FontFaceObserver = require('font-face-observer');

T = Pylon.Halvalla;

Mithril = Pylon.Mithril;

Sidebar = require('./components/sidebar-view');

Storybar = require('./components/storybar-view');

Fibonacci = require('./components/fibonacci');

routes = require('./routes');

Palx = Pylon.Palx;

newColors = Palx(document.styling.palx);

newColors.black = document.styling.black;

newColors.white = document.styling.white;

ref = require('models/stories'), myStories = ref.myStories, allStories = ref.allStories;


/*
styled= require   'styled-components'
{ injectGlobal, keyframes } = styled
styled = styled.default

injectGlobal""" 
  body {
    * {box-sizing: border-box; }
    body { margin: 0; }
    font-family: sans-serif;
  }
"""
 */

$(function() {
  var badDog, bloviation, divs, mine, realNode, sidebarContents, theirs;
  mine = {
    collection: myStories,
    filter: function(story) {
      return 'draft' !== story.get('category');
    }
  };
  theirs = {
    collection: allStories,
    filter: function(story) {
      return 'draft' !== story.get('category');
    }
  };
  try {
    realNode = document.getElementById('sidebar');
    sidebarContents = Sidebar(mine);
    Mithril.render(realNode, sidebarContents);
  } catch (error) {
    badDog = error;
    console.log(badDog);
  }
  divs = $('.siteInvitation');
  divs.each(function(key, div) {
    return Mithril.render(div, Storybar(theirs));
  });
  bloviation = document.getElementById('fibonacci');
  if (bloviation) {
    return Mithril.render(bloviation, Fibonacci(1, 2, 3, 4, 5, 6));
  }
});

});

require.register("lib/badass.coffee", function(exports, require, module) {
var B, HolyGrail, Link, Panel, PanelHeader, T, ref,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

T = Pylon.Halvalla;

B = require('backbone');

ref = Pylon.Rebass, Panel = ref.Panel, PanelHeader = ref.PanelHeader, Link = ref.Link;

Panel = T.bless(Panel);

Link = T.bless(Link);

PanelHeader = T.bless(PanelHeader);

module.exports.holyGrail = T.bless(HolyGrail = (function(superClass) {
  extend(HolyGrail, superClass);

  function HolyGrail(props1) {
    this.props = props1;
    this.render = bind(this.render, this);
  }

  HolyGrail.prototype.render = function() {
    var options;
    options = _.pluck(this.props, 'user', 'navLinks', 'story', 'page');
    return T.div('.o-grid.o-grid--full', function() {
      this.props.header('.o-grid__cell', options);
      T.div('.o-grid__cell', function() {
        T.div('.o-grid', function() {
          return this.props.left;
        });
        T.div('.o-grid__cell', function() {
          return this.props.middle;
        });
        return T.div('.o-grid__cell', function() {
          return this.props.right;
        });
      });
      return this.props.footer('.o-grid__cell', options);
    });
  };

  return HolyGrail;

})(React.Component));

module.exports.Panel = Panel = (function(superClass) {
  extend(Panel, superClass);

  Panel.prototype.displayName = 'Panel';

  function Panel(props1) {
    this.props = props1;
    this.view = bind(this.view, this);
    this.style = bind(this.style, this);
    this;
  }

  Panel.prototype.style = function() {
    return {
      overflow: 'hidden',
      borderRadius: px(this.props.theme.radius),
      borderWidth: px(1),
      borderStyle: 'solid'
    };
  };

  Panel.prototype.view = function() {
    return T.div({
      style: this.style(this.props.style, {
        children: this.props.children
      })
    });
  };

  return Panel;

})(B.Model);

module.exports.PanelHeader = PanelHeader = (function(superClass) {
  extend(PanelHeader, superClass);

  PanelHeader.prototype.displayName = 'PanelHeader';

  function PanelHeader(vnode) {
    this.vnode = vnode;
    this.style = bind(this.style, this);
    this.props = {
      f: 2,
      p: 2
    };
    console.log("PanelHeader constructor", this.vnode);
    this;
  }

  PanelHeader.prototype.style = function(props) {
    return {
      fontWeight: bold(props),
      borderBottomWidth: px(1),
      borderBottomStyle: 'solid'
    };
  };

  PanelHeader.prototype.view = function() {
    return T.crel('Header', {
      style: this.style(this.vode.style)
    });
  };

  return PanelHeader;

})(B.Model);

});

require.register("lib/utils.coffee", function(exports, require, module) {
var Pylon, Utility,
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

Pylon = window.Pylon;

module.exports = new (Utility = (function() {
  function Utility() {}

  Utility.prototype.camelize = (function() {
    var camelizer, regexp;
    regexp = /[-_]([a-z])/g;
    camelizer = function(match, c) {
      return c.toUpperCase();
    };
    return function(string) {
      return string.replace(regexp, camelizer);
    };
  })();

  Utility.prototype.dasherize = function(string) {
    return string.replace(/[A-Z]/g, function(char, index) {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };

  Utility.prototype.sessionStorage = (function() {
    if (window.sessionStorage && sessionStorage.getItem && sessionStorage.setItem && sessionStorage.removeItem) {
      return function(key, value) {
        if (typeof value === 'undefined') {
          value = sessionStorage.getItem(key);
          if ((value != null) && value.toString) {
            return value.toString();
          } else {
            return value;
          }
        } else {
          sessionStorage.setItem(key, value);
          return value;
        }
      };
    } else {
      return function(key, value) {
        if (typeof value === 'undefined') {
          return utils.getCookie(key);
        } else {
          utils.setCookie(key, value);
          return value;
        }
      };
    }
  })();

  Utility.prototype.sessionStorageRemove = (function() {
    if (window.sessionStorage && sessionStorage.getItem && sessionStorage.setItem && sessionStorage.removeItem) {
      return function(key) {
        return sessionStorage.removeItem(key);
      };
    } else {
      return function(key) {
        return utils.expireCookie(key);
      };
    }
  })();

  Utility.prototype.getCookie = function(key) {
    var i, len, pair, pairs, val;
    pairs = document.cookie.split('; ');
    for (i = 0, len = pairs.length; i < len; i++) {
      pair = pairs[i];
      val = pair.split('=');
      if (decodeURIComponent(val[0]) === key) {
        return decodeURIComponent(val[1] || '');
      }
    }
    return null;
  };

  Utility.prototype.setCookie = function(key, value, options) {
    var expires, getOption, payload;
    if (options == null) {
      options = {};
    }
    payload = (encodeURIComponent(key)) + "=" + (encodeURIComponent(value));
    getOption = function(name) {
      if (options[name]) {
        return "; " + name + "=" + options[name];
      } else {
        return '';
      }
    };
    expires = options.expires ? "; expires=" + (options.expires.toUTCString()) : '';
    return document.cookie = [payload, expires, getOption('path'), getOption('domain'), getOption('secure')].join('');
  };

  Utility.prototype.expireCookie = function(key) {
    return document.cookie = key + "=nil; expires=" + ((new Date).toGMTString());
  };

  Utility.prototype.loadLib = function(url, success, error, timeout) {
    var head, onload, script, timeoutHandle;
    if (timeout == null) {
      timeout = 7500;
    }
    head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    script = document.createElement('script');
    script.async = 'async';
    script.src = url;
    onload = function(_, aborted) {
      if (aborted == null) {
        aborted = false;
      }
      if (!(aborted || !script.readyState || script.readyState === 'complete')) {
        return;
      }
      clearTimeout(timeoutHandle);
      script.onload = script.onreadystatechange = script.onerror = null;
      if (head && script.parentNode) {
        head.removeChild(script);
      }
      script = void 0;
      if (success && !aborted) {
        return success();
      }
    };
    script.onload = script.onreadystatechange = onload;
    script.onerror = function() {
      onload(null, true);
      if (error) {
        return error();
      }
    };
    timeoutHandle = setTimeout(script.onerror, timeout);
    return head.insertBefore(script, head.firstChild);
  };

  Utility.prototype.deferMethods = function(options) {
    var deferred, func, host, i, len, methods, methodsHash, name, onDeferral, results, target;
    deferred = options.deferred;
    methods = options.methods;
    host = options.host || deferred;
    target = options.target || host;
    onDeferral = options.onDeferral;
    methodsHash = {};
    if (typeof methods === 'string') {
      methodsHash[methods] = host[methods];
    } else if (methods.length && methods[0]) {
      for (i = 0, len = methods.length; i < len; i++) {
        name = methods[i];
        func = host[name];
        if (typeof func !== 'function') {
          throw new TypeError("utils.deferMethods: method " + name + " not found on host " + host);
        }
        methodsHash[name] = func;
      }
    } else {
      methodsHash = methods;
    }
    results = [];
    for (name in methodsHash) {
      if (!hasProp.call(methodsHash, name)) continue;
      func = methodsHash[name];
      if (typeof func !== 'function') {
        continue;
      }
      results.push(target[name] = utils.createDeferredFunction(deferred, func, target, onDeferral));
    }
    return results;
  };

  Utility.prototype.createDeferredFunction = function(deferred, func, context, onDeferral) {
    if (context == null) {
      context = deferred;
    }
    return function() {
      var args;
      args = arguments;
      if (deferred.state() === 'resolved') {
        return func.apply(context, args);
      } else {
        deferred.done(function() {
          return func.apply(context, args);
        });
        if (typeof onDeferral === 'function') {
          return onDeferral.apply(context);
        }
      }
    };
  };

  Utility.prototype.accumulator = {
    collectedData: {},
    handles: {},
    handlers: {},
    successHandlers: {},
    errorHandlers: {},
    interval: 2000
  };

  Utility.prototype.wrapAccumulators = function(obj, methods) {
    var func, i, len, name;
    for (i = 0, len = methods.length; i < len; i++) {
      name = methods[i];
      func = obj[name];
      if (typeof func !== 'function') {
        throw new TypeError("utils.wrapAccumulators: method " + name + " not found");
      }
      obj[name] = utils.createAccumulator(name, obj[name], obj);
    }
    return $(window).unload((function(_this) {
      return function() {
        var handler, ref, results;
        ref = utils.accumulator.handlers;
        results = [];
        for (name in ref) {
          handler = ref[name];
          results.push(handler({
            async: false
          }));
        }
        return results;
      };
    })(this));
  };

  Utility.prototype.createAccumulator = function(name, func, context) {
    var acc, accumulatedError, accumulatedSuccess, cleanup, id;
    if (!(id = func.__uniqueID)) {
      id = func.__uniqueID = name + String(Math.random()).replace('.', '');
    }
    acc = utils.accumulator;
    cleanup = function() {
      delete acc.collectedData[id];
      delete acc.successHandlers[id];
      return delete acc.errorHandlers[id];
    };
    accumulatedSuccess = function() {
      var handler, handlers, i, len;
      handlers = acc.successHandlers[id];
      if (handlers) {
        for (i = 0, len = handlers.length; i < len; i++) {
          handler = handlers[i];
          handler.apply(this, arguments);
        }
      }
      return cleanup();
    };
    accumulatedError = function() {
      var handler, handlers, i, len;
      handlers = acc.errorHandlers[id];
      if (handlers) {
        for (i = 0, len = handlers.length; i < len; i++) {
          handler = handlers[i];
          handler.apply(this, arguments);
        }
      }
      return cleanup();
    };
    return function() {
      var data, error, handler, rest, success;
      data = arguments[0], success = arguments[1], error = arguments[2], rest = 4 <= arguments.length ? slice.call(arguments, 3) : [];
      if (data) {
        acc.collectedData[id] = (acc.collectedData[id] || []).concat(data);
      }
      if (success) {
        acc.successHandlers[id] = (acc.successHandlers[id] || []).concat(success);
      }
      if (error) {
        acc.errorHandlers[id] = (acc.errorHandlers[id] || []).concat(error);
      }
      if (acc.handles[id]) {
        return;
      }
      handler = function(options) {
        var args, collectedData;
        if (options == null) {
          options = options;
        }
        if (!(collectedData = acc.collectedData[id])) {
          return;
        }
        args = [collectedData, accumulatedSuccess, accumulatedError].concat(rest);
        func.apply(context, args);
        clearTimeout(acc.handles[id]);
        delete acc.handles[id];
        return delete acc.handlers[id];
      };
      acc.handlers[id] = handler;
      return acc.handles[id] = setTimeout((function() {
        return handler();
      }), acc.interval);
    };
  };

  Utility.prototype.afterLogin = function() {
    var args, context, eventType, func, loginHandler;
    context = arguments[0], func = arguments[1], eventType = arguments[2], args = 4 <= arguments.length ? slice.call(arguments, 3) : [];
    if (eventType == null) {
      eventType = 'login';
    }
    if (mediator.user) {
      return func.apply(context, args);
    } else {
      loginHandler = function() {
        mediator.unsubscribe(eventType, loginHandler);
        return func.apply(context, args);
      };
      return mediator.subscribe(eventType, loginHandler);
    }
  };

  Utility.prototype.deferMethodsUntilLogin = function(obj, methods, eventType) {
    var func, i, len, name, results;
    if (eventType == null) {
      eventType = 'login';
    }
    if (typeof methods === 'string') {
      methods = [methods];
    }
    results = [];
    for (i = 0, len = methods.length; i < len; i++) {
      name = methods[i];
      func = obj[name];
      if (typeof func !== 'function') {
        throw new TypeError("utils.deferMethodsUntilLogin: method " + name + " not found");
      }
      results.push(obj[name] = _(utils.afterLogin).bind(null, obj, func, eventType));
    }
    return results;
  };

  Utility.prototype.ensureLogin = function() {
    var args, context, e, eventType, func, loginContext;
    context = arguments[0], func = arguments[1], loginContext = arguments[2], eventType = arguments[3], args = 5 <= arguments.length ? slice.call(arguments, 4) : [];
    if (eventType == null) {
      eventType = 'login';
    }
    utils.afterLogin.apply(utils, [context, func, eventType].concat(slice.call(args)));
    if (!mediator.user) {
      if ((e = args[0]) && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      return mediator.publish('!showLogin', loginContext);
    }
  };

  Utility.prototype.ensureLoginForMethods = function(obj, methods, loginContext, eventType) {
    var func, i, len, name, results;
    if (eventType == null) {
      eventType = 'login';
    }
    if (typeof methods === 'string') {
      methods = [methods];
    }
    results = [];
    for (i = 0, len = methods.length; i < len; i++) {
      name = methods[i];
      func = obj[name];
      if (typeof func !== 'function') {
        throw new TypeError("utils.ensureLoginForMethods: method " + name + " not found");
      }
      results.push(obj[name] = _(utils.ensureLogin).bind(null, obj, func, loginContext, eventType));
    }
    return results;
  };

  Utility.prototype.facebookImageURL = function(fbId, type) {
    var accessToken, params;
    if (type == null) {
      type = 'square';
    }
    params = {
      type: type
    };
    if (mediator.user) {
      accessToken = mediator.user.get('accessToken');
      if (accessToken) {
        params.access_token = accessToken;
      }
    }
    return "https://graph.facebook.com/" + fbId + "/picture?" + ($.param(params));
  };

  return Utility;

})());

});

require.register("models/base/collection.coffee", function(exports, require, module) {
var Backbone, Collection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = require('backbone');

module.exports = Collection = (function(superClass) {
  extend(Collection, superClass);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  return Collection;

})(Backbone.Collection.extend({
  state: {}
}));

});

require.register("models/base/model.coffee", function(exports, require, module) {
var Backbone, Model,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = require('backbone');

module.exports = Model = (function(superClass) {
  extend(Model, superClass);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Backbone.Model.extend({
  state: {}
}));

});

require.register("models/navigation.coffee", function(exports, require, module) {
var Model, Navigation,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require('models/base/model');

'use strict';

module.exports = Navigation = (function(superClass) {
  extend(Navigation, superClass);

  function Navigation() {
    return Navigation.__super__.constructor.apply(this, arguments);
  }

  Navigation.prototype.defaults = {
    items: [
      {
        href: '/',
        title: 'Likes Browser'
      }, {
        href: '/posts',
        title: 'Wall Posts'
      }
    ]
  };

  return Navigation;

})(Model);

});

require.register("models/stories.coffee", function(exports, require, module) {
var Collection, Stories, Story,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Collection = require('models/base/collection', Story = require('models/story'));

'use strict';

Stories = (function(superClass) {
  extend(Stories, superClass);

  function Stories() {
    this.fetch = bind(this.fetch, this);
    return Stories.__super__.constructor.apply(this, arguments);
  }

  Stories.prototype.model = Story;

  Stories.prototype.initialize = function(someStories) {
    this.someStories = someStories;
    Stories.__super__.initialize.call(this);
    return this.fetch();
  };

  Stories.prototype.fetch = function() {
    return this.push(this.someStories);
  };

  return Stories;

})(Collection);

module.exports = {
  allStories: new Stories(allStories),
  myStories: new Stories(myStories),
  Class: Stories
};

});

require.register("models/story.coffee", function(exports, require, module) {
var Model, Story,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require('models/base/model');

'use strict';

module.exports = Story = (function(superClass) {
  extend(Story, superClass);

  function Story() {
    this.href = bind(this.href, this);
    return Story.__super__.constructor.apply(this, arguments);
  }

  Story.prototype.href = function(against) {
    var ref;
    if (against == null) {
      against = false;
    }
    ref = (this.get('category')) + "/" + (this.get('slug')) + ".html";
    ref = ref.replace(/\ /g, '_');
    if (!against || against === window.siteHandle) {
      return ref;
    }
    if (against.match('/')) {
      return against + "/" + ref;
    }
  };

  Story.prototype.initialize = function() {
    return Story.__super__.initialize.call(this);
  };

  return Story;

})(Model);

});

require.register("models/user.coffee", function(exports, require, module) {
var Model, User,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Model = require('models/base/model');

'use strict';

module.exports = User = (function(superClass) {
  extend(User, superClass);

  function User() {
    return User.__super__.constructor.apply(this, arguments);
  }

  return User;

})(Model);

});

require.register("routes.coffee", function(exports, require, module) {
'use strict';
var routes;

routes = function(match) {
  match('/', 'home#show');
  return match('showit', 'sidebar#showit');
};

module.exports = routes;

});

require.register("payload-/site.coffee", function(exports, require, module) {

/*
#global Pylon
 */
var SiteLook, T, _;

T = Pylon.Halvalla;

_ = Pylon.underscore;


/*
browser specific initialization code
 */

$(function() {});

module.exports = SiteLook = (function() {
  function SiteLook() {}

  SiteLook.prototype.widgetWrap = function() {
    var attrs, contents, id, ref, title;
    ref = T.normalizeArgs(arguments), attrs = ref.attrs, contents = ref.contents;
    id = attrs.id;
    delete attrs.id;
    title = attrs.title;
    delete attrs.title;
    return T.div('.Container.widget-wrap.p1.m1.border-bottom', attrs, function() {
      if (!!title) {
        T.h3(title);
      }
      return T.div('.pl2', function() {
        return contents;
      });
    });
  };

  return SiteLook;

})();

});

require.alias("buffer/index.js", "buffer");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.loglevel = require("loglevel");
window.jQuery = require("jquery");
window.fontFaceObserver = require("font-face-observer");


});})();require('___globals___');

