import type { Response, NextFunction } from 'express';
import firebaseAdmin from "../config/firebase.js"; 
import type { AuthenticatedRequest } from '../types/requestInterfaces.js'; 

/**
 * Middleware to authenticate Firebase ID tokens from the 'Authorization: Bearer <token>' header.
 * * If an Authorization header is present, it verifies the token and attaches
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
export async function authenticateToken(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> {
    
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length).trim()
        : undefined;

    if (!token) {
        // No token provided: allow the request to continue unauthenticated
        return next();
    }

    try {
        // Verify Firebase ID token using the admin SDK
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        
        // Attach decoded user info to the request object for downstream use
        req.user = decodedToken; 
        
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        
        // Respond with Unauthorized status if the token is invalid or expired
        res.status(401).send('Unauthorized: Invalid or expired token.');
    }
}