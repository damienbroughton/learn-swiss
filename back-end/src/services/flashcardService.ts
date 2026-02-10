import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import { generateText } from "./geminiService.js";
import type { FlashcardDocument, EnrichedFlashcardSummary, FlashcardError } from '../types/flashcardInterfaces.js'; // Import interfaces

/**
 * Retreive list of flashcard categories
 *
 */
export async function getFlashcardCategories(secondLanguage: string, uid?: string) {
  try {
    if (!db) throw new Error('Database connection not initialized.');

    const pipeline: any[] = [
      // 1. Filter by language first
      { $match: { secondLanguage } }
    ];

    // 2. Join with userProgress if a user is logged in
    if (uid) {
      pipeline.push({
        $lookup: {
          from: 'userProgress',
          let: { flashcardId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$contentId', '$$flashcardId'] },
                    { $eq: ['$uid', uid] },
                    { $eq: ['$contentType', 'flashcard'] },
                    { $gt: ['$successes', 0] }
                  ]
                }
              }
            }
          ],
          as: 'progress'
        }
      });
    }

    // 3. Group by category and calculate stats
    pipeline.push({
      $group: {
        _id: "$category",
        totalFlashcards: { $sum: 1 },
        firstLanguage: { $first: "$firstLanguage" },
        secondLanguage: { $first: "$secondLanguage" },
        // If uid exists, count how many flashcards have at least one success in the progress array
        completedByUser: uid 
          ? { $sum: { $cond: [{ $gt: [{ $size: "$progress" }, 0] }, 1, 0] } }
          : { $sum: 0 }
      }
    });

    // 4. Clean up the output
    pipeline.push({
      $project: {
        _id: 0,
        category: "$_id",
        firstLanguage: 1,
        secondLanguage: 1,
        totalFlashcards: 1,
        completedByUser: 1
      }
    });

    // 5. Sort alphabetically
    pipeline.push({ $sort: { category: 1 } });

    const results = await db.collection('flashcards').aggregate(pipeline).toArray();
    return results;

  } catch (error) {
    console.error('Error fetching flashcard categories:', error);
    throw new Error('Internal server error');
  }
}

// --- Helper Function for Enrichment ---

/**
 * Enriches a raw FlashcardDocument with user-specific guess statistics.
 * @param {FlashcardDocument} flashcard - The raw document from the database.
 * @param {string | null} uid - The ID of the authenticated user, or null if unauthenticated.
 * @returns {EnrichedFlashcardSummary} The flashcard summary ready for client consumption.
 */
export function enrichFlashcard(flashcard: FlashcardDocument, uid: string | undefined): EnrichedFlashcardSummary {
    const enriched: EnrichedFlashcardSummary = {
        _id: flashcard._id,
        category: flashcard.category,
        firstLanguage: flashcard.firstLanguage,
        firstLanguageText: flashcard.firstLanguageText,
        secondLanguage: flashcard.secondLanguage,
        secondLanguageText: flashcard.secondLanguageText,
        formal: flashcard.formal,
        tags: flashcard.tags,
        createdAt: flashcard.createdAt,
        updatedAt: flashcard.updatedAt,
        // Progress fields (default when not present)
        attempts: (flashcard as any).attempts ?? 0,
        successes: (flashcard as any).successes ?? 0,
        lastCompletedAt: (flashcard as any).lastCompletedAt ?? null
    };
    return enriched;
}

/**
 * Retreive list of flashcards by category
 *
 */
export async function getFlashcardsByCategory(uid: string | undefined, category: string, secondLanguage: string, options?: { forReview?: boolean, limit?: number }) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    // If not review mode, return up to `limit` flashcards (default 20)
    if (!options?.forReview) {
      const limit = options?.limit ?? 20;

      if (uid) {
        // Aggregation to include user's progress fields for each flashcard
        const pipeline: any[] = [
          { $match: { category, secondLanguage } },
          { $lookup: {
              from: 'userProgress',
              let: { flashId: '$_id' },
              pipeline: [
                { $match: { $expr: { $and: [ { $eq: ['$contentId', '$$flashId'] }, { $eq: ['$uid', uid] }, { $eq: ['$contentType', 'flashcard'] } ] } } },
                { $limit: 1 }
              ],
              as: 'userProgress'
            } },
          { $addFields: { progress: { $arrayElemAt: ['$userProgress', 0] } } },
          { $addFields: {
              attempts: { $ifNull: ['$userProgress.attempts', 0] },
              successes: { $ifNull: ['$userProgress.successes', 0] },
              lastCompletedAt: { $ifNull: ['$userProgress.lastCompletedAt', null] }
            } },
          { $project: { userProgress: 0, progress: 0 } },
          { $limit: limit }
        ];

        const docs = await db.collection<FlashcardDocument>('flashcards').aggregate(pipeline).toArray();
        console.log(`Returning ${docs.length} flashcards (limit: ${limit}) for category ${category}, secondLanguage: ${secondLanguage}, User: ${uid}`);
        return docs.map(doc => enrichFlashcard(doc as FlashcardDocument, uid));
      } else {
        // Guest users: return limited set and attach default progress fields
        const limit = options?.limit ?? 20;
        const flashcards = await db.collection<FlashcardDocument>('flashcards').find({ category, secondLanguage }).limit(limit).toArray();
        console.log(`Returning ${flashcards.length} flashcards (limit: ${limit}) for category ${category}, secondLanguage: ${secondLanguage}, User: guest`);
        const docsWithProgress = flashcards.map(f => ({ ...f, attempts: 0, successes: 0, lastCompletedAt: null }));
        return docsWithProgress.map(doc => enrichFlashcard(doc as FlashcardDocument, uid));
      }
    }

    // Review mode: select up to limit flashcards matching spaced-repetition criteria
    if (!uid) throw new Error('Authentication required for review');

    const limit = options?.limit ?? 20;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const pipeline: any[] = [
      { $match: { category, secondLanguage } },
      // lookup user progress for this user and this flashcard
      { $lookup: {
          from: 'userProgress',
          let: { flashId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$contentId', '$$flashId'] }, { $eq: ['$uid', uid] }, { $eq: ['$contentType', 'flashcard'] } ] } } },
            { $limit: 1 }
          ],
          as: 'progress'
      }},
      // extract user's progress fields if present
      { $addFields: {
        progress: { $arrayElemAt: ['$progress', 0] },
        attempts: { $ifNull: [{ $arrayElemAt: ['$progress.attempts', 0] }, 0] },
        successes: { $ifNull: [{ $arrayElemAt: ['$progress.successes', 0] }, 0] },
        lastCompletedAt: { $ifNull: [{ $arrayElemAt: ['$progress.lastCompletedAt', 0] }, null] },
        userSuccesses: { $ifNull: [{ $arrayElemAt: ['$progress.successes', 0] }, 0] }
      }},
      // spaced repetition conditions: include if successes < 4 OR never reviewed (lastCompletedAt null) OR not reviewed in last week
      { $match: {
        $or: [
          { userSuccesses: { $lt: 4 } },
          { lastCompletedAt: { $lt: weekAgo } },
          { lastCompletedAt: { $exists: false } },
          { lastCompletedAt: null }
        ]
      }},
      // prioritize by fewest successes and oldest review time
      { $sort: { userSuccesses: 1, lastCompletedAt: 1 } },
      { $limit: limit },
      { $project: { progress: 0 } }
    ];

    const selected = await db.collection<FlashcardDocument>('flashcards').aggregate<FlashcardDocument>(pipeline).toArray();

    console.log(`Selected ${selected.length} flashcards for review in category ${category} (limit: ${limit}), User: ${uid}`);

    const result = selected.map(flashcard => enrichFlashcard(flashcard as FlashcardDocument, uid));
    return result;

  } catch (error) {
    console.error(`Error fetching flashcards for category "${category}":`, error);
    throw new Error('Internal server error');
  }
} 

/**
 * Create new flashcard
 *
 */
export async function createFlashcard(uid: string, category: string, firstLanguage: string, firstLanguageText: string, 
  secondLanguage: string, secondLanguageText: string, formal: boolean, tags: string[]): Promise<FlashcardDocument> {
    try {
        console.log(`Creating Flash Card: ${category}, ${firstLanguage}: ${firstLanguageText}, formal=${formal}`);
        console.log(`${secondLanguage}: ${secondLanguageText} ${firstLanguageText}, ${tags}, User=${uid}`);

        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

        const now = new Date();

        const update = await db.collection('flashcards').insertOne({ 
            createdBy: uid, 
            createdAt: now,
            updatedBy: uid, 
            updatedAt: now,
            category, 
            firstLanguage, 
            firstLanguageText, 
            secondLanguage, 
            secondLanguageText, 
            formal,
            tags
        });

        const result = await db.collection<FlashcardDocument>('flashcards').findOne({ _id: update.insertedId });

        if(result)
            return result;
        else
            throw new Error('Newly insterted job could not be retreived.');
    } catch (error) {
        console.error('Error creating flashcard:', error);
        throw new Error('Internal server error');
    }
}

/**
 * Create new flashcards
 *
 */
export async function insertFlashcards(uid: string, flashcards: FlashcardDocument[]): Promise<FlashcardDocument[]> {
    try {
        console.log(`Creating ${flashcards.length} flashcards.`);

        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

        const insertedFlashcards: FlashcardDocument[] = [];

        // Loop through flashcards and determine whether they already exist in the system
        for (const flashcard of flashcards)  {
          const exisitingFlashcard = await db.collection<FlashcardDocument>('flashcards').findOne({ 
            firstLanguage: flashcard.firstLanguage, 
            firstLanguageText: flashcard.firstLanguageText, 
            secondLanguage: flashcard.secondLanguage, 
            secondLanguageText: flashcard.secondLanguageText
          });

          let savedFlashcard;

          if(exisitingFlashcard){
            //if the flashcard exists, update it
            savedFlashcard = await updateFlashcard(exisitingFlashcard._id.toString(), uid, flashcard.category, 
              flashcard.firstLanguage, flashcard.firstLanguageText, 
              flashcard.secondLanguage, flashcard.secondLanguageText, flashcard.formal, flashcard.tags);
          } else {
            //otherwise create it
            savedFlashcard = await createFlashcard(uid, flashcard.category, 
              flashcard.firstLanguage, flashcard.firstLanguageText, 
              flashcard.secondLanguage, flashcard.secondLanguageText, flashcard.formal, flashcard.tags);
          }
          if(savedFlashcard)
            insertedFlashcards.push(savedFlashcard);
        };
        if(insertedFlashcards)
            return insertedFlashcards;
        else
            throw new Error('Newly insterted job could not be retreived.');
    } catch (error) {
        console.error('Error creating flashcard:', error);
        throw new Error('Internal server error');
    }
}

/**
 * Update exisiting flashcard
 *
 */
export async function updateFlashcard(id: string, uid: string, category: string, firstLanguage: string, 
  firstLanguageText: string, secondLanguage: string, secondLanguageText: string, formal: boolean, tags: string[]): Promise<FlashcardDocument> {
  try {
        console.log(`Creating Flash Card: ${category}, ${firstLanguage}: ${firstLanguageText}, formal=${formal}`);
        console.log(`${secondLanguage}: ${secondLanguageText} ${firstLanguageText}, ${tags}, User=${uid}`);

        if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

        const now = new Date();

        const result = await db.collection<FlashcardDocument>('flashcards').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: {             
                updatedBy: uid, 
                updatedAt: now,
                category, 
                firstLanguage, 
                firstLanguageText, 
                secondLanguage, 
                secondLanguageText, 
                formal,
                tags 
            } }, { returnDocument: 'after' }
        );

        if(result)
            return result;
        else
            throw new Error('Newly insterted job could not be retreived.');
    } catch (error) {
        console.error(`Error updating flashcard ID "${id}":`, error);
        throw new Error('Internal server error');
    }
}

/**
 * Update exisiting flashcard with a guess from user
 *
 */


/**
 * Generate new flashcard list using gemini ai
 *
 */
export async function generateFlashcardList(uid: string, category: string, language: string, textBody: string, translatedLanguage: string): Promise<FlashcardDocument[] | FlashcardError> {
    try {
      const prompt = `System message
        You are a language-processing assistant that extracts all nouns, adjectives and verbs from ${language} text and returns them as flash cards.
        Rules:
        - The secondLanguage is always ${language}.
        - secondLanguageText must contain the ${language} noun with its correct article (der/die/das) OR the verb in its infinitive form OR adjective OR adverb.
        - firstLanguage is always ${translatedLanguage}.
        - firstLanguageText is the ${translatedLanguage} translation.
        - Only output unique nouns and verbs.
        - Output only valid JSON. No explanations.
        - Format the JSON as an array like this:
        [ {"firstLanguage": "${translatedLanguage}", "firstLanguageText": "...", 
         "secondLanguage": "${language}", "secondLanguageText": "...", 
         "formal": false, "category": "${category}", "tags": "Greetings, Gruß"},
         ...
        ]
         - In the event of an error return an error message in JSON form:
        {"errorMessage": "No ${language} text provided."}
        Extract all nouns (with articles) and verbs (infinitives) from the following text 
        and return them in the JSON flashcard format described above with the tags 
        "${category}":${textBody}`;

        const response: string = await generateText(prompt);

        const cleanedJsonString = response.replace(/^```json\n/, '').replace(/\n```$/, '');

        const parsedData = JSON.parse(cleanedJsonString);

        // Is it the error object?
        if (parsedData && !Array.isArray(parsedData) && 'errorMessage' in parsedData) {
            return parsedData as FlashcardError;
        }

        // Otherwise, assume it is the array
        return parsedData as FlashcardDocument[];
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw new Error('Internal server error');
    }
}