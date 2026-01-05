import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import { enqueueJob } from '../config/tasks.js';
import type { JobDocument, JobResult } from '../types/jobInterfaces.js'; // Import interfaces

/**
 * Creates a new job in the database and enqueues a google cloud task to process it.
 * @param {string} uid - The User Id of the user creating the job
 * @param {ObjectId} id - The ID of the job to update.
 * @param {string} type - The ID of the job to update.
 * @param {ObjectId} storyId - The story id
 * @param {string} content - The story content
 * @param {string} language - The original language of the story
 * @param {string} translatedLanguage - the language to create flashcards for
 * @param {string} category - The category to tag against the story
 */
export async function createJob(uid: string, type: string, storyId: ObjectId, content: string, 
    language: string, translatedLanguage: string, category: string): Promise<JobDocument> {
    try {
        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

        console.log(`Creating Job: ${storyId}, ${type}`);

        const now = new Date();

        const update = await db.collection('jobs').insertOne({ 
            createdBy: uid, 
            createdAt: now,
            updatedBy: uid, 
            updatedAt: now,
            status: "pending",
            type, 
            storyId, 
            content,
            language,
            translatedLanguage,
            category
        });

        const result = await db.collection<JobDocument>('jobs').findOne({ _id: update.insertedId });
        if(!result)
            throw new Error('Newly insterted job could not be retreived.');

        // Hand off to the background worker via the config helper
        try {
            await enqueueJob(result._id.toString());
        } catch (error) {
            console.error('Error dispatching task:', error);
            // We don't throw here so the user still gets their "Job Created" UI response,
            // but the status in DB remains 'pending' for a retry mechanism to catch.
        }
        return result;
        
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}

/**
 * Gets the oldest pending job in the database.
 */
export async function getOldestPendingJob(): Promise<JobDocument | null>{
    const now = new Date();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const job = await db.collection<JobDocument>('jobs').findOneAndUpdate(
    { 
        $or: [
                { status: 'pending' },
                { status: 'processing', updatedAt: { $lt: fiveMinutesAgo } }
            ]        
    },
        { 
            $set: { 
                status: 'processing', 
                updatedAt: now 
            } 
        },
        { 
            sort: { createdAt: 1 }, // Process oldest job first
            returnDocument: 'after' 
        }
    );

    return job;
}

/**
 * Updates the status of a job in the database.
 * @param {ObjectId} id - The ID of the job to retrieve.
 */
export async function getJob(id: ObjectId): Promise<JobDocument> {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const job = await db.collection<JobDocument>('jobs').findOne({ _id: new ObjectId(id) });

    if (!job) {
        console.error(`Job ${id} not found in database.`);
        throw new Error(`Job ${id} could not be retreived.`);
    }

    // Set status to processing (Optional but good for UI)
    await db.collection('jobs').updateOne(
        { _id: job._id },
        { $set: { status: 'processing', updatedAt: new Date() } }
    );

    return job;
  } catch (err) {
    console.error('Error retrieving job:', err);
    throw new Error('Internal server error');
  }
}

/**
 * Updates the status of a job in the database.
 * @param {ObjectId} id - The ID of the job to update.
 * @param {string} status - The new status ('processing', 'completed', 'failed').
 * @param {string | null} result - Optional result or error message.
 */
export async function updateJobStatus(id: ObjectId, status: string, result: JobResult) {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const updatePayload = {
        updatedAt: new Date(),
        status: status,
        error: "",
        result: {}
    };
    if (result !== null && status === 'failed') {
        updatePayload.error = result.message;
    } else if (result !== null && status === 'result') {
        updatePayload.result = result;
    }

    console.log(updatePayload);

    await db.collection('jobs').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatePayload }
    );
}