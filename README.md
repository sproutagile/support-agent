# Sprout Support Agent — Chrome Extension (Sidebar)

L4 Support Engineering Assistant for Sprout Solutions. Opens as a **sidebar panel** alongside Jira, providing EAB metrics, AI-powered investigation, ticket tools, and process FAQs — all without leaving the page.

## Quick Start (Prototype)

### Load as Chrome Extension (Sidebar)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. Click the Sprout Support Agent icon in the toolbar — the **sidebar opens** on the right side of the browser
6. The sidebar stays open as you navigate Jira tickets

### Preview in Browser (without Chrome Extension APIs)

You can also open the sidebar preview directly in a browser for design review:

```bash
open extension/popup.html
```

> Note: `popup.html` is a standalone preview version (400px wide) that simulates the sidebar experience. The actual extension uses `sidepanel.html` via Chrome's Side Panel API.

## Project Structure

```
Support Agent/
├── PRD.md                    # Product Requirements Document (Markdown)
├── prd.html                  # Product Requirements Document (Web page)
├── README.md                 # This file
└── extension/                # Chrome Extension (Manifest V3 — Side Panel)
    ├── manifest.json         # Extension manifest (side_panel + sidePanel permission)
    ├── sidepanel.html        # Main sidebar UI (loaded by Chrome Side Panel API)
    ├── popup.html            # Browser preview version (for design review)
    ├── popup.js              # Sidebar interactivity (tabs, accordion, AI chat, tools)
    ├── styles.css            # Sprout Design System styles (responsive for sidebar width)
    ├── background.js         # Service worker (side panel opener, API, caching, messaging)
    ├── content-script.js     # Jira page context extraction
    ├── content-style.css     # Minimal Jira page injected styles
    └── icons/                # Extension icons (to be added)
```

## Features

### Dashboard (Edwin's Requirements)
- Created Ticket Trend per Priority (P1–P4) with bar chart
- Resolved EAB Tickets (Internal Support vs. Delivery Teams)
- Escalated EAB Tickets count and percentage
- Velocity, Lead Time, and Cycle Time metric cards
- Date range selector (7d, 30d, 90d)
- Priority filter

### Investigate (Jona's Requirements)
- Related ticket search (auto-populated from current Jira ticket)
- Workaround identification with copy-to-clipboard
- Escalation Advisor (dev assignment recommendation)
- Issue Trends / Analytics (top 5 recurring issues)

### AI Investigate (NEW)
- Conversational AI chat powered by Azure OpenAI (GPT-4o)
- Root cause analysis with confidence scores and evidence from related tickets
- Workaround suggestions extracted from resolved similar tickets
- Escalation recommendations with reasoning
- Quick action buttons for common queries
- Thumbs up/down feedback on AI responses

### FAQ & Tools (Gaby & Danica's Requirements)
- Searchable process FAQs with accordion UI
  - HR-PR Linking (with SSO)
  - SSO Inquiries
  - Biometric Device Troubleshooting (decision tree)
  - New Account Setup (Prod / Sandbox)
  - Full Sync Process (Pre-Migration to SSO Scheduling)
- Quick Tools: CA (Customer Advocacy) Tool access, SSO Investigation checklist, Full Sync checker
- Quick SSO Investigation guided diagnostic panel

## Design System

Built following the **Sprout Design System (TOGE)** with:
- Sprout green brand colors (`#16a34a` primary)
- Inter font family
- Consistent spacing tokens (4px grid)
- Accessible color contrast (WCAG 2.1 AA)
- Responsive layout for Chrome sidebar width (~360-420px)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS (prototype) — Vue 3 for production |
| Extension | Chrome Manifest V3 (Side Panel API) |
| Backend (planned) | Azure Functions |
| AI (planned) | Azure OpenAI (GPT-4o) with RAG pipeline |
| Search (planned) | Azure Cognitive Search (vector embeddings) |
| Auth (planned) | Azure AD (MSAL.js) |
| Data | Jira REST API |

## Next Steps

See `PRD.md` for the full release plan. Key next steps:
1. Add Chrome extension icons (16, 48, 128px)
2. Connect to Jira REST API via Azure Functions
3. Implement Azure AD authentication
4. Migrate sidebar to Vue 3 + Vite build
5. Integrate Azure OpenAI for AI Investigation chat
6. Add Azure Cognitive Search for semantic ticket matching
