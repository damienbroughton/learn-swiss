import dotenv from "dotenv";
dotenv.config();

import { connectToDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { generateFlashcardList, insertFlashcards } from '../services/flashcardService.js'
import { getOldestPendingJob, updateJobStatus } from '../services/jobService.js'
import { getStory, addFlashCardsToStorySection, addErrorToStorySection } from "../services/storyService.js";
import type { FlashcardDocument } from '../types/flashcardInterfaces.js'; 
import type { StoryDocument } from '../types/storyInterfaces.js'; 
import type { JobDocument, JobResult } from "../types/jobInterfaces.js";

// Worker loop settings
const POLL_INTERVAL = 5000; // 5 seconds
const JOB_TIMEOUT = 300000; // 5 min lock timeout

/**
 * Core function that looks for and processes a single pending job.
 * It handles the full lifecycle: finding, processing, and updating status (completed or failed).
 * @returns {Promise<boolean>} True if a job was found and processed (regardless of success), false otherwise.
 */
async function processJob(): Promise<boolean> {
    // Attempt to find the oldest pending job
    const job: JobDocument | null = await getOldestPendingJob();

    if (job === null) {
        return false;
    }

    // Safely extract properties
    const jobId: ObjectId = job._id;
    const { storyId, createdBy, category, language, content, translatedLanguage } = job;

    console.log(`Processing Job ${jobId.toHexString()} for Story ${storyId.toHexString()}`);

    try {
        const story: StoryDocument = await getStory(storyId);

        let insertFlashcardCount = 0;
        for (const section of story.sections)  {  
            let count = await procesStorySection( storyId, section.sectionId, createdBy, 
                category, language, section.sectionContent, translatedLanguage);
            insertFlashcardCount += count;
        }
        // 4. Update job status to complete
        const result: JobResult = {
            cardCount: insertFlashcardCount,
            message: 'Flashcards generated/updated and saved successfully'
        };
        await updateJobStatus(jobId, 'completed', result);

        console.log(`Job ${jobId.toHexString()} completed successfully.`);

        return true;
    } catch (error) {
        // 5. Update job status to failed on error
        const result: JobResult = {
            cardCount: 0,
            message: error instanceof Error ? error.message : 'An unknown error occurred during processing.'
        };
        await updateJobStatus(jobId, 'failed', result);
        
        console.error(`Job ${jobId.toHexString()} failed: ${result.message}`);
        return true; // Still return true because a job was found and processed (failed or not)
    }
}

async function procesStorySection(storyId: ObjectId, sectionId: number, createdBy: string, category: string, 
    language: string, content: string, translatedLanguage: string): Promise<number> {
    // 1. Generate flashcards using the language model service
    const result = await generateFlashcardList(
        createdBy, 
        category ?? "", 
        language, 
        content, 
        translatedLanguage
    );

    if (Array.isArray(result)) {
        // 'result' is FlashcardDocument[]
        console.log(`Story: ${storyId.toHexString()} section: ${sectionId} generated ${result.length} flashcards.`);
        // 2. Save flashcards to database
        const insertedCards: FlashcardDocument[] = await insertFlashcards(createdBy, result);
        console.log(`Story: ${storyId.toHexString()} section: ${sectionId}  inserted ${result.length} flashcards.`);
        // 3. Link flashcards to story
        const flashCardIds: ObjectId[] = insertedCards.map((flashcard) => flashcard._id);
        await addFlashCardsToStorySection(createdBy, storyId, sectionId, flashCardIds);
        return insertedCards.length;
    } else {
        // 'result' is FlashcardError
        await addErrorToStorySection(createdBy, storyId, sectionId, result.errorMessage);
        console.error("API Error:", result.errorMessage);
        return 0;
    }
}

/**
 * Starts the continuous worker loop.
 */
async function startWorker(): Promise<void> {
    await connectToDB();
    console.log('Worker started. Looking for pending jobs...');
    
    // Use an immediate recursive function call with a delay
    const loop = async (): Promise<void> => {
        try {
            const jobProcessed = await processJob();
            
            // If a job was processed, try again immediately to handle the queue quickly.
            const delay = jobProcessed ? 0 : POLL_INTERVAL;
            setTimeout(loop, delay);
        } catch (error) {
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