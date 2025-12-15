import { ObjectId } from 'mongodb';
import type { FlashcardDocument, EnrichedFlashcardSummary } from '../types/flashcardInterfaces.js';
/**
 * Retreive list of flashcard categories
 *
 */
export declare function getFlashcardCategories(): Promise<string[]>;
/**
 * Enriches a raw FlashcardDocument with user-specific guess statistics.
 * @param {FlashcardDocument} flashcard - The raw document from the database.
 * @param {string | null} uid - The ID of the authenticated user, or null if unauthenticated.
 * @returns {EnrichedFlashcardSummary} The flashcard summary ready for client consumption.
 */
export declare function enrichFlashcard(flashcard: FlashcardDocument, uid: string | undefined): EnrichedFlashcardSummary;
/**
 * Retreive list of flashcards by category
 *
 */
export declare function getFlashcardsByCategory(uid: string | undefined, category: string): Promise<EnrichedFlashcardSummary[]>;
/**
 * Create new flashcard
 *
 */
export declare function createFlashcard(uid: string, category: string, firstLanguage: string, firstLanguageText: string, secondLanguage: string, secondLanguageText: string, formal: boolean, tags: string[]): Promise<FlashcardDocument>;
/**
 * Create new flashcards
 *
 */
export declare function insertFlashcards(uid: string, flashcards: FlashcardDocument[]): Promise<FlashcardDocument[]>;
/**
 * Update exisiting flashcard
 *
 */
export declare function updateFlashcard(id: string, uid: string, category: string, firstLanguage: string, firstLanguageText: string, secondLanguage: string, secondLanguageText: string, formal: boolean, tags: string[]): Promise<FlashcardDocument>;
/**
 * Update exisiting flashcard with a guess from user
 *
 */
export declare function guessFlashcard(id: string, uid: string, guessedCorrectly: boolean): Promise<{
    _id: ObjectId;
    category: string;
    firstLanguage: string;
    firstLanguageText: string;
    secondLanguage: string;
    secondLanguageText: string;
    formal: boolean;
    tags: string[];
}>;
/**
 * Generate new flashcard list using gemini ai
 *
 */
export declare function generateFlashcardList(uid: string, category: string, language: string, textBody: string, translatedLanguage: string): Promise<FlashcardDocument[]>;
//# sourceMappingURL=flashcardService.d.ts.map