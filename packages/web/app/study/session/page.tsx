'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question } from '@istqb-app/shared';import { translateTopicToEnglish } from '@istqb-app/shared';import { QuestionCard } from '@/components/QuestionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { QuestionSkeleton } from '@/components/Skeleton';
import { apiClient } from '@/lib/api';
import { formatPercentage, shuffleQuestionsAndOptions } from '@/lib/utils';
import { getCurrentLanguage } from '@/lib/languageHelper';
import { useAuthStore } from '@/lib/store/authStore';
import { useStudyStore } from '@/lib/store/studyStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { useStreakStore } from '@/lib/store/streakStore';
import { useTranslation } from '@/lib/useTranslation';

function StudySessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'Fundamentals of Testing';

  const { user } = useAuthStore();
  const { addUserAnswer } = useStudyStore();
  const { language } = useLanguageStore();
  const { refreshStreak } = useStreakStore();
  const { t } = useTranslation();

  // Mapeo de temas en inglés a las claves en i18n
  const topicKeyMap: Record<string, string> = {
    'Fundamentals of Testing': 'fundamentals',
    'Testing Throughout the Software Development Lifecycle': 'sdlc',
    'Static Testing': 'static',
    'Test Analysis and Design': 'techniques',
    'Managing the Test Activities': 'management',
    'Test Tools': 'tools',
  };

  // Función para obtener el título traducido
  const getTranslatedTopicTitle = () => {
    const topicKey = topicKeyMap[topic];
    if (topicKey) {
      return t(`study.topics.${topicKey}.title`);
    }
    return topic; // Fallback al nombre original
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    selectedOptions: string[];
  } | null>(null);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const sessionLanguageRef = React.useRef<string>(language); // Idioma en que se cargó la sesión
  const [isSessionActive, setIsSessionActive] = React.useState(false);

  // Detectar refresh de página: si hay una sesión activa en sessionStorage, redirigir al home
  useEffect(() => {
    const activeSession = sessionStorage.getItem('active_study_session');
    
    if (activeSession === 'true') {
      // Hubo un refresh durante la sesión activa -> redirigir al home
      console.log('[SESSION] Refresh detectado durante sesión activa. Redirigiendo al home...');
      sessionStorage.removeItem('active_study_session');
      router.push('/');
      return;
    }
    
    // Marcar que la sesión está activa
    sessionStorage.setItem('active_study_session', 'true');
    setIsSessionActive(true);
    
    // Limpiar al desmontar el componente (navegación normal o salida)
    return () => {
      sessionStorage.removeItem('active_study_session');
    };
  }, [router]);

  // Detectar cambio de idioma durante la sesión
  useEffect(() => {
    if (isSessionActive && questions.length > 0 && language !== sessionLanguageRef.current) {
      console.log('[SESSION] Cambio de idioma detectado durante sesión activa. Redirigiendo al home...');
      sessionStorage.removeItem('active_study_session');
      router.push('/');
      return;
    }
  }, [language, questions.length, isSessionActive, router]);

  // Cargar preguntas
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        // Guardar el idioma en que se carga la sesión
        sessionLanguageRef.current = language;
        
        // El topic ya viene en inglés desde la página principal, usarlo directamente
        const response = await apiClient.getQuestionsByTopic(
          topic,
          language, // Enviar el idioma del usuario
          1000 // Límite alto para obtener todas las preguntas disponibles
        );
        
        // Aleatorizar preguntas y opciones
        const shuffledQuestions = shuffleQuestionsAndOptions(response.data) as Question[];
        setQuestions(shuffledQuestions);
      } catch (error) {
        console.error('Error loading questions:', error);
        alert(t('study.errorLoadingQuestions'));
        sessionStorage.removeItem('active_study_session'); // Limpiar en caso de error
        router.push('/study');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topic]); // NO incluir language

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (selectedOptions: string[], timeSpent: number) => {
    if (!user || !currentQuestion) return;

    try {
      setSubmitting(true);

      // Verificar si la respuesta es correcta
      const isCorrect = 
        selectedOptions.sort().join(',') === 
        currentQuestion.correct_answer_ids.sort().join(',');

      // Registrar la respuesta en BD usando el endpoint de STUDY
      await apiClient.submitStudyAnswer({
        questionId: currentQuestion.id,
        selectedOptions,
        isCorrect,
        timeSpentSeconds: timeSpent || 0, // Default a 0 si no hay tiempo
        attemptNumber: 1,
      });

      // Refrescar el streak después de responder
      refreshStreak();

      // Actualizar contador y feedback
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      setFeedback({
        isCorrect,
        selectedOptions, // Pasamos las opciones seleccionadas para mostrar sus explicaciones
      });

      // Guardar en store
      addUserAnswer({
        id: Math.random().toString(),
        user_id: user.id,
        question_id: currentQuestion.id,
        selected_options: selectedOptions,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent || 0,
        answered_at: new Date().toISOString(),
        attempt_number: 1,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al registrar la respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setFeedback(null);
    } else {
      setSessionComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <QuestionSkeleton />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold mb-2">{t('study.noQuestions')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('study.noQuestionsMessage')}
        </p>
        <Button onClick={() => router.push('/study')}>{t('study.backToStudy')}</Button>
      </Card>
    );
  }

  if (sessionComplete) {
    // Limpiar marcador de sesión activa antes de mostrar la pantalla de completado
    sessionStorage.removeItem('active_study_session');
    
    return (
      <Card className="text-center">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">✅ {t('study.sessionCompleted')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('study.answeredCorrectly', { correct: correctCount, total: questions.length })}
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPercentage((correctCount / questions.length) * 100)}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/study')}
          className="w-full"
        >
          {t('study.backToStudyMenu')}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{getTranslatedTopicTitle()}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('study.questionProgress', { current: currentIndex + 1, total: questions.length })}
        </p>
        <ProgressBar current={currentIndex + 1} total={questions.length} color="blue" />
      </div>

      {/* Pregunta */}
      {currentQuestion && (
        <QuestionCard
          key={currentIndex}
          question={currentQuestion}
          onAnswer={handleAnswer}
          isLoading={submitting}
          showFeedback={feedback !== null}
          isCorrect={feedback?.isCorrect}
          selectedAnswerIds={feedback?.selectedOptions}
        />
      )}

      {/* Botón siguiente */}
      {feedback && (
        <Button
          variant="success"
          size="lg"
          onClick={handleNext}
          className="w-full"
          disabled={submitting}
        >
          {currentIndex + 1 === questions.length ? t('study.finishSession') : t('study.nextQuestion')}
        </Button>
      )}

      {/* Contador de aciertos */}
      <Card className="bg-blue-50 dark:bg-blue-900">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('study.correctSoFar')}: <strong className="text-blue-600 dark:text-blue-400">{correctCount}</strong>
        </p>
      </Card>
    </div>
  );
}

export default function StudySessionPage() {
  const { t } = useTranslation();
  
  return (
    <Suspense fallback={<div className="text-center py-8">{t('study.loadingSession')}</div>}>
      <StudySessionContent />
    </Suspense>
  );
}
