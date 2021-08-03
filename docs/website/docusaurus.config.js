/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Gala',
  tagline: 'Open tools for sustainability learning',
  url: 'https://docs.learngala.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'https://msc-gala.imgix.net/favicon_gala.png',
  organizationName: 'galahq', // Usually your GitHub org/user name.
  projectName: 'gala-docs', // Usually your repo name.

  customFields: {
    fonts: {
      sansSerif: ['Tenso', 'system-ui'],
    },
  },
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      title: '',
      logo: {
        alt: 'Gala',
        src: 'img/gala-logo.svg',
      },
      items: [
        {
          to: '/',
          label: 'About',
          position: 'right',
        },
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Guides',
          position: 'right',
        },
        { to: 'blog', label: 'Blog', position: 'right' },
        {
          to: '/help',
          label: 'Help',
          position: 'right',
        },
        {
          href: 'https://www.learngala.com',
          label: 'Go to Gala',
          position: 'right',
        },
      ],
    },
    colorMode: {
      disableSwitch: true,
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'About',
          items: [
            {
              label: 'Publications',
              to: 'publications',
            },
          ],
        },
        {
          title: 'Guides',
          items: [
            {
              // Label of the link
              label: 'Authoring',
              // Client-side routing, used for navigating within the website.
              // The baseUrl will be automatically prepended to this value.
              to: 'docs/',
            },
            {
              label: 'Teaching',
              to: 'docs/teaching-getting-started',
            },
          ],
        },

        /*
        {
          title: 'Policies',
          items: [
            {
              // Label of the link
              label: 'Terms of Use',
              // Client-side routing, used for navigating within the website.
              // The baseUrl will be automatically prepended to this value.
              to: 'policies/#terms-of-use-agreement-for-the-gala-platform',
            },
            {
              label: 'Privacy',
              to: 'policies/#gala-privacy-policy',
            },
            {
              label: 'Copyright',
              to: 'policies/#intellectual-property-rights-policy',
            },
          ],
        }, */
        {
          title: 'Community',
          items: [
            {
              label: 'Twitter',
              href: 'https://twitter.com/LearnMSC',
            },
            {
              label: 'Github',
              // A full-page navigation, used for navigating outside of the website.
              href: 'https://github.com/galahq/gala',
            },
          ],
        },
      ],
      copyright: 'Copyright © 2021 Regents of the University of Michigan',
      logo: {
        src: 'img/gala-logo.svg',
      },
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/galahq/gala',
        },
        blog: {
          showReadingTime: false,
          // Please change this to your repo.
          editUrl: 'https://github.com/galahq/gala',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  scripts: ['static/js/typekit.js'],
}
