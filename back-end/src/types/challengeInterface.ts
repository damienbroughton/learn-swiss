import { ObjectId } from 'mongodb';

/**
 * Interface for the core challenge content, including the template and options.
 */
export interface ChallengeContent {
    /** The sentence with a placeholder (e.g., "Ich sehe den {{target}} Hund.") */
    sentenceTemplate: string;

    /** The dictionary form of the adjective (e.g., "alt") */
    baseWord: string;

    /** The correct declination (e.g., "alten") */
    correctAnswer: string;

    /** A list of 4 variations used as multiple-choice distractors. */
    options: string[];
}

/**
 * Interface for grammatical metadata used for hints and filtering.
 */
export interface ChallengeMetadata {
    /** The noun associated with the adjective, including its article (e.g., "der Hund") */
    noun: string;

    /** The grammatical gender: 'masculine' | 'feminine' | 'neuter' | 'plural' */
    gender: 'masculine' | 'feminine' | 'neuter' | 'plural' | string;

    /** The grammatical case: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv' */
    case: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv' | string;

    /** The type of article preceding the adjective. */
    articleType: 'definite' | 'indefinite' | 'none' | 'possessive' | string;

    /** The degree of comparison. */
    degree: 'positive' | 'comparative' | 'superlative';

    /** A detailed linguistic explanation of why the answer is correct. */
    explanation: string;
}

/**
 * Interface representing the full Challenge Document stored in MongoDB.
 * This structure is used for adjective declination but flexible enough for prepositions or verbs.
 */
export interface ChallengeDocument {
    /** The unique identifier for the document. */
    _id: ObjectId;

    /** A unique string identifier for the challenge type (e.g., "adjective-declination"). */
    reference: string;

    /** The display title of the challenge category. */
    title: string;

    /** The target language of the challenge (e.g., "German"). */
    language: string;

    /** Difficulty level following the CEFR scale (e.g., 'A1', 'B1'). */
    difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | string;

    /** Nested object containing the sentence and answer logic. */
    content: ChallengeContent;

    /** Nested object containing grammatical metadata and hints. */
    metadata: ChallengeMetadata;

    /** Array of strings for granular filtering (e.g., ["animals", "weak_declension"]). */
    tags: string[];

    /** The unique ID of the user who created this challenge. */
    createdBy: string;

    /** Timestamp when the challenge was created. */
    createdAt: Date;

    /** The unique ID of the user who last updated this challenge. */
    updatedBy: string;

    /** Timestamp when the challenge was last updated. */
    updatedAt: Date;
}