<div align="center">

# ProdMate — Complete User Guide & Integration Documentation

### Your authoritative, step-by-step guide to generating software blueprints, managing modular AI pipelines, and automating real-world developer workflows with ProdMate.

---

[![ProdMate](https://img.shields.io/badge/ProdMate-AI%20Workspace-8678F9?style=for-the-badge)]()
[![Documentation](https://img.shields.io/badge/Documentation-v1.0.0-blue?style=for-the-badge)]()
[![Integrations](https://img.shields.io/badge/Integrations-GitHub%20%7C%20Notion%20%7C%20Jira%20%7C%20Google-38BDF8?style=for-the-badge)]()

</div>

---

## Table of Contents (Index)

1. [Getting Started with ProdMate](#1-getting-started-with-prodmate)
   - [1.1 Workspace Overview & Architecture](#11-workspace-overview--architecture)
   - [1.2 User Authentication & Role Setup (Clerk)](#12-user-authentication--role-setup-clerk)
   - [1.3 Navigating the Dual-Portal Interface](#13-navigating-the-dual-portal-interface)
2. [Step-by-Step Blueprint Generation](#2-step-by-step-blueprint-generation)
   - [2.1 Structuring Effective Natural Language Prompts](#21-structuring-effective-natural-language-prompts)
   - [2.2 Understanding the 9 Modular Artifact Pipelines](#22-understanding-the-9-modular-artifact-pipelines)
   - [2.3 Real-Time Blueprint Generation & Token Usage](#23-real-time-blueprint-generation--token-usage)
3. [Deep-Dive into Generation Artifacts](#3-deep-dive-into-generation-artifacts)
   - [3.1 Product Documentation (PRDs & Specs)](#31-product-documentation-prds--specs)
   - [3.2 Roadmaps & User Stories](#32-roadmaps--user-stories)
   - [3.3 Database Schema Generation & Indexing](#33-database-schema-generation--indexing)
   - [3.4 REST API Design & HTTP Protocols](#34-rest-api-design--http-protocols)
   - [3.5 System Architecture & Mermaid.js Diagrams](#35-system-architecture--mermaidjs-diagrams)
   - [3.6 Recommended Folder Structure](#36-recommended-folder-structure)
   - [3.7 DevOps: Docker Compose & CI/CD Pipelines](#37-devops-docker-compose--cicd-pipelines)
   - [3.8 Testing Strategy & QA Plan](#38-testing-strategy--qa-plan)
   - [3.9 Final Unified Blueprint Package](#39-final-unified-blueprint-package)
4. [Interactive AI Project Assistant](#4-interactive-ai-project-assistant)
   - [4.1 Chatting with Your Blueprint Context](#41-chatting-with-your-blueprint-context)
   - [4.2 Iterating on Architecture & Schemas without Regenerating](#42-iterating-on-architecture--schemas-without-regenerating)
5. [Multi-Channel Exporter & Integration Guide](#5-multi-channel-exporter--integration-guide)
   - [5.1 Quick-Start: How to Connect Any App in 3 Simple Steps](#51-quick-start-how-to-connect-any-app-in-3-simple-steps-user-friendly-guide)
   - [5.2 GitHub Integration: Automated Repo Creation & Code Export](#52-github-integration-automated-repo-creation--code-export)
   - [5.3 Notion Integration: Workspace Documentation Sync](#53-notion-integration-workspace-documentation-sync)
   - [5.4 Jira Integration: Automated Epics & Sprint Ticket Creation](#54-jira-integration-automated-epics--sprint-ticket-creation)
   - [5.5 Gmail Integration: Stakeholder Status Notifications](#55-gmail-integration-stakeholder-status-notifications)
   - [5.6 Google Calendar Integration: Roadmap & Sprint Scheduling](#56-google-calendar-integration-roadmap--sprint-scheduling)
6. [Advanced Settings & Token Quota Management](#6-advanced-settings--token-quota-management)
   - [6.1 Configuring OAuth API Credentials](#61-configuring-oauth-api-credentials)
   - [6.2 Managing High-Throughput Per-Artifact Groq API Keys](#62-managing-high-throughput-per-artifact-groq-api-keys)
   - [6.3 Firebase Firestore Project Storage & Management](#63-firebase-firestore-project-storage--management)
7. [Troubleshooting & FAQ](#7-troubleshooting--faq)

---

# 1. Getting Started with ProdMate

## 1.1 Workspace Overview & Architecture
ProdMate is designed as an AI-powered co-pilot that replaces manual technical writing before writing code. Unlike monolithic AI tools that attempt to generate entire codebases at once (often resulting in timeouts or hallucinations), ProdMate utilizes a **decoupled, modular architecture**. 

When you submit a software idea, ProdMate routes the prompt through dedicated controllers in the backend (`chat-page/lib/pipeline/`), generating **9 distinct planning artifacts** independently.

```text
User Prompt ──► Slim API Controller ──► Decoupled Pipeline ──► 9 Independent Technical Artifacts
```

## 1.2 User Authentication & Role Setup (Clerk)
ProdMate uses **Clerk** for secure user identity, session management, and authentication.
1. Navigate to the login screen by clicking **Start Planning** on the landing page or directly visiting `/login`.
2. Sign in using **Google OAuth**, **GitHub OAuth**, or standard email/password credentials.
3. Upon registration, your user session is synchronized with Firebase Firestore via server-side verification (`lib/auth.ts`), provisioning your secure cloud workspace and initial token quota.

## 1.3 Navigating the Dual-Portal Interface
ProdMate operates across two primary portals:
- **Landing Page Portal (Port `3000`)**: The public marketing interface showcasing features, pricing tiers, interactive particle animations, and direct entry points to the AI workspace.
- **AI Workspace Dashboard (Port `3001`)**: The core application where you manage software projects, view generated blueprints, interact with the AI assistant, and trigger multi-platform exporters.

---

# 2. Step-by-Step Blueprint Generation

## 2.1 Structuring Effective Natural Language Prompts
You do not need to write technical specifications—simply describe your application idea in plain English. However, for maximum architectural accuracy, follow this prompt structure:

> **Formula**: *[Core Product Idea]* + *[Key Features]* + *[Preferred Tech Stack]* + *[Target Audience / Scale]*

**Example Prompt**:
> *"Build an AI-powered bookmark and knowledge management app for developers. Key features include automatic web scraping, semantic search over saved articles using vector embeddings, full-text search, tag categorization, and workspace sharing. Tech stack should be Next.js App Router, Node.js backend, PostgreSQL with pgvector, and TailwindCSS."*

## 2.2 Understanding the 9 Modular Artifact Pipelines
Once you submit your prompt, ProdMate triggers 9 concurrent generation pipelines:
1. **Product Specs (PRD)**: Establishes business goals, user personas, and core requirements.
2. **Tech Config**: Evaluates language suitability and recommends infrastructure.
3. **Database Schema**: Designs relational tables, columns, constraints, and indexes.
4. **API Design**: Maps out RESTful HTTP endpoints, JSON request/response structures, and auth headers.
5. **Folder Structure**: Outlines idiomatic directory trees for the project repo.
6. **Docker Compose**: Builds production-ready containerization configs.
7. **CI/CD Pipeline**: Creates GitHub Actions automation workflows.
8. **Testing Plan**: Defines unit, integration, and end-to-end (E2E) testing matrices.
9. **Unified Blueprint**: Combines all outputs into a master Markdown document.

## 2.3 Real-Time Blueprint Generation & Token Usage
- Generation progress is tracked in real-time on your dashboard.
- Because each artifact runs in its own pipeline, if you wish to regenerate only the **Database Schema**, you can do so instantly without consuming tokens or time regenerating the other 8 artifacts.
- Token consumption is monitored via `lib/token-quota.ts`, and quotas are displayed on your dashboard header.

---

# 3. Deep-Dive into Generation Artifacts

## 3.1 Product Documentation (PRDs & Specs)
The PRD artifact provides a comprehensive architectural charter for your software:
- **Executive Summary & Value Proposition**
- **Target User Personas & Pain Points**
- **Functional Requirements (P0, P1, P2 Priorities)**
- **Non-Functional Requirements (Performance, Security, SLA targets)**

## 3.2 Roadmaps & User Stories
Translates product goals into actionable engineering milestones:
- **Phased Roadmap**: Pre-alpha setup, MVP core development, Beta testing, and Production launch.
- **Sprint-Ready User Stories**: Formatted as *"As a [user persona], I want [feature] so that [benefit]"* accompanied by clear **Acceptance Criteria**.

## 3.3 Database Schema Generation & Indexing
Generates ready-to-implement relational database architecture:
- **Table Definitions**: Table names, column names, SQL data types (`VARCHAR`, `UUID`, `TIMESTAMP`, `JSONB`), and nullability constraints.
- **Key Relationships**: Clear Primary Key (`PK`) and Foreign Key (`FK`) mappings.
- **Indexing Recommendations**: Suggestions for B-Tree, GIN, or Hash indexes to optimize high-frequency queries.

## 3.4 REST API Design & HTTP Protocols
Provides backend developers with a complete API contract:
- **Endpoint Routes & Methods**: E.g., `POST /api/v1/bookmarks/scrape`, `GET /api/v1/search?q=...`.
- **Authentication Protocols**: Specifies Bearer tokens, API keys, or session cookies.
- **Request / Response Payloads**: Complete JSON body schemas with example data and HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`).

## 3.5 System Architecture & Mermaid.js Diagrams
ProdMate automatically generates visual system diagrams using **Mermaid.js**:
- Visualizes data flow from Client Browser ──► CDN / Edge ──► API Gateway ──► Microservices / Serverless Functions ──► Database & Vector Store.
- Diagrams are rendered interactively in your browser and can be exported as PNGs or raw Mermaid markdown blocks.

## 3.6 Recommended Folder Structure
Prevents structural chaos by generating standard, idiomatic directory layouts tailored to your selected framework (e.g., Next.js App Router monorepos, Express microservices, or Django modular apps).

## 3.7 DevOps: Docker Compose & CI/CD Pipelines
- **Dockerfile**: Optimized multi-stage build instructions ensuring lightweight container images.
- **docker-compose.yml**: Pre-configured services tying together your frontend, backend API, database instance (e.g., Postgres), and caching layer (e.g., Redis).
- **GitHub Actions (`.github/workflows/ci.yml`)**: Automated pipelines for running linters, unit test suites, and deploying to cloud providers (Vercel, AWS, GCP).

## 3.8 Testing Strategy & QA Plan
Provides QA engineers and developers with a structured test matrix:
- **Unit Testing**: Focus areas for isolated function and component testing.
- **Integration Testing**: API endpoint verification and database mock testing.
- **E2E Testing**: Critical user journey automation (e.g., Cypress or Playwright flows).

## 3.9 Final Unified Blueprint Package
A consolidated master document containing all 8 artifacts cleanly formatted in standard Markdown. Perfect for sharing with stakeholders, investors, or attaching as the root `README.md` of a new repository.

---

# 4. Interactive AI Project Assistant

## 4.1 Chatting with Your Blueprint Context
ProdMate features an embedded conversational assistant (`chat-page/lib/chat/`) located on the right panel of your workspace dashboard.
- The assistant maintains deep context over your newly generated 9 artifacts.
- You can ask natural questions like: *"Why did you choose PostgreSQL over MongoDB for this project?"* or *"How can we secure the bookmark scraping endpoint against SSRF attacks?"*

## 4.2 Iterating on Architecture & Schemas without Regenerating
Instead of regenerating an entire project when requirements shift slightly, use the AI Assistant to iterate:
1. Open the Chat Panel.
2. Type your modification request: *"Add an `is_favorite` boolean column and a `tags` array column to the bookmarks table in our database schema."*
3. The AI Assistant will output the updated SQL schema snippet and explain how it impacts your REST API endpoints.

---

# 5. Multi-Channel Exporter & Integration Guide

ProdMate bridges the gap between AI planning and real-world execution. All integrations are controlled via the **Export Toolbar** in your project workspace.

```text
                                  ┌──► GitHub Repo (Folder Tree, Docker, Docs)
                                  │
                                  ├──► Notion Workspace (Formatted Pages & Tables)
                                  │
ProdMate Project Workspace ───────┼──► Jira Cloud (Epics, Stories & Sprint Tasks)
                                  │
                                  ├──► Gmail API (Executive Status Summaries)
                                  │
                                  └──► Google Calendar (Roadmap Milestone Deadlines)
```

---

## 5.1 Quick-Start: How to Connect Any App in 3 Simple Steps (User-Friendly Guide)

Connecting external tools like GitHub, Notion, Jira, Gmail, or Google Calendar takes less than **30 seconds**. No coding or manual API key entry required—just click, authorize, and export!

### Step 1: Open Your Project Workspace
Once your blueprint is generated, look at the **Top Export Toolbar** in your dashboard. You will see action buttons for all supported apps:
`[ Export to GitHub ]`  `[ Sync to Notion ]`  `[ Export to Jira ]`  `[ Notify via Gmail ]`  `[ Schedule Sprints ]`

### Step 2: Click to Connect (One-Click Sign-In)
Click on any tool you want to connect (for example, **Notion** or **GitHub**).
- A secure pop-up window will appear asking you to log into your account (e.g., your GitHub account or Google Workspace).
- Click **"Allow / Authorize"**. That's it! ProdMate is now securely linked to your account.

### Step 3: Choose Your Options & Watch the Magic!
Once connected, a friendly menu will ask what you want to do:
- **For GitHub**: Type your new repo name (e.g., `my-awesome-app`) and choose **Public** or **Private**. Click **Create Repository**. Within 5 seconds, your entire project folder structure, Docker files, and README are live on GitHub!
- **For Notion**: Pick your Notion workspace page and click **Sync Docs**. Your PRDs, roadmaps, and architecture tables instantly turn into clean, organized Notion pages!
- **For Jira**: Select your Jira Project (e.g., `MVP`). Click **Generate Tickets**. ProdMate automatically creates an Epic and populates your Sprint Board with estimated User Stories!
- **For Gmail**: Type your team's or client's email address and click **Send**. An automated executive summary with the blueprint is delivered immediately!
- **For Google Calendar**: Select your start date and click **Schedule Sprints**. All your sprint review meetings and milestone deadlines are automatically added to your calendar!

---

## 5.2 GitHub Integration: Automated Repo Creation & Code Export
Powered by **`@octokit/rest`** (`lib/github/exporter.ts`), this integration turns your blueprint into a live GitHub repository.

### Prerequisites
- In your `.env.local`, ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are configured.
- Ensure your GitHub OAuth application has `repo` and `workflow` scopes enabled.

### Step-by-Step Usage
1. In your generated project workspace, click the **Export to GitHub** button in the top toolbar.
2. If not already connected, you will be redirected to GitHub to authorize the ProdMate OAuth app (`/api/github/callback`).
3. A modal will prompt you to enter:
   - **Repository Name**: E.g., `ai-bookmark-manager`.
   - **Visibility**: Select **Public** or **Private**.
   - **Description**: Auto-populated from your Product Summary.
4. Click **Create & Push Repository**.
5. **What happens behind the scenes**:
   - ProdMate initializes a new repository on your GitHub account.
   - It generates the full directory tree defined in your **Folder Structure** artifact.
   - It creates and commits the `Dockerfile`, `docker-compose.yml`, and `.github/workflows/ci.yml` files.
   - It writes the **Final Unified Blueprint** as the repository's root `README.md`.
   - You receive a direct link to your newly created live repository!

---

## 5.3 Notion Integration: Workspace Documentation Sync
Powered by **`@notionhq/client`** (`lib/notion/exporter.ts`), this integration synchronizes your technical blueprints directly into your team's Notion workspace.

### Prerequisites
- Create an internal integration in the [Notion Developers Portal](https://www.notion.so/my-integrations).
- Copy the integration token to `NOTION_TOKEN` in your `.env.local`.
- Share your target Notion parent page with your integration and copy its page ID to `NOTION_ROOT_PAGE_ID`.

### Step-by-Step Usage
1. Click the **Export to Notion** button in the project toolbar.
2. Select target export sections (e.g., PRD, Database Schema, API Specifications, Roadmap).
3. Click **Sync to Notion Workspace**.
4. **What happens behind the scenes**:
   - ProdMate connects to your Notion workspace via the REST API.
   - It creates a dedicated child page named after your project (e.g., *📁 Blueprint: AI Bookmark Manager*).
   - It converts raw Markdown tables into native **Notion Tables**, Mermaid diagrams into formatted code blocks, and user stories into interactive toggle lists.

---

## 5.4 Jira Integration: Automated Epics & Sprint Ticket Creation
Powered by direct **Jira Cloud REST API** calls (`lib/jira/exporter.ts`), this integration automates sprint planning by transforming user stories into Jira tickets.

### Prerequisites
- Obtain a Jira API Token from [Atlassian Account Security](https://id.atlassian.com/manage-profile/security/api-tokens).
- Configure `JIRA_CLIENT_ID`, `JIRA_CLIENT_SECRET`, and your Jira instance URL in `.env.local`.

### Step-by-Step Usage
1. Click the **Export to Jira** button in the workspace toolbar.
2. Authorize via Atlassian OAuth (`/api/jira/callback`).
3. Select your target **Jira Project Key** (e.g., `ENG`, `PROD`, `MVP`).
4. Select ticket hierarchy preferences (e.g., Create 1 parent Epic for the project, and attach Stories as child issues).
5. Click **Generate Sprint Tickets**.
6. **What happens behind the scenes**:
   - ProdMate parses the **User Stories & Roadmap** artifact.
   - It creates a parent **Epic** representing the overall project feature set.
   - For every user story, it generates a standard **Story** issue under the Epic, formatting Acceptance Criteria into the ticket description and assigning estimated story points based on feature complexity.

---

## 5.5 Gmail Integration: Stakeholder Status Notifications
Powered by **Google Workspace OAuth via Gmail API** (`lib/gmail/exporter.ts`), keep your engineering team and stakeholders updated.

### Step-by-Step Usage
1. Click the **Notify via Gmail** action icon in the workspace header.
2. Authorize your Google Account (`/api/gmail/callback`).
3. Enter recipient email addresses (comma-separated for team members, founders, or clients).
4. Customize the automated subject line and executive summary note.
5. Click **Send Blueprint Summary**.
6. **What happens behind the scenes**:
   - ProdMate compiles an HTML formatted executive summary highlighting project milestones, tech stack choices, and core APIs.
   - The complete Markdown blueprint is attached or embedded cleanly into the email body, delivered directly from your verified Google email address.

---

## 5.6 Google Calendar Integration: Roadmap & Sprint Scheduling
Powered by **Google Workspace OAuth via Calendar API** (`lib/calendar/exporter.ts`), turn static timelines into scheduled calendar commitments.

### Step-by-Step Usage
1. Click the **Schedule on Calendar** button in the roadmap artifact view.
2. Authorize via Google OAuth (`/api/google-calendar/callback`).
3. Select your target project start date and sprint duration (e.g., 2-week sprints).
4. Click **Sync Roadmap Deadlines**.
5. **What happens behind the scenes**:
   - ProdMate reads the phased milestones from your **Roadmap** artifact.
   - It automatically books calendar events on your primary Google Calendar for **Sprint Kickoff Meetings**, **Mid-Sprint Check-ins**, **Code Freeze Deadlines**, and **Final MVP Review Demos**, inviting any team members specified in your workspace.

---

# 6. Advanced Settings & Token Quota Management

## 6.1 Configuring OAuth API Credentials
All integrations rely on standard OAuth 2.0 or secure token authentication. In your project root `.env.local`, ensure your callback redirect URIs match your deployment domain:
- **Local Development**: `http://localhost:3000/api/<provider>/callback`
- **Production (Vercel / Cloud)**: `https://your-prodmate-domain.com/api/<provider>/callback`

## 6.2 Managing High-Throughput Per-Artifact Groq API Keys
To prevent rate-limiting when generating 9 comprehensive artifacts concurrently, ProdMate's backend supports **dedicated API keys per artifact** (`.env.local`):
```env
GROQ_API_KEY_MARKDOWN=gsk_dedicated_key_1...
GROQ_API_KEY_APIDESIGN=gsk_dedicated_key_2...
GROQ_API_KEY_FOLDERSTRUCTURE=gsk_dedicated_key_3...
GROQ_API_KEY_DOCKER=gsk_dedicated_key_4...
```
If an artifact-specific key is not provided, the system gracefully falls back to the master `GROQ_API_KEY` or `GEMINI_API_KEY`.

## 6.3 Firebase Firestore Project Storage & Management
Your projects are automatically synced to Firebase Firestore (`lib/firebase-admin.ts`).
- **Data Privacy**: Each user's projects are isolated by their authenticated Clerk User ID (`userId`).
- **Project Deletion**: Deleting a project from your dashboard permanently purges the associated Firestore document and generated artifact logs.

---

# 7. Troubleshooting & FAQ

### Q1: My blueprint generation timed out or paused on one artifact. What should I do?
**Answer**: Because ProdMate uses decoupled pipelines, an issue with one artifact does not corrupt the others. Simply hover over the paused artifact tab (e.g., *Docker Compose*) and click the **Regenerate** button. Only that specific module will rerun.

### Q2: When exporting to GitHub, I get a "Permission Denied" error.
**Answer**: This occurs if your GitHub OAuth token has expired or lacks the `repo` scope. Go to **Settings ──► Integrations**, disconnect your GitHub account, and click **Connect GitHub** again to grant full repository creation permissions.

### Q3: How do I share a generated blueprint with someone who doesn't have a ProdMate account?
**Answer**: You can use either:
1. The **Export to Markdown** button to download a standalone `.md` file.
2. The **Notion Sync** exporter to publish the blueprint to a public or team-shared Notion page.

### Q4: Can I use local LLMs (Ollama / Llama 3) instead of Groq or Gemini?
**Answer**: Yes! ProdMate's AI controller (`lib/pipeline/`) is modular. You can configure your custom base URL in the environment variables or route generation requests to a local proxy running Llama 3 or DeepSeek.

---

<div align="center">

### Happy Building! From Idea to Execution with ProdMate.

If you have any questions or need support, reach out to **Team Hustler's** or open an issue on our GitHub repository.

</div>
