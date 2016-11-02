#############
# CITATIONS #
#############

window.toggleCitation = (e) ->
  citation = $(e.currentTarget)
  citation.toggleClass('citation-visible')
  if (citation.hasClass('citation-visible'))
    citation.find('.citation-label').html('<sup>×</sup>')
  else
    citation.find('.citation-label').html('<sup>◦</sup>')
