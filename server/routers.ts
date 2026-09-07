import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const n8nWebhookUrl = () => process.env.N8N_WEBHOOK_URL?.trim() ?? "";
const astraApiKey = () => process.env.ASTRA_API_KEY?.trim() ?? "";

const assistantInput = z.object({
  message: z.string().trim().min(1).max(4000),
  sessionId: z.string().trim().min(1).max(128),
});

async function postToN8n(payload: Record<string, unknown>) {
  const webhook = n8nWebhookUrl();
  if (!webhook) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "The n8n webhook is not configured yet. Add N8N_WEBHOOK_URL to connect the AI agent.",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const raw = await response.text();
    if (!response.ok) {
      throw new TRPCError({ code: "BAD_GATEWAY", message: `The n8n webhook returned ${response.status}. Check the workflow response and URL.` });
    }
    let parsed: unknown = raw;
    try { parsed = raw ? JSON.parse(raw) : null; } catch { /* Plain text from n8n is supported. */ }
    return parsed;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message = error instanceof Error && error.name === "AbortError"
      ? "The n8n webhook timed out after 30 seconds."
      : "Unable to reach the n8n webhook. Verify the endpoint and workflow status.";
    throw new TRPCError({ code: "TIMEOUT", message });
  } finally {
    clearTimeout(timeout);
  }
}

function extractAssistantResponse(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) return payload.trim();
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const response = [record.response, record.output, record.message, record.text, record.answer]
      .find((value) => typeof value === "string" && value.trim());
    if (typeof response === "string") return response.trim();
  }
  throw new TRPCError({ code: "BAD_GATEWAY", message: "The n8n webhook responded without a readable assistant message." });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  integrations: router({
    health: publicProcedure.query(() => ({
      n8nConfigured: Boolean(n8nWebhookUrl()),
      astraConfigured: Boolean(astraApiKey()),
      architecture: "Website → n8n Webhook → AI Agent → LLM → Website",
    })),
  }),
  assistant: router({
    send: publicProcedure.input(assistantInput).mutation(async ({ input }) => {
      const payload = await postToN8n(input);
      return { response: extractAssistantResponse(payload) };
    }),
  }),
  classifier: router({
    submit: publicProcedure.input(z.object({
      sessionId: z.string().trim().min(1).max(128),
      fileName: z.string().trim().min(1).max(255),
      mimeType: z.string().trim().min(1).max(100),
      imageData: z.string().max(8_000_000).optional(),
    })).mutation(async ({ input }) => postToN8n({ type: "waste-classification", ...input })),
  }),
  reports: router({
    submit: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(120),
      location: z.string().trim().min(2).max(240),
      wasteType: z.string().trim().min(1).max(80),
      description: z.string().trim().min(10).max(2000),
      imageName: z.string().trim().max(255).optional(),
      sessionId: z.string().trim().min(1).max(128),
    })).mutation(async ({ input }) => {
      await postToN8n({ type: "waste-report", ...input });
      return { submitted: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
