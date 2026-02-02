# Copilot / AI Agent Instructions for learn-swiss ✅

Purpose: Short, actionable guidance so an AI code agent can be productive immediately in this repository.

## Big picture 🔧
- **Front-end**: React + Vite in `front-end/`. Dev: `cd front-end && npm run dev`. Build output: `front-end/dist` (vite default). Uses Firebase (see `front-end/src` and `front-end/package.json`).
- **Back-end**: Node (Node >=22) + Express + TypeScript in `back-end/src`. Entry: `back-end/src/server.ts`. Dev: `cd back-end && npm run dev` (nodemon + `ts-node/esm`). Build: `cd back-end && npm run build` → compiled in `back-end/build` and run `npm start`.
- **Persistence**: MongoDB accessed via `back-end/src/config/db.ts`. Credentials are retrieved using Google Secret Manager (see `back-end/src/config/secrets.ts`). If no cloud credentials, the code falls back to `mongodb://localhost:27017` for local dev.
- **AI integration**: Gemini/GenAI client initialized in `back-end/src/config/gemini.ts` using `@google/genai`. Model constant: `GEMINI_MODEL` (default `gemini-2.5-flash`). `GOOGLE_GENAI_USE_VERTEXAI` must be set to `'True'` (string) to enable Vertex AI path.
- **Cloud tasks / jobs**: `initTasks()` is invoked on startup (`back-end/src/config/tasks.ts`) — indicates integration with Google Cloud Tasks.
- **Static assets**: The server serves static files from `../dist` relative to compiled server. Deployment should ensure built frontend assets are available at `back-end/dist` (or served to the same static path the server expects).

## Key environment variables & secrets ⚠️
- Required for cloud runs: `GOOGLE_PROJECT_ID` (used by Secret Manager).
- Secrets referenced by name: `MONGODB_DB`, `MONGODB_PASSWORD`. Optional: `MONGODB_USERNAME` (if connecting to a cloud cluster).
- Other useful vars: `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_LOCATION`, `PORT`.
- Secrets are accessed via `getSecret(name)` in `back-end/src/config/secrets.ts` — **do not** hard-code credentials.

## Developer workflows & quick commands ▶️
- Front-end dev: `cd front-end && npm install && npm run dev`
- Front-end build: `cd front-end && npm run build` (also runs `node scripts/generate-sitemap.js`)
- Back-end dev: `cd back-end && npm install && npm run dev`
- Back-end build & start (prod): `cd back-end && npm run build && npm start`
- Lint (frontend): `cd front-end && npm run lint`

## Project-specific conventions & patterns 📐
- **ESM + TS**: The project uses ES modules. In TypeScript sources, imports use `.js` extensions (e.g. `import { connectToDB } from './config/db.js'`) because runtime uses ESM-compatible compiled JS — preserve the `.js` extension.
- **Separation of concerns**: Routes live in `back-end/src/routes/*.ts` and delegate to `back-end/src/services/*.ts` for business logic. Example: flashcards -> `flashcardRoutes.ts` and `flashcardService.ts`.
- **Auth middleware**: Authentication (`authenticateToken`) and user enrichment (`enrichUser`) are added globally in `server.ts` — most API routes assume these run first.
- **Gemini usage**: Use `initializeGeminiClient()` (or `initializeGeminiClient` behavior) in `back-end/src/config/gemini.ts` when integrating LLM features; respect `GEMINI_MODEL` and Vertex AI toggle.

## File references (start here) 🔎
- Backend: `back-end/src/server.ts`, `back-end/src/config/db.ts`, `back-end/src/config/secrets.ts`, `back-end/src/config/gemini.ts`, `back-end/src/config/tasks.ts`
- Backend features: `back-end/src/routes/*.ts`, `back-end/src/services/*.ts`, `back-end/src/middleware/*.ts`
- Frontend: `front-end/src/*`, `front-end/package.json`, `front-end/scripts/generate-sitemap.js`

## Examples / Patterns to follow ✍️
- Add a new API endpoint: implement handler in `back-end/src/services/<feature>Service.ts` and expose routes in `back-end/src/routes/<feature>Routes.ts`.
- Use secrets: call `getSecret('SECRET_NAME')` rather than reading secrets directly from process.env (unless it's the project id or non-secret config).
- Change Gemini settings: update `GEMINI_MODEL` in `back-end/src/config/gemini.ts` and ensure `GOOGLE_GENAI_USE_VERTEXAI` is set when expecting Vertex AI integration.

## Debugging tips 🐞
- If server exits on start, check: missing `GOOGLE_PROJECT_ID`, failed DB connection (see logs from `back-end/src/config/db.ts`), or missing secrets.
- Local DB dev: omit `MONGODB_USERNAME` / `MONGODB_PASSWORD` to use local `mongodb://localhost:27017` fallback.
- Logs use console; enable environment variables locally when testing cloud integrations.

---
If any of these sections are unclear or you'd like more automation (e.g., a script to copy `front-end/dist` → `back-end/dist` for local end-to-end testing), tell me which part to expand and I’ll iterate. 💬
