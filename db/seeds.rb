I18n.locale = :en
ethiopia = Case.create(
  published: true,
  title: "Ethiopia’s National Adaptation Plan of Action: How will Ethiopia respond to climate change?",
  slug: "ethiopia-napa",
  authors: ["Mohammad Golrokhian", "Katie Browne", "Emily Durand", "Benjamin Fortney", "Brendan Malone", "Alexander Natanson", "Nadia Vandergriff"],
  summary: "This real-life case takes place in August 2015 in Ethiopia. Kidane Asefa, the chairman of the National Adaptation Program of Action (NAPA) and focal point for the United Nations Framework Convention on Climate Change (UNFCCC) in Ethiopia, is faced with the challenge of selecting and prioritizing proposed climate adaptation projects. Though the NAPA committee has already identified the most promising projects for consideration, Mr. Asefa is now responsible for weighing the relative costs and benefits of each plan and deciding how to best allocate Ethiopia’s limited financial, technical and administrative resources. The analytical techniques Mr. Asefa chooses to employ, and ultimately the projects he selects, will guide how his country addresses and adapts to the critical challenge of climate change.",
  tags: %w(region:africa exercise:quantitative),
  narrative: <<-NARRATIVE
<p><strong><a href="/read/611/0/edgenotes/614">Kidane Asefa</a> </strong>has had a very busy morning. He is rushing to meet with Fahmy Abdel Aal, Executive Director of the <em>United Nations Environmental Program</em>, and Sufian Ahmed, the Ethiopian Minister of Finance and Economic Development. Both are very important meetings; these conversations are at the core of the consultation process which will guide Kidane’s decision on which adaptation plans to implement. As Director General for the <strong>National Adaptation Plan of Action</strong> (NAPA) and focal point for the the <em>United Nations Framework Convention on Climate Change</em> (UNFCCC) in Ethiopia, he has already dedicated more than a year to the plan. The projects Kidane is tasked with prioritizing aim to ameliorate the effects of climate change impacts and prepare Ethiopia as much as possible for negative impacts. Kidane abandoned a successful engineering career in order to answer this important calling. And the decision-making process needed to happen quickly: the UNFCCC requested a report with recommended projects and prioritizations by November, and already it is August.</p>
  NARRATIVE
)

wolf = Case.create(
  published: true,
  title: "Wolf Wars: Should We Hunt Gray Wolves in Michigan?",
  slug: "mi-wolves",
  authors: ["Steven Yaffee", "Julia Wondolleck", "David Wang", "Sheena Vanleuven"],
  summary: "This case study details an active issue in the state of Michigan: whether or not to allow a public wolf hunt. The chairperson of the Michigan Natural Resources Commission, J.R. Richardson, faces a difficult decision. Once an endangered species, gray wolves have recovered in northern Michigan enough that some groups are pushing for a public wolf hunt. The Michigan Department of Natural Resources agrees and believes that a limited public hunt is scientifically and economically justified. But others are not convinced and have reacted with skepticism and hostility. What should the chairperson’s decision be? This case asks that you examine the issue from opposing, nuanced perspectives, and be guided by scientific, political, economic, and social analysis. Ultimately, you will be expected to make a responsible, sustainable policy recommendation on Michigan’s wolf population.",
  tags: %w(region:michigan exercise:role_play),
  narrative: <<-NARRATIVE
<p><strong>J. R. Richardson</strong> took a break from some documents he was reading to think about a difficult decision that he would face in the upcoming days: whether to vote in favor of allowing a wolf hunt to take place in the state of Michigan. As chair of the <em>Natural Resources Commission</em> (NRC), a seven-person policy advisory body to the state’s <em>Department of Natural Resources</em> (DNR), Richardson had dealt with his fair share of contentious issues during his tenure at the NRC since 2007. But he could remember none that had aroused such passion from all sides as the wolf hunt issue. As a result, he felt a great deal of pressure to lead the NRC to make the right decision based on sound science, respect <a href="/read/497/0/edgenotes/502">for the needs of the people who are affected</a> by the presence of wolves, and sensitivity to public opinion.</p>
  NARRATIVE
)

I18n.locale = :fr
wolf.title = "Le Guerre des Loups"
wolf.summary = "Ce cas d’étude décrit un problème important dans l’Etat du Michigan, aux USA : permettre une chasse publique au loup ou non ? Le Président de la Commission des Ressources Naturelles du Michigan CRNM ou MNRC en anglais), J.R. Richardson, est confronté à une décision difficile à prendre. Autrefois une des espèces en voie de disparition, les loups gris se sont récemment rétablis dans le nord du Michigan, plusieurs groupes de personnes font pression pour qu’une chasse publique au loup soit autorisée. Le Ministère des Ressources Naturelles du Michigan (MRNM ou MDNR en anglais) est d'accord, et estime qu'une chasse publique limitée est scientifiquement et économiquement justifiée. Mais d'autres ne sont pas convaincus et ont réagi avec scepticisme et hostilité. Quelle devrait être la décision du Président? Cette affaire demande que l’on examine la question avec des points de vue opposés, nuancés et guidés par une analyse scientifique, politique, économique et sociale. En fin de compte, on s'attendra à formuler une recommandation de politique responsable et durable concernant la population de loups du Michigan."
wolf.narrative = <<-NARRATIVE
<p><strong>J. R. Richardson</strong> marqua une pause à propos des documents qu’il lisait pour réfléchir sur la décision difficile qu’il devrait prendre dans les jours à venir : s'il faut voter en faveur ou non de la permission de la chasse au loup dans l'Etat du Michigan. En tant que Président de <em>La Commission des Ressources Naturelles</em> (CRN ou NRC en anglais), un organe consultatif composé de sept cadres du <em>Ministère d’Etat des Ressources Naturelles</em> (MRN ou DNR en anglais), Richardson avait traité sa juste part des questions litigieuses pendant son mandat au CRN depuis 2007. Mais il pouvait se souvenir qu’aucun problème n’avait suscité une telle passion de tous les côtés comme celui de la chasse au loup. En conséquence, il a ressenti beaucoup de pressions pour conduire le CRN à prendre la bonne décision, c’est-à-dire celle basée sur des principes scientifiques, le respect des <a href="/read/497/0/edgenotes/502">besoins des personnes qui sont affectées</a> par la présence de loups et la sensibilité à l'opinion publique.</p>
NARRATIVE
wolf.save

I18n.locale = :en
cameron = Reader.create(id: 1, name: "Cameron Bothner", image_url: "https://lh3.googleusercontent.com/-_i-0kZDjsWI/AAA...", email: "cbothner@umich.edu", password: "$2a$11$iJwtewgka8OW9qPEvdUxHOYbe6g2EUFN8Fp2HfoMDTM...", provider: "google_oauth2", uid: "102343030121442585482", authentication_token: "sdsRFgm-ZznkejWt4D4K")
cameron.groups.create(name: "Team Koala")
cameron.cases << wolf
