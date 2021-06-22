import React from 'react'
import Layout from '@theme/Layout'
import publicationsStyle from './publicationsStyle.module.css'
import Wrapper from '../components/pageWrapper'
function PublicationsPage() {
  const publications = [
    {
      /*
    {
      title: '',
      citation: '',
      date: '',
      url: '',
    },
    */
      title:
        'The Michigan Sustainability Cases Initiative: Adapting Case-Based Teaching for Innovative Sustainability Science Education',
      citation:
        'Wagner, Meghan, et al. "The Michigan Sustainability Cases Initiative: Adapting Case-Based Teaching for Innovative Sustainability Science Education."',
      date: '2020',
      url:
        'https://crlt.umich.edu/michigan-sustainability-cases-initiative-adapting-case-based-teaching-innovative-sustainability',
    },
    {
      title:
        'A Teacher Fellowship Program: Integrating Place-Based Sustainability Education into K - 12 Classrooms',
      citation:
        'Glassman, Julia, and Allyson Wiley. "A Teacher Fellowship Program: Integrating Place-Based Sustainability Education into K-12 Classrooms." (2020).',
      date: '2020',
      url: 'https://deepblue.lib.umich.edu/handle/2027.42/155015',
    },
    {
      title:
        'A Dissertation on Sustainability Competence: Directions for Nursing',
      citation:
        'Czerwinski, Megan. A Dissertation on Sustainability Competence: Directions for Nursing. Diss. 2020.',
      date: '2020',
      url: 'http://hdl.handle.net/2027.42/163148',
    },
    {
      title:
        'Michigan Sustainability Case: Rural Electrification: Which Infrastructure Is Best for the Brazilian Pantanal?',
      citation:
        'Oliphant, Elizabeth, Austin Broda, and Adam C. Simon. "Michigan Sustainability Case: Rural Electrification: Which Infrastructure Is Best for the Brazilian Pantanal?." Sustainability: The Journal of Record 13.4 (2020): 161-171.',
      date: '2020-08-01',
      url: 'https://www.liebertpub.com/doi/full/10.1089/sus.2020.0005',
    },
    {
      title:
        'Guardians of the Forests: How Should an Indigenous Community in Eastern Bolivia Defend Their Land and Forests under Increasing Political and Economic Pressures?',
      citation:
        'He, Yifan, et al. "Guardians of the Forests: How Should an Indigenous Community in Eastern Bolivia Defend Their Land and Forests under Increasing Political and Economic Pressures?." Case Studies in the Environment 3.1 (2019): 1-14.',
      date: '2019-12-31',
      url: 'https://doi.org/10.1525/cse.2019.sc.946307',
    },
    {
      title:
        'Michigan Sustainability Case: Struggles over Science: What Is the Role for Science in Community Forestry in Nepal?',
      citation:
        'Rutt, Rebecca, and Meghan Wagner. "Michigan Sustainability Case: Struggles over Science: What Is the Role for Science in Community Forestry in Nepal?." Sustainability: The Journal of Record 12.1 (2019): 10-17.',
      date: '2019-01-31',
      url: 'https://doi.org/10.1089/sus.2018.0025',
    },
    {
      title:
        'Michigan Sustainability Case: Revisiting the Three Gorges Dam: Should China Continue To Build Dams on the Yangtze River?',
      citation:
        'Chang, Chun Yin Anson, et al. "Michigan Sustainability Case: Revisiting the Three Gorges Dam: Should China Continue To Build Dams on the Yangtze River?." Sustainability: The Journal of Record 11.5 (2018): 204-215.',
      date: '2018-11-14',
      url: 'https://doi.org/10.1089/sus.2018.29141.cyac',
    },

    {
      title:
        'Collaborative Creation and Implementation of a Michigan Sustainability Case on Urban Farming in Detroit',
      citation:
        'Boone, Lauren, et al. "Collaborative Creation and Implementation of a Michigan Sustainability Case on Urban Farming in Detroit." Case Studies in the Environment (2018).',
      date: '2018',
      url: 'https://doi.org/10.1525/cse.2017.000703',
    },
    {
      title:
        'Biofuels: Beneficial or Bad? Should a Ghanaian Chief Sell His Land for Biofuel Crop Cultivation?',
      citation:
        'Oliphant, Elizabeth, et al. "Biofuels: Beneficial or Bad? Should a Ghanaian Chief Sell His Land for Biofuel Crop Cultivation?." Sustainability: The Journal of Record 11.1 (2018): 16-23.',
      date: '2018',
      url: 'https://doi.org/10.1089/sus.2018.29121.eo',
    },
    {
      title:
        'Pursuing the Promise of Case Studies for Sustainability and Environmental Education: Converging Initiatives',
      citation:
        'Wei, Cynthia A., Minna Brown, and Meghan Wagner. "Pursuing the promise of case studies for sustainability and environmental education: converging initiatives." Case Studies in the Environment (2018).',
      date: '2018',
      url: 'https://doi.org/10.1525/cse.2018.001065',
    },
    {
      title:
        'Michigan Sustainability Case: Smarting over Smart Meters: Does Smart Grid Technology Have a Home in Maryland?',
      citation:
        'Petito, Gianna, et al. "Michigan Sustainability Case: Smarting over Smart Meters: Does Smart Grid Technology Have a Home in Maryland?." Sustainability: The Journal of Record 10.1 (2017): 14-23.',
      date: '2017',
      url: 'https://www.liebertpub.com/doi/pdf/10.1089/sus.2017.29078.gp',
    },
    {
      title:
        'Towards a revolution in sustainability education: Vision, architecture, and assessment in a case-based approach',
      citation:
        'Hardin, Rebecca, et al. "Towards a revolution in sustainability education: Vision, architecture, and assessment in a case-based approach." World Development Perspectives 1 (2016): 58-63.',
      date: '2016',
      url: 'https://doi.org/10.1016/j.wdp.2016.05.006',
    },
    {
      title:
        'Michigan Sustainability Cases: An International Platform for Sustainability Education',
      citation:
        'Browne, Katherine. "Michigan Sustainability Cases: An International Platform for Sustainability Education." (2016).',
      date: '2016',
      url:
        'https://deepblue.lib.umich.edu/bitstream/handle/2027.42/138243/paf200077.pdf?sequence=1',
    },
  ]

  function Publications() {
    return (
      <div className={publicationsStyle.publications}>
        <ul>
          {publications.map((pub, index) => (
            <li key={index}>
              <a href={pub.url}>
                <h4>{pub.title}</h4>
              </a>
              <p className={publicationsStyle.citation}>{pub.citation}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Layout title="Publications">
      <Wrapper>
        <header>
          <h1>Publications</h1>
        </header>
        <main>
          <Publications />
        </main>
      </Wrapper>
    </Layout>
  )
}

export default PublicationsPage
