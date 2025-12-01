import admin from "../config/firebase.js";

/**
 * Middleware to authenticate Firebase ID tokens.
 *
 * If an `authtoken` header is present, verifies the token and attaches
 * the decoded user information to `req.user`.
 *
 * Allows requests without a token to continue (useful for optional authentication).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticateToken(req, res, next) {
  const { authtoken } = req.headers;

  if (!authtoken) {
    // No token provided: allow request to continue
    return next();
  }

  try {
    // Verify Firebase ID token
    const user = await admin.auth().verifyIdToken(authtoken);
    req.user = user; // Attach decoded user info to request
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).send('Unauthorized');
  }
}
