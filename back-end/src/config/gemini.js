import { GoogleGenAI } from "@google/genai";

let ai = null;

export const GEMINI_MODEL = "gemini-2.5-flash"; // model to use

/**
 * Initialise gemini for ai queries
 *
 */
export function initializeGeminiClient(){
    if(ai) return ai; // Don't reinitialise

    const projectId = process.env.GOOGLE_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const useVertexAI = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'True';

    if(!projectId) {
        console.error("GOOGLE_CLOUD_PROJECT environment variable is missing.");
        throw new Error("Missing required config for Gemini client.");
    }
    ai = new GoogleGenAI({
        vertexai: useVertexAI,
        project: projectId,
        location: location
    });

    return ai;
}
