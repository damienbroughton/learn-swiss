import dotenv from "dotenv";
dotenv.config();

import express, { type Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDB } from './config/db.js';
import { initializeFirebase } from './config/firebase.js';
import { authenticateToken } from './middleware/authenticateToken.js';
import { enrichUser } from './middleware/enrichUser.js';
import { initTasks } from './config/tasks.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userProgressRoutes from './routes/userProgressRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';

await initializeFirebase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../dist')));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// AUTHENTICATE

app.use(authenticateToken);
app.use(enrichUser);

// ROUTING

app.use("/api/user", userRoutes);
app.use("/api/userProgress", userProgressRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/challenges", challengeRoutes);

const PORT = process.env.PORT || 8000;

async function startServer() {
  await connectToDB();
  await initTasks();

  app.listen(PORT, function() {
    console.log('Server is running on port ' + PORT);
  });
}
startServer();
