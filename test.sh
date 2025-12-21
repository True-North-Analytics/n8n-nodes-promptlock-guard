#!/bin/bash

# PromptShield Guard n8n Node Test Script
# This script helps you quickly test the node in different scenarios

set -e

echo "🛡️  PromptShield Guard n8n Node Testing"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "nodes" ]; then
    echo -e "${RED}❌ Please run this script from the n8n-nodes-promptshield-guard directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Step 2: Building the node...${NC}"
npm run build

echo -e "${BLUE}🧪 Step 3: Running unit tests...${NC}"
npm test

echo -e "${BLUE}📦 Step 4: Installing into local n8n...${NC}"
# Create n8n nodes directory if it doesn't exist
mkdir -p ~/.n8n/nodes

# Remove old version if exists
if [ -d ~/.n8n/nodes/n8n-nodes-promptshield-guard ]; then
    echo "Removing old version..."
    rm -rf ~/.n8n/nodes/n8n-nodes-promptshield-guard
fi

# Copy new version
cp -r dist ~/.n8n/nodes/n8n-nodes-promptshield-guard
echo -e "${GREEN}✅ Node installed to ~/.n8n/nodes/${NC}"

echo -e "${BLUE}🔍 Step 5: Verifying installation...${NC}"
if [ -f ~/.n8n/nodes/n8n-nodes-promptshield-guard/credentials/PromptShieldApiKey.credentials.js ]; then
    echo -e "${GREEN}✅ Credentials file exists${NC}"
else
    echo -e "${RED}❌ Credentials file missing${NC}"
fi

if [ -f ~/.n8n/nodes/n8n-nodes-promptshield-guard/nodes/PromptShieldGuard/PromptShieldGuard.node.js ]; then
    echo -e "${GREEN}✅ Node file exists${NC}"
else
    echo -e "${RED}❌ Node file missing${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "1. Start your PromptShield backend:"
echo "   cd ../backend && python scripts/dev_setup.py && uvicorn apps.api.main:app --reload"
echo ""
echo "2. Start n8n:"
echo "   n8n start"
echo ""
echo "3. Import the test workflow:"
echo "   - Open n8n at http://localhost:5678"
echo "   - Click Import workflow"
echo "   - Upload: test-workflow.json"
echo ""
echo "4. Set up credentials:"
echo "   - Create new 'PromptShield API Key' credential"
echo "   - Base URL: http://localhost:8000"
echo "   - API Key: (get from your backend setup)"
echo ""
echo "5. Run the test workflow to verify everything works!"

echo ""
echo -e "${BLUE}📚 Additional Test Resources:${NC}"
echo "- Test workflow: ./test-workflow.json"
echo "- Example workflows: ./examples/"
echo "- Testing guide: ./TESTING.md"
echo "- Documentation: ./README.md"

echo ""
echo -e "${GREEN}🎉 Installation complete! Your PromptShield Guard node is ready to test.${NC}"

# Quick verification
echo ""
echo -e "${BLUE}🔍 Quick verification:${NC}"
echo "Node files in ~/.n8n/nodes/n8n-nodes-promptshield-guard:"
find ~/.n8n/nodes/n8n-nodes-promptshield-guard -name "*.js" 2>/dev/null | head -5

echo ""
echo -e "${YELLOW}💡 Pro tip: Use 'npm run dev' for development with auto-rebuild${NC}"
