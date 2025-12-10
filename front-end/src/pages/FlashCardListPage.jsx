import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import imgFlashCards from '../assets/HedgeHogFlashCards.png';


export default function FlashCardListPage() {
  const {categories} = useLoaderData();
  
  const title = `Learn-Swiss: Flashcards`;
  const description = `Learn Swiss-German stories by practicing with flashcards!`;
  const canonicalUrl = `https://learn-swiss.ch/flashcards`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  const navigate = useNavigate();

  return (
    <>
    <Helmet>
        {/* Dynamic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
    <div className="container center">
      <div className="card" >
        <h1>Flashcards</h1>
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
    </>
  );
}

export async function loader () {
  const response = await api.get(`/flashcards/categories`);
  const categories = response.data;
  return {categories};
}