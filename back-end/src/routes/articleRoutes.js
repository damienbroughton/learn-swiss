import express from "express";
import { db } from '../config/db.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const router = express.Router();

/**
 * GET /:name
 * Retrieve a single article by its unique name.
 *
 * @route GET /api/articles/:name
 * @param {string} req.params.name - The article's unique identifier.
 * @returns {Object} 200 - The article document.
 * @returns {string} 404 - Article not found message.
 */
router.get('/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Query the articles collection for a document matching the name.
    const article = await db.collection('articles').findOne({ name });

    if (!article) {
      // If no document was found, return a 404 Not Found response.
      return res.status(404).send('Article not found');
    }

    // Return the found article.
    return res.json(article);

  } catch (error) {
    // Log the server error for debugging and return a generic message.
    console.error(`Error fetching article "${name}":`, error);
    return res.status(500).send('An error occurred while retrieving the article');
  }
});

/**
 * POST /:name/upvote
 * Increment the upvote count for a given article.
 *
 * @route POST /api/articles/:name/upvote
 * @param {string} req.params.name - The unique name of the article.
 * @param {Object} req.user - Authenticated user object injected by requireAuth middleware.
 * @returns {Object} 200 - The updated article document.
 * @returns {string} 403 - Forbidden if user has already upvoted.
 * @returns {string} 404 - Article not found.
 */
router.post('/:name/upvote', requireAuth, async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;

  try {
    const article = await db.collection('articles').findOne({ name });

    if (!article) {
      return res.status(404).send('Article not found');
    }

    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);

    if (!canUpvote) {
      return res.status(403).send('Forbidden');
    }

    const updatedArticle = await db.collection('articles').findOneAndUpdate(
      { name },
      {
        $inc: { upvotes: 1 },
        $push: { upvoteIds: uid },
      },
      { returnDocument: 'after' }
    );

    return res.json(updatedArticle);

  } catch (error) {
    console.error(`Error upvoting article "${name}":`, error);
    return res.status(500).send('An error occurred while upvoting the article');
  }
});


/**
 * POST /:name/comment
 * Add a comment to an article.
 *
 * @route POST /api/articles/:name/comment
 * @param {string} req.params.name - The unique name of the article.
 * @param {string} req.body.postedBy - User ID of the commenter.
 * @param {string} req.body.text - The comment text.
 * @returns {Object} 200 - The updated article document.
 * @returns {string} 404 - Article not found.
 */
router.post('/:name/comment', requireAuth, async (req, res) => {
  const { name } = req.params;
  const { postedBy, text } = req.body;

  try {
    const article = await db.collection('articles').findOne({ name });

    if (!article) {
      return res.status(404).send('Article not found');
    }

    const updatedArticle = await db.collection('articles').findOneAndUpdate(
      { name },
      { $push: { comments: { postedBy, text } } },
      { returnDocument: 'after' }
    );

    return res.json(updatedArticle);

  } catch (error) {
    console.error(`Error commenting on article "${name}":`, error);
    return res.status(500).send('An error occurred while adding the comment');
  }
});


export default router;