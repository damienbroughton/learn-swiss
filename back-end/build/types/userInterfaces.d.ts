import { ObjectId } from 'mongodb';
/**
 * Defines the possible roles a user can have within the application.
 */
export type UserRole = 'user' | 'admin' | string;
/**
 * Interface representing the full User Document stored in the MongoDB collection,
 * typically mirroring the authenticated user's profile and roles.
 */
export interface UserDocument {
    /** The MongoDB ObjectId for the document. */
    _id: ObjectId;
    /** The unique identifier from the authentication provider (e.g., Firebase Auth UID). */
    uid: string;
    /** The role of the user, used for authorization. */
    role: UserRole;
    /** Timestamp when the user document was created. */
    createdAt: Date;
    /** Timestamp when the user document was last updated. */
    updatedAt: Date;
    [key: string]: any;
}
//# sourceMappingURL=userInterfaces.d.ts.map