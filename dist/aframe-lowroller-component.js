/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// Generated by CoffeeScript 2.3.1
(function() {
  /* 
  var CANNON = require('cannon');
  */
  /**
   * A tetraForcer, connecting two bodies by four tetrahedral anchors.
   *
   * @class TetraForcer
   * @constructor
   * @param {Body} outie
   * @param {Body} innie
   * @param {Object} [options]
   */
  /*
  * Convert a local body point to world frame.
  * @method pointToWorldFrame
  * @param  {Vec3} localPoint
  * @param  {Vec3} result
  * @return {Vec3}
   */
  var C, CANNON, PID, TetraForcer, V2A, coordinates, dLay, debug, innieCounter, innieID, isCoordinates, pointToWorldFrame, setEverything;

  //global window

  CANNON = window.CANNON;

  PID = class PID {
    /*
    the PID style of controller is intended to track a quantity from the real world as detected by some sensor.
    The sensor is assumed to be reliable as possible, consistent and acccurate.
    the output of the controller is a single quantity that controls a single output device.
    The output device is related in some fashion to changes in the real world that affect the sensor.
    A PID controller ses the input values to compte an output variable by looking at three internally 
    computed quantities.
    1) the Proportial component, which simply is related to "How far away from our goal are we?"
    2) the Integral component, which is related to "How far have we come to our goal?"
    3) the Differential component, which asks "are we taking big steps, or tiny ones?"
    */
    constructor(options) {
      // set defaults

      // PID constants
      this.proportionalParm = 1;
      this.integrationParm = 0;
      this.derivativeParm = 0;
      // Interval of time between two updates
      // If not set, it will be automatically calculated
      this.dt = 0;
      // Maximum absolute value of sumDelta
      this.integrationLimit = 0;
      // now override with updates
      this.setParms(options);
      this.reset(); // clear internal history
      return;
    }

    setParms(options) {
      if (options.p) {
        this.proportionalParm = options.p;
      }
      if (options.i) {
        this.integrationParm = options.i;
      }
      if (options.d) {
        this.derivativeParm = options.d;
      }
      if (options.dt) {
        this.dt = options.dt;
      }
      if (options.integrationLimit) {
        this.integrationLimit = options.integrationLimit;
      }
    }

    toString() {
      return `P: ${this.proportionalParm} - I: ${this.integrationParm} - D: ${this.derivativeParm}`;
    }

    setTarget(target) {
      this.target = target;
      this.lastTime = Date.now(); // used only if dt is not explicit
    }

    update(currentValue) {
      var currentTime, dDelta, delta, dt, ref, sumSign;
      this.currentValue = currentValue;
      
      // Calculate dt
      dt = this.dt;
      if (!dt) {
        currentTime = Date.now();
        dt = (currentTime - this.lastTime) / 1000; // in seconds
        this.lastTime = currentTime;
      }
      if (typeof dt !== 'number' || dt === 0) {
        dt = 1;
      }
      delta = this.target - this.currentValue; //used as the Proportional factor
      this.sumDelta = this.sumDelta * 0.9 + delta * dt; //used as the Integral factor
      if ((0 < (ref = this.integrationLimit) && ref < Math.abs(this.sumDelta))) { //if there is an integration limit, check it
        sumSign = this.sumDelta > 0 ? 1 : -1;
        this.sumDelta = sumSign * this.integrationLimit; // activate the caller's failsafe quantity
      }
      dDelta = (delta - this.lastDelta) / dt; // used as the Derivitive factor
      this.lastDelta = delta;
      return (this.proportionalParm * delta) + (this.integrationParm * this.sumDelta) + (this.derivativeParm * dDelta);
    }

    reset() {
      this.sumDelta = 0;
      this.lastDelta = 0;
      this.setTarget(0);
    }

  };

  pointToWorldFrame = function(body, localPoint, result = new CANNON.Vec3()) {
    body.quaternion.vmult(localPoint, result);
    result.vadd(body.position, result);
    return result;
  };

  TetraForcer = (function() {
    var Vec3, nullPoint, nullVector;

    class TetraForcer {
      constructor(outie, innie1, options = {}) {
        var Vec3, i, j, p;
        this.outie = outie;
        this.innie = innie1;
        p = options.pid || {};
        p.p = p.p || 40;
        p.i = p.i || 40;
        p.d = p.d || 0.4;
        this.pIDs = [];
        for (i = j = 0; j <= 3; i = ++j) {
          this.pIDs.push(new PID(p));
        }
        /**
         * min force
         * resting force
         * @property minForce
         * @type {number}
         */
        this.minForce = options.minForce || 10;
        // springs and TetraForcers do not have equations, they add forces directly 
        this.equations = [];
        Vec3 = CANNON.Vec3;
        this.temps = {
          tetW: new Vec3(),
          forcePositionW: new Vec3(),
          tetraVector: new Vec3(),
          innieAttachPointW: new Vec3(),
          seekPositionL: new Vec3(),
          seekPositionW: new Vec3(),
          pursueVector: new Vec3()
        };
        return;
      }

      update(options = {}) {
        var i, j, len, ref;
        if (options.debug) {
          //debugger
          /**
           * debug by showning marker and computed forces
           */
          this.debug = options.debug;
        }
        /**
         * Proportional, Integral, Differential parameters
         * @property pid
         * @type {object}
         */
        if (options.pid) {
          ref = this.pIDs;
          for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            i.setParms(options.pid);
          }
        }
      }

      toString() {
        return this.pIDs[0].toString();
      }

      /**
       * Set the anchor point on body A, using world coordinates.
       * @method setWorldAnchorA
       * @param {Vec3} worldAnchorA
       */
      setWorldAnchorA(worldAnchorA) {
        this.outie.pointToLocalFrame(worldAnchorA, this.localAnchorA);
      }

      /**
       * Set the anchor point on body B, using world coordinates.
       * @method setWorldAnchorB
       * @param {Vec3} worldAnchorB
       */
      setWorldAnchorB(worldAnchorB) {
        this.innie.pointToLocalFrame(worldAnchorB, this.localAnchorB);
      }

      /**
       * Get the anchor point on body A, in world coordinates.
       * @method getWorldAnchorA
       * @param {Vec3} result The vector to store the result in.
       */
      getWorldAnchorA(result) {
        pointToWorldFrame(this.outie, this.localAnchorA, result);
      }

      /**
       * Get the anchor point on body B, in world coordinates.
       * @method getWorldAnchorB
       * @param {Vec3} result The vector to store the result in.
       */
      getWorldAnchorB(result) {
        pointToWorldFrame(this.innie, this.localAnchorB, result);
      }

      /**
       * Apply the linearMotor force to the connected bodies.
       * @method applyForce
       */
      update() {
        var adjust, direction, dt, force, inf, innieID, j, len, otf, outieLimitW, pursue, ref, tetToInnieDistance, tetToSeekDistance, tetraStruct;
        dt = 0.0166;
        // where is the pursuit in local coordinates?
        // the low-roller centric position we want to place innie's body
        // must be within outie (outie)
        pursue = this.outie.el.pursuit();
        outieLimitW = this.outie.radius * 0.9; //exactly where is on this hull
        // find the internal seek position in world coordinates
        pursue.vsub(this.outie.position, this.temps.pursueVector);
        this.temps.pursueVector.normalize();
        this.temps.pursueVector.scale(outieLimitW, this.temps.pursueVector);
        this.outie.position.vadd(this.temps.pursueVector, this.temps.seekPositionW);
        //convert the new innie desired position to Outie local coordinates
        this.outie.pointToLocalFrame(this.temps.seekPositionW, this.temps.seekPositionL);
        if (this.type === 'tetraPositioner') { // HACK JAH
          // we move the innie as if it were a static component
          // and apply innie's gravitational force to outie's magic innie position
          this.innie.position.copy(this.outie.pointToWorldFrame(this.temps.seekPositionL));
          this.innie.velocity.copy(this.innie.initVelocity);
          this.outie.applyForce(new Vec3(0, -9.6 * this.innie.mass, 0.1), this.innie.position.vsub(this.outie.position));
          return;
        }
        ref = this.outie.tetraPoints;
        
        //debugger
        for (j = 0, len = ref.length; j < len; j++) {
          tetraStruct = ref[j];
          tetraStruct.cannonLocal.scale(this.outie.radius, this.temps.tetW);
          pointToWorldFrame(this.outie, this.temps.tetW, this.temps.tetW);
          pointToWorldFrame(this.innie, nullPoint, this.temps.innieAttachPointW);
          this.temps.tetW.vsub(this.innie.position, this.temps.tetraVector);
          tetToSeekDistance = this.temps.tetW.distanceTo(this.temps.seekPositionW);
          tetToInnieDistance = this.temps.tetW.distanceTo(this.innie.position);
          force = this.minForce * this.innie.mass;
          adjust = (this.innie.mass + this.outie.mass) * this.pIDs[tetraStruct.index].update(tetToSeekDistance - tetToInnieDistance);
          force += adjust;
          this.temps.tetraVector.normalize();
          this.temps.tetraVector.scale(force, this.temps.tetraVector);
          this.temps.innieAttachPointW.vsub(this.innie.position, this.temps.forcePositionW);
          this.innie.applyForce(this.temps.tetraVector, this.temps.forcePositionW);
          this.temps.tetraVector.scale(-1, this.temps.tetraVector);
          this.temps.tetW.vsub(this.outie.position, this.temps.forcePositionW);
          this.outie.applyForce(this.temps.tetraVector, this.temps.forcePositionW);
          if (!this.debug) {
            continue;
          }
          innieID = this.innie.el.id;
          inf = document.querySelector(`#${innieID}__marker`);
          inf.setAttribute("position", this.temps.seekPositionW);
          inf = document.querySelector(`#${innieID}__innieForce__${tetraStruct.index}`);
          inf.setAttribute("position", this.innie.position);
          this.temps.tetraVector.normalize();
          direction = this.temps.tetraVector;
          inf.setAttribute("arrow", `direction: ${direction.x} ${direction.y} ${direction.z}; length: ${force / 10}`);
          otf = document.querySelector(`#${innieID}__outieForce__${tetraStruct.index}`);
          otf.setAttribute("position", this.temps.tetW);
          otf.setAttribute("arrow", `direction: ${-1 * direction.x} ${-1 * direction.y} ${-1 * direction.z}; length: ${force / 10}`);
        }
      }

    };

    Vec3 = CANNON.Vec3;

    nullVector = nullPoint = new Vec3();

    return TetraForcer;

  }).call(this);

  /*
   * Register the component with the A-Frame system
   * decode and pass options along
   *
   */
  AFRAME.registerComponent('tetra-motor', {
    multiple: false,
    schema: {
      type: {
        oneOf: ['tetraPositioner', 'tetraForcer'],
        default: 'tetraForcer'
      },
      debug: {
        type: 'boolean',
        default: false
      },
      target: {
        type: 'selector'
      },
      minForce: {
        default: 10,
        min: 0
      },
      maxForce: {
        default: 1e6,
        min: 0
      },
      collideConnected: {
        default: true
      },
      wakeUpBodies: {
        default: true
      },
      pid: {
        parse: function(v) {
          var a, d, i, p;
          if (typeof v === 'object') {
            p = v.p || 20;
            i = v.i || 10;
            d = v.d || 1;
          }
          if (typeof v === 'string') {
            p = 20;
            i = 10;
            d = 1;
            v = v.toLowerCase();
            v = v.replace(/,+/g, ' ');
            v = v.replace(/\s+/g, ' ');
            if (a = v.match(/p:\s*(-?[\d.]+)/)) {
              p = a[1];
            }
            if (a = v.match(/i:\s*(-?[\d.]+)/)) {
              i = a[1];
            }
            if (a = v.match(/d:\s*(-?[\d.]+)/)) {
              d = a[1];
            }
          }
          return {p, i, d};
        },
        default: {
          p: 20,
          i: 10,
          d: 1
        },
        toString: function(v) {
          return `p: ${v.p}, i: ${v.i}, d: ${v.d}`;
        }
      },
      restLength: {
        type: 'number',
        default: 0
      },
      localAnchor: {
        type: 'vec3',
        default: {
          x: 0,
          y: 0,
          z: 0
        }
      },
      localTarget: {
        type: 'vec3',
        default: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    },
    init: function() {
      this.system = this.el.sceneEl.systems.physics;
      this.constraint = null;
    },
    // return the current PID parameters
    toString: function() {
      return this.constraint.toString();
    },
    remove: function() {
      if (!this.constraint) {
        return;
      }
      this.system.removeConstraint(this.constraint);
      this.constraint = null;
    },
    setPID: function(data) {
      var e, j, len, ref;
      ref = this.constraint.pIDs;
      for (j = 0, len = ref.length; j < len; j++) {
        e = ref[j];
        e.setParms(data);
      }
    },
    update: function() {
      var data, el, ref;
      el = this.el;
      data = this.data;
      this.remove();
      if (!el.body || !((ref = data.target) != null ? ref.body : void 0)) {
        (el.body ? data.target : el).addEventListener('body-loaded', this.update.bind(this, {}));
        return;
      }
      this.constraint = this.createConstraint();
      this.system.addConstraint(this.constraint);
    },
    createConstraint: function() {
      var constraint, data, lA, lB;
      constraint = void 0;
      data = this.data;
      constraint = void 0;
      switch (data.type) {
        case 'tetraForcer':
        case 'tetraPositioner':
          lA = this.data.localAnchor;
          lB = this.data.localTarget;
          constraint = new TetraForcer(this.el.body, data.target.body, {
            pid: {
              p: data.pid.p,
              i: data.pid.i,
              d: data.pid.d,
              dt: 0.016
            },
            debug: data.debug,
            minForce: this.data.minForce
          });
          constraint.type = data.type;
          break;
        default:
          throw new Error('[constraint] Unexpected type: ' + data.type);
      }
      return constraint;
    }
  });

  setEverything = function(e, attributes, hash = {}) {
    var a, v;
    for (a in attributes) {
      v = attributes[a];
      e.setAttribute(a, v);
    }
    for (a in hash) {
      v = hash[a];
      e[a] = v;
    }
    if (e.updateProperties != null) {
      e.updateProperties();
    }
  };

  innieCounter = 0;

  innieID = function() {
    return `innie__${++innieCounter}`;
  };

  dLay = function(f) {
    return setTimeout(f, 0);
  };

  V2A = function(position) {
    return `${position.x} ${position.y} ${position.z}`;
  };

  C = function(x = 0, y = 0, z = 0) {
    return new CANNON.Vec3(x, y, z);
  };

  debug = AFRAME.utils.debug;

  coordinates = AFRAME.utils.coordinates;

  isCoordinates = coordinates.isCoordinates || coordinates.isCoordinate;

  AFRAME.registerComponent('lowroller', {
    schema: {
      inner: {
        type: 'number',
        default: 9
      },
      outer: {
        type: 'number',
        default: 1
      },
      debug: {
        type: 'boolean',
        default: false
      },
      pid: {
        default: {
          p: 20,
          i: 10,
          d: 1
        },
        parse: function(v) {
          var a, d, i, p;
          if (typeof v === 'object') {
            p = v.p || 200;
            i = v.i || 100;
            d = v.d || 1;
          }
          if (typeof v === 'string') {
            p = 20;
            i = 10;
            d = 1;
            v = v.toLowerCase();
            v = v.replace(/,+/g, ' ');
            v = v.replace(/\s+/g, ' ');
            if (a = v.match(/p:\s*(-?[\d.]+)/)) {
              p = a[1];
            }
            if (a = v.match(/i:\s*(-?[\d.]+)/)) {
              i = a[1];
            }
            if (a = v.match(/d:\s*(-?[\d.]+)/)) {
              d = a[1];
            }
          }
          return {p, i, d};
        }
      },
      type: {
        oneOf: ['tetraPositioner', 'tetraForcer'],
        default: 'tetraForcer'
      },
      pursuit: {
        default: 'self',
        parse: function(value) {
          // A static position to look at.
          if (isCoordinates(value) || typeof value === 'object') {
            return coordinates.parse(value);
          }
          // A selector to a target entity.
          return value;
        },
        stringify: function(data) {
          if (typeof data === 'object') {
            return coordinates.stringify(data);
          }
          return data;
        }
      }
    },
    controlPoints: [],
    /*
    iterate over the four tetrahedral control points
    */
    accessControlPoints: function(f) {
      var element, j, len, ref, results;
      ref = this.controlPoints;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        element = ref[j];
        results.push(f(element));
      }
      return results;
    },
    /*
    setPursuit aims the low-roller at this xy destination
    */
    setPursuit: function(p) {
      var m, targetEl;
      if (!this.el.body) {
        this.el.addEventListener('body-loaded', (event) => {
          return this.setPursuit(p);
        });
        return;
      }
      // we record our current position for idle or self
      this.pursuitVector.copy(this.el.body.position);
      this.el.pursuit = () => {
        return this.pursuitVector;
      };
      if (p === 'self' || p === 'idle') {
        return;
      }
      if (typeof p === 'object') {
        this.pursuitVector.copy({
          x: p.x,
          y: 0,
          z: p.y
        });
        return;
      }
      if (m = p.trim().match(/(-?[\d.]+)[,\s]+(-?[\d.]+)([,\s]+(-?[\d.]+))?/)) {
        this.pursuitVector.copy({
          x: m[1],
          y: 0,
          z: m[2]
        });
        return;
      }
      targetEl = this.el.sceneEl.querySelector(p);
      if (!targetEl) {
        return;
      }
      if (!targetEl.hasLoaded) {
        targetEl.addEventListener('loaded', () => {
          this.setPursuit(p);
        });
        return;
      }
      if (targetEl.body) {
        this.el.pursuit = function() {
          return targetEl.body.position;
        };
        return;
      }
      this.el.pursuit = () => {
        this.pursuitVector.copy(targetEl.object3D.position);
        return this.pursuitVector;
      };
    },
    /*
    Initialization
    */
    init: function() {
      /*
      create inner sphere
      */
      var colors, data, innie, marker, position, radius, scale, tetrahedralDescription, v;
      this.initRuntime = true;
      tetrahedralDescription = [];
      (function() {
        var j, k, len, len1, r, y, z;
        r = [1, -1];
        for (j = 0, len = r.length; j < len; j++) {
          z = r[j];
          for (k = 0, len1 = r.length; k < len1; k++) {
            y = r[k];
            tetrahedralDescription.push({
              p: new THREE.Vector3(z * y, y, z),
              normed: (new THREE.Vector3(z * y, y, z)).normalize(),
              raw: [z * y, y, z],
              cannonLocal: (C(z * y, y, z)).unit(),
              index: tetrahedralDescription.length,
              flip: 1
            });
          }
        }
      })();
      /*
      tetrahedron init
      */
      this.tetrahedralDescription = tetrahedralDescription;
      data = this.data;
      this.pursuitVector = C();
      this.setPursuit(this.data.pursuit);
      radius = this.el.components.geometry.data.radius;
      scale = this.el.components.geometry.data.scale;
      this.totalMass = data.inner + data.outer;
      position = this.el.components.position.data;
      this.el.addEventListener('body-loaded', (event) => {
        var body;
        body = event.currentTarget.body;
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        body.quaternion = body.initQuaternion;
        body.radius = this.el.components.geometry.data.radius;
        body.tetraPoints = tetrahedralDescription;
        body.updateProperties();
      });
      /*
      Outer sphere physics attributes
      */
      this.el.setAttribute('dynamic-body', `shape:'sphere'; sphereRadius:${radius}; mass: ${data.outer}; linearDamping: 0.5; angularDamping: 0.91;`);
      this.el.setAttribute("geometry", `primitive: sphere; radius: ${radius}`);
      innie = document.createElement('a-sphere');
      innie.id = innieID();
      this.myInnieID = innieCounter;
      innie.setAttribute('radius', `${data.outer / this.totalMass}`);
      innie.setAttribute("position", position);
      innie.setAttribute('dynamic-body', `shape:'sphere'; sphereRadius: ${data.outer / this.totalMass}; mass: ${data.inner}; linearDamping: 0.5; angularDamping: 0.5`);
      this.innie = innie;
      this.innie.addEventListener('body-loaded', (event) => {
        var body;
        body = event.currentTarget.body;
        body.collisionResponse = true;
        body.collisionFilterGroup = 2;
        body.collisionFilterMask = 1;
        body.updateProperties();
      });
      this.el.parentElement.insertBefore(innie, this.el);
      /*
      create tetrahedron
      */
      //tet = document.createElement 'a-tetrahedron'
      //tet.setAttribute 'physics',"mass:0; shape:'sphere'; sphereRadius: 0.1; collisionResponse: false"
      //tet.setAttribute 'material','wireframe:true'
      //tet.setAttribute 'radius',"#{radius}"
      //@.el.appendChild tet
      //@.tet = tet
      /*
      create tetrahedral support points
      */
      this.controlPoints = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = tetrahedralDescription.length; j < len; j++) {
          v = tetrahedralDescription[j];
          results.push(Object.assign({}, v));
        }
        return results;
      })();
      this.myPoints = this.accessControlPoints((e) => {
        var mPivotPoint, p2, pivotPoint;
        pivotPoint = V2A(e.normed.multiplyScalar(radius));
        mPivotPoint = V2A(e.normed.multiplyScalar(-radius));
        p2 = V2A(e.normed.multiplyScalar(-radius));
      });
      // build up the force vectors on the anchor points
      if (data.debug) {
        marker = document.createElement('a-sphere');
        marker.id = `${innie.id}__marker`;
        marker.setAttribute("position", "0 0 0");
        marker.setAttribute("radius", "0.05");
        marker.setAttribute("color", "black");
        this.el.parentElement.insertBefore(marker, this.el);
        //T.tag "a-sphere", "#marker", position: "0 0 0", radius: "0.1", color: "black"
        colors = ["#fff", "#f88", "#8F8", "#88F"];
        this.accessControlPoints((e) => {
          var iVector;
          iVector = document.createElement('a-entity');
          iVector.setAttribute('arrow', `direction: 1 1 1; length:1; color: ${colors[e.index]}`);
          iVector.id = `${this.innie.id}__innieForce__${e.index}`;
          this.el.parentElement.insertBefore(iVector, this.el);
          iVector = document.createElement('a-entity');
          iVector.setAttribute('arrow', `direction: 1 1 1; length:1; color: ${colors[e.index]}`);
          iVector.id = `${this.innie.id}__outieForce__${e.index}`;
          return this.el.parentElement.insertBefore(iVector, this.el);
        });
      }
      this.el.setAttribute("tetra-motor", {
        target: `#${this.innie.id}`,
        minForce: 15,
        type: data.type,
        debug: data.debug,
        pid: data.pid
      });
      this.el.addEventListener("setPID", (event) => {
        this.el.components['tetra-motor'].setPID(event.detail);
      });
      this.el.addEventListener("showPID", (cb) => {
        cb.detail(this.el.components['tetra-motor'].toString());
      });
      this.el.addEventListener("setAction", (event) => {
        if (event.detail.chase) {
          this.setPursuit(event.detail.chase);
        }
        if (event.detail.idle) {
          this.setPursuit('idle');
        }
      });
      console.log("INIT", this.totalMass, radius);
    },
    update: function() {
      this.setPursuit(this.data.pursuit);
      console.log("UPDATE");
    },
    remove: function() {
      console.log("REMOVE");
    },
    pause: function() {
      console.log("PAUSE");
    },
    play: function() {
      console.log("PLAY");
    },
    /*
    Tick updated on each physics state
    */
    tick: function() {},
    //console.log "TICK",@el.body.velocity,@innie.body.velocity
    tock: function() {}
  });

}).call(this);


/***/ })
/******/ ]);