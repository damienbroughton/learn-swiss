import HedgeHogChat from '../assets/HedgeHogChat.png';


export default function ContactPage() {
  return (
    <>
        <div className="container center">
            <div className="card" >
                <h1>Contact Us</h1>
                <div style={{ display: 'flex' }}>
                    <img src={HedgeHogChat} alt="Chatting Hedgehog" className="homepage-img"  />
                    <p>Have questions, feedback, or want to share your experience with Learn-Swiss? We’d love to hear from you! Please reach out to us through any of the following channels:</p>
                </div>
                <p><strong>Email:</strong> <a href="mailto:inquiries@learn-swiss.ch">inquiries@learn-swiss.ch</a></p>
                <p>We appreciate your support and look forward to helping you on your Swiss-German learning journey!</p>
            </div>
        </div>
    </>
  );
}
