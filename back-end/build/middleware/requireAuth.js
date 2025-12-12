/**
 * Middleware to ensure the user is authenticated.
 *
 * Checks for `req.user`, which should be set by a preceding authentication
 * middleware (e.g., optionalAuth or authenticateToken).
 *
 * Responds with 401 Unauthorized if the user is not authenticated.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).send('Unauthorized');
    }
    next();
}
//# sourceMappingURL=requireAuth.js.map