import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
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
export async function createJob(uid, type, storyId, content, language, translatedLanguage, category) {
    try {
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
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
        const result = await db.collection('jobs').findOne({ _id: update.insertedId });
        return result;
    }
    catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}
/**
 * Gets the oldest pending job in the database.
 */
export async function getOldestPendingJob() {
    const now = new Date();
    if (!db)
        throw new Error('Database connection not initialized. Check connectToDB call.');
    const job = await db.collection('jobs').findOneAndUpdate({
        status: 'pending'
    }, {
        $set: {
            status: 'processing',
            updatedAt: now
        }
    }, {
        sort: { createdAt: 1 }, // Process oldest job first
        returnDocument: 'after'
    });
    return job;
}
/**
 * Updates the status of a job in the database.
 * @param {ObjectId} id - The ID of the job to update.
 * @param {string} status - The new status ('processing', 'completed', 'failed').
 * @param {string | null} result - Optional result or error message.
 */
export async function updateJobStatus(id, status, result = "") {
    if (!db)
        throw new Error('Database connection not initialized. Check connectToDB call.');
    const updatePayload = {
        updatedAt: new Date(),
        status: status,
        error: "",
        result: {}
    };
    if (result !== null && status === 'failed') {
        updatePayload.error = result;
    }
    else if (result !== null && status === 'result') {
        updatePayload.result = result;
    }
    await db.collection('jobs').updateOne({ _id: id }, { $set: updatePayload });
}
//# sourceMappingURL=jobService.js.map