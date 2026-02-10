import express from "express";
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { optionalAuth } from '../middleware/optionalAuth.js'; // Import the new middleware
import { 
    getFlashcardCategories, 
    getFlashcardsByCategory, 
    createFlashcard, 
    updateFlashcard, 
    generateFlashcardList 
} from "../services/flashcardService.js";
import { recordUserProgress } from '../services/userProgressService.js';
import type { Response } from 'express';
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 


export const router = express.Router();

/**
 * GET /categories
 * Retrieve a list of unique flashcard categories.
 *
 * Public endpoint. Uses optionalAuth to allow the request to proceed.
 */
router.get('/categories/:secondLanguage', optionalAuth, async (req: EnrichedRequest, res: Response) => {
    const { secondLanguage } = req.params;
    const uid = req.user?.uid; 
    try {
        if(!secondLanguage || typeof secondLanguage !== 'string')
            throw new Error("No second language provided.")
        const categories = await getFlashcardCategories(secondLanguage, uid);
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
router.get('/:category/:secondLanguage', optionalAuth, async (req: EnrichedRequest, res: Response) => {
    const { category, secondLanguage } = req.params;
    const uid = req.user?.uid; 
    const qForReview = req.query.forReview;
    const forReview = (typeof qForReview === 'string' && (qForReview === 'true' || qForReview === '1')) || false;
    const limit = req.query.limit ? parseInt(String(req.query.limit)) : undefined;

    try {
      if(!category || typeof category !== 'string')
        throw new Error("No category provided.")
      if(!secondLanguage || typeof secondLanguage !== 'string')
        throw new Error("No second language provided")

      if(forReview && !uid) {
        return res.status(401).send('Authentication required for review');
      }

      const options: any = { forReview };
      if (limit !== undefined) options.limit = limit;

      const result = await getFlashcardsByCategory(uid, category, secondLanguage, options);
      return res.json(result);
    } catch (error) {
        console.error(`Error in /${category}:`, error);
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
        if(!id || typeof id !== 'string')
          throw new Error("Missing Id.");
        if(!secondLanguage || typeof secondLanguage !== 'string')
          throw new Error("Missing second language.");
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