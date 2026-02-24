import api from "../api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import useSEOMeta from '../hooks/useSEOMeta';
import PageHelmet from '../components/PageHelmet';

export default function CreateAccountPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const meta = useSEOMeta({
      title: `Learn-Swiss: Create Account - Start Learning Swiss-German`,
      description: `Create your Learn-Swiss account to track progress, save your learning history, and unlock premium features for learning Swiss-German.`,
      canonicalUrl: `https://www.learn-swiss.ch/create-account`,
      keywords: `Swiss German learning account, sign up, create account, language learning`,
      robotsDirective: 'index, follow',
      schema: { "@context": "https://schema.org", "@type": "WebApplication", "name": "Create Account", "url": "https://www.learn-swiss.ch/create-account", "applicationCategory": "EducationApplication" }
    });

    const navigate = useNavigate();

    async function createAccount(){
        if(password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        try {
            const auth = getAuth();
            const createResponse = await createUserWithEmailAndPassword(auth, email, password);

            const token = createResponse && createResponse.user && createResponse.user.accessToken;
            if (token === null) {
                console.error('No token found');
                return;
            }
            await api.post(`/user`, { username });

            navigate("/");
            
        } catch (error) {
            setError(error.message);
        }
    }

    async function signUpWithGoogle() {
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
          navigate("/");
        } catch (error) {
          setError(error.message);
        }
    }

    return (
        <>
        <PageHelmet {...meta} />
        <div className="container center">
            <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '2.5em 2em', boxSizing: 'border-box' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5em' }}>Create Account</h1>
                {error && <p style={{ color: 'var(--danger)', background: '#fff5f5', borderRadius: 8, padding: '0.7em', marginBottom: '1em', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={e => { e.preventDefault(); createAccount(); }}>
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" autoComplete="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
                    <label htmlFor="username">Username</label>
                    <input id="username" autoComplete="username" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%' }} />
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" autoComplete="new-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%' }} />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={{ width: '100%' }} />
                    <button type="submit" style={{ width: '100%', marginTop: '1.2em' }}>Create Account</button>
                </form>

                <div style={{ textAlign: 'center', margin: '1.5em 0', display: 'flex', alignItems: 'center', gap: '0.7em' }}>
                  <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
                  <span style={{ color: '#999' }}>Or</span>
                  <div style={{ flex: 1, height: '1px', background: '#ccc' }}></div>
                </div>

                <button type="button" onClick={signUpWithGoogle} style={{ width: '100%', marginBottom: '0.7em', background: '#fff', color: '#222', border: '1.5px solid #ccc' }}>
                  🔵 Sign up with Google
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5em' }}>
                    <Link to="/login"><span style={{ color: 'var(--primary)' }}>Already have an account? Login</span></Link>
                </div>
            </div>
        </div>
        </>
    );
}
