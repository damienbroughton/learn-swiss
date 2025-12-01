import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import imgFlashCards from '../assets/HedgeHogFlashCards.png';


export default function FlashCardListPage() {
  const {categories} = useLoaderData();

  const navigate = useNavigate();

  return (
    <div className="container center">
      <div className="card" >
        <h1>Flash Cards</h1>
          <ul className="scenario-list">
            {categories.map(category => (
              <li key={category} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/flashcard/${category}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/flashcard/${category}`); } }}
                  aria-label={`Open flashcard category: ${category}`}
                >
                  <img src={imgFlashCards} alt={category} className="scenario-card-img" />
                  <div className="scenario-card-title">{category}</div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}

export async function loader () {
  const response = await api.get(`/flashcards/categories`);
  const categories = response.data;
  return {categories};
}