import { GEMINI_MODEL, initializeGeminiClient } from '../config/gemini.js';

/**
 * 
 * Generates conent based on a text prompt using the Gemini API
 * @param {string} prompt - The text prompt to send to the model
 * @returns {Promise<string>} - The generated text reponse
 */
export async function generateText(prompt) {
    //Get the initialised gemini client
    const ai = initializeGeminiClient();

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Content Generation Error: ", error);
        throw new Error("Failed to get response from the AI model.");
    }
}