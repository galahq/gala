$(document).on 'ready turbolinks:load', ->
  $(".catalog-cases-index a.catalog-case").on 'mouseenter focus', (e) ->
    authors = $(e.currentTarget).find('h4')
    authors.slideDown duration: 200, easing: 'easeOutExpo'

  $(".catalog-cases-index a.catalog-case").on 'mouseleave blur', (e) ->
    authors = $(e.currentTarget).find('h4')
    authors.slideUp duration: 200, easing: 'easeOutExpo'

  $(".catalog-case-unpublished:not(.catalog-case-accessible)").on 'click', (e) ->
    e.preventDefault()
