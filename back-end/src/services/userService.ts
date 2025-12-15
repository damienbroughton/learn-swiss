import { db } from '../config/db.js';

/**
 * Get user by their userid
 */
export async function getUser(uid: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const user = await db.collection('users').findOne({ uid });

    return user;
  } catch (err) {
    console.error('Error retrieving user:', err);
    throw new Error('Internal server error');
  }
}

/**
 * Create a new user in the database if it doesn't exist.
 * If the user already exists, update their `updatedAt` timestamp.
 */
export async function createUpdateUser(uid: string, username: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    let user = await db.collection('users').findOne({ uid });
    const now = new Date();

    if (!user) {
      const result = await db.collection('users').insertOne({
        uid,
        username,
        role: 'user',
        createdAt: now,
        updatedAt: now
      });
      user = await db.collection('users').findOne({ _id: result.insertedId });
    } else {
      await db.collection('users').updateOne(
        { uid },
        { $set: { updatedAt: now } }
      );
    }

    return user;
  } catch (err) {
    console.error('Error creating or updating user:', err);
    throw new Error('Internal server error');
  }
}