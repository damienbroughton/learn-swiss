/**
 * Retrieves the latest version of a specified secret from Google Cloud Secret Manager.
 * * @async
 * @param {string} name - The simple ID of the secret to retrieve (e.g., "MONGODB_PASSWORD").
 * @returns {Promise<string>} A promise that resolves with the secret's payload data as a string.
 * @throws {Error} Throws an error if the `GOOGLE_PROJECT_ID` is missing or if the secret access fails.
 */
export declare function getSecret(name: string): Promise<string>;
//# sourceMappingURL=secrets.d.ts.map