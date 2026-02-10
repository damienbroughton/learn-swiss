import { db } from '../config/db.js';
import { ObjectId } from 'mongodb';
import type { ScenarioDocument } from '../types/scenarioInterfaces.js'; // Import interfaces


/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 * 
 * Public endpoint; enrichment only applies if user is authenticated.
 */
export async function getScenarios(uid: string | undefined) {
  try {

    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const pipeline: any[] = [];

    // 1. If we have a user, perform the lookup join
    if (uid) {
      pipeline.push(
        {
          $lookup: {
            from: "userProgress",
            let: { scenarioId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$contentId", "$$scenarioId"] },
                      { $eq: ["$contentType", "scenario"] },
                      { $eq: ["$uid", uid] }
                    ]
                  }
                }
              }
            ],
            as: "userProgress"
          }
        },
        // 2. Flatten the userProgress array (preserve scenarios with no progress)
        { $unwind: {
            path: "$userProgress",
            preserveNullAndEmptyArrays: true
          } 
        },
        // 3. Set successes to userProgress.successes OR 0 if null
        {
          $addFields: {
            successes: { $ifNull: ["$userProgress.successes", 0] }
          }
        },
        // 4. Clean up: Remove the temporary userProgress object
        {
          $project: {
            userProgress: 0
          }
        }
      );
      const results = await db.collection('scenarios').aggregate(pipeline).toArray();
      return results.map(scenario => {
        const previouslyComplete = scenario.successes > 0;  
        return {
          title: scenario.title,
          category: scenario.category,
          difficulty: scenario.difficulty,
          tags: scenario.tags,
          image: scenario.image,
          previouslyComplete
        };
      });
    }

    // 5. For unauthenticated users, just return basic scenario info

    const scenarios = await db.collection('scenarios').find().toArray();
    return scenarios.map(scenario => ({
      title: scenario.title,
      category: scenario.category,
      difficulty: scenario.difficulty,
      tags: scenario.tags,
      image: scenario.image,
      previouslyComplete: false
    }));
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    throw new Error('Internal server error');
  }
}

/**
 * Retrieve full scenario details by title.
 */
export async function getScenarioByTitle(title: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const scenario = await db.collection('scenarios').findOne({ title });
    return scenario;

  } catch (err) {
    console.error('Error fetching scenario:', err);
    throw new Error('Internal server error');
  }
}