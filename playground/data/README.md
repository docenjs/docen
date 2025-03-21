# Data Module Examples

This directory contains examples demonstrating the usage of the `@docen/data` module for parsing and generating various data formats.

## Directory Structure

```
data/
├── csv/
│   ├── parser.example.ts    # CSV parsing example
│   ├── generator.example.ts # CSV generation example
│   └── example.csv         # Sample CSV file
├── json/
│   ├── parser.example.ts    # JSON parsing example
│   ├── generator.example.ts # JSON generation example
│   └── example.json        # Sample JSON file
├── yaml/
│   ├── parser.example.ts    # YAML parsing example
│   ├── generator.example.ts # YAML generation example
│   └── example.yaml        # Sample YAML file
└── xml/
    ├── parser.example.ts    # XML parsing example
    ├── generator.example.ts # XML generation example
    └── example.xml         # Sample XML file
```

## Usage

Each format has its own directory with example files showing how to:

1. Parse data from files into a document AST
2. Generate data files from a document AST

### Running Examples

To run any example, use the following command:

```bash
ts-node <example-file>
```

For example:

```bash
ts-node csv/parser.example.ts
```

## Examples Overview

### CSV Format

- `parser.example.ts`: Demonstrates parsing CSV files with headers and data rows
- `generator.example.ts`: Shows how to generate CSV files from a document AST
- `example.csv`: Sample CSV file with user data

### JSON Format

- `parser.example.ts`: Shows parsing JSON files with various data types
- `generator.example.ts`: Demonstrates generating JSON files from a document AST
- `example.json`: Sample JSON file with structured data

### YAML Format

- `parser.example.ts`: Demonstrates parsing YAML files with comments and complex structures
- `generator.example.ts`: Shows how to generate YAML files from a document AST
- `example.yaml`: Sample YAML file with nested data

### XML Format

- `parser.example.ts`: Shows parsing XML files with comments and attributes
- `generator.example.ts`: Demonstrates generating XML files from a document AST
- `example.xml`: Sample XML file with structured data

## Common Features

All examples demonstrate:

1. Error handling with try-catch blocks
2. File reading and writing operations
3. Parser and generator options configuration
4. Document AST structure usage

## Output Files

When running the generator examples, the following output files will be created:

- `csv/output.csv`
- `json/output.json`
- `yaml/output.yaml`
- `xml/output.xml`

## Notes

- All examples use TypeScript for type safety
- The examples follow the same pattern for consistency
- Error handling is implemented in all examples
- File operations use Node.js built-in modules
