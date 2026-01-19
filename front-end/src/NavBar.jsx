import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import useAppUser from './hooks/useAppUser';
import iggyImage from './assets/IggyLogo54x64.png';


export default function NavBar(){
    const { isLoading, appUser } = useAppUser();

    const navigate = useNavigate();

    return (
        <nav>
            <ul>
                <li style={{ display: 'flex', alignItems: 'center' }}><Link to="/"><img src={iggyImage} alt="Iggy" style={{ display: 'block', width: '50.4px', height: '57.6px' }} /></Link></li>
                <li><Link to="/flashcards">Flashcards</Link></li>
                <li><Link to="/scenarios">Scenarios</Link></li>
                <li><Link to="/stories">Stories</Link></li>
                <li><Link to="/challenges">Challenges</Link></li>
                {isLoading ? <li style={{ color: "white" }}>Loading...</li> : (
                    <>
                    {appUser && appUser.role == "admin" && (<li><Link to="/admin">Admin</Link></li>)}
                    <li>
                        {appUser 
                        ? <button onClick={() => signOut(getAuth())}>Sign Out</button>
                        : <button onClick={() => navigate('/login')}>Sign In</button>}
                    </li>
                    </>
                    )}
            </ul>
        </nav>
    )
}