import { MongoClient, ServerApiVersion } from 'mongodb';
import { getSecret } from './secrets.js'

let db;

/**
 * Create a database connection
 *
 */
export async function connectToDB(){
  const mongodbDB = await getSecret("MONGODB_DB");
  const mongodbUserName = process.env.MONGODB_USERNAME;
  const mongodbPassword = await getSecret("MONGODB_PASSWORD");

  const uri = mongodbUserName 
  ? `mongodb+srv://${mongodbUserName}:${mongodbPassword}@${mongodbDB}/?retryWrites=true&w=majority&appName=Cluster0`
  : 'mongodb://localhost:27017';

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });

  await client.connect();

  db = client.db('learn-swiss-german-db');
}

export { db };