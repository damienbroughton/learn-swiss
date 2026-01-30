import { Helmet } from 'react-helmet-async';
import iggyImage from '../assets/IggyLogo.png';
import useAppUser from '../hooks/useAppUser';

export default function Homepage() {
  const { appUser } = useAppUser();

  const title = `Learn-Swiss`;
  const description = `Learn Swiss-German by practicing with flashcards, rehearsing fun scenarios, and learning stories.`;
  const canonicalUrl = `https://learn-swiss.ch/flashcards`;
  const storySchema = { "@context": "https://schema.org", "@type": "Article", "headline": title, "description": description, "url": canonicalUrl };

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
        <script type="application/ld+json">{JSON.stringify(storySchema)}</script>
    </Helmet>
    <div className="container center">
      <div className="card">
        <p>Welcome to Learn-Swiss{appUser && `, ${appUser.username}`}. {description}</p>
        <h1>Welcome to the World of Schwiizertüütsch!</h1>
        <div style={{ display: 'flex' }}>
          <img src={iggyImage} alt="Iggy the Hedgehog mascot" className="homepage-img" />
          <div>
            <p>Grüezi! If you’ve ever stepped off a train in Zurich or walked through a village in the Alps and thought, "I studied German in school, but I have no idea what these people are saying,"—don't worry, you aren’t alone.</p>
            <p>You’ve just encountered Swiss German (or Schwiizertüütsch), a vibrant, soulful, and surprisingly diverse collection of Alemannic dialects that serve as the heartbeat of everyday life in Switzerland.</p>
          </div>
        </div>
        <hr />
        <h2>Is it different from High German?</h2>
        <p>In short: Yes. While "High German" (Hochdeutsch) is what you’ll find in textbooks or on the evening news, Swiss German is what people actually use to joke with friends, order coffee, and talk to their families.
        <br /><br />Think of it this way: High German is the language of the head (formal and structured), while Swiss German is the language of the heart. The grammar is different, the vocabulary is unique, and the pronunciation is much more "throaty" and rhythmic.</p>
        <h2>A Mosaic of Dialects</h2>
        <p>One of the most beautiful things about Swiss German is that there is no single "standard" version. Instead, it’s a mosaic of regional dialects:</p>
        <ul>
          <li><strong>Zurich German (Züritüütsch):</strong> The fast-paced, urban energy of Zurich.</li>
          <li><strong>Bernese German (Bärndütsch):</strong> The singing, melodic tones of Bernese.</li>
          <li><strong>Basel German (Baseldytsch):</strong> The distinct, sharp sounds of Basel.</li>
          <li><strong>Wallis German (Wallisdytsch):</strong> The deep, ancient-sounding dialects of the Wallis mountains.</li>
        </ul>
        <p>Every valley and city has its own flavor, yet somehow, everyone understands each other. It’s a linguistic miracle!</p>
        <hr />
        <h2>Identity and the Written Word</h2>
        <p>For the Swiss, speaking dialect is a massive part of their national identity. It’s a way of saying, "I’m home." However, you’ll rarely see Swiss German in a newspaper or a legal document. </p>
        <p>Switzerland operates under a system of diglossia:</p>
          <ul>
            <li><strong>High German</strong> is used for writing, formal education, and official news.</li>
            <li><strong>Swiss German</strong> is used for speaking in almost every other situation.</li>
          </ul>
          Even when texting friends, many Swiss people write in dialect using their own phonetic spelling—which is exactly what we’re going to help you navigate!
        <hr />
        <h2>The Golden Rule: Just Add "-li"</h2>
        <p>Before you dive into your first lesson, here is a secret weapon for sounding more "Swiss": The Diminutive.</p>
        <p>The Swiss love to make things smaller and cuter. In High German, you might add -chen or -lein, but in Switzerland, we use -li.</p>
          <ul>
            <li>A house (Haus) becomes a Hüs<strong>li</strong>.</li>
            <li>A cookie (Guetz<strong>li</strong>) is basically mandatory with coffee.</li>
            <li>Even a cat (Chatz) becomes a Chätz<strong>li</strong>.</li>
          </ul>
          If you want to sound friendly and local, adding a -li to the end of a noun is the fastest way to a Swiss person’s heart!
        <hr />
        <h2>Some words & phrases to get you started</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Swiss-German</th>
                <th>German</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Grüezi</td>
                <td>Hallo</td>
                <td>Hello</td>
              </tr>
            <tr>
              <td>Wie gaats dir?</td>
              <td>Wie geht es dir?</td>
              <td>How are you?</td>
            </tr>
            <tr>
              <td>Guät, und dir?</td>
              <td>Gut, und dir?</td>
              <td>Good and you?</td>
            </tr>            
            <tr>
              <td>Proscht / Pröschtli</td>
              <td>Proscht</td>
              <td>Cheers</td>
            </tr>
            <tr>
              <td>Merci (vilmal)</td>
              <td>Danke (vielmal)</td>
              <td>Thank you (very much)</td>
            </tr>
            <tr>
              <td>Ja, bitte</td>
              <td>Ja, bitte</td>
              <td>Yes please</td>
            </tr>
            <tr>
              <td>Nai, danke</td>
              <td>Nein, danke</td>
              <td>No thank you</td>
            </tr>
            <tr>
              <td>Enschuldigung</td>
              <td>Entschuldigung</td>
              <td>Excuse me</td>
            </tr>
            <tr>
              <td>Tschüss</td>
              <td>Auf Wiedersehen</td>
              <td>Goodbye</td>
            </tr>
            <tr>
              <td>I heisse.. / Mi name isch..</td>
              <td>Ich heisse.. / Mein name ist..</td>
              <td>I am.. / My name is..</td>
            </tr>
            <tr>
              <td>Froit mich, di känna z'larna</td>
              <td>Freut mich, Sie kennenzulernen</td>
              <td>It's a pleasure to meet you</td>
            </tr>
            <tr>
              <td>Chönd Sii Änglisch?</td>
              <td>Sprechen Sie Englisch?</td>
              <td>Do you speak English?</td>
            </tr>
            <tr>
              <td>Sorry, ich verschtaa Sii nöd</td>
              <td>Entschuldigung, ich verstehe Sie nicht</td>
              <td>Sorry, I don't understand you</td>
            </tr>
            <tr>
              <td>Was händ Sii gsait?</td>
              <td>Was haben Sie gesagt?</td>
              <td>What did you say?</td>
            </tr>
            <tr>
              <td>Wänd Sii öppis go trinkä?</td>
              <td>Möchtest du etwas trinken gehen?</td>
              <td>Would you like to go for a drink?</td>
            </tr>       
            <tr>
              <td>Chuchichäschtli</td>
              <td>Küchenschrank</td>
              <td>Kitchen cupboard (The classic test!)</td>
            </tr>      
            <tr>
              <td>Poschte</td>
              <td>Einkaufen</td>
              <td>Shopping</td>
            </tr>    
            <tr>
              <td>Schoggi</td>
              <td>Schokolade</td>
              <td>Chocolate</td>
            </tr>         
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
