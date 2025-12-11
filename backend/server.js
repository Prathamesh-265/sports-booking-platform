import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import bookingsRouter from './routes/bookings.js';
import courtsRouter from './routes/courts.js';
import coachesRouter from './routes/coaches.js';
import rulesRouter from './routes/rules.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/bookings', bookingsRouter);
app.use('/api/courts', courtsRouter);
app.use('/api/coaches', coachesRouter);
app.use('/api/rules', rulesRouter);

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');

app.use(express.static(frontendBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
