/**
 * Migration Script: YAML → Supabase
 * 
 * This script imports existing YAML data from data-layer/ into Supabase database
 * Run with: node scripts/migrate-yaml-to-supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Starting migration...\n');

/**
 * Convert slug from YAML filename
 */
function slugify(filename) {
  return filename.replace('.yml', '').replace(/_/g, '-');
}

/**
 * Import KPIs from data-layer/kpis/
 */
async function importKPIs() {
  console.log('📊 Importing KPIs...');
  const kpisDir = path.join(__dirname, '..', 'data-layer', 'kpis');
  
  if (!fs.existsSync(kpisDir)) {
    console.log('⚠️  No kpis directory found, skipping...');
    return;
  }
  
  const files = fs.readdirSync(kpisDir).filter(f => f.endsWith('.yml'));
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(kpisDir, file), 'utf8');
      const kpiData = yaml.load(content);
      
      const slug = slugify(file);
      
      const { data, error} = await supabase
        .from('kpis')
        .insert({
          slug: slug,
          name: kpiData['KPI Name'] || kpiData.name || slug,
          formula: kpiData.Formula || kpiData.formula || null,
          description: kpiData.Description || kpiData.description || kpiData.Details || null,
          category: kpiData.Category || kpiData.category || null,
          tags: kpiData.Tags ? (typeof kpiData.Tags === 'string' ? kpiData.Tags.split(/[#,\s]+/).filter(t => t) : kpiData.Tags) : [],
          status: 'published', // Existing KPIs are published
          created_by: kpiData['Contributed By'] || 'admin',
          github_file_path: `data-layer/kpis/${file}`,
        });
      
      const kpiName = kpiData['KPI Name'] || kpiData.name || slug;
      
      if (error) {
        if (error.code === '23505') { // Duplicate key
          console.log(`  ⏭️  ${kpiName} (already exists)`);
        } else {
          console.error(`  ❌ ${file}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${kpiName}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 KPIs: ${successCount} imported, ${errorCount} errors\n`);
}

/**
 * Import Events from data-layer/events/
 */
async function importEvents() {
  console.log('🎯 Importing Events...');
  const eventsDir = path.join(__dirname, '..', 'data-layer', 'events');
  
  if (!fs.existsSync(eventsDir)) {
    console.log('⚠️  No events directory found, skipping...');
    return;
  }
  
  const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.yml'));
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(eventsDir, file), 'utf8');
      const eventData = yaml.load(content);
      
      const slug = slugify(file);
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          slug: slug,
          name: eventData['Event Name'] || eventData.name || slug,
          description: Array.isArray(eventData.Description) ? eventData.Description.join(' ') : (eventData.Description || eventData.description || null),
          category: eventData['Event Type'] || eventData.Category || eventData.category || null,
          tags: eventData.Tags ? (typeof eventData.Tags === 'string' ? eventData.Tags.split(/[#,\s]+/).filter(t => t) : eventData.Tags) : [],
          status: 'published',
          created_by: eventData['Contributed By'] || 'admin',
          github_file_path: `data-layer/events/${file}`,
        });
      
      const eventName = eventData['Event Name'] || eventData.name || slug;
      
      if (error) {
        if (error.code === '23505') {
          console.log(`  ⏭️  ${eventName} (already exists)`);
        } else {
          console.error(`  ❌ ${file}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${eventName}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n🎯 Events: ${successCount} imported, ${errorCount} errors\n`);
}

/**
 * Import Dimensions from data-layer/dimensions/
 */
async function importDimensions() {
  console.log('📐 Importing Dimensions...');
  const dimensionsDir = path.join(__dirname, '..', 'data-layer', 'dimensions');
  
  if (!fs.existsSync(dimensionsDir)) {
    console.log('⚠️  No dimensions directory found, skipping...');
    return;
  }
  
  const files = fs.readdirSync(dimensionsDir).filter(f => f.endsWith('.yml'));
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dimensionsDir, file), 'utf8');
      const dimensionData = yaml.load(content);
      
      const slug = slugify(file);
      
      const { data, error } = await supabase
        .from('dimensions')
        .insert({
          slug: slug,
          name: dimensionData['Dimension Name'] || dimensionData.name || slug,
          description: Array.isArray(dimensionData.Description) ? dimensionData.Description.join(' ') : (dimensionData.Description || dimensionData.description || null),
          category: dimensionData.Category || dimensionData.category || null,
          tags: dimensionData.Tags ? (typeof dimensionData.Tags === 'string' ? dimensionData.Tags.split(/[#,\s]+/).filter(t => t) : dimensionData.Tags) : [],
          status: 'published',
          created_by: dimensionData['Contributed By'] || 'admin',
          github_file_path: `data-layer/dimensions/${file}`,
        });
      
      const dimensionName = dimensionData['Dimension Name'] || dimensionData.name || slug;
      
      if (error) {
        if (error.code === '23505') {
          console.log(`  ⏭️  ${dimensionName} (already exists)`);
        } else {
          console.error(`  ❌ ${file}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${dimensionName}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📐 Dimensions: ${successCount} imported, ${errorCount} errors\n`);
}

/**
 * Verify import
 */
async function verifyImport() {
  console.log('🔍 Verifying import...');
  
  const { count: kpisCount } = await supabase.from('kpis').select('*', { count: 'exact', head: true });
  const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
  const { count: dimensionsCount } = await supabase.from('dimensions').select('*', { count: 'exact', head: true });
  const { count: metricsCount } = await supabase.from('metrics').select('*', { count: 'exact', head: true });
  
  console.log('\n📊 Database Summary:');
  console.log(`  KPIs: ${kpisCount || 0} records`);
  console.log(`  Events: ${eventsCount || 0} records`);
  console.log(`  Dimensions: ${dimensionsCount || 0} records`);
  console.log(`  Metrics: ${metricsCount || 0} records`);
}

/**
 * Import Metrics from data-layer/metrics/
 */
async function importMetrics() {
  console.log('📈 Importing Metrics...');
  const metricsDir = path.join(__dirname, '..', 'data-layer', 'metrics');
  
  if (!fs.existsSync(metricsDir)) {
    console.log('⚠️  No metrics directory found, skipping...');
    return;
  }
  
  const files = fs.readdirSync(metricsDir).filter(f => f.endsWith('.yml'));
  
  if (files.length === 0) {
    console.log('⚠️  No metric files found, skipping...');
    return;
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(metricsDir, file), 'utf8');
      const metricData = yaml.load(content);
      
      const slug = slugify(file);
      
      const { data, error } = await supabase
        .from('metrics')
        .insert({
          slug: slug,
          name: metricData['Metric Name'] || metricData.name || slug,
          formula: metricData.Formula || metricData.formula || null,
          description: Array.isArray(metricData.Description) ? metricData.Description.join(' ') : (metricData.Description || metricData.description || null),
          category: metricData.Category || metricData.category || null,
          tags: metricData.Tags ? (typeof metricData.Tags === 'string' ? metricData.Tags.split(/[#,\s]+/).filter(t => t) : metricData.Tags) : [],
          status: 'published',
          created_by: metricData['Contributed By'] || 'admin',
          github_file_path: `data-layer/metrics/${file}`,
        });
      
      const metricName = metricData['Metric Name'] || metricData.name || slug;
      
      if (error) {
        if (error.code === '23505') {
          console.log(`  ⏭️  ${metricName} (already exists)`);
        } else {
          console.error(`  ❌ ${file}: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${metricName}`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📈 Metrics: ${successCount} imported, ${errorCount} errors\n`);
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    await importKPIs();
    await importEvents();
    await importDimensions();
    await importMetrics();
    await verifyImport();
    
    console.log('\n✅ Migration complete!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();

