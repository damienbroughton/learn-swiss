## Learn-Swiss

Learn about Switzerland and Swiss German with interactive stories, scenarios, flashcards, and challenges.  
This repository is a monorepo containing a React front-end and a Node.js/TypeScript back-end.

---

## Project Structure

- `front-end/` – Vite + React 18 (public site)
- `back-end/` – Node.js + Express + TypeScript API

---

## Prerequisites

- **Node.js**: v22+ (back-end `engines` requirement; safe for front-end too)
- **npm**: 9+ (or a compatible version)
- Optional: MongoDB, Firebase project, and any required cloud services configured for the back-end.

---

## Front-End

Located in `front-end/`.

### Tech Stack

- **React 18**
- **Vite**

### Install Dependencies

```bash
cd front-end
npm install
```

### Environment

Create a `.env` (or `.env.local`) file in `front-end/` as needed for:

- API base URL (e.g. `VITE_API_BASE_URL`)
- Firebase config
- Any other front-end environment variables

(Names depend on how `front-end/src/api` is implemented; they should all start with `VITE_` for Vite.)

### Run Dev Server

```bash
cd front-end
npm run dev
```

The app will be available at the URL printed in the terminal (usually `http://localhost:5173`).

### Lint

```bash
cd front-end
npm run lint
```

### Build & Sitemap Generation

The build script also generates `public/sitemap.xml` using live data from the API:

```bash
cd front-end
npm run build
```

This runs:

- `vite build`
- `node scripts/generate-sitemap.js`

The sitemap includes:

- Static pages (home, lists, auth pages, etc.)
- Dynamic pages for:
  - Stories: `/stories/{reference}`
  - Scenarios: `/scenarios/{reference}/practice`
  - Challenges: `/challenges/{reference}/practice`
  - Flashcard categories: `/flashcard/{category}`

---

## Back-End

Located in `back-end/`.

### Tech Stack

- **Node.js** (ES modules)
- **TypeScript**
- **Express**
- **MongoDB** client
- **Firebase Admin SDK**
- **Google Cloud Secret Manager & Tasks**

### Install Dependencies

```bash
cd back-end
npm install
```

### Environment

Create a `.env` file in `back-end/` with credentials and configuration such as:

- MongoDB connection string
- Firebase service account / credentials
- Google Cloud project configuration
- Any API keys required by `@google/genai`

(Exact variable names depend on `src/server.ts` and related config.)

### Run in Development

```bash
cd back-end
npm run dev
```

This uses `nodemon` with `ts-node` to run `src/server.ts` in watch mode.

### Build & Start (Production)

```bash
cd back-end
npm run build   # tsc ➜ outputs to build/
npm start       # runs build/server.js
```

---

## Typical Local Workflow

1. **Start the API**:

   ```bash
   cd back-end
   npm run dev
   ```

2. **Start the front-end**:

   ```bash
   cd front-end
   npm run dev
   ```

3. Open the front-end URL in your browser and interact with stories, flashcards, scenarios, and challenges.

4. For production assets (including sitemap):

   ```bash
   cd front-end
   npm run build
   ```

---

## Deployment Notes

- **Front-End**: deploy the `front-end/dist` folder to your static hosting / CDN (e.g. Vercel, Netlify, CloudFront).
- **Back-End**: deploy the compiled `back-end/build/server.js` to your Node environment (Cloud Run, App Engine, EC2, etc.).
- Ensure `SITE_URL` in `front-end/scripts/generate-sitemap.js` matches the deployed domain so generated URLs in `sitemap.xml` are correct.
- Configure environment variables in your hosting provider for both front-end and back-end.

---

## License

This project is licensed under the terms specified in `back-end/package.json` (`ISC`), unless otherwise noted.
