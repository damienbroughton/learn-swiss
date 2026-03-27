import express from "express";
import type { Response } from 'express';
import type { EnrichedRequest } from '../types/requestInterfaces.js'; 
import { getExplanationByReference, getExplanations } from '../services/explanationService.js';

export const router = express.Router();

/**
 * GET /
 * Retrieve a list of unique explanation references.
 *
 */
router.get('/', async (req: EnrichedRequest, res: Response) => {
    try {
        const explanations = await getExplanations();

        return res.json(explanations);
    } catch (error) {
        console.error('Error retreiving titles:', error);
        return res.status(500).send('Internal server error');
    }
});
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
