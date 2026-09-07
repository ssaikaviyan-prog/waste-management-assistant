import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { invokeLLM } from "./_core/llm";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

const ctx = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

describe("integrations.health", () => {
  it("reports native AI readiness without leaking credentials", async () => {
    const result = await appRouter.createCaller(ctx).integrations.health();

    expect(result.nativeAIConfigured).toBe(true);
    expect(result).not.toHaveProperty("apiKey");
    expect(result.architecture).toContain("Native AI Assistant");
  });
});

describe("assistant native LLM proxy", () => {
  it("sends the specialized waste-management prompt server-side", async () => {
    vi.mocked(invokeLLM).mockResolvedValueOnce({
      choices: [{ message: { role: "assistant", content: "Rinse the bottle and place it in your local recycling stream." }, index: 0, finish_reason: "stop" }],
      id: "test",
      created: 0,
      model: "test-model",
    });

    const result = await appRouter.createCaller(ctx).assistant.send({
      message: "Where should I dispose of a plastic bottle?",
      sessionId: "test-session",
    });

    expect(result.response).toContain("Rinse the bottle");
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      maxTokens: 900,
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "user", content: "Where should I dispose of a plastic bottle?" }),
        expect.objectContaining({ role: "system", content: expect.stringContaining("waste-management specialist") }),
      ]),
    }));
  });

  it("returns a safe error when the native model fails", async () => {
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("provider unavailable"));

    await expect(appRouter.createCaller(ctx).assistant.send({
      message: "Can I compost food scraps?",
      sessionId: "test-session",
    })).rejects.toThrow("native AI assistant could not respond");
  });
});
