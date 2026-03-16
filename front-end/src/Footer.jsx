import { Link } from "react-router-dom";


export default function Footer(){

    return (
        <footer>
            <div className="footer-bottom">
                © 2026 Learn-Swiss. All rights reserved.&nbsp;
                <Link to="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>Contact Us</Link>
            </div>
        </footer>
    )
}