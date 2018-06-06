const siteConfig = {
  title: 'Gala',
  tagline: 'Open-access learning tools for\nsustainability science',
  url: 'https://docs.learngala.com',
  baseUrl: '/',

  projectName: 'gala-docs',
  organizationName: 'galahq',

  headerLinks: [
    { doc: 'authoring-getting-started', label: 'Authoring' },
    { doc: 'teaching-getting-started', label: 'Teaching' },
    { page: 'help', label: 'Help' },
    { href: 'https://www.learngala.com', label: 'Go to Gala' },
  ],

  headerIcon: 'img/gala-logo.svg',
  footerIcon: 'img/gala-logo.svg',

  colors: {
    primaryColor: '#02284B',
    secondaryColor: '#1D3F5E',
  },

  fonts: {
    sansSerif: ['Tenso', 'system-ui'],
  },

  copyright: `Copyright © ${new Date().getFullYear()} Regents of the University of Michigan`,

  highlight: {
    theme: 'default',
  },

  scripts: ['https://buttons.github.io/buttons.js', '/js/typekit.js'],

  onPageNav: 'separate',

  ogImage: 'img/gala-logo.svg',
  twitterImage: 'img/gala-logo.svg',

  repoUrl: 'https://github.com/galahq/gala',
}

module.exports = siteConfig
