import { useLoaderData, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import FlashCardReview from "../FlashCardReview";
import api from "../api"; 

export default function FlashCardPage() {
  const { flashcards } = useLoaderData();
  const navigate = useNavigate();

  const category = flashcards[0]?.category || 'Flashcards';
  const meta = useSEOMeta({
    title: `Learn-Swiss: ${category} Flashcards - Practice ${flashcards[0]?.secondLanguage || 'Swiss-German'} Vocabulary`,
    description: `Master vocabulary from the '${category}' category in ${flashcards[0]?.secondLanguage || 'Swiss-German'}. Interactive flashcard practice for vocabulary building and language retention.`,
    canonicalUrl: `https://www.learn-swiss.ch/flashcards/${category}`,
    keywords: `${category} flashcards, vocabulary practice, Swiss German, language learning`,
    schema: { "@context": "https://schema.org", "@type": "LearningResource", "name": `${category} Flashcards`, "url": `https://www.learn-swiss.ch/flashcards/${category}`, "learningResourceType": "Interactive practice", "inLanguage": "en" }
  });

  // Define the completion handler to navigate back
  const handleReviewComplete = () => {
    navigate('/flashcards');
  };

  return (
    <>
    <PageHelmet {...meta} />
    <FlashCardReview 
      flashcards={flashcards}
      completeButtonText="Back to flashcards"
      onComplete={handleReviewComplete}
      sourcePage="FlashCardPage"
    />
    </>
  );
}

export async function loader ({params}) {
  try {
    const response = await api.get(`/flashcards/${params.category}/Swiss-German?forReview=true`);
    const flashcards = response.data;
    return { flashcards };
  } catch (err) {
    if (err && err.response && err.response.status === 401) {
      // Fallback for unauthenticated users: return unfiltered flashcards
      const fallback = await api.get(`/flashcards/${params.category}/Swiss-German`);
      return { flashcards: fallback.data };
    }
    throw err;
  }
}