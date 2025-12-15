import type { Response, NextFunction } from 'express';
import type { EnrichedRequest } from '../types/requestInterfaces.js';
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
export declare function enrichUser(req: EnrichedRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=enrichUser.d.ts.map