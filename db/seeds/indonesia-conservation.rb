I18n.locale = :en

indonesia = Case.create(
  slug: "indonesia-conservation",
  published: true,
  tags: %w(region:indonesia exercise:),
  cover_url: "http://remley.wcbn.org/ihih-msc/wp-content/uploads/2016/02/ci_65657554.jpg",
  authors: [
    "Katie Browne",
    "Laure Katz",
    "Arun Agrawal",
  ],
  translators: [],

  title: "Financing Biodiversity Conservation: The Bird’s Head Seascape",

  summary: <<-SUMMARY,
In 2004, Conservation International led an unprecedented coalition of international and local partners in launching the Bird’s Head Seascape Initiative. Protecting the incredible ecological value of West Papua, Indonesia, the Seascape has grown over the past decade into one of the most ambitious and effective marine conservation programs in the world, a model of indigenous community-driven conservation. Prompted by recent shifts in the Seascape’s traditional funding structure, however, the Bird’s Head Coalition must rapidly formulate a strategy to transfer management to local bodies and establish a sustainable funding model. This case puts readers in the shoes of Laure Katz, Director of the Seascapes Program at Conservation International, who must develop and execute this transition strategy, securing the Bird’s Head as a global model for effective, community-driven conservation.
SUMMARY
)

indonesia_p1 = indonesia.pages.create( order: 1, title: "The Bird’s Head Seascape" )
indonesia_p1_c1 = indonesia_p1.cards.create(
order: 1,
content: <<-CARD
<p><a data-edgenote="laure-katz">Laure Katz</a> stood with her toes in the sand, watching the sun rise over the Bay of Misool, across the dozens of small islands scattered in the calm, crystalline water. It was a beautiful morning—the sun’s golden rays silhouetting outrigger canoes entering the harbor, small schools of fish skittering, leaving little ripples in their wake on the glassy smooth surface. Yet despite the tranquility of this familiar landscape, Laure’s mind was troubled. These waters housed an intricate network of coral reefs, seagrass beds, and mangrove forests unlike any other in the world, an epicenter of marine biodiversity she had worked for years to protect. Now this fragile ecosystem and its numerous dependent livelihoods were facing a tremendous transition, one marked by both great urgency and uncertainty.</p>
CARD
)
indonesia_p1_c2 = indonesia_p1.cards.create(
order: 2,
content: <<-CARD
<p>As the newly appointed Director of the Seascapes Program at Conservation International, Laure was responsible for the approaching transition. In the coming weeks, she faced a decision that would determine the security and viability of this unique marine ecosystem for decades to come. And although she could and must consult with many, ultimately she had to make the choice from among the different options she faced.</p>
CARD
)
indonesia_p1_c3 = indonesia_p1.cards.create(
order: 3,
content: <<-CARD
<p>Laure was looking out onto just a small portion of the Bird’s Head Seascape, an area of more than 22 million hectares of sea and small islands in West Papua Indonesia. Approximately the size of the US state of Michigan, the Bird’s Head Seascape (BHS) was one of the first models of indigenous community-driven conservation on such a substantial scale. Within the Seascape, local communities and governments managed the country’s first effective network of Marine Protected Areas (MPAs), encompassing over 3.6 million hectares across 12 sites and collectively protecting 30% of Papua’s critical marine habitat. At the heart of the “Coral Triangle,” the Seascape contained more marine species than any other single place on the planet. Scientists had already documented 1,750 species of coral reef fish and 600 species of scleractinian corals, 75% of the world’s total, within its waters. This <a data-edgenote="unrivaled-biodiversity">unrivaled biodiversity</a> remains, however, tenuously balanced with indigenous livelihoods, as the BHS is also home to 760,000 people, the majority of whom are Papuans reliant on fishing for food and income.</p>
CARD
)
indonesia_p1_c4 = indonesia_p1.cards.create(
order: 4,
content: <<-CARD
<p>As the Laure watched the sun rise higher over the lagoon, she thought of the importance of the Bird’s Head Seascape to her, to the Papuans who relied on its ecological richness, and to the world. How could she ensure the sustainable management of this global treasure while the financial support she had come to rely on shifted beneath her feet?</p>
CARD
)

indonesia_p2 = indonesia.pages.create( order: 2, title: "A Model Seascape, a Unique Coalition" )
indonesia_p2_c1 = indonesia_p2.cards.create(
order: 1,
content: <<-CARD
<p>The Bird’s Head Seascape, from the beginning, was a model and pioneer of marine conservation. In 2001, an <a data-edgenote="initial-rapid-assessment">Initial Rapid Assessment</a> conducted by <a data-edgenote="conservation-international">Conservation International</a> (CI) indicated the extraordinary ecological value of West Papua Province’s marine life. Three years later, CI joined with The Nature Conservancy and WWF-Indonesia to launch the Bird’s Head Seascape Initiative. This unprecedented coalition grew within a decade to include over 30 international and local partners.</p>
<p>At the core of the coalition was an integrated marine conservation strategy, which explicitly rested on the connections between environmental, economic, and sociocultural aspects of conservation in Papua. The ultimate goal was to conserve the Seascape’s biodiversity in ways that could empower local communities, and at the same time enhance food security and livelihoods.</p>
CARD
)
indonesia_p2_c2 = indonesia_p2.cards.create(
order: 2,
content: <<-CARD
<p>Maintaining a commitment to Papuan communities and local governments was thus key to the establishment and long-term success of the Seascape. The BHS Coalition worked hard in the early years to build local management capacity, training more than 1,500 community members to actively participate. As part of the initiative, these local communities worked with regional and national governments to establish a multiple-use network of ecologically-connected MPAs. In 2008, the Papuan communities and the government officially declared an <a data-edgenote="mpa-network">MPA network</a> which covered 3.6 million hectares across 12 MPAs. </p>
CARD
)
indonesia_p2_c3 = indonesia_p2.cards.create(
order: 3,
content: <<-CARD
<p>Over the first decade of the initiative, the BHS Coalition grew to include a remarkable collection of partners: the three international NGOs, and numerous local civil society organizations, government agencies, Papuan communities, and a local University. CI led MPA capacity development programs; WWF provided technical leadership for monitoring; and TNC spearheaded Seascape communication efforts. Local governments and local communities both worked to directly manage the MPA network, implementing management plans, ensuring active and effective patrols, and monitoring to support adaptive management. The State University of Papua conducted social and ecological impact assessments throughout the Seascape. Finally, <a data-edgenote="local-ngos">local NGOs</a> continue to fill a variety of <a data-edgenote="civil-society-roles">civil society roles</a>, including Kalabia, a floating environmental education center, and the Papuan Sea Turtle Foundation, which directs a world-class sea turtle monitoring and nest-guarding program.</p>
CARD
)
indonesia_p2_c4 = indonesia_p2.cards.create(
order: 4,
content: <<-CARD
<p>The ambitious conservation strategy of this coalition would not have been possible without significant international donor support. More than seventy donors contributed a total of $65 million to the Seascape. But a single donor, the <a data-edgenote="walton-family-foundation">Walton Family Foundation</a>, was responsible for more than half that amount. From 2004 to 2013, the Foundation gave more than $35 million in a series of three-year grants. Although this funding was delivered cyclically, the Foundation committed from the start to support the Seascape long-term. This long-term commitment, as well as the Foundation’s understanding of the need for flexible and adaptive management, allowed the BHS coalition to think broadly and creatively, to plan for different strategic stages of intervention, and to craft a multilayered conservation strategy.</p>
<p>The result of this support was one of the most ambitious and effective marine conservation programs in the world. It was also one still dependent on international NGOs and donor funding.</p>
CARD
)

indonesia_p3 = indonesia.pages.create( order: 3, title: "Growth and Effectiveness of the Seascape" )
indonesia_p3_c1 = indonesia_p3.cards.create(
order: 1,
content: <<-CARD
<p>Laure had joined CI in Bird’s Head in 2008, the year the MPA network was declared by Papuan communities and the government. Working her way from Program Coordinator to Management Advisor to Seascape Senior Manager over the course of five years, she had seen firsthand the tremendous success of the Seascape in reaching its goals.</p>
<p>The Coalition’s first challenge was restoring ecosystems and fisheries after decades of overexploitation. Introduction of commercial fisheries in the 1960s, both legal and illegal, had led to overfishing and increased use of destructive practices, such as bomb fishing, <a data-edgenote="compressor-fishing">compressor fishing</a>, and cyanide use. By the 1990s, the impact of these practices was so severe that some fisheries reported up to a 90% decline in yield for given levels of effort. In addition to ecological damage, the declines of the fisheries threatened the life-support systems of indigenous Papuans, and contributed to high poverty rates across the region.</p>
CARD
)
indonesia_p3_c2 = indonesia_p3.cards.create(
order: 2,
content: <<-CARD
<p>Over the first decade of the BHS initiative, gazettement of 2 million hectares of new MPAs and design of MPA management systems allowed reefs and fisheries to rebound. Raja Ampat, for example, demonstrated a 12% average increase in coral cover. Within the MPAs across the Seascape, 20-30% of critical habitats were established as “no-take” zones, and local patrol teams successfully reduced overfishing by outside poachers by 90%. The patrol teams of Raja Ampat reduced destructive fishing practices to less than 1% of resource users. These measures led to <a data-edgenote="mpa-boosted-fisheries">significant increases in fish biomass</a> and catch by local fishers, enhancing local food security. As a result of these successful initiatives, the BHS MPA network recently earned a 73% effectiveness rating averaged across the network on the World Bank effectiveness scorecard, the highest MPA management score in Indonesia.</p>
CARD
)
indonesia_p3_c3 = indonesia_p3.cards.create(
order: 3,
content: <<-CARD
<p>Simultaneously, the BHS Coalition looked to boost sustainable tourism in the Seascape, with the resulting revenue contributing to conservation incentives and providing further benefit to local communities. In collaboration with the Department of Tourism, BHS promoted Raja Ampat as a <a data-edgenote="sells-raja-ampat">world-class diving destination</a>, on par with locations like the Great Barrier Reef in Australia. As a direct result of this campaign, <a data-edgenote="booming-tourism">marine tourism is booming</a>, with 30% annual growth from 2008 to 2013. Tourism now represents, along with local fisheries, the foundation of the local economy.</p>
CARD
)

indonesia_p4 = indonesia.pages.create( order: 4, title: "Continuing Challenges" )
indonesia_p4_c1 = indonesia_p4.cards.create(
order: 1,
content: <<-CARD
<p>Despite these remarkable gains over a short period, Laure knows that significant challenges still face the BHS Coalition. Local populations continue to suffer from high rates of poverty; over 40% live below the poverty line. Dependence on local fisheries remains high. They also provide employment for over half of households in the Seascape and comprise 33% of local GDP. With 75% of families dependent on fish for protein, food insecurity continues to be an urgent concern. Within the BHS, the majority of families reported experiencing food insecurity; 13% reported severe recurrent hunger. For Papuans throughout the Seascape, the challenge of managing sustainable fisheries is thus not simply an issue of economy, it is an issue of survival.</p>
CARD
)
indonesia_p4_c2 = indonesia_p4.cards.create(
order: 2,
content: <<-CARD
<p>The difficulty of this challenge is compounded by external pressures. Foreign fishing companies continue to trawl BHS waters; transient workers threaten claims to local reef tenure. <a data-edgenote="oil-and-gas-exploration">Oil and gas exploration</a> has begun in the region, and the threat of nickel mining and illegal logging continues to loom in area watersheds. Tourism, although it supports local economies, could also threaten reefs without appropriate regulation. With increased shipping, port expansion, and infrastructure development underway, the situation could take a turn for the worse quickly- BHS seemed far from secure in having met its goals.</p>
CARD
)

indonesia_p5 = indonesia.pages.create( order: 5, title: "The Announcement" )
indonesia_p5_c1 = indonesia_p5.cards.create(
order: 1,
content: <<-CARD
<p>Thinking back to the meeting with the Walton Family Foundation six months before, Laure recalled the difficult discussions that had followed the program officer’s announcement. The major international NGOs- Conservation International, The Nature Conservancy, and World Wildlife Fund- along with local partners of the BHS Coalition, had arrived at the  in Washington DC with a sense that the nature of the Foundation’s support for the Seascape was shifting. While the Coalition was prepared to deliver the vision for the next three-year grant cycle, neither Laure nor her team were completely surprised by the news that the next three-year grant would be the last.</p>
<p>Although the Foundation remained happy with the results of the Seascape, the Walton program officer had explained that they were not prepared to continue funding the project indefinitely, at the cost of $5 million each year. The next and final round of funding would be a “Transition Phase Grant,” as the Foundation challenged CI and the other partners of the BHS Coalition to develop a transition proposal that would focus on the sustainability of everything they had achieved together. After the funding of the transition phase was exhausted, the Seascape needed to be fully financially self-sustaining.</p>
CARD
)
indonesia_p5_c2 = indonesia_p5.cards.create(
order: 2,
content: <<-CARD
<p>Laure and her colleagues walked out of the Walton Family Foundation headquarters with their heads spinning. There was so much to do and time was short. They needed to come up with a strategy, <a data-edgenote="events-timeline">quickly</a>. The international NGOs had always intended to transition the seascape to sustainability and had been systematically building the capacity of local institutions for years. But they had anticipated having far more time in which to ensure an effective transition. Most local institutions were still in their infancy and local revenue sources were both inconsistent and insufficient.</p>
CARD
)
indonesia_p5_c3 = indonesia_p5.cards.create(
order: 3,
content: <<-CARD
<p>Now the Coalition would have only four years to ensure local partners were ready to take over and secure sufficient revenues to support the entire Seascape and the operating costs of the twenty local partners. If the Coalition failed, current levels of funding and protection would lapse, opening the Seascape to <a data-edgenote="heavy-foreign-fishing-pressure">heavy foreign fishing pressure</a>, destructive fishing practices, and threat of uncontrolled tourism. They needed, in short, a strategy to ensure that all the hard work and successes of the past ten years were not lost.</p>
CARD
)

indonesia_p6 = indonesia.pages.create( order: 6, title: "A Shared Seascape Vision" )
indonesia_p6_c1 = indonesia_p6.cards.create(
order: 1,
content: <<-CARD
<p>Within a month, Laure was tasked with leading the development and implementation of the BHS transition strategy. While an expert in capacity development and MPA management, conservation finance was entirely new to her. Recognizing the need to draw upon all of the Coalition’s resources and expertise, Laure’s first step was to assemble a diverse team of experts from the Seascape’s partners. She created a BHS sustainable transition leadership team, with three distinct working groups under it, respectively focused on: (1) capacity development; (2) government engagement; and (3) sustainable financing. The first two groups were composed primarily of Indonesian staff. The third working group also included international experts in conservation finance, trust fund development, cost modeling, and international law.</p>
CARD
)
indonesia_p6_c2 = indonesia_p6.cards.create(
order: 2,
content: <<-CARD
<p>Laure and the team decided that before they could dive into sustainable financing, all the Seascape partners needed to have a clear vision of what they were working to support. Before conducting any financial analysis, the team set out to form a shared vision of the Seascape’s transition towards local management and sustainable financing. Each working group had an important strategic role to play in the process:</p>
CARD
)
indonesia_p6_c3 = indonesia_p6.cards.create(
order: 3,
content: <<-CARD
<p>(1) The Capacity Development Team needed to assess each of the local institutions’ readiness to effectively manage the Seascape long-term, especially their capacity to securely and transparently handle financing. What would these local bodies need? And what would be the Coalition’s strategy to systematically address existing capacity gaps in skills and governance?</p>
CARD
)
indonesia_p6_c4 = indonesia_p6.cards.create(
order: 4,
content: <<-CARD
<p>(2) The Government Engagement Team needed to increase government support of the Seascape, taking into consideration existing and projected sources, policy barriers, and local and regional government priorities. Specifically, the team needed to formulate a strategy to overcome several key obstacles, which: prevented funding from flowing to certain costs (e.g. fuel); prevented revenue generated in one region from being redirected to support another; and blocked management bodies from accessing tourism revenue.</p>
CARD
)
indonesia_p6_c5 = indonesia_p6.cards.create(
order: 5,
content: <<-CARD
<p>(3) The Sustainable Financing Team was aware that the Seascape would require external support. It needed to form an initial fundraising strategy and identify how the Seascape would have sufficient resources for long term management. How would they pitch the Seascape and to whom? How would they tailor their approach to different sectors (private, public, philanthropic) and appeal to their reasons to invest?</p>
CARD
)

indonesia_p7 = indonesia.pages.create( order: 7, title: "Financial Analysis" )
indonesia_p7_c1 = indonesia_p7.cards.create(
order: 1,
content: <<-CARD
<p>Through the working groups, the NGO Coalition mapped all of the key functions of the Seascape within six months, identifying which organizations were best positioned to fill each critical role. What emerged was a vision of “steady state” management, which accounted for all post-transition tasks: patrolling, monitoring and evaluation, community outreach, NGO programming, and annual assessments. With this model for all future work in place, it was time to count costs.</p>
CARD
)
indonesia_p7_c2 = indonesia_p7.cards.create(
order: 2,
content: <<-CARD
<p>The Coalition commissioned Starling Resources, a Sustainability Consulting firm, to conduct a thorough financial analysis of the Seascape’s <a data-edgenote="expected-budget-at-steady-state">expected budget</a> at steady state. Starling led each partner through a <a data-edgenote="summary-of-costs-by-institution">cost modeling exercise</a>, detailing what all their activities would cost in the future. What, for example, would it cost to conduct patrols and routinely replace boats? At what rate would salaries and benefits grow? Would would be the annual cost of maintenance and facility upkeep? Starling then repeated the exercise with every available revenue stream, accounting for restrictions on how the funding could be used.</p>
CARD
)
indonesia_p7_c3 = indonesia_p7.cards.create(
order: 3,
content: <<-CARD
<p>The model the firm delivered projected <a data-edgenote="costs-by-site-and-function">costs</a>, revenues, and <a data-edgenote="funding-gaps-by-group-and-by-site">gaps</a> under the steady state management system the Coalition expected to have in place by 2017. Though the efforts of the working groups to increase revenue were tremendous, a significant annual budget shortfall remained. Where would this support come from, if not the Walton Family Foundation? The big challenge Laure and the team now faced was how to provide consistent funding which would meet that gap.</p>
CARD
)

indonesia_p8 = indonesia.pages.create( order: 8, title: "Financial Analysis" )
indonesia_p8_c1 = indonesia_p8.cards.create(
order: 1,
content: <<-CARD
<p>After responding to the challenges of creating a plan that included the contributions of different partners and some financial planning, Laure and the BHS Coalition now had a better sense of the task before them. Their primary challenge was to secure the necessary funding to ensure the Seascape would be sufficiently financed in perpetuity. Weeks of intensive discussion within CI and across the broader BHS Coalition followed, with a number of ideas put forth, argued and countered.</p>
<p>The MPA Network was declared by local government and was providing a clear benefit to local citizens, one senior manager argued. Why not ask the national government to further increase funding? Or tourism, another offered. Tourists are willing to pay a significant amount to visit and dive in the Seascape: why not raise fees to support the conservation benefits they enjoy? How about the international community, a third asked. The BHS protects globally significant biodiversity: how could we call upon international resources to help us protect them? Blue Carbon could be the answer, argued a Marine Climate Change Manager. CI is already <a data-edgenote="carbon-sequester-in-coastal-habitats">piloting a project</a> to harvest the value of carbon sequestered in protected mangroves and seagrass beds: if we could sell those carbon credits, we could fund the Seascape and serve as a global model for replication.</p>
CARD
)
indonesia_p8_c2 = indonesia_p8.cards.create(
order: 2,
content: <<-CARD
<p>Each potential solution had its appeal, but also challenges. Competition for government funding in Indonesia is intense and its allocation unreliable. <a data-edgenote="decline-in-tourism-in-2002">Tourism too could be unreliable</a>. As for a call on the international community: what would it look like, who would they call upon, and who would respond? Philanthropic interest in the seascape remained high, but was a moving target; most private sector companies with the ability to provide significant support were in the extractive industry; their engagement could even pose a risk to the project’s public perceptions. An <a data-edgenote="conservation-trust-investment-survey-2012">endowment</a> could be an option, but to support the annual costs of the Seascape, it would need to be far larger than any other marine conservation fund ever established. Could Blue Carbon, although offering significant long-term potential, be a reliable enough revenue stream?</p>
CARD
)

indonesia_p9 = indonesia.pages.create( order: 9, title: "Financial Analysis" )
indonesia_p9_c1 = indonesia_p9.cards.create(
order: 1,
content: <<-CARD
<p>All of these thoughts jostled for attention in Laure’s mind as the sun rose higher over Misool Bay: the shadows of the small islands receding, children playing in the shallows, fishermen long returned home and sleeping. Responsible for the BHS Coalition’s transition strategy, Laure needs to deliver a plan that will cover the full management costs of local organizations in perpetuity, with funding flowing efficiently and reliably to all partners. The strategy also needs to ensure that local organizations and management bodies rapidly develop internal capacity to manage the Seascape, transparently and responsibly overseeing and reporting on funds they receive. The transition needs to be complete within a year. And in the subsequent year, the Seascape needs to be financially self-sustaining. Reflecting on this beautiful place, with its entwined fragile ecosystems and livelihoods, Laure knows the urgency of finding the right strategy to sustain the Bird’s Head forever.</p>
CARD
)

pod = indonesia.podcasts.build(
  title: "Financing Biodiversity Conservation: The case of the Bird’s Head Seascape",
  audio_url: "http://www.hotinhere.us/podcast-download/1259/financing-biodiversity-conservation-the-case-of-the-birds-head-seascape.mp3?ref=download",
  order: 1,
  description: "<p>This week’s broadcast debuts a new partnership between IHIH and Michigan Sustainability Cases (MSC), a new case-based learning platform which integrates podcasts into sustainability curriculum. Hosts Katie Browne and Andrea Kraus first speak with Laure Katz of Conservation International about her role managing the transition of the Bird’s Head Seascape, from donor-supported to fully financially self-sustaining — in four short years. Suffice to say the demands of such a challenge live little time for sleep.</p><p>We are then joined in studio by Peter Pellitier, a student of both coral and soil, who conducted research in Papua New Guinea and the Coral Triangle a year ago. Peter speaks to the importance of protecting marine biodiversity, as a foundation of livelihoods and buffer against climate change, and the difficulty of sustaining homegrown conservation initiative.</p>",
  artwork_url: "http://i0.wp.com/www.hotinhere.us/wp-content/uploads/2016/02/image-2.jpeg?zoom=2&resize=546%2C317",
  credits_list: {
    hosts: ["Katie Browne", "Andrea Kraus"],
    guests: [
      {name: "Laure Katz", title: "Director of the Seascapes Program at Conservation International" },
      {name: "Peter Pellitier", title: "PhD candidate, School of Natural Resources and Environment, University of Michigan" }
    ]
  }
)

require './db/seeds/edgenotes/indonesia-conservation-edgenotes.rb'
