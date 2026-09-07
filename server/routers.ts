import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const astraApiKey = () => process.env.ASTRA_API_KEY?.trim() ?? "";
const assistantInput = z.object({ message: z.string().trim().min(1).max(4000), sessionId: z.string().trim().min(1).max(128) });
const classificationInput = z.object({ sessionId: z.string().trim().min(1).max(128), fileName: z.string().trim().min(1).max(255), mimeType: z.string().trim().min(1).max(100), imageData: z.string().max(8_000_000) });

const wasteAssistantPrompt = `You are EcoSort AI, a careful waste-management specialist for households, campuses, and communities. Your expertise covers waste segregation, recycling guidance, composting, hazardous waste, e-waste, waste reduction, collection guidance, and general waste-management questions. Answer practically and concisely. Explain category, preparation, safe disposal, and what not to do when relevant. Ask for city context when local rules vary. Never invent schedules, addresses, or regulations. Prioritize safety for hazardous materials, batteries, chemicals, medical waste, or unknown substances. If unrelated, invite a waste-management question.`;

async function askNativeAssistant(message: string) {
  try {
    const result = await invokeLLM({ messages: [{ role: "system", content: wasteAssistantPrompt }, { role: "user", content: message }], maxTokens: 900 });
    const content = result.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content.trim();
    if (Array.isArray(content)) { const text = content.filter((part): part is { type: "text"; text: string } => part.type === "text").map((part) => part.text).join("\n").trim(); if (text) return text; }
    throw new Error("empty response");
  } catch (error) {
    console.error("[Native AI] Assistant request failed:", error);
    throw new TRPCError({ code: "BAD_GATEWAY", message: "The native AI assistant could not respond. Check the Manus AI connection and try again." });
  }
}

async function classifyNativeImage(input: z.infer<typeof classificationInput>) {
  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are EcoSort AI's waste image classifier. Choose exactly one category: Biodegradable, Recyclable, E-Waste, Hazardous, or Mixed Waste. Provide safe general disposal guidance and a recycling recommendation. Never invent local rules. Return only JSON." },
        { role: "user", content: [{ type: "text", text: `Classify this waste image named ${input.fileName}.` }, { type: "image_url", image_url: { url: input.imageData, detail: "low" } }] },
      ],
      maxTokens: 500,
      response_format: { type: "json_schema", json_schema: { name: "waste_classification", strict: true, schema: { type: "object", properties: { category: { type: "string", enum: ["Biodegradable", "Recyclable", "E-Waste", "Hazardous", "Mixed Waste"] }, disposalMethod: { type: "string" }, recyclingRecommendation: { type: "string" }, confidence: { type: "string", enum: ["High", "Medium", "Low"] } }, required: ["category", "disposalMethod", "recyclingRecommendation", "confidence"], additionalProperties: false } } },
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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  integrations: router({
    health: publicProcedure.query(() => ({ nativeAIConfigured: Boolean(ENV.forgeApiKey), astraConfigured: Boolean(astraApiKey()), architecture: "Website → Native AI Assistant → Manus LLM" })),
  }),
  assistant: router({ send: publicProcedure.input(assistantInput).mutation(async ({ input }) => ({ response: await askNativeAssistant(input.message) })) }),
  classifier: router({ submit: publicProcedure.input(classificationInput).mutation(async ({ input }) => classifyNativeImage(input)) }),
  reports: router({
    submit: publicProcedure.input(z.object({ name: z.string().trim().max(120).optional(), location: z.string().trim().min(2).max(240), wasteType: z.string().trim().min(1).max(80), description: z.string().trim().min(10).max(2000), imageName: z.string().trim().max(255).optional(), sessionId: z.string().trim().min(1).max(128) })).mutation(({ input }) => ({ submitted: true as const, reportId: `WM-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`, payload: { ...input, status: "Pending Review", createdAt: new Date().toISOString() } })),
  }),
});

export type AppRouter = typeof appRouter;
