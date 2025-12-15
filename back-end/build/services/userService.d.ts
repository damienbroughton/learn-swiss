/**
 * Get user by their userid
 */
export declare function getUser(uid: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
/**
 * Create a new user in the database if it doesn't exist.
 * If the user already exists, update their `updatedAt` timestamp.
 */
export declare function createUpdateUser(uid: string, username: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
//# sourceMappingURL=userService.d.ts.map