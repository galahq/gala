# frozen_string_literal: true

class UpdateEdgenotes < ActiveRecord::Migration
  def up
    Edgenote.find_by_slug('a-heated-debate').update(
      caption: 'For several short perspectives on the wolves in northern Michigan, see “Michigan’s Wolf Hunt: A Heated Debate.”',
      thumbnail_url: 'https://msc-gala.imgix.net/a-heated-debate-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/a-heated-debate.jpg',
      website_url: 'http://videos.mlive.com/grpress/2013/11/michigans_wolf_hunt_a_heated_d.html',
      content: ''
    )

    Edgenote.find_by_slug('residents-weigh-hunt').update(
      caption:  'For more in-depth reporting on cattle depredations in the Upper Peninsula, listen to Michigan Public Radio’s 2013 “Environment Report.”',
      thumbnail_url: 'https://msc-gala.imgix.net/residents-weigh-hunt-thumb.jpg',
      image_url:  'https://msc-gala.imgix.net/residents-weigh-hunt.jpg',
      website_url: 'http://michiganradio.org/post/residents-weigh-proposed-wolf-hunt-part-1#stream/0',
      content: ''
    )

    Edgenote.find_by_slug('gray-wolf').update(
      thumbnail_url: 'https://msc-gala.imgix.net/gray-wolf.jpg',
      image_url: 'https://msc-gala.imgix.net/gray-wolf.jpg',
      content: ''
    )

    Edgenote.find_by_slug('michigan').update(
      thumbnail_url: 'https://msc-gala.imgix.net/michigan.jpg',
      image_url: 'https://msc-gala.imgix.net/michigan.jpg',
      content: ''
    )

    Edgenote.find_by_slug('gray-wolf-range').update(
      thumbnail_url: 'https://msc-gala.imgix.net/gray-wolf-range.jpg',
      image_url: 'https://msc-gala.imgix.net/gray-wolf-range.jpg'
    )

    Edgenote.find_by_slug('mi-wolf-population').update(
      thumbnail_url: 'https://msc-gala.imgix.net/mi-wolf-population.jpg',
      image_url: 'https://msc-gala.imgix.net/mi-wolf-population.jpg',
      content: '',
      photo_credit: 'Michigan Department of Natural Resources'
    )

    Edgenote.find_by_slug('perversion-of-democracy').update(
      thumbnail_url: 'https://msc-gala.imgix.net/perversion-of-democracy-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/perversion-of-democracy.png',
      website_url: 'https://www.mlive.com/news/index.ssf/2013/11/michigan_wolf_hunt_rolf_peters.html',
      content: ''
    )

    Edgenote.find_by_slug('death-of-832f').update(
      thumbnail_url: 'https://msc-gala.imgix.net/death-of-832f-thumb.jpg',
      image_url:  'https://msc-gala.imgix.net/death-of-832f.jpg',
      website_url: 'http://www.outsideonline.com/1913831/out-bounds-death-832f-yellowstones-most-famous-wolf',
      content: ''
    )

    Edgenote.find_by_slug('bear-wolf-coyote-deer-pop').update(
      thumbnail_url: 'https://msc-gala.imgix.net/bear-wolf-coyote-deer-pop.jpg',
      image_url: 'https://msc-gala.imgix.net/bear-wolf-coyote-deer-pop.jpg',
      content: '',
      photo_credit: 'Mississippi State University'
    )

    Edgenote.find_by_slug('recovery-management-plan-goals').update(
      image_url: 'https://msc-gala.imgix.net/recovery-management-plan-goals-thumb.png'
    )

    Edgenote.find_by_slug('measure-tolerance-carrying-capacity').update(
      thumbnail_url: 'https://msc-gala.imgix.net/measure-tolerance-carrying-capacity-thumb.jpg',
      format: :report,
      pdf_url: 'https://www.michigan.gov/documents/dnr/Peyton_et_al_SCC_wolves_PDF_for_online_295701_7.pdf'
    )

    Edgenote.find_by_slug('too-close-for-comfort').update(
      caption: 'Check out a few “too close for comfort” testimonials from Upper Peninsula residents.',
      thumbnail_url: 'https://msc-gala.imgix.net/too-close-for-comfort-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/too-close-for-comfort.jpg',
      website_url: 'http://www.mlive.com/news/index.ssf/2013/11/whos_afraid_of_the_big_bad_wol.html',
      instructions: 'If you’re interested, you can also watch the <a href="http://videos.mlive.com/grpress/2013/11/wolves_collide_with_ironwood_r.html">accompanying video</a>.'
    )

    Edgenote.find_by_slug('hunting-conservation-economics').update(
      thumbnail_url: 'https://msc-gala.imgix.net/hunting-conservation-economics-thumb.png',
      image_url: 'https://msc-gala.imgix.net/hunting-conservation-economics.jpg',
      website_url: 'http://www.nytimes.com/2010/12/13/sports/13deer.html?_r=1'
    )

    Edgenote.find_by_slug('hunt-as-management-tool').update(
      thumbnail_url: 'https://msc-gala.imgix.net/hunt-as-management-tool-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/hunt-as-management-tool.jpg',
      website_url: 'http://www.mlive.com/news/index.ssf/2013/11/michigan_wolf_hunt_adam_bump_m.html'
    )

    Edgenote.find_by_slug('dnr-management-proposal').update(
      thumbnail_url: 'https://msc-gala.imgix.net/dnr-management-proposal.png',
      image_url: 'https://msc-gala.imgix.net/dnr-management-proposal.png',
      content: ''
    )

    Edgenote.find_by_slug('hunt-on-native-land-mpr').update(
      thumbnail_url: 'https://msc-gala.imgix.net/hunt-on-native-land-mpr-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/hunt-on-native-land-mpr.jpg',
      content: ''
    )

    Edgenote.find_by_slug('wolves-in-ojibwe').update(
      caption: 'Read more about the “sacred and intangible” place of wolves in Ojibwe Culture.',
      thumbnail_url: 'https://msc-gala.imgix.net/wolves-in-ojibwe-thumb.jpg',
      image_url: 'https://msc-gala.imgix.net/wolves-in-ojibwe.jpg',
      website_url: 'http://www.startribune.com/plan-to-hunt-wolves-illustrates-culture-clash/160952295/'
    )

    Edgenote.find_by_slug('kidane-asefa').update(
      thumbnail_url: 'https://msc-gala.imgix.net/kidane-asefa.png'
    )

    Edgenote.find_by_slug('climate-change-impact-livelihoods').update(
      thumbnail_url: 'https://msc-gala.imgix.net/climate-change-impact-livelihoods-thumb.jpg',
      embed_code: '<iframe src="https://www.youtube.com/embed/Mwqi8Qe0-OI?start=0&end=194" frameborder="0" allowfullscreen="allowfullscreen"></iframe>'
    )

    Edgenote.find_by_slug('napa').update(
      thumbnail_url: 'https://msc-gala.imgix.net/napa-thumb.jpg'
    )

    Edgenote.find_by_slug('vulnerability-map').update(
      thumbnail_url: 'https://msc-gala.imgix.net/vulnerability-map.jpg',
      image_url: 'https://msc-gala.imgix.net/vulnerability-map.jpg'
    )

    Edgenote.find_by_slug('drought-and-hazard-frequency').update(
      thumbnail_url: 'https://msc-gala.imgix.net/drought-and-hazard-frequency.jpg',
      image_url: 'https://msc-gala.imgix.net/drought-and-hazard-frequency.jpg'
    )

    Edgenote.find_by_slug('executive-summary-of-ethiopia-uncertain-climate-future').update(
      thumbnail_url: 'https://msc-gala.imgix.net/executive-summary-of-ethiopia-uncertain-climate-future-thumb.jpg',
      website_url: 'https://www.oxfam.org/sites/www.oxfam.org/files/file_attachments/rain-poverty-vulnerability-climate-ethiopia-2010-04-22_3.pdf',
      image_url: 'https://msc-gala.imgix.net/executive-summary-of-ethiopia-uncertain-climate-future-thumb.jpg'
    )

    Edgenote.find_by_slug('chinese-fdi-in-ethiopia').update(
      thumbnail_url: 'https://msc-gala.imgix.net/chinese-fdi-in-ethiopia-thumb.jpg'
    )

    Edgenote.find_by_slug('ethiopia-economy-growth-concerns').update(
      thumbnail_url: 'https://msc-gala.imgix.net/ethiopia-economy-growth-concerns-thumb.jpg'
    )

    Edgenote.find_by_slug('ethiopia-parliament').update(
      thumbnail_url: 'https://msc-gala.imgix.net/ethiopia-parliament.png',
      image_url: 'https://msc-gala.imgix.net/ethiopia-parliament.png'
    )

    Edgenote.find_by_slug('ethiopia-refugees').update(
      thumbnail_url: 'https://msc-gala.imgix.net/ethiopia-refugees-thumb.png',
      website_url: 'http://www.unhcr.org/53f31ebd9.html',
      image_url: 'https://msc-gala.imgix.net/ethiopia-refugees-screenshot.png'
    )

    Edgenote.find_by_slug('ethiopia-climate-complexity').update(
      thumbnail_url: 'https://msc-gala.imgix.net/ethiopia-climate-complexity-thumb.png'
    )

    Edgenote.find_by_slug('basics-of-cba').update(
      thumbnail_url: 'https://msc-gala.imgix.net/basics-of-cba-thumb.png',
      embed_code: '<iframe width="840" height="473" src="https://www.youtube.com/embed/Mol1yT7tczY?feature=oembed" frameborder="0" allowfullscreen></iframe>'
    )

    Edgenote.find_by_slug('mass-starvation-in-ethiopia').update(
      thumbnail_url: 'https://msc-gala.imgix.net/mass-starvation-in-ethiopia-thumb.jpg',
      embed_code: '<iframe width="300" height="150" src="https://www.youtube.com/embed/ta0dcp1FfY0?start=123&end=354" frameborder="0" allowfullscreen="allowfullscreen"></iframe>'
    )

    Edgenote.find_by_slug('laure-katz').update(
      thumbnail_url: 'https://msc-gala.imgix.net/laure-katz-thumb.png',
      pdf_url: 'https://s3-us-west-2.amazonaws.com/msc-gala/laure-katz-resume.pdf'
    )

    Edgenote.find_by_slug('unrivaled-biodiversity').update(
      caption: 'Whale sharks in Cenderawasih Bay display some unconventional behavior…',
      thumbnail_url: 'https://msc-gala.imgix.net/unrivaled-biodiversity-thumb.png',
      embed_code: '<iframe width="840" height="473" src="https://www.youtube.com/embed/n9sjT8IqgRA?feature=oembed" frameborder="0" allowfullscreen></iframe>'
    )

    Edgenote.find_by_slug('initial-rapid-assessment').update(
      thumbnail_url: 'https://msc-gala.imgix.net/initial-rapid-assessment-thumb.png',
      pdf_url: 'http://birdsheadseascape.com/download/research/biodiversity/Excerpt%20from%20CI%2020%20year%20RAP%20book%20on%20BHS%20RAP%20surveys.pdf',
      instructions: 'This IRA is excerpted from Conservation International’s “<a href="http://www.conservation.org/publications/Pages/still_counting_RAP_20.aspx">Still Counting: The First 20 Years of the Rapid Assessment Program</a>.”</p>'
    )

    Edgenote.find_by_slug('conservation-international').update(
      thumbnail_url: 'https://msc-gala.imgix.net/conservation-international-thumb.png',
      website_url: 'http://www.conservation.org/about/Pages/default.aspx',
      image_url: 'https://msc-gala.imgix.net/conservation-international-screenshot.png',
      caption: 'Learn more about Conservation International’s initiatives and community-based approach to conservation'
    )

    Edgenote.find_by_slug('mpa-network').update(
      thumbnail_url: 'https://msc-gala.imgix.net/mpa-network.png',
      image_url: 'https://msc-gala.imgix.net/mpa-network.png'
    )

    Edgenote.find_by_slug('local-ngos').update(
      thumbnail_url: 'https://msc-gala.imgix.net/local-ngos.png',
      image_url: 'https://msc-gala.imgix.net/local-ngos.png'
    )

    Edgenote.find_by_slug('civil-society-roles').update(
      thumbnail_url: 'https://msc-gala.imgix.net/civil-society-roles.png',
      image_url: 'https://msc-gala.imgix.net/civil-society-roles.png'
    )

    Edgenote.find_by_slug('walton-family-foundation').update(
      thumbnail_url: 'https://msc-gala.imgix.net/walton-family-foundation-thumb.png',
      website_url: 'http://www.waltonfamilyfoundation.org/who-we-are',
      image_url: 'https://msc-gala.imgix.net/walton-family-foundation-screenshot.png'
    )

    Edgenote.find_by_slug('compressor-fishing').update(
      thumbnail_url: 'https://msc-gala.imgix.net/compressor-fishing-thumb.jpg',
      embed_code: '<iframe width="840" height="473" src="https://www.youtube.com/embed/mlKHKMytN-8?feature=oembed" frameborder="0" allowfullscreen></iframe>'
    )

    Edgenote.find_by_slug('mpa-boosted-fisheries').update(
      thumbnail_url: 'https://msc-gala.imgix.net/mpa-boosted-fisheries.jpg',
      image_url: 'https://msc-gala.imgix.net/mpa-boosted-fisheries.jpg'
    )

    Edgenote.find_by_slug('sells-raja-ampat').update(
      thumbnail_url: 'https://msc-gala.imgix.net/sells-raja-ampat-thumb.png',
      website_url: 'http://www.gorajaampat.com/',
      image_url: 'https://msc-gala.imgix.net/sells-raja-ampat-screenshot.png',
      caption: 'The Indonesian Ministry of Tourism sells Raja Ampat as “The Last Paradise on Earth”'
    )

    Edgenote.find_by_slug('booming-tourism').update(
      thumbnail_url: 'https://msc-gala.imgix.net/booming-tourism.png',
      image_url: 'https://msc-gala.imgix.net/booming-tourism.png'
    )

    Edgenote.find_by_slug('oil-and-gas-exploration').update(
      thumbnail_url: 'https://msc-gala.imgix.net/oil-and-gas-exploration-thumb.png',
      website_url: 'http://www.ogj.com/articles/2013/09/indonesia-west-papua-klalin-field-gets-further-development.html',
      image_url: 'https://msc-gala.imgix.net/oil-and-gas-exploration-screenshot.png'
    )

    Edgenote.find_by_slug('events-timeline').update(
      thumbnail_url: 'https://msc-gala.imgix.net/events-timeline-thumb.png'
    )

    Edgenote.find_by_slug('heavy-foreign-fishing-pressure').update(
      thumbnail_url: 'https://msc-gala.imgix.net/heavy-foreign-fishing-pressure-thumb.jpg',
      website_url: 'http://www.aseannews.net/illegal-fishing-costs-indonesia-3-billion-dollars-a-year/',
      image_url: 'https://msc-gala.imgix.net/heavy-foreign-fishing-pressure-screenshot.png'
    )

    Edgenote.find_by_slug('expected-budget-at-steady-state').update(
      thumbnail_url: 'https://msc-gala.imgix.net/expected-budget-at-steady-state.png',
      image_url: 'https://msc-gala.imgix.net/expected-budget-at-steady-state.png'
    )

    Edgenote.find_by_slug('summary-of-costs-by-institution').update(
      thumbnail_url: 'https://msc-gala.imgix.net/summary-of-costs-by-institution.png',
      image_url: 'https://msc-gala.imgix.net/summary-of-costs-by-institution.png'
    )

    Edgenote.find_by_slug('costs-by-site-and-function').update(
      thumbnail_url: 'https://msc-gala.imgix.net/costs-by-site-and-function.jpg',
      image_url: 'https://msc-gala.imgix.net/costs-by-site-and-function.jpg'
    )

    Edgenote.find_by_slug('funding-gaps-by-group-and-by-site').update(
      thumbnail_url: 'https://msc-gala.imgix.net/funding-gaps-by-group-and-by-site.png',
      image_url: 'https://msc-gala.imgix.net/funding-gaps-by-group-and-by-site.png'
    )

    Edgenote.find_by_slug('carbon-sequester-in-coastal-habitats').update(
      thumbnail_url: 'https://msc-gala.imgix.net/carbon-sequester-in-coastal-habitats-thumb.png',
      website_url: 'http://birdsheadseascape.com/conservation-science/indonesia-continues-to-draw-the-attention-of-the-international-blue-carbon-community-by-jennifer-howard/',
      image_url: 'https://msc-gala.imgix.net/carbon-sequester-in-coastal-habitats-screenshot.png'
    )

    Edgenote.find_by_slug('decline-in-tourism-in-2002-and-2005').update(
      slug: 'decline-in-tourism-in-2002',
      thumbnail_url: 'https://msc-gala.imgix.net/decline-in-tourism-in-2002-and-2005-thumb.jpg',
      website_url: 'http://www.insideindonesia.org/post-bomb-lessons',
      image_url: 'https://msc-gala.imgix.net/decline-in-tourism-in-2002-and-2005-screenshot.png'
    )

    Edgenote.find_by_slug('conservation-trust-investment-survey-2012').update(
      thumbnail_url: 'https://msc-gala.imgix.net/conservation-trust-investment-survey-2012.jpg',
      website_url: 'http://www.dcnanature.org/wp-content/uploads/fundraising/Conservation-Trust-Investment-Survey-2012.pdf',
      image_url: 'https://msc-gala.imgix.net/conservation-trust-investment-survey-2012.jpg'
    )

    Edgenote.find_by_slug('chinese-investment-in-transportation').update(
      embed_code: '<iframe src="https://www.youtube.com/embed/2QTO-zNqe5Y" frameborder="0" allowfullscreen="true"></iframe>'
    )

    Edgenote.where(format: :image).update(format: :graphic)
    Edgenote.where(format: :gallery).update(format: :photo)
  end

  def down; end
end
