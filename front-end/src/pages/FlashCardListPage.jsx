import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import imgFlashCards from '../assets/HedgeHogFlashCards.png';


export default function FlashCardListPage() {
  const {categories} = useLoaderData();
  
  const meta = useSEOMeta({
    title: `Learn-Swiss: Flashcards - Swiss-German Vocabulary Builder`,
    description: `Build your Swiss-German vocabulary by practicing with interactive flashcards. Learn Schwiizertüütsch words and phrases organized by category.`,
    canonicalUrl: `https://www.learn-swiss.ch/flashcards`,
    keywords: `Swiss German flashcards, vocabulary learning, Schwiizertüütsch, language practice`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Flashcards", "description": "Build your Swiss-German vocabulary", "url": "https://www.learn-swiss.ch/flashcards" }
  });

  const navigate = useNavigate();

  return (
    <>
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card" >
        <h1>Flashcards</h1>
          <p>{meta.description}</p>
          <ul className="scenario-list">
            {categories.map(category => (
              <li key={category.category} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/flashcard/${category.category}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/flashcard/${category.category}`); } }}
                  aria-label={`Open flashcard category: ${category.category}`}
                >
                  <img src={imgFlashCards} alt={category.category} className="scenario-card-img" />
                  <div className="scenario-card-title">{category.category}<br />({category.totalFlashcards > 0 ? Math.trunc(category.completedByUser/category.totalFlashcards * 100) : 0}% complete)</div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
    </>
  );
}

export async function loader () {
  const response = await api.get(`/flashcards/categories/Swiss-German`);
  const categories = response.data;
  return {categories};
}