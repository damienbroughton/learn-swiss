import dotenv from "dotenv";
dotenv.config();

import { connectToDB } from '../src/config/db.js';
import { generateFlashcardList, insertFlashcards } from '../src/services/flashcardService.js'
import { getOldestPendingJob, updateJobStatus } from '../src/services/jobService.js'
import { addFlashCardsToStory } from "../src/services/storyService.js";


// Worker loop settings
const POLL_INTERVAL = 5000; // every 3 seconds
const JOB_TIMEOUT = 300000; // 5 min lock timeout

// Main worker login

/**
 * Core function that looks for and processes a single pending job
 * @returns {boolean} True if job was processed, false otherwise
 */
async function processJob() {
    //find the oldest pending job
    const job = await getOldestPendingJob();

    if(job === null) return false;


    const jobId = job._id;
    const { storyId, createdBy, category, language, content, translatedLanguage } = job;

    console.log(`Processing Job ${jobId} for Story ${storyId}`);

    try {
        // Generate flashcards using gemini
        const generatedCards = await generateFlashcardList(createdBy, category, language, content, translatedLanguage);
        console.log(`Job ${jobId} generated ${generatedCards.length} flashcards.`);

        // Save flashcards to database
        const insertedCards = await insertFlashcards(createdBy, generatedCards);
        console.log(`Job ${jobId} inserted ${insertedCards.length} flashcards.`);

        // Link flashcards to story
        const flashCardIds = insertedCards.map((flashcard) => flashcard._id);
        const updatedStory = await addFlashCardsToStory(createdBy, storyId, flashCardIds);
    
        // Update job status to complete
        const result = {
            cardCount: generatedCards.length,
            message: 'Flashcards generated and saved successfully'
        };
        await updateJobStatus(jobId, 'completed', result);

        console.log(`Job ${jobId} completed successfully.`);

        return true;
    } catch (error) {
        // 5. Update job status to failed on error
        const errorMessage = error.message || 'An unknown error occurred during processing.';
        await updateJobStatus(jobId, 'failed', errorMessage);
        console.error(`Job ${jobId} failed: ${errorMessage}`);
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
            
            // If a job was processed, try again immediately.
            // If not, wait for the polling interval.
            const delay = jobProcessed ? 0 : POLL_INTERVAL;
            setTimeout(loop, delay);
        } catch (error) {
            console.error('Fatal error in worker loop:', error);
            // Wait for the polling interval before attempting to restart
            setTimeout(loop, POLL_INTERVAL);
        }
    };
    
    // Start the loop
    loop();
}

// Execute the worker startup
startWorker();