import express from "express";
import type { Response } from 'express';
import { getChallenges, getChallengesByReference } from "../services/challengeService.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 
import { optionalAuth } from "../middleware/optionalAuth.js";

export const router = express.Router();


/**
 * GET /
 * Retrieve a list of unique challenge references.
 *
 * Public endpoint. Uses optionalAuth to allow the request to proceed.
 */
router.get('/', optionalAuth, async (req: EnrichedRequest, res: Response) => {
    try {
        const uid = req.user?.uid; // undefined if not logged in
        const titles = await getChallenges(uid);
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

    if (!reference || typeof reference !== 'string') 
      return res.status(400).send('No reference Provided.');

    const challenges = await getChallengesByReference(reference, uid);

    return res.json(challenges);
  } catch (err) {
    console.error('Error retrieving challenges:', err);
    throw new Error('Internal server error');
  }
});

export default router;