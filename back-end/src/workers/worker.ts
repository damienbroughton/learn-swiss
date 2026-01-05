import dotenv from "dotenv";
dotenv.config();

import express  from 'express';
import type { Request, Response } from 'express';
import { connectToDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { generateFlashcardList, insertFlashcards } from '../services/flashcardService.js'
import { getJob, updateJobStatus } from '../services/jobService.js'
import { getStory, addFlashCardsToStorySection, addErrorToStorySection } from "../services/storyService.js";
import type { FlashcardDocument } from '../types/flashcardInterfaces.js'; 
import type { StoryDocument } from '../types/storyInterfaces.js'; 
import type { JobDocument, JobResult } from "../types/jobInterfaces.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

/**
 * Core function that looks for and processes a single pending job.
 * It handles the full lifecycle: finding, processing, and updating status (completed or failed).
 * @returns {Promise<boolean>} True if a job was found and processed (regardless of success), false otherwise.
 */
app.post('/process-job', async (req: Request, res: Response) => {
    const { jobId } = req.body;

    if (!jobId) {
        console.error("No jobId provided in task request.");
        return res.status(400).send("No jobId provided");
    }

    // Attempt to find the oldest pending job
    const job: JobDocument = await getJob(jobId);

    if (job === null) {
        return false;
    }

    // Safely extract properties
    const { storyId, createdBy, category, language, content, translatedLanguage } = job;

    console.log(`Processing Job ${jobId} for Story ${storyId.toHexString()}`);

    try {
        const story: StoryDocument = await getStory(storyId);

        let insertFlashcardCount = 0;
        for (const section of story.sections)  {  
            if(section.flashcards && section.flashcards.length > 0) {
                console.log(`Story: ${storyId.toHexString()} section: ${section.sectionId} already has flashcards. Skipping.`);
                continue;
            }
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

        console.log(`Job ${jobId} completed successfully.`);

        res.status(200).send(`Job ${jobId} processed successfully.`);
    } catch (error) {
        // 5. Update job status to failed on error
        const result: JobResult = {
            cardCount: 0,
            message: error instanceof Error ? error.message : 'An unknown error occurred during processing.'
        };
        await updateJobStatus(jobId, 'failed', result);
        console.error(`Job ${jobId} failed: ${result.message}`);
        res.status(500).send("Internal Server Error. Cloud Tasks will retry.");
    }
});

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

// Start the server
app.listen(PORT, async () => {
    await connectToDB();
    console.log(`Worker service listening on port ${PORT}`);
});