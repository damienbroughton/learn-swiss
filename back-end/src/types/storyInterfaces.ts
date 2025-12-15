import { ObjectId } from 'mongodb';

/**
 * Interface representing a list of ObjectId references for embedded content
 * like flashcards or notes.
 */
export type ContentReferences = ObjectId[];

/**
 * Interface representing the full Story Document stored in the MongoDB collection.
 * Stories are typically longer pieces of text (like songs or short stories) 
 * used for reading practice and linked to flashcards.
 */
export interface StoryDocument {
    /** The unique MongoDB ObjectId for the story. */
    _id: ObjectId;

    /** A URL-friendly, unique slug for the story (e.g., "det-äne-am-bergli-1"). */
    reference: string;

    /** The unique ID of the user who created the story. */
    createdBy: string;

    /** Timestamp when the story was created. */
    createdAt: Date;

    /** The unique ID of the user who last updated the story. */
    updatedBy: string;

    /** Timestamp when the story was last updated. */
    updatedAt: Date;

    /** The display title of the story (e.g., "Det äne am Bergli"). */
    title: string;

    /** The language of the story (e.g., "Swiss-German"). */
    language: string;

    /** The translated language of the flashcards (e.g., "English"). */
    translatedLanguage: string;

    /** The main text content of the story. */
    content: string;

    /** Array of ObjectIds linking to Flashcard documents extracted from this story. */
    flashcards: ContentReferences;
}