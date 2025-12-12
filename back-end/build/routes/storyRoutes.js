import express from "express";
import { requireAuth } from '../middleware/requireAuth.js';
import { getStories, getStory, createStory } from "../services/storyService.js";
import { createJob } from "../services/jobService.js";
export const router = express.Router();
/**
 * GET /
 * Retrieve a list of all stories
 */
router.get('/', async (req, res) => {
    try {
        const response = await getStories();
        return res.json(response);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
});
/**
 * Get Story by id
 */
router.get('/:reference', async (req, res) => {
    const uid = req.user?.uid; // undefined if not logged in
    const { reference } = req.params;
    try {
        if (!reference)
            return res.status(400).send('No reference Provided.');
        const story = await getStory(uid, reference);
        return res.json(story);
    }
    catch (err) {
        console.error('Error retrieving user:', err);
        throw new Error('Internal server error');
    }
});
/**
 * POST /
 * Create a new user in the database if it doesn't exist.
 * If the user already exists, update their `updatedAt` timestamp.
 *
 * Requires authentication.
 */
router.post('/', requireAuth, async (req, res) => {
    const uid = req.user?.uid; // undefined if not logged in
    if (!uid)
        return res.status(401).send('Unauthorized. User not logged in.');
    const { title, language, content, translatedLanguage, tags } = req.body;
    try {
        let story = await createStory(uid, title, language, content);
        if (!story)
            return res.status(400).send('Error creating story.');
        let job = await createJob(uid, "extract-flashcards", story._id, content, language, translatedLanguage, tags);
        return res.json(story);
    }
    catch (err) {
        console.error('Error creating story:', err);
        return res.status(500).send('Internal server error');
    }
});
export default router;
//# sourceMappingURL=storyRoutes.js.map