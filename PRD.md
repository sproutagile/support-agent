# Product Requirements Document (PRD)

## Sprout Support Agent — Chrome Extension

| Field | Details |
|---|---|
| Product Name | Sprout Support Agent |
| Version | 1.0 (MVP) |
| Author | Engineering Team |
| Date | February 13, 2026 |
| Status | Draft |
| Stakeholders | Edwin, Jona, Gaby, Danica, L4 Support Team |

---

## 1. Executive Summary

Sprout Support Agent is a Chrome extension (sidebar) designed to accelerate the workflow of L4 support engineers at Sprout Solutions. It surfaces real-time EAB (Escalated Application Bugs) metrics, enables AI-powered ticket investigation via related-ticket analysis and root-cause suggestions, provides process FAQs, and embeds quick-investigation tools — all within the browser sidebar, right alongside Jira.

Built with Vue.js following the Sprout Design System (TOGE), designed to integrate with the Microsoft / Azure technology stack, leveraging Azure OpenAI for intelligent investigation capabilities.

---

## 2. Problem Statement

1. Scattered metrics — EAB ticket trends, velocity, lead time, cycle time not in one view
2. Slow investigation — manual Jira searches for related tickets/workarounds
3. No intelligent triage — no AI-assisted signal for root cause, workarounds, or escalation decisions
4. Tribal knowledge — process FAQs scattered across docs
5. Tool fragmentation — CA (Customer Advocacy) tool and SSO investigation steps separate from ticketing

---

## 3. Goals & Success Metrics

Goals:
- G1: Provide at-a-glance EAB metrics inside the browser (Edwin)
- G2: Enable related-ticket search and workaround identification from within Jira (Jona)
- G3: Surface process FAQs and embed the CA tool for easier access (Gaby & Danica)
- G4: Reduce average investigation time per EAB ticket by >= 30% (All)
- G5: Provide AI-powered root cause analysis and workaround suggestions using historical ticket data (Engineering)
- G6: Ensure visual consistency with the Sprout Design System (TOGE) (Engineering)

KPIs:
- Average investigation time per ticket: -30% from baseline (Jira lead time)
- % of tickets with workaround identified via extension: >= 40% within 3 months
- FAQ usage rate: >= 3 lookups/engineer/day
- AI suggestion accuracy: >= 60% (user feedback ratings)
- User satisfaction (NPS): >= 8/10
- Extension adoption: 100% of L4 team within 1 month

---

## 4. Target Users

- L4 Support Engineer (primary): Investigates escalated bugs, needs fast access to metrics, related tickets, AI analysis, process docs
- Support Team Lead / Manager: Consumes EAB metrics dashboards
- Customer Advocacy (CA) Analyst: Uses the CA tool embedded in the extension for quicker customer advocacy workflows

---

## 5. Technical Context

- Ticket Management: Jira (EAB project for L4 escalated tickets)
- Tech Stack: Microsoft ecosystem (.NET, Azure AD, MS SQL)
- Cloud Infrastructure: Microsoft Azure
- AI Services: Azure OpenAI (GPT-4o) for ticket analysis and root-cause suggestions
- Frontend Framework: Vue.js 3 (Composition API)
- Design System: Sprout Design System — TOGE (https://jolly-rock-0e7e9fa00.5.azurestaticapps.net/en/)
- Extension Platform: Chrome Manifest V3 (Side Panel API)
- Authentication: Azure AD / SSO (Microsoft Identity Platform)
- APIs: Jira REST API, Azure Functions, Azure OpenAI API

---

## 6. Feature Requirements

### 6.1 EAB Metrics Dashboard (Source: Edwin)
Priority: P1 — Must Have

Features (all P1):
- Created Ticket Trend: Line/bar chart filterable by priority (P1-P4)
- Resolved Tickets — Internal Support: Count and trend
- Resolved Tickets — Delivery Teams: Count and trend
- Escalated Tickets: Count and trend
- Velocity: Tickets completed per sprint/period
- Lead Time: Average time from creation to resolution
- Cycle Time: Average time from work-started to resolution

Data Sources: Jira REST API, Azure Function for aggregation/caching

Acceptance Criteria:
- Dashboard loads within 3 seconds
- All 7 metric cards visible on single scrollable panel
- Data refreshes every 15 minutes (with manual refresh)
- Priority filter (P1-P4) works on ticket trend chart
- Date range selector: last 7 days, 30 days, 90 days, custom

### 6.2 Related Tickets & Investigation Assistant (Source: Jona)
Priority: P1 — Must Have

Features:
- Related Ticket Search (P1): Find similar EAB tickets by summary, description, labels, components
- Workaround Identification (P1): Surface workarounds and resolution notes from related resolved tickets
- Dev Escalation Advisor (P2): Suggest whether dev assignment needed based on complexity/recurrence
- Issue Trends / Analytics (P2): Show trending issues

Data Sources: Jira REST API (JQL), Azure Cognitive Search, internal knowledge base

Acceptance Criteria:
- Auto-searches for related tickets when viewing a Jira ticket
- Related tickets display: key, summary, status, resolution, workaround excerpt
- Workaround text is highlighted and copyable
- Escalation advisor shows confidence indicator (Low/Medium/High)
- Issue trends show top 10 recurring issues in last 30 days

### 6.3 Process FAQ & Quick Tools (Source: Gaby & Danica)
Priority: P1 — Must Have

Features:
- HR-PR Linking (with SSO) (P1): Step-by-step guide
- SSO Inquiries (P1): FAQ and troubleshooting steps
- Biometric Device Troubleshooting (P1): Decision tree (when to assist vs coordinate with supplier)
- New Account Setup (P1): Guide for production or sandbox accounts
- Full Sync Process (P1): End-to-end guide (pre-migration -> full sync -> SSO scheduling)
- CA Tool Integration (P2): Embed or link to Customer Advocacy tool for quick access
- Quick SSO Investigation (P1): Guided diagnostic for SSO issues (upload failures, attribute mismatches)

Data Sources: Internal knowledge base (Markdown/JSON), CA (Customer Advocacy) tool API

Acceptance Criteria:
- All 5 process FAQs searchable by keyword
- Each FAQ has collapsible sections with step-by-step instructions
- SSO quick investigation provides guided checklist
- CA tool accessible in <= 2 clicks
- FAQ content editable without code deployment

### 6.4 AI-Powered Investigation (NEW)
Priority: P1 — Must Have

A conversational AI assistant powered by Azure OpenAI (GPT-4o) that analyzes EAB tickets, cross-references historical data, and provides root cause analysis, workaround suggestions, and escalation recommendations through a chat interface.

Features:
- Chat Interface (P1): Conversational UI for asking about any ticket
- Root Cause Analysis (P1): AI analyzes ticket description, comments, related tickets to suggest root cause
- Workaround Suggestions (P1): Based on resolved similar tickets, suggest proven workarounds with confidence scores
- Historical Pattern Matching (P1): Identify if issue is recurring and show resolution history
- Escalation Recommendation (P2): AI recommends resolve with workaround or escalate to dev, with reasoning
- Context-Aware Follow-ups (P2): Engineers can ask follow-up questions with retained context

Technical Stack:
- LLM: Azure OpenAI (GPT-4o) via Azure Functions proxy
- Vector Search: Azure Cognitive Search with vector embeddings
- RAG Pipeline: Retrieval-Augmented Generation
- Embeddings: Azure OpenAI text-embedding-3-small
- Data Indexing: Nightly Azure Function job indexes EAB tickets into vector store
- Guardrails: System prompt constrains AI to EAB domain only

Data Flow:
```
User asks question in AI chat
  -> Extension sends to Azure Function
  -> Azure Function retrieves ticket context from Jira REST API
  -> Azure Cognitive Search finds top-K related tickets (vector similarity)
  -> Constructs RAG prompt: system instructions + ticket context + related tickets
  -> Azure OpenAI (GPT-4o) generates analysis
  -> Response streamed back to extension chat UI
```

Acceptance Criteria:
- AI responds within 5 seconds for ticket analysis
- Root cause suggestions cite related ticket keys as evidence
- Workaround suggestions extracted from actual resolved tickets
- Confidence score displayed for each suggestion (Low/Medium/High)
- Chat history persists within the session
- User can rate AI responses (thumbs up/down) for accuracy improvement
- AI clearly indicates when it lacks sufficient data

---

## 7. Information Architecture

```
Sprout Support Agent (Chrome Extension — Sidebar)
|
|-- Dashboard (Tab 1)
|   |-- Created Ticket Trend (P1-P4 filter)
|   |-- Resolved — Internal Support
|   |-- Resolved — Delivery Teams
|   |-- Escalated Tickets
|   |-- Velocity
|   |-- Lead Time
|   |-- Cycle Time
|
|-- Investigate (Tab 2)
|   |-- Related Tickets (auto-populated from current Jira ticket)
|   |-- Workaround Suggestions
|   |-- Escalation Advisor
|   |-- Issue Trends
|
|-- AI Investigate (Tab 3)
|   |-- Chat Interface
|   |-- Root Cause Analysis
|   |-- Workaround Suggestions
|   |-- Historical Pattern Matching
|   |-- Escalation Recommendation
|
|-- FAQ & Tools (Tab 4)
|   |-- Search Bar
|   |-- HR-PR Linking (SSO)
|   |-- SSO Inquiries
|   |-- Biometric Device Troubleshooting
|   |-- New Account Setup (Prod / Sandbox)
|   |-- Full Sync Process
|   |-- Quick SSO Investigation
|   |-- CA Tool Access
|
|-- Settings
    |-- Jira Connection (API token)
    |-- Azure AD Login
    |-- Notification Preferences
    |-- Data Refresh Interval
```

---

## 8. UX / Design Requirements

- Design System: Sprout Design System (TOGE) — colors, typography, spacing, components
- Layout: Chrome sidebar panel (~360-420px wide, full viewport height)
- Responsiveness: Adapts to sidebar width; no mobile needed
- Accessibility: WCAG 2.1 AA (keyboard nav, screen reader labels, color contrast)
- Theme: Light mode (default), dark mode support (future)
- Brand Colors: Sprout green (#16a34a primary), neutral grays, white backgrounds
- Typography: Inter font family
- Iconography: Lucide icons

---

## 9. Technical Architecture

```
+--------------------------------------------------+
|                Chrome Extension                    |
|  +----------+  +----------+  +----------------+  |
|  |  Sidebar |  | Content  |  |   Background   |  |
|  |  (Vue)   |  |  Script  |  |  Service Worker|  |
|  +----+-----+  +----+-----+  +-------+--------+  |
|       |              |                |            |
+-------+--------------+----------------+------------+
        |              |                |
        v              v                v
   +---------+  +-----------+  +--------------+
   | Sprout  |  |   Jira    |  |    Azure     |
   | Design  |  |   Page    |  |  Functions   |
   | System  |  |  Context  |  |  (Backend)   |
   +---------+  +-----------+  +------+-------+
                                      |
                         +------------+------------+
                         |            |            |
                    +----v---+ +-----v----+ +----v-----+
                    |  Jira  | |  Azure   | |  Azure   |
                    |  REST  | | OpenAI   | | Cognitive|
                    |  API   | | (GPT-4o) | |  Search  |
                    +--------+ +----------+ +----------+
```

Key Technical Decisions:
1. Manifest V3 with Side Panel API — sidebar stays open alongside Jira
2. Vue 3 + Vite — for building the sidebar UI
3. Azure OpenAI (GPT-4o) — powers AI investigation chat
4. RAG with Azure Cognitive Search — vector embeddings for semantic ticket matching
5. Azure Functions Proxy — all API calls routed through to avoid CORS and protect secrets
6. Azure AD Auth — SSO via Microsoft Identity Platform

---

## 10. Data Flows

### 10.1 Metrics Dashboard Flow
```
Jira REST API -> Azure Function (aggregate & cache) -> Extension Background Worker -> Sidebar Dashboard
```

### 10.2 AI Investigation Flow (RAG)
```
User asks question in AI chat
  -> Extension sends to Azure Function
  -> Azure Function retrieves ticket context from Jira REST API
  -> Azure Cognitive Search finds top-K related tickets (vector similarity)
  -> Constructs RAG prompt: system instructions + ticket context + related tickets
  -> Azure OpenAI (GPT-4o) generates analysis
  -> Response streamed back to extension chat UI
```

### 10.3 FAQ Content Flow
```
Azure Blob Storage (Markdown/JSON FAQ content) -> Azure Function (serve & cache) -> Extension Sidebar FAQ Panel
```

---

## 11. Security & Compliance

- API Token Storage: Stored in chrome.storage.local (encrypted); never exposed in content scripts
- Azure AD Auth: OAuth 2.0 PKCE flow; tokens refreshed automatically
- AI Data Privacy: Azure OpenAI deployed within Sprout's Azure tenant — no data leaves the tenant boundary
- Data in Transit: All API calls over HTTPS/TLS 1.2+
- Data at Rest: No sensitive data cached locally beyond session; metrics cached in Azure
- AI Guardrails: System prompt constrains AI to EAB domain; responses validated before display
- Permissions: Minimal Chrome permissions: activeTab, storage, identity, sidePanel
- Jira Scoping: API access scoped to EAB project only

---

## 12. Release Plan

### Phase 1 — MVP (Weeks 1-4)
- Week 1: Project scaffolding, Chrome extension skeleton, Azure Function setup, Jira API integration
- Week 2: EAB Metrics Dashboard (all 7 metrics)
- Week 3: Related Tickets search + Workaround display
- Week 4: FAQ panel (all 5 processes) + SSO Quick Investigation

### Phase 2 — Intelligence (Weeks 5-8)
- Week 5: AI chat interface + Azure OpenAI integration
- Week 6: RAG pipeline with vector search, root cause analysis
- Week 7: CA (Customer Advocacy) Tool integration, Escalation Advisor, Issue Trends
- Week 8: Polish, testing, Chrome Web Store submission

### Phase 3 — Future (Backlog)
- Dark mode support
- AI auto-draft Jira comments
- Slack/Teams notifications for critical ticket escalations
- Custom dashboard widgets
- Jira automation rules triggered from extension
- Fine-tuned model on EAB-specific data

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Jira API rate limiting | Medium | High | Azure Function caching layer (15-min TTL) |
| AI hallucination / inaccurate suggestions | High | High | RAG grounds responses in real data; system prompt prevents fabrication; user feedback loop |
| Chrome Manifest V3 breaking changes | Low | Medium | Pin Chrome target version, monitor updates |
| Low adoption by support team | Medium | High | Involve managers in UAT; iterate on feedback |
| Azure OpenAI latency | Medium | Medium | Stream responses; cache common queries; use GPT-4o-mini for simple lookups |
| FAQ content becoming stale | Medium | Medium | CMS-like editing via Azure Blob + admin panel |

---

## 14. Open Questions

1. What is the exact URL pattern for Jira (cloud vs. server)? — Engineering — Open
2. Is the CA (Customer Advocacy) tool a web app or desktop app? Can it be embedded via iframe? — Gaby/Danica — Open
3. What Jira fields/custom fields are used for priority, resolution, and workaround? — Edwin — Open
4. Should the extension work only on Jira pages or across all tabs? — All — Open
5. What is the current average investigation time (baseline for KPI)? — Jona — Open
6. Which Azure OpenAI model/deployment should we use? Is GPT-4o already provisioned? — Engineering — Open
7. How many historical EAB tickets exist for training the vector search index? — Edwin — Open

---

## 15. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| EAB | Escalated Application Bugs — Jira project for L4 support tickets |
| L4 | Level 4 support — highest tier of internal support |
| RAG | Retrieval-Augmented Generation — AI technique that grounds LLM responses in retrieved documents |
| CA Tool | Customer Advocacy Tool — used by CAs for customer advocacy workflows |
| SSO | Single Sign-On |
| HR-PR Linking | Process of linking HR records to Payroll records with SSO |
| Full Sync | Complete data synchronization process from pre-migration to SSO scheduling |
| Lead Time | Time from ticket creation to resolution |
| Cycle Time | Time from work-started to resolution |
| Velocity | Number of tickets completed per sprint/time period |

### B. References

- Sprout Design System (TOGE): https://jolly-rock-0e7e9fa00.5.azurestaticapps.net/en/
- Jira REST API Documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- Chrome Extensions Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Chrome Side Panel API: https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Azure Functions Documentation: https://learn.microsoft.com/en-us/azure/azure-functions/
- Azure OpenAI Documentation: https://learn.microsoft.com/en-us/azure/ai-services/openai/
- MSAL.js Documentation: https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications
