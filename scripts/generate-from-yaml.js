// scripts/generate-from-yaml.mjs
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const slugify = require('slugify');

const ROOT = process.cwd();
const SOURCES = [
  { key: 'kpis',       src: 'data-layer/kpis',       out: 'docs/kpis' },
  { key: 'dimensions', src: 'data-layer/dimensions', out: 'docs/dimensions' },
  { key: 'events',     src: 'data-layer/events',     out: 'docs/events' },
];

// Front matter helper
const fm = (obj) =>
  `---\n${Object.entries(obj).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n`;

// Safe readers / helpers
const readYaml = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  return yaml.load(raw);
};
const asArray = (v) => Array.isArray(v) ? v : (v ? [v] : []);
const fence = (lang, code) => '```' + (lang || '') + '\n' + (code || '') + '\n```';

// Simple markdown table builder
const table = (header, rows) =>
  rows && rows.length
    ? `| ${header} |\n|---|\n${rows.map(x => `| ${x} |`).join('\n')}\n`
    : '_None_';

// Generate clean Markdown sections with Material UI styling
const generateCleanMarkdownSections = (meta, sectionType) => {
  const sections = [];
  
  // Define section configurations based on content type
  const sectionConfigs = {
    kpis: [
      { title: 'Business Context', fields: ['Industry', 'Category', 'Priority', 'Core Area', 'Scope'] },
      { title: 'Technical Details', fields: ['KPI Type', 'Metric', 'Aggregation Window'] },
      { title: 'Data Mappings', fields: ['Data Layer Mapping', 'XDM Mapping'], codeFields: ['Data Layer Mapping', 'XDM Mapping'] },
      { title: 'Implementation', fields: ['Dependencies', 'BI Source System', 'Report Attribute'] },
      { title: 'Usage & Analytics', fields: ['Dashboard Usage', 'Segment Eligibility', 'Related KPIs'] },
      { title: 'SQL Examples', fields: ['SQL Query Example'], codeFields: ['SQL Query Example'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Details', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ],
    events: [
      { title: 'Event Details', fields: ['Event Type', 'Trigger', 'Source', 'Event Time'] },
      { title: 'Platform Mappings', fields: ['GA4 Event Name', 'GA4 Params Map', 'Adobe XDM Event Type', 'Adobe XDM Map', 'Adobe ACDL Event', 'Adobe ACDL Map'], codeFields: ['GA4 Params Map', 'Adobe XDM Map', 'Adobe ACDL Map'] },
      { title: 'Data Requirements', fields: ['Required Fields', 'Generic Context Required', 'Generic Context Optional', 'XDM Field Groups'] },
      { title: 'Analytics Integration', fields: ['Primary KPIs', 'Secondary KPIs', 'Metrics Used', 'Dimensions Used'] },
      { title: 'JSON Examples', fields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'], codeFields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'] },
      { title: 'Configuration', fields: ['Frequency Limit', 'PII Risk', 'Data Sensitivity'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Status', 'Version', 'Last Updated', 'Deprecation Notes'] }
    ],
    dimensions: [
      { title: 'Dimension Details', fields: ['Data Type', 'Scope', 'Persistence', 'Industry', 'Category'] },
      { title: 'Platform Mappings', fields: ['GA Mapping', 'Adobe Mapping', 'XDM Mapping', 'Generic Mapping'] },
      { title: 'Data Configuration', fields: ['Allowed Values / Format', 'Case Sensitivity', 'Sample Values'] },
      { title: 'Technical Implementation', fields: ['BI Source System', 'Report Attribute', 'Join Keys', 'Required On Events'] },
      { title: 'Validation & Rules', fields: ['Validation Rules', 'Calculation Notes'] },
      { title: 'Documentation', fields: ['Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ]
  };
  
  const config = sectionConfigs[sectionType] || sectionConfigs.kpis;
  
  config.forEach(section => {
    const sectionItems = [];
    let hasContent = false;
    
    section.fields.forEach(field => {
      const value = meta[field];
      if (value !== undefined && value !== null && value !== '') {
        hasContent = true;
        let displayValue = value;
        
        // Handle arrays
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        }
        
        // Check if this field should be formatted as code
        const isCodeField = section.codeFields && section.codeFields.includes(field);
        const hasHeadingSyntax = typeof displayValue === 'string' && displayValue.includes('{') && displayValue.includes('}');
        
        if (isCodeField || hasHeadingSyntax) {
          // Format as copyable code block
          let cleanValue;
          if (Array.isArray(displayValue)) {
            // Join array items and clean up malformed JSON
            const joinedValue = displayValue.join(' ');
            // Remove 'json' prefix and clean up
            cleanValue = joinedValue
              .replace(/^json\s+/, '')
              .replace(/<br\s*\/?>/gi, '\n')
              .trim();
          } else {
            cleanValue = typeof displayValue === 'string' ? displayValue.replace(/<br\s*\/?>/gi, '\n') : String(displayValue);
          }
          
          // Determine language for syntax highlighting
          let language = 'json';
          if (field.toLowerCase().includes('sql')) {
            language = 'sql';
          } else if (field.toLowerCase().includes('javascript') || field.toLowerCase().includes('js')) {
            language = 'javascript';
          }
          
          // Use copyable code block with proper formatting - escape HTML and JSX
          const escapedValue = cleanValue
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');
          
          sectionItems.push(`**${field}**\n\n<div class="mui-code-block" data-language="${language}">${escapedValue}</div>`);
        } else {
          // Format as regular text
          const cleanValue = typeof displayValue === 'string' ? displayValue.replace(/<br\s*\/?>/gi, '\n') : String(displayValue);
          sectionItems.push(`**${field}**: ${cleanValue}`);
        }
      }
    });
    
    if (hasContent) {
      // Emit Markdown heading first so Docusaurus can pick it up for TOC
      // Then render the section body inside a styled container
      sections.push(`## ${section.title}\n\n<div class="mui-section">\n${sectionItems.join('\n\n')}\n</div>`);
    }
  });
  
  return sections.join('\n');
};

// Generate Material UI CSS styled sections
const generateMaterialUICSSSections = (meta, sectionType) => {
  const sections = [];
  
  // Define section configurations based on content type
  const sectionConfigs = {
    kpis: [
      { title: 'Business Context', fields: ['Industry', 'Category', 'Priority', 'Core Area', 'Scope'] },
      { title: 'Technical Details', fields: ['KPI Type', 'Metric', 'Aggregation Window'] },
      { title: 'Data Mappings', fields: ['Data Layer Mapping', 'XDM Mapping'], codeFields: ['Data Layer Mapping', 'XDM Mapping'] },
      { title: 'Implementation', fields: ['Dependencies', 'BI Source System', 'Report Attribute'] },
      { title: 'Usage & Analytics', fields: ['Dashboard Usage', 'Segment Eligibility', 'Related KPIs'] },
      { title: 'SQL Examples', fields: ['SQL Query Example'], codeFields: ['SQL Query Example'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Details', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ],
    events: [
      { title: 'Event Details', fields: ['Event Type', 'Trigger', 'Source', 'Event Time'] },
      { title: 'Platform Mappings', fields: ['GA4 Event Name', 'GA4 Params Map', 'Adobe XDM Event Type', 'Adobe XDM Map', 'Adobe ACDL Event', 'Adobe ACDL Map'], codeFields: ['GA4 Params Map', 'Adobe XDM Map', 'Adobe ACDL Map'] },
      { title: 'Data Requirements', fields: ['Required Fields', 'Generic Context Required', 'Generic Context Optional', 'XDM Field Groups'] },
      { title: 'Analytics Integration', fields: ['Primary KPIs', 'Secondary KPIs', 'Metrics Used', 'Dimensions Used'] },
      { title: 'JSON Examples', fields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'], codeFields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'] },
      { title: 'Configuration', fields: ['Frequency Limit', 'PII Risk', 'Data Sensitivity'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Status', 'Version', 'Last Updated', 'Deprecation Notes'] }
    ],
    dimensions: [
      { title: 'Dimension Details', fields: ['Data Type', 'Scope', 'Persistence', 'Industry', 'Category'] },
      { title: 'Platform Mappings', fields: ['GA Mapping', 'Adobe Mapping', 'XDM Mapping', 'Generic Mapping'] },
      { title: 'Data Configuration', fields: ['Allowed Values / Format', 'Case Sensitivity', 'Sample Values'] },
      { title: 'Technical Implementation', fields: ['BI Source System', 'Report Attribute', 'Join Keys', 'Required On Events'] },
      { title: 'Validation & Rules', fields: ['Validation Rules', 'Calculation Notes'] },
      { title: 'Documentation', fields: ['Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ]
  };
  
  const config = sectionConfigs[sectionType] || sectionConfigs.kpis;
  
  config.forEach(section => {
    const sectionFields = [];
    let hasContent = false;
    
    section.fields.forEach(field => {
      const value = meta[field];
      if (value !== undefined && value !== null && value !== '') {
        hasContent = true;
        let displayValue = value;
        
        // Handle arrays
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        }
        
        // Check if this field should be formatted as code
        const isCodeField = section.codeFields && section.codeFields.includes(field);
        const hasHeadingSyntax = typeof displayValue === 'string' && displayValue.includes('{') && displayValue.includes('}');
        
        if (isCodeField || hasHeadingSyntax) {
          // Format as Material UI code block
          const cleanValue = typeof displayValue === 'string' ? displayValue.replace(/[{}]/g, '').replace(/<br\s*\/?>/gi, '\n') : String(displayValue);
          const safeValue = typeof cleanValue === 'string' ? cleanValue.replace(/"/g, '&quot;') : String(cleanValue);
          sectionFields.push(`<div class="mui-field"><div class="mui-field-label">${field}</div><div class="mui-code-label">JSON</div><div class="mui-code-block">${safeValue}</div></div>`);
        } else {
          // Format as regular Material UI field
          const safeValue = typeof displayValue === 'string' ? displayValue.replace(/"/g, '&quot;').replace(/<br\s*\/?>/gi, '\n') : String(displayValue);
          sectionFields.push(`<div class="mui-field"><div class="mui-field-label">${field}</div><div class="mui-field-value">${safeValue}</div></div>`);
        }
      }
    });
    
    if (hasContent) {
      sections.push(`<div class="mui-section">\n<h2>${section.title}</h2>\n${sectionFields.join('\n')}\n</div>`);
    }
  });
  
  return sections.join('\n');
};

// Generate Material UI styled sections
const generateMaterialUISections = (meta, sectionType) => {
  const sections = [];
  
  // Define section configurations based on content type
  const sectionConfigs = {
    kpis: [
      { title: 'Business Context', fields: ['Industry', 'Category', 'Priority', 'Core Area', 'Scope'] },
      { title: 'Technical Details', fields: ['KPI Type', 'Metric', 'Aggregation Window'] },
      { title: 'Data Mappings', fields: ['Data Layer Mapping', 'XDM Mapping'], codeFields: ['Data Layer Mapping', 'XDM Mapping'] },
      { title: 'Implementation', fields: ['Dependencies', 'BI Source System', 'Report Attribute'] },
      { title: 'Usage & Analytics', fields: ['Dashboard Usage', 'Segment Eligibility', 'Related KPIs'] },
      { title: 'SQL Examples', fields: ['SQL Query Example'], codeFields: ['SQL Query Example'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Details', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ],
    events: [
      { title: 'Event Details', fields: ['Event Type', 'Trigger', 'Source', 'Event Time'] },
      { title: 'Platform Mappings', fields: ['GA4 Event Name', 'GA4 Params Map', 'Adobe XDM Event Type', 'Adobe XDM Map', 'Adobe ACDL Event', 'Adobe ACDL Map'], codeFields: ['GA4 Params Map', 'Adobe XDM Map', 'Adobe ACDL Map'] },
      { title: 'Data Requirements', fields: ['Required Fields', 'Generic Context Required', 'Generic Context Optional', 'XDM Field Groups'] },
      { title: 'Analytics Integration', fields: ['Primary KPIs', 'Secondary KPIs', 'Metrics Used', 'Dimensions Used'] },
      { title: 'JSON Examples', fields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'], codeFields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'] },
      { title: 'Configuration', fields: ['Frequency Limit', 'PII Risk', 'Data Sensitivity'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Status', 'Version', 'Last Updated', 'Deprecation Notes'] }
    ],
    dimensions: [
      { title: 'Dimension Details', fields: ['Data Type', 'Scope', 'Persistence', 'Industry', 'Category'] },
      { title: 'Platform Mappings', fields: ['GA Mapping', 'Adobe Mapping', 'XDM Mapping', 'Generic Mapping'] },
      { title: 'Data Configuration', fields: ['Allowed Values / Format', 'Case Sensitivity', 'Sample Values'] },
      { title: 'Technical Implementation', fields: ['BI Source System', 'Report Attribute', 'Join Keys', 'Required On Events'] },
      { title: 'Validation & Rules', fields: ['Validation Rules', 'Calculation Notes'] },
      { title: 'Documentation', fields: ['Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ]
  };
  
  const config = sectionConfigs[sectionType] || sectionConfigs.kpis;
  
  config.forEach(section => {
    const sectionFields = [];
    let hasContent = false;
    
    section.fields.forEach(field => {
      const value = meta[field];
      if (value !== undefined && value !== null && value !== '') {
        hasContent = true;
        let displayValue = value;
        
        // Handle arrays
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        }
        
        // Check if this field should be formatted as code
        const isCodeField = section.codeFields && section.codeFields.includes(field);
        const hasHeadingSyntax = typeof displayValue === 'string' && displayValue.includes('{') && displayValue.includes('}');
        
        if (isCodeField || hasHeadingSyntax) {
          // Format as Material UI code block
          const cleanValue = typeof displayValue === 'string' ? displayValue.replace(/[{}]/g, '') : String(displayValue);
          const safeValue = typeof cleanValue === 'string' ? cleanValue.replace(/"/g, '&quot;').replace(/\n/g, '\\n') : String(cleanValue);
          sectionFields.push(`<MUIField label="${field}" value="${safeValue}" isCode={true} language="json" />`);
        } else {
          // Format as regular Material UI field
          const safeValue = typeof displayValue === 'string' ? displayValue.replace(/"/g, '&quot;').replace(/\n/g, '\\n') : String(displayValue);
          sectionFields.push(`<MUIField label="${field}" value="${safeValue}" />`);
        }
      }
    });
    
    if (hasContent) {
      sections.push(`<MUISection title="${section.title}">\n${sectionFields.join('\n')}\n</MUISection>`);
    }
  });
  
  return sections.join('\n');
};

// Generate professional sections in Material UI style
const generateProfessionalSections = (meta, sectionType) => {
  const sections = [];
  
  // Define section configurations based on content type
  const sectionConfigs = {
    kpis: [
      { title: 'Business Context', fields: ['Industry', 'Category', 'Priority', 'Core Area', 'Scope'] },
      { title: 'Technical Details', fields: ['KPI Type', 'Metric', 'Aggregation Window'] },
      { title: 'Data Mappings', fields: ['Data Layer Mapping', 'XDM Mapping'], codeFields: ['Data Layer Mapping', 'XDM Mapping'] },
      { title: 'Implementation', fields: ['Dependencies', 'BI Source System', 'Report Attribute'] },
      { title: 'Usage & Analytics', fields: ['Dashboard Usage', 'Segment Eligibility', 'Related KPIs'] },
      { title: 'SQL Examples', fields: ['SQL Query Example'], codeFields: ['SQL Query Example'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Details', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ],
    events: [
      { title: 'Event Details', fields: ['Event Type', 'Trigger', 'Source', 'Event Time'] },
      { title: 'Platform Mappings', fields: ['GA4 Event Name', 'GA4 Params Map', 'Adobe XDM Event Type', 'Adobe XDM Map', 'Adobe ACDL Event', 'Adobe ACDL Map'], codeFields: ['GA4 Params Map', 'Adobe XDM Map', 'Adobe ACDL Map'] },
      { title: 'Data Requirements', fields: ['Required Fields', 'Generic Context Required', 'Generic Context Optional', 'XDM Field Groups'] },
      { title: 'Analytics Integration', fields: ['Primary KPIs', 'Secondary KPIs', 'Metrics Used', 'Dimensions Used'] },
      { title: 'JSON Examples', fields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'], codeFields: ['Example Generic JSON', 'Example GA4 JSON', 'Example XDM JSON', 'Example ACDL JSON'] },
      { title: 'Configuration', fields: ['Frequency Limit', 'PII Risk', 'Data Sensitivity'] },
      { title: 'Documentation', fields: ['Calculation Notes', 'Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Status', 'Version', 'Last Updated', 'Deprecation Notes'] }
    ],
    dimensions: [
      { title: 'Dimension Details', fields: ['Data Type', 'Scope', 'Persistence', 'Industry', 'Category'] },
      { title: 'Platform Mappings', fields: ['GA Mapping', 'Adobe Mapping', 'XDM Mapping', 'Generic Mapping'] },
      { title: 'Data Configuration', fields: ['Allowed Values / Format', 'Case Sensitivity', 'Sample Values'] },
      { title: 'Technical Implementation', fields: ['BI Source System', 'Report Attribute', 'Join Keys', 'Required On Events'] },
      { title: 'Validation & Rules', fields: ['Validation Rules', 'Calculation Notes'] },
      { title: 'Documentation', fields: ['Contributed By', 'Owner'] },
      { title: 'Governance', fields: ['Validation Status', 'Version', 'Last Updated', 'Data Sensitivity', 'PII Flag', 'Deprecation Notes'] }
    ]
  };
  
  const config = sectionConfigs[sectionType] || sectionConfigs.kpis;
  
  config.forEach(section => {
    const sectionContent = [];
    let hasContent = false;
    
    section.fields.forEach(field => {
      const value = meta[field];
      if (value !== undefined && value !== null && value !== '') {
        hasContent = true;
        let displayValue = value;
        
        // Handle arrays
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        }
        
        // Check if this field should be formatted as code
        const isCodeField = section.codeFields && section.codeFields.includes(field);
        const hasHeadingSyntax = typeof displayValue === 'string' && displayValue.includes('{') && displayValue.includes('}');
        
        if (isCodeField || hasHeadingSyntax) {
          // Format as code block
          const cleanValue = typeof displayValue === 'string' ? displayValue.replace(/[{}]/g, '') : displayValue;
          sectionContent.push(`**${field}**\n\n\`\`\`json\n${cleanValue}\n\`\`\``);
        } else {
          // Format as regular text
          sectionContent.push(`**${field}**: ${displayValue}`);
        }
      }
    });
    
    if (hasContent) {
      sections.push(`## ${section.title}\n\n${sectionContent.join('\n\n')}`);
    }
  });
  
  return sections.join('\n\n');
};

// Generate comprehensive field table
const generateFieldTable = (meta) => {
  const fields = [];
  
  // Define field display order and labels
  const fieldOrder = [
    // Basic Info
    { key: 'KPI Name', label: 'KPI Name' },
    { key: 'Event Name', label: 'Event Name' },
    { key: 'Dimension Name', label: 'Dimension Name' },
    { key: 'Description', label: 'Description' },
    { key: 'KPI Alias', label: 'KPI Alias' },
    { key: 'Event Alias', label: 'Event Alias' },
    { key: 'Dimension Alias', label: 'Dimension Alias' },
    
    // Technical Details
    { key: 'Metric', label: 'Metric' },
    { key: 'Event Type', label: 'Event Type' },
    { key: 'Data Type', label: 'Data Type' },
    { key: 'KPI Type', label: 'KPI Type' },
    { key: 'Formula', label: 'Formula' },
    { key: 'Scope', label: 'Scope' },
    { key: 'Persistence', label: 'Persistence' },
    
    // Platform Mappings
    { key: 'GA Events Name', label: 'GA Events Name' },
    { key: 'GA4 Event Name', label: 'GA4 Event Name' },
    { key: 'Adobe Analytics Event Name', label: 'Adobe Analytics Event Name' },
    { key: 'Adobe XDM Event Type', label: 'Adobe XDM Event Type' },
    { key: 'Amplitude Event Name', label: 'Amplitude Event Name' },
    { key: 'GA Mapping', label: 'GA Mapping' },
    { key: 'Adobe Mapping', label: 'Adobe Mapping' },
    { key: 'XDM Mapping', label: 'XDM Mapping' },
    { key: 'Generic Mapping', label: 'Generic Mapping' },
    
    // Business Context
    { key: 'Industry', label: 'Industry' },
    { key: 'Category', label: 'Category' },
    { key: 'Priority', label: 'Priority' },
    { key: 'Core Area', label: 'Core Area' },
    { key: 'Related KPIs', label: 'Related KPIs' },
    { key: 'Primary KPIs', label: 'Primary KPIs' },
    { key: 'Secondary KPIs', label: 'Secondary KPIs' },
    
    // Data Requirements
    { key: 'Events Required', label: 'Events Required' },
    { key: 'Dimensions', label: 'Dimensions' },
    { key: 'Dimensions Used', label: 'Dimensions Used' },
    { key: 'Metrics Used', label: 'Metrics Used' },
    { key: 'Required Fields', label: 'Required Fields' },
    { key: 'Required On Events', label: 'Required On Events' },
    
    // Technical Implementation
    { key: 'Data Layer Mapping', label: 'Data Layer Mapping' },
    { key: 'XDM Field Groups', label: 'XDM Field Groups' },
    { key: 'Dependencies', label: 'Dependencies' },
    { key: 'Join Keys', label: 'Join Keys' },
    { key: 'Validation Rules', label: 'Validation Rules' },
    
    // Reporting & Usage
    { key: 'Report Attribute', label: 'Report Attribute' },
    { key: 'Dashboard Usage', label: 'Dashboard Usage' },
    { key: 'Segment Eligibility', label: 'Segment Eligibility' },
    { key: 'BI Source System', label: 'BI Source System' },
    
    // Examples & Documentation
    { key: 'SQL Query Example', label: 'SQL Query Example' },
    { key: 'Example Generic JSON', label: 'Example Generic JSON' },
    { key: 'Example GA4 JSON', label: 'Example GA4 JSON' },
    { key: 'Example XDM JSON', label: 'Example XDM JSON' },
    { key: 'Example ACDL JSON', label: 'Example ACDL JSON' },
    { key: 'Sample Values', label: 'Sample Values' },
    
    // Configuration
    { key: 'Allowed Values / Format', label: 'Allowed Values / Format' },
    { key: 'Case Sensitivity', label: 'Case Sensitivity' },
    { key: 'Frequency Limit', label: 'Frequency Limit' },
    { key: 'Aggregation Window', label: 'Aggregation Window' },
    
    // Metadata
    { key: 'Owner', label: 'Owner' },
    { key: 'Contributed By', label: 'Contributed By' },
    { key: 'Validation Status', label: 'Validation Status' },
    { key: 'Status', label: 'Status' },
    { key: 'Version', label: 'Version' },
    { key: 'Last Updated', label: 'Last Updated' },
    { key: 'Tags', label: 'Tags' },
    
    // Data Governance
    { key: 'Data Sensitivity', label: 'Data Sensitivity' },
    { key: 'PII Flag', label: 'PII Flag' },
    { key: 'PII Risk', label: 'PII Risk' },
    { key: 'Deprecation Notes', label: 'Deprecation Notes' },
    
    // Additional Context
    { key: 'Trigger', label: 'Trigger' },
    { key: 'Source', label: 'Source' },
    { key: 'Event Time', label: 'Event Time' },
    { key: 'Generic Context Required', label: 'Generic Context Required' },
    { key: 'Generic Context Optional', label: 'Generic Context Optional' },
    { key: 'Calculation Notes', label: 'Calculation Notes' },
    { key: 'Details', label: 'Details' },
  ];
  
  // Process each field
  fieldOrder.forEach(({ key, label }) => {
    const value = meta[key];
    if (value !== undefined && value !== null && value !== '') {
      let displayValue = value;
      
      // Handle arrays
      if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : '';
      }
      
      // Handle long text (truncate for display)
      if (typeof displayValue === 'string' && displayValue.length > 200) {
        displayValue = displayValue.substring(0, 200) + '...';
      }
      
      // Escape curly braces and other MDX-problematic characters
      if (typeof displayValue === 'string') {
        displayValue = displayValue
          .replace(/\{/g, '&#123;')  // Escape opening braces
          .replace(/\}/g, '&#125;')  // Escape closing braces
          .replace(/</g, '&lt;')     // Escape less than
          .replace(/>/g, '&gt;')     // Escape greater than
          .replace(/\|/g, '&#124;'); // Escape pipe characters
      }
      
      if (displayValue) {
        fields.push({ label, value: displayValue });
      }
    }
  });
  
  if (fields.length === 0) {
    return '_No additional fields available._';
  }
  
  // Generate markdown table
  const tableRows = fields.map(field => `| **${field.label}** | ${field.value} |`).join('\n');
  return `| Field | Value |\n|-------|-------|\n${tableRows}`;
};

(async () => {
for (const sect of SOURCES) {
  const srcDir = path.join(ROOT, sect.src);
  const outDir = path.join(ROOT, sect.out);
  await fs.ensureDir(outDir);

  // --------------------------------------------------------------------------------
  // 1) Section landing page (catalog) at slug "/"
  //     NOTE: MDX requires imports immediately after front matter.
  // --------------------------------------------------------------------------------
  const indexFile = path.join(outDir, 'index.mdx');
  const catalogTitle = sect.key[0].toUpperCase() + sect.key.slice(1);

  const indexFrontMatter = fm({
    id: 'index',
    title: catalogTitle,
    slug: '/',
    hide_table_of_contents: true,
  });

  const indexMDX =
    indexFrontMatter +
    `import Catalog from '@site/src/components/Catalog';\n\n` + // import must be first content after FM
    `# ${catalogTitle}\n\n` +
    `<Catalog section="${sect.key}" />\n`;

  await fs.writeFile(indexFile, indexMDX);

  // --------------------------------------------------------------------------------
  // 2) Clear previously generated detail pages (keep index.mdx)
  // --------------------------------------------------------------------------------
  const existing = await fs.readdir(outDir);
  for (const f of existing) {
    if (f !== 'index.mdx') {
      await fs.remove(path.join(outDir, f));
    }
  }

  // --------------------------------------------------------------------------------
  // 3) Collect YAML files and generate pages
  // --------------------------------------------------------------------------------
  const hasSrc = await fs.pathExists(srcDir);
  const yamlFiles = hasSrc
    ? (await fs.readdir(srcDir)).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
    : [];

  // Keep stable ordering (by filename)
  yamlFiles.sort((a, b) => a.localeCompare(b, 'en'));

  const sidebarItems = ['index'];
  const indexItems = [];

  for (const file of yamlFiles) {
    const meta = readYaml(path.join(srcDir, file)) || {};

    // IDs / titles / description - handle both Excel column names and standard field names
    const baseName = path.basename(file, path.extname(file));
    const id = meta.id
      || slugify(meta['KPI Name'] || meta['Event Name'] || meta['Dimension Name'] || meta.kpi_id || meta.name || meta.title || baseName, { lower: true, strict: true });
    const title = meta['KPI Name'] || meta['Event Name'] || meta['Dimension Name'] || meta.title || meta.name || meta.kpi_name || id;
    const descriptionRaw = meta.Description || meta.description || meta.summary || '';
    const descriptionStr = Array.isArray(descriptionRaw) ? descriptionRaw.join(' ') : descriptionRaw;
    // Escape HTML tags to prevent MDX parsing issues
    const description = descriptionStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Taxonomy - handle Excel column names
    const aliases = asArray(meta['KPI Alias'] || meta['Event Alias'] || meta['Dimension Alias'] || meta.alias || meta.kpi_alias || []);
    const industry = asArray(meta.Industry || meta.industry);
    const category = asArray(meta.Category || meta.category);

    // Data reqs - handle Excel column names
    const formula = meta.Formula || meta.formula || '';
    const events_required = asArray(meta['Events Required'] || meta['Primary KPIs'] || meta.events_required || meta.events || []);
    const dimensions_needed = asArray(meta.Dimensions || meta['Dimensions Used'] || meta.dimensions_needed || meta.dimensions || []);

    // Vendor equivalents - handle Excel column names
    const vendor = {
      ga4: meta['GA Events Name'] || meta['GA4 Event Name'] || meta.ga4 || meta.ga_equivalent || '',
      adobe: meta['Adobe Analytics Event Name'] || meta['Adobe XDM Event Type'] || meta.adobe || meta.adobe_equivalent || '',
      amplitude: meta['Amplitude Event Name'] || meta.amplitude || meta.amplitude_equivalent || '',
    };

    // Notes / SQL / Related - handle Excel column names
    const notes = meta['Calculation Notes'] || meta.notes || '';
    const sqlExamples = asArray(meta['SQL Query Example'] || meta.sql_examples || meta.sql || []);
    const related = asArray(meta['Related KPIs'] || meta.related || meta.related_kpis || []);

    // Front matter for detail page
    const frontMatter = {
      id,
      title,
      description,
      tags: [...aliases, ...industry, ...category].filter(Boolean),
      slug: `/${id}`,
      toc_min_heading_level: 2,
      toc_max_heading_level: 4,
      hide_table_of_contents: false,
    };

    // Body sections with clean Markdown and Material UI-inspired styling
    const chunks = [];

      // Note: CSS styling moved to custom.css to avoid MDX compilation issues

    // Overview section
    chunks.push(`<div class="mui-section">\n<h2>Overview</h2>\n<div class="mui-overview">${description || 'No description provided.'}</div>\n</div>`);

    // Formula section (if exists)
    if (formula) {
      const cleanFormula = formula.replace(/<br\s*\/?>/gi, '\n');
      chunks.push(`<div class="mui-section">\n<h2>Formula</h2>\n<div class="mui-code-label">SQL</div>\n<div class="mui-code-block">${cleanFormula}</div>\n</div>`);
    }

    // Platform Implementation section
    if (vendor.ga4 || vendor.adobe || vendor.amplitude) {
      const platformItems = [];
      if (vendor.ga4) platformItems.push(`- **GA4**: \`${vendor.ga4}\``);
      if (vendor.adobe) platformItems.push(`- **Adobe Analytics**: \`${vendor.adobe}\``);
      if (vendor.amplitude) platformItems.push(`- **Amplitude**: \`${vendor.amplitude}\``);
      
      chunks.push(`<div class="mui-section">\n<h2>Platform Implementation</h2>\n${platformItems.join('\n')}\n</div>`);
    }

    // Generate professional sections with clean Markdown
    chunks.push(generateCleanMarkdownSections(meta, sect.key));

    // Add related items if they exist
    if (related && related.length > 0) {
      const relatedLinks = related.map(item => `- [${item}](./${slugify(item, { lower: true, strict: true })})`).join('\n');
      chunks.push(`<div class="mui-section">\n<h2>Related</h2>\n<div class="mui-overview">\n${relatedLinks}\n</div>\n</div>`);
    }

    const mdx = fm(frontMatter) + chunks.filter(Boolean).join('\n\n');
    await fs.writeFile(path.join(outDir, `${id}.mdx`), mdx);
    sidebarItems.push(id);

    // Catalog index entry
    indexItems.push({
      id,
      title,
      description,
      slug: `/${id}`,
      tags: [...aliases, ...industry, ...category].filter(Boolean),
      category,
      industry,
      // room for featured/added later
      featured: !!meta.featured,
      added: meta.added || null,
    });
  }

  // --------------------------------------------------------------------------------
  // 4) Write section sidebar (fixed order)
  // --------------------------------------------------------------------------------
  const sidebarConfig =
    `/** Auto-generated. Do not edit. */\n` +
    `module.exports = {\n` +
    `  sidebar: [\n    ${sidebarItems.map(i => `'${i}'`).join(',\n    ')}\n  ],\n` +
    `};\n`;
  await fs.writeFile(path.join(ROOT, `sidebars.${sect.key}.js`), sidebarConfig);

  // --------------------------------------------------------------------------------
  // 5) Write catalog JSON index (for Catalog.tsx)
  // --------------------------------------------------------------------------------
  const indexOutDir = path.join(ROOT, 'static', 'indexes');
  await fs.ensureDir(indexOutDir);
  await fs.writeJson(path.join(indexOutDir, `${sect.key}.json`), indexItems, { spaces: 2 });
}

console.log('✅ YAML → MDX generation complete');
})();
