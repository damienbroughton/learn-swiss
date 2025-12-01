import { useState, useEffect } from "react"


export default function EditFlashCard({ flashcard, onUpdateFlashCard }) {
    const [firstLanguage, setFirstLanguage] = useState(flashcard.firstLanguage);
    const [firstLanguageText, setFirstLanguageText] = useState(flashcard.firstLanguageText);
    const [categoryText, setCategoryText] = useState(flashcard.category);
    const [secondLanguage, setSecondLanguage] = useState(flashcard.secondLanguage);
    const [secondLanguageText, setSecondLanguageText] = useState(flashcard.secondLanguageText);
    const [formal, setFormal] = useState(flashcard.formal);
    const [tags, setTags] = useState(flashcard.tags);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFirstLanguage(flashcard.firstLanguage)
        setFirstLanguageText(flashcard.firstLanguageText)
        setSecondLanguage(flashcard.secondLanguage)
        setSecondLanguageText(flashcard.secondLanguageText)
        setCategoryText(flashcard.category)
        setFormal(flashcard.formal)
        setTags(flashcard.tags)
    }, [flashcard]);

    return (
        <>
        <div id={`flashcard-${flashcard._id}`} className="flashcard">
            <label>First Language: 
                <select id={`firstLanguage-${flashcard._id}`} value={firstLanguage} onChange={e => setFirstLanguage(e.target.value)}>
                    <option value="English">English</option>
                </select>
            </label>
            <label>First Language Text: <input id={`firstLanguageText-${flashcard._id}`} type="text" value={firstLanguageText} onChange={e => setFirstLanguageText(e.target.value)} /></label>
            <label>Second Language: 
                <select id={`secondLanguage-${flashcard._id}`} value={secondLanguage} onChange={e => setSecondLanguage(e.target.value)}>
                    <option value="German">German</option>
                    <option value="Swiss-German">Swiss-German</option>
                </select>
            </label>
            <label>Second Language Text: <input id={`secondLanguageText-${flashcard._id}`} type="text" value={secondLanguageText} onChange={e => setSecondLanguageText(e.target.value)} /></label>
            <label>Category: <input id={`category-${flashcard._id}`} type="text" value={categoryText} onChange={e => setCategoryText(e.target.value)}/></label>
            <label>Tags: <br /><input id={`tags-${flashcard._id}`} type="text" value={tags ?? ""} onChange={e => setTags(e.target.value)} /></label>
            <label>Formal: <input id={`formal-${flashcard._id}`} type="checkbox" checked={formal} onChange={e => setFormal(e.target.checked)} /></label>
            { onUpdateFlashCard  && (<button
                id={`saveButton-${flashcard._id}`}
                disabled={isSaving}
                onClick={() => {
                    setIsSaving(true);
                    onUpdateFlashCard({
                        flashcard,
                        newFirstLanguage: firstLanguage,
                        newFirstLanguageText: firstLanguageText,
                        newSecondLanguage: secondLanguage,
                        newSecondLanguageText: secondLanguageText,
                        newCategory: categoryText,
                        newFormal: formal,
                        newTags: tags
                    }, () => setIsSaving(false));
                }}
            >{isSaving ? 'Saving..' : 'Save'}</button>
            )}
        </div>
        </>
    )
}