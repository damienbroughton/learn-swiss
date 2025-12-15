import dotenv from "dotenv";
dotenv.config();
import { connectToDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { generateFlashcardList, insertFlashcards } from '../services/flashcardService.js';
import { getOldestPendingJob, updateJobStatus } from '../services/jobService.js';
import { addFlashCardsToStory } from "../services/storyService.js";
// Worker loop settings
const POLL_INTERVAL = 5000; // 5 seconds
const JOB_TIMEOUT = 300000; // 5 min lock timeout
/**
 * Core function that looks for and processes a single pending job.
 * It handles the full lifecycle: finding, processing, and updating status (completed or failed).
 * @returns {Promise<boolean>} True if a job was found and processed (regardless of success), false otherwise.
 */
async function processJob() {
    // Attempt to find the oldest pending job
    const job = await getOldestPendingJob();
    if (job === null) {
        return false;
    }
    // Safely extract properties
    const jobId = job._id;
    const { storyId, createdBy, category, language, content, translatedLanguage } = job;
    console.log(`Processing Job ${jobId.toHexString()} for Story ${storyId.toHexString()}`);
    try {
        // 1. Generate flashcards using the language model service
        const generatedCards = await generateFlashcardList(createdBy, category ?? "", language, content, translatedLanguage);
        console.log(`Job ${jobId.toHexString()} generated ${generatedCards.length} flashcards.`);
        // 2. Save flashcards to database
        const insertedCards = await insertFlashcards(createdBy, generatedCards);
        console.log(`Job ${jobId.toHexString()} inserted ${insertedCards.length} flashcards.`);
        // 3. Link flashcards to story
        const flashCardIds = insertedCards.map((flashcard) => flashcard._id);
        await addFlashCardsToStory(createdBy, storyId, flashCardIds);
        // 4. Update job status to complete
        const result = {
            cardCount: insertedCards.length,
            message: 'Flashcards generated and saved successfully'
        };
        await updateJobStatus(jobId, 'completed', result);
        console.log(`Job ${jobId.toHexString()} completed successfully.`);
        return true;
    }
    catch (error) {
        // 5. Update job status to failed on error
        const result = {
            cardCount: 0,
            message: error instanceof Error ? error.message : 'An unknown error occurred during processing.'
        };
        await updateJobStatus(jobId, 'failed', result);
        console.error(`Job ${jobId.toHexString()} failed: ${result.message}`);
        return true; // Still return true because a job was found and processed (failed or not)
    }
}
/**
 * Starts the continuous worker loop.
 */
async function startWorker() {
    await connectToDB();
    console.log('Worker started. Looking for pending jobs...');
    // Use an immediate recursive function call with a delay
    const loop = async () => {
        try {
            const jobProcessed = await processJob();
            // If a job was processed, try again immediately to handle the queue quickly.
            const delay = jobProcessed ? 0 : POLL_INTERVAL;
            setTimeout(loop, delay);
        }
        catch (error) {
            console.error('Fatal error in worker loop:', error);
            // Wait for the polling interval before attempting to restart the loop
            setTimeout(loop, POLL_INTERVAL);
        }
    };
    // Start the loop
    loop();
}
// Execute the worker startup
startWorker();
//# sourceMappingURL=worker.js.map