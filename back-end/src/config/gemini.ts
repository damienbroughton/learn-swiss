import { GoogleGenAI } from "@google/genai";

// Use the imported GoogleGenAI type for the client instance.
// Initialize it as null, indicating the client is not yet instantiated.
let ai: GoogleGenAI | null = null;

/**
 * @constant {string} GEMINI_MODEL
 * @description The default Gemini model identifier to be used for API calls.
 */
export const GEMINI_MODEL: string = "gemini-2.5-flash"; 

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
export function initializeGeminiClient(): GoogleGenAI {
    
    // --- 1. Singleton Check ---
    if (ai) return ai; // Return existing instance if already initialized

    // --- 2. Configuration Retrieval ---
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    // Use a strict boolean check for 'True'
    const useVertexAI = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'True'; 

    // --- 3. Validation ---
    if (!projectId) {
        console.error("GOOGLE_PROJECT_ID environment variable is missing.");
        throw new Error("Missing required configuration for Gemini client. Please set GOOGLE_PROJECT_ID.");
    }
    
    // --- 4. Client Instantiation ---
    try {
        ai = new GoogleGenAI({
            // The vertexai parameter configures the client to connect to the 
            // Vertex AI endpoint if true, using the provided project and location.
            vertexai: useVertexAI,
            project: projectId,
            location: location
        });
        
        console.log(`[Gemini Client] Initialized. Vertex AI Mode: ${useVertexAI}. Location: ${location}`);
        
    } catch (error) {
        console.error("[Gemini Client] FATAL: Failed to initialize GoogleGenAI client.", error);
        throw error;
    }

    // --- 5. Return Instance ---
    return ai;
}