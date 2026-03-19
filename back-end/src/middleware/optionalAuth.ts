import type { Response, NextFunction } from 'express';
import admin from "../config/firebase.js";
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 

/**
 * Middleware to optionally authenticate a user via Firebase.
 *
 * If a valid `Authorization: Bearer <token>` header is provided, the Firebase user is
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
export async function optionalAuth(req: EnrichedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : undefined;

  if (!token) {
    // No token → continue as anonymous
    return next();
  }

  try {
    const user = await admin.auth().verifyIdToken(token);
    req.user = user; // attach user to request
  } catch (err) {
    console.warn('Invalid auth token provided, continuing as anonymous.');
  }

  next(); // always call next regardless of token validation
}
