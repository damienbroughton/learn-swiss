import api from "../api";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import EditFlashCard from "../EditFlashCard";
import useUser from "../hooks/useUser";

export default function AdminPage() {
    
    const { categories } = useLoaderData();
    const [flashcardDeck, setFlashcardDeck] = useState(null);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();

    async function onClickCategory ({category}) {
        if (isLoading) return; // prevent multiple simultaneous requests
        setIsLoading(true);

        const response = await api.get(`/flashcards/${category}`);
        const flashcards = response.data;
        setCategory(category);
        setFlashcardDeck(flashcards);
        setIsLoading(false);
    }

    async function onUpdateFlashCard({flashcard, newFirstLanguage, newFirstLanguageText, newSecondLanguage, newSecondLanguageText, newCategory, newFormal, newTags}, callback) {
      const token = user && await user.getIdToken();
      const headers = token ? { authtoken: token } : {};
      const reqBody = { 
        firstLanguage: newFirstLanguage,
        firstLanguageText: newFirstLanguageText,
        secondLanguage: newSecondLanguage,
        secondLanguageText: newSecondLanguageText,
        category: newCategory,
        formal: newFormal,
        tags: newTags
      };
      if(flashcard._id) {
        const response = await api.patch(`/flashcards/${flashcard._id}`, reqBody, { headers });
        const updatedFlashCard = response.data;
        setFlashcardDeck(prev =>
          prev.map(fc => fc._id === flashcard._id ? updatedFlashCard : fc)
        );
      } else {
        const response = await api.post(`/flashcards/`, reqBody, { headers });
        const newFlashCard = response.data;
        setFlashcardDeck(prev =>
          prev.map(fc => fc._id === flashcard._id ? newFlashCard : fc)
        );
      }
      callback();
    }

    function onAddFlashCard() {
        const newFlashCard = {
            _id: null,   // temporary client-side ID
            firstLanguage: 'English',
            firstLanguageText: 'New English Word',
            secondLanguage: 'Swiss-German',
            secondLanguageText: 'New Swiss-German Word',
            tags: '',
            category: category,
            formal: false
        };
        setFlashcardDeck([...flashcardDeck, newFlashCard]);
    }

  return (
    <div className="container center">
      <div className="card" >
        <h1>Administration</h1>
        <h2>Flash Cards</h2>
          {!isLoading && categories.map(category => (
          <button key={category} style={{ margin: '10px' }} onClick={() => onClickCategory({category})}>{category}</button>
          ))}
          <div id="flashcards">
            {!isLoading && flashcardDeck && <h3>Cards in deck:</h3> }
            {!isLoading && flashcardDeck && flashcardDeck.map((flashcard, index) => (
              <EditFlashCard key={flashcard._id ?? `unsaved-${index}`} flashcard={flashcard} onUpdateFlashCard={onUpdateFlashCard} />
            ))}
          </div>
          {!isLoading && flashcardDeck && <button onClick={onAddFlashCard}>Add Flash Card</button>}
      </div>
    </div>
  );
}