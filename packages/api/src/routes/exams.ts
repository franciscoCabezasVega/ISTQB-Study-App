import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware';
import ExamService from '../services/ExamService';

const router = Router();

/**
 * POST /api/exams
 * Crear nueva sesión de examen
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { difficulty = 'all' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = await ExamService.createExamSession(userId, difficulty, 40);

    res.status(201).json({
      statusCode: 201,
      data: session,
    });
  } catch (error: any) {
    console.error('POST /exams error:', error);
    res.status(400).json({
      statusCode: 400,
      error: error.message || 'Error creating exam session',
    });
  }
});

/**
 * POST /api/exams/:sessionId/answers
 * Guardar respuesta del usuario en el examen
 */
router.post('/:sessionId/answers', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { questionId, selectedAnswerId, timeSpent } = req.body;

    if (!questionId || !selectedAnswerId) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required fields: questionId, selectedAnswerId',
      });
    }

    const result = await ExamService.submitExamAnswer(
      sessionId,
      questionId,
      selectedAnswerId,
      timeSpent || 0
    );

    res.status(200).json({
      statusCode: 200,
      data: result,
    });
  } catch (error: any) {
    console.error('POST /exams/:sessionId/answers error:', error);
    res.status(400).json({
      statusCode: 400,
      error: error.message || 'Error submitting answer',
    });
  }
});

/**
 * POST /api/exams/:sessionId/answers/batch
 * Guardar múltiples respuestas del usuario en una sola petición
 */
router.post('/:sessionId/answers/batch', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        error: 'Missing required field: answers (array)',
      });
    }

    const result = await ExamService.submitExamAnswersBatch(sessionId, answers);

    res.status(200).json({
      statusCode: 200,
      data: result,
    });
  } catch (error: any) {
    console.error('POST /exams/:sessionId/answers/batch error:', error);
    res.status(400).json({
      statusCode: 400,
      error: error.message || 'Error submitting answers',
    });
  }
});

/**
 * POST /api/exams/:sessionId/complete
 * Finalizar sesión de examen y obtener resultados
 */
router.post('/:sessionId/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const results = await ExamService.completeExamSession(sessionId);

    res.status(200).json({
      statusCode: 200,
      data: results,
    });
  } catch (error: any) {
    console.error('POST /exams/:sessionId/complete error:', error);
    res.status(400).json({
      statusCode: 400,
      error: error.message || 'Error completing exam session',
    });
  }
});

/**
 * GET /api/exams/:sessionId
 * Obtener resultados de una sesión de examen
 */
router.get('/:sessionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const results = await ExamService.getExamResults(sessionId);

    res.status(200).json({
      statusCode: 200,
      data: results,
    });
  } catch (error: any) {
    console.error('GET /exams/:sessionId error:', error);
    res.status(400).json({
      statusCode: 400,
      error: error.message || 'Error fetching exam results',
    });
  }
});

export default router;
