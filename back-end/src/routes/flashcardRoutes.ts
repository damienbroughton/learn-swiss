import express from "express";
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js'; // Import the new middleware
import { 
    getFlashcardCategories, 
    getFlashcardsByCategory, 
    createFlashcard, 
    insertFlashcards, 
    guessFlashcard, 
    updateFlashcard, 
    generateFlashcardList 
} from "../services/flashcardService.js";
import { addFlashCardsToStory } from "../services/storyService.js";
import type { Response } from 'express';
// Assuming this imports the type that extends Request with user and userRecord
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 
import { ObjectId } from "mongodb";


export const router = express.Router();

/**
 * GET /categories
 * Retrieve a list of unique flashcard categories.
 *
 * Public endpoint. Uses optionalAuth to allow the request to proceed.
 */
router.get('/categories', optionalAuth, async (req: EnrichedRequest, res: Response) => {
    try {
        const categories = await getFlashcardCategories();
        console.log("Retrieving categories", categories);
        return res.json(categories);
    } catch (error) {
        console.error('Error in /categories:', error);
        return res.status(500).send('Internal server error');
    }
});


/**
 * GET /:category
 * Retrieve flashcards for a specific category.
 *
 * Public endpoint, but uses optionalAuth to enrich flashcards with previous guesses
 * if the user is logged in.
 */
router.get('/:category', optionalAuth, async (req: EnrichedRequest, res: Response) => {
    const { category } = req.params;
    // req.user?.uid is correctly accessed here due to optionalAuth
    const uid = req.user?.uid; 

    try {
      if(category === undefined)
        throw new Error("No category provided.")

      const result = await getFlashcardsByCategory(uid, category);
      return res.json(result);
    } catch (error) {
        console.error(`Error in /${category}:`, error);
        return res.status(500).send('Internal server error');
    }
});


/**
 * POST /:id/guess
 * Add a guess to a flashcard.
 *
 * Requires authentication (`req.user` is guaranteed to exist).
 */
router.post('/:id/guess', requireAuth, async (req: EnrichedRequest, res: Response) => {
    // req.user is guaranteed to be defined by requireAuth middleware
    const { id } = req.params;
    const uid = req.user!.uid; 
    const { guessedCorrectly } = req.body as { guessedCorrectly: boolean };

    try {
        if(!id)
          throw new Error("No Id provided");

        const result = await guessFlashcard(id, uid, guessedCorrectly); 

        if (result) {
            return res.status(200).json(result);
        } else {
            return res.status(404).send('Flashcard not found');
        }
    } catch (error) {
        console.error('Error in /:id/guess:', error);
        return res.status(500).send('Internal server error');
    }
});


/**
 * POST /
 * Create a new flashcard.
 *
 * Requires authentication and admin role.
 */
router.post('/', requireAuth, requireAdmin, async (req: EnrichedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags } = req.body;

    if (!category || !firstLanguageText || !secondLanguageText || typeof formal !== 'boolean') {
        return res.status(400).send('Missing or invalid fields');
    }

    try {
        const result = await createFlashcard(uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags);

        return res.json(result);
    } catch (error) {
        console.error('Error in POST /:', error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * POST /bulk/:storyId
 * Create flashcards in bulk.
 *
 * Requires authentication and admin role.
 */
router.post('/bulk/:storyId', requireAuth, requireAdmin, async (req: EnrichedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { storyId } = req.params;
    const flashcards = req.body; // Array of flashcard creation objects

    try {
        const result = await insertFlashcards(uid, flashcards);
        // Extract the MongoDB ObjectIds from the inserted documents
        const flashCardIds = result.map((flashcard) => flashcard?._id).filter((id): id is ObjectId => !!id); // Filter out undefined/null and assert type

        // Link the newly created flashcards to the story
        if(!storyId)
          throw new Error("Missing Story Id");

        await addFlashCardsToStory(uid, new ObjectId(storyId), flashCardIds);
        console.log("Inserted and linked flashcard IDs:", flashCardIds);

        return res.json(result);
    } catch (error) {
        console.error('Error in POST /bulk/:storyId:', error);
        return res.status(500).send('Internal server error');
    }
});


/**
 * PATCH /:id
 * Update an existing flashcard.
 *
 * Requires authentication and admin role.
 */
router.patch('/:id', requireAuth, requireAdmin, async (req: EnrichedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { id } = req.params;
    const { category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags } = req.body;

    if (!category || !firstLanguageText || !secondLanguageText || typeof formal !== 'boolean') {
        return res.status(400).send('Missing or invalid fields');
    }

    try {
        if(!id)
          throw new Error("Missing Id.");
        const result = await updateFlashcard(id, uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags);

        return res.json(result);
    } catch (error) {
        console.error('Error in PATCH /:id:', error);
        return res.status(500).send('Internal server error');
    }
});

/**
 * POST /generate/
 * Generate a new flashcard list from text content using an external service (LLM).
 *
 * Requires authentication and admin role.
 */
router.post('/generate/', requireAuth, requireAdmin, async (req: EnrichedRequest, res: Response) => {
    const uid = req.user!.uid;
    const { category, language, textBody, translatedLanguage } = req.body;

    if (!category || !language || !textBody || !translatedLanguage) {
        return res.status(400).send('Missing or invalid fields');
    }

    try {
        const result = await generateFlashcardList(uid, category, language, textBody, translatedLanguage);

        return res.json(result);
    } catch (error) {
        console.error('Error in POST /generate/:', error);
        // Note: Corrected the typo "nternal"
        return res.status(500).send(`Internal server error: ${error}`);
    }
});

export default router;