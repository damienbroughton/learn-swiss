import express from "express";
import type { Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getUser, createUpdateUser } from "../services/userService.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 

export const router = express.Router();

/**
 * POST /
 * Create a new user in the database if it doesn't exist.
 * If the user already exists, update their `updatedAt` timestamp.
 *
 * Requires authentication.
 */
router.post('/', requireAuth, async (req: EnrichedRequest, res: Response) => {
  const uid = req.user?.uid; 
  const { username } = req.body;


  try {
    if (!uid) 
      return res.status(401).send('Unauthorized. User not logged in.');
    
    let user = await createUpdateUser( uid, username );
    return res.json(user);
  } catch (err) {
    console.error('Error creating or updating user:', err);
    return res.status(500).send('Internal server error');
  }
});


/**
 * GET /
 * Retrieve the currently authenticated user's data.
 *
 * Requires authentication.
 */
router.get('/', requireAuth, async (req: EnrichedRequest, res: Response) => {
  const uid = req.user?.uid; 

  try {
    if (!uid) 
      return res.status(401).send('Unauthorized. User not logged in.');

    const user = await getUser( uid );

    if (!user) {
      return res.status(401).send('Unauthorized');
    }

    return res.json(user);
  } catch (err) {
    console.error('Error retrieving user:', err);
    return res.status(500).send('Internal server error');
  }
});

export default router;
