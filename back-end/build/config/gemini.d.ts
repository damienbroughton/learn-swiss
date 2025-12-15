import { GoogleGenAI } from "@google/genai";
/**
 * @constant {string} GEMINI_MODEL
 * @description The default Gemini model identifier to be used for API calls.
 */
export declare const GEMINI_MODEL: string;
/**
 * @file geminiService.ts
 * @description Provides a singleton function to initialize and retrieve the GoogleGenAI client
 * for interacting with the Gemini API, supporting both standard API and Vertex AI configurations.
 */
/**
 * Initializes and returns the GoogleGenAI client instance.
 * * The initialization logic ensures the client is created only once (singleton pattern)
 * using configuration from environment variables. It prioritizes using Vertex AI
 * based on the `GOOGLE_GENAI_USE_VERTEXAI` flag.
 *
 * @throws {Error} Throws an error if the required `GOOGLE_PROJECT_ID` environment variable is missing.
 * @returns {GoogleGenAI} The fully initialized GoogleGenAI client instance.
 */
export declare function initializeGeminiClient(): GoogleGenAI;
//# sourceMappingURL=gemini.d.ts.map