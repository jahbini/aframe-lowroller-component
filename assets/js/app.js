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
// vim: et:ts=2:sw=2:sts=2:nowrap
var $, B, T, V;

$ = require('jquery');

T = Pylon.Halvalla;

B = require('backbone');

// The very model of a button interface
//usage
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
      visual = T.render(() => {
        return T.button(`#${this.name}.${this.classes}.button-primary`, this.model.get('legend'));
      });
    } else {
      visual = T.render(() => {
        return T.button(`#${this.name}.${this.classes}.disabled`, {
          disabled: "disabled"
        }, this.model.get('legend'));
      });
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
    return this.set('trigger', `${this.name}:${trigger.replace(/ /g, '-').toLocaleLowerCase()}`);
  },
  initialize: function(name, classes = "three.columns") {
    this.name = name;
    Pylon.set(`button-${this.name}`, this);
    this.setTrigger();
    this.on("change:legend", this.setTrigger, this);
    this.view = new V(this, this.name, classes);
    this.view.setElement($(`#${this.name}`));
    this.on("change:enabled", this.view.render, this.view);
    return this;
  }
});

});

require.register("components/fibonacci.coffee", function(exports, require, module) {
var B, Fibonacci, T, Template, template,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

T = Pylon.Halvalla;

B = require('backbone');

//{  Panel, PanelHeader, Link } = Pylon.Rebass

//Panel = T.bless Panel
//Link = T.bless Link
//PanelHeader = T.bless PanelHeader
Template = require(`payload-/${siteHandle}.coffee`);

template = new Template(T);

module.exports = T.bless(Fibonacci = (function() {
  var Lozenge, ratioToPixels, rollSquare;

  class Fibonacci extends B.Model {
    constructor() {
      super(...arguments);
      this.view = this.view.bind(this);
    }

    view(vnode) {
      var collection, data, filter, intermediate, teacupContent;
      boundMethodCheck(this, Fibonacci);
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
    }

  };

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
      return T.div(`#last.bg-red.n-${n}.left`, {
        width: x,
        height: y,
        style: {
          minWidth: x + "px",
          minHeight: y + "px"
        }
      });
    }
    ({x, y, xpx, ypx} = px);
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
                WebkitTransform: `scale(${shrink})`,
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div(`#sq-${n}`, {
                onclick: `swap(${n})`
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
                WebkitTransform: `scale(${shrink})`,
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div(`#sq-${n}`, {
                onclick: `swap(${n})`
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
                WebkitTransform: `scale(${shrink})`,
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div(`#sq-${n}`, {
                onclick: `swap(${n})`
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
                WebkitTransform: `scale(${shrink})`,
                width: '711px',
                height: '711px'
              }
            }, function() {
              return T.div(`#sq-${n}`, {
                onclick: `swap(${n})`
              }, function() {
                return squareOptions[n].src;
              });
            });
          });
        }
      });
    }
  };

  return Fibonacci;

}).call(this));

});

require.register("components/sidebar-view.coffee", function(exports, require, module) {
var B, Sidebar, T, Template, template,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

T = Pylon.Halvalla;

B = require('backbone');

//{  Panel, PanelHeader, Link } = Pylon.Rebass

//Panel = T.bless Panel
//Link = T.bless Link
//PanelHeader = T.bless PanelHeader
Template = require(`payload-/${siteHandle}.coffee`);

template = new Template(T);

module.exports = T.bless(Sidebar = (function() {
  class Sidebar extends B.Model {
    constructor() {
      super(...arguments);
      this.clickHandler = this.clickHandler.bind(this);
      this.view = this.view.bind(this);
    }

    clickHandler(e) {
      var targ;
      boundMethodCheck(this, Sidebar);
      targ = e.currentTarget.parentNode.childNodes[1];
      if ("true" === targ.getAttribute("aria-expanded")) {
        targ.setAttribute('aria-expanded', false);
        targ.setAttribute('hidden', "hidden");
      } else {
        targ.setAttribute('aria-expanded', 'true');
        targ.removeAttribute('hidden');
      }
    }

    view(vnode) {
      var collection, data, filter, intermediate, teacupContent;
      boundMethodCheck(this, Sidebar);
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
      }, () => {
        var result;
        result = data.each((allCrap, category, stuff) => {
          var catPostfix, catPrefix, headliner, stories;
          if (category === '-') {
            return;
          }
          stories = stuff[category];
          catPostfix = category.match(/\/?[^\/]+$/);
          catPrefix = category.replace(/[^\/]/g, '');
          catPrefix = catPrefix.replace(/\//g, ' -');
          catPostfix = catPostfix.toString().replace(/\//g, '- ');
          return headliner = _(stories).find((story) => { //find index for this category
            var attrX, autoExpand;
            autoExpand = Object.keys(stuff).length < 4; //start with open if number of elements in this category is small
            attrX = {
              'aria-expanded': autoExpand,
              onclick: this.clickHandler,
              role: 'heading'
            };
            return T.div('.btn-group.btn-group-vertical', () => {
              var attrY;
              if (headliner) {
                T.button(".btn.btn-group.btn-outline-light.btn-block", attrX, () => {
                  return T.h5('', () => {
                    T.text(`${category}: `);
                    return T.em(".h6", _.sample(headliner.get('headlines')));
                  });
                });
              } else {
                T.button(".btn.btn-group.btn-outline-light.btn-block", attrX, () => {
                  return T.h6('', `${catPrefix} ${catPostfix}`);
                });
              }
              attrY = {
                'aria-expanded': autoExpand
              };
              if (!autoExpand) {
                attrY.hidden = 'hidden';
              }
              return T.section(".pr1.btn-group.btn-outline-light", attrY, () => {
                return T.ul(".my-2", () => {
                  return _(stuff[category]).each((story) => {
                    if ('category' === story.get('className')) {
                      return;
                    }
                    return T.li("", () => {
                      return T.a("", {
                        'color': 'white',
                        //bg: 'gray.8'
                        href: siteHandle === story.get('siteHandle') ? story.href() : story.href(story.get('siteHandle'))
                      }, `${story.get('title')}`);
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
      });
      return teacupContent;
    }

  };

  Sidebar.prototype.displayName = 'Sidebar';

  return Sidebar;

}).call(this));

});

require.register("components/storybar-view.coffee", function(exports, require, module) {
// put outbound links into story
var B, Storybar, T, siteBase, z;

T = Pylon.Halvalla;

B = require('backbone');

siteBase = topDomain.split('.');

z = siteBase.shift();

module.exports = T.bless(Storybar = (function() {
  class Storybar {
    constructor() {
      this.view = this.view.bind(this);
    }

    view(vnode) {
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
                return T.span(".u-text--quiet.u-text--highlight", `${story.get('title')}: ${(_.sample(story.get('headlines'))) || ''}`);
              });
            });
          });
        });
      });
    }

  };

  Storybar.prototype.displayName = 'Storybar';

  return Storybar;

}).call(this));

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
var BaseController;

module.exports = BaseController = class BaseController extends Chaplin.Controller {};

});

require.register("controllers/footer.coffee", function(exports, require, module) {
var BaseController, FooterController;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = FooterController = class FooterController extends BaseController {};

});

require.register("controllers/home.coffee", function(exports, require, module) {
var HomeController, PageController, log;

PageController = require('controllers/page');

log = require('loglevel');

'use strict';

module.exports = HomeController = class HomeController extends PageController {
  showit() {
    return false;
  }

  show() {
    return log.info('HomeController:show');
  }

};

});

require.register("controllers/menu.coffee", function(exports, require, module) {
var BaseController, MenuController;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = MenuController = class MenuController extends BaseController {};

});

require.register("controllers/page.coffee", function(exports, require, module) {
var BaseController, PageController;

BaseController = require('controllers/base/controller');

'use strict';

module.exports = PageController = class PageController extends BaseController {
  beforeAction(actionParams, controllerOptions) {
    Chaplin.mediator.controllerAction = controllerOptions.action;
    return Chaplin.mediator.actionParams = actionParams;
  }

};

});

require.register("initialize.coffee", function(exports, require, module) {

//routes = require 'routes'
var Backbone, Fibonacci, FontFaceObserver, Mithril, Palx, Pylon, PylonTemplate, Sidebar, Storybar, T, allStories, myStories, newColors, routes;

window.$ = jQuery;

window._ = require('lodash');

Backbone = require('backbone');

PylonTemplate = Backbone.Model.extend({
  //  state: (require './models/state.coffee').state
  Mithril: require('mithril'),
  //Mui: require 'mui'
  Mss: require('mss-js'),
  Halvalla: require('halvalla/lib/halvalla-mithril'),
  Palx: require('palx'),
  Utils: require('./lib/utils'),
  Underscore: require('underscore')
});

window.Pylon = Pylon = new PylonTemplate;

Pylon.Button = require('./components/button'); // Pylon is assumed to be a global for this guy

Pylon.on('all', function(event, ...rest) {
  var mim;
  mim = event.match(/((.*):.*):/);
  if (!mim || mim[2] !== 'systemEvent') {
    return null;
  }
  applogger(`event ${event}`);
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

// gather the global JSONs into Backbone collections 
({myStories, allStories} = require('models/stories'));

// suppress react styling
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
// Initialize the application on DOM ready event.
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
    //sidebarContents = T.Provider  theme: colors: newColors, Sidebar mine
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
var B, Link, Panel, PanelHeader, T;

T = Pylon.Halvalla;

B = require('backbone');

({Panel, PanelHeader, Link} = Pylon.Rebass);

/*  
Panel = T.bless Panel
Link = T.bless Link
PanelHeader = T.bless PanelHeader

module.exports.holyGrail = T.bless class HolyGrail extends React.Component

  render: ()=>
    options = _.pluck @props, 'user','navLinks','story','page'
    T.div '.o-grid.o-grid--full', ()->
      @props.header '.o-grid__cell',options
      T.div '.o-grid__cell',->
        T.div '.o-grid',->
          @props.left
        T.div '.o-grid__cell',->
          @props.middle
        T.div '.o-grid__cell',->
          @props.right
      @props.footer '.o-grid__cell',options

module.exports.Panel =   class Panel extends B.Model
  displayName: 'Panel'
  constructor: (@props)->
    @
  style: ()=>
      overflow: 'hidden'
      borderRadius: px @props.theme.radius
      borderWidth: px 1
      borderStyle: 'solid'
  view: ()=>
      T.div style: @style @props.style,children: @props.children

module.exports.PanelHeader =   class PanelHeader extends B.Model
  displayName: 'PanelHeader'
  constructor: (@vnode)->
    @props= f:2, p:2
    console.log "PanelHeader constructor",@vnode
    @

  style: (props)=>
    fontWeight: bold(props),
    borderBottomWidth: px(1),
    borderBottomStyle: 'solid',
  view: ()->
      T.crel 'Header', style: @style @vode.style

*/

});

;require.register("lib/utils.coffee", function(exports, require, module) {
  
  // utilities

var Pylon, Utility,
  hasProp = {}.hasOwnProperty;

Pylon = window.Pylon;

// Add additional application-specific properties and methods
module.exports = new (Utility = (function() {
  class Utility {
    // dashHelper -> dash-helper
    dasherize(string) {
      return string.replace(/[A-Z]/g, function(char, index) {
        return (index !== 0 ? '-' : '') + char.toLowerCase();
      });
    }

    // Cookie fallback
    // ---------------

    // Get a cookie by its name
    getCookie(key) {
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
    }

    // Set a session cookie
    setCookie(key, value, options = {}) {
      var expires, getOption, payload;
      payload = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      getOption = function(name) {
        if (options[name]) {
          return `; ${name}=${options[name]}`;
        } else {
          return '';
        }
      };
      expires = options.expires ? `; expires=${options.expires.toUTCString()}` : '';
      return document.cookie = [payload, expires, getOption('path'), getOption('domain'), getOption('secure')].join('');
    }

    expireCookie(key) {
      return document.cookie = `${key}=nil; expires=${(new Date).toGMTString()}`;
    }

    // Load additonal JavaScripts
    // --------------------------

    // We don’t use jQuery here because jQuery does not attach an error
    // handler to the script. In jQuery, a proper error handler only works
    // for same-origin scripts which can be loaded via XHR.
    loadLib(url, success, error, timeout = 7500) {
      var head, onload, script, timeoutHandle;
      head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
      script = document.createElement('script');
      script.async = 'async';
      script.src = url;
      onload = function(_, aborted = false) {
        if (!(aborted || !script.readyState || script.readyState === 'complete')) {
          return;
        }
        clearTimeout(timeoutHandle);
        // Handle memory leak in IE
        script.onload = script.onreadystatechange = script.onerror = null;
        if (head && script.parentNode) {
          // Remove the script elem and its reference
          head.removeChild(script);
        }
        script = void 0;
        if (success && !aborted) {
          return success();
        }
      };
      script.onload = script.onreadystatechange = onload;
      // This is what jQuery is missing
      script.onerror = function() {
        onload(null, true);
        if (error) {
          return error();
        }
      };
      timeoutHandle = setTimeout(script.onerror, timeout);
      return head.insertBefore(script, head.firstChild);
    }

    // Functional helpers for handling asynchronous dependancies and I/O
    // -----------------------------------------------------------------

    // Wrap methods so they can be called before a deferred is resolved.
    // The actual methods are called once the deferred is resolved.

    // Parameters:

    // Expects an options hash with the following properties:

    // deferred
    //   The Deferred object to wait for.

    // methods
    //   Either:
    //   - A string with a method name e.g. 'method'
    //   - An array of strings e.g. ['method1', 'method2']
    //   - An object with methods e.g. {method: -> alert('resolved!')}

    // host (optional)
    //   If you pass an array of strings in the `methods` parameter the methods
    //   are fetched from this object. Defaults to `deferred`.

    // target (optional)
    //   The target object the new wrapper methods are created at.
    //   Defaults to host if host is given, otherwise it defaults to deferred.

    // onDeferral (optional)
    //   An additional callback function which is invoked when the method is called
    //   and the Deferred isn't resolved yet.
    //   After the method is registered as a done handler on the Deferred,
    //   this callback is invoked. This can be used to trigger the resolving
    //   of the Deferred.

    // Examples:

    // deferMethods(deferred: def, methods: 'foo')
    //   Wrap the method named foo of the given deferred def and
    //   postpone all calls until the deferred is resolved.

    // deferMethods(deferred: def, methods: def.specialMethods)
    //   Read all methods from the hash def.specialMethods and
    //   create wrapped methods with the same names at def.

    // deferMethods(
    //   deferred: def, methods: def.specialMethods, target: def.specialMethods
    // )
    //   Read all methods from the object def.specialMethods and
    //   create wrapped methods at def.specialMethods,
    //   overwriting the existing ones.

    // deferMethods(deferred: def, host: obj, methods: ['foo', 'bar'])
    //   Wrap the methods obj.foo and obj.bar so all calls to them are postponed
    //   until def is resolved. obj.foo and obj.bar are overwritten
    //   with their wrappers.

    deferMethods(options) {
      var deferred, func, host, i, len, methods, methodsHash, name, onDeferral, results, target;
      // Process options
      deferred = options.deferred;
      methods = options.methods;
      host = options.host || deferred;
      target = options.target || host;
      onDeferral = options.onDeferral;
      // Hash with named functions
      methodsHash = {};
      if (typeof methods === 'string') {
        // Transform a single method string into an object
        methodsHash[methods] = host[methods];
      } else if (methods.length && methods[0]) {
// Transform a method list into an object
        for (i = 0, len = methods.length; i < len; i++) {
          name = methods[i];
          func = host[name];
          if (typeof func !== 'function') {
            throw new TypeError(`utils.deferMethods: method ${name} not found on host ${host}`);
          }
          methodsHash[name] = func;
        }
      } else {
        // Treat methods parameter as a hash, no transformation
        methodsHash = methods;
      }
      results = [];
      for (name in methodsHash) {
        if (!hasProp.call(methodsHash, name)) continue;
        func = methodsHash[name];
        if (typeof func !== 'function') {
          // Ignore non-function properties
          continue;
        }
        // Replace method with wrapper
        results.push(target[name] = utils.createDeferredFunction(deferred, func, target, onDeferral));
      }
      return results;
    }

    // Creates a function which wraps `func` and defers calls to
    // it until the given `deferred` is resolved. Pass an optional `context`
    // to determine the this `this` binding of the original function.
    // Defaults to `deferred`. The optional `onDeferral` function to after
    // original function is registered as a done callback.
    createDeferredFunction(deferred, func, context = deferred, onDeferral) {
      return function() {        // Return a wrapper function
        var args;
        // Save the original arguments
        args = arguments;
        if (deferred.state() === 'resolved') {
          // Deferred already resolved, call func immediately
          return func.apply(context, args);
        } else {
          // Register a done handler
          deferred.done(function() {
            return func.apply(context, args);
          });
          // Invoke the onDeferral callback
          if (typeof onDeferral === 'function') {
            return onDeferral.apply(context);
          }
        }
      };
    }

    // Turns methods into accumulators, collecting calls and sending
    // them out in intervals
    // obj
    //   the object the methods are read from and written to
    // methods
    //   zero or more names (strings) of methods (object members) to be wrapped
    wrapAccumulators(obj, methods) {
      var func, i, len, name;
// Replace methods
      for (i = 0, len = methods.length; i < len; i++) {
        name = methods[i];
        func = obj[name];
        if (typeof func !== 'function') {
          throw new TypeError(`utils.wrapAccumulators: method ${name} not found`);
        }
        // Replace method
        obj[name] = utils.createAccumulator(name, obj[name], obj);
      }
      // Bind to unload to synchronously flush accumulated remains
      return $(window).unload(() => {
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
      });
    }

    // Returns an accumulator for the given 'func' with the
    // parameter list (data, success, error, options)
    createAccumulator(name, func, context) {
      var acc, accumulatedError, accumulatedSuccess, cleanup, id;
      // Create a unique ID for the function, save it as a
      // property of the function object
      if (!(id = func.__uniqueID)) {
        id = func.__uniqueID = name + String(Math.random()).replace('.', '');
      }
      acc = utils.accumulator;
      // Cleanup data
      cleanup = function() {
        delete acc.collectedData[id];
        delete acc.successHandlers[id];
        return delete acc.errorHandlers[id];
      };
      // Create accumulated success and error callbacks
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
      // Resulting function
      return function(data, success, error, ...rest) {
        var handler;
        // Store data, success and error handlers
        if (data) {
          acc.collectedData[id] = (acc.collectedData[id] || []).concat(data);
        }
        if (success) {
          acc.successHandlers[id] = (acc.successHandlers[id] || []).concat(success);
        }
        if (error) {
          acc.errorHandlers[id] = (acc.errorHandlers[id] || []).concat(error);
        }
        // Set timeout if not already set
        if (acc.handles[id]) {
          return;
        }
        handler = function(options = options) {
          var args, collectedData;
          if (!(collectedData = acc.collectedData[id])) {
            return;
          }
          // Call the original function
          args = [collectedData, accumulatedSuccess, accumulatedError].concat(rest);
          func.apply(context, args);
          // Clear timeout
          clearTimeout(acc.handles[id]);
          // Remove handles and handlers
          delete acc.handles[id];
          return delete acc.handlers[id];
        };
        // Save the handler
        acc.handlers[id] = handler;
        // Wrap handler in additional function to ignore
        // Firefox' latency arguments
        return acc.handles[id] = setTimeout((function() {
          return handler();
        }), acc.interval);
      };
    }

    // Call the given function `func` when the global event `eventType` occurs.
    // Defaults to 'login', so the `func` is called when
    // the user has successfully logged in.
    // When the function is called, `this` points to the given `context`.
    // You may pass a `loginContext` for the UI context where
    // the login was triggered.
    afterLogin(context, func, eventType = 'login', ...args) {
      var loginHandler;
      if (mediator.user) {
        // All fine, just pass through
        return func.apply(context, args);
      } else {
        // Register a handler for the given event
        loginHandler = function() {
          // Cleanup
          mediator.unsubscribe(eventType, loginHandler);
          // Pass to wrapped function
          return func.apply(context, args);
        };
        return mediator.subscribe(eventType, loginHandler);
      }
    }

    deferMethodsUntilLogin(obj, methods, eventType = 'login') {
      var func, i, len, name, results;
      if (typeof methods === 'string') {
        methods = [methods];
      }
      results = [];
      for (i = 0, len = methods.length; i < len; i++) {
        name = methods[i];
        func = obj[name];
        if (typeof func !== 'function') {
          throw new TypeError(`utils.deferMethodsUntilLogin: method ${name} not found`);
        }
        results.push(obj[name] = _(utils.afterLogin).bind(null, obj, func, eventType));
      }
      return results;
    }

    // Delegates to afterLogin, but triggers the login dialog if the user
    // isn't logged in
    // and calls preventDefault if an event object is passed.
    ensureLogin(context, func, loginContext, eventType = 'login', ...args) {
      var e;
      utils.afterLogin(context, func, eventType, ...args);
      if (!mediator.user) {
        // If an event is passed to the original function, prevent the
        // default action
        if ((e = args[0]) && typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        // Start login process
        return mediator.publish('!showLogin', loginContext);
      }
    }

    // Wrap methods which need a logged-in user.
    // Trigger the login when they are called and there is no user.
    // Arguments:
    // `obj`: The object whose methods should be wrapped
    // `methods`: A string or an array of strings with method names
    // `loginContext`: object with login context information, should have
    //                 a `description` property
    // `eventType`: The global PubSub event the actual method call will wait for.
    //              Defaults to 'login'.
    ensureLoginForMethods(obj, methods, loginContext, eventType = 'login') {
      var func, i, len, name, results;
      if (typeof methods === 'string') {
        // Transform a single method string into a list
        methods = [methods];
      }
      results = [];
      for (i = 0, len = methods.length; i < len; i++) {
        name = methods[i];
        func = obj[name];
        if (typeof func !== 'function') {
          throw new TypeError(`utils.ensureLoginForMethods: method ${name} not found`);
        }
        results.push(obj[name] = _(utils.ensureLogin).bind(null, obj, func, loginContext, eventType));
      }
      return results;
    }

    // Facebook image helper
    // ---------------------
    facebookImageURL(fbId, type = 'square') {
      var accessToken, params;
      // Create query string
      params = {
        type: type
      };
      // Add the Facebook access token if present
      if (mediator.user) {
        accessToken = mediator.user.get('accessToken');
        if (accessToken) {
          params.access_token = accessToken;
        }
      }
      return `https://graph.facebook.com/${fbId}/picture?${$.param(params)}`;
    }

  };

  // String helpers
  // --------------

  // camel-case-helper > camelCaseHelper
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

  // Persistent data storage
  // -----------------------

  // sessionStorage with session cookie fallback
  // sessionStorage(key) gets the value for 'key'
  // sessionStorage(key, value) set the value for 'key'
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

  // sessionStorageRemove(key) removes the storage entry for 'key'
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

  // Accumulators
  Utility.prototype.accumulator = {
    collectedData: {},
    handles: {},
    handlers: {},
    successHandlers: {},
    errorHandlers: {},
    interval: 2000
  };

  return Utility;

}).call(this));

});

require.register("models/base/collection.coffee", function(exports, require, module) {
var Backbone, Collection;

Backbone = require('backbone');

module.exports = Collection = class Collection extends Backbone.Collection.extend({
    state: {}
  }) {};

// Place your application-specific collection features here

});

;require.register("models/base/model.coffee", function(exports, require, module) {

var Backbone, Model;

Backbone = require('backbone');

module.exports = Model = class Model extends Backbone.Model.extend({
    state: {}
  }) {};

// Place your application-specific model features here

});

;require.register("models/navigation.coffee", function(exports, require, module) {
var Model, Navigation;

Model = require('models/base/model');

'use strict';

module.exports = Navigation = (function() {
  class Navigation extends Model {};

  Navigation.prototype.defaults = {
    items: [
      {
        href: '/',
        title: 'Likes Browser'
      },
      {
        href: '/posts',
        title: 'Wall Posts'
      }
    ]
  };

  return Navigation;

}).call(this);

});

require.register("models/stories.coffee", function(exports, require, module) {
var Collection, Stories, Story,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

Collection = require('models/base/collection', Story = require('models/story'));

//allStories is global, as is myStories
'use strict';

Stories = (function() {
  class Stories extends Collection {
    constructor() {
      super(...arguments);
      this.fetch = this.fetch.bind(this);
    }

    initialize(someStories) {
      this.someStories = someStories;
      super.initialize();
      //@subscribeEvent 'login', @fetch
      //@subscribeEvent 'logout', @logout
      return this.fetch();
    }

    fetch() {
      boundMethodCheck(this, Stories);
      return this.push(this.someStories);
    }

  };

  // Stories are local,, so no need to Mix in a SyncMachine
  //_.extend @prototype, Chaplin.SyncMachine
  Stories.prototype.model = Story;

  return Stories;

}).call(this);

module.exports = {
  allStories: new Stories(allStories),
  myStories: new Stories(myStories),
  Class: Stories
};

});

require.register("models/story.coffee", function(exports, require, module) {
var Model, Story,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

Model = require('models/base/model');

'use strict';

module.exports = Story = class Story extends Model {
  constructor() {
    super(...arguments);
    this.href = this.href.bind(this);
  }

  href(against = false) {
    var ref;
    boundMethodCheck(this, Story);
    ref = `${this.get('category')}/${this.get('slug')}.html`;
    ref = ref.replace(/\ /g, '_');
    if (!against || against === window.siteHandle) {
      return ref;
    }
    if (against.match('/')) {
      return `${against}/${ref}`;
    }
  }

  initialize() {
    return super.initialize();
  }

};

});

require.register("models/user.coffee", function(exports, require, module) {
var Model, User;

Model = require('models/base/model');

'use strict';

module.exports = User = class User extends Model {};

// This model is intentionally left blank

});

;require.register("routes.coffee", function(exports, require, module) {
'use strict';
var routes;

routes = function(match) {
  match('/', 'home#show');
  return match('showit', 'sidebar#showit');
};

module.exports = routes;

});

require.register("payload-/lowroller.coffee", function(exports, require, module) {
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


// this widget fills in the page
//run me when the window and document are ready, mr. jQuery
module.exports = SiteLook = class SiteLook {
  widgetWrap() {
    var attrs, contents, id, title;
    ({attrs, contents} = T.normalizeArgs(arguments));
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
  }

};

});

require.alias("buffer/index.js", "buffer");
require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  

// Auto-loaded modules from config.npm.globals.
window.loglevel = require("loglevel");
window.jQuery = require("jquery");
window.fontFaceObserver = require("font-face-observer");


});})();require('___globals___');

