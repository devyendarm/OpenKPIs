import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Open KPIs',
  url: 'https://openkpis.org',
  baseUrl: '/',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'devyendarm',
  projectName: 'OpenKPIs',

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs/kpis',
          routeBasePath: 'kpis',
          sidebarPath: require.resolve('./sidebars.kpis.js'),
        },
        blog: false,
        theme: { customCss: require.resolve('./src/css/custom.css') },
      },
    ],
  ],

  scripts: [
    {
      src: '/js/copy-code.js?v=9',
      async: true,
    },
    {
      src: '/js/gtm-head.js',
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
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'metrics',
        path: 'docs/metrics',
        routeBasePath: 'metrics-catalog',
        sidebarPath: require.resolve('./sidebars.metrics.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'dashboards',
        path: 'docs/dashboards',
        routeBasePath: 'dashboards',
        sidebarPath: require.resolve('./sidebars.dashboards.js'),
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
        { to: '/kpis', label: 'KPIs', position: 'left' },
        { to: '/dimensions', label: 'Dimensions', position: 'left' },
        { to: '/events', label: 'Events', position: 'left' },
        { to: '/metrics-catalog', label: 'Metrics', position: 'left' },
        { to: '/dashboards', label: 'Dashboards', position: 'left' },
        {
          type: 'dropdown',
          label: 'Industries',
          position: 'left',
          items: [
            { label: 'Retail', to: '/kpis?industry=retail' },
            { label: 'SaaS', to: '/kpis?industry=saas' },
            { label: 'E-commerce', to: '/kpis?industry=ecommerce' },
            { label: 'Healthcare', to: '/kpis?industry=healthcare' },
          ],
        },
        {
          type: 'dropdown',
          label: 'Categories',
          position: 'left',
          items: [
            { label: 'Conversion', to: '/kpis?category=conversion' },
            { label: 'Revenue', to: '/kpis?category=revenue' },
            { label: 'Engagement', to: '/kpis?category=engagement' },
            { label: 'Retention', to: '/kpis?category=retention' },
          ],
        },
        {
          type: 'html',
          position: 'right',
          value: '<input type="text" placeholder="Search" style="padding: 0.4rem 0.6rem; border: 1px solid var(--ifm-color-emphasis-300); border-radius: 4px; font-size: 0.85rem; width: 120px; background-color: var(--ifm-background-color); color: var(--ifm-font-color-base); outline: none;" onkeypress="if(event.key===\'Enter\'){var b=(window.__docusaurus&&window.__docusaurus.baseUrl)||\'/\'; window.location.href=b+\'search?q=\'+encodeURIComponent(this.value)}" />',
        },
        {
          type: 'html',
          position: 'right',
          value: '<div id="github-signin-root"></div>',
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
