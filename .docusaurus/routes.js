import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/dimensions/new',
    component: ComponentCreator('/dimensions/new', '700'),
    exact: true
  },
  {
    path: '/events/new',
    component: ComponentCreator('/events/new', '798'),
    exact: true
  },
  {
    path: '/kpis/new',
    component: ComponentCreator('/kpis/new', '78d'),
    exact: true
  },
  {
    path: '/metrics/new',
    component: ComponentCreator('/metrics/new', '778'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', 'be6'),
    exact: true
  },
  {
    path: '/dimensions',
    component: ComponentCreator('/dimensions', '9a6'),
    routes: [
      {
        path: '/dimensions',
        component: ComponentCreator('/dimensions', 'b20'),
        routes: [
          {
            path: '/dimensions/tags',
            component: ComponentCreator('/dimensions/tags', '9a9'),
            exact: true
          },
          {
            path: '/dimensions/tags/content-engagement',
            component: ComponentCreator('/dimensions/tags/content-engagement', 'b31'),
            exact: true
          },
          {
            path: '/dimensions/tags/cross-industry',
            component: ComponentCreator('/dimensions/tags/cross-industry', 'da2'),
            exact: true
          },
          {
            path: '/dimensions/tags/cross-industry-applicable-to-all-digital-analytics-implementations',
            component: ComponentCreator('/dimensions/tags/cross-industry-applicable-to-all-digital-analytics-implementations', '22a'),
            exact: true
          },
          {
            path: '/dimensions/tags/navigation-engagement',
            component: ComponentCreator('/dimensions/tags/navigation-engagement', 'ac3'),
            exact: true
          },
          {
            path: '/dimensions/tags/page-location-full-page-url',
            component: ComponentCreator('/dimensions/tags/page-location-full-page-url', 'a2f'),
            exact: true
          },
          {
            path: '/dimensions/tags/page-title-screen-name',
            component: ComponentCreator('/dimensions/tags/page-title-screen-name', 'cf6'),
            exact: true
          },
          {
            path: '/dimensions/tags/previous-page-name-referrer-page',
            component: ComponentCreator('/dimensions/tags/previous-page-name-referrer-page', 'a9b'),
            exact: true
          },
          {
            path: '/dimensions',
            component: ComponentCreator('/dimensions', 'ab7'),
            routes: [
              {
                path: '/dimensions',
                component: ComponentCreator('/dimensions', '167'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/dimensions/page-name',
                component: ComponentCreator('/dimensions/page-name', 'f68'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/dimensions/page-url',
                component: ComponentCreator('/dimensions/page-url', '03b'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/dimensions/previous-page',
                component: ComponentCreator('/dimensions/previous-page', '0a9'),
                exact: true,
                sidebar: "sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '99a'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '571'),
        routes: [
          {
            path: '/docs/tags',
            component: ComponentCreator('/docs/tags', 'fce'),
            exact: true
          },
          {
            path: '/docs/tags/checkout-to-order-rate',
            component: ComponentCreator('/docs/tags/checkout-to-order-rate', 'cb7'),
            exact: true
          },
          {
            path: '/docs/tags/completed-transactions',
            component: ComponentCreator('/docs/tags/completed-transactions', 'feb'),
            exact: true
          },
          {
            path: '/docs/tags/confirmed-orders',
            component: ComponentCreator('/docs/tags/confirmed-orders', '41b'),
            exact: true
          },
          {
            path: '/docs/tags/conversion',
            component: ComponentCreator('/docs/tags/conversion', 'c36'),
            exact: true
          },
          {
            path: '/docs/tags/conversion-rate-to-order',
            component: ComponentCreator('/docs/tags/conversion-rate-to-order', 'a14'),
            exact: true
          },
          {
            path: '/docs/tags/e-commerce',
            component: ComponentCreator('/docs/tags/e-commerce', '066'),
            exact: true
          },
          {
            path: '/docs/tags/purchase-rate',
            component: ComponentCreator('/docs/tags/purchase-rate', '9c2'),
            exact: true
          },
          {
            path: '/docs/tags/purchases',
            component: ComponentCreator('/docs/tags/purchases', 'fb4'),
            exact: true
          },
          {
            path: '/docs/tags/retail',
            component: ComponentCreator('/docs/tags/retail', '57d'),
            exact: true
          },
          {
            path: '/docs/tags/subscription',
            component: ComponentCreator('/docs/tags/subscription', 'c04'),
            exact: true
          },
          {
            path: '/docs/tags/travel',
            component: ComponentCreator('/docs/tags/travel', '2b7'),
            exact: true
          },
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'f68'),
            routes: [
              {
                path: '/docs',
                component: ComponentCreator('/docs', '7da'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/order-conversion-rate-visitors',
                component: ComponentCreator('/docs/order-conversion-rate-visitors', '997'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/order-conversion-rate-visits',
                component: ComponentCreator('/docs/order-conversion-rate-visits', '4bf'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/orders',
                component: ComponentCreator('/docs/orders', '517'),
                exact: true,
                sidebar: "sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/events',
    component: ComponentCreator('/events', '2e8'),
    routes: [
      {
        path: '/events',
        component: ComponentCreator('/events', '6b2'),
        routes: [
          {
            path: '/events',
            component: ComponentCreator('/events', '1cf'),
            routes: [
              {
                path: '/events',
                component: ComponentCreator('/events', '176'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/events/addtocart',
                component: ComponentCreator('/events/addtocart', '378'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/events/productview',
                component: ComponentCreator('/events/productview', '609'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/events/purchase',
                component: ComponentCreator('/events/purchase', '215'),
                exact: true,
                sidebar: "sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/metrics',
    component: ComponentCreator('/metrics', '629'),
    routes: [
      {
        path: '/metrics',
        component: ComponentCreator('/metrics', '25d'),
        routes: [
          {
            path: '/metrics',
            component: ComponentCreator('/metrics', 'eaf'),
            routes: [
              {
                path: '/metrics',
                component: ComponentCreator('/metrics', '0cf'),
                exact: true,
                sidebar: "sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
