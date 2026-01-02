import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import { QuestionService } from '../services/QuestionService';
import { Language } from '@istqb-app/shared';

const router = Router();

/**
 * GET /questions/count-by-topic
 * Obtiene la cantidad de preguntas disponibles por tema
 */
router.get('/count-by-topic', async (req, res, next) => {
  try {
    const counts = await QuestionService.getQuestionCountByTopic();
    res.status(200).json({
      statusCode: 200,
      data: counts,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /questions/:id
 * Obtiene una pregunta por ID en el idioma especificado
 * Query params: language (opcional, default: 'es')
 */
router.get('/:id', async (req, res, next) => {
  try {
    const language = (req.query.language as Language) || 'es';
    const question = await QuestionService.getQuestionById(req.params.id, language);
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /questions/topic/:topic
 * Obtiene preguntas por tema en el idioma especificado
 * Query params: language (opcional, default: 'es'), limit
 */
router.get('/topic/:topic', async (req, res, next) => {
  try {
    const { limit, language } = req.query;
    const questions = await QuestionService.getQuestionsByTopic(
      req.params.topic,
      (language as Language) || 'es',
      parseInt(limit as string) || 10
    );
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /questions
 * Obtiene preguntas para examen (aleatorias) en el idioma especificado
 * Query params: count (opcional, default: 40), language (opcional, default: 'es')
 */
router.get('/', async (req, res, next) => {
  try {
    const { count, language } = req.query;
    const questions = await QuestionService.getQuestionsForExam(
      parseInt(count as string) || 40,
      (language as Language) || 'es'
    );
    res.status(200).json({
      statusCode: 200,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /questions (admin only)
 * Crea una nueva pregunta con traducciones
 */
router.post('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // TODO: Verificar que el usuario sea admin
    const question = await QuestionService.createQuestion(req.body);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
});

export default router;
