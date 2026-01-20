import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { UserProgressDocument } from '../types/userProgressInterface.js';


export async function getUserProgress(
  uid: string, 
  contentId: string, 
  type: 'challenge' | 'flashcard' | 'story' | 'scenario',
  isCorrect: boolean = true
) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const query = { 
      uid, 
      contentId: new ObjectId(contentId),
      contentType: type 
    };

    const update = {
      $inc: { 
        attempts: 1, 
        successes: isCorrect ? 1 : 0 
      },
      $set: { lastCompletedAt: new Date() }
    };

    await db.collection<UserProgressDocument>('userProgress').updateOne(
      query, 
      update, 
      { upsert: true }
    );

  } catch (error) {
    console.error("Error recording user progress:", error);
  }
}
/**
 * Records progress for any content type (Challenges, Flashcards, etc.)
 */
export async function recordUserProgress(
  uid: string, 
  contentId: string, 
  type: 'challenge' | 'flashcard' | 'story' | 'scenario',
  isCorrect: boolean = true
) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const query = { 
      uid, 
      contentId: new ObjectId(contentId),
      contentType: type 
    };

    const update = {
      $inc: { 
        attempts: 1, 
        successes: isCorrect ? 1 : 0 
      },
      $set: { lastCompletedAt: new Date() }
    };

    await db.collection<UserProgressDocument>('userProgress').updateOne(
      query, 
      update, 
      { upsert: true }
    );

  } catch (error) {
    console.error("Error recording user progress:", error);
  }
}