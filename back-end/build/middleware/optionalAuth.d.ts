import type { Response, NextFunction } from 'express';
import type { EnrichedRequest } from '../types/requestInterfaces.js';
/**
 * Middleware to optionally authenticate a user via Firebase.
 *
 * If a valid `authtoken` header is provided, the Firebase user is
 * attached to `req.user`. If no token is provided, or the token is invalid,
 * the request continues as anonymous.
 *
 * This is useful for endpoints that can serve both authenticated and
 * unauthenticated users.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export declare function optionalAuth(req: EnrichedRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=optionalAuth.d.ts.map