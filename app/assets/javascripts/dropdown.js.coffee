ready = ->
  $("#reader-menu").on 'click', ->
    $('#reader-menu .hidden').removeClass('hidden').addClass 'visible'
  $(".menu-dismiss").on 'click', ->
    $('#reader-menu .visible').removeClass('visible').addClass 'hidden'
    return false

$(document).ready(ready)
$(document).on('turbolinks:load', ready)
