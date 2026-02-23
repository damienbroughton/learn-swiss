import api from "../api";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Helmet } from 'react-helmet-async';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const prevPage = searchParams.get("prev");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(prevPage ? "You need to be logged in to perform that action" : "");

  const title = `Learn-Swiss: Login`;
  const description = `Login to Swiss-German to save progress when practicing with flashcards, rehearsing fun scenarios, and learning stories. AI Generate your own story with flashcards.`;
  const canonicalUrl = `https://www.learn-swiss.ch/login`;
  const schema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

  const navigate = useNavigate();

  async function logIn(){
    try {
        const auth = getAuth();
        const loginReponse = await signInWithEmailAndPassword(auth, email, password);

        const token = loginReponse && loginReponse.user && loginReponse.user.accessToken;
        if (token === null) {
            console.error('No token found');
            return;
        }
        navigate(prevPage ? `/${prevPage}` : "/");
    } catch (error) {
        setError(error.message);
    }
  }

    async function signInWithGoogle() {
        try {
          const auth = getAuth();
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const token = result.user?.accessToken;
          if (token === null) {
            console.error('No token found');
            return;
          }
          await api.post(`/user`, { username: result.user.displayName || result.user.email });
          navigate(prevPage ? `/${prevPage}` : "/");
        } catch (error) {
          setError(error.message);
        }
    }

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
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
    <div className="container center">
      <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '2.5em 2em', boxSizing: 'border-box' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5em' }}>Login</h1>
        {error && <p style={{ color: 'var(--danger)', background: '#fff5f5', borderRadius: 8, padding: '0.7em', marginBottom: '1em', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={e => { e.preventDefault(); logIn(); }}>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" autoComplete="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required  style={{ width: '100%' }} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}  style={{ width: '100%' }} />
          <button type="submit" style={{ width: '100%', marginTop: '1.2em' }}>Login</button>
        </form>
        
        <div style={{ textAlign: 'center', margin: '1.5em 0', display: 'flex', alignItems: 'center', gap: '0.7em' }}>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
          <span style={{ color: '#999' }}>Or</span>
          <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
        </div>

        <button type="button" onClick={signInWithGoogle} style={{ width: '100%', marginBottom: '0.7em', background: '#fff', color: '#222', border: '1.5px solid #ccc' }}>
          🔵 Sign in with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5em' }}>
          <Link to="/create-account"><span style={{ color: 'var(--primary)' }}>Don't have an account? Create one</span></Link>
        </div>
      </div>
    </div>
    </>
  );
}
