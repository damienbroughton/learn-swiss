import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import imgStoriesCH from '../assets/HedgeHogBook.png';
import imgStoriesDE from '../assets/BoarBook.png';


export default function StoryListPage() {
  const {stories} = useLoaderData();

  const navigate = useNavigate();

  return (
    <div className="container center">
      <div className="card" >
        <h1>Stories</h1>
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
  const stories = response.data;
  return {stories};
}