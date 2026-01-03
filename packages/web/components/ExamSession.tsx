'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@istqb-app/shared';
import { QuestionCard } from './QuestionCard';
import { ProgressBar } from './ProgressBar';
import { Card } from './Card';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';
import { useExamStore } from '@/lib/store/examStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useStreakStore } from '@/lib/store/streakStore';
import { useTranslation } from '@/lib/useTranslation';
import { shuffleQuestionsAndOptions } from '@/lib/utils';

interface ExamSessionProps {
  sessionId: string;
  questions: Question[];
}

export function ExamSession({ sessionId, questions: initialQuestions }: ExamSessionProps) {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const { refreshStreak } = useStreakStore();
  const {
    currentQuestionIndex,
    answers,
    timeRemaining,
    updateTimeRemaining,
    submitAnswer,
    endExam,
  } = useExamStore();

  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  // Aleatorizar preguntas y opciones al iniciar el examen
  const [questions] = useState<Question[]>(() => {
    if (!initialQuestions || initialQuestions.length === 0) {
      return [];
    }
    return shuffleQuestionsAndOptions(initialQuestions);
  });
  console.log('[DEBUG] ExamSession render:', {
    sessionId,
    questionsCount: questions?.length || 0,
    currentQuestionIndex,
    answersCount: answers?.length || 0,
    sessionComplete,
    language
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (answers.length / questions.length) * 100;

  // Timer de 60 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeRemaining(timeRemaining - 1);

      if (timeRemaining <= 1) {
        handleEndExam();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Si no hay pregunta actual, mostrar pantalla de fin
  useEffect(() => {
    console.log('[DEBUG] Checking session complete:', {
      currentQuestionIndex,
      questionsLength: questions.length,
      shouldComplete: currentQuestionIndex >= questions.length && questions.length > 0
    });
    
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      console.log('[DEBUG] Setting session complete to true');
      setSessionComplete(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleAnswerSubmit = async (selectedAnswers: string[]) => {
    if (!currentQuestion || selectedAnswers.length === 0) return;

    const selectedAnswerId = selectedAnswers[0]; // Tomar la primera respuesta seleccionada

    try {
      setSubmitting(true);

      // Calcular tiempo en esta pregunta
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

      // Obtener respuesta correcta
      const isCorrect =
        currentQuestion.correct_answer_ids?.includes(selectedAnswerId);

      // Crear objeto de respuesta
      const currentAnswer = {
        questionId: currentQuestion.id,
        selectedAnswerId,
        isCorrect,
        timeSpent,
      };

      // Guardar en store
      submitAnswer(currentAnswer);

      setQuestionStartTime(Date.now());
      
      // Pasar a la siguiente pregunta o finalizar
      if (currentQuestionIndex + 1 >= questions.length) {
        // Pasar la respuesta actual al método de finalización
        handleEndExam(currentAnswer);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndExam = async (lastAnswer?: { questionId: string; selectedAnswerId: string | string[]; timeSpent: number }) => {
    try {
      // Combinar respuestas del store con la última respuesta si existe
      const allAnswers = lastAnswer ? [...answers, lastAnswer] : answers;
      
      console.log('[DEBUG] Ending exam with answers:', allAnswers.length);
      
      // Verificar que haya respuestas antes de enviar
      if (allAnswers.length === 0) {
        throw new Error('No answers to submit');
      }

      // Normalizar las respuestas para la API (convertir arrays a strings)
      const normalizedAnswers = allAnswers.map(answer => ({
        questionId: answer.questionId,
        selectedAnswerId: Array.isArray(answer.selectedAnswerId) 
          ? answer.selectedAnswerId.join(',') 
          : answer.selectedAnswerId,
        timeSpent: answer.timeSpent
      }));

      // Enviar todas las respuestas en una sola petición batch
      await apiClient.submitExamAnswersBatch(sessionId, normalizedAnswers);

      // Finalizar sesión en el backend
      await apiClient.completeExamSession(sessionId);

      // Refrescar el streak después de finalizar el examen
      refreshStreak();

      // Limpiar marcador de sesión activa
      sessionStorage.removeItem('active_exam_session');

      // Limpiar store
      endExam();

      // Redirigir a resultados
      router.push(`/exam/results?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error ending exam:', error);
      alert('Error al finalizar examen');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('exam.examComplete')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('exam.calculatingResults')}
          </p>
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {t('common.loading')}
          </h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {t('exam.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('study.question')} {currentQuestionIndex + 1} {t('study.of')} {questions.length}
            </p>
          </div>

          {/* Timer - Solo cuenta regresiva */}
          <div
            className={`text-4xl font-bold font-mono p-4 rounded-lg ${
              timeRemaining < 300
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white dark:bg-blue-600'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Progress bar - Solo porcentaje arriba */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(progress)}% {t('exam.examInProgress').toLowerCase()}
            </span>
          </div>
          <ProgressBar progress={progress} />
        </div>

        {/* Pregunta */}
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswerSubmit}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
