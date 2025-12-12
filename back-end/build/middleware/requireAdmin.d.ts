import type { Response, NextFunction } from 'express';
import type { EnrichedRequest } from '../types/requestInterfaces.js';
/**
 * Middleware to restrict access to admin users.
 *
 * Requires `req.userRecord` to exist and have a `role` of 'admin'.
 * Returns 403 Forbidden if the user is not an admin.
 *
 * Can be extended in the future to support additional roles.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export declare function requireAdmin(req: EnrichedRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=requireAdmin.d.ts.map