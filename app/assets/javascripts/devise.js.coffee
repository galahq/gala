$(document).ready ->
  $('input#reader_name').on 'keyup', (e) ->
    name = e.currentTarget.value.toUpperCase()
    initials = name.split(' ').map( (word) ->
      word[0]
    ).join ''
    $('input#reader_initials').val initials
