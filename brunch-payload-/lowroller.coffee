###
#global Pylon
###
T = Pylon.Halvalla
_= Pylon.underscore

###
browser specific initialization code
###
$ ->
  #run me when the window and document are ready, mr. jQuery
  return
  
# this widget fills in the page

module.exports =  class SiteLook
 
  widgetWrap: ->
    {attrs,contents} = T.normalizeArgs arguments
    id = attrs.id
    delete attrs.id
    title = attrs.title
    delete attrs.title
    T.div '.Container.widget-wrap.p1.m1.border-bottom',attrs , ->
      T.h3 title unless !title
      T.div '.pl2',->contents
  