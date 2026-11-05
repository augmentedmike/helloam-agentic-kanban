import { describe, test, expect, mock } from "bun:test";
import { Gemma4Adapter } from "./gemma4";
import { ProviderAuthError } from "../errors";

describe("Gemma4Adapter", () => {
  test("providerId is 'gemma4'", () => {
    const adapter = new Gemma4Adapter();
    expect(adapter.providerId).toBe("gemma4");
  });

  test("default modelId is 'gemma4:e2b'", () => {
    const adapter = new Gemma4Adapter();
    expect(adapter.modelId).toBe("gemma4:e2b");
  });

  test("default baseURL is Ollama endpoint", () => {
    const adapter = new Gemma4Adapter();
    expect((adapter as any).baseURL).toBe("http://localhost:11434/v1");
  });

  test("default apiKey is 'ollama'", () => {
    const adapter = new Gemma4Adapter();
    expect((adapter as any).apiKey).toBe("ollama");
  });

  test("capabilities: vision=true, streaming=false, structuredOutput=true", () => {
    const adapter = new Gemma4Adapter();
    expect(adapter.capabilities).toEqual({
      streaming: false,
      vision: true,
      structuredOutput: true,
    });
  });

  test("accepts custom options", () => {
    const adapter = new Gemma4Adapter({
      baseURL: "http://localhost:8080/v1",
      apiKey: "test-key",
      modelId: "gemma4:latest",
    });
    expect(adapter.modelId).toBe("gemma4:latest");
    expect((adapter as any).baseURL).toBe("http://localhost:8080/v1");
    expect((adapter as any).apiKey).toBe("test-key");
  });

  test("invokes OpenAI client with system prompt and user prompt", async () => {
    let capturedModel: string | undefined;
    let capturedMessages: unknown[] | undefined;

    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async (opts: any) => {
              capturedModel = opts.model;
              capturedMessages = opts.messages;
              return {
                choices: [{ message: { content: "hi from gemma" } }],
                usage: { prompt_tokens: 50, completion_tokens: 30 },
              };
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    const result = await adapter.invoke("/tmp", "test prompt", {
      systemPrompt: "you are gemma",
    });

    expect(result.exitCode).toBe(0);
    expect(result.result).toBe("hi from gemma");
    expect(result.usage).toEqual({
      inputTokens: 50,
      outputTokens: 30,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    });
    expect(capturedModel).toBe("gemma4:e2b");
    expect(capturedMessages).toEqual([
      { role: "system", content: "you are gemma" },
      { role: "user", content: "test prompt" },
    ]);
  });

  test("uses model override when provided", async () => {
    let capturedModel: string | undefined;

    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async (opts: any) => {
              capturedModel = opts.model;
              return {
                choices: [{ message: { content: "ok" } }],
                usage: null,
              };
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await adapter.invoke("/tmp", "test", { model: "gemma4:9b" });

    expect(capturedModel).toBe("gemma4:9b");
  });

  test("request without systemPrompt only includes user message", async () => {
    let capturedMessages: unknown[] | undefined;

    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async (opts: any) => {
              capturedMessages = opts.messages;
              return {
                choices: [{ message: { content: "ok" } }],
                usage: null,
              };
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await adapter.invoke("/tmp", "just this");

    expect(capturedMessages).toEqual([{ role: "user", content: "just this" }]);
  });

  test("sets response_format json when responseFormat option is json", async () => {
    let capturedResponseFormat: unknown | undefined;

    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async (opts: any) => {
              capturedResponseFormat = opts.response_format;
              return {
                choices: [{ message: { content: '{"ok":true}' } }],
                usage: null,
              };
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await adapter.invoke("/tmp", "give json", { responseFormat: "json" });

    expect(capturedResponseFormat).toEqual({ type: "json_object" });
  });

  test("throws ProviderAuthError on auth failure", async () => {
    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async () => {
              throw new Error("Authentication failed: invalid api key");
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await expect(adapter.invoke("/tmp", "test")).rejects.toBeInstanceOf(ProviderAuthError);
  });

  test("throws ProviderAuthError on 401", async () => {
    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async () => {
              const err = new Error("401 Unauthorized") as any;
              err.status = 401;
              throw err;
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await expect(adapter.invoke("/tmp", "test")).rejects.toBeInstanceOf(ProviderAuthError);
  });

  test("re-throws non-auth errors as-is", async () => {
    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async () => {
              throw new Error("network timeout");
            },
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    await expect(adapter.invoke("/tmp", "test")).rejects.toThrow("network timeout");
  });

  test("returns empty result when no choices", async () => {
    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async () => ({
              choices: [],
              usage: null,
            }),
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    const result = await adapter.invoke("/tmp", "test");

    expect(result.result).toBe("");
  });

  test("returns undefined usage when response has no usage", async () => {
    mock.module("openai", () => ({
      default: class {
        constructor(_opts: unknown) {}
        chat = {
          completions: {
            create: async () => ({
              choices: [{ message: { content: "ok" } }],
              usage: undefined,
            }),
          },
        };
      },
    }));

    const adapter = new Gemma4Adapter();
    const result = await adapter.invoke("/tmp", "test");

    expect(result.usage).toBeUndefined();
  });
});
