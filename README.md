# PromptLock Guard for n8n

🛡️ AI-powered security guardrails for your n8n workflows

PromptLock Guard is a community node that adds content analysis and sensitive data detection to your n8n automations. Detect prompt injection attacks, identify PII/PHI patterns, and route content based on risk assessment.

## ✨ Features

- 🔍 **Sensitive Data Detection**: Identifies patterns associated with HIPAA, GDPR, and PCI requirements
- 🚦 **4-Output Routing**: Route workflows based on risk assessment (Allow/Flag/Redact/Block)
- 🔒 **Fail-Closed Security**: Secure by default with configurable error handling
- ⚡ **Real-time Analysis**: Fast API integration with configurable timeouts
- 🎯 **Flexible Targeting**: Support for nested field paths with dot notation
- 📊 **Rich Metadata**: Detailed analysis results attached to each item

## 🚀 Installation

### Community Nodes (Recommended)

1. In n8n, go to Settings → Community Nodes
2. Click Install a community node
3. Enter: `n8n-nodes-promptlock-guard`
4. Click Install
5. Restart n8n

### npm Installation
```bash
# Install globally for n8n
npm install -g n8n-nodes-promptlock-guard

# Or install in your n8n user directory
cd ~/.n8n/
npm install n8n-nodes-promptlock-guard

# Restart n8n
```

## ⚙️ Setup

### 1. Create Credentials

In n8n, create new PromptLock API Key credentials:

- **Base URL**: `https://api.promptlock.io`
- **API Key**: Your PromptLock API key (starts with `ps_`)
- **Header Style**: `X-API-Key` (preferred) or `Bearer Token`

Get your API key at [promptlock.io](https://promptlock.io)

### 2. Add the Node

1. Search for "PromptLock Guard" in the node panel
2. Configure:
   - **Text Field**: Path to your text data (e.g., `text`, `payload.message`)
   - **Frameworks**: Select detection frameworks (HIPAA, GDPR, PCI)
   - **Credentials**: Select your PromptLock API Key

### 3. Wire the Outputs

The node provides four distinct outputs:

- ✅ **Allow**: Content is safe, proceed normally
- ⚠️ **Flag**: Content needs review, proceed with caution
- 🔒 **Redact**: Content has been cleaned, use `cleanText` field
- 🚫 **Block**: Content is blocked, do not proceed
-    **Prompt injection detection is always enabled by default.**

## 📋 Quick Example
```
Webhook → PromptLock Guard
├─ Allow → Process Normally
├─ Flag → Send to Review Queue
├─ Redact → Process with Clean Text
└─ Block → Return 403 Error
```

## 🔧 Configuration Options

### Core Settings

- **Text Field**: Path to analyze (supports dot notation like `data.message.text`)
- **Detection Frameworks**: Select HIPAA, GDPR, and/or PCI pattern detection
- **Action on High Risk**: Override server policy (inherit/flag/redact/block/score)

### Advanced Settings

- **Write Clean Text To**: Field path for redacted content (default: `cleanText`)
- **Attach Metadata Under**: Field path for analysis results (default: `promptLock`)
- **On API Error**: Error handling strategy (block/flag/allow/throw)
- **Request Timeout**: API timeout in milliseconds (default: 15000)

## 📊 Metadata Structure

The node attaches analysis data to each item:
```json
{
  "promptLock": {
    "risk_score": 56,
    "action_taken": "redact",
    "clean_text": "Patient [HIPAA_PERSON_NAME] (SSN: [HIPAA_SSN]) needs treatment",
    "violations": [
      {
        "type": "pii_detection",
        "category": "person_name",
        "confidence": 0.95,
        "position": [8, 18],
        "text": "John Smith",
        "placeholder": "[HIPAA_PERSON_NAME]",
        "compliance_frameworks": ["HIPAA"]
      }
    ],
    "compliance_status": {
      "HIPAA": 2,
      "GDPR": 0,
      "PCI": 0
    },
    "usage": {
      "tokens_analyzed": 8,
      "processing_time_ms": 78
    }
  }
}
```

## 🔒 Security Best Practices

- **On API Error**: Keep as "Block (Fail Closed)" for maximum security
- **Action on High Risk**: Use "Inherit from Policy" to leverage server-side rules
- **Write Clean Text To**: Use a separate field to preserve original data

## ⚠️ Important Note

PromptLock is a security tool that helps detect sensitive data patterns and prompt injection attempts. It is not a compliance certification and does not guarantee regulatory compliance. You remain responsible for your own compliance obligations.

## 📞 Support

- Website: [promptlock.io](https://promptlock.io)
- Email: support@promptlock.io

## 📜 License

MIT License - see LICENSE file for details.

---

Built by the PromptLock team
