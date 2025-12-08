import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';


/**
 * Retreive list of stories
 *
 */
export async function getStories() {
  try {
    const stories = await db.collection('stories').find().toArray();
    const response = stories.map(story => {
      return {
        id: story._id,
        reference: story.reference,
        title: story.title,
        language: story.language,
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
export async function getStory(uid, reference) {
  try {
    console.log("Retrieving story by reference: ", reference)
    const story = await db.collection('stories').aggregate([
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

    const flashcards = story.flashcards.map(flashcard => {
      const response = {
        _id: flashcard._id,
        category: flashcard.category,
        firstLanguage: flashcard.firstLanguage,
        firstLanguageText: flashcard.firstLanguageText,
        secondLanguage: flashcard.secondLanguage,
        secondLanguageText: flashcard.secondLanguageText,
        formal: flashcard.formal,
        tags: flashcard.tags
      };

      // Enrich with user's guesses if logged in
      if (uid && Array.isArray(flashcard.guesses)) {
        const userGuesses = flashcard.guesses.filter(g => g.guessedBy === uid);
        if (userGuesses.length > 0) {
          const lastGuess = userGuesses[userGuesses.length - 1];
          response.userGuess = {
            guessedCorrectly: lastGuess.guessedCorrectly,
            lastGuessDate: lastGuess.guessDate,
            totalGuesses: userGuesses.length
          };
        }
      }

      return response;
    });

    const response = {
        id: story._id,
        reference: story.reference,
        title: story.title,
        language: story.language,
        content: story.content,
        flashcards: flashcards
    };

    return response;
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Internal server error');
  }
}

/**
 * Create new flashcard
 *
 */
export async function createStory(uid, title, language, content) {
    try {
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
        }, { returnDocument: 'after' });

        const result = await db.collection('stories').findOne({ _id: update.insertedId });

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
export async function addFlashCardsToStory(uid, id, flashcardIds) {
    try {
        const story = await db.collection('stories').findOne({ _id: new ObjectId(id) });

        if (!story) {
            throw new Error('Story not found');
        }

        console.log(`Adding ${flashcardIds.length} flashcards to Story: ${story.title}`);

        const updatedStory = await db.collection('stories').findOneAndUpdate(
            {  _id: new ObjectId(id)  },
            {
                $push: { flashcards: { $each: flashcardIds } },
            },
            { returnDocument: 'after' }
        );

        const result = await db.collection('stories').findOne({ _id: updatedStory.insertedId });

        return result;
    } catch (error) {
        console.error('Error creating story:', error);
        throw new Error('Internal server error');
    }
}