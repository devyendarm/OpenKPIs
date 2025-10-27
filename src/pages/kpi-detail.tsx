/**
 * KPI Detail/Edit Page - Wikipedia-style Editing
 * 
 * Shows KPI details and allows editing ALL fields if user is authenticated and is the creator
 * Access via: /kpi-detail?slug=kpi-slug&edit=1
 */

import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useLocation } from '@docusaurus/router';
import KpiWikipediaStyleFullPage from './kpi-wikipedia-style-full';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { supabase, getCurrentUser } from '../lib/supabase';

export default function KpiDetailPage() {
  return <KpiWikipediaStyleFullPage />;
}
