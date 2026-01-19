import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { ChallengeDocument } from '../types/challengeInterface.js';


/**
 * Retreive list of flashcard categories
 *
 */
export async function getChallengeTitles() {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const challenges = await db.collection('challenges').find().toArray();
    const titles = [...new Set(challenges.map(challenge => challenge.reference))];
    return titles;
  } catch (error) {
    console.error('Error fetching challenge titles:', error);
    throw new Error('Internal server error');
  }
}
/**
 * Retreive list of challenges by reference
 *
 */
export async function getChallengesByReference(reference: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const challenges = await db.collection('challenges').aggregate([
      { $match: { reference } },
      { $sample: { size: 3 } }
    ]).toArray();
    return challenges;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Internal server error');
  }
}