import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("integrations.health", () => {
  it("reports server-side Astra configuration without leaking credentials", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const result = await appRouter.createCaller(ctx).integrations.health();

    expect(result.astraConfigured).toBe(true);
    expect(result).not.toHaveProperty("apiKey");
  });
});

describe("assistant n8n proxy", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("explains when an n8n test webhook is not listening", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not listening", { status: 404 })));
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    await expect(appRouter.createCaller(ctx).assistant.send({
      message: "Where should I dispose of a bottle?",
      sessionId: "test-session",
    })).rejects.toThrow("test webhook is not listening");
  });
});
