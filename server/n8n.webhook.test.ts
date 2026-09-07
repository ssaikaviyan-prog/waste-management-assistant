import { describe, expect, it } from "vitest";

describe("n8n webhook configuration", () => {
  it("has a reachable webhook endpoint", async () => {
    const endpoint = process.env.N8N_WEBHOOK_URL;
    expect(endpoint).toMatch(/^https:\/\//);

    const response = await fetch(endpoint!, { method: "HEAD" });
    expect(response.status).toBeLessThan(500);
  }, 15_000);
});
