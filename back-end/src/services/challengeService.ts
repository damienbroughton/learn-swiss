import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { ChallengeDocument } from '../types/challengeInterface.js';

export interface ChallengeCategory {
  reference: string;
  title: string;
  totalChallenges: number;
  completedByUser: number;
}

/**
 * Retrieves a list of challenge references with completion stats.
 * If userId is undefined, completedByUser will return 0 for all items.
 */
export async function getChallenges(uid?: string): Promise<ChallengeCategory[]> {
  try {
    if (!db) throw new Error('Database connection not initialized.');

    const pipeline: any[] = [];

    // 1. If we have a user, perform the lookup join
    if (uid) {
      pipeline.push({
        $lookup: {
          from: 'userProgress',
          let: { challengeId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$contentId', '$$challengeId'] },
                    { $eq: ['$uid', uid] },
                    { $eq: ['$contentType', 'challenge'] },
                    { $gt: ['$successes', 0] }
                  ]
                }
              }
            }
          ],
          as: 'progress'
        }
      });
    }

    // 2. Group by reference
    pipeline.push({
      $group: {
        _id: "$reference",
        totalChallenges: { $sum: 1 },
        title: { $first: "$title" },
        difficulty: { $first: "$difficulty" },
        language: { $first: "$language" },
        // If uid exists, check the 'progress' array length. Otherwise, default to 0.
        completedByUser: uid
          ? { $sum: { $cond: [{ $gt: [{ $size: "$progress" }, 0] }, 1, 0] } }
          : { $sum: 0 }
      }
    });

    // 3. Project and Sort
    pipeline.push(
      {
        $project: {
          _id: 0,
          reference: "$_id",
          title: 1,    
          difficulty: 1, 
          language: 1,
          totalChallenges: 1,
          completedByUser: 1
        }
      },
      { $sort: { reference: 1 } }
    );

    const results = await db.collection('challenges').aggregate(pipeline).toArray();
    return results as ChallengeCategory[];
    
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
    const challenges = await db.collection<ChallengeDocument>('challenges').aggregate([
      { $match: { reference } },
      { $sample: { size: 10 } }
    ]).toArray();
    return challenges;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Internal server error');
  }
}