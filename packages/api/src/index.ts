import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Nota: importamos middleware y rutas *después* de cargar dotenv

// Cargar variables de entorno lo antes posible
dotenv.config();

// Importar la configuración después de cargar .env
import { config } from './config';

// Importar middleware y rutas tras cargar variables de entorno
import { errorHandler } from './middleware';
import authRoutes from './routes/auth';
import questionRoutes from './routes/questions';
import answerRoutes from './routes/answers';
import examRoutes from './routes/exams';
import reminderRoutes from './routes/reminders';
import achievementRoutes from './routes/achievements';
import userRoutes from './routes/users';
import studyRoutes from './routes/study';
import schedulerRoutes from './routes/scheduler';

// Crear aplicación Express
const app: Express = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
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
