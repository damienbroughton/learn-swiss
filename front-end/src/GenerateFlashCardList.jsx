import { useState } from "react";
import api from "./api";
import useUser from "./hooks/useUser";
import { useNavigate } from "react-router-dom";


export default function GenerateFlashCardList() {
    const [textLanguage, setTextLanguage] = useState("Swiss-German");
    const [textBody, setTextBody] = useState("");
    const [category, setCategory] = useState("");
    const [translatedLanguage, setTranslatedLanguage] = useState("English");
    const [isGenerating, setisSaving] = useState(false);
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
            setisSaving(true);
            setError("");

            const strippedTextBody = inTextBody.replace(/[^\p{L}\s']/gu, "");

            const storyReqBody = { 
                title: inCategory,
                language: inLanguage,
                content: strippedTextBody,
                translatedLanguage: inTranslatedLanguage
            };
            const storyResponse = await api.post(`/stories/`, storyReqBody);

            navigate(`/stories/${storyResponse.data.reference}`);
        } catch (error) {
            setError(error.message);
        } finally {
            setisSaving(false);
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
            <label>Title: <br /><input type="text" value={category} maxLength={64} onChange={e => setCategory(e.target.value)}/></label>
            <label>Insert text to create flashcards from: <textarea maxLength={20000} value={textBody} onChange={e => setTextBody(e.target.value)}></textarea></label>
            <p>{textBody.length}/20,000 characters</p>
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
        </div>
    )
}