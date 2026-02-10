import express from "express";
import type { Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { recordUserProgress, getUserProgressSummary } from "../services/userProgressService.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 

export const router = express.Router();

/**
 * POST /
 * Record user progress for a specific content item.
 *
 * Requires authentication.
 */
router.post('/', requireAuth, async (req: EnrichedRequest, res: Response) => {
  const uid = req.user?.uid; 
  const { contentId, type, isCorrect, metadata } = req.body;

  try {
    if (!uid) 
      return res.status(401).send('Unauthorized. User not logged in.');
    
    let user = await recordUserProgress( uid, contentId, type, isCorrect, metadata );
    return res.json(user);
  } catch (err) {
    console.error('Error creating or updating user:', err);
    return res.status(500).send('Internal server error');
  }
});

/**
 * GET /summary
 * Returns aggregated user progress for dashboard (requires auth).
 */
router.get('/summary', requireAuth, async (req: EnrichedRequest, res: Response) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).send('Unauthorized. User not logged in.');
  try {
    const data = await getUserProgressSummary(uid);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching user progress summary:', err);
    return res.status(500).send('Internal server error');
  }
});

export default router;