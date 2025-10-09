# Excel to YAML Converter for OpenKPIs

This tool converts Excel files containing KPI, Events, and Dimensions data into YAML format compatible with the OpenKPIs Docusaurus project.

## Features

- **Dynamic Sheet Detection**: Automatically detects all sheets in your Excel file
- **Multiple Data Types**: Supports KPI, Events, and Dimensions sheets
- **CSV Intermediate**: Converts Excel sheets to CSV files for transparency
- **YAML Generation**: Creates properly formatted YAML files matching existing structure
- **MDX Integration**: Automatically runs the existing YAML-to-MDX generation script
- **Catalog Updates**: Generates JSON indexes for the Catalog component

## Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

## Installation

1. Install required Python packages:
```bash
pip install -r requirements.txt
```

## Usage

### Command Line

```bash
# Basic usage with default Excel file
python scripts/excel_to_yaml.py "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx"

# With custom project root
python scripts/excel_to_yaml.py "path/to/excel.xlsx" --project-root "path/to/openkpis-project"

# Skip MDX generation (only create YAML files)
python scripts/excel_to_yaml.py "path/to/excel.xlsx" --skip-generation

# Verbose output
python scripts/excel_to_yaml.py "path/to/excel.xlsx" --verbose
```

### Windows Batch Script

For Windows users, you can use the provided batch script:

```cmd
# Use default Excel file path
convert_excel.bat

# Or specify a custom Excel file
convert_excel.bat "C:\path\to\your\excel.xlsx"
```

## Excel File Format

### Supported Sheet Names

The converter recognizes these sheet names (case-insensitive):
- **KPI** - For KPI definitions
- **Events** - For event definitions  
- **Dimensions** - For dimension definitions

### Required Columns

#### KPI Sheet
- `id` - Unique identifier
- `title` - Display name
- `description` - Description of the KPI

#### Events Sheet
- `id` - Unique identifier
- `name` - Event name
- `description` - Description of the event

#### Dimensions Sheet
- `id` - Unique identifier
- `name` - Dimension name
- `description` - Description of the dimension

### Optional Columns

#### KPI Sheet
- `kpi_alias` - Alternative names (comma-separated)
- `industry` - Industry classification
- `category` - Categories (comma-separated)
- `formula` - Calculation formula
- `notes` - Additional notes
- `events_required` - Required events (comma-separated)
- `dimensions_needed` - Required dimensions (comma-separated)
- `ga4` - Google Analytics 4 equivalent
- `adobe` - Adobe Analytics equivalent
- `amplitude` - Amplitude equivalent
- `sql_examples` - SQL examples (comma-separated)
- `related` - Related KPIs (comma-separated)

#### Events Sheet
- `parameters` - Event parameters (comma-separated)
- `notes` - Additional notes
- `industry` - Industry classification
- `category` - Categories (comma-separated)
- `related_events` - Related events (comma-separated)
- `used_by_kpis` - KPIs that use this event (comma-separated)

#### Dimensions Sheet
- `industry` - Industry classification
- `category` - Categories (comma-separated)
- `used_by_kpis` - KPIs that use this dimension (comma-separated)
- `notes` - Additional notes
- `data_type` - Data type specification
- `validation_rules` - Validation rules

## Output Structure

The converter creates the following structure:

```
project-root/
├── csv/                          # Intermediate CSV files
│   ├── kpi.csv
│   ├── events.csv
│   └── dimensions.csv
├── data-layer/                   # Generated YAML files
│   ├── kpis/
│   │   ├── kpi-id-1.yml
│   │   └── kpi-id-2.yml
│   ├── events/
│   │   ├── event-id-1.yml
│   │   └── event-id-2.yml
│   └── dimensions/
│       ├── dimension-id-1.yml
│       └── dimension-id-2.yml
├── docs/                         # Generated MDX files
│   ├── kpis/
│   ├── events/
│   └── dimensions/
└── static/indexes/               # Catalog indexes
    ├── kpis.json
    ├── events.json
    └── dimensions.json
```

## Example Excel Format

### KPI Sheet Example
| id | title | description | industry | category | formula |
|----|-------|-------------|----------|----------|---------|
| add-to-cart | Add to Cart | Count of add_to_cart actions | Retail | Conversion | count(event_name='add_to_cart') |
| conversion-rate | Conversion Rate | Percentage of users who convert | E-commerce | Conversion | conversions/sessions |

### Events Sheet Example
| id | name | description | parameters |
|----|------|-------------|------------|
| add_to_cart | add_to_cart | User adds product to cart | product_id, price, currency |
| page_view | page_view | User views a page | page_url, page_title |

### Dimensions Sheet Example
| id | name | description | industry | category |
|----|------|-------------|----------|----------|
| product-id | Product ID | Unique product identifier | Retail | Catalog |
| user-segment | User Segment | User segmentation | All | User |

## Troubleshooting

### Common Issues

1. **"Excel file not found"**
   - Verify the file path is correct
   - Ensure the file exists and is accessible

2. **"No sheets found"**
   - Check that your Excel file has sheets named KPI, Events, or Dimensions
   - Sheet names are case-insensitive

3. **"Missing required fields"**
   - Ensure your Excel sheets have the required columns (id, title/name, description)
   - Check for empty rows that might be causing issues

4. **"Generation script failed"**
   - Ensure Node.js is installed
   - Check that the existing YAML-to-MDX generation script works
   - Try running with `--skip-generation` to isolate the issue

### Debug Mode

Run with verbose logging to see detailed information:

```bash
python scripts/excel_to_yaml.py "path/to/excel.xlsx" --verbose
```

## Integration with Existing Workflow

This tool integrates seamlessly with the existing OpenKPIs workflow:

1. **Excel → CSV**: Transparent conversion for debugging
2. **CSV → YAML**: Creates files in `data-layer/` directory
3. **YAML → MDX**: Uses existing `scripts/generate-from-yaml.js`
4. **Catalog Updates**: Generates JSON indexes for the Catalog component

The generated files follow the same structure and format as manually created YAML files, ensuring consistency with the existing project.

## Contributing

To add support for new sheet types or modify the conversion logic:

1. Update the `sheet_config` dictionary in `ExcelToYAMLConverter.__init__()`
2. Add new required/optional fields as needed
3. Test with sample Excel files
4. Update this documentation

## License

This tool is part of the OpenKPIs project and follows the same license terms.
