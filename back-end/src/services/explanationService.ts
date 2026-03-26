import { db } from '../config/db.js';
import type { ExplanationDocument } from '../types/explanationInterface.js';

/**
 * Retrieve full explanation details by reference.
 */
export async function getExplanationByReference(reference: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const explanation = await db.collection<ExplanationDocument>('explanations').findOne({ reference });
    return explanation;

  } catch (err) {
    console.error('Error fetching explanation:', err);
    throw new Error('Internal server error');
  }
}