import { ObjectId } from 'mongodb';

export interface UserProgressDocument {
  _id: ObjectId;
  userId: string; // Firebase UID
  
  // The 'Polymorphic' part: link to any content type
  contentType: 'challenge' | 'flashcard' | 'story' | 'scenario';
  contentId: ObjectId; // Points to the specific item in its respective collection
  
  // Universal metrics
  attempts: number;
  successes: number;
  lastCompletedAt: Date;
  
  // Type-specific data (Flexible)
  // For challenges, this might be 'lastEndingUsed'.
  // For stories, this might be 'highestPageReached'.
  metadata?: Record<string, any>; 
}