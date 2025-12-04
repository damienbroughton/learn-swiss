import iggyImage from '../assets/IggyLogo.png';
import useAppUser from '../hooks/useAppUser';

export default function Homepage() {

  const { appUser } = useAppUser();

  return (
    <div className="container center">
      <div className="card">
        <h1 style={{ marginBottom: '0.5em' }}>Welcome to Learn-Swiss{appUser && `, ${appUser.username}`}</h1>
        <h2 style={{ fontWeight: 400, color: 'var(--primary)', marginBottom: '1.5em', fontSize: '1.3em' }}>Learn Swiss German with fun scenarios and flashcards!</h2>
        <img src={iggyImage} alt="Iggy the Hedgehog mascot" className="homepage-img" style={{ width: '160px', height: '160px', objectFit: 'contain', margin: '0 auto 1.5em auto', display: 'block', borderRadius: '50%', boxShadow: '0 2px 16px 0 rgba(44,62,80,0.08)' }} />
        <p><b>Note:</b> this site is not currently public and still under construction with regular deployments and feature testing.</p>
      </div>
    </div>
  );
}
