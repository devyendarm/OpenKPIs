import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/OpenKPIs/search',
    component: ComponentCreator('/OpenKPIs/search', '5a1'),
    exact: true
  },
  {
    path: '/OpenKPIs/dimensions',
    component: ComponentCreator('/OpenKPIs/dimensions', 'b39'),
    routes: [
      {
        path: '/OpenKPIs/dimensions',
        component: ComponentCreator('/OpenKPIs/dimensions', '6ed'),
        routes: [
          {
            path: '/OpenKPIs/dimensions/tags',
            component: ComponentCreator('/OpenKPIs/dimensions/tags', '7ed'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/content-engagement',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/content-engagement', '3b5'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/cross-industry',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/cross-industry', '5bf'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/cross-industry-applicable-to-all-digital-analytics-implementations',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/cross-industry-applicable-to-all-digital-analytics-implementations', 'b0e'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/navigation-engagement',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/navigation-engagement', '262'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/page-location-full-page-url',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/page-location-full-page-url', '323'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/page-title-screen-name',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/page-title-screen-name', '7a0'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions/tags/previous-page-name-referrer-page',
            component: ComponentCreator('/OpenKPIs/dimensions/tags/previous-page-name-referrer-page', '2a7'),
            exact: true
          },
          {
            path: '/OpenKPIs/dimensions',
            component: ComponentCreator('/OpenKPIs/dimensions', '129'),
            routes: [
              {
                path: '/OpenKPIs/dimensions',
                component: ComponentCreator('/OpenKPIs/dimensions', '90d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/dimensions/page-name',
                component: ComponentCreator('/OpenKPIs/dimensions/page-name', '364'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/dimensions/page-url',
                component: ComponentCreator('/OpenKPIs/dimensions/page-url', 'e97'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/dimensions/previous-page',
                component: ComponentCreator('/OpenKPIs/dimensions/previous-page', '06d'),
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
    path: '/OpenKPIs/docs',
    component: ComponentCreator('/OpenKPIs/docs', '47e'),
    routes: [
      {
        path: '/OpenKPIs/docs',
        component: ComponentCreator('/OpenKPIs/docs', '934'),
        routes: [
          {
            path: '/OpenKPIs/docs/tags',
            component: ComponentCreator('/OpenKPIs/docs/tags', '35b'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/checkout-to-order-rate',
            component: ComponentCreator('/OpenKPIs/docs/tags/checkout-to-order-rate', '775'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/completed-transactions',
            component: ComponentCreator('/OpenKPIs/docs/tags/completed-transactions', '3ea'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/confirmed-orders',
            component: ComponentCreator('/OpenKPIs/docs/tags/confirmed-orders', 'f4a'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/conversion',
            component: ComponentCreator('/OpenKPIs/docs/tags/conversion', 'e66'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/conversion-rate-to-order',
            component: ComponentCreator('/OpenKPIs/docs/tags/conversion-rate-to-order', '998'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/e-commerce',
            component: ComponentCreator('/OpenKPIs/docs/tags/e-commerce', 'e09'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/purchase-rate',
            component: ComponentCreator('/OpenKPIs/docs/tags/purchase-rate', '96f'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/purchases',
            component: ComponentCreator('/OpenKPIs/docs/tags/purchases', '139'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/retail',
            component: ComponentCreator('/OpenKPIs/docs/tags/retail', 'b05'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/subscription',
            component: ComponentCreator('/OpenKPIs/docs/tags/subscription', '0e5'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs/tags/travel',
            component: ComponentCreator('/OpenKPIs/docs/tags/travel', 'e4d'),
            exact: true
          },
          {
            path: '/OpenKPIs/docs',
            component: ComponentCreator('/OpenKPIs/docs', 'f57'),
            routes: [
              {
                path: '/OpenKPIs/docs',
                component: ComponentCreator('/OpenKPIs/docs', 'f39'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/docs/order-conversion-rate-visitors',
                component: ComponentCreator('/OpenKPIs/docs/order-conversion-rate-visitors', '053'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/docs/order-conversion-rate-visits',
                component: ComponentCreator('/OpenKPIs/docs/order-conversion-rate-visits', '2cf'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/docs/orders',
                component: ComponentCreator('/OpenKPIs/docs/orders', '472'),
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
    path: '/OpenKPIs/events',
    component: ComponentCreator('/OpenKPIs/events', 'b29'),
    routes: [
      {
        path: '/OpenKPIs/events',
        component: ComponentCreator('/OpenKPIs/events', '6f5'),
        routes: [
          {
            path: '/OpenKPIs/events',
            component: ComponentCreator('/OpenKPIs/events', '103'),
            routes: [
              {
                path: '/OpenKPIs/events',
                component: ComponentCreator('/OpenKPIs/events', 'b45'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/events/addtocart',
                component: ComponentCreator('/OpenKPIs/events/addtocart', '634'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/events/productview',
                component: ComponentCreator('/OpenKPIs/events/productview', '72e'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/OpenKPIs/events/purchase',
                component: ComponentCreator('/OpenKPIs/events/purchase', '95a'),
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
    path: '/OpenKPIs/',
    component: ComponentCreator('/OpenKPIs/', 'b87'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
