import api from "../api";
import { useLoaderData } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import imgFlashCards from '../assets/HedgeHogFlashCards.png';


export default function StoryListPage() {
  const {stories} = useLoaderData();

  const navigate = useNavigate();

  return (
    <div className="container center">
      <div className="card" >
        <h1>Stories</h1>
          <ul className="scenario-list">
            {stories.map(story => (
              <li key={story.title} className="scenario-list-item">
                <div
                  className="scenario-card"
                  onClick={() => navigate(`/stories/${story.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { navigate(`/flashcard/${story.id}`); } }}
                  aria-label={`Open flashcard category: ${story.title}`}
                >
                  <img src={imgFlashCards} alt={story.title} className="scenario-card-img" />
                  <div className="scenario-card-title">{story.title}</div>
                </div>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}

export async function loader () {
  const response = await api.get(`/stories/`);
  const stories = response.data;
  return {stories};
}