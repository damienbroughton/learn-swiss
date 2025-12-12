import firebaseAdmin from "../config/firebase.js";
/**
 * Middleware to authenticate Firebase ID tokens from the 'authtoken' header.
 * * If an 'authtoken' header is present, it verifies the token and attaches
 * the decoded user information to `req.user`.
 * * Note: This middleware is designed to be optional; it allows requests without a
 * token to continue (useful for public endpoints).
 * For required authentication, subsequent middleware or the route handler must
 * check for the existence of `req.user`.
 *
 * @param {AuthenticatedRequest} req - The extended Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
export async function authenticateToken(req, res, next) {
    // Check for the 'authtoken' header (Express converts header names to lowercase)
    const authtoken = req.headers.authtoken;
    if (!authtoken) {
        // No token provided: allow the request to continue unauthenticated
        return next();
    }
    try {
        // Verify Firebase ID token using the admin SDK
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(authtoken);
        // Attach decoded user info to the request object for downstream use
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Error verifying Firebase token:', error);
        // Respond with Unauthorized status if the token is invalid or expired
        res.status(401).send('Unauthorized: Invalid or expired token.');
    }
}
//# sourceMappingURL=authenticateToken.js.map