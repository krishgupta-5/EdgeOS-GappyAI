/**
 * lib/pipeline/prompts/docker.ts
 * Docker Compose artifact prompt.
 */

export const IMAGE_MAP_TEXT = `
  postgresql -> postgres:15-alpine
  mongodb    -> mongo:7
  mysql      -> mysql:8
  redis      -> redis:7-alpine
  sqlite     -> keinos/sqlite3:latest
  nodejs     -> node:20-alpine
  express    -> node:20-alpine
  python     -> python:3.11-slim
  go         -> golang:1.22-alpine
  java       -> eclipse-temurin:21-jre-alpine
  spring boot -> eclipse-temurin:21-jre-alpine
  openjdk    -> eclipse-temurin:21-jre-alpine`.trim();

export const DOCKER_PROMPT = `You are a DevOps engineer. Output ONLY a valid docker-compose.yaml. No prose, no markdown fences.

IMAGE MAP — use these exact images based on the db and lang fields in the stack summary:
${IMAGE_MAP_TEXT}

RULES:
- version: "3.8"
- Services: backend service + primary database service only.
- CRITICAL: The database image MUST exactly match the db field in the stack summary.
- Backend image must match the lang field.
- Add environment variables relevant to the stack.
- Add named volumes and depends_on for the database.
- Add a healthcheck for the database service.
- Expose the correct ports (from the stack summary).
- Output raw YAML only. No prose before or after.
- Always end the file with the named volumes block.
- IMPORTANT: Always complete the entire file — never stop mid-block.`;
