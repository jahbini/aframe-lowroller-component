### 
var CANNON = require('cannon');
###
#global window
#
CANNON=window.CANNON
class PID
  ###
  the PID style of controller is intended to track a quantity from the real world as detected by some sensor.
  The sensor is assumed to be reliable as possible, consistent and acccurate.
  the output of the controller is a single quantity that controls a single output device.
  The output device is related in some fashion to changes in the real world that affect the sensor.
  A PID controller ses the input values to compte an output variable by looking at three internally 
  computed quantities.
  1) the Proportial component, which simply is related to "How far away from our goal are we?"
  2) the Integral component, which is related to "How far have we come to our goal?"
  3) the Differential component, which asks "are we taking big steps, or tiny ones?"
  ###
  constructor: (options) ->
    # set defaults
    
    # PID constants
    @proportionalParm = 1
    @integrationParm = 0
    @derivativeParm = 0
    # Interval of time between two updates
    # If not set, it will be automatically calculated
    @dt = 0
    # Maximum absolute value of sumDelta
    @integrationLimit = 0
    # now override with updates
    @setParms options
    @reset()  # clear internal history
    return
  setParms: (options) ->
    @proportionalParm = options.p if options.p
    @integrationParm = options.i if options.i
    @derivativeParm = options.d if options.d
    @dt = options.dt if options.dt
    @integrationLimit = options.integrationLimit if options.integrationLimit
    return
  toString: () -> 
    return "P: #{@.proportionalParm} - I: #{@.integrationParm} - D: #{@.derivativeParm}"
  setTarget: (@target) ->
    @lastTime = Date.now()  # used only if dt is not explicit
    return
  
  update: (@currentValue) -> 
    # Calculate dt
    dt = @dt
    if !dt 
      currentTime = Date.now()
      dt = (currentTime - @lastTime) / 1000 # in seconds
      @lastTime = currentTime
    if (typeof dt != 'number' || dt == 0) 
      dt = 1
 
    delta = @target - @currentValue  #used as the Proportional factor
    
    @sumDelta = @sumDelta*0.9 + delta*dt  #used as the Integral factor
    if 0< @integrationLimit < Math.abs(@sumDelta) #if there is an integration limit, check it
      sumSign = if @sumDelta > 0 then 1 else -1
      @sumDelta = sumSign * @integrationLimit  # activate the caller's failsafe quantity

    dDelta = (delta - @lastDelta)/dt # used as the Derivitive factor
    @lastDelta = delta
    return (@proportionalParm*delta) +
      (@integrationParm * @sumDelta) +
      (@derivativeParm * dDelta)
  
  reset:() ->
    @sumDelta  = 0
    @lastDelta = 0
    @setTarget 0
    return


###
* Convert a local body point to world frame.
* @method pointToWorldFrame
* @param  {Vec3} localPoint
* @param  {Vec3} result
* @return {Vec3}
###

pointToWorldFrame= (body,localPoint,result= new CANNON.Vec3())->
  body.quaternion.vmult localPoint,result
  result.vadd body.position,result
  result

###*
# A tetraForcer, connecting two bodies by four tetrahedral anchors.
#
# @class TetraForcer
# @constructor
# @param {Body} outie
# @param {Body} innie
# @param {Object} [options]
###
class TetraForcer
  constructor: (@outie, @innie, options={}) ->
    p=options.pid || {}
    p.p = p.p || 40
    p.i = p.i || 40
    p.d = p.d || 0.4
    @pIDs = []
    for i in [0..3]
      @pIDs.push new PID p
    ###*
    # min force
    # resting force
    # @property minForce
    # @type {number}
    ###
    @minForce = options.minForce || 10
    @debug = options.debug || false
    # springs and TetraForcers do not have equations, they add forces directly 
    @equations = []
    Vec3 = CANNON.Vec3
    @temps =
      tetW: new Vec3()
      forcePositionW: new Vec3()
      tetraVector: new Vec3()
      innieAttachPointW: new Vec3()
      seekPositionL: new Vec3()
      seekPositionW: new Vec3()
      pursueVector: new Vec3()
    return
  update: (options={})->
    #debugger
    ###*
    # debug by showning marker and computed forces
    ###
    
    @debug = options.debug if options.debug
    
    ###*
    # Proportional, Integral, Differential parameters
    # @property pid
    # @type {object}
    ###
    if options.pid
      for i in @pIDs
        i.setParms options.pid
    return
  toString: ()->
    @pIDs[0].toString()
    
  ###*
  # Set the anchor point on body A, using world coordinates.
  # @method setWorldAnchorA
  # @param {Vec3} worldAnchorA
  ###
  setWorldAnchorA: (worldAnchorA) ->
    @outie.pointToLocalFrame worldAnchorA, @localAnchorA
    return
  ###*
  # Set the anchor point on body B, using world coordinates.
  # @method setWorldAnchorB
  # @param {Vec3} worldAnchorB
  ###
  setWorldAnchorB: (worldAnchorB) ->
    @innie.pointToLocalFrame worldAnchorB, @localAnchorB
    return
  ###*
  # Get the anchor point on body A, in world coordinates.
  # @method getWorldAnchorA
  # @param {Vec3} result The vector to store the result in.
  ###
  getWorldAnchorA: (result) ->
   pointToWorldFrame @outie, @localAnchorA, result
   return
  ###*
  # Get the anchor point on body B, in world coordinates.
  # @method getWorldAnchorB
  # @param {Vec3} result The vector to store the result in.
  ###
  getWorldAnchorB: (result) ->
    pointToWorldFrame  @innie,@localAnchorB, result
    return
  Vec3 = CANNON.Vec3
  nullVector = nullPoint = new Vec3()
    
  ###*
  # Apply the linearMotor force to the connected bodies.
  # @method applyForce
  ###
  update: ->
    dt = 0.0166
    # where is the pursuit in local coordinates?
    # the low-roller centric position we want to place innie's body
    # must be within outie (outie)
    pursue = @outie.el.pursuit()
    outieLimitW = @outie.radius * 0.9     #exactly where is on this hull
    # find the internal seek position in world coordinates
    pursue.vsub @outie.position,@temps.pursueVector
    @temps.pursueVector.normalize()
    @temps.pursueVector.scale outieLimitW, @temps.pursueVector
    @outie.position.vadd  @temps.pursueVector ,@temps.seekPositionW
    #convert the new innie desired position to Outie local coordinates
    @outie.pointToLocalFrame @temps.seekPositionW,@temps.seekPositionL
    
    if @type=='tetraPositioner'  # HACK JAH
      # we move the innie as if it were a static component
      # and apply innie's gravitational force to outie's magic innie position
      @innie.position.copy @outie.pointToWorldFrame @temps.seekPositionL
      @innie.velocity.copy @innie.initVelocity
      @outie.applyForce new Vec3(0,-9.6*@innie.mass,0.1),@innie.position.vsub @outie.position
      return
    
    for tetraStruct in @outie.tetraPoints
      tetraStruct.cannonLocal.scale @outie.radius, @temps.tetW
      pointToWorldFrame @outie, @temps.tetW,@temps.tetW
      pointToWorldFrame @innie, nullPoint,@temps.innieAttachPointW
      @temps.tetW.vsub @innie.position, @temps.tetraVector
      tetToSeekDistance = @temps.tetW.distanceTo @temps.seekPositionW
      tetToInnieDistance = @temps.tetW.distanceTo @innie.position
      
      force = @minForce * @innie.mass
      adjust = (@innie.mass+@outie.mass)*@pIDs[tetraStruct.index].update tetToSeekDistance-tetToInnieDistance
      force += adjust
      @temps.tetraVector.normalize()
      @temps.tetraVector.scale force,@temps.tetraVector
      @temps.innieAttachPointW.vsub @innie.position,@temps.forcePositionW
      @innie.applyForce @temps.tetraVector,@temps.forcePositionW
      @temps.tetraVector.scale -1,@temps.tetraVector
      @temps.tetW.vsub @outie.position,@temps.forcePositionW
      @outie.applyForce @temps.tetraVector, @temps.forcePositionW
      if @debug
        innieID=@innie.el.id
        inf=document.querySelector "##{innieID}__marker"
        inf.setAttribute "position",@temps.seekPositionW
        @temps.tetraVector.normalize()
        direction=@temps.tetraVector
        otf=document.querySelector "##{innieID}__outieForce__#{tetraStruct.index}"
        #otf.setAttribute "position",@temps.tetW
        otf.setAttribute "position",@innie.position
        otf.setAttribute "arrow", "direction: #{-1 * direction.x} #{-1*direction.y} #{-1 * direction.z}; length: #{force/50}"
      continue
      
    return
    
###
# Register the component with the A-Frame system
# decode and pass options along
#
###
AFRAME.registerComponent('tetra-motor',
  multiple: false
  schema:
    type:
      oneOf: [
        'tetraPositioner'
        'tetraForcer'
      ]
      default: 'tetraForcer'
    debug: {type:'boolean', default:false}
    target: type: 'selector'
    minForce:
      default: 10
      min: 0
    maxForce:
      default: 1e6
      min: 0
    collideConnected: default: true
    wakeUpBodies: default: true
    pid:
      parse: (v)->
        if typeof v == 'object'
          p=v.p || 20; i=v.i || 10; d=v.d || 1
        if typeof v == 'string'
          p=20; i=10; d=1
          v=v.toLowerCase()
          v=v.replace /,+/g, ' '
          v=v.replace /\s+/g, ' '
          if a=v.match /p:\s*(-?[\d.]+)/
            p=a[1]
          if a=v.match /i:\s*(-?[\d.]+)/
            i=a[1]
          if a=v.match /d:\s*(-?[\d.]+)/
            d=a[1]
        return {p,i,d}
      default:
        p:20
        i:10
        d:1
      toString:(v )->
        "p: #{v.p}, i: #{v.i}, d: #{v.d}"
    restLength:
      type: 'number'
      default: 0
    localAnchor:
      type: 'vec3'
      default:
        x: 0
        y: 0
        z: 0
     localTarget:
      type: 'vec3'
      default:
        x: 0
        y: 0
        z: 0
     
  init: ->
    @system = @el.sceneEl.systems.physics
    @constraint = null
    return
  # return the current PID parameters
  toString: ->
    return @constraint.toString()
  remove: ->
    if !@constraint
      return
    @system.removeConstraint @constraint
    @constraint = null
    return
  setPID: (data)->
    for e in @constraint.pIDs
      e.setParms data
    return
  update: ->
    el = @el
    data = @data
    @remove()
    if !el.body or !data.target?.body
      (if el.body then data.target else el).addEventListener 'body-loaded', @update.bind(this, {})
      return
    @constraint = @createConstraint()
    @system.addConstraint @constraint
    radius = el.components.geometry.data.radius
    if @constraint.type == 'tetraForcer'
      @system.addConstraint new CANNON.DistanceConstraint el.body, data.target.body, radius * 0.8, data.maxForce
    return
  createConstraint: ->
    constraint = undefined
    data = @data
    constraint = undefined
    switch data.type
      when 'tetraForcer', 'tetraPositioner'
        lA = @data.localAnchor
        lB = @data.localTarget
        constraint = new (TetraForcer)(@el.body, data.target.body,
          pid: p: data.pid.p, i: data.pid.i, d: data.pid.d, dt: 0.016
          debug: data.debug
          minForce: @data.minForce)
        constraint.type = data.type
      else
        throw new Error('[constraint] Unexpected type: ' + data.type)
    constraint
)

setEverything = (e,attributes,hash={}) ->
  for a,v of attributes
    e.setAttribute a,v
  for a,v of hash
    e[a] = v
  e.updateProperties() if e.updateProperties?
  return
  
innieCounter = 0
innieID = ->
  "innie__#{++innieCounter}"
dLay = (f)->
  setTimeout f,0
V2A = (position) ->
  "#{position.x} #{position.y} #{position.z}"
C = (x=0,y=0,z=0)-> new CANNON.Vec3 x,y,z

debug = AFRAME.utils.debug
coordinates = AFRAME.utils.coordinates
isCoordinates = coordinates.isCoordinates or coordinates.isCoordinate

AFRAME.registerComponent 'lowroller',  
  schema:
    inner: type: 'number',default: 9
    outer: type: 'number',default:1
    debug: type: 'boolean', default: false
    pid:
      default:
        p:20
        i:10
        d:1
      parse: (v)->
        if typeof v == 'object'
          p=v.p || 200; i=v.i || 100; d=v.d || 1
        if typeof v == 'string'
          p=20; i=10; d=1
          v=v.toLowerCase()
          v=v.replace /,+/g, ' '
          v=v.replace /\s+/g, ' '
          if a=v.match /p:\s*(-?[\d.]+)/
            p=a[1]
          if a=v.match /i:\s*(-?[\d.]+)/
            i=a[1]
          if a=v.match /d:\s*(-?[\d.]+)/
            d=a[1]
        return {p,i,d}
    type:
      oneOf: [
        'tetraPositioner'
        'tetraForcer'
      ]
      default: 'tetraForcer'
    pursuit:
      default: 'self'
      parse: (value) ->
        # A static position to look at.
        if isCoordinates(value) or typeof value == 'object'
          return coordinates.parse(value)
        # A selector to a target entity.
        value
      stringify: (data) ->
        if typeof data == 'object'
          return coordinates.stringify(data)
        data
  controlPoints: []
  ###
  iterate over the four tetrahedral control points
  ###
  accessControlPoints: (f) ->
    for element in @controlPoints
      f element
    
  ###
  setPursuit aims the low-roller at this xy destination
  ###
  setPursuit: (p)->
    # the default is that we center the pursuit
    if !this.el.body
      @el.addEventListener 'body-loaded', (event) =>
        @.setPursuit p
      return
    # we record our current position for idle or self
    @pursuitVector.copy @el.body.position
    @.el.pursuit = ()=> @pursuitVector
    return if p == 'self' || p == 'idle'
    if typeof p == 'object'
      @pursuitVector.copy x:p.x, y:0, z:p.y
      return
    if m=p.trim().match /(-?[\d.]+)[,\s]+(-?[\d.]+)([,\s]+(-?[\d.]+))?/
      @pursuitVector.copy x:m[1], y:0, z:m[2]
      return
    targetEl = @el.sceneEl.querySelector(p)
    if !targetEl
      return
    if !targetEl.hasLoaded
      targetEl.addEventListener 'loaded', =>
        @.setPursuit p
        return
      return
    if targetEl.body
      @.el.pursuit = ()->targetEl.body.position
      return
    @.el.pursuit = ()=>
      @pursuitVector.copy targetEl.object3D.position
      return @pursuitVector
    return
      
  ###
  Initialization
  ###
  init: ->
    @initRuntime = true
    tetrahedralDescription=[]
    do -> 
      r=[ 1,-1]
      for z in r
        for y in r
          tetrahedralDescription.push
            p:  new THREE.Vector3 z*y,y,z
            normed:  (new THREE.Vector3 z*y,y,z).normalize()
            raw: [z*y,y,z]
            cannonLocal: (C z*y,y,z).unit()
            index: tetrahedralDescription.length
            flip:1
      return
    ###
    tetrahedron init
    ###
    @.tetrahedralDescription=tetrahedralDescription
    data = @.data
    @pursuitVector = C()
    @setPursuit @.data.pursuit 
    radius = @.el.components.geometry.data.radius
    scale = @.el.components.geometry.data.scale
    @totalMass = data.inner + data.outer
    position = @.el.components.position.data
    @el.addEventListener 'body-loaded', (event) =>
      body = event.currentTarget.body
      body.velocity.set 0,0,0
      body.angularVelocity.set 0,0,0
      body.quaternion = body.initQuaternion
      body.radius = @.el.components.geometry.data.radius
      body.tetraPoints = tetrahedralDescription
      body.updateProperties()
      return
    ###
    Outer sphere physics attributes
    ###
    @el.setAttribute 'dynamic-body',"shape:'sphere'; sphereRadius:#{radius}; mass: #{data.outer}; linearDamping: 0.5; angularDamping: 0.91;"
    @el.setAttribute "geometry", "primitive: sphere; radius: #{radius}"
    ###
    create inner sphere
    ###
    innie = document.createElement 'a-sphere'
    innie.id = innieID()
    @myInnieID = innieCounter
    innie.setAttribute 'radius',"#{data.outer/@totalMass}"
    innie.setAttribute "position",position
    innie.setAttribute 'dynamic-body', "shape:'sphere'; sphereRadius: #{data.outer/@totalMass}; mass: #{data.inner}; linearDamping: 0.5; angularDamping: 0.5"
    @.innie = innie
    @innie.addEventListener 'body-loaded', (event) =>
      body = event.currentTarget.body
      body.collisionResponse =  true
      body.collisionFilterGroup = 2
      body.collisionFilterMask = 1
      body.updateProperties();
      return
    @.el.parentElement.insertBefore innie, @.el

    ###
    create tetrahedron
    ###
    #tet = document.createElement 'a-tetrahedron'
    #tet.setAttribute 'physics',"mass:0; shape:'sphere'; sphereRadius: 0.1; collisionResponse: false"
    #tet.setAttribute 'material','wireframe:true'
    #tet.setAttribute 'radius',"#{radius}"
    #@.el.appendChild tet
    #@.tet = tet
    ###
    create tetrahedral support points
    ###

    @controlPoints = for v in tetrahedralDescription
      Object.assign {}, v
    @myPoints = @accessControlPoints (e)=>
      pivotPoint = V2A e.normed.multiplyScalar radius
      mPivotPoint = V2A e.normed.multiplyScalar -radius
      p2 = V2A e.normed.multiplyScalar -radius
      return
    # build up the force vectors on the anchor points
    if data.debug
        marker = document.createElement 'a-sphere'
        marker.id = "#{innie.id}__marker" 
        marker.setAttribute "position", "0 0 0"
        marker.setAttribute "radius","0.05"
        marker.setAttribute "color","black"
        @.el.parentElement.insertBefore marker,@.el
        #T.tag "a-sphere", "#marker", position: "0 0 0", radius: "0.1", color: "black"
        colors = ["#fff","#f88","#8F8","#88F"]
        @accessControlPoints (e)=>
          iVector = document.createElement 'a-entity'
          iVector.setAttribute 'arrow',"direction: 1 1 1; length:1; color: #{colors[e.index]}"
          iVector.id = "#{@innie.id}__outieForce__#{e.index}"
          @.el.parentElement.insertBefore iVector,@.el
          return

    @el.setAttribute "tetra-motor",
      target: "##{@innie.id}"
      minForce:15
      type: data.type
      debug: data.debug
      pid: data.pid
    @el.addEventListener "setPID", (event)=>
      @el.components['tetra-motor'].setPID event.detail
      return
    @el.addEventListener "showPID", (cb)=>
      cb.detail @el.components['tetra-motor'].toString()
      return
    @el.addEventListener "setAction",(event)=>
      if event.detail.chase 
        @setPursuit event.detail.chase
      if event.detail.idle
        @setPursuit 'idle'
      if event.detail.hop
        @setHop event.detail.hop
      return
    console.log "INIT",@totalMass,radius
    return 

  update: ->
    @setPursuit @.data.pursuit
    console.log "UPDATE"
    return
  remove: -> console.log "REMOVE"; return
  pause: -> console.log "PAUSE"; return
  play: ->
    console.log "PLAY"
    return
  ###
  Tick updated on each physics state
  ###
  tick: ->
    #console.log "TICK",@el.body.velocity,@innie.body.velocity
    return
  tock: ->
    return
