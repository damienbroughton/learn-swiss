import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { StoryDocument, StorySection } from '../types/storyInterfaces.js'; // Import interfaces
import type { FlashcardDocument } from '../types/flashcardInterfaces.js'; // Import interfaces
import { enrichFlashcard } from "./flashcardService.js";


/**
 * Retreive list of stories
 *
 */
export async function getStories(uid?: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const stories = await db.collection<StoryDocument>('stories').find().toArray();

    // If user is logged in, fetch their progress metadata for all stories
    const metadataMap: Record<string, any> = {};
    if (uid) {
      const progressDocs = await db.collection('userProgress').find({ uid, contentType: 'story' }).toArray();
      for (const p of progressDocs) {
        const key = (p.contentId as ObjectId).toHexString();
        metadataMap[key] = p.metadata || null;
      }
    }

    const response = stories.map(story => {
      const storyId = story._id.toHexString();
      const result: any = {
        _id: story._id,
        reference: story.reference,
        title: story.title,
        category: story.category,
        language: story.language,
        translatedLanguage: story.translatedLanguage,
        sectionsCount: story.sections?.length || 0
      };

      // Include metadata if user is logged in and has progress on this story
      if (uid && metadataMap[storyId]) {
        result.metadata = metadataMap[storyId];
      }

      return result;
    });

    return response;
  } catch (err) {
    console.error('Error fetching scenarios:', err);
    throw new Error('Internal server error');
  }
}
/**
 * Retreive story by id
 *
 */
export async function getStory(id: ObjectId): Promise<StoryDocument> {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const result = await db.collection<StoryDocument>('stories').findOne({ _id: id });

    if(result)
        return result;
    else
        throw new Error(`Story ${id.toHexString()} could not be retreived.`);

  } catch (err) {
    console.error('Error retrieving story:', err);
    throw new Error('Internal server error');
  }
}
/**
 * Retreive story and linked flashcards by reference
 *
 */
export async function getStoryByReference(uid: string | undefined, reference: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    console.log("Retrieving story by reference: ", reference)
    const story = await db.collection<StoryDocument>('stories').aggregate([
        { $match: { reference } },
        {
            $lookup: {
                from: "flashcards",
                localField: "sections.flashcards",
                foreignField: "_id",
                as: "sectionsFlashcardsData"
            }
        }
    ]).next();

    if(!story) throw new Error(`Story with reference ${reference} was not found.`);

    const allSectionFlashcards = (story.sectionsFlashcardsData || []) as FlashcardDocument[];

    // If a user is present, fetch progress records for all section flashcards in one query
    const progressMap: Record<string, { attempts: number; successes: number; lastCompletedAt: Date | null }> = {};
    if (uid && allSectionFlashcards.length > 0) {
      const ids = allSectionFlashcards.map(fc => fc._id);
      const progressDocs = await db.collection('userProgress').find({ uid, contentType: 'flashcard', contentId: { $in: ids } }).toArray();
      for (const p of progressDocs) {
        const key = (p.contentId as ObjectId).toHexString();
        progressMap[key] = { attempts: p.attempts || 0, successes: p.successes || 0, lastCompletedAt: p.lastCompletedAt || null };
      }
    }

    const enrichedSections = story.sections.map((section: StorySection) => {
        // Find the full flashcard documents that belong to this section
        const sectionFcs = allSectionFlashcards.filter(fc => 
            section.flashcards != null && section.flashcards.some(id => id.equals(fc._id))
        );
        
        const sectionFlashcards = sectionFcs.map(fc => {
            const prog = progressMap[fc._id.toHexString()] || { attempts: 0, successes: 0, lastCompletedAt: null };
            const fcWithProgress = { ...fc, attempts: prog.attempts, successes: prog.successes, lastCompletedAt: prog.lastCompletedAt } as unknown as FlashcardDocument;
            return enrichFlashcard(fcWithProgress, uid);
        });

        const flashcardsKnownCount = sectionFlashcards.reduce((count, fc) => count + ((fc.successes && fc.successes > 0) ? 1 : 0), 0);

        return {
            ...section,
            flashcardsKnownCount,
            flashcards: sectionFlashcards
        };
    });

    // If user is logged in, fetch story-level progress metadata
    let storyMetadata = null;
    if (uid) {
      const storyProgress = await db.collection('userProgress').findOne({ uid, contentType: 'story', contentId: story._id });
      if (storyProgress?.metadata) {
        storyMetadata = storyProgress.metadata;
      }
    }

    const response: any = {
        id: story._id,
        reference: story.reference,
        title: story.title,
        language: story.language,
        content: story.content,
        sections: enrichedSections
    };

    // Include metadata if user is logged in and has metadata for this story
    if (uid && storyMetadata) {
        response.metadata = storyMetadata;
    }

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
export async function createStory(uid: string, title: string, category: string, language: string, content: string) {
    try {
        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
        console.log(`Creating Story: ${title}, ${language}: ${content}`);

        let baseReference = title.replace(/[^\p{L}\s]/gu, "").replaceAll(/\s+/g, "-").toLowerCase();
        const pattern = new RegExp(`^${baseReference}(-\\d+)?$`); //Find all documents where the reference starts with the base
        const existingStories = await db.collection('stories').find({ reference: { $regex: pattern } }).project({ reference: 1 }).toArray();
        
        let reference = "";
        if (existingStories.length > 0) {
          const numbers = existingStories.map(s => {
              const match = s.reference.match(/-(\d+)$/);
              return match ? parseInt(match[1]) : 0;
          });

          // Find the highest number used and add 1
          const maxNumber = Math.max(...numbers);
          reference = `${baseReference}-${maxNumber + 1}`;
        } else {
          reference = baseReference;
        }

        const sections = content.split(/\n\s*\n/)
          .filter(para => para.trim() !== "")
          .map((para, idx) => (
          {
            "sectionId": idx + 1,
            "sectionContent": para
          }
        ));

        const now = new Date();

        const update = await db.collection('stories').insertOne({ 
            reference,
            createdBy: uid, 
            createdAt: now,
            updatedBy: uid, 
            updatedAt: now,
            title, 
            category,
            language, 
            content,
            sections
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
export async function addFlashCardsToStorySection(uid: string, id: ObjectId, sectionId: number, flashcardIds: ObjectId[]) {
    try {
        if (!db) {
            console.error('Database connection not initialized. Check connectToDB call.');
            throw new Error('Database connection not initialized.');
        }
        const story = await db.collection('stories').findOne({ _id: new ObjectId(id) });

        if (!story) {
            throw new Error(`Story not found with ID: ${id.toHexString()}`);
        }

        const sectionExists = story.sections.some((s: { sectionId: number }) => s.sectionId === sectionId);
        if (!sectionExists) {
             throw new Error(`Section not found with ID: ${sectionId} in Story: ${story.title}`);
        }

        console.log(`Adding ${flashcardIds.length} flashcards to Story: ${story.title}`);

        const updateResult = await db.collection<StoryDocument>('stories').findOneAndUpdate(
            { 
                _id: id,
                'sections.sectionId': sectionId
            },
            {
                $push: { 'sections.$.flashcards': { $each: flashcardIds } },
                $set: { 
                    updatedAt: new Date(),
                    updatedBy: uid
                }
            },
            {
                // Ensure the updated document is returned
                returnDocument: 'after' 
            }
        );

        return updateResult;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}

/**
 * Add error message to the story
 *
 */
export async function addErrorToStorySection(uid: string, id: ObjectId, sectionId: number, errorMessage: string) {
     try {
        if (!db) {
            console.error('Database connection not initialized. Check connectToDB call.');
            throw new Error('Database connection not initialized.');
        }
        const story = await db.collection('stories').findOne({ _id: new ObjectId(id) });

        if (!story) {
            throw new Error(`Story not found with ID: ${id.toHexString()}`);
        }

        const sectionExists = story.sections.some((s: { sectionId: number }) => s.sectionId === sectionId);
        if (!sectionExists) {
             throw new Error(`Section not found with ID: ${sectionId} in Story: ${story.title}`);
        }

        const updateResult = await db.collection<StoryDocument>('stories').findOneAndUpdate(
            { 
                _id: id,
                'sections.sectionId': sectionId
            },
            {
                $set: { 
                    'sections.$.error': errorMessage,
                    updatedAt: new Date(),
                    updatedBy: uid
                }
            },
            {
                returnDocument: 'after' 
            }
        );

        return updateResult;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}