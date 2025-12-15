import admin from "../config/firebase.js";
import type { UserDocument } from "../types/userInterfaces.js";
import type { Request } from 'express';

/**
 * Custom interface to extend the Express Request object, adding the 'user' property.
 * This property will hold the decoded Firebase ID token payload if authentication is successful.
 */
export interface AuthenticatedRequest extends Request {
    /** Decoded Firebase ID token payload. Undefined if no token or token is invalid. */
    user?: admin.auth.DecodedIdToken; 
    
    /** Headers are strings in Express, but we check for authtoken specifically. */
    headers: Request['headers'] & { authtoken?: string };
}


/**
 * Custom interface to extend the AuthenticatedRequest, adding the MongoDB user record.
 * This is the final request type used by protected route handlers.
 */
export interface EnrichedRequest extends AuthenticatedRequest {
    /** The corresponding User Document fetched from the MongoDB 'users' collection. */
    userRecord?: UserDocument;
}