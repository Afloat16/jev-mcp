import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import {
  JEV_ADVISORY,
  VERSION,
  advisoryPayload,
  criteriaFromOptions,
  normalizeBaseUrl,
  parseEnvFile,
  timeoutMs,
  type JevQuestion,
  type JevResponse,
  type JsonValue,
} from "./core.js";

function loadEnvFile(envPath: string): void {
  if (!existsSync(envPath)) return;
  const parsed = parseEnvFile(readFileSync(envPath, "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function loadEnvironment(): void {
  if (process.env.JEV_ENV_FILE?.trim()) {
    loadEnvFile(process.env.JEV_ENV_FILE.trim());
    return;
  }

  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const projectRoot = resolve(moduleDir, "..");
  const userConfigHome =
    process.env.JEV_MCP_CONFIG_HOME?.trim() || resolve(homedir(), ".jev-mcp");

  // Explicit process environment wins. A checkout-local .env has priority over
  // the global installer-managed credential file.
  loadEnvFile(resolve(projectRoot, ".env"));
  loadEnvFile(resolve(userConfigHome, ".env"));
}

loadEnvironment();

const stateSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
  z.array(z.unknown()),
]);

const SERVER_INSTRUCTIONS = `
Jev is a secondary probabilistic decision service for the active host model.
The model selected by the user remains the primary reasoning, coding, planning, and execution model.
Jev never replaces, overrides, or switches it.

CONSERVATIVE AUTHORITY ORDER
1. Deterministic evidence: compiler/type-checker/linter/test/static-analysis/runtime results and
   documented repository invariants.
2. The active host model's own repository-aware reasoning after inspecting enough context.
3. Jev as an independent advisory signal for a bounded uncertain decision.

The active host model retains final decision authority. Jev probabilities are not facts, guarantees,
or proof. Never follow Jev mechanically merely because one option has the highest probability.

HOST MODEL FIRST, JEV SECOND
- Before calling Jev, inspect enough relevant repository/task context to understand the decision.
- When practical, form a preliminary judgment before calling Jev.
- Keep that preliminary judgment out of the Jev state when possible so Jev can remain a more
  independent second opinion instead of being anchored by the primary model's conclusion.
- Call Jev only when the decision is bounded, genuinely uncertain, and its answer could materially
  change the next action.
- Do not call Jev merely because a task is complex or consequential.
- Never ask Jev whether Jev itself should be used.

WHEN JEV IS USEFUL
- A small explicit set of plausible alternatives remains after inspection.
- Retry vs rollback vs change-strategy vs review/escalation after an ambiguous failure.
- Tool/subsystem/workstream/handling-path routing when evidence does not already decide the route.
- A probabilistic second opinion about risk after the primary model has inspected the relevant
  change and evidence.
- An atomic yes/no gate where a probability threshold genuinely changes what happens next.

DISAGREEMENT PROTECTION
- If Jev conflicts with deterministic evidence, deterministic evidence wins. Ignore the Jev result.
- If Jev conflicts with the primary model's well-supported preliminary judgment, re-inspect the key
  evidence before deciding. Do not automatically switch to Jev's answer.
- For destructive, irreversible, production, security, authorization, or data-loss-sensitive
  actions: unresolved model-vs-Jev disagreement must never be treated as authorization to proceed.
  Prefer a reversible/non-destructive path, obtain stronger evidence, or require review.
- Jev agreement does not waive tests, review, rollback planning, or other safeguards.

TOOL SELECTION
- jev_decide: independent second opinion among a small predefined set of alternatives.
- jev_route: second opinion for tool/subsystem/workflow routing. Never use it to switch the model
  selected by the user.
- jev_risk_score: advisory low/medium/high/critical risk signal after relevant context inspection.
- jev_gate: advisory atomic yes/no probability against an explicit threshold.

DO NOT USE JEV FOR
- Open-ended coding, architecture, debugging, algorithm design, explanation, or prose generation.
- Reading/searching files, formatting, or routine command execution.
- Questions that a compiler, type checker, linter, unit/integration test, static analyzer, runtime
  observation, direct inspection, or other deterministic evidence can answer.
- Trivial or obvious decisions.
- Replacing primary-model reasoning with a cheaper decision call.

PRIVACY
Anything in state is sent to TypeSafe's hosted API. Send only the minimum relevant, preferably
redacted summary. Never send passwords, API keys, access tokens, private keys, secrets, customer
data, or unrelated proprietary code.
`.trim();

function requiredApiKey(): string {
  const key = process.env.TYPESAFE_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "TYPESAFE_API_KEY is not set. Create a TypeSafe API key and expose it to the MCP process.",
    );
  }
  return key;
}

function baseUrl(): string {
  return normalizeBaseUrl(process.env.TYPESAFE_BASE_URL);
}

function defaultModel(): string {
  return process.env.JEV_MODEL?.trim() || "jev-latest";
}

async function callJev(args: {
  state: JsonValue;
  questions: Record<string, JevQuestion>;
  model?: string;
}): Promise<JevResponse> {
  const response = await fetch(`${baseUrl()}/v1/systemone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredApiKey()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": `jev-mcp/${VERSION}`,
    },
    body: JSON.stringify({
      state: args.state,
      model: args.model ?? defaultModel(),
      questions: args.questions,
    }),
    signal: AbortSignal.timeout(timeoutMs(process.env.TYPESAFE_TIMEOUT_MS)),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `TypeSafe API error ${response.status} ${response.statusText}: ${body.slice(0, 2000)}`,
    );
  }

  return (await response.json()) as JevResponse;
}

function textResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

function createServer(): McpServer {
  const server = new McpServer(
    { name: "jev-mcp", version: VERSION },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    "jev_decide",
    {
      title: "Jev Decide",
      description:
        "Use as an independent second opinion only after inspecting enough context when a bounded decision has 2-255 explicit alternatives and genuine uncertainty remains. The active host model keeps final authority; do not mechanically follow Jev or use it for open-ended coding/prose.",
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: z.object({
        state: stateSchema.describe("Minimal relevant state/context for the decision."),
        question: z.string().min(1).describe("One atomic decision question."),
        options: z
          .array(
            z.object({
              id: z.string().min(1),
              description: z.string().nullable().optional(),
            }),
          )
          .min(2)
          .max(255),
        model: z.string().optional().describe("Optional Jev model override."),
      }),
    },
    async ({ state, question, options, model }) => {
      try {
        const result = await callJev({
          state: state as JsonValue,
          model,
          questions: {
            decision: {
              type: "choice",
              instructions: question,
              criteria: criteriaFromOptions(options),
            },
          },
        });
        return textResult(advisoryPayload(result));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "jev_route",
    {
      title: "Jev Route",
      description:
        "Use as a second opinion for uncertain routing among a fixed set of tools, subsystems, workstreams, or handling paths only when deterministic evidence does not already decide the route. Never changes the user-selected host model.",
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: z.object({
        state: stateSchema.describe("Task state and only the context relevant to routing."),
        objective: z.string().min(1).describe("What the routing decision should optimize for."),
        candidates: z
          .array(
            z.object({
              id: z.string().min(1),
              description: z.string().min(1),
            }),
          )
          .min(2)
          .max(255),
        model: z.string().optional(),
      }),
    },
    async ({ state, objective, candidates, model }) => {
      try {
        const result = await callJev({
          state: state as JsonValue,
          model,
          questions: {
            route: {
              type: "choice",
              instructions: `Choose the best route for this objective: ${objective}`,
              criteria: criteriaFromOptions(candidates),
            },
          },
        });
        return textResult(advisoryPayload(result));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "jev_risk_score",
    {
      title: "Jev Risk Score",
      description:
        "Use as an advisory second opinion for consequential or ambiguous-risk changes after inspecting relevant context. Returns low/medium/high/critical risk. It is never authorization to proceed and never overrides tests, deterministic evidence, primary-model reasoning, or review.",
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: z.object({
        state: stateSchema.describe(
          "Proposed action plus the minimal project context needed to assess its risk.",
        ),
        question: z
          .string()
          .min(1)
          .default("How risky is this proposed change if executed as described?"),
        model: z.string().optional(),
      }),
    },
    async ({ state, question, model }) => {
      try {
        const result = await callJev({
          state: state as JsonValue,
          model,
          questions: {
            risk: {
              type: "score",
              instructions: question,
              criteria: [
                "Low risk: localized, reversible, well-covered, and unlikely to affect users or data.",
                "Medium risk: meaningful behavioral change or moderate blast radius; review and tests are warranted.",
                "High risk: broad blast radius, data/schema/security impact, difficult rollback, or weak verification.",
                "Critical risk: could cause severe data loss, security exposure, production outage, or irreversible damage.",
              ],
            },
          },
        });
        return textResult(advisoryPayload(result));
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.registerTool(
    "jev_gate",
    {
      title: "Jev Gate",
      description:
        "Use as an advisory second opinion for an atomic yes/no gate when a probability threshold would materially change the next action. A passed gate is not authorization for destructive, irreversible, production, security, or data-loss-sensitive actions.",
      annotations: { readOnlyHint: true, openWorldHint: true },
      inputSchema: z.object({
        state: stateSchema,
        statement: z.string().min(1),
        threshold: z.number().min(0).max(1).default(0.8),
        model: z.string().optional(),
      }),
    },
    async ({ state, statement, threshold, model }) => {
      try {
        const result = await callJev({
          state: state as JsonValue,
          model,
          questions: {
            gate: {
              type: "noul",
              instructions: statement,
            },
          },
        });
        const answer = result.answers.gate as { noul?: number } | undefined;
        const probability = answer?.noul;
        return textResult({
          ...result,
          gate: {
            probability,
            threshold,
            passed: typeof probability === "number" ? probability >= threshold : null,
          },
          jev_mcp_advisory: JEV_ADVISORY,
        });
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  return server;
}

const stdioHandle = serveStdio(createServer);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    console.error(`jev-mcp v${VERSION} received ${signal}; shutting down`);
    void stdioHandle.close().finally(() => process.exit(0));
  });
}

console.error(`jev-mcp v${VERSION} Conservative running over stdio`);
