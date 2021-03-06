# #-------- class start
#
# lowRoller -- internally controlled sphere
#

demoMode = true
Gravitas = ->
  window.demo = true
  #no-include console.coffee
  #include ../lowroller.coffee
  
  fillRanges= (color)->
    els = document.querySelectorAll '.'+color
    els[0].emit 'showPID', (v)->
      console.log v
      where = document.querySelector "#show-#{color}"
      where.innerHTML = v
      v=v.toLowerCase()
      v=v.replace /,+/g, ' '
      v=v.replace /\s+/g, ' '
      if a=v.match /p:\s*(-?[\d.]+)/
        document.querySelector("##{color}pControl").value =a[1]
      if a=v.match /i:\s*(-?[\d.]+)/
        document.querySelector("##{color}iControl").value =a[1]
      if a=v.match /d:\s*(-?[\d.]+)/
        document.querySelector("##{color}dControl").value =a[1]
      return
    
  Pylon.on "loaded",->
    fillRanges "red"
    
  Pylon.on "updatePid",(info)->
    who = info.who
    delete info.who
    els = document.querySelectorAll '.'+who
    return false if els.length == 0
    for e in els
      e.emit 'setPID', info
    fillRanges who
    return false
  loopMe = (color, points)->
    el = document.querySelector "#marker-#{color}"
    el.object3D.position.applyAxisAngle {x:0,y:1,z:0}, 2*Math.PI/points
    commandByTeam color, chase: "#marker-#{color}"
    return
  hopMe = (color)->
    commandByTeam color, hop: 200 
    return
  setInterval (()->loopMe 'red',-7),3000  
  #setInterval (()->loopMe 'blue',5),7500  
  
  commandByTeam = (teamClass,activity)->
    for element in document.querySelectorAll '.'+teamClass
      element.emit 'setAction', activity
    return
  #
  # ## Apache 2.0 License
  
  #     Copyright 2017, 2018 github/jahbini
  
  #   Licensed under the Apache License, Version 2.0 (the "License");
  #   you may not use this file except in compliance with the License.
  #   You may obtain a copy of the License at
  
  #     http://www.apache.org/licenses/LICENSE-2.0
  
  #   Unless required by applicable law or agreed to in writing, software
  #   distributed under the License is distributed on an "AS IS" BASIS,
  #   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  #   See the License for the specific language governing permissions and
  #   limitations under the License.
  # 
renderer = class Forces extends lowrollerTemplate
  #
  # section storyHeadMatter
  #
  storyHeadMatter: ->
    T.script src:"https://aframe.io/releases/0.8.0/aframe.js"
    T.script src:"//cdn.rawgit.com/donmccurdy/aframe-physics-system/v3.2.0/dist/aframe-physics-system.min.js"
    T.script src:"https://cdnjs.cloudflare.com/ajax/libs/coffee-script/1.7.1/coffee-script.min.js"
    T.script src:"https://unpkg.com/aframe-environment-component/dist/aframe-environment-component.min.js"
    T.script src:"https://unpkg.com/aframe-arrow-component@1.0.0/index.js"
    T.style type:"text/css","""
a-scene { height: 300px; width: 600px; }
#include console.css
"""
  lowRollerDefinition: ->
    ###
    Start of lowroller component
    ###
    
    T.coffeescript Gravitas
  # 
  # section html
  # 
  # 
  # section site_body
  # 
  # 
  # section cover
  # 
  # 
  # section footer 
  footer: =>
    T.div "#console0.left",visible:false,'data-limit':100
    return
  # 
  # 
  # section sidecar
  # 
  # 
  # section fb_status
  # 
  # 
  # section sidebar
  # 
  sidebar: =>
    T.aside "#sidebar.o-grid__cell.o-grid__cell--width-20.p2.bg-darken-2", style: "min-width:240"
  # 
  # section storybar
  # 
  storybar: =>
    T.div "#storybar.o-grid__cell.order-2.bg-lighten-2", =>
      T.h1 => T.raw "How to wage peace in a terrorized society."
      T.h3 => "New tools of the spiritual bodyguard"
      T.hr()
      @bloviation()
  # 
  # section bloviation
  # 
  bloviation: =>
    T.div '.m2',->
      T.h3 "The LowRoller's Four Tetrahedral Forces"
    cameraPos = "0 1.6 4"
    
    @footer()
    @lowRollerDefinition()
    T.div ".container.right",=>
      T.tag "a-scene",embedded:true,physics:'debug: false; driver: local; gravity: -9.6; friction: 0.10; restitution: 0.300;',=>
        T.tag "a-entity", physics:'mass:0;', position: cameraPos, rotation:"0 0 0",=>
          T.tag "a-camera", physics: 'mass:0;','universal-controls':true, 'body-static':true, 'mouse-cursor':true, "look-controls":"enabled:true", "wasd-controls":"enabled:true",->
            T.tag "a-cursor"
        T.tag "a-sphere",  "#outie.red",
          lowroller:"debug:true; inner:4;outer:1;pursuit: 2,0;"
          position: "0 1 0"
          radius: "1"
          material: "color:#EFff5E; transparent:true; opacity:0.3;"
           
        ###
        # objects in scene
        ###
        
        #T.tag "a-sphere", 'dynamic-body':'',physics:"mass:0.5", position:"0 .25 -2.2", radius:".25",  material:"color:#EF005E; transparent:true; opacity:0.8;"
        T.tag "a-box", 'dynamic-body':'', position:"0 4.5 -5",physics:"mass:0.5", rotation:"0 45 0", width:"2", height:"2", depth:"2", color:"#4CC3D9"
        T.tag "a-cylinder", 'static-body': '', position:"0 0 0", radius:"0.5", height:"1.5", color:"#FFC65D"
        
        T.tag "a-sky", color:"#cceecc"
        T.tag "a-box", position: "-2 0 0" ,width: "0.1", height: "0.1" , depth:"0.1", color: "yellow"
        T.tag "a-box", position: "2 0 0" ,width: "0.1", height: "0.1" , depth:"0.1", color: "yellow"
        T.tag "a-plane", 'static-body':'', position:"0  -0.01 -4", rotation:"-90 0 0", width:"40", height:"50", color:"#7BC8A4"
        
        T.tag "a-sphere", "#marker-red", position: "1.5 0 -1.5", radius: "0.5", color: "red"
  

    T.div "#bloviation.contents.container.left", =>
      return ""
      T.form ->
        T.div ".form-group",->
          T.div  ".form-row",->
            T.div ".col-md-4.mb-3",->
              T.div ()->
                T.text "green: "
                T.span "#show-green","unset"
              T.label for: "greenpControl", "proportional"
              T.input "#greenpControl.form-control-range", type:"range" ,value:20, onchange: "Pylon.trigger('updatePid',{who: 'green',p: this.value});"
              T.label for: "greeniControl", "integral"
              T.input "#greeniControl.form-control-range", type:"range", value:"20", onchange: "Pylon.trigger('updatePid',{who: 'green',i: this.value});"
              T.label for: "greendControl", "delta"
              T.input "#greendControl.form-control-range", type:"range", min: -1, max: 1.5, step: 0.05, value: 0.25, onchange: "Pylon.trigger('updatePid',{who: 'green',d: this.value});"
            T.div ".col-md-4.mb-3",->
              T.div ()->
                T.text "red: "
                T.span "#show-red","unset"
              T.label for: "redpControl", "proportional"
              T.input "#redpControl.form-control-range", type:"range" , onchange: "Pylon.trigger('updatePid',{who: 'red', p: this.value});"
              T.label for: "rediControl", "integral"
              T.input "#rediControl.form-control-range", type:"range",  onchange: "Pylon.trigger('updatePid',{who: 'red', i: this.value});"
              T.label for: "reddControl", "delta"
              T.input "#reddControl.form-control-range", type:"range", min: -1, max: 1.5, step: 0.05, onchange: "Pylon.trigger('updatePid',{who: 'red', d: this.value});"
  # 
  # section header
  # 
  header: ->
    
  allMeta = [[["name","author"],["content","James A. Hinds: The Celarien's best friend.  I'm not him, I wear glasses"]],[["http-equiv","Content-Type"],["content","text/html"],["charset","UTF-8"]],[["name","viewport"],["content","width=device-width, initial-scale=1"]],[["name","description"],["content","some good thoughts. Maybe."]],[["name","keywords"],["content","romance, wisdom, tarot"]],[["property","fb:admins"],["content","1981510532097452"]],[["name","msapplication-TileColor"],["content","#ffffff"]],[["name","msapplication-TileImage"],["content","assets/icons/ms-icon-144x144.png"]],[["name","theme-color"],["content","#ffffff"]]]
  htmlTitle = "Practical Metaphysics and Harmonious Mana."
#-------- class end


# ------- db start
db = {} unless db

#
db[id="lowroller/examples/forces"] =
  title: "Tetrahedral Forces Supporting Center Mass"
  slug: "forces"
  category: "examples"
  site: "lowroller"
  accepted: true
  index: false
  sourcePath: ""
  headlines: []
  tags: []
  snippets: "{\"first name\":\"first name\"}"
  memberOf: []
  created: "2018-10-13T01:00:49.348Z"
  lastEdited: "2018-10-13T01:00:49.349Z"
  published: "2018-10-13T01:00:49.349Z"
  embargo: "2018-10-13T01:00:49.349Z"
  captureDate: "2018-10-13T01:00:49.349Z"
  TimeStamp: 1539392449349
  debug: ""
  author: "James A. Hinds: St. John's Jim -- King of Cascadia"
  id: "lowroller/examples/forces"
  name: "forces"
#
#end of story

