import { ObjectId } from 'mongodb';
import { db } from '../config/db.js';
import type { UserProgressDocument } from '../types/userProgressInterface.js';


export async function getUserProgress(
  uid: string, 
  contentId: string, 
  type: 'challenge' | 'flashcard' | 'story' | 'scenario',
  isCorrect: boolean = true
) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const query = { 
      uid, 
      contentId: new ObjectId(contentId),
      contentType: type 
    };

    const update = {
      $inc: { 
        attempts: 1, 
        successes: isCorrect ? 1 : 0 
      },
      $set: { lastCompletedAt: new Date() }
    };

    await db.collection<UserProgressDocument>('userProgress').updateOne(
      query, 
      update, 
      { upsert: true }
    );

  } catch (error) {
    console.error("Error recording user progress:", error);
  }
}
/**
 * Records progress for any content type (Challenges, Flashcards, etc.)
 */
export async function recordUserProgress(
  uid: string, 
  contentId: string, 
  type: 'challenge' | 'flashcard' | 'story' | 'scenario',
  isCorrect: boolean = true
) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const query = { 
      uid, 
      contentId: new ObjectId(contentId),
      contentType: type 
    };

    const update = {
      $inc: { 
        attempts: 1, 
        successes: isCorrect ? 1 : 0 
      },
      $set: { lastCompletedAt: new Date() }
    };

    await db.collection<UserProgressDocument>('userProgress').updateOne(
      query, 
      update, 
      { upsert: true }
    );

  } catch (error) {
    console.error("Error recording user progress:", error);
  }
}

/**
 * Returns aggregated progress summary for a user.
 * - For each content type returns: todayCompletedItems, allTimeCompletedItems, allTimeSuccesses
 * - Also returns totals across all content types
 */
export async function getUserProgressSummary(uid: string) {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const pipeline = [
      { $match: { uid } },
      // lookup content docs to get the language field
      { $lookup: { from: 'flashcards', localField: 'contentId', foreignField: '_id', as: 'flashcardDoc' } },
      { $lookup: { from: 'challenges', localField: 'contentId', foreignField: '_id', as: 'challengeDoc' } },
      { $lookup: { from: 'stories', localField: 'contentId', foreignField: '_id', as: 'storyDoc' } },
      { $lookup: { from: 'scenarios', localField: 'contentId', foreignField: '_id', as: 'scenarioDoc' } },
      { $addFields: {
          language: {
            $ifNull: [
              { $arrayElemAt: ['$flashcardDoc.language', 0] },
              { $arrayElemAt: ['$challengeDoc.language', 0] },
              { $arrayElemAt: ['$storyDoc.language', 0] },
              { $arrayElemAt: ['$scenarioDoc.language', 0] },
              'Unknown'
            ]
          }
        } },
      { $group: {
          _id: { contentType: '$contentType', language: '$language' },
          allTimeSuccesses: { $sum: '$successes' },
          todaySuccesses: { $sum: { $cond: [ { $and: [ { $gt: ['$lastCompletedAt', startOfDay] }, { $gt: ['$successes', 0] } ] }, 1, 0 ] } }
        } }
    ];

    const aggResults = await db.collection<UserProgressDocument>('userProgress').aggregate(pipeline).toArray();

    const initLangObj = () => ({ German: { todaySuccesses: 0, allTimeSuccesses: 0 }, 'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 }, Unknown: { todaySuccesses: 0, allTimeSuccesses: 0 } });

    const summary: Record<string, Record<string, { todaySuccesses: number, allTimeSuccesses: number }>> = {
      flashcard: initLangObj(),
      challenge: initLangObj(),
      story: initLangObj(),
      scenario: initLangObj()
    };

    function normalizeLang(l: string) {
      if (!l) return 'Unknown';
      const low = l.toLowerCase();
      if (low.includes('swiss')) return 'Swiss-German';
      if (low.includes('german')) return 'German';
      return l;
    }

    for (const r of aggResults) {
      const key = (r._id && r._id.contentType) as string;
      const rawLang = (r._id && r._id.language) as string;
      const lang = normalizeLang(rawLang);

      if (summary[key]) {
        summary[key][lang] = {
          todaySuccesses: r.todaySuccesses || 0,
          allTimeSuccesses: r.allTimeSuccesses || 0
        };
      }
    }

    const totals = {
      German: { todaySuccesses: 0, allTimeSuccesses: 0 },
      'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 },
      overall: { todaySuccesses: 0, allTimeSuccesses: 0 }
    };

    for (const contentKey of Object.keys(summary)) {
      const langObj = summary[contentKey] || {};
      for (const langKey of Object.keys(langObj)) {
        const s = langObj[langKey] || { todaySuccesses: 0, allTimeSuccesses: 0 };
        if (langKey === 'German' || langKey === 'Swiss-German') {
          totals[langKey].todaySuccesses += s.todaySuccesses;
          totals[langKey].allTimeSuccesses += s.allTimeSuccesses;
        }
        totals.overall.todaySuccesses += s.todaySuccesses;
        totals.overall.allTimeSuccesses += s.allTimeSuccesses;
      }
    }

    return { summary, totals };

  } catch (error) {
    console.error("Error getting user progress summary:", error);
    const emptyLang = { German: { todaySuccesses: 0, allTimeSuccesses: 0 }, 'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 }, Unknown: { todaySuccesses: 0, allTimeSuccesses: 0 } };
    return { summary: { flashcard: emptyLang, challenge: emptyLang, story: emptyLang, scenario: emptyLang }, totals: { German: { todaySuccesses: 0, allTimeSuccesses: 0 }, 'Swiss-German': { todaySuccesses: 0, allTimeSuccesses: 0 }, overall: { todaySuccesses: 0, allTimeSuccesses: 0 } } };
  }
}

/**
 * Retrieve a user's progress record for a given content item
 */
export async function getUserProgressRecord(uid: string, contentId: string, type: 'challenge' | 'flashcard' | 'story' | 'scenario') {
  try {
    if (!db) throw new Error('Database connection not initialized. Check connectToDB call.');
    const doc = await db.collection<UserProgressDocument>('userProgress').findOne({ uid, contentId: new ObjectId(contentId), contentType: type });
    if (!doc) return null;
    return { attempts: doc.attempts || 0, successes: doc.successes || 0, lastCompletedAt: doc.lastCompletedAt || null };
  } catch (error) {
    console.error('Error getting user progress record:', error);
    return null;
  }
}