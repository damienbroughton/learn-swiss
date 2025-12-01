import { db } from '../config/db.js';

/**
 * Middleware to enrich the request with the MongoDB user record.
 *
 * If `req.user.uid` exists (from Firebase authentication), this middleware
 * fetches the corresponding user document from the database and attaches it
 * to `req.userRecord`.
 *
 * Useful for routes that want access to user details without repeatedly
 * querying the database.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function enrichUser(req, res, next) {
  try {
    // Only attempt enrichment if Firebase auth has attached a UID
    if (req.user?.uid) {
      const dbUser = await db.collection('users').findOne({ uid: req.user.uid });

      if (dbUser) {
        req.userRecord = dbUser; // Attach MongoDB user document to request
      }
    }

    next(); // Proceed regardless of whether user was found
  } catch (err) {
    console.error('Error loading user record:', err);
    res.status(500).send('Internal Server Error');
  }
}
