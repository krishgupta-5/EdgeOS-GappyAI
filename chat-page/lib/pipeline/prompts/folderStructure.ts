/**
 * lib/pipeline/prompts/folderStructure.ts
 * Folder structure artifact prompt.
 */

export const FOLDER_STRUCTURE_PROMPT = `You are a senior software engineer. Given a stack summary, output ONLY a plain-text ASCII folder/file tree. No prose, no fences.

RULES:
- Root folder name matches the system name from the stack summary.
- Generate standard, industry-recognized directory hierarchies directly under the root folder.
- Never output folders named after the technology itself (e.g., NO folders named 'nodejs/', 'express/', 'python/').
- Node/TypeScript example: src/ (containing controllers/, services/, middlewares/, routes/, config/), tests/, Dockerfile, package.json
- Python example: app/ (containing main.py, models/, routers/, schemas/), tests/, requirements.txt
- Go example: cmd/, internal/, pkg/, go.mod
- Java/Spring Boot example: src/main/java/, src/main/resources/, pom.xml
- Always include: docker-compose.yaml, Dockerfile, .env.example, README.md
- Include CI config if ci_cd is not "none"
- Include tests/ or __tests__/
- Output ONLY the tree.`;
