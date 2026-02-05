import { ObjectId } from 'mongodb';

/**
 * Interface for a single user's guess attempt on a Flashcard.
 * Tracks the performance of a user on a specific card.
 */
export interface FlashcardGuess {
    /** The unique ID of the user who made the guess. */
    guessedBy: string;

    /** The date and time when the guess was made. */
    guessDate: Date;

    /** Boolean indicating if the user guessed the flashcard correctly. */
    guessedCorrectly: boolean;
}

/**
 * The error message that occured during flashcard generation.
 */
export interface FlashcardError {
    /** The error message that occured during flashcard generation. */
    errorMessage: string;
}

/**
 * Interface representing the full Flashcard Document stored in the MongoDB collection.
 * Contains the core linguistic content and metadata.
 */
export interface FlashcardDocument {
    /** The unique MongoDB ObjectId for the flashcard. */
    _id: ObjectId;

    /** The category this flashcard belongs to (e.g., 'Verbs', 'Food'). */
    category: string;

    /** The language for the first language */
    firstLanguage: string;

    /** The text content in the first language. */
    firstLanguageText: string;

    /** The language for the second language */
    secondLanguage: string;

    /** The text content in the second language. */
    secondLanguageText: string;

    /** Indicates if the term or phrase is formal/polite register. */
    formal: boolean;

    /** Array of tags associated with the flashcard for searching/filtering. */
    tags: string[];

    /** The unique ID of the user who created the flashcard. */
    createdBy: string;

    /** Timestamp when the flashcard was created. */
    createdAt: Date;

    /** The unique ID of the user who last updated the flashcard. */
    updatedBy: string;

    /** Timestamp when the flashcard was last updated. */
    updatedAt: Date;
    
    /** * History of user guesses for this flashcard.
     * Note: This array can grow large and might be offloaded to a separate collection in the future.
     */
    guesses?: FlashcardGuess[]; 
}

/**
 * Interface representing the Flashcard data enriched with user-specific guess information,
 * suitable for sending back to the client.
 * Excludes sensitive or unnecessary backend metadata like `createdBy` and raw `guesses`.
 */
export interface EnrichedFlashcardSummary extends Omit<FlashcardDocument, 'guesses' | 'createdBy' | 'updatedBy'> {
    /**
     * User-specific guess statistics.
     * Only populated if the requesting user is authenticated and has interacted with the card.
     */
    userGuess?: {
        /** Whether the user's most recent guess was correct. */
        guessedCorrectly: boolean;

        /** The date of the user's most recent guess. */
        lastGuessDate: Date;

        /** The total number of times the user has guessed this card. */
        totalGuesses: number;
    };

    /** Progress summary fields (attempts, successes, lastCompletedAt) to match `userProgress` */
    attempts: number;
    successes: number;
    lastCompletedAt: Date | null;
}