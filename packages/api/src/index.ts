// Cargar variables de entorno ANTES de cualquier import local (ESM evalúa imports en orden)
import 'dotenv/config';

import express, { Express } from 'express';
import cors from 'cors';

// Importar la configuración después de cargar .env
import { config } from './config/index.js';

// Importar middleware y rutas
import { errorHandler } from './middleware/index.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import examRoutes from './routes/exams.js';
import reminderRoutes from './routes/reminders.js';
import achievementRoutes from './routes/achievements.js';
import userRoutes from './routes/users.js';
import studyRoutes from './routes/study.js';
import schedulerRoutes from './routes/scheduler.js';
import reportRoutes from './routes/reports.js';

// Crear aplicación Express
const app: Express = express();

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/reports', reportRoutes);

// Manejo de errores
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
  });
});

// Iniciar servidor
const port = config.port;
app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   📚 ISTQB Study App - API Server                       ║
║   Running on: http://localhost:${port}                        ║
║   Environment: ${config.nodeEnv}                         ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;
