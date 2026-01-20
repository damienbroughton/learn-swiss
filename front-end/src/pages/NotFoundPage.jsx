import { useNavigate } from "react-router-dom";
import imgError from '../assets/ErrorImage.png';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
    <div className="card" style={{textAlign: "center"}}>
        <h1>Page not found!</h1>
        <h2>Sorry, we couldn't find the page you're looking for.</h2>
        <img src={imgError} alt="Error image" style={{width: "80%", maxWidth: "500px"}} />
        <br />
        <button onClick={() => navigate(`/`)}>Back to homepage</button>
        <br />
        <button onClick={() => navigate(`/challenges`)}>To challenges</button>
        <button onClick={() => navigate(`/stories`)}>To stories</button>
    </div>
    </>
  );
}
