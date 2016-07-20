$(document).on 'ready turbolinks:load', ->
  $(".catalog-cases-index a.catalog-case").on 'mouseenter', (e) ->
    authors = $(e.currentTarget).find('h4')
    authors.slideDown duration: 200, easing: 'easeOutExpo'

  $(".catalog-cases-index a.catalog-case").on 'mouseleave', (e) ->
    authors = $(e.currentTarget).find('h4')
    authors.slideUp duration: 200, easing: 'easeOutExpo'
