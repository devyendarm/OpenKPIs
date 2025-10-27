/**
 * Metric Detail/Edit Page - Wikipedia-style Editing
 * 
 * Shows Metric details and allows editing if user is authenticated and is the creator
 * Access via: /metric-detail?slug=metric-slug&edit=1
 */

import React from 'react';
import MetricWikipediaStyleFullPage from './metric-wikipedia-style-full';

export default function MetricDetailPage() {
  return <MetricWikipediaStyleFullPage />;
}
