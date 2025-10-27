#!/usr/bin/env python3
"""
Excel to YAML Converter for OpenKPIs Project

This script processes Excel files and converts them to YAML format
compatible with the OpenKPIs Docusaurus project structure.

Usage:
    python scripts/excel_to_yaml.py [excel_file_path]

Features:
- Converts Excel sheets to CSV files
- Converts CSV files to YAML format matching existing structure
- Supports dynamic sheet detection
- Integrates with existing YAML-to-MDX generation system
"""

import os
import sys
import pandas as pd
import yaml
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
import argparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ExcelToYAMLConverter:
    """Main converter class for Excel to YAML transformation"""
    
    def __init__(self, excel_path: str, project_root: str = None):
        """
        Initialize the converter
        
        Args:
            excel_path: Path to the Excel file
            project_root: Root directory of the OpenKPIs project
        """
        self.excel_path = Path(excel_path)
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.csv_dir = self.project_root / "csv"
        self.data_layer_dir = self.project_root / "data-layer"
        
        # Ensure directories exist
        self.csv_dir.mkdir(exist_ok=True)
        self.data_layer_dir.mkdir(exist_ok=True)
        
        # Dynamic sheet mapping - uses Excel column names as YAML keys
        self.sheet_config = {
            'KPI': {
                'target_dir': 'kpis',
                'id_field': 'id'  # Field to use for filename generation
            },
            'Events': {
                'target_dir': 'events',
                'id_field': 'id'
            },
            'Dimensions': {
                'target_dir': 'dimensions',
                'id_field': 'id'
            }
        }
    
    def get_excel_sheets(self) -> List[str]:
        """Get list of sheet names from Excel file"""
        try:
            excel_file = pd.ExcelFile(self.excel_path)
            sheets = excel_file.sheet_names
            logger.info(f"Found sheets: {sheets}")
            return sheets
        except Exception as e:
            logger.error(f"Error reading Excel file: {e}")
            return []
    
    def excel_to_csv(self, sheet_name: str) -> Optional[Path]:
        """
        Convert Excel sheet to CSV file
        
        Args:
            sheet_name: Name of the sheet to convert
            
        Returns:
            Path to the created CSV file or None if failed
        """
        try:
            # Read the Excel sheet
            df = pd.read_excel(self.excel_path, sheet_name=sheet_name)
            
            if df.empty:
                logger.warning(f"Sheet '{sheet_name}' is empty, skipping")
                return None
            
            # Clean column names (remove spaces, convert to lowercase)
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
            
            # Remove completely empty rows
            df = df.dropna(how='all')
            
            # Create CSV filename
            csv_filename = f"{sheet_name.lower()}.csv"
            csv_path = self.csv_dir / csv_filename
            
            # Save to CSV
            df.to_csv(csv_path, index=False, encoding='utf-8')
            logger.info(f"Converted sheet '{sheet_name}' to CSV: {csv_path}")
            
            return csv_path
            
        except Exception as e:
            logger.error(f"Error converting sheet '{sheet_name}' to CSV: {e}")
            return None
    
    def csv_to_yaml(self, csv_path: Path, sheet_name: str) -> bool:
        """
        Convert CSV file to YAML format using column names as keys
        
        Args:
            csv_path: Path to the CSV file
            sheet_name: Original sheet name for configuration
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Read CSV
            df = pd.read_csv(csv_path)
            
            if df.empty:
                logger.warning(f"CSV file {csv_path} is empty")
                return False
            
            # Get configuration for this sheet type
            config = self.sheet_config.get(sheet_name, {})
            target_dir = config.get('target_dir', sheet_name.lower())
            id_field = config.get('id_field', 'id')
            
            # Create target directory
            target_path = self.data_layer_dir / target_dir
            target_path.mkdir(exist_ok=True)
            
            # Process each row as a separate YAML file
            for index, row in df.iterrows():
                # Create YAML data structure using column names as keys
                yaml_data = {}
                
                # Process each column
                for column in df.columns:
                    value = row[column]
                    
                    # Skip NaN values
                    if pd.isna(value):
                        continue
                    
                    # Convert string values
                    if isinstance(value, str):
                        value = value.strip()
                        if not value:
                            continue
                    
                    # Check if the value looks like a list (contains commas)
                    if isinstance(value, str) and ',' in value:
                        # Split by comma and clean up
                        yaml_data[column] = [item.strip() for item in value.split(',') if item.strip()]
                    else:
                        yaml_data[column] = value
                
                # Generate filename from ID field or fallback to index
                file_id = yaml_data.get(id_field, f"{sheet_name.lower()}_{index}")
                # Clean filename (remove special characters, convert to lowercase)
                file_id = ''.join(c for c in str(file_id) if c.isalnum() or c in '-_').lower()
                
                yaml_filename = f"{file_id}.yml"
                yaml_path = target_path / yaml_filename
                
                # Write YAML file
                with open(yaml_path, 'w', encoding='utf-8') as f:
                    yaml.dump(yaml_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
                
                logger.info(f"Created YAML file: {yaml_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting CSV to YAML: {e}")
            return False
    
    def process_excel_file(self) -> bool:
        """
        Process the entire Excel file
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.excel_path.exists():
                logger.error(f"Excel file not found: {self.excel_path}")
                return False
            
            logger.info(f"Processing Excel file: {self.excel_path}")
            
            # Get all sheets
            sheets = self.get_excel_sheets()
            if not sheets:
                logger.error("No sheets found in Excel file")
                return False
            
            success_count = 0
            
            # Process each sheet
            for sheet_name in sheets:
                logger.info(f"Processing sheet: {sheet_name}")
                
                # Convert to CSV
                csv_path = self.excel_to_csv(sheet_name)
                if csv_path is None:
                    continue
                
                # Convert CSV to YAML
                if self.csv_to_yaml(csv_path, sheet_name):
                    success_count += 1
                    logger.info(f"Successfully processed sheet: {sheet_name}")
                else:
                    logger.error(f"Failed to process sheet: {sheet_name}")
            
            logger.info(f"Successfully processed {success_count}/{len(sheets)} sheets")
            return success_count > 0
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {e}")
            return False
    
    def generate_catalog_indexes(self) -> bool:
        """
        Generate catalog index files for the Catalog component
        
        Returns:
            True if successful, False otherwise
        """
        try:
            indexes_dir = self.project_root / "static" / "indexes"
            indexes_dir.mkdir(parents=True, exist_ok=True)
            
            for section_name, config in self.sheet_config.items():
                target_dir = config['target_dir']
                section_path = self.data_layer_dir / target_dir
                
                if not section_path.exists():
                    continue
                
                # Collect all YAML files in the section
                yaml_files = list(section_path.glob("*.yml")) + list(section_path.glob("*.yaml"))
                
                index_items = []
                
                for yaml_file in yaml_files:
                    try:
                        with open(yaml_file, 'r', encoding='utf-8') as f:
                            data = yaml.safe_load(f)
                        
                        if not data:
                            continue
                        
                        # Extract relevant fields for catalog dynamically
                        item = {
                            'id': data.get('id', yaml_file.stem),
                            'title': data.get('title', data.get('name', data.get('kpi_name', ''))),
                            'description': data.get('description', ''),
                            'slug': f"/{data.get('id', yaml_file.stem)}",
                            'tags': [],
                            'category': data.get('category', []),
                            'industry': data.get('industry', ''),
                            'featured': data.get('featured', False),
                            'added': data.get('added', None)
                        }
                        
                        # Add tags from various fields dynamically
                        tags = []
                        # Look for common tag fields
                        tag_fields = ['alias', 'kpi_alias', 'aliases', 'tags', 'keywords']
                        for field in tag_fields:
                            if data.get(field):
                                if isinstance(data[field], list):
                                    tags.extend(data[field])
                                else:
                                    tags.append(data[field])
                        
                        # Add industry and category as tags
                        if data.get('industry'):
                            if isinstance(data['industry'], list):
                                tags.extend(data['industry'])
                            else:
                                tags.append(data['industry'])
                        if data.get('category'):
                            if isinstance(data['category'], list):
                                tags.extend(data['category'])
                            else:
                                tags.append(data['category'])
                        
                        # Convert all tags to strings and remove duplicates
                        item['tags'] = list(set(str(tag) for tag in tags if tag))
                        
                        index_items.append(item)
                        
                    except Exception as e:
                        logger.warning(f"Error processing {yaml_file}: {e}")
                        continue
                
                # Write index file
                index_file = indexes_dir / f"{target_dir}.json"
                with open(index_file, 'w', encoding='utf-8') as f:
                    json.dump(index_items, f, indent=2, ensure_ascii=False)
                
                logger.info(f"Generated catalog index: {index_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error generating catalog indexes: {e}")
            return False
    
    def run_generation_script(self) -> bool:
        """
        Run the existing YAML-to-MDX generation script
        
        Returns:
            True if successful, False otherwise
        """
        try:
            import subprocess
            
            # Change to project root directory
            original_cwd = os.getcwd()
            os.chdir(self.project_root)
            
            try:
                # Run the generation script
                result = subprocess.run(['node', 'scripts/generate-from-yaml.js'], 
                                      capture_output=True, text=True, check=True)
                
                logger.info("YAML-to-MDX generation completed successfully")
                logger.info(f"Output: {result.stdout}")
                
                return True
                
            except subprocess.CalledProcessError as e:
                logger.error(f"Generation script failed: {e}")
                logger.error(f"Error output: {e.stderr}")
                return False
                
            finally:
                os.chdir(original_cwd)
                
        except Exception as e:
            logger.error(f"Error running generation script: {e}")
            return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Convert Excel files to YAML for OpenKPIs project')
    parser.add_argument('excel_path', help='Path to the Excel file')
    parser.add_argument('--project-root', help='Root directory of the OpenKPIs project')
    parser.add_argument('--skip-generation', action='store_true', 
                       help='Skip running the YAML-to-MDX generation script')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Initialize converter
    converter = ExcelToYAMLConverter(args.excel_path, args.project_root)
    
    # Process Excel file
    if not converter.process_excel_file():
        logger.error("Failed to process Excel file")
        sys.exit(1)
    
    # Generate catalog indexes
    if not converter.generate_catalog_indexes():
        logger.warning("Failed to generate catalog indexes")
    
    # Run generation script unless skipped
    if not args.skip_generation:
        if not converter.run_generation_script():
            logger.error("Failed to run YAML-to-MDX generation")
            sys.exit(1)
    
    logger.info("Excel to YAML conversion completed successfully!")


if __name__ == "__main__":
    main()
