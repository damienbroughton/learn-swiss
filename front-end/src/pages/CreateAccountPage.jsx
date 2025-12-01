import api from "../api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function CreateAccountPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

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
            await api.post(`/user`, null);

            navigate("/");
            
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="container center">
            <div className="card" style={{ maxWidth: 400, width: '100%', margin: '0 auto', padding: '2.5em 2em', boxSizing: 'border-box' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5em' }}>Create Account</h1>
                {error && <p style={{ color: 'var(--danger)', background: '#fff5f5', borderRadius: 8, padding: '0.7em', marginBottom: '1em', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={e => { e.preventDefault(); createAccount(); }}>
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" autoComplete="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} />
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" autoComplete="new-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} style={{ width: '100%' }} />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={{ width: '100%' }} />
                    <button type="submit" style={{ width: '100%', marginTop: '1.2em' }}>Create Account</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1.5em' }}>
                    <Link to="/login"><span style={{ color: 'var(--primary)' }}>Already have an account? Login</span></Link>
                </div>
            </div>
        </div>
    );
}
