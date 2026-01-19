import express from "express";
import type { Response } from 'express';
import { getChallengesByReference, getChallengeTitles } from "../services/challengeService.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 
import { requireAuth } from "../middleware/requireAuth.js";

export const router = express.Router();

/**
 * GET /titles
 * Retrieve a list of unique challenge references.
 *
 * Public endpoint. Uses optionalAuth to allow the request to proceed.
 */
router.get('/titles', async (req: EnrichedRequest, res: Response) => {
    try {
        const titles = await getChallengeTitles();
        return res.json(titles);
    } catch (error) {
        console.error('Error retreiving titles:', error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * GET /categories/:reference
 * Retrieve all challenges matching the provided reference
 * 
 * Public endpoint
 */
router.get('/:reference', async (req: EnrichedRequest, res: Response) => {
  const uid = req.user?.uid; // undefined if not logged in
  const { reference } = req.params;
  try {

    if (!reference) 
      return res.status(400).send('No reference Provided.');

    const challenges = await getChallengesByReference(reference);

    return res.json(challenges);
  } catch (err) {
    console.error('Error retrieving challenges:', err);
    throw new Error('Internal server error');
  }
});

export default router;