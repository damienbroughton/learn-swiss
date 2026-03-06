import { ObjectId } from 'mongodb';
import type { FlashcardDocument, EnrichedFlashcardSummary } from '../types/flashcardInterfaces.js';

/**
 * Interface for a simple text/translation pair used for NPC replies.
 */
export interface ScenarioReply {
    /** The text in the target language (e.g., Swiss German). */
    text: string;
    /** The corresponding translation (e.g., English). */
    translation: string;
}

/**
 * Interface for the expected response structure within a Scenario step.
 * Defines the criteria for a successful user interaction.
 */
export interface ExpectedResponse {
    /** Array of regular expression patterns to match against the user's input. */
    patterns: string[];
    /** Array of example responses provided to the user. */
    exampleResponses: string[];
    /** The reply the NPC gives upon a successful match of the user's response. */
    successReply: ScenarioReply;
    /** Hints to help the user formulate a correct response. */
    hints: string[];
}

/**
 * Interface representing a single step (dialogue turn) in the learning scenario.
 */
export interface ScenarioStep {
    /** The sequential order of the step within the scenario. */
    order: number;
    /** The speaker of the dialogue turn ('npc' or 'user'). */
    speaker: 'npc' | 'user';
    /** The dialogue text in the target language. */
    text: string;
    /** The instruction for the user's response. */
    instruction: string;
    /** The translation of the dialogue text. */
    translation: string;
    /** Array of possible successful response patterns and their associated feedback/next steps.
     * This field is typically only present if the speaker is 'npc' (i.e., the user is expected to reply).
     */
    expectedResponses: ExpectedResponse[];
}

/**
 * Interface representing the full Scenario Document stored in the MongoDB collection.
 * Scenarios are interactive dialogues used for language practice.
 */
export interface ScenarioDocument {
    /** The unique MongoDB ObjectId for the document. */
    _id: ObjectId;

    /** The title of the scenario (e.g., "At the Bakery"). */
    title: string;

    /** The reference to the scenario (e.g., "at-the-bakery"). */
    reference: string;

    /** The primary category of the scenario (e.g., "shopping", "travel"). */
    category: string;

    /** The difficulty level (e.g., "beginner", "intermediate"). */
    difficulty: 'beginner' | 'intermediate' | 'advanced' | string;

    /** The path or URL to the thumbnail image for the scenario. */
    image: string;

    /** Array of descriptive tags for searching and filtering. */
    tags: string[];

    /** The ordered array of steps/dialogue turns that make up the scenario. */
    steps: ScenarioStep[];

    /** Array of user UIDs who have successfully completed this scenario. */
    completions: string[];
}