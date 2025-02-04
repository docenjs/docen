# Docen

![GitHub](https://img.shields.io/github/license/docenjs/docen)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)

> Universal document conversion and processing library that works in any JavaScript runtime, powered by Demo Macro

## 🎯 Features

- **Universal Format Support**: Convert between various document formats seamlessly
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Modular Architecture**: Use only what you need with tree-shaking support
- **Type Safety**: Written in TypeScript with full type support
- **High Performance**: Optimized for speed and memory efficiency
- **Extensible**: Easy to add new format support
- **CLI Support**: Command-line interface for quick conversions

## 💻 Platform Support

Docen is designed to work across all major platforms:

- **Windows**: Full support (x64, arm64)
- **macOS**: Full support (x64, arm64)
- **Linux**: Full support (x64, arm64)

Some features require additional setup:

### Image Processing & OCR

- Windows: Requires Visual Studio Build Tools
- Linux: Requires `build-essential` and `libcairo2-dev`
- macOS: Requires Xcode Command Line Tools

### Docker Support

We provide Docker images for consistent environment across platforms:

```bash
docker pull docenjs/docen
```

For detailed platform-specific setup, see [Installation Guide](docs/2.installation.md).

## 📦 Installation

```bash
# Install the package
npm install docen

# Or with specific processors
npm install docen pdf-lib mammoth xlsx
```

## 📖 Documentation

- [Introduction](docs/1.introduction.md)
- [Installation Guide](docs/2.installation.md)
- [Quick Start Guide](docs/3.quickstart.md)
- [Core Concepts](docs/4.core-concepts.md)
- [Processors](docs/5.processors.md)
- [CLI Usage](docs/6.cli-usage.md)
- [API Reference](docs/7.api-reference.md)
- [Contributing Guide](docs/8.contributing.md)

## 🏗️ Project Structure

```
docen/
  ├── packages/
  │   ├── docen/          # Core package
  │   │   ├── core/           # Core conversion engine
  │   │   ├── processors/     # Format processors
  │   │   ├── cli/           # CLI implementation
  │   │   └── utils/         # Shared utilities
  │   └── processors/     # Official processors
  ├── docs/              # Documentation
  ├── examples/          # Usage examples
  └── tests/            # Test suites
```

## 🔧 Supported Formats

For a detailed format conversion compatibility matrix, see [Format Conversion Matrix](docs/5.processors.md#format-conversion-matrix).

### Document Formats

- PDF (.pdf)
- Microsoft Word (.docx)
- Microsoft Excel (.xlsx)
- CSV (.csv)
- Markdown (.md)
- HTML (.html)

### Media Formats

- Images (.png, .jpg, .gif, etc.)
- Audio (.mp3, .wav, etc.)
- Video (.mp4, .avi, etc.)

### Data Formats

- JSON (.json)
- XML (.xml)
- YAML (.yaml)

## 🗺️ Roadmap

### Phase 1 - Core Functionality (Current)

- [x] Basic document format support (PDF, DOCX, XLSX, CSV)
- [x] Text extraction
- [x] Basic conversion capabilities
- [x] CLI implementation

### Phase 2 - Enhanced Features

- [ ] Advanced format support (Markdown, HTML)
- [ ] Media file processing
- [ ] Batch processing
- [ ] Progress tracking
- [ ] Error recovery

### Phase 3 - Advanced Features

- [ ] Cloud storage integration
- [ ] Streaming support
- [ ] Format validation
- [ ] Custom format plugins
- [ ] Web API

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/8.contributing.md) for details.

## 📄 License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
