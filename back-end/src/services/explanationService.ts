import { db } from '../config/db.js';
import type { ExplanationDocument } from '../types/explanationInterface.js';

/**
 * Retrieve list of explanations
 */
export async function getExplanations() {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const explanations = await db.collection<ExplanationDocument>('explanations').find().toArray();
    const explanationReferences = [...new Set(explanations.map(explanation => explanation.reference))]
    return explanationReferences;

  } catch (err) {
    console.error('Error fetching explanation:', err);
    throw new Error('Internal server error');
  }
}

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