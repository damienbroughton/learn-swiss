import api from "../api";
import { useEffect, useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import imgStoriesCH from '../assets/HedgeHogBook.png';
import imgStoriesDE from '../assets/BoarBook.png';


export default function StoryListPage() {
  const {initialStories} = useLoaderData();

  const [stories, setStories] = useState([...initialStories]);
  const [firstLanguage, setFirstLanguage] = useState("English");
  const [secondLanguage, setSecondLanguage] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filteredStories = initialStories.filter((story) =>
        (story.language === secondLanguage || secondLanguage === "All") && story.title.toLowerCase().includes(lowerQuery));
      setStories(filteredStories);
  }, [initialStories, secondLanguage, searchQuery])

  const navigate = useNavigate();

  return (
    <div className="container center">
      <div className="card" >
        <h1>Stories</h1>
          <div style={{display: "flex"}}>
            <label>First Language: 
              <select id="firstLanguage" value={firstLanguage} onChange={e => setFirstLanguage(e.target.value)} >
                  <option value="English">English</option>
              </select>
            </label>
            <label>Second Language: 
              <select id="secondLanguage" value={secondLanguage} onChange={e => setSecondLanguage(e.target.value)}  >
                  <option value="All">All</option>
                  <option value="Swiss-German">Swiss-German</option>
                  <option value="German">German</option>
              </select>
            </label>
            <label htmlFor='search-query'>Search:
              <input 
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
  );
}

export async function loader () {
  const response = await api.get(`/stories/`);
  const initialStories = response.data;
  return {initialStories};
}