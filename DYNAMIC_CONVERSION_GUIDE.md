# Excel to YAML Converter - Dynamic Column Mapping

## How It Works

The updated Python script now uses **Excel column names directly as YAML keys**. This means:

1. **No hardcoded field mappings** - Your Excel column names become the YAML keys
2. **Fully dynamic** - Add any columns you want to your Excel sheets
3. **Automatic list detection** - Comma-separated values become YAML arrays
4. **Flexible naming** - Use any naming convention you prefer

## Example: Excel Column Names → YAML Keys

### Before (Hardcoded Mapping)
```yaml
# Old approach - limited to predefined fields
id: add-to-cart
title: Add to Cart
description: Count of add_to_cart actions
industry: Retail
category: Conversion
```

### After (Dynamic Mapping)
```yaml
# New approach - uses your Excel column names directly
kpi_id: add-to-cart
kpi_name: Add to Cart
kpi_description: Count of add_to_cart actions
business_domain: Retail
kpi_category: Conversion
calculation_formula: count(event_name='add_to_cart')
required_events:
- add_to_cart
- purchase
required_dimensions:
- product_id
- user_id
implementation_notes: Ensure product catalog is clean
ga4_equivalent: Add to cart event
adobe_equivalent: Cart add
amplitude_equivalent: Add to cart
```

## Your Excel File Structure

You can now structure your Excel file (`C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx`) with **any column names you want**:

### KPI Sheet Example
| kpi_id | kpi_name | kpi_description | business_domain | kpi_category | calculation_formula | required_events | required_dimensions | implementation_notes | ga4_equivalent | adobe_equivalent |
|--------|----------|----------------|-----------------|-------------|-------------------|-----------------|-------------------|-------------------|---------------|-----------------|
| add-to-cart | Add to Cart | Count of add_to_cart actions | Retail | Conversion | count(event_name='add_to_cart') | add_to_cart | product_id | Ensure product catalog is clean | Add to cart event | Cart add |

### Events Sheet Example
| event_id | event_name | event_description | event_parameters | firing_notes | business_context | data_quality_requirements |
|----------|------------|-------------------|------------------|--------------|-----------------|---------------------------|
| add_to_cart | add_to_cart | User adds product to cart | product_id, price, currency | Fire after product is visible | E-commerce | Validate product_id exists |

### Dimensions Sheet Example
| dimension_id | dimension_name | dimension_description | data_domain | dimension_category | used_in_kpis | data_type | validation_rules |
|--------------|----------------|---------------------|-------------|------------------|--------------|-----------|-----------------|
| product-id | Product ID | Unique product identifier | Retail | Catalog | add-to-cart, conversion-rate | String | Must be unique |

## Key Features

### 1. **Automatic List Detection**
- Values with commas become YAML arrays
- `"add_to_cart, purchase"` → `["add_to_cart", "purchase"]`

### 2. **Flexible ID Field**
- Uses the first column that looks like an ID (`id`, `kpi_id`, `event_id`, etc.)
- Falls back to row index if no ID found

### 3. **Smart Filename Generation**
- Uses the ID field value for filename
- Cleans special characters automatically
- Example: `kpi_id: "add-to-cart"` → `add-to-cart.yml`

### 4. **Empty Value Handling**
- Skips empty cells automatically
- No need to worry about blank rows/columns

## Usage

```bash
# Run with your Excel file
python scripts/excel_to_yaml.py "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx"

# Or use the Windows batch script
convert_excel.bat "C:\Users\mdevy\OneDrive\Projects\OpenKPIs\python\kpis_manual.xlsx"
```

## Benefits

1. **No Configuration Needed** - Just use your Excel column names as-is
2. **Future-Proof** - Add new columns anytime without code changes
3. **Your Naming Convention** - Use whatever field names make sense for your business
4. **Automatic Integration** - Generated YAML files work with existing MDX generation
5. **Transparent Process** - CSV files show exactly what was converted

## Generated Output Structure

```
data-layer/
├── kpis/
│   ├── add-to-cart.yml          # Uses kpi_id as filename
│   ├── conversion-rate.yml
│   └── bounce-rate.yml
├── events/
│   ├── add_to_cart.yml          # Uses event_id as filename
│   ├── purchase.yml
│   └── page_view.yml
└── dimensions/
    ├── product-id.yml           # Uses dimension_id as filename
    ├── user-segment.yml
    └── page-category.yml
```

Each YAML file contains all the columns from your Excel sheet as key-value pairs, preserving your exact naming convention and data structure.
