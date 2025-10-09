#!/usr/bin/env python3
"""
Direct Excel to YAML Converter for OpenKPIs
Converts Excel sheets directly to YAML files using actual names for file naming
and preserving ALL Excel columns as YAML keys.
"""

import pandas as pd
import yaml
import subprocess
import logging
from pathlib import Path
import sys
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class DirectExcelToYamlConverter:
    def __init__(self, excel_path: str, project_root: Path):
        self.excel_path = Path(excel_path)
        self.project_root = project_root
        self.data_layer_dir = project_root / 'data-layer'
        
        # Ensure data-layer directory exists
        self.data_layer_dir.mkdir(exist_ok=True)
        
        # Sheet configuration with name fields for file naming
        self.sheet_config = {
            'KPI': {
                'target_dir': 'kpis',
                'name_field': 'KPI Name',  # Field to use for filename generation
                'fallback_name_field': 'name'  # Fallback if KPI Name doesn't exist
            },
            'Events': {
                'target_dir': 'events', 
                'name_field': 'Event Name',
                'fallback_name_field': 'name'
            },
            'Dimensions': {
                'target_dir': 'dimensions',
                'name_field': 'Dimension Name', 
                'fallback_name_field': 'name'
            }
        }

    def get_excel_sheets(self) -> list:
        """Get list of sheet names from Excel file"""
        try:
            excel_file = pd.ExcelFile(self.excel_path)
            sheets = excel_file.sheet_names
            logger.info(f"Found sheets: {sheets}")
            return sheets
        except Exception as e:
            logger.error(f"Error reading Excel file: {e}")
            return []

    def clean_filename(self, name: str) -> str:
        """Clean a string to be filesystem-safe"""
        if not name or pd.isna(name):
            return "unnamed"
        
        # Convert to string and strip whitespace
        name = str(name).strip()
        
        # Replace spaces and special characters with underscores
        name = re.sub(r'[^\w\s-]', '', name)  # Remove special chars except hyphens
        name = re.sub(r'[-\s]+', '_', name)   # Replace spaces and multiple hyphens with single underscore
        name = name.lower()                   # Convert to lowercase
        
        # Remove leading/trailing underscores
        name = name.strip('_')
        
        # Ensure it's not empty
        if not name:
            name = "unnamed"
            
        return name

    def convert_list_values(self, value):
        """Convert comma-separated strings to lists, handle other data types"""
        if pd.isna(value):
            return None
            
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return None
            # If string contains commas, treat as list
            if ',' in value and not (value.startswith('{') and value.endswith('}')):
                return [item.strip() for item in value.split(',') if item.strip()]
            return value
        elif isinstance(value, (int, float)):
            return value
        elif isinstance(value, list):
            return value
        else:
            return str(value)

    def excel_to_yaml_direct(self, sheet_name: str) -> bool:
        """
        Convert Excel sheet directly to YAML files using actual names for file naming
        """
        try:
            # Read the Excel sheet
            df = pd.read_excel(self.excel_path, sheet_name=sheet_name)
            
            if df.empty:
                logger.warning(f"Sheet '{sheet_name}' is empty")
                return False

            logger.info(f"Processing sheet '{sheet_name}' with {len(df)} rows and columns: {list(df.columns)}")
            
            # Get configuration for this sheet
            config = self.sheet_config.get(sheet_name, {})
            target_dir = config.get('target_dir', sheet_name.lower().replace(' ', '_'))
            name_field = config.get('name_field', 'name')
            fallback_name_field = config.get('fallback_name_field', 'name')
            
            # Create target directory
            target_path = self.data_layer_dir / target_dir
            target_path.mkdir(parents=True, exist_ok=True)
            
            # Process each row
            for index, row in df.iterrows():
                yaml_data = {}
                
                # Convert all columns to YAML keys
                for column in df.columns:
                    value = row[column]
                    converted_value = self.convert_list_values(value)
                    if converted_value is not None:
                        yaml_data[column] = converted_value
                
                # Determine filename using the name field
                name_value = yaml_data.get(name_field) or yaml_data.get(fallback_name_field)
                if name_value:
                    # Handle list values for name field
                    if isinstance(name_value, list):
                        name_value = name_value[0] if name_value else "unnamed"
                    filename = self.clean_filename(name_value)
                else:
                    filename = f"{target_dir}_{index}"
                
                yaml_filename = f"{filename}.yml"
                yaml_path = target_path / yaml_filename
                
                # Write YAML file
                with open(yaml_path, 'w', encoding='utf-8') as f:
                    yaml.dump(yaml_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
                
                logger.info(f"Created YAML file: {yaml_path} (from row {index})")
                
            return True
            
        except Exception as e:
            logger.error(f"Error converting sheet '{sheet_name}' to YAML: {e}")
            return False

    def generate_catalog_indexes(self) -> bool:
        """Generate catalog indexes by running the existing JS script"""
        logger.info("Running YAML-to-MDX generation script...")
        try:
            js_script_path = self.project_root / 'scripts' / 'generate-from-yaml.js'
            if not js_script_path.exists():
                logger.error(f"JS generation script not found at {js_script_path}")
                return False

            result = subprocess.run(
                ['node', str(js_script_path)],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                check=True,
                encoding='utf-8'
            )
            logger.info("YAML-to-MDX generation completed successfully")
            logger.info(f"Output: {result.stdout.strip()}")
            if result.stderr:
                logger.warning(f"JS script stderr: {result.stderr.strip()}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Error running JS generation script: {e}")
            logger.error(f"Stdout: {e.stdout}")
            logger.error(f"Stderr: {e.stderr}")
            return False
        except FileNotFoundError:
            logger.error("Node.js is not installed or not in PATH. Please install Node.js.")
            return False
        except Exception as e:
            logger.error(f"An unexpected error occurred during JS script execution: {e}")
            return False

    def process_excel_file(self) -> bool:
        """Process the entire Excel file"""
        if not self.excel_path.exists():
            logger.error(f"Excel file not found: {self.excel_path}")
            return False

        logger.info(f"Processing Excel file: {self.excel_path}")
        
        sheets = self.get_excel_sheets()
        if not sheets:
            logger.error("No sheets found in Excel file")
            return False

        success_count = 0
        for sheet_name in sheets:
            logger.info(f"Processing sheet: {sheet_name}")
            if self.excel_to_yaml_direct(sheet_name):
                success_count += 1
                logger.info(f"Successfully processed sheet: {sheet_name}")
            else:
                logger.error(f"Failed to process sheet: {sheet_name}")

        logger.info(f"Successfully processed {success_count}/{len(sheets)} sheets")
        
        if success_count > 0:
            # Generate catalog indexes
            self.generate_catalog_indexes()
            logger.info("Excel to YAML conversion completed successfully!")
            return True
        else:
            logger.error("No sheets were processed successfully")
            return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python excel_to_yaml_direct.py <excel_file_path>")
        sys.exit(1)

    excel_file_path = sys.argv[1]
    project_root = Path.cwd()
    
    converter = DirectExcelToYamlConverter(excel_file_path, project_root)
    success = converter.process_excel_file()
    
    if success:
        print("\n[SUCCESS] Direct Excel to YAML conversion completed successfully!")
        print("\nNext steps:")
        print("1. Run the Docusaurus build to see your updated GitHub Pages:")
        print("   npm run build")
        print("2. Or start the development server:")
        print("   npm run start")
    else:
        print("\n[ERROR] Excel to YAML conversion failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
