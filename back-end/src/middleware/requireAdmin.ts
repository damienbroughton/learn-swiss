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
export function requireAdmin(req: EnrichedRequest, res: Response, next: NextFunction) {
  if (!req.userRecord || req.userRecord.role !== 'admin') {
    return res.status(403).send('Forbidden: Admins only');
  }
  next();
}
