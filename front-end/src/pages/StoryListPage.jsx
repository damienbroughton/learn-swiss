import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';
import Filters from "../components/Filters";
import imgStoriesCH from '../assets/HedgeHogBook.png';
import imgStoriesDE from '../assets/Eber-Neutral.png';


export default function StoryListPage() {
  const {initialStories} = useLoaderData();

  const [stories, setStories] = useState([...initialStories]);
  const [secondLanguage, setSecondLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");

  const meta = useSEOMeta({
    title: `Learn-Swiss: Stories - Read Swiss-German & German Content`,
    description: `Learn Swiss-German and German through authentic stories across multiple categories. Build vocabulary with AI-generated flashcards and contextual learning.`,
    canonicalUrl: `https://www.learn-swiss.ch/stories/`,
    keywords: `Swiss German stories, German stories, Schwiizerdüütsch reading, language learning content`,
    schema: { "@context": "https://schema.org", "@type": "CollectionPage", "headline": "Stories", "description": "Read authentic stories", "url": "https://www.learn-swiss.ch/stories/" }
  });

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
    <PageHelmet {...meta} />
    <div className="container center">
      <div className="card">
        <h1>Stories</h1>
        <p>Learn Swiss-German and German through authentic stories across multiple categories. Build vocabulary with AI-generated flashcards and contextual learning.</p>
          <Filters
            items={[
              {
                type: "select",
                id: "secondLanguage",
                label: "Language",
                value: secondLanguage,
                onChange: (value) => setSecondLanguage(value),
                options: [
                  { value: "All" },
                  { value: "Swiss-German" },
                  { value: "German" },
                ],
              },
              {
                type: "select",
                id: "category",
                label: "Category",
                value: category,
                onChange: (value) => setCategory(value),
                options: [
                  { value: "All" },
                  { value: "Recipe" },
                  { value: "News Article" },
                  { value: "Letter/Email", label: "Letter or Email" },
                  { value: "Fairy Tale" },
                  { value: "Instructions" },
                  { value: "Travel Itinerary" },
                  { value: "Product Review" },
                  { value: "Movie Script" },
                  { value: "Poem" },
                  { value: "Job Description" },
                  { value: "Childrens Story" },
                  { value: "Song Lyrics" },
                ],
              },
              {
                type: "text",
                id: "search-query",
                label: "Search",
                value: searchQuery,
                onChange: (value) => setSearchQuery(value),
              },
            ]}
          />
          <ul className="scenario-list">
            {stories.map(story => (
              <li key={story.reference} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/stories/${story.reference}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/stories/${story.reference}`); } }}
                  aria-label={`Open story: ${story.reference}`}
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