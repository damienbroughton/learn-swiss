import { ObjectId } from 'mongodb';

/**
 * Represents a single explanation entry for a specific language concept.
 */
interface ConceptExplanation {
    title: string;
    language: "English" | "German";
    explanation: string;
    example: string;
}

/**
 * The main structure for the Explanation table
 */
export interface ExplanationDocument {

    /** The unique identifier for the document, stored as a MongoDB ObjectId. */
    _id: ObjectId;

    /** Unique identifier */
    reference: string;
    
    /** Array containing the localized explanations */
    explanations: ConceptExplanation[];
}