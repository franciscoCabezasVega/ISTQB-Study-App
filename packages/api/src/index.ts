import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Nota: importamos middleware y rutas *después* de cargar dotenv

// Cargar variables de entorno lo antes posible
dotenv.config();

// Importar la configuración después de cargar .env
const { config } = require('./config');

// Importar middleware y rutas tras cargar variables de entorno
const { errorHandler } = require('./middleware');
const authRoutes = require('./routes/auth').default;
const questionRoutes = require('./routes/questions').default;
const answerRoutes = require('./routes/answers').default;
const examRoutes = require('./routes/exams').default;
const reminderRoutes = require('./routes/reminders').default;
const achievementRoutes = require('./routes/achievements').default;
const userRoutes = require('./routes/users').default;
const studyRoutes = require('./routes/study').default;
const schedulerRoutes = require('./routes/scheduler').default;

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
