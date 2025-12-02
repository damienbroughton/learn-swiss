import { db } from '../config/db.js';


/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 * 
 * Public endpoint; enrichment only applies if user is authenticated.
 */
export async function getScenarios(uid) {
  try {
    const scenarios = await db.collection('scenarios').find().toArray();

    const response = scenarios.map(scenario => {
      const completions = scenario.completions || [];
      const previouslyComplete = uid && completions.includes(uid);

      return {
        title: scenario.title,
        image: scenario.image,
        previouslyComplete
      };
    });

    return response;
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    throw new Error('Internal server error');
  }
}

/**
 * Retrieve full scenario details by title.
 */
export async function getScenarioByTitle(title) {
  try {
    const scenario = await db.collection('scenarios').findOne({ title });
    return scenario;

  } catch (err) {
    console.error('Error fetching scenario:', err);
    throw new Error('Internal server error');
  }
}

/**
 * Mark a scenario as completed by the authenticated user.
 */
export async function completeScenarioByTitle (uid, title){
  try {
    const scenario = await db.collection('scenarios').findOne({ title });

    if (!scenario) {
      throw new Error('Scenario not found');
    }

    const completions = scenario.completions || [];
    if (uid && !completions.includes(uid)) {
      await db.collection('scenarios').findOneAndUpdate(
        { title },
        { $push: { completions: uid } }
      );
      return 'OK';
    } else {
      return 'OK - Previously Completed';
    }
  } catch (err) {
    console.error('Error marking scenario as complete:', err);
    throw new Error('Internal server error');
  }
}