import express from "express";
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const router = express.Router();

/**
 * POST /
 * Create a new user in the database if it doesn't exist.
 * If the user already exists, update their `updatedAt` timestamp.
 *
 * Requires authentication.
 */
router.post('/', requireAuth, async (req, res) => {
  const { uid } = req.user;

  try {
    let user = await db.collection('users').findOne({ uid });
    const now = new Date();

    if (!user) {
      const result = await db.collection('users').insertOne({
        uid,
        role: 'user',
        createdAt: now,
        updatedAt: now
      });
      user = await db.collection('users').findOne({ _id: result.insertedId });
    } else {
      await db.collection('users').updateOne(
        { uid },
        { $set: { updatedAt: now } }
      );
    }

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
router.get('/', requireAuth, async (req, res) => {
  const { uid } = req.user;

  try {
    const user = await db.collection('users').findOne({ uid });

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
