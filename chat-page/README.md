# ProdMate — AI Workspace & Generation Dashboard (Port 3001)

This directory contains the Next.js core application for **ProdMate**, the AI-powered product development planning workspace.

## Documentation & Guide
For comprehensive setup instructions, architecture overviews, and step-by-step guides on connecting external integrations (GitHub, Notion, Jira, Gmail, Google Calendar), please see our main documentation in the repository root:

- **[Main Project README](../README.md)**: Architectural summary, tech stack, and environment configuration.
- **[Complete User Guide & Integration Docs (DOCS.md)](../DOCS.md)**: Authoritative 7-chapter reference guide for builders and teams.

## Local Development
To run this application standalone:
```bash
cp .env.example .env.local # Or copy from root .env.local
npm install
npm run dev # Starts on http://localhost:3001
```