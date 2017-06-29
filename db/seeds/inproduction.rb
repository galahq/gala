# frozen_string_literal: true

I18n.locale = :en

damremoval = Case.create(
  slug: 'maple-dam-removal',
  published: false,
  tags: %w[region:usa],
  cover_url: 'https://farm8.staticflickr.com/7384/10092633705_739973e235_k_d.jpg',
  authors: [
    'Paul Moore',
    'Molly Watters',
    'Kevin He',
    'Lauren Edson'
  ],
  kicker: 'Unmaking Lake Kathleen',
  title: 'Is dam removal right for the Maple River?',
  dek: 'New approaches to undoing dams can limit ecological impact and toxins, but might be too costly.'
)

cookstove = Case.create(
  slug: 'gabon-cookstove',
  published: false,
  tags: %w[region:africa],
  cover_url: 'http://www.hotinhere.us/wp-content/uploads/2016/08/IMG_0181-e1471290543275.jpg',
  authors: [
    'Alex Clayton',
    'Ember McCoy',
    'Arun Agrawal'
  ],
  kicker: 'Codesigning Efficiency',
  title: 'Who knows the best cookstove design for Gabonese communities?',
  dek: 'Inefficient stoves cause health problems, deforestation, and air pollution; collaborative construction could offer alternatives.'
)

landcover = Case.create(
  slug: 'ethiopia-landcover',
  published: false,
  tags: %w[region:africa],
  cover_url: 'https://images.unsplash.com/photo-1414236062502-90ed8c981d71?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=512&h=512&fit=crop&s=c1efac6c6687ed6f8667bc2736b9780b',
  authors: [
    'Rosie Pahl Donaldson',
    'Alexander Rosen',
    'Drew Philips',
    'Larissa Larsen'
  ],

  kicker: 'Planning by the People',
  title: 'Can participatory urban planning in Addis Ababa be a model for cities everywhere?',
  dek: 'Innovative land-cover mapping at the neighborhood scale in Africa helps resolve food and water security challenges.'
)

lead = Case.create(
  slug: 'lead',
  published: false,
  tags: %w[region:usa],
  cover_url: 'http://i2.wp.com/www.hotinhere.us/wp-content/uploads/2016/05/5150555940_1fcc375122_b-1.jpg?zoom=2&resize=562%2C311',
  authors: [
    'Mike Burbidge',
    'Ember McCoy',
    'Austin Martin',
    'Paul Mohai'
  ],
  kicker: 'Tailpipe to Tap',
  title: 'How did the Reagan administration become leaders on unleaded gasoline?',
  dek: "Today's water safety advocates might take cues from leadership lessons in the past."
)

chinainafrica = Case.create(
  slug: 'china-africa-infrastructure',
  published: false,
  tags: %w[region:africa],
  cover_url: 'http://i1.wp.com/www.hotinhere.us/wp-content/uploads/2016/02/Arriver_de_chinois_dans_notre_societ%C3%A9.jpg?resize=1038%2C576',
  authors: [
    'Amanda Kaminski',
    'Maddie Bianchie',
    'Omolade Adunbi'
  ],
  kicker: 'Deep Port Politics',
  title: "Will China's investment in African infrastructure harm economies?",
  dek: 'China is building roads, harbors, and railroads, but monetary and ecological monitoring is crucial.'
)

ghana_ewaste = Case.create(
  slug: 'ewaste-in-ghana',
  published: false,
  tags: %w[region:africa :quantitative],
  cover_url: 'https://images.unsplash.com/photo-1417144527634-653e3dec77b2?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=512&h=512&fit=crop&s=ac3484b17524e1b918a6fd7a6435193d',
  authors: [
    'Elizabeth Oliphant',
    'Mark Finlay',
    'Adam Simon',
    'Brian Arbic'
  ],
  kicker: 'Dealing with E-Debris',
  title: 'How do we balance livelihoods and life expectancy in the tech landfills of Ghana?',
  dek: "Processing e-waste is profitable but risky; municipal control would have costs and benefits for Accra's urban poor."
)

smartmeters = Case.create(
  slug: 'maryland-smartmeters',
  published: false,
  tags: %w[region:usa],
  cover_url: 'https://images.unsplash.com/photo-1413882353314-73389f63b6fd?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=512&h=512&fit=crop&s=4d5df1dbe1d7b5a6bb6e92daf59b2e18',
  authors: [
    'Gianna Petito',
    'Geoff Burmeister',
    'Michael Moore'
  ],

  kicker: 'Smarting over Smart Meters',
  title: 'Will Baltimore Gas & Electric clients accept comprehensive monitoring?',
  dek: 'BG&E is trying to reconcile consumer privacy with service provisioning efficiency.'
)

tesla = Case.create(
  slug: 'tesla-powerwall',
  published: false,
  tags: %w[region:usa],
  cover_url: 'https://images.unsplash.com/photo-1468434453985-b1ca3b555f00?dpr=2&amp;auto=format&amp;crop=entropy&amp;fit=crop&amp;w=1500&amp;h=1000&amp;q=80&amp;cs=tinysrgb',
  authors: [
    'Andrea Kraus',
    'Braxton Mashburn',
    'Jeremiah Johnson'
  ],
  catalog_position: :featured,
  kicker: 'Energy Storage Innovation',
  title: 'Can Green Mountain Power and Tesla solve the “peak” problem?',
  dek: 'Right now, what’s holding us back from 100% renewable power is the hour a day when everyone turns on their AC; energy storage might hold the key.'
)

flintwater = Case.create(
  slug: 'flint-water',
  published: false,
  tags: %w[region:usa],
  cover_url: 'https://images.unsplash.com/14/unsplash_524000a90aaad_1.JPG?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&w=512&h=512&fit=crop&s=dc7275b6369c623d975484143fbb6a17',
  authors: [
    'Sarah Marshall',
    'Kristin Steiner',
    'Caitlin Harrington',
    'Yajing Zhaou',
    'Arun Agrawal'
  ],

  kicker: 'Water Crisis Confidential',
  title: 'Can Flint nonprofit funding meet urgent community needs?',
  dek: 'Emergencies demand rapid response: NGOs need to know how to move money around fast.'
)

gelman = Case.create(
  slug: 'dioxane-plume',
  published: false,
  tags: %w[region:usa],
  cover_url: 'http://www.hotinhere.us/wp-content/uploads/2016/08/IMG_0384cropped-1024x728.png',
  authors: [
    'Anna Prushinskaya',
    'Allen Burton'
  ],

  kicker: 'Dioxane Plume Pollution',
  title: 'Should Ann Arbor be a superfund site?',
  dek: 'City, county, and federal actors confer about limited remediation where cleanup is too costly.'
)

cherrygrower = Case.create(
  slug: 'michigan-cherry-growers',
  published: false,
  tags: %w[region:usa],
  cover_url: 'http://i1.wp.com/www.hotinhere.us/wp-content/uploads/2016/08/5126578305_eef5d26783_o.png',
  authors: [
    'Ed Waisanen',
    'Paige Fischer'
  ],

  kicker: 'Souring Climate',
  title: 'Can Michigan tart cherry growers adapt to changing weather?',
  dek: 'As earlier blooms expose cherries frost, the industry searches for a solution.'
)

fracking = Case.create(
  slug: 'michigan-fracking',
  published: false,
  tags: %w[region:usa exercise:quantitative],
  cover_url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Process_of_mixing_water_with_fracking_fluids_to_be_injected_into_the_ground.JPG',
  authors: [
    'Alexander Truelove',
    'Victoria Campbell-Arvai'
  ],

  kicker: 'Fuel Fracas',
  title: 'Can Michigan legislators create frameworks for limiting damage from fracking?',
  dek: 'Efforts to ban hydraulic fracturing have failed; governance solutions remain to be tested.'
)

fairtrade = Case.create(
  slug: 'fair-trade-coffee',
  published: false,
  authors: [
    'Carissa de Young',
    'Joe Arvai'
  ],
  cover_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?dpr=2&amp;auto=format&amp;crop=entropy&amp;fit=crop&amp;w=1500&amp;h=1144&amp;q=80&amp;cs=tinysrgb',
  kicker: 'Certified “fair”',
  title: 'Are direct trade supply chains better for Peruvian coffee producers?',
  dek: 'Certification is a complex process and consumers increasingly have alternatives.'
)
