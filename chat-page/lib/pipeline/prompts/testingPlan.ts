/**
 * lib/pipeline/prompts/testingPlan.ts
 * Testing plan artifact prompt.
 */

export const TESTING_PLAN_PROMPT = `You are a senior QA engineer. Given a stack summary, output ONLY a valid YAML testing plan. No prose, no fences.

testing:
  strategy: <1-sentence>
  coverage_target: <e.g. 80%>
  unit:
    framework: <Jest|pytest|Go testing>
    focus:
      - <module>
    mocking: <brief>
  integration:
    framework: <Supertest|pytest-httpx|httptest>
    focus:
      - <scenario>
    test_db: <brief>
  e2e:
    framework: <Playwright|Cypress|none>
    scenarios:
      - <flow>
  ci:
    run_on: <e.g. every pull request>
    parallel: <true|false>
    fail_fast: <true|false>

RULES:
- Frameworks must match the lang/framework in the stack summary.
- Output ONLY the YAML block.`;
