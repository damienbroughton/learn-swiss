import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

/**
 * @file secrets.ts
 * @description Provides a utility function to securely retrieve secrets from 
 * Google Cloud Secret Manager.
 */

// Initialize the SecretManagerServiceClient outside the function for reuse (singleton pattern)
const client: SecretManagerServiceClient = new SecretManagerServiceClient();

/**
 * Retrieves the latest version of a specified secret from Google Cloud Secret Manager.
 * * @async
 * @param {string} name - The simple ID of the secret to retrieve (e.g., "MONGODB_PASSWORD").
 * @returns {Promise<string>} A promise that resolves with the secret's payload data as a string.
 * @throws {Error} Throws an error if the `GOOGLE_PROJECT_ID` is missing or if the secret access fails.
 */
export async function getSecret(name: string): Promise<string> {
    
    const projectId: string | undefined = process.env.GOOGLE_PROJECT_ID;
    
    // --- 1. Validation ---
    if (!projectId) {
        throw new Error("Missing required environment variable: GOOGLE_PROJECT_ID.");
    }

    // --- 2. Construct Resource Name ---
    const secretResourceName: string = `projects/${projectId}/secrets/${name}/versions/latest`;
    
    try {
        // --- 3. Access Secret Version (Using Type Inference) ---
        
        // Step A: Capture the Promise of the function call
        const accessPromise = client.accessSecretVersion({
            name: secretResourceName
        });
        
        const [version]: Awaited<typeof accessPromise> = await accessPromise;
        
        
        // --- 4. Process Payload ---
        const payload = version.payload?.data;
        
        if (!payload) {
             console.warn(`[Secret Manager] Secret "${name}" retrieved, but payload data is empty.`);
             return "";
        }
        
        return payload.toString(); 
        
    } catch (error) {
        console.error(`[Secret Manager] Failed to retrieve secret: ${name}.`, error);
        throw new Error(`Failed to access secret "${name}" from Google Cloud Secret Manager.`); 
    }
}