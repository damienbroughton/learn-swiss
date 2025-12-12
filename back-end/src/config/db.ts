import { MongoClient, ServerApiVersion,  Db } from 'mongodb';
import { getSecret } from './secrets.js'; 

// Use the Db type for the database connection instance.
// Initialize it as null, indicating no connection is established yet.
let db: Db | null = null; 

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
export async function connectToDB(): Promise<void> {
    
    // --- 1. Retrieve Credentials ---
    const mongodbDB = await getSecret("MONGODB_DB");
    const mongodbPassword = await getSecret("MONGODB_PASSWORD");
    const mongodbUserName = process.env.MONGODB_USERNAME; 

    // --- 2. Construct Connection URI ---
    
    // Check for required username/password to determine the URI style
    const isCloudCluster: boolean = mongodbUserName !== undefined && mongodbPassword !== undefined;

    
    const uri = isCloudCluster
        ? `mongodb+srv://${mongodbUserName}:${mongodbPassword}@${mongodbDB}/?retryWrites=true&w=majority&appName=Cluster0`
        : 'mongodb://localhost:27017'; // Fallback to local MongoDB

    // --- 3. Initialize MongoClient ---

    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });

    try {
        // --- 4. Connect to the Client ---
        await client.connect();

        // Use the database name provided by the secret, 
        // falling back to a known default if necessary for local setup
        const databaseName = isCloudCluster ? mongodbDB : 'learn-swiss-german-db'; 
        console.log(databaseName);

        
        // --- 5. Assign the Db Instance ---
        db = client.db(databaseName);
        console.log(`[MongoDB] Successfully connected to database: ${databaseName}`);
        
    } catch (error) {
        console.error("[MongoDB] FATAL: Failed to connect to database.", error);
        throw error; // Re-throw to halt server startup on critical failure
    }
}

/**
 * Exports the MongoDB Db instance.
 * Must be accessed only after calling and successfully completing `connectToDB()`.
 * * @type {Db | null}
 */
export { db };