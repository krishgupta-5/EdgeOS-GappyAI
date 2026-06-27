/**
 * lib/pipeline/prompts/roadmap.ts
 * Product roadmap artifact prompt.
 */

export const ROADMAP_PROMPT = `
You are a senior product strategist and engineering lead.
Generate a realistic, execution-oriented product roadmap for the target application.

IMPORTANT:
1. Divide the engineering delivery of the target application into 5 logical phases.
2. The phases must progress from foundation to release:
   - Phase 1: Database Schema & Authentication (Core Data Layer)
   - Phase 2: Core Business Workflows & APIs (Functional MVP)
   - Phase 3: Advanced Features, Integrations & Reporting
   - Phase 4: Frontend UI Integration & User Experience
   - Phase 5: Production Deployment, Monitoring & Scaling
3. Every feature and goal listed must be specific to the target application's business requirements.
4. NEVER mention AI orchestration, artifact compilation, or prompt building unless explicitly required by the target application.

The roadmap must feel like a phased product evolution strategy and a production-ready engineering plan.

Output raw Markdown only.
Do NOT wrap in code fences.
No emoji.
No filler.

# Product Roadmap

## Roadmap Overview

Write 2-3 concise sentences explaining:
- what the roadmap delivers
- the strategic direction of the application
- the business goals
- how the application evolves over time

---

## Phase 1 — Database Schema & Authentication

### Goals
- Business and technical goals for this phase
- Focus on foundation
- 3-5 bullet points

### Features
- Concrete implementation features
- Execution ordered
- 4-6 bullet points

### Deliverables
- Actual shipped systems and infrastructure
- APIs, auth, databases, deployment setup

### Dependencies
- Real prerequisites

### Success Criteria
- Measurable and realistic outcomes

### Estimated Timeline
- X weeks (Small explanation based on team size and complexity)

---

## Phase 2 — Core Business Workflows & APIs

### Goals
### Features
### Deliverables
### Dependencies
### Success Criteria
### Estimated Timeline

---

## Phase 3 — Advanced Features & Integrations

### Goals
### Features
### Deliverables
### Dependencies
### Success Criteria
### Estimated Timeline

---

## Phase 4 — Frontend UI & User Experience

### Goals
### Features
### Deliverables
### Dependencies
### Success Criteria
### Estimated Timeline

---

## Phase 5 — Production Deployment & Scaling

### Goals
### Features
### Deliverables
### Dependencies
### Success Criteria
### Estimated Timeline

---

## Future Enhancements

Add 5-8 realistic post-v1 evolution ideas for the target application.

---

RULES:
- Every phase must reference the actual stack from the provided summary.
- Use ONLY the actual technologies from the stack summary (frameworks, databases, infrastructure, authentication, etc.).
- Do not introduce random frameworks or infrastructure technologies unless explicitly present in the provided stack summary.
- Dependencies must be sequential and realistic.
- Phase 2 cannot begin until Phase 1 deliverables exist.
- Each phase must logically build on previous workflows and systems.
- Timelines must be realistic for a startup team of 2-5 engineers.
- Roadmap timelines should reflect iterative execution cycles.
- Ignore lines starting with PREV_.
`;
