import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import imgStoriesCH from '../assets/HedgeHogBook.png';
import imgStoriesDE from '../assets/Eber-Neutral.png';


export default function StoryListPage() {
  const {initialStories} = useLoaderData();

  const [stories, setStories] = useState([...initialStories]);
  const [firstLanguage, setFirstLanguage] = useState("English");
  const [secondLanguage, setSecondLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const title = `Learn-Swiss: Stories`;
  const description = `Learn Swiss-German and German stories by building vocabulary with flashcards. You can generate your own with AI!`;
  const canonicalUrl = `https://learn-swiss.ch/stories/`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filteredStories = initialStories.filter((story) =>
        (story.language === secondLanguage || secondLanguage === "All")
        && (story.category === category || category === "All")
        && story.title.toLowerCase().includes(lowerQuery));
      setStories(filteredStories);
  }, [initialStories, secondLanguage, searchQuery, category])

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
        <h1>Stories</h1>
        <p>{description}</p>
          <div className="filters">
            {/* <label>First Language: 
              <select id="firstLanguage" value={firstLanguage} onChange={e => setFirstLanguage(e.target.value)} >
                  <option value="English">English</option>
              </select>
            </label> */}
            <label>Second Language: 
              <select id="secondLanguage" value={secondLanguage} onChange={e => setSecondLanguage(e.target.value)}  >
                  <option value="All">All</option>
                  <option value="Swiss-German">Swiss-German</option>
                  <option value="German">German</option>
              </select>
            </label>
            <label>Category: 
              <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Recipe">Recipe</option>
                  <option value="News Article">News Article</option>
                  <option value="Letter/Email">Letter or Email</option>
                  <option value="Fairy Tale">Fairy Tale</option>
                  <option value="Instructions">Instructions</option>
                  <option value="Travel Itinerary">Travel Itinerary</option>
                  <option value="Product Review">Product Review</option>
                  <option value="Movie Script">Movie Script</option>
                  <option value="Poem">Poem</option>
                  <option value="Job Description">Job Description</option>
                  <option value="Childrens Story">Childrens Story</option>
                  <option value="Song Lyrics">Song Lyrics</option>
              </select>
            </label>
            <label htmlFor='search-query'>Search:
              <input 
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
               </label>
            </div>
          <ul className="scenario-list">
            {stories.map(story => (
              <li key={story.reference} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/stories/${story.reference}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/stories/${story.reference}`); } }}
                  aria-label={`Open flashcard category: ${story.reference}`}
                >
                  <img src={story.language === "Swiss-German" ? imgStoriesCH : imgStoriesDE} alt={story.title} className="scenario-card-img" />
                  <div className="scenario-card-title">{story.title}</div>
                </div>
              </li>
            ))}
          </ul>
      </div>
      <button style={{marginTop: "10px", float: "right"}} onClick={() => navigate('/make-flashcards')}>Make your own</button>
    </div>
    </>
  );
}

export async function loader () {
  const response = await api.get(`/stories/`);
  const initialStories = response.data;
  return {initialStories};
}