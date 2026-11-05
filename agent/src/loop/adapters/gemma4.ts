import type { AgentAdapter, AdapterCapabilities, AdapterInvokeOptions, AdapterResult } from "../adapter";
import { ProviderAuthError } from "../errors";

export interface Gemma4AdapterOptions {
  baseURL?: string;
  apiKey?: string;
  modelId?: string;
}

export class Gemma4Adapter implements AgentAdapter {
  readonly providerId = "gemma4";
  readonly modelId: string;
  readonly capabilities: AdapterCapabilities = {
    streaming: false,
    vision: true,
    structuredOutput: true,
  };

  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor(options: Gemma4AdapterOptions = {}) {
    this.baseURL = options.baseURL ?? "http://localhost:11434/v1";
    this.apiKey = options.apiKey ?? "ollama";
    this.modelId = options.modelId ?? "gemma4:e2b";
  }

  async invoke(
    _workDir: string,
    prompt: string,
    options: AdapterInvokeOptions = {},
  ): Promise<AdapterResult> {
    const { default: OpenAI } = await import("openai");

    const client = new OpenAI({ baseURL: this.baseURL, apiKey: this.apiKey });

    const model = options.model ?? this.modelId;

    const messages: { role: "system" | "user"; content: string }[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    let response;
    try {
      response = await client.chat.completions.create({
        model,
        messages,
        ...(options.responseFormat === "json"
          ? { response_format: { type: "json_object" } }
          : {}),
      });
    } catch (err) {
      const errMsg = String(err);
      if (isAuthFailure(errMsg)) {
        throw new ProviderAuthError(this.providerId, errMsg.slice(0, 500));
      }
      throw err;
    }

    const choice = response.choices[0];
    const result = choice?.message?.content ?? "";
    const usage = response.usage;

    return {
      exitCode: 0,
      result,
      usage: usage
        ? {
            inputTokens: usage.prompt_tokens ?? 0,
            outputTokens: usage.completion_tokens ?? 0,
            cacheReadTokens: (usage as unknown as Record<string, unknown>).prompt_cache_hit_tokens as number ?? 0,
            cacheWriteTokens: (usage as unknown as Record<string, unknown>).prompt_cache_miss_tokens as number ?? 0,
          }
        : undefined,
    };
  }
}

function isAuthFailure(output: string): boolean {
  const lower = output.toLowerCase();
  return [
    "not logged in",
    "authentication",
    "unauthorized",
    "invalid api key",
    "401",
    "403",
    "credentials",
  ].some(pattern => lower.includes(pattern));
}
