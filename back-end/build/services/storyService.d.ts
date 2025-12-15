import { ObjectId } from 'mongodb';
import type { StoryDocument } from '../types/storyInterfaces.js';
/**
 * Retreive list of stories
 *
 */
export declare function getStories(): Promise<{
    _id: ObjectId;
    reference: string;
    title: string;
    language: string;
    translatedLanguage: string;
}[]>;
/**
 * Retreive story and linked flashcards by id
 *
 */
export declare function getStory(uid: string | undefined, reference: string): Promise<{
    id: any;
    reference: any;
    title: any;
    language: any;
    content: any;
    flashcards: import("../types/flashcardInterfaces.js").EnrichedFlashcardSummary[];
}>;
/**
 * Create new flashcard
 *
 */
export declare function createStory(uid: string, title: string, language: string, content: string): Promise<import("mongodb").WithId<StoryDocument> | null>;
/**
 * Add flashcard references to story
 *
 */
export declare function addFlashCardsToStory(uid: string, id: ObjectId, flashcardIds: ObjectId[]): Promise<import("mongodb").WithId<import("bson").Document> | null>;
//# sourceMappingURL=storyService.d.ts.map