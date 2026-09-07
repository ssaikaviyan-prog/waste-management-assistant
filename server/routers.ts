import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const n8nWebhookUrl = () => process.env.N8N_WEBHOOK_URL?.trim() ?? "";
const astraApiKey = () => process.env.ASTRA_API_KEY?.trim() ?? "";

const assistantInput = z.object({
  message: z.string().trim().min(1).max(4000),
  sessionId: z.string().trim().min(1).max(128),
});

const wasteAssistantPrompt = `You are EcoSort AI, a careful waste-management specialist for households, campuses, and communities.

Your expertise covers waste segregation, recycling guidance, composting, hazardous waste, e-waste, waste reduction, collection guidance, and general waste-management questions.

Answer in a practical, friendly, concise way. When relevant, explain which waste category applies, preparation steps, the safest disposal route, and what not to do. Ask for the user's city or collection context when local rules could change the answer. Never claim that a material is accepted by a local program unless the user provides that context. For hazardous materials, batteries, chemicals, medical waste, or unknown substances, prioritize safety and recommend an approved specialist collection point. Do not invent collection schedules, addresses, or regulations. If the question is unrelated to waste management, politely explain that you specialize in waste and environmental guidance and invite a relevant question. Use short headings or bullets when they improve clarity.`;

const classificationInput = z.object({
  sessionId: z.string().trim().min(1).max(128),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(100),
  imageData: z.string().max(8_000_000),
});

async function classifyNativeImage(input: z.infer<typeof classificationInput>) {
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are EcoSort AI's waste image classifier. Classify only what can reasonably be inferred from the image. Choose exactly one category: Biodegradable, Recyclable, E-Waste, Hazardous, or Mixed Waste. Provide safe, general disposal guidance and a recycling recommendation. Never invent local collection rules. Return only the requested JSON fields." },
        { role: "user", content: [
          { type: "text", text: `Classify this waste image named ${input.fileName}.` },
          { type: "image_url", image_url: { url: input.imageData, detail: "low" } },
        ] },
      ],
      maxTokens: 500,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "waste_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: ["Biodegradable", "Recyclable", "E-Waste", "Hazardous", "Mixed Waste"] },
              disposalMethod: { type: "string" },
              recyclingRecommendation: { type: "string" },
              confidence: { type: "string", enum: ["High", "Medium", "Low"] },
            },
            required: ["category", "disposalMethod", "recyclingRecommendation", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = result.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter((part): part is { type: "text"; text: string } => part.type === "text").map((part) => part.text).join("\n") : "";
    const parsed = JSON.parse(text) as Record<string, string>;
    return { category: parsed.category, disposalMethod: parsed.disposalMethod, recyclingRecommendation: parsed.recyclingRecommendation, confidence: parsed.confidence };
  } catch (error) {
    console.error("[Native AI] Classification request failed:", error);
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The native AI could not classify this image. Try a clearer photo." });
  }
}

async function askNativeAssistant(message: string) {
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: wasteAssistantPrompt },
        { role: "user", content: message },
      ],
      maxTokens: 900,
    });
    const content = result.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content.trim();
    if (Array.isArray(content)) {
      const text = content
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();
      if (text) return text;
    }
    throw new Error("The native AI returned an empty response.");
  } catch (error) {
    console.error("[Native AI] Assistant request failed:", error);
    throw new TRPCError({
      code: "BAD_GATEWAY",
      message: "The native AI assistant could not respond. Check the Manus AI connection and try again.",
    });
  }
}

async function postToN8n(payload: Record<string, unknown>) {
  const webhook = n8nWebhookUrl();
  if (!webhook) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "The n8n workflow is not configured for this feature yet.",
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
      const message = response.status === 404 && webhook.includes("/webhook-test/")
        ? "The n8n test webhook is not listening. Open the workflow in n8n and click Execute Workflow, or use its active production /webhook/ URL."
        : response.status === 500
          ? "The n8n workflow returned 500. Check the AI Agent/LLM node, credentials, and that the workflow returns a response field."
          : `The n8n webhook returned ${response.status}. Check the workflow response and URL.`;
      throw new TRPCError({ code: "BAD_GATEWAY", message });
    }
    let parsed: unknown = raw;
    try { parsed = raw ? JSON.parse(raw) : null; } catch { /* Plain text from n8n is supported. */ }
    return parsed;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    const message = error instanceof Error && error.name === "AbortError"
      ? "The n8n webhook timed out after 30 seconds."
      : "Unable to reach the n8n workflow. Verify the endpoint and workflow status.";
    throw new TRPCError({ code: "TIMEOUT", message });
  } finally {
    clearTimeout(timeout);
  }
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
      nativeAIConfigured: Boolean(ENV.forgeApiKey),
      astraConfigured: Boolean(astraApiKey()),
      architecture: "Website → Native AI Assistant → Manus LLM",
    })),
  }),
  assistant: router({
    send: publicProcedure.input(assistantInput).mutation(async ({ input }) => ({
      response: await askNativeAssistant(input.message),
    })),
  }),
  classifier: router({
    submit: publicProcedure.input(classificationInput).mutation(async ({ input }) => classifyNativeImage(input)),
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
