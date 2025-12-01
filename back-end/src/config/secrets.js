import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

/**
 * Get a secret from the keyvault
 *
 * @param {string} secretId The ID of the secret to retrieve.
 */

export async function getSecret(name) {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const [version] = await client.accessSecretVersion({
        name: `projects/${projectId}/secrets/${name}/versions/latest`
    });

    return version.payload.data.toString();   
}