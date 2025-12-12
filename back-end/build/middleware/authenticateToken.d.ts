import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/requestInterfaces.js';
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
export declare function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=authenticateToken.d.ts.map