import type { AppRouter } from "../../../server/routers";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type WasteAnalysisResult = inferRouterOutputs<AppRouter>["classifier"]["submit"];
export type WasteAnalysisInput = inferRouterInputs<AppRouter>["classifier"]["submit"];
type SubmitAnalysis = (input: WasteAnalysisInput) => Promise<WasteAnalysisResult>;

/**
 * Provider-neutral boundary for image analysis. The UI only knows this function;
 * the implementation can later be replaced with another direct vision backend.
 */
export function analyzeWasteImage(input: WasteAnalysisInput, submit: SubmitAnalysis) {
  return submit(input);
}
