import { describe, expect, it } from "vitest";
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
