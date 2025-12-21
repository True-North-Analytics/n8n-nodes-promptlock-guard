# Changelog

All notable changes to the PromptShield Guard n8n node will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-10-23

### Changed

- Updated support email contact information in documentation

## [1.0.0] - 2024-08-22

### Added

- Initial release of PromptShield Guard n8n community node
- AI-powered content analysis with 4-output routing (Allow/Flag/Redact/Block)
- Support for HIPAA, GDPR, and PCI compliance frameworks
- Configurable field path resolution with dot notation support
- Fail-closed security by default with configurable error handling
- Rich metadata attachment including risk scores and violation details
- Clean text generation for redacted content
- Comprehensive test suite and example workflows
- Full TypeScript implementation with proper type safety
- Production-ready error handling and timeout management

### Features

- **Multi-Framework Compliance**: HIPAA, GDPR, PCI checking
- **4-Output Architecture**: Clean workflow routing based on risk assessment
- **Flexible Configuration**: Dot notation field paths, framework selection
- **Security-First Design**: Fail-closed defaults, configurable error policies
- **Rich Metadata**: Detailed analysis results and compliance status
- **Real-time Analysis**: Fast API integration with configurable timeouts

### Documentation

- Complete README with installation and usage instructions
- Quick start guide for 5-minute setup
- Comprehensive testing documentation
- Three example workflow patterns (webhook guard, pre-LLM protection, output sanitization)
- API reference and troubleshooting guide

### Technical

- Node.js 18+ and npm 8+ support
- Compatible with n8n community nodes framework
- Peer dependency on n8n-workflow
- ESLint and Prettier code quality tools
- Jest testing framework
- Automated build and publishing pipeline
