import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import { generateText } from "./geminiService.js";
/**
 * Retreive list of flashcard categories
 *
 */
export async function getFlashcardCategories() {
    try {
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
        const flashcards = await db.collection('flashcards').find().toArray();
        const categories = [...new Set(flashcards.map(flashcard => flashcard.category))];
        return categories;
    }
    catch (error) {
        console.error('Error fetching categories:', error);
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
export function enrichFlashcard(flashcard, uid) {
    const enriched = {
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
    };
    if (uid && Array.isArray(flashcard.guesses)) {
        const userGuesses = flashcard.guesses.filter(g => g.guessedBy === uid);
        if (userGuesses.length > 0) {
            const lastGuess = userGuesses[userGuesses.length - 1];
            if (lastGuess) {
                enriched.userGuess = {
                    guessedCorrectly: lastGuess.guessedCorrectly,
                    lastGuessDate: lastGuess.guessDate,
                    totalGuesses: userGuesses.length
                };
            }
        }
    }
    return enriched;
}
/**
 * Retreive list of flashcards by category
 *
 */
export async function getFlashcardsByCategory(uid, category) {
    try {
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
        const flashcards = await db.collection('flashcards').find({ category }).toArray();
        console.log(`Found ${flashcards.length} flashcards in category ${category}, User: ${uid}`);
        const result = flashcards.map(flashcard => enrichFlashcard(flashcard, uid));
        return result;
    }
    catch (error) {
        console.error(`Error fetching flashcards for category "${category}":`, error);
        throw new Error('Internal server error');
    }
}
/**
 * Create new flashcard
 *
 */
export async function createFlashcard(uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags) {
    try {
        console.log(`Creating Flash Card: ${category}, ${firstLanguage}: ${firstLanguageText}, formal=${formal}`);
        console.log(`${secondLanguage}: ${secondLanguageText} ${firstLanguageText}, ${tags}, User=${uid}`);
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
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
        const result = await db.collection('flashcards').findOne({ _id: update.insertedId });
        return result;
    }
    catch (error) {
        console.error('Error creating flashcard:', error);
        throw new Error('Internal server error');
    }
}
/**
 * Create new flashcards
 *
 */
export async function insertFlashcards(uid, flashcards) {
    try {
        console.log(`Creating ${flashcards.length} flashcards.`);
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
        const insertedFlashcards = [];
        // Loop through flashcards and determine whether they already exist in the system
        for (const flashcard of flashcards) {
            const exisitingFlashcard = await db.collection('flashcards').findOne({
                firstLanguage: flashcard.firstLanguage,
                firstLanguageText: flashcard.firstLanguageText,
                secondLanguage: flashcard.secondLanguage,
                secondLanguageText: flashcard.secondLanguageText
            });
            let savedFlashcard;
            if (exisitingFlashcard) {
                //if the flashcard exists, update it
                savedFlashcard = await updateFlashcard(exisitingFlashcard._id.toString(), uid, flashcard.category, flashcard.firstLanguage, flashcard.firstLanguageText, flashcard.secondLanguage, flashcard.secondLanguageText, flashcard.formal, flashcard.tags);
            }
            else {
                //otherwise create it
                savedFlashcard = await createFlashcard(uid, flashcard.category, flashcard.firstLanguage, flashcard.firstLanguageText, flashcard.secondLanguage, flashcard.secondLanguageText, flashcard.formal, flashcard.tags);
            }
            insertedFlashcards.push(savedFlashcard);
        }
        ;
        return insertedFlashcards;
    }
    catch (error) {
        console.error('Error creating flashcard:', error);
        throw new Error('Internal server error');
    }
}
/**
 * Update exisiting flashcard
 *
 */
export async function updateFlashcard(id, uid, category, firstLanguage, firstLanguageText, secondLanguage, secondLanguageText, formal, tags) {
    try {
        console.log(`Creating Flash Card: ${category}, ${firstLanguage}: ${firstLanguageText}, formal=${formal}`);
        console.log(`${secondLanguage}: ${secondLanguageText} ${firstLanguageText}, ${tags}, User=${uid}`);
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
        const now = new Date();
        const result = await db.collection('flashcards').findOneAndUpdate({ _id: new ObjectId(id) }, { $set: {
                updatedBy: uid,
                updatedAt: now,
                category,
                firstLanguage,
                firstLanguageText,
                secondLanguage,
                secondLanguageText,
                formal,
                tags
            } }, { returnDocument: 'after' });
        return result;
    }
    catch (error) {
        console.error(`Error updating flashcard ID "${id}":`, error);
        throw new Error('Internal server error');
    }
}
/**
 * Update exisiting flashcard with a guess from user
 *
 */
export async function guessFlashcard(id, uid, guessedCorrectly) {
    if (typeof guessedCorrectly !== 'boolean') {
        throw new Error('Invalid guess value');
    }
    try {
        const currentDate = new Date();
        if (!db)
            throw new Error('Database connection not initialized. Check connectToDB call.');
        const result = await db.collection('flashcards').findOneAndUpdate({ _id: new ObjectId(id) }, { $push: { guesses: { guessedBy: uid, guessedCorrectly, guessDate: currentDate } } }, { returnDocument: 'after' });
        if (!result)
            throw new Error("No document returned.");
        const response = {
            _id: result._id,
            category: result.category,
            firstLanguage: result.firstLanguage,
            firstLanguageText: result.firstLanguageText,
            secondLanguage: result.secondLanguage,
            secondLanguageText: result.secondLanguageText,
            formal: result.formal,
            tags: result.tags
        };
        return response;
    }
    catch (error) {
        console.error(`Error adding guess to flashcard ID "${id}":`, error);
        throw new Error('Internal server error');
    }
}
/**
 * Generate new flashcard list using gemini ai
 *
 */
export async function generateFlashcardList(uid, category, language, textBody, translatedLanguage) {
    try {
        const prompt = `System message
        You are a language-processing assistant that extracts all nouns, adjectives and verbs from ${language} text and returns them as flash cards.
        Rules:
        - The secondLanguage is always ${language}.
        - secondLanguageText must contain the ${language} noun with its correct article (der/die/das) OR the verb in its infinitive form OR adjective.
        - firstLanguage is always ${translatedLanguage}.
        - firstLanguageText is the ${translatedLanguage} translation.
        - Only output unique nouns and verbs.
        - Output only valid JSON. No explanations.
        - Format the JSON as an array like this:
        [ {"firstLanguage": "${translatedLanguage}", "firstLanguageText": "...", 
         "secondLanguage": "${language}", "secondLanguageText": "...", 
         "formal": false, "category": "Nouns", "tags": "Greetings"},
         ...
        ]
        Extract all nouns (with articles) and verbs (infinitives) from the following text 
        and return them in the JSON flashcard format described above with the tags 
        "${category}":${textBody}`;
        console.info(`Generating Flashcards with prompt: ${prompt}`);
        const response = await generateText(prompt);
        console.info(`Generated Flashcards: ${response}`);
        const cleanedJsonString = response.replace(/^```json\n/, '').replace(/\n```$/, '');
        const flashcardArray = JSON.parse(cleanedJsonString);
        return flashcardArray;
    }
    catch (error) {
        console.error('Error generating flashcards:', error);
        throw new Error('Internal server error');
    }
}
//# sourceMappingURL=flashcardService.js.map