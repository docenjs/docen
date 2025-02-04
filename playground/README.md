# Docen Playground

This directory contains various examples and test cases for the Docen document conversion library.

## Directory Structure

```
playground/
├── examples/              # Example files for conversion
│   ├── documents/        # Document format examples
│   │   ├── sample.docx
│   │   ├── sample.pdf
│   │   └── sample.xlsx
│   ├── media/           # Media format examples
│   │   ├── sample.jpg
│   │   ├── sample.mp3
│   │   └── sample.mp4
│   └── data/            # Data format examples
│       ├── sample.json
│       ├── sample.xml
│       └── sample.yaml
├── tests/               # Test cases for each conversion
│   ├── document-tests/  # Document format conversion tests
│   ├── media-tests/    # Media format conversion tests
│   └── data-tests/     # Data format conversion tests
└── README.md           # This file
```

## Running Tests

1. Install dependencies:

```bash
pnpm install
```

2. Run all tests:

```bash
pnpm test
```

3. Run specific test category:

```bash
pnpm test:document    # Run document conversion tests
pnpm test:media      # Run media conversion tests
pnpm test:data       # Run data conversion tests
```

## Test Cases

Each test case demonstrates:

- Format conversion capabilities
- Error handling
- Option configurations
- Performance benchmarks

## Adding New Tests

1. Create a new test file in the appropriate category directory
2. Add test sample files in the examples directory
3. Update the test configuration if needed
4. Run tests to verify
