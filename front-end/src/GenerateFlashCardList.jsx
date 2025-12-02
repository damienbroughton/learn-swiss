import { useState } from "react";
import api from "./api";
import useUser from "./hooks/useUser";
import EditFlashCard from "./EditFlashCard";
import { useNavigate } from "react-router-dom";


export default function GenerateFlashCardList() {
    const [textLanguage, setTextLanguage] = useState("German");
    const [textBody, setTextBody] = useState("");
    const [category, setCategory] = useState("");
    const [storyId, setStoryId] = useState();
    const [translatedLanguage, setTranslatedLanguage] = useState("English");
    const [flashcardDeck, setFlashcardDeck] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { user } = useUser();

    async function onGenerateFlashCards({inCategory, inLanguage, inTextBody, inTranslatedLanguage}) {
        if(!inCategory || !inLanguage || !inTextBody || !inTranslatedLanguage) {
            setError("Unable to generate! Please ensure all form fields are populated.");
            return;
        }
        if(!user) {
            setError("Unable to generate! Please login or create an account to generate flashcards.");
            navigate(`/login?prev=make-flashcards`);
            return;
        }        
        if(!textBody.length) {
            setError("Unable to generate! Text content length exceeds 20,000 characters.");
            return;
        }    
        try{
            setIsGenerating(true);
            setError("");

            const strippedTextBody = inTextBody.replace(/[^\p{L}\s']/gu, "");

            const storyReqBody = { 
                title: inCategory,
                language: inLanguage,
                content: strippedTextBody
            };
            const storyResponse = await api.post(`/stories/`, storyReqBody);
            setStoryId(storyResponse.data._id);

            const reqBody = { 
                category: inCategory,
                language: inLanguage,
                textBody: strippedTextBody.replace(/\r?\n+/g, " "),
                translatedLanguage: inTranslatedLanguage
            };
            const response = await api.post(`/flashcards/generate/`, reqBody);

            const newFlashCardList = response.data;
            setFlashcardDeck( newFlashCardList );
        } catch (error) {
            setError(error.message);
        } finally {
            setIsGenerating(false);
        }
    }

    async function onSaveFlashCards({}) {
        if(!user) {
            setError("Unable to generate! Please login or create an account to generate flashcards.");
            navigate(`/login?prev=make-flashcards`);
            return;
        }        
        if(flashcardDeck.length === 0) {
            setError("Unable to save! No flashcards to save.");
            return;
        }    
        try{
            setIsSaving(true);
            setError("");

            const reqBody = flashcardDeck;
            const response = await api.post(`/flashcards/bulk/${storyId}`, reqBody);
            const newFlashCardList = response.data;
            setFlashcardDeck( newFlashCardList );
            navigate(`/stories/${storyId}`);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div>
            <label>Language: 
                <select value={textLanguage} onChange={e => setTextLanguage(e.target.value)}>
                    <option value="German">German</option>
                    <option value="Swiss-German">Swiss-German</option>
                </select>
            </label>
            <label>Insert text to create flashcards from: <textarea maxLength={20000} value={textBody} onChange={e => setTextBody(e.target.value)}></textarea></label>
            <p>{textBody.length}/20,000 characters</p>
            <label>Title or tag: <input type="text" value={category} maxLength={64} onChange={e => setCategory(e.target.value)}/></label>
            <label>TranslatedLanguage: 
                <select value={translatedLanguage} onChange={e => setTranslatedLanguage(e.target.value)}>
                    <option value="English">English</option>
                </select>
            </label>
            <button
                disabled={isGenerating}
                onClick={() => {
                    onGenerateFlashCards({
                        inCategory: category, 
                        inLanguage: textLanguage, 
                        inTextBody: textBody, 
                        inTranslatedLanguage: translatedLanguage
                    });
                }}
            >{isGenerating ? 'Generating Flashcards...' : 'Generate Flashcards'}</button>
            {error && (<p>{error}</p>)}
            {flashcardDeck.length > 0 && (
                <div>
                    <p>{flashcardDeck.length} flashcards generated. Please review, verify and save.</p>
                    <button
                        disabled={isSaving}
                        onClick={() => {
                            onSaveFlashCards({
                                inCategory: category, 
                                inLanguage: textLanguage, 
                                inTextBody: textBody, 
                                inTranslatedLanguage: translatedLanguage
                            });
                        }}
                    >{isSaving ? 'Saving...' : 'Save'}</button>
                </div>
            )}
            <div style={{marginTop: "20px"}}>
                {isGenerating && (<p>Loading...</p>)}
                {!isGenerating && flashcardDeck && flashcardDeck.map((flashcard, index) => (
                    <EditFlashCard key={flashcard._id ?? `unsaved-${index}`} flashcard={flashcard} />
                ))}
            </div>
        </div>
    )
}