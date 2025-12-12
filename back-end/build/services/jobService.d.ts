import { ObjectId } from 'mongodb';
import type { JobDocument } from '../types/jobInterfaces.js';
/**
 * Creates a new job in the database.
 * @param {string} uid - The User Id of the user creating the job
 * @param {ObjectId} id - The ID of the job to update.
 * @param {string} type - The ID of the job to update.
 * @param {ObjectId} storyId - The story id
 * @param {string} content - The story content
 * @param {string} language - The original language of the story
 * @param {string} translatedLanguage - the language to create flashcards for
 * @param {string} category - The category to tag against the story
 */
export declare function createJob(uid: string, type: string, storyId: ObjectId, content: string, language: string, translatedLanguage: string, category: string): Promise<import("mongodb").WithId<JobDocument> | null>;
/**
 * Gets the oldest pending job in the database.
 */
export declare function getOldestPendingJob(): Promise<import("mongodb").WithId<import("bson").Document> | null>;
/**
 * Updates the status of a job in the database.
 * @param {ObjectId} id - The ID of the job to update.
 * @param {string} status - The new status ('processing', 'completed', 'failed').
 * @param {string | null} result - Optional result or error message.
 */
export declare function updateJobStatus(id: ObjectId, status: string, result?: string): Promise<void>;
//# sourceMappingURL=jobService.d.ts.map