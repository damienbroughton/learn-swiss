import { ObjectId } from 'mongodb';
/**
 * Interface for the nested 'result' object in the Job document.
 */
interface JobResult {
    cardCount: number;
    message: string;
    [key: string]: any;
}
/**
 * Interface representing the full Job Document stored in the MongoDB collection.
 * Jobs are typically created for background processes like generating flashcards
 * or analyzing content.
 */
export interface JobDocument {
    /** The unique identifier for the document, stored as a MongoDB ObjectId. */
    _id: ObjectId;
    /** The unique ID of the user who created the job. */
    createdBy: string;
    /** Timestamp when the job was created. */
    createdAt: Date;
    /** The unique ID of the user who last updated the job. */
    updatedBy: string;
    /** Timestamp when the job was last updated. */
    updatedAt: Date;
    /** The current status of the job (e.g., 'pending', 'processing', 'completed', 'failed'). */
    status: 'pending' | 'processing' | 'completed' | 'failed' | string;
    /** The type of background task the job represents (e.g., 'extract-flashcards'). */
    type: 'extract-flashcards' | 'analyze-story' | string;
    /** The ObjectId reference to the Story document associated with this job. */
    storyId: ObjectId;
    /** The content (e.g., text of the story) the job is processing. */
    content: string;
    /** The source language of the content. */
    language: string;
    /** The target translation language for the job. */
    translatedLanguage: string;
    /** The category associated with the job, which can be null. */
    category: string | null;
    /** Error message if the job failed, which can be null. */
    error: string | null;
    /** Nested object containing the successful outcome or metrics of the job. */
    result: JobResult | null;
}
export {};
//# sourceMappingURL=jobInterfaces.d.ts.map