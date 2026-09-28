import assert from "node:assert/strict";
import test from "node:test";

import {
  JEV_ADVISORY,
  advisoryPayload,
  criteriaFromOptions,
  normalizeBaseUrl,
  parseEnvFile,
  timeoutMs,
} from "../src/core.js";

test("parseEnvFile parses comments, quotes, and values containing equals signs", () => {
  assert.deepEqual(
    parseEnvFile(`
# comment
TYPESAFE_API_KEY="abc=123"
JEV_MODEL=jev-latest
INVALID KEY=nope
EMPTY=
`),
    {
      TYPESAFE_API_KEY: "abc=123",
      JEV_MODEL: "jev-latest",
      EMPTY: "",
    },
  );
});

test("normalizeBaseUrl removes a trailing slash and rejects non-http protocols", () => {
  assert.equal(normalizeBaseUrl("https://api.typesafe.ai/"), "https://api.typesafe.ai");
  assert.throws(() => normalizeBaseUrl("file:///tmp/typesafe"), /http:\/\/ or https:\/\//);
});

test("timeoutMs validates the supported range", () => {
  assert.equal(timeoutMs(undefined), 15_000);
  assert.equal(timeoutMs("5000"), 5_000);
  assert.throws(() => timeoutMs("249"), /between 250 and 120000/);
  assert.throws(() => timeoutMs("abc"), /between 250 and 120000/);
});

test("criteriaFromOptions preserves ids and nullable descriptions", () => {
  assert.deepEqual(
    criteriaFromOptions([
      { id: "retry", description: "Retry once" },
      { id: "rollback" },
    ]),
    { retry: "Retry once", rollback: null },
  );
});

test("advisoryPayload always marks Jev as secondary advisory", () => {
  const payload = advisoryPayload({ model: "jev-latest", answers: { decision: "retry" } });
  assert.deepEqual(payload.jev_mcp_advisory, JEV_ADVISORY);
  assert.equal(payload.jev_mcp_advisory.finalDecisionBy, "active_host_model");
});
