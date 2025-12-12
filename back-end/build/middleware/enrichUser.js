import { db } from '../config/db.js';
/**
 * Middleware to enrich the request with the MongoDB user record.
 *
 * If `req.user` exists (from Firebase authentication), this middleware
 * fetches the corresponding user document from the database and attaches it
 * to `req.userRecord`.
 *
 * It proceeds regardless of whether a user record was found, allowing for
 * differentiation between authenticated-but-new users and fully registered users.
 *
 * @param {EnrichedRequest} req - The extended Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
export async function enrichUser(req, res, next) {
    try {
        if (!db) {
            console.error('Database connection not initialized. Proceeding without enrichment.');
            return next();
        }
        // Only attempt enrichment if Firebase auth has attached a UID
        if (req.user?.uid) {
            // Query the 'users' collection using the UserDocument type
            const dbUser = await db.collection('users').findOne({ uid: req.user.uid });
            if (dbUser) {
                // Attach MongoDB user document (UserDocument) to request
                req.userRecord = dbUser;
            }
        }
        next(); // Proceed regardless of whether the user record was found
    }
    catch (err) {
        console.error('Error loading user record:', err);
        // Respond with Internal Server Error on database failure
        res.status(500).send('Internal Server Error: Failed to enrich user data.');
    }
}
//# sourceMappingURL=enrichUser.js.map