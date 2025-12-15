import { Db } from 'mongodb';
declare let db: Db | null;
/**
 * @file db.ts
 * @description Manages the connection and access to the MongoDB database.
 */
/**
 * Connects to the MongoDB database using credentials retrieved from environment variables
 * and Google Secret Manager (via getSecret).
 * * The connection URI is constructed to prioritize a cloud cluster connection
 * (using username/password) and falls back to a local default if credentials are missing.
 * * @async
 * @throws {Error} Throws an error if the connection fails or secrets cannot be retrieved.
 * @returns {Promise<void>} A Promise that resolves when the connection is successfully established.
 */
export declare function connectToDB(): Promise<void>;
/**
 * Exports the MongoDB Db instance.
 * Must be accessed only after calling and successfully completing `connectToDB()`.
 * * @type {Db | null}
 */
export { db };
//# sourceMappingURL=db.d.ts.map