###########
# CREDITS #
###########

$(document).on 'ready turbolinks:load', ->
  $(".catalog-cases-index a.catalog-case").on 'mouseenter focus', (e) ->
    box = $(e.currentTarget)
    authors = box.find('p')
    box.find('.catalog-case-credits').addClass('dimmed')
    authors.slideDown duration: 200, easing: 'easeOutExpo'

  $(".catalog-cases-index a.catalog-case").on 'mouseleave blur', (e) ->
    box = $(e.currentTarget)
    authors = box.find('p')
    box.find('.catalog-case-credits').removeClass('dimmed')
    authors.slideUp duration: 200, easing: 'easeOutExpo'

  $(".catalog-case-unpublished:not(.catalog-case-accessible)").on 'click', (e) ->
    e.preventDefault()

############
# CAROUSEL #
############

carouselShouldScroll = (carousel) ->
  return false unless carousel
  amountOffscreen = carousel[0].scrollWidth - carousel[0].clientWidth
  halfItemWidth = carousel.children()[0].clientWidth / 2.0
  amountOffscreen > halfItemWidth

scrollCarousel = () ->
  carouselLeft()  if $('.catalog-cases-featured').length > 0

carouselLeft = () ->
  return if window.mutex
  window.mutex = true
  carousel = $(".catalog-cases-featured")
  items = carousel.children()
  if carouselShouldScroll carousel
    firstChild = items.first().clone()
    carousel.append firstChild
    carousel.animate {scrollLeft: items[1].offsetLeft}, 500, "easeOutExpo", ->
      items.first().detach()
      carousel.scrollLeft 0
      window.mutex = false

carouselRight = () ->
  return if window.mutex
  window.mutex = true
  carousel = $(".catalog-cases-featured")
  items = carousel.children()
  if carouselShouldScroll carousel
    lastChild = items.last().clone()
    carousel.prepend lastChild
    carousel.scrollLeft items[1].offsetLeft
    carousel.animate {scrollLeft: 0}, 500, "easeOutExpo", ->
      items.last().detach()
      window.mutex = false

$(document).on 'ready turbolinks:load', ->
  window.carouselScrollInterval = setInterval scrollCarousel, 5000

  $('.carousel').on 'mouseenter', (e) ->
    clearInterval(window.carouselScrollInterval)
    $('.carousel-button-left').show().animate({ left: 0  }, 400, "easeOutQuad")
    $('.carousel-button-right').show().animate({ right: 0  }, 400, "easeOutQuad")

  $('.carousel').on 'mouseleave', (e) ->
    window.carouselScrollInterval = setInterval scrollCarousel, 5000
    $('.carousel-button-left').animate { left: '-3em';  }, 400, "easeInQuad", ->
      $(this).hide()
    $('.carousel-button-right').animate { right: '-3em';  }, 400, "easeInQuad", ->
      $(this).hide()

  $(document).keydown (e) -> carouselRight() if e.which == 37  # Left arrow
  $(document).keydown (e) -> carouselLeft() if e.which == 39  # Right arrow
  $('.carousel-button-left').on 'click', () -> carouselRight()
  $('.carousel-button-right').on 'click', () -> carouselLeft()

  $('.carousel').on 'swiperight', () -> carouselRight()
  $('.carousel').on 'swiperight', () -> carouselLeft()
