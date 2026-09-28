export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JevQuestion =
  | {
      type: "choice";
      instructions: string;
      criteria: Record<string, string | null>;
    }
  | {
      type: "score";
      instructions: string;
      criteria: string[];
    }
  | {
      type: "noul";
      instructions: string;
    };

export type JevResponse = {
  model: string;
  answers: Record<string, unknown>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
};

export const VERSION = "0.5.0";

export const JEV_ADVISORY = {
  authority: "secondary_advisory",
  finalDecisionBy: "active_host_model",
  deterministicEvidenceOverrides: true,
  doNotTreatProbabilityAsFact: true,
  onConflict:
    "Re-inspect relevant evidence. Do not mechanically follow Jev. For consequential unresolved disagreement, prefer a reversible path or require review.",
} as const;

export function parseEnvFile(contents: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

export function normalizeBaseUrl(raw: string | undefined): string {
  const value = (raw ?? "https://api.typesafe.ai").trim();
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("TYPESAFE_BASE_URL must use http:// or https://");
  }
  return url.toString().replace(/\/$/, "");
}

export function timeoutMs(raw: string | undefined): number {
  if (!raw) return 15_000;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 250 || value > 120_000) {
    throw new Error("TYPESAFE_TIMEOUT_MS must be an integer between 250 and 120000");
  }
  return value;
}

export function advisoryPayload(result: JevResponse) {
  return {
    ...result,
    jev_mcp_advisory: JEV_ADVISORY,
  };
}

export function criteriaFromOptions(
  options: Array<{ id: string; description?: string | null }>,
): Record<string, string | null> {
  return Object.fromEntries(options.map((option) => [option.id, option.description ?? null]));
}
