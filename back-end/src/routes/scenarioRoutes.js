import express from "express";
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const router = express.Router();

/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 * 
 * Public endpoint; enrichment only applies if user is authenticated.
 */
router.get('/', async (req, res) => {
  try {
    const uid = req.user?.uid; // undefined if not logged in
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

    return res.json(response);
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    return res.status(500).send('Internal server error');
  }
});


/**
 * GET /:title
 * Retrieve full scenario details by title.
 *
 * Public endpoint.
 *
 * @param {string} title - Title of the scenario
 */
router.get('/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const scenario = await db.collection('scenarios').findOne({ title });

    if (!scenario) {
      return res.status(404).send('Scenario not found');
    }

    return res.json(scenario);
  } catch (err) {
    console.error('Error fetching scenario:', err);
    return res.status(500).send('Internal server error');
  }
});


/**
 * POST /:title/complete
 * Mark a scenario as completed by the authenticated user.
 *
 * Requires authentication.
 *
 * @param {string} title - Title of the scenario to mark as completed
 */
router.post('/:title/complete', requireAuth, async (req, res) => {
  try {
    const { title } = req.params;
    const { uid } = req.user;

    const scenario = await db.collection('scenarios').findOne({ title });
    if (!scenario) {
      return res.status(404).send('Scenario not found');
    }

    const completions = scenario.completions || [];
    if (uid && !completions.includes(uid)) {
      await db.collection('scenarios').findOneAndUpdate(
        { title },
        { $push: { completions: uid } }
      );
      return res.status(200).send('OK');
    } else {
      return res.status(200).send('OK - Previously Completed');
    }
  } catch (err) {
    console.error('Error marking scenario as complete:', err);
    return res.status(500).send('Internal server error');
  }
});

export default router;
