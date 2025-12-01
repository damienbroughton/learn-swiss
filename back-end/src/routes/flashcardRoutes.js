import express from "express";
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { getFlashcardCategories, getFlashcardsByCategory, createFlashcard, insertFlashcards, guessFlashcard, updateFlashcard, generateFlashcardList } from "../services/flashcardService.js";

export const router = express.Router();

/**
 * GET /categories
 * Retrieve a list of unique flashcard categories.
 *
 * Public endpoint.
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await getFlashcardCategories();
    console.log("Retreiving categories", categories);
    return res.json(categories);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});


/**
 * GET /:category
 * Retrieve flashcards for a specific category.
 *
 * If user is logged in, enrich flashcards with previous guesses.
 */
router.get('/:category', async (req, res) => {
  const { category } = req.params;
  const uid = req.user?.uid;

  try {
    const result = await getFlashcardsByCategory(uid, category);
    return res.json(result);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});


/**
 * POST /:id/guess
 * Add a guess to a flashcard.
 *
 * Requires authentication.
 */
router.post('/:id/guess', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { uid } = req.user;
  const { guessedCorrectly } = req.body;

  try {
    let result = await guessFlashcard(id, uid, guessedCorrectly);
    if(result){
      return res.status(200).json(result);
    } else {
      res.status(404).send('Flashcard not found');
    }
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});


/**
 * POST /
 * Create a new flashcard.
 *
 * Requires authentication and admin role.
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { uid } = req.user;
  const { category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags } = req.body;

  if (!category || !firstLanguageText || !secondLanguageText || typeof formal !== 'boolean') {
    return res.status(400).send('Missing or invalid fields');
  }

  try {
    const result = await createFlashcard(uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags);

    return res.json(result);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});

/**
 * POST /
 * Create a flashcards in bulk.
 *
 * Requires authentication and admin role.
 */
router.post('/bulk/', requireAuth, requireAdmin, async (req, res) => {
  const { uid } = req.user;
  const flashcards = req.body;


  try {
    const result = await insertFlashcards(uid, flashcards);
    return res.json(result);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});


/**
 * PATCH /:id
 * Update an existing flashcard.
 *
 * Requires authentication and admin role.
 */
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { uid } = req.user;
  const { id } = req.params;
  const { category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags } = req.body;

  if (!category || !firstLanguageText || !secondLanguageText || typeof formal !== 'boolean') {
    return res.status(400).send('Missing or invalid fields');
  }

  try {
    const result = await updateFlashcard(id, uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags);

    return res.json(result);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});

/**
 * POST /
 * Create a new flashcard.
 *
 * Requires authentication and admin role.
 */
router.post('/generate/', requireAuth, requireAdmin, async (req, res) => {
  const { uid } = req.user;
  const { category, language, textBody, translatedLanguage } = req.body;

  if (!category || !language || !textBody || !translatedLanguage) {
    return res.status(400).send('Missing or invalid fields');
  }

  try {
    const result = await generateFlashcardList(uid, category, language, textBody, translatedLanguage);

    return res.json(result);
  } catch (error) {
    return res.status(500).send('Internal server error', error);
  }
});

export default router;