###
#-------- class start
#
# lowRoller -- internally controlled sphere
#
###

demoMode = true
Gravitas = ->
  window.demo = true
  #no-include console.coffee
  #include ../lowroller.coffee
  
#Ignore = ->
  
  window.onkeypress= (event)->
    switch event.key
      when "."
        commandByTeam 'red', chase: "self"
      when ","
        commandByTeam 'blue', chase: "self"
      when "n"
        commandByTeam 'red', chase: "#marker-red"
        commandByTeam 'blue', chase: "#marker-blue"
        commandByTeam 'green', chase: "#marker-green"
      when "m"
        commandByTeam 'green', chase: "#marker-blue"
        commandByTeam  'red', chase: "#marker-green"
        commandByTeam 'blue', chase: "#marker-red"
      when 'o'
        commandByTeam 'blue', chase: "#marker-green"
        commandByTeam  'green', chase: "#marker-red"
        commandByTeam 'red', chase: "#marker-blue"
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
#-------- class start
renderer = class  index extends lowrollerTemplate
  #
  # section storyHeadMatter
  #
  storyHeadMatter: ->
    T.script src:"https://aframe.io/releases/0.8.0/aframe.js"
    T.script src:"draft/peacefare/rollerball-cog/aframe-physics-system.js"
    #T.script src:"assets/seen.min.js"
    #T.script src:"draft/peacefare/low-roller/cannon.js"
    #T.script src:"draft/peacefare/rollerball/pid.js"
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
      T.h3 => "The 411-source's tools of the spiritual bodyguard"
      T.hr()
      @bloviation()
  # 
  # section bloviation
  # 
  bloviation: =>
    if useAll = demoMode
      cameraPos = "0 8 15"
    else
      cameraPos = "0 1 3"
    @footer()
    @lowRollerDefinition()
    T.div ".container.right",=>
      T.tag "a-scene",embedded:true,physics:'debug: false; driver: local; gravity: -9.6; friction: 0.10; restitution: 0.300;',=>
        T.tag "a-entity", physics:'mass:0;', position: cameraPos, rotation:"0 0 0",=>
          T.tag "a-camera", physics: 'mass:0;','universal-controls':true, 'body-static':true, 'mouse-cursor':true, "look-controls":"enabled:true", "wasd-controls":"enabled:true",->
            T.tag "a-cursor"
        T.tag "a-sphere",  "#outie.blue", lowroller: "debug:true; inner:4;outer:1;pursuit: 2,0;", position:"-2 6 -10", radius:"1", material:"color:#EFff5E; transparent:true; opacity:0.3;"
        if useAll
          T.tag "a-sphere", '.red',  'dynamic-body':'', lowroller: "inner:9;outer:1;", position:"-2 1.25 -15", radius:"1.25", material:"color:#EF005E; transparent:true; opacity:0.3;"
          for i in [1..10]
            T.tag "a-sphere", '.red',  'dynamic-body':'', lowroller: "inner:25;outer:25;pursuit: 2.2,0; pid: 200,500,1;", position:"#{-i} #{14-i} 0", radius:"0.75", material:"color:#ff0000; transparent:true; opacity:0.7;"
          for i in [1..10]
            T.tag "a-sphere", '.green', 'dynamic-body':'', lowroller: "inner:5;outer:1;pursuit: 2.2,0; pid: 1000,300,0.0001;", position:"#{-i} #{13-i} 2", radius:"0.5", material:"color:#00ff00; transparent:true; opacity:0.7;"
          for i in [1..10]
            T.tag "a-sphere", '.blue', 'dynamic-body':'', lowroller: "inner:5;outer:1;pursuit: 2.2,0; pid: 200,400,0.1;", position:"#{-i} #{10-i} -2", radius:"0.75", material:"color:#0000ff; transparent:true; opacity:0.7;"
          T.tag "a-sphere", 'dynamic-body':'', position:"0 .25 -2.2", radius:".25",  material:"color:#EF005E; transparent:true; opacity:0.3;"
          T.tag "a-box", 'dynamic-body':'', position:"0 4.5 -5", rotation:"0 45 0", width:"2", height:"2", depth:"2", color:"#4CC3D9"
          T.tag "a-box", 'static-body': '', position:"-10 3.5 -7", rotation:"0 45 0", width:"0.1", height:"1.0", depth:"0.1", color:"#22CC22"
          T.tag "a-box", 'static-body': '', position:"2 3.5 -5", rotation:"0 45 0", width:"0.1", height:"1.0", depth:"0.1", color:"#4CC3D9"
          T.tag "a-box", 'static-body': '', position:"-2 3.5 -5", rotation:"0 45 0", width:"0.1", height:"1.0", depth:"0.1", color:"#4CC3D9"
          T.tag "a-box", 'static-body': '', position:"-4 3.5 -3", rotation:"0 45 0", width:"0.1", height:"1.0", depth:"0.1", color:"#4CC3D9"
          T.tag "a-box", 'static-body': '', position:"8 3.5 -10", rotation:"0 45 0", width:"0.1", height:"1.0", depth:"0.1", color:"#4CC3D9"
          T.tag "a-cylinder", 'static-body': '', position:"-1 0.75 -3", radius:"0.5", height:"1.5", color:"#FFC65D"
          T.tag "a-sky", color:"#cceecc"
          T.tag "a-box", position: "-2 0 0" ,width: "0.1", height: "0.1" , depth:"0.1", color: "yellow"
          T.tag "a-box", position: "2 0 0" ,width: "0.1", height: "0.1" , depth:"0.1", color: "yellow"

          for x in [-3..3]
            for y in [-5..-1]
              T.tag "a-box", position: "#{x} 0 #{y}" ,width: "0.1", height: "0.1" , depth:"0.1", color: "green"
          T.tag "a-entity", environment:"preset: forest; dressingAmount: 500"
          
        T.tag "a-plane", 'static-body':'', position:"0  0 -4", rotation:"-90 0 0", width:"40", height:"50", color:"#7BC8A4"
        T.tag "a-sphere", "#marker-blue", position: "-5 0 -5", radius: "0.1", color: "blue"
        T.tag "a-sphere", "#marker-red", position: "5 0 -5", radius: "0.1", color: "red"
        T.tag "a-sphere", "#marker-green", position: "0 0 0", radius: "0.1", color: "green"
  

    T.h3 "The LowRoller version of the RollerBall"
    T.div "#bloviation.contents", =>
      T.p """Did you ever see a Samurai movie where the police take down a rampaging samuri?"""
      T.p """They simply surrounded the samuri with wooden staffs to keep him farther than swords length, and poked him until he gave up.  we have nothing like that for a man with a gun.  Enter the LowRoller"""
      T.p """The LowRoller rollerBall is about the size of a basketball or soccerball.  It is
covered with a hard shell with a surface like leather.  It's mass is a few kilograms.
It can alter it's center of gravity to roll around.  that's it.
"""
      T.p  """Even with that limitation, it can gang up at the feet of a person causing a threat.
The random motions of the balls will make the attacker lose balance and be unable to continue.
"""
      #T.p  "Press the spacebar to start and stop the simulation.  The large ball is a meter in diameter. press '.' to single step the simulation."
      #T.canvas "#seen-canvas",width:400, height:400 
      #T.input "#red-slider",type:"range", min:0,max:255,onchange: "alert('wow')"
      #T.p => T.raw "Press hjkl to change where these rollerballs take down an attacker."
      #T.p => "Rotate the view with click and drag.  Zoom with fingers or mouse wheel."
  # 
  # section header
  # 
  header: ->
    
  allMeta = [[["name","author"],["content","James A. Hinds: The Celarien's best friend.  I'm not him, I wear glasses"]],[["http-equiv","Content-Type"],["content","text/html"],["charset","UTF-8"]],[["name","viewport"],["content","width=device-width, initial-scale=1"]],[["name","description"],["content","some good thoughts. Maybe."]],[["name","keywords"],["content","romance, wisdom, tarot"]],[["property","fb:admins"],["content","1981510532097452"]],[["name","msapplication-TileColor"],["content","#ffffff"]],[["name","msapplication-TileImage"],["content","assets/icons/ms-icon-144x144.png"]],[["name","theme-color"],["content","#ffffff"]]]
  htmlTitle = "Practical Metaphysics and Harmonious Mana."
#-------- class end

# ------- db start
db = {} unless db

db[id="lowroller/-/index"] =
  title: "index"
  slug: "index"
  category: "-"
  site: "lowroller"
  accepted: true
  index: true
  sourcePath: ""
  headlines: []
  tags: []
  snippets: "{\"first name\":\"first name\"}"
  memberOf: []
  created: "2018-09-03T19:32:28.579Z"
  lastEdited: "2018-09-03T19:32:28.579Z"
  published: "2018-09-03T19:32:28.579Z"
  embargo: "2018-09-03T19:32:28.579Z"
  captureDate: "2018-09-03T19:32:28.579Z"
  TimeStamp: 1536003148579
  debug: ""
  author: "James A. Hinds: St. John's Jim -- King of Cascadia"
  id: "lowroller/-/index"
  name: "index"
#