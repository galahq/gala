I18n.locale = :en

ethiopia = Case.create(
  slug: "ethiopia-napa",
  published: true,
  tags: %w(region:africa exercise:quantitative),
  cover_url: "http://remley.wcbn.org/ihih-msc/wp-content/uploads/2016/01/1200px-Semien_Mountains_13.jpg",
  authors: [
    "Mohammad Golrokhian",
    "Katie Browne",
    "Emily Durand",
    "Benjamin Fortney",
    "Brendan Malone",
    "Alexander Natanson",
    "Nadia Vandergriff",
  ],
  translators: [],
  catalog_position: :featured,
  publication_date: Time.zone.parse('January 21, 2016 18:00:00 EST'),
  kicker: "National Adaptation",
  title: "How will Ethiopia plan for climate change?",
  dek: "The UNDP has limited resources to mitigate the effects of climate change, and lots of worthy projects to choose from.",

  summary: <<-SUMMARY,
This real-life case takes place in August 2015 in Ethiopia. Kidane Asefa, the
chairman of the National Adaptation Program of Action (NAPA) and focal point for
the United Nations Framework Convention on Climate Change (UNFCCC) in Ethiopia,
is faced with the challenge of selecting and prioritizing proposed climate
adaptation projects. Though the NAPA committee has already identified the most
promising projects for consideration, Mr. Asefa is now responsible for weighing
the relative costs and benefits of each plan and deciding how to best allocate
Ethiopia’s limited financial, technical and administrative resources. The
analytical techniques Mr. Asefa chooses to employ, and ultimately the projects
he selects, will guide how his country addresses and adapts to the critical
challenge of climate change.
SUMMARY
)

ethiopia_p1 = ethiopia.pages.create( position: 1, title: "Kidane Asefa" )
ethiopia_p1_c1 = ethiopia_p1.cards.create(
position: 1,
content: <<-CARD
<p><strong><a data-edgenote="kidane-asefa">Kidane
Asefa</a></strong> has had a very busy morning. He is rushing to meet with
Fahmy Abdel Aal, Executive Director of the <em>United Nations Environmental
Program</em>, and Sufian Ahmed, the Ethiopian Minister of Finance and
Economic Development. Both are very important meetings; these conversations
are at the core of the consultation process which will guide Kidane’s
decision on which adaptation plans to implement. As Director General for the
<strong>National Adaptation Plan of Action</strong> (NAPA) and focal point
for the the <em>United Nations Framework Convention on Climate Change</em>
(UNFCCC) in Ethiopia, he has already dedicated more than a year to the plan.
The projects Kidane is tasked with prioritizing aim to ameliorate the effects
of climate change impacts and prepare Ethiopia as much as possible for
negative impacts. Kidane abandoned a successful engineering career in order
to answer this important calling. And the decision-making process needed to
happen quickly: the UNFCCC requested a report with recommended projects and
prioritizations by November, and already it is August.</p>
CARD
)

ethiopia_p2 = ethiopia.pages.create( position: 2, title: "National Adaptation Plans of Action (NAPA)" )
ethiopia_p2_c1 = ethiopia_p2.cards.create(
position: 1,
content: <<-CARD
<p>NAPAs provide a guided process for <strong>Least Developed
Countries</strong> (LDCs) to identify priority activities that respond to
their <a data-edgenote="climate-change-impact-livelihoods">urgent and immediate
needs to adapt to climate change</a>, those needs for which further delay
would increase a country’s vulnerability and/or future costs. The main
content of a <a data-edgenote="napa">NAPA</a> is a
list of ranked priority adaptation activities and projects, as well as short
profiles of each activity or project, designed to facilitate the development
of proposals for implementation. Accordingly, NAPAs must be action-oriented,
country-driven, flexible and based on national context. In order to
effectively address urgent and immediate adaptation needs, NAPA documents
must also be presented in a simple format, understandable for both policy
level decision-makers and the public. Finally, NAPAs are expected to
primarily utilize existing data. Because no new research is required,
countries are not permitted to delay NAPA processes in the name of data
collection.</p>
CARD
)
ethiopia_p2_c2 = ethiopia_p2.cards.create(
position: 2,
content: <<-CARD
<p>The NAPA project database organizes projects by country and sector and
includes project costs and projected impacts. Projects are grouped according
to the main sectors into which the project falls; however, some projects and
activities are diverse in nature and difficult to classify into any one
sector. Such projects have been categorized into a ‘cross-sectoral’
group.</p>
CARD
)

ethiopia_p3 = ethiopia.pages.create( position: 3, title: "Time to Get Moving!" )
ethiopia_p3_c1 = ethiopia_p3.cards.create(
position: 1,
content: <<-CARD
<p>After checking with his secretary to see if there were any messages,
Kidane headed to the embassy where Fahmy Abdel Aal, the Executive Director of
the United Nations Environmental Program, was staying.</p>
CARD
)
ethiopia_p3_c2 = ethiopia_p3.cards.create(
position: 2,
content: <<-CARD
<p>“Would you like some coffee?” Fahmy greeted him.</p>
<p>“Yes, thank you. And how are your kids doing?”</p>
<p>“Oh, pretty well. You know how teenagers are.”</p>
<p>Kidane laughed. “I fear for those coming days.”</p>
<p>“How is your family, Kidane?”</p>
<p>“We are blessed. My wife just got a promotion, and my son is doing well
in school. I can’t help him with his schoolwork anymore. Even in college we
didn’t study those topics!”</p>
<p>“Congratulations to her!” replied Fahmy. “Now, tell me what progress you
have made so far. We need to get moving on this plan.”</p>
<p>“Yes, I understand,” said Kidane. “I’m meeting with both the Minister of
Economic Development and the Minister of the Environment this week,” Kidane
said. “It took a long time to get on their schedules.”</p>
<p>“Well, Kidane, you know that <a data-edgenote="vulnerability-map">time is of the essence</a>. Every
day that passes is time we can’t get back.”</p>
CARD
)
ethiopia_p3_c3 = ethiopia_p3.cards.create(
position: 3,
content: <<-CARD
<p>“Yes, of course,” Kidane replied. “Do you have any advice before I meet
with the ministers?”</p>
<p>“Determine your criteria as soon as possible and narrow down our list of
options. We have to quickly decide on projects, have them approved, and
begin their implementation. You are aware that many bureaucratic checks and
balances exist within the UN system, and every penny spent requires several
certifications. And of course funding is always limited. The original
estimation for NAPA projects in Ethiopia was 770 million dollars, and you
have only got 15 million up to now and God know how much we will get later!
The Climate Change negotiations are moving forward as we had expected, and
the developed nations are not contributing as much as we had hoped.</p>
<p>“We have a long list of projects that could be potentially implemented,
but we need to be strategic and allocate our limited budget to the projects
with the highest impact. We should aim to build partnerships with the
ministries in order to draw on their funding as well. Try to pick projects
that will have a major overall impact in several sectors. Again, please
make your decisions quickly. Don’t worry too much about what the ministers
want, they view this issue from only their own limited perspective and
still think they know what’s best for the country. These plans are supposed
to come from and be for the people.”</p>
<p>“Yes, thank you. I will certainly do my best.” Replied Kidane
gratefully, but also with some trepidation. “We have narrowed down the
number of potential projects from eleven to four.”</p>
CARD
)
ethiopia_p3_c4 = ethiopia_p3.cards.create(
position: 4,
content: <<-CARD
<p>Arriving back at his office, Kidane felt overwhelmed. While Fahmy had
given him some good advice, he was still unsure of how to prioritize the
proposed projects and which were the correct criteria to employ. He felt
tremendous pressure to quickly formulate a plan. With floods and <a data-edgenote="drought-and-hazard-frequency">droughts increasing
dramatically</a>&nbsp;over the past few years, Kidane knew his country was
already feeling the <a data-edgenote="executive-summary-of-ethiopia-uncertain-climate-future">effects
of climate change</a>.</p>
CARD
)
ethiopia_p3_c5 = ethiopia_p3.cards.create(
position: 5,
content: <<-CARD
<p>“Mr. Asefa,” said his secretary, entering the room with a thick pile of
papers. “I just received the Economic Assessment of the NAPA projects
report. Remember? You asked for the detailed costs and benefits of the top
4 NAPA projects last week. “Here they are”. And don’t forget that you have
a meeting with Mr. Sufian Ahmed tomorrow morning. It took me three whole
months to arrange that!”</p>
<p>Head spinning, Kidane spent the whole afternoon studying the report.</p>
CARD
)

ethiopia_p4 = ethiopia.pages.create( position: 4, title: "The Minister of Finance and Economic Development" )
ethiopia_p4_c1 = ethiopia_p4.cards.create(
position: 1,
content: <<-CARD
<p>The next morning he went directly to the ministry to meet Mr. Sufian
Ahmed, the Minister of Finance and Economic Development. From the beginning
of the meeting, Sufian carried himself with an air of superiority. This
greatly annoyed Kidane, but of course he couldn’t let the Minister see that.
It had taken almost three months just to get on his calendar.</p>
CARD
)
ethiopia_p4_c2 = ethiopia_p4.cards.create(
position: 2,
content: <<-CARD
<p>After exchanging pleasantries, Kidane began outlining some possible
adaptation projects. Sufian cut him off, saying, “Well you had better be
careful about those farming plans you mentioned. <a data-edgenote="chinese-investment-in-transportation">The Chinese have already bought up a
lot of land</a>, and we’re in the middle of negotiations right now for
another large purchase. So far, they’ve invested 1.1 billion dollars in
Ethiopia. They even paid to build the new African Union conference center and
just recently donated a 13 million dollar hospital to our people. We cannot
afford to displease them.”</p>
CARD
)
ethiopia_p4_c3 = ethiopia_p4.cards.create(
position: 3,
content: <<-CARD
<p>“No, I hadn’t realized that,” Kidane replied, puzzled.</p>
<p>“Yes, well, just be well aware of the context of your plans. Those food
programs and forestry initiatives you mentioned aren’t likely to go through
on account of the Chinese. They’re our <a data-edgenote="chinese-fdi-in-ethiopia">third largest foreign
investor</a>. You must understand that.”</p>
<p>“I see,” said Kidane.</p>
<p>“Furthermore,” said Mr. Ahmed, “I don’t know why exactly you wanted to
meet with me. A lot of these projects seem environmental; they don’t have
much to do with economics.”</p>
CARD
)
ethiopia_p4_c4 = ethiopia_p4.cards.create(
position: 4,
content: <<-CARD
<p>“Well, Mr. Ahmed,” Kidane answered, “The NAPA plans were designed to
meet both development and environmental needs. In other words, they are
designed for sustainable development. We hope that by investing in
development projects that help Ethiopia adapt to the coming changes, we’ll
be able to have an impact in reducing poverty as well as prepare the
country for environmental changes that could have a negative impact on our
economic growth if we don’t plan for them in advance. Believe me, the
UNFCCC is committed to development just as much as it is to the
environment.”</p>
<p>“To me <a data-edgenote="ethiopia-economy-growth-concerns">development
comes first</a>,” The Minister replied. “Those other countries that caused
climate change are the ones that have to fix it. If it comes to saving our
planet or our people, I will always choose our people. We cannot sacrifice
our development, sanitation, education and public health.”</p>
CARD
)
ethiopia_p4_c5 = ethiopia_p4.cards.create(
position: 5,
content: <<-CARD
<p>Kidane attempted to outline some other options for adaptation investment,
but the minister had to cut their meeting short; he had suddenly received an
important phone call.</p>
CARD
)
ethiopia_p4_c6 = ethiopia_p4.cards.create(
position: 6,
content: <<-CARD
<p>Back at his office, Kidane took some time to gather his thoughts. What
course of action should he take? He had to give some attention to development
initiatives. The poor were already the most vulnerable to the effects of
climate change. He couldn’t leave them behind. But what about the Chinese?
Was the Minister right, could they really throw a wrench in NAPA’s plans?
Kidane didn’t have much time to ponder, as his secretary soon buzzed his desk
phone. “Yes?” “Mr. Kidane, you wanted me to remind you about your son’s
recital.” Oh, yes, thank you.” Kidane packed up his briefcase and headed out
of the office.</p>
CARD
)

ethiopia_p5 = ethiopia.pages.create( position: 5, title: "An Unexpected Request" )
ethiopia_p5_c1 = ethiopia_p5.cards.create(
position: 1,
content: <<-CARD
<p>As he was headed toward his car he heard someone call his name. “Mr.
Asefa?” Kidane turned around. A man was standing behind him. He was lean
and tall, and spoke in a deep, steady voice.</p>
<p>“Mr. Asefa, I am Mohammed O. Osman, and I represent the Ethiopian Somali
Ogden National Liberation Front. I was hoping I could speak to you about
the adaptation plans, but I was unable to make an appointment with
you.”</p>
<p>“How much do you know about NAPA?” Kidane was surprised; the planning
process had not yet come to the attention of the general public.</p>
<p>“I have friends in high places,” said Mohammed. “I’ve read the NAPA
document. A lot of it sounds good.”</p>
<p>“Well, that’s nice to hear,” said Kidane, “but why did you feel the need
to meet with me?” He shuffled his briefcase between hands; he didn’t have
much time to get to the recital.</p>
CARD
)
ethiopia_p5_c2 = ethiopia_p5.cards.create(
position: 2,
content: <<-CARD
<p>“I came to plead the case of my people,” Mohammed replied. “The Somali
living in western Ethiopia have long been oppressed by the Oromo. They
outnumber us greatly. We have <a data-edgenote="ethiopia-parliament">too few seats in parliament</a> to
allow us to defend our rights and represent ourselves properly. I wanted to
ask that you consider Somaliland for the implementation of the adaptation
plans. Our district has suffered many droughts in recent years—we are in a
very drought prone area. According to your NAPA report, the water reserved in
dams will be used for agriculture and electricity generation for large Somali
cities, leaving us behind with no water for agriculture as droughts
worsen.”</p>
CARD
)
ethiopia_p5_c3 = ethiopia_p5.cards.create(
position: 3,
content: <<-CARD
<p>“At the same time, we’ve had many floods the last few years.
Some&nbsp;<a data-edgenote="ethiopia-refugees">refugee camps</a>
housed in our land have even been washed out, which burdens our villages as
we are left to feed and house the refugees. We haven’t gotten much help from
UNHCR, let alone our own Ethiopian government. I also want to ask that you
consider long-term development initiatives. There is already a deep history
of ethnic tension in this region; we don’t want to fight over water and food
as well. My people live in poverty and we find few avenues to a better life.
Our livelihood depends on agriculture. If you chose development projects that
were slated for Somali land, my people would benefit greatly and we can
reduce tension in the region. Think about it, Mr. Asefa. You could address
poverty and global warming at the same time.”</p>
CARD
)
ethiopia_p5_c4 = ethiopia_p5.cards.create(
position: 4,
content: <<-CARD
<p>The man’s words were true. Kidane knew he wasn’t lying when he described
the situation of the Ethiopian Somali. As a minority population, they had
little presence in the government while they were subject to majority rule.
And everyone in Ethiopia knew that the Somali were poor; as farmers living on
land prone to both droughts and floods, it was a struggle for the Somali to
simply survive from year to year. Many NGOs operated in Somaliland to bring
in emergency food supplies – they’d been doing so since the 1980’s.</p>
CARD
)
ethiopia_p5_c5 = ethiopia_p5.cards.create(
position: 5,
content: <<-CARD
<p>After thinking for a moment, Kidane addressed the man. “Thank you for
sharing your concerns with me, Mr. Osman, but why come to me? Couldn’t
someone with more power better address your concerns?”</p>
<p>“No one in the government will meet with me.” Mohammed replied. “I said
I have friends in high places who can see what is happening within the
system, but they don’t have any power to do anything. The government sees
ONLF (Ogaden National Liberation Front) as opposition, so they won’t talk
with any of us. I was hoping that since you’re the one making decisions on
NAPA projects, you could direct some of their benefits our way. Please, we
need all the help we can get, and things will only get worse as the weather
continues to change.”</p>
CARD
)
ethiopia_p5_c6 = ethiopia_p5.cards.create(
position: 6,
content: <<-CARD
<p>Kidane, who was keenly aware of recent political history, recognized the
desperation of a plea coming from someone who was accustomed to having his
people’s opinions and needs ignored by an unresponsive government. As he
began his long drive in the setting sun, Kidane reflected on his long, tiring
day. He thought to himself that he had no answers and only more questions
than ever before. But he couldn’t stay stuck in thought forever; he had to
brush off these disconcerting thoughts to see his son in his first recital.
His wife would kill him if he missed it.</p>
CARD
)

ethiopia_p6 = ethiopia.pages.create( position: 6, title: "The Minister of Environment and Forests" )
ethiopia_p6_c1 = ethiopia_p6.cards.create(
position: 1,
content: <<-CARD
<p>The next day, Kidane met with Million Belay, the Minister of Environment
and Forests. “Mr. Belay, I was hoping I could consult with you on the NAPA
adaptation plans,” Kidane opened the discussion. Minister Belay shuffled
papers around his desk, barely glancing at Kidane.</p>
CARD
)
ethiopia_p6_c2 = ethiopia_p6.cards.create(
position: 2,
content: <<-CARD
<p>“Well, Mr. Asefa, I’ve looked over the NAPA plans and I don’t really see
how the projects are all that environmental; they look like regular
development to me. Food security? That’s just expanding the market so that
more farmers can participate. Building dams? You know how damaging dams are
for ecosystems, right? Not that development’s a bad thing. I just don’t see
how the NAPA board believes some of these endeavors will really help us
adapt to climate change.”</p>
<p>Kidane was slightly taken aback. “But food security is necessary to feed
the nation,” he replied. “What about forest carbon sequestration? That’s
certainly an environmental plan.”</p>
<p>“Yeah, it all sounds good Kidane, but these initiatives are mostly
development from my point of view. I can’t point you in any direction
because I’m still not sold that these adaptation plans will make all that
much difference in conserving the environment and coping with climate
risks. My Ministry’s performance is judged by its successes in <a data-edgenote="ethiopia-climate-complexity">forest preservation, ecosystem
integrity and endangered species protection</a>. We are losing our forests
at an unprecedented rate, and I have to focus on that. Sorry that I can’t
be more helpful in contributing any financial resources to these NAPA
projects.”</p>
CARD
)
ethiopia_p6_c3 = ethiopia_p6.cards.create(
position: 3,
content: <<-CARD
<p>Kidane left the Minister’s office in a very confused state. When he
arrived at his car he saw something that made his heart sink: two eggs had
been thrown against the car windshield. He supposed that Mohammed had told
the rest of his group about their meeting yesterday, and someone was
obviously upset with Kidane. He wished they could direct their concerns at
the government instead of getting mad at him. He looked around for a store to
buy some cleaner.</p>
CARD
)
ethiopia_p6_c4 = ethiopia_p6.cards.create(
position: 4,
content: <<-CARD
<p>Now the stress was really beginning to overwhelm Kidane. He wanted to pick
the best adaptation plans for Ethiopia, but the context he was working with
seemed to grow murkier and murkier. At first he thought making a plan would
be easy by simply conducting a cost-benefit analysis; now he didn’t even know
where to start. The one thing that had become clear was that he certainly
could not satisfy everyone, and that he would not be able to fight against
all outside pressures. What in the world was he supposed to do when the
economic minister didn’t think the projects had development merit and the
environment minister didn’t think the projects had any environmental merit?
Kidane needed government support and additional resources to carry any of
these projects out.</p>
CARD
)
ethiopia_p6_c5 = ethiopia_p6.cards.create(
position: 5,
content: <<-CARD
<p><a data-edgenote="basics-of-cba">Somehow, he had to pick
the best projects</a> to gain public approval and have an immediate impact on
Ethiopia’s adaptation to climate change. These projects also needed to
fulfill the criteria for UNEP funding. He knew he’d have to come up with a
definitive list of criteria to help him determine the best projects to
pursue.</p>
CARD
)

ethiopia_p7 = ethiopia.pages.create( position: 7, title: "The NAPA Steering Committee" )
ethiopia_p7_c1 = ethiopia_p7.cards.create(
position: 1,
content: <<-CARD
<p>A week later, Kidane had to meet with other members of the NAPA Steering
Committee to talk over the available projects and decide which ones to
recommend for action. In the room with him were Dawit Asfaw, Solomon Ejigu,
Mulugeta Abera, and Helina Mehretu. Kidane had a lot on his mind, so he
simply listened while the others talked.</p>
CARD
)
ethiopia_p7_c2 = ethiopia_p7.cards.create(
position: 2,
content: <<-CARD
<p>“I think that we should go with the capacity building project. It has a
synergistic effect on other sectors and helps increase the possibility of
implementation of other projects in future” said Solomon.</p>
<p>“We’ll need sustainable agriculture, since most of the country is
agricultural.”</p>
<p>“I think the hydropower project is the best,” said Dawit. “By the time
climate change really hits, most people will have migrated to cities. We
need to look at more urban projects, and the hydropower project will serve
some semi-urban areas. I don’t want to use too many technical terms, but
this project has the highest NPV and IRR, which means that it is the best
one.”</p>
<p>“You mean the best in terms of economic indicators, which are highly
dependent on many assumptions. In addition, sustainability is not all about
economics. There are other aspects that we need to consider as well. I
think the forestry project makes the most sense,” said Helina.</p>
<p>“We need to start carbon sequestration. We lost two thirds of our forest
during the last decades.”</p>
<p>“I’d like to see us go for something that encompasses development more,”
said Dawit. “People don’t have clean water to drink, sufficient food to eat
or proper sanitation and we want them to be concerned about climate change?
We must invest our limited resources in projects with higher
priorities.”</p>
CARD
)
ethiopia_p7_c3 = ethiopia_p7.cards.create(
position: 3,
content: <<-CARD
<p>“Well,” Mulugehta asked, “What do you think about the forecasting system?
We’ve got droughts every two years, and we don’t want a situation like the
<a data-edgenote="mass-starvation-in-ethiopia">starvation that happened in
the 80’s</a>. Maybe the forecasting program would be best.” Dawit nodded.</p>
CARD
)
ethiopia_p7_c4 = ethiopia_p7.cards.create(
position: 4,
content: <<-CARD
<p>“What do you think, Kidane?” asked Helina.</p>
<p>Kidane was silent for a moment, and he rubbed his temples. He was
getting a headache. All four of the projects were good; he had no idea how
to find the correct one that everyone would support, including the
stakeholders he’d met with previously. He thought back to an
intergovernmental decisionmaking class he took in graduate school. They
used a multi-criteria cost-benefit analysis technique looking through
several different economic, social and political lenses to solve complex
problems. It involved considering not only environmental effects, but
social outcomes as well. He finally began to speak. “I have an idea…”</p>
CARD
)

pod = ethiopia.podcasts.create(
  title: "Science and Social Conflicts in Climate Planning: The View from Ethiopia",
  audio_url: "http://www.hotinhere.us/podcast-download/13/08-28-2015science-and-social-conflicts-in-climate-planning-the-view-from-ethiopia.mp3?ref=download",
  position: 1,
  description: "<p>This week’s show brings our listeners more than an hour of in-depth analysis and lively conversation on the challenges of climate change planning, both in Ethiopia and across the diverse governance landscape of East and North Africa. Tying in closely with a case study newly developed by a team of SNRE students for the pilot project “Michigan Sustainability Cases,” the broadcast explores the complexity of crafting effective and equitable adaptation policy. Specifically, we ask how national adaptation plans are made? By and for whom? What are the decision-making criteria? And what could these criteria fail to account for? Bringing together legal, anthropological, and environmental expertise, the broadcast takes adaptation policy as the starting point for a broad-ranging dialogue on climate change impacts, social conflict across ethno-linguistic groups, and national planning as a tool of marginalization.</p>",
  artwork_url: "http://i2.wp.com/www.hotinhere.us/wp-content/uploads/2015/08/ethiopia_wCredit.jpg?resize=1038%2C576",
  credits_list: {
    hosts: ["Katie Browne", "Arman Golrokhian", "Rebecca Hardin"],
    guests: [
      {name: "Kelly Askew", title: "Professor, Department of Anthropology & Department of African and Afroamerican Studies, University of Michigan" },
      {name: "Laura Beny", title: "Professor, Law School, University of Michigan" },
      {name: "Benjamin Larroquette", title: "Regional Technical Advisor, United Nations Development Programme" },
      {name: "Benjamin Morse", title: "Masters Student, School of Natural Resources and Environment, University of Michigan"}
    ]
  }
)

act1 = ethiopia.activities.create title: "Review project proposals", position: 1, pdf_url: "http://remley.wcbn.org/ihih-msc/wp-content/uploads/2016/02/projects.pdf"
act2 = ethiopia.activities.create title: "Conduct cost–benefit analysis", position: 2, pdf_url: "http://remley.wcbn.org/ihih-msc/wp-content/uploads/2016/02/Ethiopia-Case-CBA.xlsx"

require './db/seeds/edgenotes/ethiopia-napa-edgenotes.rb'
