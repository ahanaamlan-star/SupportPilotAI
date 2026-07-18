# SupportPilot AI ✈️🤖
### *The Ultimate AI-Powered Co-Pilot for Enterprise Customer Support Teams*

[![Vite](https://img.shields.io/badge/Vite-B736FF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-8E75FF?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**SupportPilot AI** is a professional, high-fidelity, full-stack virtual support co-pilot designed to accelerate enterprise incident resolution, prevent SLA breaches, and automate repetitive customer support workflows. Supercharged with Gemini models via the Google GenAI SDK and engineered with a robust local-first persistence architecture, SupportPilot AI serves as the command center for enterprise support representatives.

---

## 🎯 Problem Statement
Enterprise support operations suffer from several acute pain points:
1. **Agent Burnout:** High ticket volumes and manual diagnostic routing lead to fatigue and inconsistent support quality.
2. **Prolonged MTTR (Mean Time to Resolution):** Troubleshooting complex SaaS configurations, database performance lags, and SAML redirect loops takes precious minutes that agents spend digging through disjointed documentation.
3. **SLA Breach Threats:** Premium Tier-1 clients require rapid, professional, and accurate technical feedback within strictly monitored response windows.
4. **Stale Knowledge Bases:** Excellent troubleshooting steps are discovered during customer chats but are rarely documented back into the official knowledge repository.

---

## 💡 The Solution
**SupportPilot AI** streamlines enterprise support workflows through a cohesive, beautifully responsive workspace:
* **Generative SLA Summaries:** Synthesizes chaotic technical client logs into structured "Audit Checklist Sheets" highlighting root causes, critical threat levels, and drafting polite apologies in seconds.
* **Instant Pilot-Assist & Floating Co-Pilot:** A lightweight, persistent AI helper floating alongside the active workspace to quickly compose copy-ready draft responses, answer technical policies, and formulate step-by-step guides with zero context-switching.
* **Local-First & Sync Persistence:** Zero database-configuration requirement. All chat conversations, custom Knowledge Base articles, ticket state changes, recent search queues, visual layout settings, and operational analytics logs are preserved securely inside the browser's `localStorage` across refreshes, with automatic server-side runtime cache synchronization.
* **Sandbox Analytics Simulator:** An interactive analytics suite with a built-in "Operational Scenario Selector" (Normal, Traffic Surge, AI Autopilot, Cloud Outage) to model system load, audit incident workflows, and export logs to CSV.

---

## 🌌 Feature Deep Dive

### 1. Command Center Dashboard
* **SLA Queue Volume Tracker:** Live monitoring cards displaying Queue Volume, Active Open Cases, Urgent Escalations (SLA threats), Average Response Times, and interactive CSAT Ratings.
* **Instant Search & Filter Array:** Search tickets dynamically by customer name, ticket ID, or subject. Apply instant status filters (`Open`, `Pending`, `Resolved`) and priority indicators (`Low`, `Medium`, `High`, `Urgent`) on a clean glassmorphic grid.
* **Dynamic Loading Skeletons:** Animated state transitions during active search queries for a smooth SaaS feel.

### 2. SLA Diagnostic Audit & Advanced Summary
* Select any active ticket to instantly view technical metadata, diagnostic timestamps, and historical telemetry.
* **Launch Audit Compilation:** Triggers a server-side Gemini invocation to analyze error severity, perform root-cause diagnostics, compile troubleshooting checklists, and prepare automated, polite apologize-and-explain responses.

### 3. Knowledge Base Hub
* Interactive, filterable Knowledge Base categorized by `Security`, `API & Config`, `Database`, and `Billing`.
* Quick search inputs with **Saved Search History Tags** so support agents can keep track of recent complex queries.
* **Add New Custom Guidelines:** Agents can publish troubleshooting steps back into the local-first KB instantly.

### 4. Floating Pilot-Assist Widget
* A persistent, elegant, floating chat bubble that remains active across all workspace views.
* Supports **real-time streaming** of responses with a professional support tone constraint.
* Clean Markdown rendering, quick reset shortcuts, and live streaming placeholder states.

### 5. Workspace Sandbox Analytics
* Interactive graphs plotting ticket frequencies, priority distribution grids, and team workload splits.
* **SaaS Outage & Surge Simulation:** Model operational efficiency metrics under peak loads with instant simulated visual fluctuations.
* **Operational Event Audit Logs:** A scrolling real-time system ledger logging all metric filters, custom mock report exports, and telemetry refreshes.

---

## 📐 System Architecture

```
                               ┌────────────────────────────────┐
                               │     SupportPilot Dashboard     │
                               └────────────────┬───────────────┘
                                                │ (React Router)
                      ┌─────────────────────────┼────────────────────────┐
                      ▼                         ▼                        ▼
           ┌──────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
           │   SLA Diagnostics    │  │   Knowledge Base     │  │  Interactive Chat  │
           └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬──────────┘
                      │                         │                        │
                      ▼                         ▼                        ▼
         ┌─────────────────────────────────────────────────────────────────────────┐
         │                    Browser Storage Layer (Local-First)                  │
         │  - supportpilot_tickets            - supportpilot_kb_articles           │
         │  - supportpilot_recent_searches    - supportpilot_chat_history          │
         │  - supportpilot_settings           - supportpilot_analytics_history     │
         └────────────────────────────────────┬────────────────────────────────────┘
                                              │ (Sync API Posts)
                                              ▼
                             ┌──────────────────────────────────┐
                             │       Node.js Express Server     │
                             └────────────────┬─────────────────┘
                                              │ (Google GenAI Stream SDK)
                                              ▼
                             ┌──────────────────────────────────┐
                             │       Gemini 3.5 Flash / Pro     │
                             └──────────────────────────────────┘
```

---

## ⚙️ Tech Stack
* **UI/UX Core:** React 18+, Vite, TypeScript
* **Styling Framework:** Tailwind CSS with custom smooth transition variables and dark/light system state modifiers.
* **Motion & Animation:** `lucide-react` icons, custom micro-interactions, CSS keyframes, and pulse loading placeholders.
* **Data Visualizers:** `recharts` & `d3`
* **Backend Runtime:** Express, Node.js (bundled with `esbuild` to support high-performance CommonJS deployment).
* **LLM Engine:** `@google/genai` (Official Google GenAI SDK, defaulting to `gemini-3.5-flash`).

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18.x or above)
* **npm** (v9.x or above)
* **Gemini API Key:** Obtain an API key from Google AI Studio.

### Local Installation

1. **Clone the project repository:**
   ```bash
   git clone https://github.com/your-username/supportpilot-ai.git
   cd supportpilot-ai
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   # .env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Launch the Local Development Server:**
   ```bash
   npm run dev
   ```
   *The application will boot up at `http://localhost:3000`.*

5. **Build for Production:**
   ```bash
   npm run build
   ```
   *Produces a highly optimized bundle at `dist/` and compiles `server.ts` to `dist/server.cjs`.*

---

## 🖥️ Screen Mockups & Visual Flow

### 📊 Dashboard & SLA Queue Manager
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ✈️ SupportPilot AI          [ Search queue... (Enter to save) ]  🌓 Dark/Light      │
├─────────────────┬───────────────────────────────────────────────────────────────────┤
│ 📋 Dashboard    │  Command Center | Active ──────────────────────────────────────── │
│ 💬 Pilot Chat   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│ 🎫 Ticket Audit │  │ Queue Vol: 8 │  │ Open Case: 4 │  │ Urgent: 2    │  │ CSAT: 96%  │ │
│ 📚 Knowledge    │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│ 📈 Analytics    │                                                                   │
│ ⚙️ Settings     │  Incident Caseload Grid                                           │
│                 │  [  SAML redirect loop on enterprise login...  ] [ Priority: High ]│
└─────────────────┴───────────────────────────────────────────────────────────────────┘
```

### 💡 Floating Quick-Copilot Widget
*Accessible instantly via the bottom-right purple robot button, opening a slide-out assistant that maintains its state across navigation changes.*

---

## 📈 Future Scope
1. **Multimodal Audio Diagnostics:** Leverage Gemini Live API to let support agents voice-dictate summaries or auto-record audio calls for instant diagnostic translation.
2. **Real-time Webhook Integration:** Connect directly with Jira, Zendesk, or Slack to ingest enterprise incident alerts and push auto-drafted customer updates out automatically.
3. **Smart Embeddings Semantic Search:** Migrate the standard local storage search engine into an in-browser vector store (using ONNX or WebAssembly) for lightning-fast semantic KB lookups.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

