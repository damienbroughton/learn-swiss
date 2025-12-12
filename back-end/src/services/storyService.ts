import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { StoryDocument } from '../types/storyInterfaces.js'; // Import interfaces
import type { FlashcardDocument } from '../types/flashcardInterfaces.js'; // Import interfaces
import { enrichFlashcard } from "./flashcardService.js";


/**
 * Retreive list of stories
 *
 */
export async function getStories() {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const stories = await db.collection<StoryDocument>('stories').find().toArray();
    const response = stories.map(story => {
      return {
        _id: story._id,
        reference: story.reference,
        title: story.title,
        language: story.language,
        translatedLanguage: story.translatedLanguage,
      };
    });

    return response;
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    throw new Error('Internal server error');
  }
}
/**
 * Retreive story and linked flashcards by id
 *
 */
export async function getStory(uid: string | undefined, reference: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    console.log("Retrieving story by reference: ", reference)
    const story = await db.collection<StoryDocument>('stories').aggregate([
        { $match: { reference } },
        {
            $lookup: {
                from: "flashcards",
                localField: "flashcards",
                foreignField: "_id",
                as: "flashcards"
            }
        }
    ]).next();

    if(!story) throw new Error(`Story with reference ${reference} was not found.`)
    const flashcards = story?.flashcards as FlashcardDocument[];
    const flashcardsMapped = flashcards.map(flashcard => enrichFlashcard(flashcard, uid));

    const response = {
        id: story._id,
        reference: story.reference,
        title: story.title,
        language: story.language,
        content: story.content,
        flashcards: flashcardsMapped
    };

    return response;
    
  } catch (error) {
    console.error('Error fetching story:', error);
    throw new Error('Internal server error');
  }
}

/**
 * Create new flashcard
 *
 */
export async function createStory(uid: string, title: string, language: string, content: string) {
    try {
        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
        console.log(`Creating Story: ${title}, ${language}: ${content}`);

        let reference = title.replace(/[^\p{L}\s]/gu, "").replaceAll(" ", "-").toLowerCase();
        const existingReferences = await db.collection('stories').find({ reference }).toArray();
        if(existingReferences.length > 0)
          reference = `${reference}-${existingReferences.length}`;

        const now = new Date();

        const update = await db.collection('stories').insertOne({ 
            reference,
            createdBy: uid, 
            createdAt: now,
            updatedBy: uid, 
            updatedAt: now,
            title, 
            language, 
            content
        });

        const result = await db.collection<StoryDocument>('stories').findOne({ _id: update.insertedId });

        return result;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}

/**
 * Add flashcard references to story
 *
 */
export async function addFlashCardsToStory(uid: string, id: string, flashcardIds: ObjectId[]) {
    try {
        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
        const story = await db.collection('stories').findOne({ _id: new ObjectId(id) });

        if (!story) {
            throw new Error('Story not found');
        }

        console.log(`Adding ${flashcardIds.length} flashcards to Story: ${story.title}`);

        const updatedStory = await db.collection<StoryDocument>('stories').findOneAndUpdate(
            {  _id: new ObjectId(id)  },
            {
                $push: { flashcards: { $each: flashcardIds } },
            }
        );

        const result = await db.collection('stories').findOne({ _id: new ObjectId(id) });

        return result;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}