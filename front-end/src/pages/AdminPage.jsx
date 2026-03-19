import api from "../api";
import { useState, useEffect } from "react";
import { useLoaderData, Navigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import EditFlashCard from "../EditFlashCard";
import useAppUser from "../hooks/useAppUser";

export default function AdminPage() {
    const { initialFlashcardCategories } = useLoaderData();
    const [flashcardDeck, setFlashcardDeck] = useState(null);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [firstLanguage, setFirstLanguage] = useState("English");
    const [secondLanguage, setSecondLanguage] = useState("Swiss-German");
    const [error, setError] = useState(null);

    const title = `Learn-Swiss: Admin`;

    const { isLoading: isAppUserLoading, appUser } = useAppUser();

    useEffect(() => {
        if (isLoading) return; // prevent multiple simultaneous requests
        if (!category) return;

        async function getFlashcards(){
          try {
            setIsLoading(true);
            const response = await api.get(`/flashcards/${category}/${secondLanguage}`);
            const flashcards = response.data;
            setFlashcardDeck(flashcards);
          } catch (error) {
            setError(error.message)
          } finally {
            setIsLoading(false);
          }
        }
        getFlashcards();
    }, [category, secondLanguage])

    async function onUpdateFlashCard({flashcard, newFirstLanguage, newFirstLanguageText, newSecondLanguage, newSecondLanguageText, newCategory, newFormal, newTags}, callback) {
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
        const response = await api.patch(`/flashcards/${flashcard._id}`, reqBody);
        const updatedFlashCard = response.data;
        setFlashcardDeck(prev =>
          prev.map(fc => fc._id === flashcard._id ? updatedFlashCard : fc)
        );
      } else {
        const response = await api.post(`/flashcards/`, reqBody);
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

  if (isAppUserLoading) {
    return (
      <div className="container center">
        <div className="card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!appUser || appUser.role !== "admin") {
    return (
      <div className="container center">
        <div className="card">
          <h1>Access denied</h1>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{title}</title>
    </Helmet>
    <div className="container center">
      <div className="card" >
        <h1>Administration</h1>
        <h2>Flash Cards</h2>
        <div className="filters">
          <label>First Language: 
            <select id="firstLanguage" value={firstLanguage} onChange={e => setFirstLanguage(e.target.value)} >
                <option value="English">English</option>
            </select>
          </label>
          <label>Second Language: 
            <select id="secondLanguage" value={secondLanguage} onChange={e => setSecondLanguage(e.target.value)} >
                <option value="Swiss-German">Swiss-German</option>
                <option value="German">German</option>
            </select>
          </label>
          </div>
          {!isLoading && initialFlashcardCategories && initialFlashcardCategories.map(category => (
          <button key={`${firstLanguage}-${secondLanguage}-${category.category}`} style={{ margin: '10px' }} onClick={() => setCategory(category.category)}>{category.category}</button>
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
    </>
  );
}