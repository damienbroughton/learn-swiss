import express from "express";
import { getExplanationByReference } from '../services/explanationService.js';

export const router = express.Router();

/**
 * GET /
 * Retrieve an explanation by reference
 */
router.get('/:reference', async (req, res) => {
    const { reference } = req.params;
      try {
    
        if (!reference || typeof reference !== 'string') 
          return res.status(400).send('No reference Provided.');
    
        const explanation = await getExplanationByReference(reference);
    
        return res.json(explanation);
      } catch (err) {
        console.error('Error retrieving explanation:', err);
        throw new Error('Internal server error');
      }
});

export default router;
