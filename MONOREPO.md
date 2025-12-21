# n8n-nodes-promptshield-guard

This directory contains the **PromptShield Guard** community node for n8n workflows.

## 📦 Published Package

This package is published to npm as `n8n-nodes-promptshield-guard` and can be installed in n8n via:

```bash
# In n8n Community Nodes
n8n-nodes-promptshield-guard
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Build the node
npm run build

# Run tests
npm test

# Clean build artifacts
npm run clean
```

## 📁 Structure

- `credentials/` - PromptShield API Key credential definition
- `nodes/` - Main PromptShield Guard node implementation
- `examples/` - Example n8n workflows
- `test/` - Test files
- `dist/` - Compiled output (gitignored)

## 🔗 Related

- **Backend API**: `../backend/` - PromptShield API server
- **Frontend**: `../frontend/` - PromptShield web interface
- **Documentation**: `../docs/` - Project documentation

## 📝 Publishing

The package is automatically prepared for publishing with:

```bash
npm run prepack  # Clean, build, test
npm publish      # Publish to npm
```

Only essential files are included in the published package (see `.npmignore`).
