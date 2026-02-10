import express from "express";
import type { Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getScenarios, getScenarioByTitle } from "../services/scenarioService.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 

export const router = express.Router();

/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 * 
 * Public endpoint; enrichment only applies if user is authenticated.
 */
router.get('/', async (req: EnrichedRequest, res: Response) => {
  try {
    const uid = req.user?.uid; // undefined if not logged in

    const response = await getScenarios(uid);

    return res.json(response);
  } catch (err) {
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
router.get('/:title', async (req: EnrichedRequest, res: Response) => {
  try {
    const { title } = req.params;

    if (!title || typeof title !== 'string') 
      return res.status(400).send('No Title Provided.');

    const scenario = await getScenarioByTitle( title );

    if (!scenario) {
      return res.status(404).send('Scenario not found');
    }

    return res.json(scenario);
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
});

export default router;
