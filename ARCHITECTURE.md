# AlphaLens AI - Technical Architecture

This document describes the design principles, component architecture, data flow, security model, and agent mechanics of the AlphaLens AI platform. It is formatted for recruiters, developers, and engineering evaluators.

---

## 🏛️ System Overview

AlphaLens AI is an institutional-grade equity research platform combining a modern web frontend, a Node.js API gateway, and a stateful multi-agent AI compiler designed using LangGraph.js and powered by Google Gemini models.

```
       ┌────────────────────────┐
       │   React / Vite Web UI  │
       └───────────┬────────────┘
                   │ HTTPS API (JSON)
                   ▼
       ┌────────────────────────┐
       │   Express.js Backend   │
       └─────┬────────────┬─────┘
             │            │ LangGraph State Machine
             ▼            ▼
      ┌────────────┐┌──────────────┐
      │ MySQL DB   ││ Gemini Multi-│
      │            ││ Agent Engine │
      └────────────┘└──────────────┘
```

---

## 🛠️ Technology Stack

The application is built using a modern, decoupled stack engineered for performance and scalability:

*   **Frontend**:
    *   **React 19**: Responsive component-driven user interface.
    *   **Vite**: Next-generation frontend build tooling.
    *   **React Router v7**: Declarative routing for page navigation.
    *   **Recharts**: Custom responsive SVG charts (Radar, Line, Area projections).
*   **Backend**:
    *   **Node.js**: Asynchronous event-driven runtime environment.
    *   **Express.js**: Lightweight REST API framework.
*   **AI Framework**:
    *   **LangChain.js (`@langchain/core`)**: Abstracted interface for prompts, structured output parsers, and LLM integrations.
    *   **LangGraph.js (`@langchain/langgraph`)**: Stateful, cyclical graph orchestration for managing multi-agent systems.
    *   **Google Gemini AI API (`@langchain/google`)**: Inference engine for reasoning, scraping, and report compilation.
*   **Database**:
    *   **MySQL**: Relational database for structured storage.
    *   **JSON file fallback (`db.json`)**: Local file-based mock database for seamless containerization and zero-config local development.

---

## 🎨 Frontend Architecture

The frontend is structured as a Single Page Application (SPA) focusing on high-fidelity visual representations (dark mode, glassmorphism) and real-time state tracking.

### Core Modules & Pages
*   **Routing (`App.jsx`)**: Manages navigation states across primary views:
    *   `/` - Interactive Landing Page with corporate branding.
    *   `/dashboard` - Mission Control (shows pipeline progress logs, CPU load widgets, and active AI nodes).
    *   `/analysis/:ticker` - Equity analysis reports, dynamic radar competency charts, news sentiment timelines, and key financials.
    *   `/portfolio` - User Portfolio and Watchlists tracker.
    *   `/simulation` - What-If simulation laboratory to project equity trajectories.
*   **Design & Theme System**:
    *   `Variables.css` - Custom CSS design tokens for animations, hover states, HSL colors, and borders.
    *   `Navbar.css` / `Sidebar.css` - Responsive layout styling.
    *   `ShaderCanvas.jsx` - WebGL shader background providing interactive dynamic backdrop visual effects.

---

## ⚙️ Backend Architecture

The backend operates as a REST API gateway and agent compiler, processing client transactions and orchestrating multi-agent state compilation.

### Primary API Endpoints
*   `/api/autocomplete` - Real-time ticker autocomplete searching, returning country flag metadata and exchange markers.
*   `/api/portfolio` - Performs CRUD operations for watchlists and portfolio balances.
*   `/api/simulation` - Computes calculated derived metrics for what-if scenarios.
*   `/api/analysis` - Starts and monitors the real-time Multi-Agent Research Pipeline.

---

## 🤖 Stateful Multi-Agent Orchestration (LangGraph & LangChain)

AlphaLens AI leverages **LangChain.js** to construct modular AI components and **LangGraph.js** to choreograph these modules in a stateful, sequential workflow.

### 1. The Role of LangChain.js
LangChain.js serves as the modular foundation for the AI engine, managing the following core operations:
*   **Prompt Templates**: Constructs structured instruction sets specifying agent personalities, formatting constraints, and input variable injections.
*   **Model Interaction**: Connects to Google Gemini models (`chat-bison` / `gemini-pro`) through standardized interfaces, handling system and human message variables.
*   **Structured Output Parsing**: Utilizes LangChain's output parsers to coerce LLM completions into structured JSON payloads, guaranteeing schema conformity for graphs and metrics tables.
*   **Reusable AI Components**: Abstracts base chains, API keys, and parameter configurations.

### 2. Orchestration via LangGraph.js
LangGraph.js defines a stateful graph where each node represents a LangChain-powered agent. The workflow coordinates data compilation step-by-step:

```
       ┌──────────────────────┐
       │ Ticker Validator     │
       └──────────┬───────────┘
                  ▼
       ┌──────────────────────┐
       │ Financial Collector  │
       └──────────┬───────────┘
                  ▼
       ┌──────────────────────┐
       │ News Scraper         │
       └──────────┬───────────┘
                  ▼
       ┌──────────────────────┐
       │ Competency Evaluator │
       └──────────┬───────────┘
                  ▼
       ┌──────────────────────┐
       │ Investment Analyst   │
       └──────────────────────┘
```

*   **Ticker Validator Node**: Verifies ticker legitimacy and resolves exchange parameters.
*   **Financial Collector Node**: Extracts corporate filings, valuation multiples, and financial indicators.
*   **News Scraper Node**: Gathers public media records and outputs sentiment matrices.
*   **Competency Evaluator Node**: Translates financials into scoring vectors for the radar competency graph.
*   **Investment Analyst Node**: Summarizes all states to produce final investment reports and Buy/Sell/Hold conviction calls.

### 3. Architectural Justification for LangGraph
*   **Shared State Management**: The entire pipeline operates on a single state object containing cumulative research fields, avoiding the complexity of passing variables through deep callback hierarchies.
*   **Sequential Dependency Enforcement**: Upstream data dependencies are guaranteed (e.g. the Financial Collector node requires the normalized ticker outputs produced by the Ticker Validator).
*   **Modularity & Scalability**: The state-graph layout permits developers to append extra nodes (e.g. Technical Indicator or ESG Evaluator agents) without rewriting the primary execution flow.

---

## 🔒 Security Architecture

AlphaLens AI implements strict security paradigms across all components:

*   **Secure Secrets Management**: All sensitive credentials, including the database credentials and the `GEMINI_API_KEY`, are loaded via environment variables (`.env`) and never exposed to client-side code.
*   **SQL Injection Prevention**: All queries to the MySQL database are executed using parameterized statements (via `mysql2`'s `?` placeholders), isolating user inputs from query parsing.
*   **CORS Configuration**: The Express backend uses CORS middleware to configure origins, restricting unauthorized API requests.
*   **Input Validation & Sanitization**: Incoming client payloads (such as ticker query symbols or simulation variables) are validated and sanitized on the server before entering database queries or AI prompts.

---

## ⚡ Performance & Optimization

*   **MySQL Analysis Caching**:
    *   Completed reports are saved in the `analysis_reports` table.
    *   On cache hits, reports are retrieved in sub-milliseconds, bypassing the 3-6 second LangGraph execution path.
    *   Reduces Gemini API token consumption, lowering operational costs and preventing rate-limiting.
*   **Asynchronous Database Operations**: The backend uses non-blocking async/await code paths, preventing thread blocking during heavy read/write operations.
*   **Debounced Autocomplete Requests**: Autocomplete search queries on the frontend are debounced (200ms delay) to limit API requests during typing.
*   **Vite Code Splitting**: Production assets are split into optimized chunks, reducing initial page load times.

---

## 📁 Project Folder Structure

```
AlphaLens/
├── backend/
│   ├── agents/          # LangGraph multi-agent nodes & state definitions
│   ├── controllers/     # Route logic controller handlers (simulation, watchlists)
│   ├── database/        # MySQL configuration, schema.sql, and JSON mock database
│   ├── routes/          # Express route bindings
│   ├── server.js        # Backend entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI widgets (Navbar, Sidebar, Footer, Charts)
│   │   ├── pages/       # Page components (MissionControl, CompanyAnalysis)
│   │   ├── services/    # Axios HTTP client requests config
│   │   ├── styles/      # Modular Vanilla CSS stylesheets
│   │   └── App.jsx      # React router configuration
│   └── package.json
└── README.md
```

---

## 🔄 End-to-End Execution Flow

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ React Frontend  ├──────>│ Express Backend ├──────>│ MySQL DB Cache  │
└────────▲────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │                         │ (Cache Miss)            │ (Cache Hit)
         │                         ▼                         │
         │                ┌─────────────────┐                │
         │                │  LangGraph.js   │                │
         │                │  Agent System   │                │
         │                └────────┬────────┘                │
         │                         │                         │
         │                         ▼                         │
         └─────────────────────────┴─────────────────────────┘
```

1.  **Search Submission**: A user enters a ticker (e.g., `TCS`) in the frontend search bar and hits enter.
2.  **API Routing**: React routes the search query to the Express backend via `GET /api/analysis?ticker=TCS`.
3.  **Cache Verification**: The backend queries the `analysis_reports` table for a pre-existing report.
    *   **Cache Hit**: The cached JSON report is retrieved from MySQL and immediately returned to the frontend.
    *   **Cache Miss**: The backend initializes the LangGraph compilation.
4.  **LangGraph Compilation**:
    *   *Ticker Validator* normalizes the query.
    *   *Financial Collector* extracts key financial variables.
    *   *News Scraper* reviews media stories.
    *   *Competency Evaluator* compiles spider-graph values.
    *   *Investment Analyst* synthesizes the final Buy/Sell conviction verdict.
5.  **Cache Preservation**: The newly compiled analysis report is saved in the `analysis_reports` table for future requests.
6.  **Response & Rendering**: The structured JSON payload is returned to the frontend. React context updates, redrawing Recharts graphs (Spider, Line) and filling dynamic metrics panels for the user.
