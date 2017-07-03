# frozen_string_literal: true

class CreateSmartMetersCase < ActiveRecord::Migration[5.0]
  def up
    I18n.locale = :en

    c = Case.create(
      slug: 'baltimore-smart-meters',
      published: true,
      tags: %w[region:us exercise:quantitative],
      cover_url: 'https://msc-gala.imgix.net/bge-smart-meters.jpg',
      photo_credit: 'Baltimore Sun',
      authors: [
        'Gianna Petito',
        'Geoffrey Burmeister',
        'Michael Moore',
        'Arman Golrokhian',
        # "Malia Molina",
        # "Edward Waisanen",
        # "Pearl Zeng",
        # "Meghan Wagner"
      ],

      catalog_position: :featured,
      publication_date: Time.zone.parse('September 10, 2016 18:00:00 EST'),
      kicker: 'Smarting over Smart Meters',
      title: 'Does smart grid technology have a home in Maryland?',
      dek: 'BG&E is trying to reconcile consumer privacy with service provisioning efficiency.',

      summary: <<-SUMMARY,
      Smart meters, an upgrade from the traditional analogue electric meters, have been heralded as a key step towards the elusive smart grid.  They are designed to facilitate communication between end users and utility companies, to help individuals and communities save on electricity, to help utility companies cut operational costs, and to decrease the risk of costly and life-threatening blackouts during peak summer demands. They are typically considered a win-win-win for electric ratepayers, the utility company, and the environment.  Yet in June 2010, the Maryland Public Service Commission (MPSC) hesitated over a proposal submitted by Baltimore Gas and Electric to roll out smart meters across its service territory and to institute a new electricity pricing plan that would rely on the meters. Commissioner Douglas Nazarian, Chair of the MPSC, needs to decide whether to approve or deny this proposal based on its economic business case, alongside a multitude of other arguments offered by the stakeholders. Facing a decision that could risk losing Maryland $200 million in federal funding, he carefully ponders the costs, benefits, and risks of the proposal.
      SUMMARY
    )

    c_p1 = c.pages.create(position: 1, title: 'Hunting in the Dark')
    c_p1_c1 = c_p1.cards.create(
      position: 1,
      content: <<~CARD
        <p>Chairman Douglas Nazarian sighed as he shuffled through the mail—a few pieces of junk here, some coupons to Giant there. He walked steadily up the driveway, pulling at the discomfort of his tie. June continued to deliver long, hot days, and this Monday had been no different. As evening settled in, the blanket of Maryland’s humidity seemed only to tuck itself tighter around the edges of this quiet Catonsville neighborhood.</p>

        <p>“Hey!” </p>

        <p>Doug looked up, surprised to see his daughter shoot intently into the lacrosse net tethered in the front yard. He smacked a mosquito from his neck and shook his head in disbelief. </p>

        <p>“Lisa? There’s a heat warning in effect.”  </p>

        <p>“What? Whatever, Dad. Mom’s working tonight and she left you dinner.” </p>

        <p>“Did Tracie and you eat already?” he questioned.</p>

        <p>As soon as she responded with “Mhm,” she launched another shot and it was clear the conversation was over. Doug admired her determination to train despite the heat. He smiled and wandered inside, preferring the respite of their air-conditioned and bug-free home. </p>
CARD
    )

    c_p1_c1point5 = c_p1.cards.create(
      position: 2,
      content: <<~CARD
        <p>Nazarian noted that the kitchen smelled tempting as he slipped off his loafers. Wiping sweat from his forehead, and continuing to leaf through the notices and letters, Doug paused at a crisp envelope stamped in the top left with the bold green type of Baltimore Gas and Electric (BGE). “Well I’ll be...” he muttered, reaching blindly into the top drawer by the stove for a letter opener. </p>
        <p>Since becoming Chair of the <a data-edgenote="mpsc">Maryland Public Service Commission (MPSC)</a> two years ago, Doug always found it amusing to fall into the electricity consumer role. His days were filled with case briefings, filings, and court orders that regulated much of the utility industry in the state, and yet he still came home to pay his own bill to one of the same companies he had presided over not even a few hours earlier. </p>
CARD
    )

    c_p1_c1_e1 = c.edgenotes.build
    c_p1_c1_e1.slug = 'mpsc'
    c_p1_c1_e1.caption = 'This short paragraph introduces the structure and function of public service commissions.'
    c_p1_c1_e1.format = :aside
    c_p1_c1_e1.thumbnail_url = 'https://msc-gala.imgix.net/mpsc-commissioners.jpg'
    c_p1_c1_e1.photo_credit = 'Phil Fabrizio. The Town Courier. Gaithersburg. August 31, 2010.'
    c_p1_c1_e1.content = '<h3>Maryland Public Service Commission (MPSC)</h3>
    <p>Utility companies like BGE that are responsible for in-state distribution of electricity to homes, businesses, and industries, often have monopoly power over customers in their service area due to their unique access to the grid infrastructure. Since this monopoly power is structurally unavoidable, states rely on agencies known as “Public Service Commissions” or “Public Utility Commissions” to closely regulate these companies. Public Service Commissioners often have to decide whether proposed utility capital investments in grid infrastructure are cost effective, whether proposed electric rates are just and reasonable, and whether utilities are providing reliable electric service to their customers.  As Chair of the Commission, Nazarian’s job is to preside over these types of proceedings. The purpose of these commissions is to ensure that utilities (electric as well as gas, telecommunications, and other public services) are acting in the best interests of their customers, although specific statutory obligations can vary by state. In Maryland, the Public Service Commission (PSC) was established as far back as 1910.  You can read more about their mission and jurisdictional duties on their <a href="http://www.psc.state.md.us/general-information/" target="_blank">website</a>.</p>
    <figure>
      <img src="https://msc-gala.imgix.net/mpsc-commissioners.jpg" alt="MPRC Commissioners">
    <figcaption>
      Commissioners of the Maryland Public Service Commission at a public hearing in 2010. From left to right: Goldsmith, Brogan, Nazarian, Williams, and Brenner.
    </figcaption>
    </figure>'
    c_p1_c1_e1.save

    c_p1_c2 = c_p1.cards.create(
      position: 3,
      content: <<~CARD
        <p>As Doug unfolded the bill to see the full month’s damages, his mind drifted to tomorrow’s docket where he and his fellow Commissioners were slated to deliberate on BGE’s hefty proposal to roll out smart meters across its service area. The <a data-edgenote="445-page-proposal">445-page proposal</a> was initially filed a year ago, and although the BGE Counsel had requested a timely legislative-style hearing to secure a decision by last fall, the multiple components within the proposal in conjunction with its price tag of almost $840 million required lengthy evidentiary proceedings that had dragged through until early this year. Since the reply briefs had been filed in February, Nazarian had been reviewing the documents alongside fellow Commissioners and the Commission’s attorneys. Tomorrow the Commission would meet in open session to discuss any remaining arguments and to cast a formal vote.</p>
    CARD
    )

    c_p1_c2_e1 = c.edgenotes.build
    c_p1_c2_e1.slug = '445-page-proposal'
    c_p1_c2_e1.caption = 'See BGE’s letter to learn more about the utility company’s intentions at time of filing.'
    c_p1_c2_e1.format = :quote
    c_p1_c2_e1.thumbnail_url = 'https://msc-gala.imgix.net/445-page-proposal-thumb.jpg'
    c_p1_c2_e1.pdf_url = 'https://s3-us-west-2.amazonaws.com/msc-gala/445-page-proposal-pdf.pdf'
    c_p1_c2_e1.instructions = '
    <p>Kimberly Curry, Counsel for BGE, compiled and submitted the company’s initial proposal to the Maryland PSC for consideration. Her cover letter attached to the lengthy document reveals the utility’s interest in a speedy decision due to their hopes to secure funding support from the Federal Department of Energy (DOE).  Should you be interested, you can peruse the full proposal at your leisure from the <a href="http://webapp.psc.state.md.us/intranet/casenum/caseaction_new.cfm?casenumber=9208" target="_blank">Maryland PSC case docket website</a>. The proposal is the first filing in this list. </p>'
    c_p1_c2_e1.save

    c_p1_c3 = c_p1.cards.create(
      position: 4,
      content: <<~CARD
        <p>The sheer weight of the case hurt his head to consider. BGE was the <a data-edgenote="maryland-utility-landscape">largest electric service provider</a> in the state and, with two other investor-owned utilities having filed similar proposals, this decision would surely set the precedent for the future of smart-grid technologies across Maryland. Not only was BGE proposing to roll out 1.36 million electric smart meters in the next three years, the company was also seeking approval to launch a mandatory “Smart Energy Pricing” (SEP) time of use rate, and to recover the full costs of this initiative by adding a surcharge to customer bills.  On the one hand, smart meters were being rolled out nationwide--Detroit, Houston, and Miami to name a few places--and they had the potential to facilitate great reductions in state electricity demands. On the other hand, Nazarian and the other Commissioners were concerned that structuring cost recovery through a surcharge would shift all risks of the project to rate payers. Now what did that representative from the Office of People’s Counsel (OPC) say? Oh yeah, something about their proposal made it simply too easy for a business to make “pie in the sky” promises when the business bears no financial risk and pays no penalty if those promises are never fulfilled. </p>
        <p>Sighing, he set down the BGE bill, but as he reached to open the cupboard for a plate, something caught his eye. “One hundred and fifty dollars?!” Doug exclaimed. He shook his head and wondered how their utility bill could jump so high in just thirty days. Abnormally high. Glaring at the white paper bearing the bad news, he thought about what could be to blame in his household of four. Sure, the air conditioning had been working overtime because of the recent heat wave, but it seemed essential to keep it on, especially with two athletic daughters charging through to cool off between camps, sports, and neighborhood games. Likewise, the refrigerator and electric stove served as the ‘hearth of the home’ and provided much-needed sustenance.</p>
CARD
    )

    c_p1_c3_e1 = c.edgenotes.build
    c_p1_c3_e1.slug = 'maryland-utility-landscape'
    c_p1_c3_e1.caption = 'Utility Landscape across Maryland in 2010'
    c_p1_c3_e1.format = :graphic
    c_p1_c3_e1.thumbnail_url = 'https://msc-gala.imgix.net/maryland-utility-landscape.jpg'
    c_p1_c3_e1.image_url = 'https://msc-gala.imgix.net/maryland-utility-landscape.jpg'
    c_p1_c3_e1.photo_credit = 'Maryland Department of Natural Resources'
    c_p1_c3_e1.instructions = 'Around the time of this decision, the Maryland PSC regulated 13 different electric distribution utilities ranging from municipal systems, to rural cooperatives, to investor-owned companies. Despite this relatively large number of utilities in the state, BGE alongside just three other investor-owned entities serviced over 90% of Maryland customers, and BGE had the lion’s share. Consequently, Commission orders that regulated these four investor-owned companies had an outsized effect on Maryland ratepayers. This map reveals the 2010 service areas of each utility group in Maryland.
    '
    c_p1_c3_e1.save

    c_p1_c4 = c_p1.cards.create(
      position: 5,
      content: <<~CARD
        <p>This thought piqued his interest and soon Commissioner Nazarian found himself padding barefoot around the house, seeking out the stray appliances and electronic devices that lurked in dark corners, on a father’s hunt to see what really needed to stay on. As he clicked appliances off slowly, he considered their value to the family’s daily life. It became clear that there were some things he was willing to pay a whole lot to have functional, whereas there were other items he could do without. As he thought about the family’s needs, tastes, and priorities, some things just weren’t worth the extra <a data-edgenote="energy-unit">kilowatt-hours per month</a> on his utility bill. </p>
        <p>He continued his evaluation. Coffee machine? Critical. Laptop? Useful for the girls’ homework… but there was also a desktop. Flat screen TV? Perhaps a little excessive. </p>
CARD
    )

    c_p1_c4_e1 = c.edgenotes.build
    c_p1_c4_e1.slug = 'energy-unit'
    c_p1_c4_e1.caption = 'How much energy do common home appliance consume? Find the answer in this infographic while learning more about how utility companies think about energy.'
    c_p1_c4_e1.format = :graphic
    c_p1_c4_e1.thumbnail_url = 'https://msc-gala.imgix.net/energy-unit-thumb.png'
    c_p1_c4_e1.image_url = 'https://msc-gala.imgix.net/energy-unit.jpg'
    c_p1_c4_e1.photo_credit = 'Jackson Electric Membership Corporation'
    c_p1_c4_e1.instructions = '<p>“Energy” is the product of an appliance’s power needs multiplied by the amount of time that the appliance runs. While many electronics and appliances require a certain number of watts of electricity, over time this sums up to hundreds or thousands of watts used during a month, which is why your monthly utility bill typically uses the units kWh, or “kilowatt-hours.”  One kilowatt-hour equals 1,000 watt-hours. Scaling up, while households think in terms of kilowatt-hours, utilities think more about megawatt-hours (MWh) because of the sheer quantity of energy they manage.  One megawatt-hour equals 1,000 kilowatt-hours.</p>
    <p>While kWh are sold by the cents to households, megawatt-hours are traded between electric transmission and distribution companies by the tens to hundreds of dollars. The translation is simple though, 12 cents/kWh = 120 $/MWh (they are equivalent prices). Review the chart below for reference to see how different household appliances stack up in their energy demands. You can also estimate your own home energy use using an <a href="http://energy.gov/energysaver/estimating-appliance-and-home-electronic-energy-use">online calculator</a> provided by the U.S. Department of Energy.</p>
    '
    c_p1_c4_e1.save

    c_p1_c5 = c_p1.cards.create(
      position: 6,
      content: <<~CARD
        <p>“Daddy, what are you doing?” Tracie giggled as she watched her father creep in front of the television, unaware of her presence. Her voice brought Doug back to reality so he stopped what he was doing and smiled, finding that he had grown hungry for food and that his appetite for this ‘useful versus useless’ electronics hunt was waning. </p>
        <p>“Oh nothing, honey,” and with that, Doug returned to his kitchen for a heap of spaghetti and resolved to put aside the upcoming commission deadline--and all utility concerns for that matter--until tomorrow. </p>
CARD
    )

    x = c_p1.cards.create(
      position: 100,
      content: <<~CARD
        <p>Take a moment to see how the Commissioner’s appliance hunt can be graphed to reveal his household demand for electricity. Download the first quantitative exercise <a href="https://s3-us-west-2.amazonaws.com/msc-gala/nazarian-household-demand-for-electricity.xlsx"><strong>Nazarian’s Household Demand for Electricity</strong></a>, and follow the enclosed instructions before continuing with this narrative.</p>
    CARD
    )

    c_p2 = c.pages.create(position: 2, title: 'Power to the People with Peaker Plants')
    c_p2_c1 = c_p2.cards.create(
      position: 1,
      content: <<~CARD
        <p>“It’s going to be another scorcher. Today is forecast to reach a high of 95 with a heat index of almost 99. Health officials recommend staying safe and keeping cool.  Representatives from BGE say we are approaching our peak power usage this week, and while we are not in danger of any blackouts or brownouts just yet, the utility company is <a data-edgenote="beat-the-heat">asking you to conserve</a> in some very specific ways.” </p>
        <p>At that moment, the churn of the coffee machine drowned out the WBAL-TV 11 morning news, and Commissioner Nazarian welcomed the smell of fresh coffee, having not slept well the night before. How timely that he should be deliberating on a smart meter rollout proposal just as the city around him approached peak demand for electricity, straining BGE’s transmission systems and risking life-threatening blackouts and brownouts across Baltimore. </p>
CARD
    )

    c_p2_c1_e1 = c.edgenotes.build
    c_p2_c1_e1.slug = 'beat-the-heat'
    c_p2_c1_e1.caption = 'BGE uses the media, and the notable weather conditions, to help spread their message about avoiding peak energy use. Here is the original news clip from the local TV station.'
    c_p2_c1_e1.format = :video
    c_p2_c1_e1.thumbnail_url = 'https://msc-gala.imgix.net/beat-the-heat-thumb.jpg'
    c_p2_c1_e1.embed_code = '<iframe src="https://www.youtube.com/embed/ZS1m3T5wwmw" frameborder="0" allowfullscreen></iframe>'
    c_p2_c1_e1.save

    c_p2_c2 = c_p2.cards.create(
      position: 2,
      content: <<~CARD
        <p>Hoping to get a head start on what was sure to be a long and challenging day, Doug hustled to suit up for the office, straighten his tie, and head out the door. Despite his early efforts, the traffic that morning was grueling coming from the western suburbs where several highways converge on the approach to downtown. As he inched along I-95 approaching his exit onto I-395 North, he glanced out of the passenger side window and saw in the distance a jumbled mass of high-voltage transmission lines and transformers sprawled near the shore of the Patapsco River. </p>
        <p>Although most drivers suffering in traffic next to him took no notice of the facility, Commissioner Nazarian knew all too well that this was the Westport Generating Station, one of many natural gas peaker plants that speckled the edge of the city and that were used to supply power during peak electric demand periods. Indeed, nearby sat the <a data-edgenote="gould-street-generating-station">Gould Street Generating Station</a>, another plant that remained idle except when extreme summer heat and humidity drove up demand for air conditioning, when it then kicked into overtime to help prevent blackouts and brownouts. “All that capital investment for a plant that only turns on a few times per year…” Commissioner Nazarian mused as he drifted past. </p>
CARD
    )

    c_p2_c2_e1 = c.edgenotes.build
    c_p2_c2_e1.slug = 'gould-street-generating-station'
    c_p2_c2_e1.caption = 'Explore the operations of a peaker plant in Maryland through EIA’s interactive graph.'
    c_p2_c2_e1.format = :aside
    c_p2_c2_e1.thumbnail_url = 'https://msc-gala.imgix.net/gould-street-generating-station.jpg'
    c_p2_c2_e1.photo_credit = 'Michael Dean'
    c_p2_c2_e1.content = '<p>The US Energy Information Administration (EIA) provides data on how much electricity (in megawatt-hours) is produced by each power plant across the country. Scroll over their interactive graph for the Gould Street Generating Station <a href="http://www.eia.gov/electricity/data/browser/#/plant/1553?freq=M&start=200801&end=201212&ctype=linechart&ltype=pin&columnchart=ELEC.PLANT.GEN.1553-ALL-ALL.M&linechart=ELEC.PLANT.GEN.1553-ALL-ALL.M&pin=&maptype=0">here</a> to see how the plant mainly operates during the hot summer months.</p>
    <figure>
    <img src="https://msc-gala.imgix.net/gould-street-generating-station.jpg" alt="Gould Street Generating Station">
    <figcaption>
    <p>Gould Street Peaker Plant</p>
    </figcaption>
    </figure>'
    c_p2_c2_e1.save

    c_p2_c3 = c_p2.cards.create(
      position: 3,
      content: <<~CARD
        <p>Unfortunately, the problem of peak demand wasn’t going away anytime soon. Central Maryland had been plagued for years by a shortage of local electricity generation and the state needed to import power from other regions in the <a data-edgenote="electricity-generation-transmission-and-distribution">PJM Interconnection</a>, a regional electric transmission system and wholesale electricity market covering much of the Mid-Atlantic and eastern Midwest. Furthermore, with <a data-edgenote="regional-energy-demand-and-adaptations-to-climate-change">climate change</a> threatening to increase the frequency of extreme weather, and to raise the average regional temperatures, summer electricity demand could be expected to rise in the future.</p>
        <p>It might sound all well and good that Maryland could fire up peak power plants as well as rely on electricity sources from the regional transmission grid, but these “solutions” came with their own challenges. Importing large volumes of power during peak demand periods tended to clog the overburdened transmission system, leading to congestion costs that were ultimately borne by utility customers in the form of higher electric rates. In 2008, BGE alone paid upwards of $92 million in these costs to service their customers at peak demand times. <cite><a href="http://www.monitoringanalytics.com/reports/PJM_State_of_the_Market/2008/2008-som-pjm-volume1.pdf">Monitoring Analytics, LLC, “2008 State of the Market Report for PJM Volume 1: Introduction,” (independent market report for PJM, 2009), 53</a></cite></p>
CARD
    )

    c_p2_c3_e1 = c.edgenotes.build
    c_p2_c3_e1.slug = 'electricity-generation-transmission-and-distribution'
    c_p2_c3_e1.caption = 'What’s the difference between electricity generation, transmission, and distribution across the grid? Listen to this audio clip to find out.'
    c_p2_c3_e1.format = :audio
    c_p2_c3_e1.thumbnail_url = 'https://msc-gala.imgix.net/electricity-generation-transmission-and-distribution-thumb.jpg'
    c_p2_c3_e1.instructions = '<p>Regional Transmission Organizations, or RTOs, are responsible for operating and maintaining transmission infrastructure. They basically act like distribution utility companies but at a much larger scale and with higher-voltage power lines. Since transmission lines cross state boundaries in order to link generation plants to distribution utilities, RTO operations are regulated by a Federal government agency called FERC (or the Federal Energy Regulatory Commission), which acts similar to a state-level Public Service Commission. The PJM Interconnection is an RTO that manages transmission of electricity across much of the Eastern seaboard. Distribution utility companies like BGE communicate frequently with PJM to purchase electricity from the wholesale market that they then can provide to residential, business, and industrial customers in their service area.</p>

    <p>Listen to Liz Dalton, representative from the US Department of Energy, explain the difference between electricity generation, transmission, and distribution.</p>'
    c_p2_c3_e1.embed_code = '<iframe src="https://www.youtube.com/embed/4__t0lRgrX8?start=497&end=735" frameborder="0" allowfullscreen></iframe>'
    c_p2_c3_e1.save

    c_p2_c3_e2 = c.edgenotes.build
    c_p2_c3_e2.slug = 'regional-energy-demand-and-adaptations-to-climate-change'
    c_p2_c3_e2.caption = 'Check out this paper on how climate change impacts Maryland’s energy use patterns.'
    c_p2_c3_e2.format = :link
    c_p2_c3_e2.thumbnail_url = 'https://msc-gala.imgix.net/regional-energy-demand-and-adaptations-to-climate-change-thumb.jpg'
    c_p2_c3_e2.image_url = 'https://msc-gala.imgix.net/regional-energy-demand-and-adaptations-to-climate-change-thumb.jpg'
    c_p2_c3_e2.website_url = 'http://www.sciencedirect.com/science/article/pii/S0301421505001175'
    c_p2_c3_e2.content = '<p>Much effort has been put into understanding the multitude of challenges presented by climate change. If you’re interested, check out this 2006 paper which makes predictions on how climate change could impact energy demand specifically in Maryland. </p>
    <p>This paper is owned by Elsevier. If you are associated with an educational institution, you may be able to get the paper for free by clicking institutional log in.</p>
    '
    c_p2_c3_e2.save

    c_p2_c4 = c_p2.cards.create(
      position: 4,
      content: <<~CARD
        <p>Additionally, because the primary fuel for ramping up electricity supply to meet peak demand is natural gas, the wholesale prices that BGE pays for electricity to deliver to its customers are deeply vulnerable to spikes in natural gas prices, like the summer 2008 spike that saw the maximum natural gas price double compared to the minimum the previous winter.<cite><a href="https://www.eia.gov/dnav/ng/hist/rngwhhdD.htm">“Henry Hub Natural Gas Spot Price,” U.S. Energy Information Administration, interactive graph, last modified August 31, 2016</a></cite>  These costs, too, are ultimately borne by utility customers. In the wake of the 2008 <a data-edgenote="market-collapse">financial market collapse</a> and recession, any increase in electricity bills puts significant strain on many struggling Maryland households and businesses. </p>
        <p>Doug also knew that, beyond immediate costs, there were significant environmental implications associated with peak electricity generation: because natural gas is a fossil fuel, it contributes to global warming, both through combustion and methane leakage in the production and distribution network. In addition, building new generating facilities and transmission lines sometimes came with land use change and habitat destruction. There had to be some alternative way to address peak demand to alleviate these costs on the consumers and the environment.</p>
        <p>“I guess these plants should be firing up soon in this weather,” he muttered to himself. “I suppose it makes sense that hot days should increase demand for electricity. After all, I’m more willing to pay for air conditioning in June than in January.” As his car lurched forward in the cacophony of honks, Commissioner Nazarian thought more about city-wide electricity demand, and how weather played an important role. </p>
CARD
    )

    x = c_p2.cards.create(
      position: 100,
      content: <<~CARD
        <p>You can use economics to analyze the impacts of peak electricity demand. To do this, download the second quantitative exercise <a href="https://s3-us-west-2.amazonaws.com/msc-gala/peak-electricity-demand.xlsx"><strong>Peak Electricity Demand</strong></a>, and follow the enclosed instructions before continuing with this narrative.</p>
    CARD
    )

    c_p2_c4_e1 = c.edgenotes.build
    c_p2_c4_e1.slug = 'market-collapse'
    c_p2_c4_e1.caption = 'Financial crises can be tough on the wallet and tough on the psyche. Back in 2009, just following the 2008 market collapse, a local Baltimore paper discussed the psychological stresses associated with the Great Recession and even highlighted the pressures that come with high utility bills. Finding ways to mitigate these electricity costs during hard financial times would be critical for the PSC.'
    c_p2_c4_e1.format = :link
    c_p2_c4_e1.thumbnail_url = 'https://msc-gala.imgix.net/market-collapse-thumb.jpg'
    c_p2_c4_e1.image_url = 'https://msc-gala.imgix.net/market-collapse-screenshot.png'
    c_p2_c4_e1.website_url = 'https://msc-gala.imgix.net/market-collapse-screenshot.png'
    c_p2_c4_e1.save

    c_p3 = c.pages.create(position: 3, title: 'Smart Grid Possibilities')
    c_p3_c1 = c_p3.cards.create(
      position: 1,
      content: <<~CARD
        <p>“Yikes!” The Commissioner gasped as he slammed on the brakes allowing a reckless weaver to push through the traffic. Hot coffee splashed across his freshly laundered suit. “Ok mister ‘Choose Civility in Howard County,’ save some for the race track,” he thought to himself. He muttered frustrations quietly as he reached over to the glove compartment for a few napkins. Rising temperatures even this early in the morning made Doug cranky, so he turned up the air to dry his suit and cool off. Distracting his frustration, the Commissioner let his thoughts wander back to the challenges introduced by hot weather and peak electricity demand. </p>
        <p>Fortunately, solutions other than the construction of new natural gas peaker plants had been proposed to meet summer demand. There was rising public interest and investment in the “smart grid”, a collection of technologies attached to the current electricity grid that would allow for two-way communication between distribution utility companies and their customers. This <a data-edgenote="positive-impact-of-smart-grid">two-way communication</a> effectively increases the grid’s capacity without requiring the construction of new peaker plants.  This technology also saves utility companies money as the reduction in peak demand lowers strain on transmission and distribution infrastructure, thereby lowering maintenance costs. </p>
CARD
    )

    c_p3_c1_e1 = c.edgenotes.build
    c_p3_c1_e1.slug = 'positive-impact-of-smart-grid'
    c_p3_c1_e1.caption = 'Can you imagine how an integrated smart grid, with smart meter technologies, could provide for operational savings and a multitude of other benefits to Maryland consumers?'
    c_p3_c1_e1.format = :video
    c_p3_c1_e1.thumbnail_url = 'https://msc-gala.imgix.net/positive-impact-of-smart-grid-thumb.png'
    c_p3_c1_e1.embed_code = '<iframe src="https://www.youtube.com/embed/4L31dHXP6i0" frameborder="0" allowfullscreen></iframe>'
    c_p3_c1_e1.save

    c_p3_c2 = c_p3.cards.create(
      position: 2,
      content: <<~CARD
        <p>One way that the bidirectional communication works is by using data from smart meters to affect consumer behavior. In contrast to traditional electric meters, smart meters transmit electric consumption data to utilities in real time, on an hourly basis, which allows utilities to provide more granular usage data back to their customers. The presumption is, once people can more accurately track when and how they are using electricity throughout the day, they will be better informed and thus more likely to conserve. The cool thing about them, Doug thought, was that they can be linked to <a data-edgenote="in-home-display">in-home display</a> devices that not only show consumers how much electricity they’re using, in real time, but also provide opportunities to link to smart appliances that can be programmed to operate only during off-peak times of the day.</p>
    CARD
    )

    c_p3_c2_e1 = c.edgenotes.build
    c_p3_c2_e1.slug = 'in-home-display'
    c_p3_c2_e1.caption = 'Explore the psychological science behind in-home displays. '
    c_p3_c2_e1.format = :aside
    c_p3_c2_e1.thumbnail_url = 'https://msc-gala.imgix.net/in-home-display-thumb.jpg'
    c_p3_c2_e1.photo_credit = 'http://www.powermeterstore.com/'
    c_p3_c2_e1.content = '<p>Since the energy consumed between identical housing structures can vary wildly, it is clear that household behavior plays an important role in energy conservation strategies. Convincing households to change their electricity consumption patterns is a subject of much interest in the field of environmental psychology. Researchers have explored some of the primary drivers for pro-environmental behavior and the impacts of feedback on these behaviors. Feedback refers to the process of providing information to consumers about their behavior that they can then use to adjust their behavior in the future.</p>
    <p>Past research has identified several moderator variables that impact the effect of this feedback. These include, but are not limited to, the feedback’s frequency, medium, measurement, granularity, and duration. In-home displays, like the one pictured above, are technologies that attempt to capitalize on knowledge gained from the environmental psychology field by integrating these different components of feedback to most effectively encourage conservation behaviors.  For example, notice how the display includes “dollars spent” as a unit of measurement, attempting to create a more relatable metric. This is an evolving science, however, and the effect sizes of these different moderator variables remain up for debate.</p>'
    c_p3_c2_e1.save

    c_p3_c3 = c_p3.cards.create(
      position: 3,
      content: <<~CARD
        <p>Beyond providing more granular usage data, smart meters also help utility companies structure incentives that further encourage customers to conserve energy. Since smart meters allow utilities to track exactly when households draw each kWh, the company can then charge customers higher rates for consumption during peak demand periods and lower rates for consumption during off-peak periods. Smart meters also enable a company to offer rebates for a household that actually reduces its electricity usage during peak periods relative to some historical baseline, thereby helping households save money.  These mechanisms are designed to incentivize customers to reduce electricity consumption during times when the electric grid is most strained. Collectively, these price signals and consumer information technologies are known as <a data-edgenote="demand-response-programming">demand response strategies</a>.</p>
        <p>The Maryland Energy Administration (MEA) along with the US Department of Energy (DOE) believed that <a data-edgenote="maryland-energy-goals">energy efficiency and other demand response technologies</a> could be among the most cost-effective ways to address peak demand issues.  “Well, there’s one point for BGE’s proposal,” Nazarian mused. “Both the DOE leadership and the governor would like to see these smart meters rolled out across the state.” </p>
        <p>Considering this, the Commissioner reflected on the filings submitted by the MEA. The state agency repeatedly emphasized that installing smart meters was the critical first step and foundation to support advanced infrastructure and enhance Maryland’s energy future. Smart meters were clearly important because they allowed for Maryland to move towards this smarter electric grid.</p>
CARD
    )

    c_p3_c3_e1 = c.edgenotes.build
    c_p3_c3_e1.slug = 'demand-response-programming'
    c_p3_c3_e1.caption = 'Read more about demand response programming. '
    c_p3_c3_e1.format = :link
    c_p3_c3_e1.thumbnail_url = 'https://msc-gala.imgix.net/demand-response-programming-thumb.jpg'
    c_p3_c3_e1.image_url = 'https://msc-gala.imgix.net/demand-response-programming-screenshot.png'
    c_p3_c3_e1.website_url = 'http://energy.gov/oe/services/technology-development/smart-grid/demand-response'
    c_p3_c3_e1.instructions = '<p>BGE calls their time-of-use (TOU) pricing scheme “smart energy pricing” or SEP. Assuming that customers respond to price signals, TOU pricing schemes are a crucial component of demand-side management of electricity. This is also known as demand response programming</p>'
    c_p3_c3_e1.save

    c_p3_c3_e2 = c.edgenotes.build
    c_p3_c3_e2.slug = 'maryland-energy-goals'
    c_p3_c3_e2.caption = 'Listen to NPR’s Richard Harris review Maryland’s ambitious EmPOWER goals.'
    c_p3_c3_e2.format = :audio
    c_p3_c3_e2.thumbnail_url = 'https://msc-gala.imgix.net/maryland-energy-goals-thumb.jpg'
    c_p3_c3_e2.image_url = 'https://msc-gala.imgix.net/maryland-energy-goals.jpg'
    c_p3_c3_e2.website_url = 'http://www.npr.org/templates/story/story.php?storyId=93032462'
    c_p3_c3_e2.photo_credit = 'The Denver Post'
    c_p3_c3_e2.instructions = '<p>In April 2008, Maryland Governor Martin O’Malley signed into legislation the “EmPOWER Maryland Energy Efficiency Act,” which set a goal for Maryland to reduce per capita electricity consumption and peak electricity demand by 15% compared with 2007 levels by 2015.</p>
    <p>While a lot of this programming focused on improving home energy efficiencies that would reduce electricity consumption in general, the Maryland Energy Administration also encouraged the adoption of technologies that would specifically help shift demand away from peak hours. In fact, in August of that same year, Governor O’Malley addressed the Maryland Association of Counties and laid out his vision for Maryland’s energy future, including “an acceleration of the deployment of so-called smart meters and smart pricing” for consumers to reduce peak demand.</p>'
    c_p3_c3_e2.content = '<p><a href="http://www.npr.org/templates/story/story.php?storyId=93032462">Listen here to NPR’s Richard Harris review this ambitious decision to focus on demand-side management.</a></p>'
    c_p3_c3_e2.save

    c_p3_c4 = c_p3.cards.create(
      position: 4,
      content: <<~CARD
        <p>There were so many benefits in addition to lower household utility bills that smart meters could facilitate--from lower operations costs, to promoting net metering capabilities for households connecting their renewable generators to the grid, to helping the state meet its EmPOWER goals for peak demand and energy demand reductions. With so much potential benefit arising from this technology, the rollout seemed like a no-brainer. </p>
        <p>While still contemplating this complicated decision, Commissioner Nazarian pulled into the parking garage under the William Donald Schaefer Tower. He thought that, in many ways, smart meters seemed like a great way to facilitate programs that would alleviate peak demand, but as with many utility investment initiatives, the devil was in the details.</p>
CARD
    )

    c_p4 = c.pages.create(position: 4, title: 'Smart Energy Pricing')
    c_p4_c1 = c_p4.cards.create(
      position: 1,
      content: <<~CARD
        <p>Commissioner Nazarian greeted his administrative assistant on the way into his office, where he in turn was greeted by a monumental stack of BGE-related documents about the smart meter rollout proposal. The documents were BGE’s original application, as well as the testimony, comments, and briefs filed by stakeholders in the proceeding, including the technical staff of the MPSC, the MEA, the Maryland Office of People’s Counsel (OPC), and the Maryland Chapter of the American Association of Retired Persons (AARP).  Nazarian knew he was pressed for time and would have to skim them, but he wanted to review the specifics of BGE’s application before entering into deliberation with the rest of the Commissioners. </p>
        <p>At its core, the proposal contained a threefold request. BGE was asking: </p>
        <ol>
        <li>To replace all electric and gas meters in its service area with 1.36 million electric smart meters and 730,000 natural gas smart meters between 2010 and 2013</li>
        <li>To use the smart meters to launch a mandatory Smart Energy Pricing (SEP) time of use rate that would reduce peak demand</li>
        <li>To recover costs of the program through a tracker surcharge on customer bills</li>
        </ol>
        <p>Commissioner Nazarian was intrigued by the new mandatory SEP time of use (TOU) rate structure outlined within the proposal. As part of its smart meter rollout, BGE was proposing a new mandatory rate structure for all residential electric customers in its service territory, estimated to begin in June 2012 once smart meters were installed in all residential properties. During peak demand periods, which were defined as non-holiday weekdays from 2:00 to 7:00 PM during the months of June to September, customers would be charged approximately 16.58 cents per kilowatt-hour (kWh) of electricity consumed. During all other periods, known as “off-peak” periods, customers would be charged approximately 10.69 cents/kWh.<cite>Jason Manuel, “Prepared Direct Testimony of Jason M. B. Manuel on Behalf of Baltimore Gas and Electric Company,” (direct testimony to Maryland Public Service Commission Case No. 9208, 2009), 4-5.</cite> These rates can be compared to the 2010 average flat-rate price of 14.32 cents/kWh for residential electric customers.<cite><a href="http://www.eia.gov/electricity/state/archive/sep2010.pdf ">U.S. Energy Information Administration, “State Electricity Profiles 2010,” (government report, Washington, DC, 2012), 125.</a></cite></p>
CARD
    )
    c_p4_c2 = c_p4.cards.create(
      position: 2,
      content: <<~CARD
        <p>Considering what Commissioner Nazarian knew about the shape of his own electricity demand curve and aggregate demand, he wondered what impact this pricing structure might have on the quantity of electricity consumed and total consumer expenditure on electricity. Knowing that this would take a minute to consider, he grabbed his Miss Piggy Pez dispenser from the nearest barrister bookcase, popped in a strawberry Pez, and chewed on some economics. </p>
    CARD
    )

    x = c_p4.cards.create(
      position: 100,
      content: <<~CARD
        <p>Before continuing with this narrative, download the third quantitative exercise <a href="https://s3-us-west-2.amazonaws.com/msc-gala/economics-of-smart-energy-pricing.xlsx"><strong>The Economics of Smart Energy Pricing</strong></a>, and follow the enclosed instructions to explore how BGE’s proposed time-of-use rate structure will impact market demand for electricity in Maryland.</p>
    CARD
    )

    c_p4_c3 = c_p4.cards.create(
      position: 3,
      content: <<~CARD
        <p>Accepting and appreciating the potential for a new SEP rate structure to reduce residential electricity consumption during peak hours, Commissioner Nazarian turned to BGE’s cost-benefit analysis. He knew that as a Commissioner, it was his duty to ensure the efficient delivery of public services. That being said, the program’s benefits had to clearly outweigh its costs.</p>
        <p>For the life of the new meters--estimated to be about 15 years--BGE calculated that the total <a data-edgenote="basics-of-npv">Net Present Value (NPV)</a> of benefits associated with the program amounted to about $1.27 billion, of which approximately $267 million, or 21%, would be due to operational savings and avoided capital costs. In effect, the advanced meter infrastructure (AMI), or smart meters, would allow the utility company to eliminate the need for on-site meter readings, to efficiently turn on and disconnect services remotely, and to detect outages remotely without customer notification, potentially expediting the restoration of service. Much of the 79% of other benefits were expected to come from reduced electricity demand that occurred because of the new SEP pricing structure. BGE would effectively be able to sell the electricity saved from turning down demand back into the wholesale market and thereby generate revenue. Predicted costs, by comparison, were generally associated with the cost of the meters, their deployment, and operational and maintenance expenses.  Summed up, these costs amounted to about $529 million in total NPV. All told, <a data-edgenote="benefits-cost-ratio">this led to a benefit-cost ratio of 2.4.</a></p>
        <p>While this analysis certainly painted a rosy picture of the proposal, Commissioner Nazarian’s instinct as a litigator kicked in and he grew somewhat skeptical of the estimated benefit-cost ratio. He also knew that a favorable benefit-cost ratio was not the only factor that should affect his decision. Unfortunately, the time had arrived for the Commissioner to join his peers in the hearing room for the final deliberation and vote, so he packed up his materials and headed down the hallway.</p>
CARD
    )

    c_p4_c3_e1 = c.edgenotes.build
    c_p4_c3_e1.slug = 'basics-of-npv'
    c_p4_c3_e1.caption = 'Understand the basics of NPV'
    c_p4_c3_e1.format = :video
    c_p4_c3_e1.thumbnail_url = 'https://msc-gala.imgix.net/basics-of-npv-thumb.png'
    c_p4_c3_e1.embed_code = '<iframe src="https://www.youtube.com/embed/Mol1yT7tczY?start=0&end=95" frameborder="0" allowfullscreen></iframe>'
    c_p4_c3_e1.instructions = '<p>Net present value represents how much future costs or benefits mean to you, the decision maker, today. For example, if offered the choice of receiving something desirable now or later, most of us would choose to have it now. The same thing, offered later, is worth less to us today simply because we would have to wait for it. This process of discounting future values is a critical component of cost-benefit analyses that recognizes not all costs and benefits of a project are incurred immediately. If you’d like to learn more about intertemporal decision-making, review the video.</p>'
    c_p4_c3_e1.save

    c_p4_c3_e2 = c.edgenotes.build
    c_p4_c3_e2.slug = 'benefits-cost-ratio'
    c_p4_c3_e2.caption = 'Understand why the benefit-cost ratio is used as a barometer for decision-making.'
    c_p4_c3_e2.format = :graphic
    c_p4_c3_e2.thumbnail_url = 'https://msc-gala.imgix.net/benefits-cost-ratio.jpg'
    c_p4_c3_e2.image_url = 'https://msc-gala.imgix.net/benefits-cost-ratio.jpg'
    c_p4_c3_e2.instructions = '<p>Benefit-cost ratios, also known as total resource costs, are a simple way to condense information from an economic analysis of a proposed project or initiative in a format that provides a basis for decision-making. If the ratio is greater than 1, then the benefits outweigh the costs, thereby supporting the value of the proposal. This is a table pulled from BGEs original proposal, which outlines the benefits and costs considered by the company as well as the benefit-cost ratio of the smart meter initiative. If you would like, you can <a href="https://s3-us-west-2.amazonaws.com/msc-gala/cost-benefit-analysis-of-smart-grid-proposal.pdf">review this analysis in depth</a>.</p>'
    c_p4_c3_e2.save

    c_p5 = c.pages.create(position: 5, title: 'The Commission Deliberation')
    c_p5_c1 = c_p5.cards.create(
      position: 1,
      content: <<~CARD
        <p>The Commissioners filed into the 16th Floor Hearing Room quietly. </p>
        <p>“Nice coffee tie dye, Doug,” whispered Commissioner Williams, gesturing at the stain Doug had tried to wipe down earlier in the day. </p>
        <p>“Don’t ask,” Nazarian retorted. “Listen, it’s wonderful to see you all today.  Before we vote, I’m struggling with grasping the full weight of this proposal and thought it would be useful to talk a few things out. I’m particularly curious about the benefit-cost analysis and its critics’ arguments.”</p>
        <p>“You and me both, Doug.” Commissioner Williams smiled conspiratorially and Nazarian nodded back indicating for him to continue. “Frankly, I’m wary about those benefit estimates. I mean, <a data-edgenote="benefits-and-cost-in-bge-proposal">almost 80% of their benefits</a> are based on the assumption that behavior will change, and people will use less electricity.”</p>
        <p>“Well, they did base those estimates off of the results of their two-year pilot study, and also low-balled it by assuming only a 1% savings in electricity consumption, which is pretty modest,”  Doug countered, glad to have an opportunity to think this through. </p>
CARD
    )

    c_p5_c1 = c_p5.cards.create(
      position: 2,
      content: <<~CARD
        <p>“Listen, how are a bunch of fancy smart meters sending waves of information remotely to the utility company going to tell the household anything about their own consumption patterns?” Williams replied. “Those BGE pilot test participants received in-home displays, and an ‘appreciation payment’ for their participation. This proposal does not include the costs to the consumer for installation of those types of in-home devices, nor does it consider the future costs for their upkeep. These are crucial towards realizing any household behavior changes.”</p>
        <p>“They could always look up their usage data on the BGE web portal,” Doug challenged. “In-home displays are not the only way to tell households about their consumption patterns.”</p>
        <p>“Sure, that’s assuming everyone has internet access, and that they check the website regularly enough for it to have an appreciable effect on their immediate behaviors,” Williams responded.</p>
CARD
    )

    c_p5_c1_e1 = c.edgenotes.build
    c_p5_c1_e1.slug = 'benefits-and-cost-in-bge-proposal'
    c_p5_c1_e1.caption = 'See the breakdown of benefits and costs in the BGE proposal. '
    c_p5_c1_e1.format = :graphic
    c_p5_c1_e1.thumbnail_url = 'https://msc-gala.imgix.net/benefits-and-cost-in-bge-proposal.jpg'
    c_p5_c1_e1.image_url = 'https://msc-gala.imgix.net/benefits-and-cost-in-bge-proposal.jpg'
    c_p5_c1_e1.instructions = '<p>The graph below breaks down the numbers in the table you saw earlier. Commissioner Williams’ comment relates to the breakdown of benefits. While the total benefits outweigh the costs, this Commissioner believes that the larger SEP benefits, those based on the pricing proposal, are less reliable than the estimated AMI benefits. Since the AMI benefits alone do not outweigh the costs, the validity of this benefit-cost analysis hinges on the strength of the assumptions made in the SEP benefits calculation. </p>'
    c_p5_c1_e1.save

    c_p5_c2 = c_p5.cards.create(
      position: 3,
      content: <<~CARD
        <p>Commissioner Brenner joined the conversation, “Yes, so maybe the benefit estimates are a little inflated based on a pilot study that was limited in scope. I don’t think that means we can immediately reject the SEP benefits in total, or the entire proposal. I’m convinced BGE did sufficient sensitivity testing around their numbers, still coming up with a favorable benefit-cost ratio. Besides, like Commissioner Nazarian has said, in-home displays are not the only way to change electricity consumption behavior, and the company has not only discussed an education plan but also included its costs in the benefit-cost analysis.”</p>
        <p>“First of all,” Williams countered again, “that education plan is non-existent. Especially considering how many people within the Baltimore area whose meters are located indoors, there could be considerable backlash if that’s not done right. I’ve already heard some <a data-edgenote="advocacy-group">rumors of an advocacy group concerned about the health effects of these meters</a>. If this rollout isn’t done right, we could have a public relations nightmare on our hands.”</p>
        <p>“That’s true, <a data-edgenote='bakersfield'>we wouldn’t want another Bakersfield</a> here in Maryland,” Brenner consented. </p>
CARD
    )

    c_p5_c2 = c_p5.cards.create(
      position: 4,
      content: <<~CARD
        <p>“Second,” he continued the tirade, “for the estimated benefits to be realized, people’s behaviors are supposed to change in response to the new SEP pricing structure. If people don’t have those in-home displays, I’m not convinced they will actually respond to these pricing signals and ‘financial incentives’ as predicted by simple economics.”</p> <p>“Didn’t one AARP witness testify that time of use pricing just causes people to shift when they consume electricity, and not necessarily reduce their demand? That certainly complicates things,” chimed in Commissioner Brogan. “On that note, I thought that the representatives from AARP brought in some great arguments about the smart meter technology. I mean, it’s all optimistic to estimate such huge benefits, but that doesn’t really incorporate the risks involved, considering those risks are pretty big in this situation.”</p>
        <p>“Which part do you mean?” Brenner sought clarification.</p>
CARD
    )

    c_p5_c2_e1 = c.edgenotes.build
    c_p5_c2_e1.slug = 'advocacy-group'
    c_p5_c2_e1.caption = 'Why are Maryland citizens concerned about smart meters?'
    c_p5_c2_e1.format = :link
    c_p5_c2_e1.thumbnail_url = 'https://msc-gala.imgix.net/msma-president.jpg'
    c_p5_c2_e1.image_url = 'https://msc-gala.imgix.net/advocacy-group.jpg'
    c_p5_c2_e1.website_url = 'http://marylandsmartmeterawareness.org/about-msma-group/'
    c_p5_c2_e1.photo_credit = 'Amy Davis, Baltimore Sun'
    c_p5_c2_e1.instructions = 'Although not formed until 2012, the Maryland Smart Meter Awareness (MSMA) group has heavily advocated against smart meters in the state. Primary concerns include the health effects of radio frequency exposure, and potential privacy violations that can result from the accessibility of extremely granular data like hourly energy use patterns. If you’re interested, learn more about their stance at their website.'
    c_p5_c2_e1.save

    c_p5_c2_e2 = c.edgenotes.build
    c_p5_c2_e2.slug = 'bakersfield'
    c_p5_c2_e2.caption = 'Public backlash in Bakersfield, CA.'
    c_p5_c2_e2.format = :quote
    c_p5_c2_e2.thumbnail_url = 'https://msc-gala.imgix.net/public-backlash-thumb.jpg'
    c_p5_c2_e2.photo_credit = 'Inside Tech'
    c_p5_c2_e2.content = '<p>Bakersfield, CA, was a cautionary tale much on the minds of public service officials across the country. In 2007, Pacific Gas and Electric (PG&E) had received approval to roll out smart meters across its service areas in California, but poor planning and ineffective outreach led to a significant public backlash two years later when summer temperatures soared. In late 2009 <a href="https://www.good.is/articles/smart-meters-dumb-backlash">Bakersfield residents brought suit against the utility company</a> along with other defendants, complaining that the smart meters were overcharging them and demanding that PG&E retest for technological faults. The public resistance and ensuing legal controversy cost the company in significant delays in their smart meter roll outs. Consider one journalist’s reflection on the case: </p>
    <blockquote>
    PG&E’s problems began when they didn’t support their inverted tier rate program with continued educational literature, reminding residents of the benefits and structure of the program and how to collect on these benefits. …An effective marketing campaign utilizing passionate stories of conservation, public outreach to educate residents on the benefits and potential savings provided by the Smart Meter, and being transparent about the structure and information provided by the Smart Meter program could have increased the public’s trust in PG&E, possibly even creating excitement. Instead PG&E mistakenly assumed consumers would embrace the new technology.
    <footer><a href="www.triplepundit.com/2012/10/pge-smart-meters/">Waldspurger, Eric. “Lessons in Sustainable Business: PG&E Smart Meters”. Triple Pundit, 10 Oct. 2012.</a></footer>
    </blockquote>'
    c_p5_c2_e2.save

    c_p5_c3 = c_p5.cards.create(
      position: 5,
      content: <<~CARD
        <p>Brogan responded, “All of it! I mean, look here at AARP’s initial brief filing. Several witnesses stated that the largest risk was seeing the functional obsolescence of the smart meters before they were fully depreciated. And there are so many ways they could become obsolete. There is no guarantee that the cutting edge technology available today won’t be a fancy doorstop in three years. Just consider that the National Institute of Standards and Technology (NIST) has yet to formalize standards for smart grid technologies, and whatever those are, they will still need to be approved by FERC.”</p>

        <p>“Yeah, but those standards are scheduled to be formalized before BGE installs their first meter, meaning they’ll meet any standards yet to be created,” Brenner interrupted.</p>

        <p>“Maybe, but only if all goes according to schedule,” she continued, “added to the fact that these meters can be impacted by WiFi connections and they have yet to be tested on Maryland’s various landscapes… We may be investing a lot of money in technologies that are just bound to fail. Not to mention the risks to households’ cyber security. I mean, if all their information is on the grid and any old ‘techie’ person just taps their way into the entire electricity grid, they’ll be able to observe and monitor the consumption habits of hundreds of individual households. Talk about privacy issues.”</p>

        <p>Brenner stepped in again, “BGE said they would have contractual obligations written in so that the vendors who supply the smart meters will be held accountable for providing technologies that meet the highest national standards to mitigate these types of concerns. I think that’s a non-issue.”</p>
CARD
    )

    c_p5_c4 = c_p5.cards.create(
      position: 6,
      content: <<~CARD
        <p>“It’s still a risk with really costly ramifications that shouldn’t be disregarded!” Brogan was frustrated that Brenner continued to dismiss this. <p>

        <p>The room was quiet for a minute. Seeking to ease the tension, Commissioner Goldsmith timidly offered a change of pace: “Well, I’m concerned that these technologies are a little too functional.” Surrounded by the more seasoned Commissioners whose patience grew thin when confused, she clarified, “I am bothered by the potential for remote disconnections by BGE. It really does nothing to protect Maryland’s more vulnerable communities. A site visit by a BGE employee at least gives residents that last chance to pay their bill, and allows BGE to learn about whether there has just been some hold up in communications.” </p>

        <p>Commissioner Brogan cleared her throat to concur, “I think that’s really what speaks loudest to me, is those concerns expressed by the Office of People’s Counsel around <a data-edgenote="bill-impacts">bill impacts</a>. With mandatory time of use pricing, AARP estimated as many as 40% of low-income customers would have higher summer bills and 33% of residential customers with a senior in the household would have higher summer bills.<cite>Barbara R. Alexander, “Direct Testimony by Barbara R. Alexander Consumer Affairs Consultant On Behalf of AARP” (direct testimony to Maryland Public Service Commission Case No. 9208, 2009), 17.</cite> Those are high numbers. Just because the benefits outweigh the costs, we need to think about who is bearing those costs.”</p>

        <p>“Exactly, and I think that’s because so many of them wouldn’t be able to adjust their consumption to the TOU pricing scheme. I mean, these are people who are minimally consuming, as is, with a third of all BGE customers under 530 kWh/month.<cite>Nancy Brockway, “Direct Testimony of Nancy Brockway On Behalf of the Maryland Office Of People's Counsel” (direct testimony to Maryland Public Service Commission Case No. 9208, 2009), 23.</cite> The average across the state is 1096 kWh/month, so these folks are using half as much already.<cite><a href="https://www.eia.gov/electricity/data/state/">“1990 – 2014 Number of Retail Customers by State by Sector (EIA-861)” U.S. Energy Information Administration, excel spreadsheet, last modified October 21, 2015</a>; and “State Electricity Profiles 2010,” 125.</cite> What do they have left to turn off during peak hours?” Goldsmith took a breath as she shook her head. “And when you add in people who need air conditioning or other 24-hour devices for medical reasons, seniors who are especially vulnerable to high heat conditions, and shift-workers, you’re looking in total at a big group of people who would be negatively impacted by this mandatory pricing structure.”</p>
CARD
    )

    c_p5_c4_e1 = c.edgenotes.build
    c_p5_c4_e1.slug = 'bill-impacts'
    c_p5_c4_e1.caption = 'Explore energy burdens across the state of Maryland using an interactive map from The Atlantic.'
    c_p5_c4_e1.format = :graphic
    c_p5_c4_e1.thumbnail_url = 'https://msc-gala.imgix.net/energy-burdens-across-maryland-thumb.jpg'
    c_p5_c4_e1.embed_code = '<iframe allowfullscreen="" frameborder="0" height="520" mozallowfullscreen="" msallowfullscreen="" oallowfullscreen="" src="https://jordanwb.cartodb.com/viz/b9087820-13af-11e6-ba75-0ecd1babdde5/embed_map?referrer=http%3A%2F%2Fwww.coloradoan.com%2Fstory%2Fnews%2F2016%2F05%2F23%2Fenergy-assistance-programs-struggle-meet-demand-low-income-coloradans%2F84812402%2F" webkitallowfullscreen="" width="100%" id="iFrameResizer0" scrolling="no" style="overflow: hidden;"></iframe>'
    c_p5_c4_e1.instructions = '<p>Energy burdens define the percentage of household income that is spent on home energy needs. This tends to be much higher for low-income families, not only because their annual incomes are smaller, but also because they often reside in older and poorly insulated buildings, which inevitably require more energy per square foot to keep cool in the summer and warm in the winter. You can explore the energy burdens at a county level across the country. Try using the search feature to zoom in on Maryland and note any patterns you see. </p>
    <p>When you combine energy burden statistics with the fact that a notable percentage of low-income families would see higher bills over the summer in response to BGE’s initiative, what might your concerns be?</p>'
    c_p5_c4_e1.save

    c_p5_c5 = c_p5.cards.create(
      position: 7,
      content: <<~CARD
        <p>Commissioner Nazarian mulled over this as he used the case documents to fan himself. He knew that the Maryland Energy Administration had suggested an opt-out clause for the pricing structure, which could possibly address these concerns, but that then called into question who would remain with TOU and whether those questionable SEP benefit estimates would be the same should large portions of the community choose to opt out of this pricing scheme. While the difference in household consumption could be quantified as a benefit, the relative impacts on household bills weighed heavily in his consideration.</p>
        <p>The Commissioners nodded, starting to wonder whether smart meters alone were the answer. Commissioner Nazarian knew that the MEA had emphasized them as a critical first step, but there seemed to be insurmountable and unconsidered costs associated with them.</p>
        <p>“Listen,” Commissioner Williams offered, “I know quite a few of us were disappointed in the caliber of the original application, which left many unanswered questions on the table without a firm commitment from the utility, but I think the challenge here really boils down to considering the dollars and cents for consumers, and that <a data-edgenote="doe-grant">DOE grant</a> is going to take a large chunk of those costs out for us.”</p>
        <p>“You’re right,” Nazarian replied. “I mean, it’s probably one of the main reasons that BGE even submitted this proposal.”</p>
        <p>“Exactly,” Williams continued, “and that’s kind of a now or never deal. That money would really help offset costs to households, but if we don’t approve this proposal, we can’t be sure there will be DOE funding available in the future should we choose to pursue a smart grid later.”</p>
        <p>“I think the bottom line is that we would be crazy to reject this,” Brenner concurred. “The benefits outweigh the costs, we’re getting a ton of funding from the federal government to implement this, and it helps us reach our own state goals for peak energy reduction.  Just think of all the good this can do for us to avoid building and powering up peaker plants.”</p>
CARD
    )

    c_p5_c5_e1 = c.edgenotes.build
    c_p5_c5_e1.slug = 'doe-grant'
    c_p5_c5_e1.caption = 'See the reach of the American Recovery and Reinvestment Act stimulus package from this map of spatial distribution of DOE grant recipients by project type'
    c_p5_c5_e1.format = :graphic
    c_p5_c5_e1.thumbnail_url = 'https://msc-gala.imgix.net/smart-grid-map.jpg'
    c_p5_c5_e1.image_url = 'https://msc-gala.imgix.net/smart-grid-map.jpg'
    c_p5_c5_e1.photo_credit = '<a href="http://energy.gov/sites/prod/files/oeprod/DocumentsandMedia/smart_grid_awards_121410.pdf">“All Selected Projects,” U.S. Department of Energy, accessed September 7, 2016</a>'
    c_p5_c5_e1.instructions = '<p>In April 2009, as part of the American Recovery and Reinvestment Act stimulus package in response to the Great Recession, the US Department of Energy (DOE) announced that it would solicit applications from utilities for grants of up to $200 million to support projects that facilitated the deployment of smart grids, including smart meter rollouts. BGE’s Smart Meter Initiative was one of almost <a href="http://www.greentechmedia.com/articles/read/does-3.4b-smart-grid-grant-program-the-winners">100 projects</a> selected by the DOE, and it was slated to receive $130 million, pending approval of the proposal by the Maryland Public Service Commission.</p>'
    c_p5_c5_e1.save

    c_p5_c6 = c_p5.cards.create(
      position: 7,
      content: <<~CARD
        <p>Nazarian sighed and rubbed his temples. Sensing the quiet that fell upon the Commissioners he decided to use his duties as Chair to move things along. “Well, I thank you all for your time and your patience.  If there are no further comments I suppose it’s time to submit our votes in writing. Please take a moment to write down your decision, whether it is to approve or reject BGE’s proposal.”</p>

        <p>As the other Commissioners stared down at their voting sheets, Nazarian sat back in his chair and mulled over the details. Could it be that simple?  He started to jot down more notes but then chose to crumple up the paper. After considering the arguments on both sides, he felt even more conflicted than before but knew the time had come for a final decision.</p>
CARD
    )

    pod = c.podcasts.create(
      title: 'Reflections on the Past: Three Principals Discuss the MPSC Ruling on the BGE Proposal',
      audio_url: '',
      position: 1,
      description: "<p><strong>spoiler alert:</strong> <em>The following text and podcast reveal the
      outcomes of the commission order. Please complete reading and narrative and
      tackling the exercises before continuing this part.</em></p> <h3>Outcomes of the
      Order</h3> <p>Although depicted as a single-day vote, in reality, the decision
      came after several months of closed door deliberations amongst the
      Commissioners.  After the reply briefs were filed in February, Nazarian had
      worked alongside fellow Commissioners and their attorneys to deliberate and to
      draft a formal order.</p> <p>In June 2010, the Maryland Public Service
      Commission released Order No. 83410, a 54-page written document which ruled to
      deny the proposal submitted by Baltimore Gas and Electric to roll out smart
      meters across its service territory.</p> <p>This landmark decision was one of
      the first of its kind to critically assess the economic reasoning behind a
      utility company’s smart meter proposal, thereby leading to a decision that
      risked losing Maryland $200 million dollars in federal funding and that ran
      counter to the prevailing winds in support of smart grid technologies.</p>
      <p>Scott Hempling, a practicing attorney in public utility regulation and
      adjunct professor at Georgetown University, was serving as the Executive
      Director of the National Regulatory Research Institute (NRRI) at the time the
      Maryland Public Service Commission revealed its Order No. 83410 on the BGE
      Smart Meter Proposal. In response, he provided a <a
      href=\"http://www.scotthemplinglaw.com/essays/smart-grid-spending\">detailed
      analysis</a> of the decision.</p> <p>We spoke with participants in this
      proceeding to learn more about this proposal, the context surrounding the
      decision, and what it means for future regulators and policy makers in the
      environmental and energy fields.</p>
      ",
      artwork_url: 'https://msc-gala.imgix.net/maryland-smartmeters-podcast.png',
      photo_credit: 'FIWARE',
      credits_list: {
        hosts: ['Edward Waisanen'],
        guests: [
          { name: 'Judge Douglas Nazarian', title: 'Maryland Court of Special Appeals' },
          { name: 'Paula Carmody', title: "People’s Counsel for the Maryland Office of People's Counsel" },
          { name: 'Kimberly Curry', title: 'Counsel for Baltimore Gas and Electric' }
        ]
      }
    )

    act1 = c.activities.create title: 'Nazarian’s Household Demand for Electricity', position: 1, pdf_url: 'https://s3-us-west-2.amazonaws.com/msc-gala/nazarian-household-demand-for-electricity.xlsx'
    act2 = c.activities.create title: 'Peak Electricity Demand', position: 2, pdf_url: 'https://s3-us-west-2.amazonaws.com/msc-gala/peak-electricity-demand.xlsx'
    act3 = c.activities.create title: 'The Economics of Smart Energy Pricing', position: 3, pdf_url: 'https://s3-us-west-2.amazonaws.com/msc-gala/economics-of-smart-energy-pricing.xlsx'
  end

  def down
    Case.find_by_slug('baltimore-smart-meters').destroy
  end
end
