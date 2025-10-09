# Excel to YAML Converter - Complete Solution

## Overview

I've created a comprehensive Python solution that converts your Excel files to YAML format and integrates with your OpenKPIs Docusaurus project. The key improvement is that **Excel column names become YAML keys directly** - no hardcoded mappings required.

## What I've Built

### 1. **Main Python Script** (`scripts/excel_to_yaml.py`)
- Converts Excel sheets to CSV files
- Converts CSV files to YAML using column names as keys
- Integrates with existing YAML-to-MDX generation
- Generates catalog indexes for the Catalog component

### 2. **Dependencies** (`requirements.txt`)
- pandas: Excel file reading
- openpyxl: Excel file support
- PyYAML: YAML file generation
- pathlib2: Cross-platform path handling

### 3. **Windows Batch Script** (`convert_excel.bat`)
- Easy one-click conversion for Windows users
- Handles Python installation and dependencies
- Uses your default Excel file path

### 4. **Test Script** (`test_excel_converter.py`)
- Validates the complete workflow
- Creates sample Excel files with custom column names
- Shows dynamic conversion in action

## Key Features

### ✅ **Dynamic Column Mapping**
- Your Excel column names become YAML keys
- No hardcoded field mappings
- Add any columns you want

### ✅ **Automatic List Detection**
- Comma-separated values become YAML arrays
- `"add_to_cart, purchase"` → `["add_to_cart", "purchase"]`

### ✅ **Smart Filename Generation**
- Uses ID field for filename (kpi_id, event_id, dimension_id)
- Cleans special characters automatically

### ✅ **Full Integration**
- Works with existing `scripts/generate-from-yaml.js`
- Generates MDX files for GitHub Pages
- Creates catalog indexes for Catalog component

## Usage

### Quick Start
```bash
# Install dependencies
pip install -r requirements.txt

# Convert your Excel file
python scripts/excel_to_yaml.py "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx"
```

### Windows Users
```cmd
# Just double-click or run:
convert_excel.bat "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx"
```

## Your Excel File Structure

You can now use **any column names** in your Excel file. The converter will:

1. **Detect sheet names**: KPI, Events, Dimensions (case-insensitive)
2. **Use column names as YAML keys**: `kpi_name` → `kpi_name: "Add to Cart"`
3. **Handle lists automatically**: `"a, b, c"` → `["a", "b", "c"]`
4. **Generate clean filenames**: `kpi_id: "add-to-cart"` → `add-to-cart.yml`

### Example Excel Structure
| kpi_id | kpi_name | kpi_description | business_domain | calculation_formula | required_events | implementation_notes |
|--------|----------|----------------|-----------------|-------------------|-----------------|-------------------|
| add-to-cart | Add to Cart | Count of add_to_cart actions | Retail | count(event_name='add_to_cart') | add_to_cart, purchase | Ensure product catalog is clean |

## Generated Output

### YAML Files
```yaml
# data-layer/kpis/add-to-cart.yml
kpi_id: add-to-cart
kpi_name: Add to Cart
kpi_description: Count of add_to_cart actions
business_domain: Retail
calculation_formula: count(event_name='add_to_cart')
required_events:
- add_to_cart
- purchase
implementation_notes: Ensure product catalog is clean
```

### MDX Files
The existing `scripts/generate-from-yaml.js` automatically converts YAML to MDX files in the `docs/` directory.

### Catalog Indexes
JSON files in `static/indexes/` for the Catalog component.

## Complete Workflow

1. **Excel** → **CSV** (transparent intermediate step)
2. **CSV** → **YAML** (using your column names as keys)
3. **YAML** → **MDX** (existing generation script)
4. **MDX** → **GitHub Pages** (Docusaurus build)

## Benefits

- ✅ **No Configuration**: Use your Excel column names as-is
- ✅ **Future-Proof**: Add new columns anytime
- ✅ **Your Naming**: Use whatever field names make sense
- ✅ **Automatic Integration**: Works with existing project
- ✅ **Transparent**: CSV files show exactly what was converted

## Files Created

- `scripts/excel_to_yaml.py` - Main conversion script
- `requirements.txt` - Python dependencies
- `convert_excel.bat` - Windows batch script
- `test_excel_converter.py` - Test script
- `EXCEL_CONVERTER_README.md` - Detailed documentation
- `DYNAMIC_CONVERSION_GUIDE.md` - How dynamic mapping works

## Next Steps

1. **Install Python dependencies**: `pip install -r requirements.txt`
2. **Run the converter**: `python scripts/excel_to_yaml.py "path/to/your/excel.xlsx"`
3. **Check generated files**: Look in `data-layer/` and `docs/` directories
4. **Run Docusaurus**: `npm run start` to see your GitHub Pages

The solution is now ready to handle your Excel file with any column structure you prefer!
