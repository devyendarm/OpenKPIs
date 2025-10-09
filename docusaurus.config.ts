import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Open KPIs',
  url: 'https://devyendarm.github.io',
  baseUrl: '/OpenKPIs/',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'devyendarm',
  projectName: 'OpenKPIs',

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs/kpis',
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.kpis.js'),
        },
        blog: false,
        theme: { customCss: require.resolve('./src/css/custom.css') },
      },
    ],
  ],

  scripts: [
    {
      src: '/OpenKPIs/js/copy-code.js?v=9',
      async: true,
    },
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'dimensions',
        path: 'docs/dimensions',
        routeBasePath: 'dimensions',
        sidebarPath: require.resolve('./sidebars.dimensions.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'events',
        path: 'docs/events',
        routeBasePath: 'events',
        sidebarPath: require.resolve('./sidebars.events.js'),
      },
    ],
  ],

  themeConfig: {
    // Safe SEO Meta Tags
    metadata: [
      {name: 'keywords', content: 'KPI, analytics, metrics, data analysis, business intelligence, open source, GA4, Adobe Analytics, Amplitude'},
      {name: 'author', content: 'OpenKPIs Team'},
      {name: 'robots', content: 'index, follow'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1.0'},
    ],
    
    navbar: {
      title: 'OpenKPIs',
      items: [
        { to: '/docs', label: 'KPIs', position: 'left' },
        { to: '/dimensions', label: 'Dimensions', position: 'left' },
        { to: '/events', label: 'Events', position: 'left' },
        {
          type: 'dropdown',
          label: 'Industries',
          position: 'left',
          items: [
            { label: 'Retail', to: '/docs?industry=retail' },
            { label: 'SaaS', to: '/docs?industry=saas' },
            { label: 'E-commerce', to: '/docs?industry=ecommerce' },
            { label: 'Healthcare', to: '/docs?industry=healthcare' },
          ],
        },
        {
          type: 'dropdown',
          label: 'Categories',
          position: 'left',
          items: [
            { label: 'Conversion', to: '/docs?category=conversion' },
            { label: 'Revenue', to: '/docs?category=revenue' },
            { label: 'Engagement', to: '/docs?category=engagement' },
            { label: 'Retention', to: '/docs?category=retention' },
          ],
        },
        {
          type: 'html',
          position: 'right',
          value: '<input type="text" placeholder="Search" style="padding: 0.4rem 0.6rem; border: 1px solid var(--ifm-color-emphasis-300); border-radius: 4px; font-size: 0.85rem; width: 120px; background-color: var(--ifm-background-color); color: var(--ifm-font-color-base); outline: none;" onkeypress="if(event.key===\'Enter\'){window.location.href=\'./search?q=\'+encodeURIComponent(this.value)}" />',
        },
        { href: 'https://github.com/devyendarm/OpenKPIs', label: 'GitHub', position: 'right' },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  },
};

export default config;